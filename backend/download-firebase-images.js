/**
 * ========================================================
 * Database Images → Local /public Download + Path Update
 * ========================================================
 * 
 * Firebase Storage bucket is no longer available.
 * This script instead processes all image references from
 * the SQLite database and:
 *   1. Downloads Unsplash/external URLs → local files
 *   2. Saves base64 images → local files
 *   3. Updates all DB records with local paths
 *
 * Folder structure:
 *   public/
 *     avatars/       → User profile photos
 *     gallery/       → Gallery images
 *     assignments/   → Assignment files
 *     fees/          → Fee proof images
 *
 * Run: node download-firebase-images.js
 * ========================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const publicDir = path.join(__dirname, '../public');

// ========================================================
// 1. Create organized directories
// ========================================================
const FOLDERS = ['avatars', 'gallery', 'assignments', 'fees'];
for (const folder of FOLDERS) {
    const dir = path.join(publicDir, folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: public/${folder}/`);
    }
}

// ========================================================
// 2. Download helper with redirect support
// ========================================================
function downloadFile(url, destPath, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

        const proto = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(destPath);

        proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                file.close();
                try { fs.unlinkSync(destPath); } catch (e) { }
                return downloadFile(res.headers.location, destPath, maxRedirects - 1).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                file.close();
                try { fs.unlinkSync(destPath); } catch (e) { }
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', err => {
            try { fs.unlinkSync(destPath); } catch (e) { }
            reject(err);
        });
    });
}

// ========================================================
// 3. Save base64 image to file
// ========================================================
function saveBase64ToFile(base64String, destPath) {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(destPath, Buffer.from(base64Data, 'base64'));
}

function getBase64Extension(base64String) {
    const match = base64String.match(/data:image\/(\w+)/);
    if (match) {
        const ext = match[1].toLowerCase();
        if (ext === 'jpeg') return 'jpg';
        return ext;
    }
    return 'png';
}

// ========================================================
// 4. Process and download images from DB
// ========================================================
async function processAllImages() {
    console.log('\n🗄️  Opening SQLite database...');
    const db = await open({
        filename: path.join(__dirname, 'school.db'),
        driver: sqlite3.Database
    });

    let totalDownloaded = 0;
    let totalSaved = 0;
    let totalUpdated = 0;

    // ---------------------------------------------------
    // 4a. USER PHOTOS (avatars)
    // ---------------------------------------------------
    console.log('\n👤 Processing USER PHOTOS...');
    const users = await db.all('SELECT id, name, photo FROM users WHERE photo IS NOT NULL AND photo != ""');
    console.log(`   Found ${users.length} users with photos`);

    for (const user of users) {
        if (!user.photo) continue;

        // Skip if already a local path
        if (user.photo.startsWith('/') && !user.photo.startsWith('/http')) {
            console.log(`   ✓ ${user.id} (${user.name}) — already local: ${user.photo}`);
            continue;
        }

        let newPath = null;

        // Case 1: Unsplash or other external URL
        if (user.photo.startsWith('http')) {
            const avatarName = `${user.id}.jpg`;
            const avatarPath = path.join(publicDir, 'avatars', avatarName);

            if (fs.existsSync(avatarPath)) {
                newPath = `/avatars/${avatarName}`;
                console.log(`   ✓ ${user.id} — already downloaded: ${newPath}`);
            } else {
                try {
                    console.log(`   📥 Downloading avatar for ${user.id} (${user.name})...`);
                    await downloadFile(user.photo, avatarPath);
                    newPath = `/avatars/${avatarName}`;
                    totalDownloaded++;
                    console.log(`   ✅ Downloaded: ${newPath}`);
                } catch (e) {
                    console.log(`   ⚠️  Failed to download for ${user.id}: ${e.message}`);
                }
            }
        }
        // Case 2: Base64 image
        else if (user.photo.startsWith('data:image/')) {
            const ext = getBase64Extension(user.photo);
            const avatarName = `${user.id}.${ext}`;
            const avatarPath = path.join(publicDir, 'avatars', avatarName);

            if (!fs.existsSync(avatarPath)) {
                saveBase64ToFile(user.photo, avatarPath);
                totalSaved++;
                console.log(`   💾 Saved base64: avatars/${avatarName}`);
            }
            newPath = `/avatars/${avatarName}`;
        }

        if (newPath) {
            await db.run('UPDATE users SET photo = ? WHERE id = ?', [newPath, user.id]);
            totalUpdated++;
            console.log(`   🔄 DB updated: ${user.id} → ${newPath}`);
        }
    }

    // ---------------------------------------------------
    // 4b. GALLERY IMAGES
    // ---------------------------------------------------
    console.log('\n🖼️  Processing GALLERY IMAGES...');
    const galleryItems = await db.all('SELECT id, title, image_url FROM gallery WHERE image_url IS NOT NULL AND image_url != ""');
    console.log(`   Found ${galleryItems.length} gallery items`);

    for (const item of galleryItems) {
        if (!item.image_url) continue;

        // Skip if already local
        if (item.image_url.startsWith('/') && !item.image_url.startsWith('/http')) {
            console.log(`   ✓ Gallery #${item.id} — already local: ${item.image_url}`);
            continue;
        }

        let newPath = null;

        // Case 1: External URL
        if (item.image_url.startsWith('http')) {
            // Extract extension from URL
            const urlExt = item.image_url.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[0] || '.jpg';
            const galleryName = `gallery_${item.id}${urlExt}`;
            const galleryPath = path.join(publicDir, 'gallery', galleryName);

            if (fs.existsSync(galleryPath)) {
                newPath = `/gallery/${galleryName}`;
                console.log(`   ✓ Gallery #${item.id} — already downloaded`);
            } else {
                try {
                    console.log(`   📥 Downloading gallery #${item.id} "${item.title}"...`);
                    await downloadFile(item.image_url, galleryPath);
                    newPath = `/gallery/${galleryName}`;
                    totalDownloaded++;
                    console.log(`   ✅ Downloaded: ${newPath}`);
                } catch (e) {
                    console.log(`   ⚠️  Failed gallery #${item.id}: ${e.message}`);
                }
            }
        }
        // Case 2: Base64
        else if (item.image_url.startsWith('data:image/')) {
            const ext = getBase64Extension(item.image_url);
            const galleryName = `gallery_${item.id}.${ext}`;
            const galleryPath = path.join(publicDir, 'gallery', galleryName);

            if (!fs.existsSync(galleryPath)) {
                saveBase64ToFile(item.image_url, galleryPath);
                totalSaved++;
                console.log(`   💾 Saved base64: gallery/${galleryName}`);
            }
            newPath = `/gallery/${galleryName}`;
        }

        if (newPath) {
            await db.run('UPDATE gallery SET image_url = ? WHERE id = ?', [newPath, item.id]);
            totalUpdated++;
            console.log(`   🔄 DB updated: Gallery #${item.id} → ${newPath}`);
        }
    }

    // ---------------------------------------------------
    // 4c. ASSIGNMENT FILES
    // ---------------------------------------------------
    console.log('\n📚 Processing ASSIGNMENT FILES...');
    const assignments = await db.all('SELECT id, title, file_url FROM assignments WHERE file_url IS NOT NULL AND file_url != ""');
    console.log(`   Found ${assignments.length} assignments with files`);

    for (const asgn of assignments) {
        if (!asgn.file_url) continue;

        // Skip if already local
        if (asgn.file_url.startsWith('/') && !asgn.file_url.startsWith('/http')) {
            console.log(`   ✓ Assignment #${asgn.id} — already local: ${asgn.file_url}`);
            continue;
        }

        let newPath = null;

        if (asgn.file_url.startsWith('http')) {
            const urlExt = asgn.file_url.match(/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)/i)?.[0] || '.pdf';
            const fileName = `assignment_${asgn.id}${urlExt}`;
            const filePath = path.join(publicDir, 'assignments', fileName);

            if (fs.existsSync(filePath)) {
                newPath = `/assignments/${fileName}`;
            } else {
                try {
                    console.log(`   📥 Downloading assignment #${asgn.id} "${asgn.title}"...`);
                    await downloadFile(asgn.file_url, filePath);
                    newPath = `/assignments/${fileName}`;
                    totalDownloaded++;
                    console.log(`   ✅ Downloaded: ${newPath}`);
                } catch (e) {
                    console.log(`   ⚠️  Failed assignment #${asgn.id}: ${e.message}`);
                }
            }
        }
        else if (asgn.file_url.startsWith('data:')) {
            const ext = asgn.file_url.match(/data:(?:image|application)\/(\w+)/)?.[1] || 'pdf';
            const fileName = `assignment_${asgn.id}.${ext}`;
            const filePath = path.join(publicDir, 'assignments', fileName);

            if (!fs.existsSync(filePath)) {
                const base64Data = asgn.file_url.replace(/^data:\w+\/\w+;base64,/, '');
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                totalSaved++;
                console.log(`   💾 Saved: assignments/${fileName}`);
            }
            newPath = `/assignments/${fileName}`;
        }

        if (newPath) {
            await db.run('UPDATE assignments SET file_url = ? WHERE id = ?', [newPath, asgn.id]);
            totalUpdated++;
            console.log(`   🔄 DB updated: Assignment #${asgn.id} → ${newPath}`);
        }
    }

    // ---------------------------------------------------
    // 4d. FEE PROOF IMAGES
    // ---------------------------------------------------
    console.log('\n💰 Processing FEE PROOFS...');
    const feeRecords = await db.all('SELECT id, proof_url FROM student_fees WHERE proof_url IS NOT NULL AND proof_url != ""');
    console.log(`   Found ${feeRecords.length} fee records with proofs`);

    for (const fee of feeRecords) {
        if (!fee.proof_url) continue;

        // Skip if already local
        if (fee.proof_url.startsWith('/') && !fee.proof_url.startsWith('/http')) {
            console.log(`   ✓ Fee ${fee.id} — already local`);
            continue;
        }

        let newPath = null;
        const safeName = fee.id.replace(/[^a-zA-Z0-9_-]/g, '_');

        if (fee.proof_url.startsWith('http')) {
            const urlExt = fee.proof_url.match(/\.(jpg|jpeg|png|gif|webp|pdf)/i)?.[0] || '.jpg';
            const fileName = `proof_${safeName}${urlExt}`;
            const filePath = path.join(publicDir, 'fees', fileName);

            if (fs.existsSync(filePath)) {
                newPath = `/fees/${fileName}`;
            } else {
                try {
                    await downloadFile(fee.proof_url, filePath);
                    newPath = `/fees/${fileName}`;
                    totalDownloaded++;
                    console.log(`   ✅ Downloaded fee proof: ${newPath}`);
                } catch (e) {
                    console.log(`   ⚠️  Failed fee ${fee.id}: ${e.message}`);
                }
            }
        }
        else if (fee.proof_url.startsWith('data:image/')) {
            const ext = getBase64Extension(fee.proof_url);
            const fileName = `proof_${safeName}.${ext}`;
            const filePath = path.join(publicDir, 'fees', fileName);

            if (!fs.existsSync(filePath)) {
                saveBase64ToFile(fee.proof_url, filePath);
                totalSaved++;
                console.log(`   💾 Saved: fees/${fileName}`);
            }
            newPath = `/fees/${fileName}`;
        }

        if (newPath) {
            await db.run('UPDATE student_fees SET proof_url = ? WHERE id = ?', [newPath, fee.id]);
            totalUpdated++;
        }
    }

    await db.close();

    return { totalDownloaded, totalSaved, totalUpdated };
}

// ========================================================
// 5. MAIN
// ========================================================
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  📥 Images → Local /public Download + DB Update ║');
    console.log('╚══════════════════════════════════════════════════╝');

    try {
        const { totalDownloaded, totalSaved, totalUpdated } = await processAllImages();

        // Show final folder summary
        console.log('\n\n📁 Final folder summary:');
        for (const folder of FOLDERS) {
            const dir = path.join(publicDir, folder);
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                console.log(`   ${folder}/ → ${files.length} file(s)`);
                files.forEach(f => console.log(`      📄 ${f}`));
            }
        }

        // Root public files
        const rootFiles = fs.readdirSync(publicDir).filter(f => {
            const fullPath = path.join(publicDir, f);
            return !fs.statSync(fullPath).isDirectory();
        });
        if (rootFiles.length > 0) {
            console.log(`   (root) → ${rootFiles.length} file(s)`);
            rootFiles.forEach(f => console.log(`      📄 ${f}`));
        }

        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║  ✅ COMPLETE!                                     ║');
        console.log(`║  📥 Downloaded: ${String(totalDownloaded).padEnd(5)} files                      ║`);
        console.log(`║  💾 Saved:      ${String(totalSaved).padEnd(5)} base64 images               ║`);
        console.log(`║  🔄 Updated:    ${String(totalUpdated).padEnd(5)} DB records                  ║`);
        console.log('╚══════════════════════════════════════════════════╝');
        console.log('');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error(err);
    }

    process.exit(0);
}

main();

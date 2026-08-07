const mysql = require('mysql2/promise');

async function migrateData() {
    console.log("Connecting to local XAMPP MySQL...");
    const localDb = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kgs'
    });

    console.log("Connecting to Aiven MySQL...");
    const remoteDb = await mysql.createConnection({
        host: 'mysql-3c75b5b5-ahmadijazaziz001-0c89.g.aivencloud.com',
        user: 'avnadmin',
        password: 'AVNS_e8lJxs3RnJdYQIrIoAp',
        database: 'defaultdb',
        port: 26167,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Disabling foreign key checks on remote...");
        await remoteDb.query('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log("Fetching tables from local database...");
        const [tables] = await localDb.query('SHOW TABLES');
        
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\nMigrating table: ${tableName}`);

            // Get Create Table statement
            const [createTableResult] = await localDb.query(`SHOW CREATE TABLE \`${tableName}\``);
            let createTableSql = createTableResult[0]['Create Table'];
            
            // Aiven requires primary keys for all tables.
            if (!createTableSql.includes('PRIMARY KEY')) {
                // If it's a table like password_resets, we can add a dummy ID primary key
                createTableSql = createTableSql.replace(/CREATE TABLE `.*?` \(/, "$&\n  `id` INT AUTO_INCREMENT PRIMARY KEY,");
            }
            
            // Drop and create table on remote
            console.log(`  - Creating table schema...`);
            await remoteDb.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            await remoteDb.query(createTableSql);

            // Fetch all rows
            const [rows] = await localDb.query(`SELECT * FROM \`${tableName}\``);
            if (rows.length > 0) {
                console.log(`  - Migrating ${rows.length} rows...`);
                // Insert rows one by one
                for (const row of rows) {
                    const keys = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = keys.map(() => '?').join(', ');
                    
                    const insertSql = `INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
                    await remoteDb.query(insertSql, values);
                }
            } else {
                console.log(`  - Table is empty, skipping data migration.`);
            }
        }
        
        console.log("Re-enabling foreign key checks on remote...");
        await remoteDb.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log("\n✅ Migration complete! All data successfully transferred to Aiven.");
    } catch (err) {
        console.error("\n❌ Error during migration:", err);
    } finally {
        await localDb.end();
        await remoteDb.end();
    }
}

migrateData();

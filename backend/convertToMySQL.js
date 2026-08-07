const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function exportToMySQL() {
    const db = await open({
        filename: path.join(__dirname, 'school.db'),
        driver: sqlite3.Database
    });

    // Get all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    let sqlDump = "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\nSET time_zone = '+00:00';\nSET FOREIGN_KEY_CHECKS = 0;\n\n";

    for (let table of tables) {
        const tableName = table.name;
        console.log(`Exporting table: ${tableName}...`);
        
        // We won't recreate the table schema perfectly because SQLite schema is different,
        // but we can try to get the CREATE TABLE statement and adapt it, or assume the user already has tables.
        // It's safer to just export the schema as is, replacing AUTOINCREMENT with AUTO_INCREMENT.
        
        const tableInfo = await db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        let createStmt = tableInfo.sql;
        createStmt = createStmt.replace(/AUTOINCREMENT/gi, 'AUTO_INCREMENT');
        // Fix all '*id TEXT' columns to be 'VARCHAR(255)' so primary keys and foreign keys match exactly
        createStmt = createStmt.replace(/\b([a-zA-Z0-9_]*id)\s+TEXT/gi, '$1 VARCHAR(255)');
        // Fix SQLite datetime('now')
        createStmt = createStmt.replace(/TEXT\s+DEFAULT\s+\(datetime\('now'\)\)/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP');
        createStmt = createStmt.replace(/DEFAULT\s+\(datetime\('now'\)\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
        // Fix TEXT DEFAULT which is invalid in MySQL
        createStmt = createStmt.replace(/TEXT\s+DEFAULT/gi, 'VARCHAR(255) DEFAULT');
        // Fix foreign keys or references that might be TEXT
        createStmt = createStmt.replace(/"/g, '`');
        
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sqlDump += `${createStmt};\n\n`;

        // Get data
        const rows = await db.all(`SELECT * FROM \`${tableName}\``);
        if (rows.length > 0) {
            const keys = Object.keys(rows[0]).map(k => `\`${k}\``).join(', ');
            
            for (let row of rows) {
                const values = Object.values(row).map(val => {
                    if (val === null) return 'NULL';
                    if (typeof val === 'string') {
                        // escape single quotes
                        const escaped = val.replace(/'/g, "''").replace(/\\/g, "\\\\");
                        return `'${escaped}'`;
                    }
                    return val;
                }).join(', ');
                
                sqlDump += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
            }
        }
        sqlDump += "\n\n";
    }

    sqlDump += "SET FOREIGN_KEY_CHECKS = 1;\n";

    fs.writeFileSync(path.join(__dirname, 'school_mysql.sql'), sqlDump);
    console.log("✅ Export complete! You can now import 'school_mysql.sql' into phpMyAdmin.");
}

exportToMySQL().catch(console.error);

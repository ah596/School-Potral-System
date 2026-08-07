const mysql = require('mysql2/promise');

let pool;

async function initializeDatabase() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'kgs',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    if (process.env.DB_SSL === 'true') {
        dbConfig.ssl = {
            rejectUnauthorized: false
        };
    }

    pool = mysql.createPool(dbConfig);

    // Test connection
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully to database:', process.env.DB_NAME || 'kgs');
    conn.release();
}

// Wrapper that mimics the old SQLite API (db.get, db.all, db.run, db.exec)
function getDb() {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDatabase first.');
    }

    return {
        // Returns a single row (like SQLite db.get)
        async get(sql, params = []) {
            const mysqlSql = convertPlaceholders(sql);
            const safeParams = params.map(p => p === undefined ? null : p);
            const [rows] = await pool.execute(mysqlSql, safeParams);
            return rows[0] || null;
        },

        // Returns all rows (like SQLite db.all)
        async all(sql, params = []) {
            const mysqlSql = convertPlaceholders(sql);
            const safeParams = params.map(p => p === undefined ? null : p);
            const [rows] = await pool.execute(mysqlSql, safeParams);
            return rows;
        },

        // Executes a query and returns { lastID, changes } (like SQLite db.run)
        async run(sql, params = []) {
            const mysqlSql = convertPlaceholders(sql);
            const safeParams = params.map(p => p === undefined ? null : p);
            const [result] = await pool.execute(mysqlSql, safeParams);
            return {
                lastID: result.insertId,
                changes: result.affectedRows
            };
        },

        // Executes raw SQL (like SQLite db.exec)
        async exec(sql) {
            await pool.query(sql);
        }
    };
}

// Convert SQLite ? placeholders - MySQL also uses ? so mostly compatible
// But we need to handle SQLite-specific syntax differences
function convertPlaceholders(sql) {
    // Replace datetime('now') with NOW()
    sql = sql.replace(/datetime\('now'\)/gi, 'NOW()');

    // Replace SQLite ON CONFLICT(...) DO UPDATE SET ... with MySQL ON DUPLICATE KEY UPDATE ...
    // Pattern: ON CONFLICT(col) DO UPDATE SET col1=excluded.col1, col2=excluded.col2
    const conflictMatch = sql.match(/ON\s+CONFLICT\s*\(([^)]+)\)\s+DO\s+UPDATE\s+SET\s+(.+?)$/is);
    if (conflictMatch) {
        const updatePart = conflictMatch[2].trim();
        // Replace excluded.column_name with VALUES(column_name)
        const mysqlUpdate = updatePart.replace(/excluded\.(\w+)/g, 'VALUES($1)');
        sql = sql.replace(/ON\s+CONFLICT\s*\([^)]+\)\s+DO\s+UPDATE\s+SET\s+.+$/is, 
            `ON DUPLICATE KEY UPDATE ${mysqlUpdate}`);
    }

    // Replace ON CONFLICT(id) DO NOTHING with ON DUPLICATE KEY UPDATE id=id
    const conflictNothingMatch = sql.match(/ON\s+CONFLICT\s*\((\w+)\)\s+DO\s+NOTHING/i);
    if (conflictNothingMatch) {
        const col = conflictNothingMatch[1];
        sql = sql.replace(/ON\s+CONFLICT\s*\(\w+\)\s+DO\s+NOTHING/i, 
            `ON DUPLICATE KEY UPDATE ${col}=${col}`);
    }

    return sql;
}

module.exports = { initializeDatabase, getDb };

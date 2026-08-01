const mysql = require('mysql2/promise');

async function check() {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'kgs' });
    const [rows] = await conn.execute('SELECT id FROM users');
    console.log(rows);
    await conn.end();
}
check().catch(console.error);

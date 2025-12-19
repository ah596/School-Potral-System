const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function checkDb() {
    console.log('Opening database...');
    const db = await open({
        filename: path.join(__dirname, 'school.db'),
        driver: sqlite3.Database
    });

    console.log('Checking users...');
    const users = await db.all('SELECT * FROM users');
    console.log('Users found:', users);
}

checkDb().catch(console.error);

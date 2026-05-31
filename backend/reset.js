const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Rafly19',
        database: 'e_repository_kampus'
    });

    const hash = bcrypt.hashSync('admin123', 10);
    await con.execute('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin1']);
    console.log('Password successfully reset to admin123!');
    process.exit();
}
run();

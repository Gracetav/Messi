const bcrypt = require('bcryptjs');
const pool = require('./lib/db');

async function seed() {
    try {
        const adminPass = await bcrypt.hash('admin123', 10);
        const userPass = await bcrypt.hash('user123', 10);

        await pool.query('INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['admin_messi', adminPass, 'admin']);
        await pool.query('INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['user_messi', userPass, 'user']);

        console.log('Seed berhasil! Akun Admin: admin_messi (admin123), Akun User: user_messi (user123)');
        process.exit();
    } catch (err) {
        console.error('Seed gagal:', err.message);
        process.exit(1);
    }
}

seed();

const pool = require('./lib/db');
const bcrypt = require('bcryptjs');

async function seedData() {
    try {
        console.log('--- Memulai Seeding Data ---');
        
        // 1. Seed Products
        const products = [
            ['Oli Mesin Shell 10W-40', 'Oli & Cairan', 95000, 50, 'https://images.unsplash.com/photo-1635843104391-9e731b75b9f7?q=80&w=400&auto=format&fit=crop', 'Pelumas mesin sintetik berkualitas tinggi untuk performa optimal.'],
            ['Filter Oli Avanza Ori', 'Suku Cadang Mesin', 45000, 100, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=400&auto=format&fit=crop', 'Menyaring kotoran dari oli secara maksimal.'],
            ['Busi Iridium Racing', 'Suku Cadang Mesin', 120000, 30, 'https://images.unsplash.com/photo-1635843104316-db5263a48ec2?q=80&w=400&auto=format&fit=crop', 'Pengapian lebih fokus dan merata untuk akselerasi spontan.'],
            ['Coolant Radiator Prestone', 'Oli & Cairan', 155000, 20, 'https://images.unsplash.com/photo-1647427017067-8f33ccbae493?q=80&w=400&auto=format&fit=crop', 'Pendingin radiator anti karat dan memperpanjang umur mesin.'],
            ['Kampas Rem Brembo', 'Suku Cadang Mesin', 210000, 15, 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=400&auto=format&fit=crop', 'Grip pakem dan tahan panas di segala kondisi.']
        ];

        for (const p of products) {
            await pool.query('INSERT IGNORE INTO products (name, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)', p);
        }
        console.log('✔ Seed Produk berhasil!');

        // 2. Seed Admin User
        const adminUsername = 'admin_messi';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        // Check if admin already exists
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [adminUsername]);
        if (rows.length === 0) {
            await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [adminUsername, hashedPassword, 'admin']);
            console.log('✔ Akun Admin Dibuat:');
            console.log(`   User: ${adminUsername}`);
            console.log(`   Pass: ${adminPassword}`);
        } else {
            console.log('ℹ Akun Admin sudah ada.');
        }

        console.log('--- Seeding Selesai ---');
        process.exit();
    } catch (err) {
        console.error('✘ Seeding gagal:', err.message);
        process.exit(1);
    }
}

seedData();

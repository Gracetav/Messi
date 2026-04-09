const pool = require('./lib/db');
const bcrypt = require('bcryptjs');

async function seedData() {
    try {
        console.log('--- Memulai Seeding Data ---');
        
        // 1. Get some categories and brands first to link them
        const [categories] = await pool.query('SELECT id, name FROM categories');
        const [brands] = await pool.query('SELECT id, name FROM brands');

        if (categories.length === 0 || brands.length === 0) {
            console.log('⚠ Silakan tambahkan Kategori dan Brand melalui Admin terlebih dahulu sebelum seeding produk.');
            process.exit(1);
        }

        const catMap = {};
        categories.forEach(c => catMap[c.name] = c.id);
        
        const brandMap = {};
        brands.forEach(b => brandMap[b.name] = b.id);

        // 2. Seed Products
        const products = [
            ['Oli Mesin Shell 10W-40', 'Oli & Cairan', 'Shell', 95000, 50, '/uploads/oli.jpg', 'Pelumas mesin sintetik berkualitas tinggi untuk performa optimal. Melindungi mesin dari aus dan kerak.'],
            ['Filter Oli Avanza Ori', 'Suku Cadang Mesin', 'Toyota', 45000, 100, '/uploads/filter.jpg', 'Menyaring kotoran dari oli secara maksimal. Gunakan suku cadang asli untuk keawetan mesin.'],
            ['Busi Iridium Racing', 'Suku Cadang Mesin', 'NGK', 120000, 30, '/uploads/busi.jpg', 'Pengapian lebih fokus dan merata untuk akselerasi spontan. Cocok untuk mesin bensin modern.'],
            ['Coolant Radiator Prestone', 'Oli & Cairan', 'Prestone', 155000, 20, '/uploads/coolant.jpg', 'Pendingin radiator anti karat dan memperpanjang umur mesin. Menjaga suhu mesin tetap stabil.'],
            ['Kampas Rem Brembo', 'Suku Cadang Mesin', 'Brembo', 210000, 15, '/uploads/rem.jpg', 'Grip pakem dan tahan panas di segala kondisi. Standar kualitas balap untuk keamanan berkendara.']
        ];

        for (const p of products) {
            const [name, catName, brandName, price, stock, image, desc] = p;
            const catId = catMap[catName] || categories[0].id;
            const brandId = brandMap[brandName] || brands[0].id;
            
            await pool.query(
                'INSERT INTO products (name, category_id, brand_id, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [name, catId, brandId, catName, price, stock, image, desc]
            );
        }
        console.log('✔ Seed Produk berhasil dengan Deskripsi!');

        // 3. Seed Admin User
        const adminUsername = 'admin_messi';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [adminUsername]);
        if (rows.length === 0) {
            await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [adminUsername, hashedPassword, 'admin']);
            console.log('✔ Akun Admin Dibuat:');
            console.log(`   User: ${adminUsername}`);
            console.log(`   Pass: ${adminPassword}`);
        }

        console.log('--- Seeding Selesai ---');
        process.exit();
    } catch (err) {
        console.error('✘ Seeding gagal:', err.message);
        process.exit(1);
    }
}

seedData();

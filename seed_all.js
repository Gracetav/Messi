const pool = require('./lib/db');
const bcrypt = require('bcryptjs');

async function seedAll() {
    try {
        console.log('--- Memulai Seeding Komprehensif ---');

        // 1. Seed Categories
        const categories = [
            ['Oli & Cairan', 'oli-cairan'],
            ['Suku Cadang Mesin', 'suku-cadang-mesin'],
            ['Kelistrikan', 'kelistrikan'],
            ['Aksesoris', 'aksesoris']
        ];
        console.log('Seeding Kategori...');
        for (const [name, slug] of categories) {
            await pool.query('INSERT IGNORE INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
        }

        // 2. Seed Brands
        const brands = [
            ['Shell', 'shell.jpg', 'Produsen pelumas terkemuka di dunia.'],
            ['Toyota', 'toyota.jpg', 'Suku cadang original Toyota Genuine Parts.'],
            ['NGK', 'ngk.jpg', 'Spesialis busi dan sensor oksigen kualitas Jepang.'],
            ['Prestone', 'prestone.jpg', 'Cairan pendingin dan perawatan mesin premium.'],
            ['Brembo', 'brembo.jpg', 'Sistem pengereman performa tinggi untuk mobil & motor.']
        ];
        console.log('Seeding Brand...');
        for (const [name, image, desc] of brands) {
            await pool.query('INSERT IGNORE INTO brands (name, image, description) VALUES (?, ?, ?)', [name, image, desc]);
        }

        // Get IDs
        const [catRows] = await pool.query('SELECT id, name FROM categories');
        const [brandRows] = await pool.query('SELECT id, name FROM brands');
        
        const catMap = {};
        catRows.forEach(c => catMap[c.name] = c.id);
        const brandMap = {};
        brandRows.forEach(b => brandMap[b.name] = b.id);

        // 3. Seed Products
        const products = [
            ['Oli Mesin Shell 10W-40', 'Oli & Cairan', 'Shell', 95000, 50, 'https://images.unsplash.com/photo-1635843104391-9e731b75b9f7?q=80&w=400&auto=format&fit=crop', 'Pelumas mesin sintetik berkualitas tinggi untuk performa optimal. Melindungi mesin dari aus dan kerak, menjaga mesin tetap bersih dan responsif.'],
            ['Filter Oli Avanza Ori', 'Suku Cadang Mesin', 'Toyota', 45000, 100, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=400&auto=format&fit=crop', 'Menyaring kotoran dari oli secara maksimal. Gunakan suku cadang asli Toyota untuk menjaga keawetan komponen mesin dalam jangka panjang.'],
            ['Busi Iridium Racing', 'Suku Cadang Mesin', 'NGK', 120000, 30, 'https://images.unsplash.com/photo-1635843104316-db5263a48ec2?q=80&w=400&auto=format&fit=crop', 'Pengapian lebih fokus dan merata untuk akselerasi spontan. Ujung iridium yang sangat tipis memastikan efisiensi pembakaran tinggi.'],
            ['Coolant Radiator Prestone', 'Oli & Cairan', 'Prestone', 155000, 20, 'https://images.unsplash.com/photo-1647427017067-8f33ccbae493?q=80&w=400&auto=format&fit=crop', 'Pendingin radiator anti karat dan memperpanjang umur mesin. Melindungi seluruh sistem pendingin dari korosi dan overheat.'],
            ['Kampas Rem Brembo', 'Suku Cadang Mesin', 'Brembo', 210000, 15, 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=400&auto=format&fit=crop', 'Grip pakem dan tahan panas di segala kondisi. Teknologi pengereman profesional yang diadaptasi untuk penggunaan harian yang aman.']
        ];

        console.log('Seeding Produk...');
        for (const p of products) {
            const [name, catName, brandName, price, stock, image, desc] = p;
            const catId = catMap[catName];
            const brandId = brandMap[brandName];
            
            await pool.query(
                'INSERT IGNORE INTO products (name, category_id, brand_id, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                [name, catId, brandId, catName, price, stock, image, desc]
            );
        }

        // 4. Seed Users
        const adminPass = await bcrypt.hash('admin123', 10);
        await pool.query('INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', ['admin_messi', adminPass, 'admin']);

        console.log('--- Seeding Selesai! ---');
        console.log('✔ Akun Admin: admin_messi (admin123)');
        process.exit();
    } catch (err) {
        console.error('✘ Seeding gagal:', err.message);
        process.exit(1);
    }
}

seedAll();

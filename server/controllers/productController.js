const pool = require('../../lib/db');

exports.getAllProducts = async (req, res) => {
  const { category_id, brand_id } = req.query;
  try {
    let query = `
      SELECT p.*, c.name as category_name, b.name as brand_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
    `;
    let params = [];
    let conditions = [];

    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }
    if (brand_id) {
      conditions.push('p.brand_id = ?');
      params.push(brand_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(`
        SELECT p.*, c.name as category_name, b.name as brand_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = ?
      `, [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

exports.createProduct = async (req, res) => {
  const { name, category_id, brand_id, price, stock, description } = req.body;
  let imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, category_id, brand_id, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category_id || null, brand_id || null, price, stock, imagePath, description]
    );
    res.json({ id: result.insertId, name, category_id, brand_id, price, stock, image: imagePath, description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category_id, brand_id, price, stock, description, image } = req.body;
  
  // Use new file if uploaded, otherwise keep the existing one
  let imagePath = req.file ? `/uploads/${req.file.filename}` : image;
  
  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category_id = ?, brand_id = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?',
      [name, category_id || null, brand_id || null, price, stock, imagePath, description, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ id, name, category_id, brand_id, price, stock, image: imagePath, description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

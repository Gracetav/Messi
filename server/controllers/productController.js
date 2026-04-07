const pool = require('../../lib/db');

exports.getAllProducts = async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT * FROM products';
    let params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
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
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

exports.createProduct = async (req, res) => {
  const { name, category, price, stock, description } = req.body;
  let imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, stock, imagePath, description]
    );
    res.json({ id: result.insertId, name, category, price, stock, image: imagePath, description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, description, image } = req.body;
  
  // Use new file if uploaded, otherwise keep the existing one
  let imagePath = req.file ? `/uploads/${req.file.filename}` : image;
  
  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?',
      [name, category, price, stock, imagePath, description, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ id, name, category, price, stock, image: imagePath, description });
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

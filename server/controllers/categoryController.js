const pool = require('../../lib/db');

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

exports.createCategory = async (req, res) => {
  const { name, slug } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    res.json({ id: result.insertId, name, slug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ id, name, slug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

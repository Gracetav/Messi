const pool = require('../../lib/db');

exports.getAllBrands = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBrandById = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM brands WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Brand not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

exports.createBrand = async (req, res) => {
  const { name, description } = req.body;
  let imagePath = req.file ? `/uploads/${req.file.filename}` : '';
  
  try {
    const [result] = await pool.query(
      'INSERT INTO brands (name, image, description) VALUES (?, ?, ?)',
      [name, imagePath, description || '']
    );
    res.json({ id: result.insertId, name, image: imagePath, description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;
  let imagePath = req.file ? `/uploads/${req.file.filename}` : image;

  try {
    const [result] = await pool.query(
      'UPDATE brands SET name = ?, image = ?, description = ? WHERE id = ?',
      [name, imagePath, description || '', id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Brand not found' });
    res.json({ id, name, image: imagePath, description });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

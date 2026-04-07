const db = require('../../lib/db');

exports.createOrder = async (req, res) => {
  const { user_id, items, total_price, address, phone } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Keranjang kosong' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO orders (user_id, total_price, status, address, phone) VALUES (?, ?, ?, ?, ?)',
      [user_id, total_price, 'pending', address, phone]
    );
    
    const orderId = result.insertId;
    
    for (const item of items) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
      
      // Update stock
      await db.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }
    
    res.status(201).json({ message: 'Order berhasil dibuat', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.username 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    
    // Get items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'completed' or 'cancelled'
  
  try {
    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ message: 'Status order diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(orde rs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  const { id } = req.params;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!imagePath) {
    return res.status(400).json({ message: 'Harap upload bukti pembayaran' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE orders SET payment_proof = ? WHERE id = ?',
      [imagePath, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });
    res.json({ message: 'Bukti pembayaran berhasil diunggah', payment_proof: imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengunggah bukti pembayaran' });
  }
};

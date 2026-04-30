const db = require('../../lib/db');

exports.createOrder = async (req, res) => {
  const { user_id, items, total_price, address, phone, payment_method } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Keranjang kosong' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check stock for all items first
    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT stock, name FROM products WHERE id = ? FOR UPDATE', 
        [item.id]
      );
      
      if (products.length === 0) {
        throw new Error(`Produk dengan ID ${item.id} tidak ditemukan`);
      }
      
      const product = products[0];
      if (product.stock < item.quantity) {
        throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock})`);
      }
    }

    const [result] = await connection.execute(
      'INSERT INTO orders (user_id, total_price, status, address, phone, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, total_price, 'pending', address, phone, payment_method || 'transfer']
    );
    
    const orderId = result.insertId;
    
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
      
      // Update stock
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Order berhasil dibuat', orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(400).json({ message: error.message || 'Server error' });
  } finally {
    connection.release();
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
  const { status } = req.body; // 'completed' or 'cancelled' or 'confirmed' or 'shipped'
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get current order status and items
    const [orders] = await connection.execute('SELECT status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) {
      throw new Error('Order tidak ditemukan');
    }
    
    const currentStatus = orders[0].status;

    // 2. Update order status
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    // 3. Handle stock recovery if status changed to 'cancelled'
    // Only return stock if it wasn't already cancelled
    if (status === 'cancelled' && currentStatus !== 'cancelled') {
      const [items] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of items) {
        await connection.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // 4. Handle stock deduction if status changed FROM 'cancelled' to something else (admin correction)
    // This is optional but good for consistency if admin accidentally cancelled and then confirmed
    if (currentStatus === 'cancelled' && status !== 'cancelled') {
       const [items] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of items) {
        // Check if stock is sufficient before re-deducting
        const [products] = await connection.execute('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (products[0].stock < item.quantity) {
            throw new Error(`Stok produk "${products[0].name}" tidak mencukupi untuk membatalkan pembatalan (Tersedia: ${products[0].stock})`);
        }

        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Status order diperbarui' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  } finally {
    connection.release();
  }
};

exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(orders);
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

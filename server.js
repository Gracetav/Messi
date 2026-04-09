const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));
app.use(express.urlencoded({ extended: true }));

// Check
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Automotive Sparepart Unified API' });
});

// Routes
const productRoutes = require('./server/routes/productRoutes');
const authRoutes = require('./server/routes/authRoutes');
const orderRoutes = require('./server/routes/orderRoutes');
const userRoutes = require('./server/routes/userRoutes');
const categoryRoutes = require('./server/routes/categoryRoutes');
const brandRoutes = require('./server/routes/brandRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

app.listen(PORT, () => {
    console.log(`Backend Express server is running on port ${PORT}`);
});

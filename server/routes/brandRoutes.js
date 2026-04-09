const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const multer = require('multer');
const path = require('path');

// Reuse multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', upload.single('image'), brandController.createBrand);
router.put('/:id', upload.single('image'), brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;

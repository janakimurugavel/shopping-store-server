const express = require("express");
const requireAdminKey = require("../middleware/adminMiddleware");
const router = express.Router();
const { validateUpdateProduct, validateProduct } = require("../middleware/productMiddleware");
const { updateProduct, getOutOfStockProducts, getAllProducts, getProductById, getProductsByCategory, addProduct, deleteProduct } = require("../controller/productController");
const products = require("../db/product");
const jwt = require('jsonwebtoken');
router.get('/admin/dashboard', requireAdminKey, (req, res) => {
    // Protected route
});
router.post('/admin/login', (req, res) => {
    // Verify admin credentials
    const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_SECRET, { expiresIn: '24h' });
    res.json({ token });
});
router.get('/', getAllProducts);

//get out - of -stock
router.get('/out-of-stock', getOutOfStockProducts);

// get product by id
router.get('/:id', getProductById);

//get categories
router.get('/categories/:category', getProductsByCategory);

//post products
router.post("git push -u origin main", validateProduct, addProduct);

// PUT endpoint: edits an existing product
router.put("/:id", validateUpdateProduct, updateProduct);

// DELETE endpoint: removes a product
//router.delete('/:id', deleteProduct)
router.delete("/:id", requireAdminKey, deleteProduct);
module.exports = router;
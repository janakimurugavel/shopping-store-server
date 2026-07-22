const express = require("express");

const router = express.Router();
const { validateUpdateProduct, validateProduct } = require("../middleware/productMiddleware");
const { updateProduct, getOutOfStockProducts, getAllProducts, getProductById, getProductsByCategory, addProduct, deleteProduct } = require("../controller/productController");
const products = require("../db/product");


router.get('/', getAllProducts);

//get out - of -stock
router.get('/out-of-stock', getOutOfStockProducts);

// get product by id
router.get('/:id', getProductById);

//get categories
router.get('/categories/:category', getProductsByCategory);

//post products
router.post("/", validateProduct, addProduct);

// PUT endpoint: edits an existing product
router.put("/:id", validateUpdateProduct, updateProduct);

// DELETE endpoint: removes a product
router.delete('/:id', deleteProduct)

module.exports = router;
const express = require("express");
const requireAdminKey = require("../middleware/adminMiddleware");
const router = express.Router();
const { connectToDatabase,
    closeDatabaseConnection } = require("../config/db");
const { validateUpdateProduct, validateProduct } = require("../middleware/productMiddleware");
const { updateProduct, getOutOfStockProducts, getAllProducts, getProductById, getProductsByCategory, addProduct, deleteProduct } = require("../controller/productController");
const upload = require("../middleware/uploadMiddleware");


router.get('/', getAllProducts);

//get out - of -stock
router.get('/out-of-stock', getOutOfStockProducts);

//get categories
router.get('/categories/:category', getProductsByCategory);

// get product by id
router.get('/:id', getProductById);

//post products
router.post("/", upload.single("image"), validateProduct, addProduct);

// PUT endpoint: edits an existing product
router.put("/:id", upload.single("image"), validateUpdateProduct, updateProduct);

// DELETE endpoint: removes a product
router.delete("/:id", requireAdminKey, deleteProduct);

module.exports = router;
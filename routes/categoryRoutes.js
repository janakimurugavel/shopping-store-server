const express = require("express");
const requireAdminKey = require("../middleware/adminMiddleware");
const {
    validateCategory,
    validateUpdateCategory,
} = require("../middleware/categoryMiddleware");
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controller/categoryController");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", validateCategory, createCategory);
router.patch("/:id", validateUpdateCategory, updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
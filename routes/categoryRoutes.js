const express = require("express");
const categoryController = require("../controller/categoryController");
const router = express.Router();

router.get("/", categoryController.categoryController);
router.get("/:id", categoryController.categoryById);
router.post("/", categoryController.validateCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
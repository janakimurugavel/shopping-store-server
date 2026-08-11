const mongoose = require("mongoose");
const Category = require("../models/Category");

const validateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const exists = await Category.findOne({
            name: name.trim(),
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
const validateUpdateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

module.exports = {
    validateCategory,
    validateUpdateCategory,
};
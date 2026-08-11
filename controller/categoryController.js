const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const getCategoryById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });

            return res.status(200).json({
                success: true,
                data: category,
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await Category.create({
            name: req.body.name,
        });

        return res.status(201).json({
            success: true,
            data: category,
            message: "Category created successfully",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Could not create category",
        });
    }
};

// const validateCategory = (req, res) => {
//     try {
//         const name = req.body.name?.trim();

//         const newCategory = {
//             id: categories.length ? categories[categories.length - 1].id + 1 : 1,
//             name
//         };

//         categories.push(newCategory);

//         res.status(201).json({ success: true, data: newCategory, message: "Category created" });
//     }
//     catch (error) {
//         res.status(500).json({ success: false, message: error?.message || "Internal server error" });
//     }
// };

const updateCategory = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
            message: "Category updated successfully",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Could not update category",
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const productExists = await Product.exists({ category: id });

        if (productExists) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete a category that still has products",
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
            message: "Category deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
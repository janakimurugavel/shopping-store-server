const mongoose = require("mongoose");
const Product = require("../models/Product");

const validateCartItem = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const quantity = Number(req.body.quantity ?? 1);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        req.product = product;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

const validateUpdateCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        req.product = product;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

const validateDeleteCart = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
    }

    next();
};

module.exports = {
    validateCartItem,
    validateUpdateCart,
    validateDeleteCart,
};
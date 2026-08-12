const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

const validateCartUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

const validateCartItem = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { productId } = req.body;
        const quantity = Number(req.body.quantity ?? 1);

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

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

        const [user, product] = await Promise.all([
            User.findById(userId),
            Product.findById(productId),
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        req.user = user;
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
        const { userId, productId } = req.params;
        const quantity = Number(req.body.quantity);

        if (
            !mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(productId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID or product ID",
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
    const { userId, productId } = req.params;

    if (
        !mongoose.isValidObjectId(userId) ||
        !mongoose.isValidObjectId(productId)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID or product ID",
        });
    }

    next();
};

module.exports = {
    validateCartUser,
    validateCartItem,
    validateUpdateCart,
    validateDeleteCart,
};
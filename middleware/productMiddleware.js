const Product = require("../models/Product");
const mongoose = require("mongoose");

async function validateProduct(req, res, next) {
    try {
        const { name, price, stock } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        if (price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Price and stock are required"
            });
        }

        //const db = getDB();

        const existingProduct = await Product.findOne({ name });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product already exists"
            });
        }

        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
async function validateUpdateProduct(req, res, next) {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (req.body.name !== undefined) {
            const name = req.body.name;
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Name must be a non-empty string"
                });
            }

            const existingName = await Product.findOne({
                name: name.trim(),
                _id: { $ne: id }
            });
            if (existingName) {
                return res.status(400).json({ success: false, message: "Product name already exists" });
            }
            req.body.name = name.trim();
        }

        if (req.body.price !== undefined) {
            const price = Number(req.body.price);
            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a non-negative number"
                });
            }
            req.body.price = price;
        }

        if (req.body.stock !== undefined) {
            const stock = Number(req.body.stock);
            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative integer"
                });
            }
            req.body.stock = stock;
        }

        if (req.body.category !== undefined && !mongoose.isValidObjectId(req.body.category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
module.exports = { validateUpdateProduct, validateProduct };
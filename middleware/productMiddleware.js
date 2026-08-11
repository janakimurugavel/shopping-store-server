const Product = require("../models/Product");
const { connectToDatabase,
    closeDatabaseConnection } = require("../config/db");
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
function validateUpdateProduct(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const product = products.find((item) => item.id === id);
        if (!product) {
            return res.status(404).json({ success: false, message: "product not found" });
        }
        const name = req.body.name;
        // Check name
        if (
            !name ||
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Name is required and must be a non-empty string"
            });
        }
        const existingName = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
        if (existingName) {
            return res.status(400).json({ success: false, message: "product name already exists" });
        }
        const price = req.body.price;
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a non-negative number"
            });
        }
        const stock = req.body.stock;
        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            });
        }
        req.product = product;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
module.exports = { validateUpdateProduct, validateProduct };
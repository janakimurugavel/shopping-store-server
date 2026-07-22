const products = require("../db/product");
function validateProduct(req, res, next) {
    try {
        const { name, price, stock } = req.body;

        // Check required fields
        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, price and stock are required"
            });
        }

        // Check duplicate name
        const existingName = products.find(
            (product) => product.name.toLowerCase() === name.toLowerCase()
        );

        if (existingName) {
            return res.status(400).json({
                success: false,
                message: "Product name already exists"
            });
        }

        // Check price
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: "Product price cannot be less than 0"
            });
        }

        // Check stock
        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Product stock cannot be less than 0"
            });
        }

        next();
    }
    catch {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
function validateUpdateProduct(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        const product = products.find((item) => item.id === id);
        if (!product) {
            res.json({ success: false, message: "product not found" });
        }
        const name = req.body.name;
        const existingName = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
        if (existingName) {
            return res.status(400).json({ success: false, message: "product name already exists" });
        }
        const price = req.body.price;
        if (price < 0) {
            return res.status(400).json({ success: false, message: "product price cannot less than 0" });
        }
        const stock = req.body.stock;
        if (stock < 0) {
            return res.status(400).json({ success: false, message: "product stock cannot less than 0" });
        }
        req.product = product;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
module.exports = { validateUpdateProduct, validateProduct };
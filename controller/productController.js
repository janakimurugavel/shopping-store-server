const products = require("../db/product");
const updateProduct = (req, res) => {
    try {
        const product = req.product;
        product.name = req.body.name ?? product.name;
        product.price = req.body.price ?? product.price;
        product.stock = req.body.stock ?? product.stock;
        product.category = req.body.category ?? product.category;
        res.json({ success: true, data: product, message: "product updated successfully" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
const getOutOfStockProducts = (req, res) => {
    try {
        const result = products.filter((product) => product.stock === 0);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
const getAllProducts = (req, res) => {
    try {
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
}
const getProductById = (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((item) => {
        return item.id == id;
    });
    res.json({ success: true, data: product });
}
const getProductsByCategory = (req, res) => {
    const categories = req.params.category;
    const result = products.filter((product) => product.category.toLowerCase() === categories.toLowerCase());
    res.json({ success: true, data: result });
}
const addProduct = (req, res) => {
    const newproduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category
    };
    products.push(newproduct);
    res.json({ success: true, data: newproduct, message: "product added successfully" });
}
const deleteProduct = (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: "product not found" });
    }
    const deletedProduct = products.splice(index, 1)[0];
    res.json({ success: true, message: "product deleted successfully", data: deletedProduct });
}
module.exports = { updateProduct, getOutOfStockProducts, getAllProducts, getProductById, getProductsByCategory, addProduct, deleteProduct };
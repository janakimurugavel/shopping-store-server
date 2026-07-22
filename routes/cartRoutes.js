const express = require("express");

const router = express.Router();

let cartItems = [];

const findCartItem = (productId) => cartItems.find((item) => item.productId === productId);

router.get("/", (req, res) => {
    res.json({ success: true, data: cartItems });
});

router.post("/items", (req, res) => {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity ?? 1);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const existingItem = findCartItem(productId);
    if (existingItem) {
        existingItem.quantity += quantity;
        return res.status(200).json({ success: true, data: existingItem, message: "Cart item quantity updated" });
    }

    const newItem = {
        productId,
        quantity,
        name: req.body.name || null,
        price: req.body.price ?? null
    };

    cartItems.push(newItem);
    res.status(201).json({ success: true, data: newItem, message: "Cart item added" });
});

router.patch("/items/:productId", (req, res) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const cartItem = findCartItem(productId);
    if (!cartItem) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    res.json({ success: true, data: cartItem, message: "Cart item quantity updated" });
});

router.delete("/items/:productId", (req, res) => {
    const productId = Number(req.params.productId);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    const index = cartItems.findIndex((item) => item.productId === productId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    const deletedItem = cartItems.splice(index, 1)[0];
    res.json({ success: true, data: deletedItem, message: "Cart item removed" });
});

module.exports = router;

const express = require("express");

const router = express.Router();
const { getCartItems, addCartItem, updateCartItem, deleteCartItem } = require("../controller/cartController");
const { validateCart, validateUpdateCart, validateDeleteCart } = require("../middleware/cartMiddleware");

let cartItems = [];

const findCartItem = (productId) => cartItems.find((item) => item.productId === productId);

router.get("/", getCartItems);

router.post("/items", validateCart, addCartItem);

router.patch("/items/:productId", validateUpdateCart, updateCartItem);

router.delete("/items/:productId", validateDeleteCart, deleteCartItem);

module.exports = router;

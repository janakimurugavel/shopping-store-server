const express = require("express");
const requireLogin = require("../middleware/authMiddleware");
const {
    getCartItems,
    addCartItem,
    updateCartItem,
    deleteCartItem,
} = require("../controller/cartController");
const {
    validateCartItem,
    validateUpdateCart,
    validateDeleteCart,
} = require("../middleware/cartMiddleware");

const router = express.Router();

router.get("/", requireLogin, getCartItems);
router.post("/items", requireLogin, validateCartItem, addCartItem);
router.patch("/items/:productId", requireLogin, validateUpdateCart, updateCartItem);
router.delete("/items/:productId", requireLogin, validateDeleteCart, deleteCartItem);

module.exports = router;
const express = require("express");
const {
    getCartItems,
    addCartItem,
    updateCartItem,
    deleteCartItem,
} = require("../controller/cartController");
const {
    validateCartUser,
    validateCartItem,
    validateUpdateCart,
    validateDeleteCart,
} = require("../middleware/cartMiddleware");

const router = express.Router();

router.get("/:userId", validateCartUser, getCartItems);

router.post("/:userId/items", validateCartItem, addCartItem);

router.patch(
    "/:userId/items/:productId",
    validateUpdateCart,
    updateCartItem
);

router.delete(
    "/:userId/items/:productId",
    validateDeleteCart,
    deleteCartItem
);

module.exports = router;
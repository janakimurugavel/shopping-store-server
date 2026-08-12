const Cart = require("../models/Cart");

const getCartItems = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            userId: req.user.userId,
        }).populate("items.productId");

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    userId: req.user.userId,
                    items: [],
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
const addCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { product } = req;
        const quantity = Number(req.body.quantity ?? 1);

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [],
            });
        }

        const existingItem = cart.items.find((item) =>
            item.productId.equals(product._id)
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock",
                });
            }

            existingItem.quantity += quantity;
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock",
                });
            }

            cart.items.push({
                productId: product._id,
                quantity,
            });
        }

        await cart.save();
        await cart.populate("items.productId");

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Item added to cart",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;
        const quantity = Number(req.body.quantity);
        const { product } = req;

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock",
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const cartItem = cart.items.find((item) =>
            item.productId.equals(productId)
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        cartItem.quantity = quantity;
        await cart.save();
        await cart.populate("items.productId");

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Cart item quantity updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
const deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const originalCount = cart.items.length;

        cart.items = cart.items.filter(
            (item) => !item.productId.equals(productId)
        );

        if (cart.items.length === originalCount) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            data: cart,
            message: "Cart item removed",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

module.exports = {
    getCartItems,
    addCartItem,
    updateCartItem,
    deleteCartItem,
};

let cartItems = [];

const findCartItem = (productId) => {
    return cartItems.find((item) => item.productId === productId);
};

const getCartItems = (req, res) => {
    res.json({ success: true, data: cartItems });
}
const addCartItem = (req, res) => {

    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity ?? 1);

    const existingItem = findCartItem(productId);

    if (existingItem) {
        existingItem.quantity += quantity;

        return res.status(200).json({
            success: true,
            data: existingItem,
            message: "Cart item quantity updated"
        });
    }

    const newItem = {
        productId,
        quantity,
        name: req.body.name || null,
        price: req.body.price ?? null
    };

    cartItems.push(newItem);

    res.status(201).json({
        success: true,
        data: newItem,
        message: "Cart item added"
    });
};
const updateCartItem = (req, res) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    const cartItem = findCartItem(productId);

    if (!cartItem) {
        return res.status(404).json({
            success: false,
            message: "Cart item not found"
        });
    }

    cartItem.quantity = quantity;

    res.json({
        success: true,
        data: cartItem,
        message: "Cart item quantity updated"
    });
};
const deleteCartItem = (req, res) => {
    const productId = Number(req.params.productId);

    const index = cartItems.findIndex(
        (item) => item.productId === productId
    );

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Cart item not found"
        });
    }

    const deletedItem = cartItems.splice(index, 1)[0];

    res.json({
        success: true,
        data: deletedItem,
        message: "Cart item removed"
    });
};
module.exports = { addCartItem, getCartItems, updateCartItem, deleteCartItem };
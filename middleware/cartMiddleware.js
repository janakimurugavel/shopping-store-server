function validateCart(req, res, next) {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity ?? 1);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid productId is required"
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    // Continue to the controller
    next();
};
const validateUpdateCart = (req, res, next) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid productId is required"
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer"
        });
    }

    next();
};
const validateDeleteCart = (req, res, next) => {
    const productId = Number(req.params.productId);

    if (!productId || Number.isNaN(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid productId is required"
        });
    }

    next();
};

module.exports = { validateCart, validateUpdateCart, validateDeleteCart };
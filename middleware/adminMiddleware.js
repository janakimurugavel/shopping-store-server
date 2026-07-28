// using JWT for admin authorization
const jwt = require('jsonwebtoken');

function requireAdminKey(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
        req.admin = decoded; // Attach decoded data to request
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

module.exports = requireAdminKey;
// admin key for authorization
// function requireAdminKey(req, res, next) {

//     const adminKey = req.headers["x-admin-key"];

//     if (adminKey !== process.env.ADMIN_KEY) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized"
//         });
//     }

//     next();
// }

// module.exports = requireAdminKey;
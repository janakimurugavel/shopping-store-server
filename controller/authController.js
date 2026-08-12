const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const getAdminDashboard = (req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin"
    });
}
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
const loginAdmin = (req, res) => {
    // Verify admin credentials
    const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_SECRET, { expiresIn: '24h' });
    res.json({ token });
}

module.exports = { getAdminDashboard, loginAdmin, registerUser };
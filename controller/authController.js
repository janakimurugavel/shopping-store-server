const jwt = require("jsonwebtoken");
const getAdminDashboard = (req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin"
    });
}
const loginAdmin = (req, res) => {
    // Verify admin credentials
    const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_SECRET, { expiresIn: '24h' });
    res.json({ token });
}

module.exports = { getAdminDashboard, loginAdmin };
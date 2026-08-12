
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const requireAdminKey = require("../middleware/adminMiddleware");
const { getAdminDashboard, loginAdmin, registerUser } = require("../controller/authController");

router.get("/admin/dashboard", requireAdminKey, getAdminDashboard);
router.post("/register", registerUser);
router.post('/admin/login', loginAdmin);

module.exports = router;

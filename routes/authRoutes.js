
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const requireAdminKey = require("../middleware/adminMiddleware");
const { getAdminDashboard, loginAdmin, registerUser, loginUser } = require("../controller/authController");


router.get("/admin/dashboard", requireAdminKey, getAdminDashboard);
router.post("/register", registerUser);
router.post('/admin/login', loginAdmin);
router.post('/login', loginUser);




module.exports = router;

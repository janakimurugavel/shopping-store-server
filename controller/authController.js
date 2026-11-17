const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../services/emailService");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        try {
            await sendWelcomeEmail({
                to: user.email,
                name: user.name,
            });
        } catch (emailError) {
            console.error(
                "Welcome email could not be sent:",
                emailError.response?.body || emailError.message
            );
        }
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
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
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
const googleLogin = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({
            success: false,
            message: "Google credential is required",
        });
    }

    let payload;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        payload = ticket.getPayload();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Google credential",
        });
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        return res.status(401).json({
            success: false,
            message: "Google account email is not verified",
        });
    }

    try {
        const email = payload.email.toLowerCase();

        let user = await User.findOne({ googleId: payload.sub });

        if (!user) {
            user = await User.findOne({ email });

            if (user) {
                if (user.googleId && user.googleId !== payload.sub) {
                    return res.status(409).json({
                        success: false,
                        message: "This email is linked to another Google account",
                    });
                }

                user.googleId = payload.sub;
                await user.save();
            } else {
                user = await User.create({
                    name: payload.name || email.split("@")[0],
                    email,
                    googleId: payload.sub,
                });
            }
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not complete Google login",
        });
    }
};
module.exports = { getAdminDashboard, loginAdmin, registerUser, loginUser, googleLogin };
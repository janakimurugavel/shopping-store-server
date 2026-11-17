const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
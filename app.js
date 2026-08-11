require("dotenv").config();
const express = require("express");
const app = express();
const { connectToDatabase,
    closeDatabaseConnection } = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/auth", authRoutes);

app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);


// // const path = require("path");
// // const fs = require("fs");

// // const filePath = path.join(__dirname, "notes.txt");

// // fs.writeFileSync(filePath, "Node.js Learning");

// // console.log("File Created");
// // fs.appendFileSync("notes.txt", "\nWelcome");

// // console.log("Updated");
// // fs.unlinkSync("s.txt");

const { existsSync } = require("node:fs");

if (typeof process.loadEnvFile === "function" && existsSync(".env")) {
    process.loadEnvFile(".env");
}

async function start() {
    await connectToDatabase();
    console.log("Mongoose connection check passed.");
}

start()
    .catch((error) => {
        console.error("Could not connect to MongoDB:", error.message);
        process.exitCode = 1;
    })

app.listen(3000, () => {
    console.log("Server running at port 3000");
});
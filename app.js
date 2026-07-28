require("dotenv").config();
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

// const path = require("path");
// const fs = require("fs");

// const filePath = path.join(__dirname, "notes.txt");

// fs.writeFileSync(filePath, "Node.js Learning");

// console.log("File Created");
// fs.appendFileSync("notes.txt", "\nWelcome");

// console.log("Updated");
// fs.unlinkSync("s.txt");
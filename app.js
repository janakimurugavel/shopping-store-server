const express = require("express");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "notes.txt");

fs.writeFileSync(filePath, "Node.js Learning");

console.log("File Created");
fs.appendFileSync("notes.txt", "\nWelcome");

console.log("Updated");
fs.unlinkSync("samp.txt");
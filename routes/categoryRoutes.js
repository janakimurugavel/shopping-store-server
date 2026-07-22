const express = require("express");

const router = express.Router();

let categories = [
    { id: 1, name: "Grocery" },
    { id: 2, name: "Electronics" }
];

router.get("/", (req, res) => {
    res.json({ success: true, data: categories });
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const category = categories.find((item) => item.id === id);

    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
});

router.post("/", (req, res) => {
    const name = req.body.name?.trim();

    if (!name) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const exists = categories.some((item) => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = {
        id: categories.length ? categories[categories.length - 1].id + 1 : 1,
        name
    };

    categories.push(newCategory);

    res.status(201).json({ success: true, data: newCategory, message: "Category created" });
});

router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);
    const category = categories.find((item) => item.id === id);

    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    const newName = req.body.name?.trim();
    if (!newName) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const exists = categories.some((item) => item.id !== id && item.name.toLowerCase() === newName.toLowerCase());
    if (exists) {
        return res.status(400).json({ success: false, message: "Category already exists" });
    }

    category.name = newName;

    res.json({ success: true, data: category, message: "Category updated" });
});

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = categories.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    const deletedCategory = categories.splice(index, 1)[0];

    res.json({ success: true, data: deletedCategory, message: "Category removed" });
});

module.exports = router;

const { categories } = require("../db/product");

const categoryController = (req, res) => {
    try {
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const categoryById = (req, res) => {
    try {
        const id = Number(req.params.id);
        const category = categories.find((item) => item.id === id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const validateCategory = (req, res) => {
    try {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const updateCategory = (req, res) => {
    try {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

const deleteCategory = (req, res) => {
    try {
        const id = Number(req.params.id);
        const index = categories.findIndex((item) => item.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const deletedCategory = categories.splice(index, 1)[0];

        res.json({ success: true, data: deletedCategory, message: "Category removed" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || "Internal server error" });
    }
};

module.exports = { categoryController, categoryById, validateCategory, updateCategory, deleteCategory };
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

// GET all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// CREATE a new category (frontend already uploads to Cloudinary)
export const createCategory = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const { name } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // 🔥 Use the already-uploaded Cloudinary URL directly
    const imageUrl = req.file.path;

    const category = new Category({ name, image: imageUrl });
    await category.save();

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    console.error("Category creation failed:", error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// UPDATE category (name + image)
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update name
    if (name) category.name = name;

    // Update image if a new file is uploaded
    if (req.file) {
      const imageUrl = req.file.path; // 🔥 Directly use uploaded Cloudinary URL
      category.image = imageUrl;
    }

    await category.save();
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
};

// DELETE category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
};

// BULK insert categories
export const bulkCreateCategories = async (req, res) => {
  const categories = req.body.categories;

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ message: 'No categories provided' });
  }

  try {
    const results = await Category.insertMany(categories, { ordered: false });
    res.status(201).json({
      message: `${results.length} categories added successfully.`,
      categories: results
    });
  } catch (error) {
    console.error("Bulk category insert failed:", error);
    res.status(500).json({
      message: 'Bulk category creation failed for some entries',
      error: error.message
    });
  }
};

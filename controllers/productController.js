import Product from '../models/Product.js';
import Category from '../models/Category.js'; // ✅ Required for ID to name mapping

// Create a new product (admin only)
const createProduct = async (req, res) => {
  const { name, description, category, price, countInStock } = req.body;
  const image = req.body.image || req.file?.path || 'no-image.jpg';

  try {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category selected' });
    }

    const newProduct = new Product({
      name,
      image,
      description,
      category: categoryDoc.name, // 🔁 store name instead of ID
      price,
      stock: countInStock,
      createdBy: req.user._id,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Get all products (with optional search/category filter)
const getAllProducts = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: { $regex: new RegExp(req.query.category, "i") } }
      : {};

    const products = await Product.find({ ...keyword, ...categoryFilter });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Fix: Get products by category (case-insensitive exact match)
const getProductsByCategory = async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.categoryName);
    const products = await Product.find({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') } // ✅ Fix here
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category products', error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    if (req.file) {
      updates.image = req.file.path;
    }

    if (updates.countInStock !== undefined) {
      updates.stock = updates.countInStock;
      delete updates.countInStock;
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: '✅ Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
};

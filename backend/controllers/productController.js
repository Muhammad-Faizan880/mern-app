import Product from "../models/productModel.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, sizes, colors, stock } = req.body;

    // Multer provides req.file
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      stock: Number(stock),
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, page = 1, limit = 5 } = req.query;

    // Search + Filter object
    let query = {};

    // Search by name (case-insensitive)
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query).skip(skip).limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, sizes, colors, stock } = req.body;

    const updateData = {
      name,
      description,
      price,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      stock: stock ? Number(stock) : 0,
    };

    // ✅ if new image uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};

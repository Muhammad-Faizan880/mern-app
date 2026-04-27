// controllers/productController.js
import Product from "../models/productModel.js";
import Variant from "../models/Variant.js";

// Create product with variants in separate table
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, variants } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      return res.status(400).json({ message: "Invalid variants format" });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      image: `/uploads/${req.file.filename}`,
    });

    // Create variants in separate collection
    const variantDocs = parsedVariants.map(v => ({
      productId: product._id,
      size: v.size,
      color: {
        name: v.color.name,
        hex: v.color.hex,
        image: v.color.image || product.image
      },
      stock: v.stock,
      sku: `${product._id}-${v.size}-${v.color.name}`.replace(/\s/g, '')
    }));

    await Variant.insertMany(variantDocs);

    res.status(201).json({ 
      product, 
      variants: variantDocs 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get product with its variants
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    const variants = await Variant.find({ 
      productId: product._id,
      isActive: true 
    });
    
    res.json({ ...product.toObject(), variants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products (with variants populated)
export const getProducts = async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice, page = 1, limit = 5 } = req.query;

    let query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(query);

    const productIds = products.map(p => p._id);
    const allVariants = await Variant.find({ 
      productId: { $in: productIds },
      isActive: true 
    });

    const variantsByProduct = {};
    allVariants.forEach(v => {
      if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
      variantsByProduct[v.productId].push(v);
    });

    const productsWithVariants = products.map(p => ({
      ...p.toObject(),
      variants: variantsByProduct[p._id] || []
    }));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products: productsWithVariants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE PRODUCT (with variants)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, variants } = req.body;

    const updateData = {
      name,
      description,
      price,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If variants are provided in update, update them
    if (variants) {
      let parsedVariants;
      try {
        parsedVariants = JSON.parse(variants);
      } catch (error) {
        return res.status(400).json({ message: "Invalid variants format" });
      }

      // Delete existing variants
      await Variant.deleteMany({ productId: product._id });

      // Create new variants
      const variantDocs = parsedVariants.map(v => ({
        productId: product._id,
        size: v.size,
        color: {
          name: v.color.name,
          hex: v.color.hex,
          image: v.color.image || product.image
        },
        stock: v.stock,
        sku: `${product._id}-${v.size}-${v.color.name}`.replace(/\s/g, '')
      }));

      await Variant.insertMany(variantDocs);
    }

    const updatedVariants = await Variant.find({ productId: product._id });

    res.json({
      message: "Product updated successfully",
      product,
      variants: updatedVariants
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ DELETE PRODUCT (also deletes all related variants)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all variants related to this product
    const deletedVariants = await Variant.deleteMany({ productId: product._id });
    
    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ 
      message: "Product and all its variants deleted successfully",
      deletedCount: {
        product: 1,
        variants: deletedVariants.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update variant stock (for checkout)
export const updateVariantStock = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;
    
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    
    if (variant.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    
    variant.stock -= quantity;
    await variant.save();
    
    res.json({ message: "Stock updated", stock: variant.stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get variant by ID (for checkout)
export const getVariantById = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id).populate("productId");
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json(variant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all variants of a product
export const getProductVariants = async (req, res) => {
  try {
    const variants = await Variant.find({ 
      productId: req.params.productId,
      isActive: true 
    });
    
    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update single variant stock (admin)
export const updateSingleVariantStock = async (req, res) => {
  try {
    const { stock } = req.body;
    
    const variant = await Variant.findByIdAndUpdate(
      req.params.variantId,
      { stock },
      { new: true }
    );
    
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    
    res.json({ message: "Stock updated", variant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
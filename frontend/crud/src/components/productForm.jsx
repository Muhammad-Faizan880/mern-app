// ProductForm.jsx
import React, { useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "../api/axios";
import { AuthContext } from "../context/authContext";

const ProductForm = () => {
  const { token } = useContext(AuthContext);

  // Product basic info
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  // Variants state - Now supporting multiple colors per size
  const [variants, setVariants] = useState([]);
  
  // Form for adding new variant
  const [size, setSize] = useState("");
  const [colors, setColors] = useState([]); // Multiple colors array
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [colorStock, setColorStock] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // Add color to current size
  const addColorToSize = () => {
    if (!colorName || !colorStock) {
      toast.error("Please fill color name and stock");
      return;
    }

    const newColor = {
      name: colorName,
      hex: colorHex,
      stock: Number(colorStock),
    };

    setColors([...colors, newColor]);
    
    // Reset color form
    setColorName("");
    setColorHex("#000000");
    setColorStock("");
  };

  // Remove color from current size
  const removeColor = (index) => {
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
    setColors(updatedColors);
  };

  // Add variant (size with multiple colors) to product
  const addVariant = () => {
    if (!size) {
      toast.error("Please enter size");
      return;
    }

    if (colors.length === 0) {
      toast.error("Please add at least one color for this size");
      return;
    }

    // Check if size already exists
    const existingSize = variants.find(v => v.size === size);
    if (existingSize) {
      toast.error(`Size ${size} already exists! You can edit it.`);
      return;
    }

    setVariants([
      ...variants,
      {
        size: size,
        colors: colors,
        totalStock: colors.reduce((sum, c) => sum + c.stock, 0)
      }
    ]);

    // Reset form
    setSize("");
    setColors([]);
    toast.success(`Size ${size} added with ${colors.length} colors`);
  };

  // Remove entire variant (size)
  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // Update stock for a specific color in a variant
  const updateColorStock = (variantIndex, colorIndex, newStock) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].colors[colorIndex].stock = Number(newStock);
    updatedVariants[variantIndex].totalStock = updatedVariants[variantIndex].colors.reduce(
      (sum, c) => sum + c.stock, 0
    );
    setVariants(updatedVariants);
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, description, price, image } = form;

    if (!name || !description || !price || !image) {
      toast.error("Please fill all required fields");
      return;
    }

    if (variants.length === 0) {
      toast.error("Add at least one size with colors");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", Number(price));
      
      // Transform variants to API format
      const apiVariants = [];
      variants.forEach(variant => {
        variant.colors.forEach(color => {
          apiVariants.push({
            size: variant.size,
            color: {
              name: color.name,
              hex: color.hex
            },
            stock: color.stock
          });
        });
      });
      
      formData.append("variants", JSON.stringify(apiVariants));
      formData.append("image", image);

      await axios.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product added successfully");

      // Reset form
      setForm({
        name: "",
        description: "",
        price: "",
        image: null,
      });
      setPreview(null);
      setVariants([]);
      setColors([]);
      setSize("");
      
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Add New Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
              
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} className="h-full object-contain" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-500">Click to upload image</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Premium Cotton T-Shirt"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="29.99"
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Variants Builder Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Sizes & Colors (Daraz Style)
              </h2>
              
              {/* Add New Size with Multiple Colors */}
              <div className="border-2 border-dashed border-indigo-200 rounded-lg p-4 mb-6 bg-indigo-50">
                <h3 className="font-semibold text-indigo-800 mb-3">Add New Size with Colors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Size *</label>
                    <input
                      value={size}
                      onChange={(e) => setSize(e.target.value.toUpperCase())}
                      placeholder="e.g., M, L, XL"
                      className="w-full p-2 border rounded-lg"
                      list="sizeOptions"
                    />
                    <datalist id="sizeOptions">
                      <option>XS</option>
                      <option>S</option>
                      <option>M</option>
                      <option>L</option>
                      <option>XL</option>
                      <option>XXL</option>
                    </datalist>
                  </div>
                </div>

                {/* Add Colors to this Size */}
                <div className="border-t border-indigo-200 pt-4 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Colors for {size || "this"} Size:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <input
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="Color Name"
                      className="p-2 border rounded-lg"
                    />
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-10 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={colorStock}
                      onChange={(e) => setColorStock(e.target.value)}
                      placeholder="Stock"
                      className="p-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addColorToSize}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Colors List for Current Size */}
                  {colors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">Colors to add:</p>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex }}></div>
                            <span className="text-sm">{color.name}</span>
                            <span className="text-xs text-gray-500">Stock: {color.stock}</span>
                            <button
                              type="button"
                              onClick={() => removeColor(idx)}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Add Size {size} with {colors.length} Colors
                </button>
              </div>

              {/* Display Added Variants */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Added Sizes & Colors:</h3>
                  <div className="space-y-3">
                    {variants.map((variant, vIdx) => (
                      <div key={vIdx} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-indigo-600">Size: {variant.size}</h4>
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove Size
                          </button>
                        </div>
                        
                        <div className="grid gap-2">
                          {variant.colors.map((color, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                              <div className="w-8 h-8 rounded-full shadow" style={{ backgroundColor: color.hex }}></div>
                              <span className="font-medium w-24">{color.name}</span>
                              <input
                                type="number"
                                value={color.stock}
                                onChange={(e) => updateColorStock(vIdx, cIdx, e.target.value)}
                                className="w-24 p-1 border rounded text-center"
                              />
                              <span className="text-sm text-gray-500">items</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          Total Stock: {variant.totalStock} items
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Create Product
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductForm;
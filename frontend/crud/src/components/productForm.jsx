import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "../api/axios";


const ProductForm = () => {



  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [preview, setPreview] = useState(null);

  // Generic handleChange
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

  // ✅ Fixed handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();

  const { name, description, price, image } = form;

  if (!name || !description || !price || !image) {
    toast.error("Please fill all fields");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", Number(price));
  formData.append("image", image);

  try {
    await axios.post("/products", formData);
    toast.success("Product added successfully");

    setForm({ name: "", description: "", price: "", image: null });
    setPreview(null);
  } catch (error) {
    toast.error("Failed to add product");
  }
};
  return (
    <>
      <Toaster position="top-center" />
      <h1 className="text-gray-800 font-medium text-2xl text-center pt-6">
        Add Products
      </h1>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="p-4 max-w-md mx-auto mt-6 bg-white rounded-lg shadow-md">
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imageUpload"
          />

          <label
            htmlFor="imageUpload"
            className="w-full h-40 border-2 border-dashed rounded flex items-center justify-center cursor-pointer overflow-hidden relative group"
          >
            {preview ? (
              <>
                {/* Image Preview */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm transition">
                  Change Image
                </div>
              </>
            ) : (
              <span className="text-gray-500">Click to upload image</span>
            )}
          </label>

          {/* Remove Button */}
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setForm({ ...form, image: null });
              }}
              className="mt-2 text-red-500 text-sm"
            >
              Remove Image
            </button>
          )}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mb-4 mt-3"
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Add Product
          </button>
        </div>
      </form>
    </>
  );
};

export default ProductForm;

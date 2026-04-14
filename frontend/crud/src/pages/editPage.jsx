import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 fetch existing product
  useEffect(() => {
    if (!id) return;

   const fetchProduct = async () => {
  try {
    const res = await axios.get(`/products/${id}`);

    const product = res.data.product || res.data;

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      image: null,
    });

    if (product.image) {
      setPreview(`http://localhost:5000${product.image}`);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

    fetchProduct();
  }, [id]);

  // 🔹 input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // UPDATE API
 const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("description", form.description);
  formData.append("price", Number(form.price));

  if (form.image) {
    formData.append("image", form.image);
  }

  try {
    await axios.put(`/products/${id}`, formData);

    toast.success("Product updated successfully");

    navigate("/");
  } catch (error) {
    toast.error("Update failed");
  }
};
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <Toaster position="top-center" />

      <h1 className="text-center text-2xl mt-6 font-semibold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
          {/* Image */}
          <input
            type="file"
            onChange={handleImageChange}
            className="hidden"
            id="imageUpload"
          />

          <label
            htmlFor="imageUpload"
            className="w-full h-40 border-2 border-dashed flex items-center justify-center cursor-pointer rounded mb-3 overflow-hidden"
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-contain" />
            ) : (
              <span>Select Image</span>
            )}
          </label>

          {/* Inputs */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border mb-3"
          />

          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border mb-3"
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            className="w-full p-2 border mb-3"
          />

          <button className="w-full bg-blue-500 text-white p-2 rounded">
            Update Product
          </button>
        </div>
      </form>
    </>
  );
};

export default EditPage;

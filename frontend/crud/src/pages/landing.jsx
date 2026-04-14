import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios.js";
import toast, { Toaster } from "react-hot-toast";

const home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);

      // remove from UI instantly (no reload needed)
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <>
      <Toaster position="top-center" />
      <nav className="bg-gray-800 p-4 text-white flex justify-between">
        <h1 className="text-xl font-bold">CRUD App</h1>
        <button
          onClick={handleLogout}
          className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </nav>

      {products.length === 0 ? (
        <p className="text-center mt-6 text-gray-500 text-lg">
          No products available.
        </p>
      ) : (
        <>
          <p className="text-center mt-6 text-gray-800 text-2xl font-semibold">
            All products.
          </p>

          <div className="float-right mr-7">
            <Link
              to="/add"
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded"
            >
              Add Product
            </Link>
          </div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 mt-8">

  {products.map((product) => (
    <div
      key={product._id}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
    >

      {/* IMAGE */}
      <div className="h-[220px] bg-white flex items-center justify-center border-b border-gray-100">
        {product.image ? (
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-400">No Image Available</span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">

        {/* NAME */}
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {product.name}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* PRICE ROW */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">
            ${product.price}
          </span>

          <span className="text-[11px] text-green-600 bg-green-50 px-2 py-1 rounded-md">
            In Stock
          </span>
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex gap-2">

          <button className="flex-1 text-xs font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            View
          </button>

          <Link to={`/editPage/${product._id}`} className="flex-1">
            <button className="w-full text-xs font-medium py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
              Edit
            </button>
          </Link>

          <button
            onClick={() => handleDelete(product._id)}
            className="flex-1 text-xs font-medium py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  ))}
</div>
        </>
      )}
    </>
  );
};

export default home;

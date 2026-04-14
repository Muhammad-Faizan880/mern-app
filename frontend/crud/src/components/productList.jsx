import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await axios.get("/products");
    setProducts(res.data);
  };

  const deleteProduct = async (id) => {
    await axios.delete(`/products/${id}`);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Products</h2>
      <ul>
        {products.map((p) => (
          <li
            key={p._id}
            className="flex justify-between mb-2 bg-gray-100 p-2 rounded"
          >
            <span>
              {p.title} - ${p.price}
            </span>
            <div>
              <Link
                to={`/edit/${p._id}`}
                className="bg-yellow-400 px-2 py-1 rounded mr-2"
              >
                Edit
              </Link>
              <button
                onClick={() => deleteProduct(p._id)}
                className="bg-red-500 px-2 py-1 rounded text-white"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;

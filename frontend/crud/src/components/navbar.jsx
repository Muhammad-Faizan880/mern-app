import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-gray-800 p-4 text-white flex justify-between">
    <h1 className="text-xl font-bold">CRUD App</h1>
    <Link to="/add" className="bg-blue-500 px-3 py-1 rounded">Add Product</Link>
  </nav>
);

export default Navbar;
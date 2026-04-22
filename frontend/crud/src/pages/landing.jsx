import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios.js";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Star,
  TrendingUp,
  Package,
  ShoppingBag,
  Menu,
} from "lucide-react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/products", {
        params: {
          keyword,
          minPrice,
          maxPrice,
          page,
          limit: 12,
          sortBy,
        },
      });
      setProducts(response.data.products);
      setPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delay);
  }, [keyword, minPrice, maxPrice, page, sortBy]);

  // Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // Reset filters
  const resetFilters = () => {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    toast.success("Filters reset");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: "#363636", color: "#fff" },
        }}
      />

      {/* MODERN NAVBAR - RESPONSIVE */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Junior MERN
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>{products.length} Products</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - RESPONSIVE */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Discover Amazing Products
            </h2>
            <p className="text-base sm:text-lg md:text-xl opacity-90">
              Shop the best deals on premium items
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - RESPONSIVE GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Filters & Search</span>
            </div>
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-9">
          {/* FILTERS SIDEBAR - RESPONSIVE */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0 transition-all duration-300`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 sticky top-20">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition mb-4"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Price Filters</span>
                </div>
                {(minPrice || maxPrice) && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mb-4 pt-4 border-t border-gray-200 animate-fadeIn">
                  {/* Price Range */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Range: ${minPrice || 0} - ${maxPrice || 1000}
                    </label>
                    <div className="relative h-10 flex items-center">
                      <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
                      <div
                        className="absolute h-2 rounded-full transition-all duration-200"
                        style={{
                          left: `${((minPrice || 0) / 1000) * 100}%`,
                          right: `${100 - ((maxPrice || 1000) / 1000) * 100}%`,
                          background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={maxPrice || 1000}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value > (minPrice || 0)) {
                            setMaxPrice(value);
                            setPage(1);
                          }
                        }}
                        className="range-thumb absolute w-full appearance-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Quick Price Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quick Filters
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Under $25", min: 0, max: 25 },
                        { label: "$25 - $50", min: 25, max: 50 },
                        { label: "$50 - $100", min: 50, max: 100 },
                        { label: "Over $100", min: 100, max: 1000 },
                      ].map((filter) => (
                        <button
                          key={filter.label}
                          onClick={() => {
                            setMinPrice(filter.min);
                            setMaxPrice(filter.max);
                            setPage(1);
                          }}
                          className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Filters Button */}
              {(keyword || minPrice || maxPrice) && (
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition text-sm"
                >
                  <X className="w-4 h-4" />
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* PRODUCTS SECTION - RESPONSIVE */}
          <div className="flex-1">
            {/* ADD PRODUCT BUTTON - FLOATING ACTION (Mobile Optimized) */}
            <Link
              to="/add"
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </Link>

            {/* LOADING STATE */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64 sm:h-96">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-2xl shadow-sm">
                <div className="text-6xl sm:text-8xl mb-4">🛍️</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base">
                  Try adjusting your search or filters
                </p>
                <Link
                  to="/add"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transition text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <>
              
                {/* PRODUCT COUNT & STATS - RESPONSIVE */}
                <div className="flex flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      All Products
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Showing {products.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Trending now</span>
                    </div>
                    {/* View Toggle */}
                    <div className="flex gap-1 bg-gray-100 border rounded-lg p-0.5 sm:p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-2 sm:px-3 py-1 rounded-md transition text-xs sm:text-sm ${
                          viewMode === "grid" ? "bg-white shadow-sm" : ""
                        }`}
                      >
                        📱 Grid
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`px-2 sm:px-3 py-1 rounded-md transition text-xs sm:text-sm ${
                          viewMode === "list" ? "bg-white shadow-sm" : ""
                        }`}
                      >
                        📋 List
                      </button>
                    </div>
                  </div>
                </div>

                {/* PRODUCT GRID - FULLY RESPONSIVE */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product, index) => (
                      <div
                        key={product._id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Image Container */}
                        <div className="relative h-48 xs:h-56 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {product.image ? (
                            <img
                              src={`http://localhost:5000${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1 sm:gap-2">
                            {product.price < 50 && (
                              <span className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                                Best Deal
                              </span>
                            )}
                            {product.price > 200 && (
                              <span className="bg-purple-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                                Premium
                              </span>
                            )}
                          </div>

                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3">
                            <button className="bg-white text-gray-800 p-1.5 sm:p-2 rounded-full hover:scale-110 transition">
                              <Eye className="w-3 h-3 sm:w-5 sm:h-5" />
                            </button>
                            <Link to={`/editPage/${product._id}`}>
                              <button className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-full hover:scale-110 transition">
                                <Edit className="w-3 h-3 sm:w-5 sm:h-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="bg-red-600 text-white p-1.5 sm:p-2 rounded-full hover:scale-110 transition"
                            >
                              <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-5">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-lg mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {product.description || "No description available"}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg sm:text-2xl font-bold text-blue-600">
                                ${product.price}
                              </span>
                              {product.oldPrice && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through ml-1 sm:ml-2">
                                  ${product.oldPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                              <span className="text-xs sm:text-sm text-gray-600">4.5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // LIST VIEW - RESPONSIVE
                  <div className="space-y-3 sm:space-y-4">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                      >
                        <div className="w-full sm:w-24 md:w-32 h-28 sm:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={`http://localhost:5000${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap justify-between items-center gap-2 mt-2 sm:mt-3">
                            <span className="text-xl sm:text-2xl font-bold text-blue-600">
                              ${product.price}
                            </span>
                            <div className="flex gap-1 sm:gap-2">
                              <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-lg hover:bg-gray-50">
                                View
                              </button>
                              <Link to={`/editPage/${product._id}`}>
                                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-lg">
                                  Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PAGINATION - RESPONSIVE */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-12 mb-6 sm:mb-8">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition text-sm sm:text-base ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Prev</span>
                  </button>

                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(Math.min(5, pages))].map((_, i) => {
                      let pageNum;
                      if (pages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pages - 2) {
                        pageNum = pages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition text-sm sm:text-base ${
                            page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pages))}
                    disabled={page === pages}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition text-sm sm:text-base ${
                      page === pages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 640px) {
          .range-thumb::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
        }

        .range-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        /* Custom breakpoint for extra small devices */
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
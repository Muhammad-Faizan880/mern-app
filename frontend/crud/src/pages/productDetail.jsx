import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Heart, ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Share2, Check } from "lucide-react";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();
        console.log("Product data from API:", data); // Debug log
        setProduct(data);
        
        // Set default selections
        if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        
        if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
          setSelectedColor(data.colors[0].name);
        }
        
        toast.success("Product loaded!");
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `http://localhost:5000/${cleanPath}`;
  };

  // Get sizes array from product
  const getSizes = () => {
    if (!product?.sizes) return [];
    if (Array.isArray(product.sizes)) return product.sizes;
    return [];
  };

  // Get colors array from product (handles the object structure)
  const getColors = () => {
    if (!product?.colors) return [];
    if (!Array.isArray(product.colors)) return [];
    
    // Map color objects to the format needed for display
    return product.colors.map(color => ({
      name: color.name,
      hex: color.hex || getColorHex(color.name),
      class: getColorClass(color.name)
    }));
  };

  // Helper to get hex color if not provided
  const getColorHex = (colorName) => {
    const hexMap = {
      'white': '#FFFFFF',
      'black': '#000000',
      'navy': '#1B2A5E',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'green': '#10B981',
      'yellow': '#FBBF24',
      'purple': '#8B5CF6',
      'pink': '#EC4899',
      'gray': '#6B7280',
      'grey': '#6B7280',
      'brown': '#92400E',
      'orange': '#F97316'
    };
    return hexMap[colorName.toLowerCase()] || '#9CA3AF';
  };

  const getColorClass = (colorName) => {
    const colorMap = {
      'white': 'bg-white border-2 border-gray-300',
      'black': 'bg-black',
      'navy': 'bg-blue-900',
      'blue': 'bg-blue-600',
      'red': 'bg-red-600',
      'green': 'bg-green-600',
      'yellow': 'bg-yellow-400',
      'purple': 'bg-purple-600',
      'pink': 'bg-pink-500',
      'gray': 'bg-gray-500',
      'grey': 'bg-gray-500',
      'brown': 'bg-amber-800',
      'orange': 'bg-orange-500'
    };
    return colorMap[colorName.toLowerCase()] || 'bg-gray-400';
  };

  const handleAddToCart = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Added to cart!</p>
              <p className="mt-1 text-sm text-gray-500">
                {quantity} × {product?.name}
                {selectedSize && ` (Size: ${selectedSize})`}
                {selectedColor && ` (Color: ${selectedColor})`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
            Close
          </button>
        </div>
      </div>
    ), { duration: 2000 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-3 border-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading masterpiece...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error || "Product not found"}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sizes = getSizes();
  const colors = getColors();
  const productImages = product.image ? [product.image] : [];
  const stock = product.stock || 50;
  const rating = product.rating || 4;
  const reviewCount = product.reviewCount || 128;

  console.log("Processed sizes:", sizes);
  console.log("Processed colors:", colors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Toaster position="top-right" />
      
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Image Gallery Section */}
          <div className="space-y-4">
            <div className="relative group bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-square">
                <img
                  src={getImageUrl(product.image) || "/api/placeholder/600/600"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {product.discount && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.brand && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {product.category}
                </span>
              )}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">({reviewCount} reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                  <span className="text-green-600 font-semibold">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed border-l-4 border-indigo-200 pl-4">
              {product.description}
            </p>

            {/* Size Selection - Now using API data */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Select Size</h3>
                <div className="flex gap-3 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full font-medium transition-all ${
                        selectedSize === size
                          ? "bg-indigo-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection - Now using API data */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Select Color</h3>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedColor === color.name 
                          ? "ring-2 ring-indigo-600 ring-offset-2 scale-110" 
                          : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-10 h-10 rounded-l-full hover:bg-gray-50 text-xl font-medium"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => quantity < stock && setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-r-full hover:bg-gray-50 text-xl font-medium"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">{stock}+ items available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">30-Day Returns</p>
                  <p className="text-xs text-gray-500">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% secure transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
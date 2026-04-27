// ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  ShoppingCart, ArrowLeft, Heart, Minus, Plus, AlertCircle, Check
} from "lucide-react";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        
        setProduct(data);
        setVariants(data.variants || []);
        setCurrentImage(`http://localhost:5000${data.image}`);
        
        // Set default selection
        if (data.variants && data.variants.length > 0) {
          const firstAvailable = data.variants.find(v => v.stock > 0) || data.variants[0];
          setSelectedSize(firstAvailable.size);
          setSelectedColor(firstAvailable.color.name);
          setSelectedVariant(firstAvailable);
          if (firstAvailable.color.image) {
            setCurrentImage(`http://localhost:5000${firstAvailable.color.image}`);
          }
        }
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Update when selection changes
  useEffect(() => {
    if (selectedSize && selectedColor && variants.length > 0) {
      const variant = variants.find(
        v => v.size === selectedSize && v.color.name === selectedColor
      );
      
      if (variant) {
        setSelectedVariant(variant);
        
        // 🔥 REAL-TIME IMAGE CHANGE
        if (variant.color.image) {
          setCurrentImage(`http://localhost:5000${variant.color.image}`);
        } else if (product?.image) {
          setCurrentImage(`http://localhost:5000${product.image}`);
        }
        
        // Reset quantity if stock is less
        if (quantity > variant.stock && variant.stock > 0) {
          setQuantity(1);
        } else if (variant.stock === 0) {
          setQuantity(0);
        }
      }
    }
  }, [selectedSize, selectedColor, variants, product?.image]);

  // Get unique sizes
  const getSizes = () => {
    const sizes = [...new Set(variants.map(v => v.size))];
    const order = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
    return sizes.sort((a, b) => (order[a] || 99) - (order[b] || 99));
  };

  // Get colors for selected size
  const getColorsForSize = (size) => {
    return variants
      .filter(v => v.size === size)
      .map(v => ({
        name: v.color.name,
        hex: v.color.hex,
        stock: v.stock,
        image: v.color.image,
        isAvailable: v.stock > 0
      }));
  };

  // Check if size has any stock
  const isSizeAvailable = (size) => {
    return variants.some(v => v.size === size && v.stock > 0);
  };

  const handleSizeSelect = (size) => {
    if (!isSizeAvailable(size)) return;
    
    setSelectedSize(size);
    
    // Auto-select first available color for this size
    const colorsForSize = getColorsForSize(size);
    const availableColor = colorsForSize.find(c => c.isAvailable);
    if (availableColor) {
      setSelectedColor(availableColor.name);
    } else if (colorsForSize.length > 0) {
      setSelectedColor(colorsForSize[0].name);
    }
  };

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error("Out of stock!");
      return;
    }
    
    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} items available!`);
      return;
    }

    // Get existing cart
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if same variant already in cart
    const existingIndex = cart.findIndex(
      item => item.variantId === selectedVariant._id
    );
    
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > selectedVariant.stock) {
        toast.error(`Cannot add more than ${selectedVariant.stock} items`);
        return;
      }
      cart[existingIndex].quantity = newQty;
    } else {
      cart.push({
        variantId: selectedVariant._id,
        productId: product._id,
        productName: product.name,
        size: selectedVariant.size,
        color: selectedVariant.color.name,
        colorHex: selectedVariant.color.hex,
        price: selectedVariant.price || product.price,
        quantity: quantity,
        image: selectedVariant.color.image || product.image,
        stock: selectedVariant.stock
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`Added ${quantity} × ${product.name} (${selectedSize}, ${selectedColor}) to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sizes = getSizes();
  const currentColors = getColorsForSize(selectedSize);
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Product Image - Real-time update */}
          <div className=" rounded-2xl overflow-hidden w-full h-[86%] shadow-lg sticky top-24">
            <div className="aspect-square">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="text-3xl font-bold text-indigo-600">
              ${(selectedVariant?.price || product.price).toFixed(2)}
            </div>
            <p className="text-gray-600">{product.description}</p>

            {/* SIZE SELECTION - Daraz Style */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Select Size</h3>
              <div className="flex gap-3 flex-wrap">
                {sizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!available}
                      className={`
                        min-w-[60px] h-12 px-4 rounded-lg font-medium border-2 transition-all
                        ${!available && 'opacity-50 cursor-not-allowed bg-gray-100 line-through'}
                        ${available && selectedSize === size 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : available && 'border-gray-200 hover:border-indigo-300'
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLOR SELECTION - With Real-time Image Preview */}
            {selectedSize && currentColors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Select Color</h3>
                <div className="flex gap-4 flex-wrap">
                  {currentColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => color.isAvailable && handleColorSelect(color.name)}
                      disabled={!color.isAvailable}
                      className="group relative"
                    >
                      <div
                        className={`
                          w-14 h-14 rounded-full transition-all shadow-md
                          ${selectedColor === color.name && color.isAvailable
                            ? 'ring-4 ring-indigo-600 ring-offset-2 scale-110' 
                            : 'hover:scale-105'
                          }
                          ${!color.isAvailable && 'opacity-40'}
                        `}
                        style={{ backgroundColor: color.hex }}
                      />
                      {!color.isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-red-500 rotate-45" />
                        </div>
                      )}
                      {selectedColor === color.name && color.isAvailable && (
                        <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <p className="text-center text-xs mt-2 font-medium">{color.name}</p>
                      <p className="text-center text-xs text-gray-500">
                        {color.stock > 0 ? `${color.stock} left` : 'Sold out'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className={`p-4 rounded-lg ${!isOutOfStock ? 'bg-green-50' : 'bg-red-50'}`}>
              {!isOutOfStock ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-semibold">In Stock</span>
                  <span className="text-green-600">| {selectedVariant?.stock} items available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="w-10 h-10 hover:bg-gray-50 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                    <span className="w-16 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => quantity < selectedVariant?.stock && setQuantity(quantity + 1)}
                      className="w-10 h-10 hover:bg-gray-50 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{selectedVariant?.stock} items left</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  !isOutOfStock
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                disabled={isOutOfStock}
                className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all ${
                  !isOutOfStock
                    ? "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
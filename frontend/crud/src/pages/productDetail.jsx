// ProductDetail.jsx - FULLY WORKING WITH DYNAMIC STOCK & DELIVERY MODULES
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  ShoppingCart, ArrowLeft, Heart, Minus, Plus, AlertCircle, Check,
  Truck, Shield, Clock, RotateCcw, MapPin, Calendar, CreditCard
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
  const [deliveryPinCode, setDeliveryPinCode] = useState("");
  const [deliveryCheck, setDeliveryCheck] = useState(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        
        console.log("Fetched product:", data);
        
        setProduct(data);
        
        // Extract variants correctly
        let variantsArray = [];
        if (data.variantsList && Array.isArray(data.variantsList)) {
          variantsArray = data.variantsList;
        } else if (Array.isArray(data.variants)) {
          variantsArray = data.variants;
        } else if (typeof data.variants === 'object' && data.variants !== null) {
          Object.keys(data.variants).forEach(size => {
            variantsArray.push(...data.variants[size]);
          });
        }
        
        console.log("Variants array:", variantsArray);
        setVariants(variantsArray);
        
        const mainImageUrl = `http://localhost:5000${data.image}`;
        setCurrentImage(mainImageUrl);
        
        if (variantsArray.length > 0) {
          const firstAvailable = variantsArray.find(v => v.stock > 0) || variantsArray[0];
          setSelectedSize(firstAvailable.size);
          setSelectedColor(firstAvailable.color.name);
          setSelectedVariant(firstAvailable);
          
          const colorImageUrl = firstAvailable.color?.image 
            ? `http://localhost:5000${firstAvailable.color.image}`
            : mainImageUrl;
          setCurrentImage(colorImageUrl);
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Update when selection changes - REAL TIME IMAGE CHANGE
  useEffect(() => {
    if (selectedSize && selectedColor && variants.length > 0) {
      const variant = variants.find(
        v => v.size === selectedSize && v.color.name === selectedColor
      );
      
      if (variant) {
        setSelectedVariant(variant);
        
        let newImageUrl;
        if (variant.color?.image) {
          newImageUrl = `http://localhost:5000${variant.color.image}`;
        } else if (variant.image) {
          newImageUrl = `http://localhost:5000${variant.image}`;
        } else if (product?.image) {
          newImageUrl = `http://localhost:5000${product.image}`;
        } else {
          newImageUrl = "/api/placeholder/400/400";
        }
        
        setCurrentImage(newImageUrl);
        
        // ✅ FIX: Reset quantity if current quantity exceeds stock
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

  // Get colors for selected size with stock
  const getColorsForSize = (size) => {
    return variants
      .filter(v => v.size === size)
      .map(v => ({
        name: v.color.name,
        hex: v.color.hex,
        stock: v.stock,
        image: v.color?.image || v.image,
        variantId: v._id,
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

  // ✅ UPDATE QUANTITY WITH STOCK CHECK
  const updateQuantity = (newQuantity) => {
    if (!selectedVariant) return;
    
    if (newQuantity < 1) return;
    
    if (newQuantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} items available in stock!`);
      return;
    }
    
    setQuantity(newQuantity);
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

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
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
        price: product.price,
        quantity: quantity,
        image: selectedVariant.color?.image || product.image,
        stock: selectedVariant.stock
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`Added ${quantity} × ${product.name} (${selectedSize}, ${selectedColor}) to cart!`);
    navigate("/cart");
  };

  // ✅ Check delivery availability
  const checkDeliveryAvailability = () => {
    if (!deliveryPinCode || deliveryPinCode.length < 3) {
      toast.error("Please enter a valid PIN code");
      return;
    }
    
    setIsCheckingDelivery(true);
    
    // Simulate API call
    setTimeout(() => {
      // Common Pakistani PIN codes that deliver (demo logic)
      const deliverablePincodes = ['74000', '74400', '75100', '75300', '75500', '54000', '38000', '44000'];
      const isDeliverable = deliverablePincodes.includes(deliveryPinCode);
      
      setDeliveryCheck({
        isDeliverable: isDeliverable,
        message: isDeliverable 
          ? `✓ Delivery available to PIN code ${deliveryPinCode}`
          : `✗ Sorry, delivery not available to PIN code ${deliveryPinCode} yet`,
        estimatedDays: isDeliverable ? '3-5' : null
      });
      setIsCheckingDelivery(false);
    }, 1000);
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
  const availableStock = selectedVariant?.stock || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Product Details</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Product Image */}
          <div className="rounded-2xl overflow-hidden h-[72%] shadow-lg sticky top-24">
            <div className="aspect-square bg-gray-100">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
                onError={(e) => {
                  e.target.src = `http://localhost:5000${product?.image}`;
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="text-3xl font-bold text-indigo-600">
              ${(product.price).toFixed(2)}
            </div>
            <p className="text-gray-600">{product.description}</p>

            {/* SIZE SELECTION */}
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

            {/* COLOR SELECTION */}
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
                        {color.stock} left
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
                  <span className="text-green-600">| {availableStock} items available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* ✅ QUANTITY WITH DYNAMIC STOCK UPDATE */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(quantity - 1)}
                      className="w-10 h-10 hover:bg-gray-100 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                    <span className="w-16 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(quantity + 1)}
                      className="w-10 h-10 hover:bg-gray-100 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {availableStock - quantity} items left after this
                  </span>
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
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
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

                     {/* ✅ BENEFITS MODULE */}
            <div className="border-t pt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Authentic Products</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600">7 Days Return</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Truck className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600">Secure Payments</span>
              </div>
            </div>
          </div>




    
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
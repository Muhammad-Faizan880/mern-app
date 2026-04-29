// frontend/src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../api/axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invalidItems, setInvalidItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    validateAndLoadCart();
  }, []);

  // ✅ Validate cart items with database
  const validateAndLoadCart = async () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      if (cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Get all variant IDs from cart
      const variantIds = cart.map(item => item.variantId);
      
      try {
        // Validate with backend
        const response = await axios.post("/cart/validate", {
          variantIds: variantIds
        });
        
        const validVariantIds = response.data.validVariants;
        const invalidVariantIds = response.data.invalidVariants || [];
        
        // Filter valid items
        const validCart = cart.filter(item => validVariantIds.includes(item.variantId));
        const invalidCartItems = cart.filter(item => invalidVariantIds.includes(item.variantId));
        
        // Update localStorage with valid items only
        if (validCart.length !== cart.length) {
          localStorage.setItem("cart", JSON.stringify(validCart));
          
          // Show warning for removed items
          if (invalidCartItems.length > 0) {
            setInvalidItems(invalidCartItems);
            toast.error(`${invalidCartItems.length} item(s) removed from cart - no longer available`);
          }
        }
        
        setCartItems(validCart);
      } catch (error) {
        // If validation API fails, load cart as is (fallback)
        console.error("Validation API error:", error);
        setCartItems(cart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems[index];
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }
    
    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    
    // Dispatch event for floating button
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    toast.success("Item removed from cart");
    
    // Dispatch event for floating button
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Clear invalid items warning
  const clearInvalidWarning = () => {
    setInvalidItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </button>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {/* Invalid Items Warning */}
        {invalidItems.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">Some items were removed</p>
                <p className="text-sm text-yellow-700">
                  The following items are no longer available and have been removed from your cart:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {invalidItems.map((item, idx) => (
                    <li key={idx}>{item.productName} - {item.size} / {item.color}</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={clearInvalidWarning}
                className="text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <img 
                  src={`http://localhost:5000${item.image}`}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => e.target.src = "/api/placeholder/100/100"}
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.productName}</h3>
                  <p className="text-gray-600 text-sm">
                    Size: <span className="font-medium">{item.size}</span> | 
                    Color: <span className="font-medium">{item.color}</span>
                  </p>
                  <p className="text-indigo-600 font-bold mt-1">${item.price}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{item.stock} left</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 border-b pb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between py-3">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm text-gray-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span className="text-indigo-600">${subtotal.toFixed(2)}</span>
              </div>
              
              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 text-indigo-600 py-2 rounded-lg font-medium hover:text-indigo-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
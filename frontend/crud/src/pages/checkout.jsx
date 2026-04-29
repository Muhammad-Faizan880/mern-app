// frontend/src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowLeft, Truck, CreditCard, MapPin, Phone, Mail, User, 
  DollarSign, Package, Minus, Plus, Trash2, ShieldCheck
} from "lucide-react";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shippingRate, setShippingRate] = useState(5.99); // Fixed shipping rate
  const navigate = useNavigate();

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "PK",
  });

  // Load cart from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/");
    }
    setCartItems(cart);
  }, [navigate]);

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate total with shipping
  const calculateTotal = () => {
    return calculateSubtotal() + (cartItems.length > 0 ? shippingRate : 0);
  };

  // Update quantity
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
  };

  // Remove item from cart
  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    toast.success("Item removed");
    
    if (updated.length === 0) {
      navigate("/");
    }
  };

  // Handle address change
  // const handleAddressChange = (e) => {
  //   setShippingAddress({
  //     ...shippingAddress,
  //     [e.target.name]: e.target.value
  //   });
  // };

  const handleAddressChange = (e) => {
  const { name, value } = e.target;
  setShippingAddress(prev => ({
    ...prev,
    [name]: value
  }));
};

  // Validate form before proceeding to payment
  const validateForm = () => {
    if (!shippingAddress.fullName) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!shippingAddress.email) {
      toast.error("Please enter your email");
      return false;
    }
    if (!shippingAddress.phone) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!shippingAddress.address) {
      toast.error("Please enter your address");
      return false;
    }
    if (!shippingAddress.city) {
      toast.error("Please enter your city");
      return false;
    }
    if (!shippingAddress.zipCode) {
      toast.error("Please enter your zip code");
      return false;
    }
    return true;
  };

  // Proceed to Stripe payment
  const handleProceedToPayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Save shipping address to localStorage for payment page
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
    localStorage.setItem("orderTotal", JSON.stringify(calculateTotal()));
    
    // Navigate to payment page (where Stripe will be integrated)
    navigate("/payment");
  };

  if (cartItems.length === 0) {
    return null;
  }

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate("/cart")} 
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="John Doe"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                      placeholder="Street Address"
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="Karachi"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="Sindh"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    placeholder="74000"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    placeholder="PK"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div> */}

                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Country
  </label>
  <select
    name="country"
    value={shippingAddress.country}
    onChange={handleAddressChange}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
  >
    <option value="PK">Pakistan</option>
    <option value="US">United States</option>
    <option value="GB">United Kingdom</option>
    <option value="CA">Canada</option>
    <option value="AU">Australia</option>
    <option value="IN">India</option>
    <option value="AE">United Arab Emirates</option>
  </select>
</div>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Stripe</span>
                  </div>
                  <div>
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-600 ml-auto" />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2 text-xs text-gray-500">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-6" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/American_Express_logo_%282018%29.svg/1280px-American_Express_logo_%282018%29.svg.png" className="h-6" alt="Amex" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b">
                    <img 
                      src={`http://localhost:5000${item.image}`}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => e.target.src = "/api/placeholder/64/64"}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Shipping (Standard)</span>
                  </div>
                  <span>${shippingRate.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Including all taxes and fees
                  </p>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={loading || cartItems.length === 0}
                className={`
                  w-full mt-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2
                  transition-all duration-200
                  ${!loading && cartItems.length > 0
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Proceed to Payment - ${total.toFixed(2)}
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
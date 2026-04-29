// frontend/src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home, Printer, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState({
    paymentIntent: null,
    cartItems: [],
    total: 0
  });

  useEffect(() => {
    const state = location.state;
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const savedTotal = JSON.parse(localStorage.getItem("orderTotal") || "0");
    
    if (state) {
      setOrderDetails({
        paymentIntent: state.paymentIntent,
        cartItems: state.cartItems || savedCart,
        total: state.total || savedTotal
      });
    } else {
      setOrderDetails({
        paymentIntent: null,
        cartItems: savedCart,
        total: savedTotal
      });
    }
    
    localStorage.removeItem("cart");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("orderTotal");
    
    toast.success("Order placed successfully!");
  }, [location]);

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const generateOrderNumber = () => {
    return "ORD-" + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const orderNumber = generateOrderNumber();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate()}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Order Information</h2>
                  <p className="text-sm text-gray-500">Order #{orderNumber}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Paid
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-3">
                {orderDetails.cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-3 border-b last:border-0">
                    <img 
                      src={`http://localhost:5000${item.image}`}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => e.target.src = "/api/placeholder/80/80"}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-indigo-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid</span>
                  <span className="text-indigo-600">${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
                
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ IMPORTANT: Default export at the end
export default PaymentSuccess;
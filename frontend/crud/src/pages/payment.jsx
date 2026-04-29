import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";

// Initialize Stripe outside component
let stripePromise;
const getStripePromise = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error("Stripe publishable key is missing!");
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Card Element Styles
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "10px",
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

// Payment Form Component
const PaymentForm = ({ clientSecret, cartItems, shippingAddress, total, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    console.log("Stripe available:", !!stripe);
    console.log("Elements available:", !!elements);
    console.log("Client secret:", !!clientSecret);
  }, [stripe, elements, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      toast.error("Stripe not loaded yet. Please wait.");
      return;
    }

    if (!cardComplete) {
      toast.error("Please fill complete card details");
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.zipCode,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error(error.message);
        onError?.(error);
        setIsLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Save order
        try {
          const token = localStorage.getItem("token");
          await axios.post("/orders", {
            items: cartItems,
            shippingAddress,
            paymentIntentId: paymentIntent.id,
            totalAmount: total,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Clear cart
          localStorage.removeItem("cart");
          localStorage.removeItem("shippingAddress");
          localStorage.removeItem("orderTotal");
          
          toast.success("Payment successful!");
          onSuccess(paymentIntent);
        } catch (err) {
          console.error("Order save error:", err);
          toast.error("Payment succeeded but order save failed");
          onSuccess(paymentIntent);
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              setCardError(e.error?.message);
            }}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-xs mt-2">{cardError}</p>
        )}
        
        {/* Test Card Info - Just as hint, not hardcoded */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-1">💳 Test Card (for testing only)</p>
          <p className="text-xs text-blue-700">Number: 4242 4242 4242 4242</p>
          <p className="text-xs text-blue-700">Expiry: Any future date (12/34)</p>
          <p className="text-xs text-blue-700">CVC: Any 3 digits (123)</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !cardComplete || isLoading || !clientSecret}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2
          transition-all duration-200
          ${stripe && cardComplete && !isLoading && clientSecret
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {!stripe ? (
          "Loading Stripe..."
        ) : isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing Payment...
          </>
        ) : !clientSecret ? (
          "Initializing..."
        ) : !cardComplete ? (
          "Enter Card Details"
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${total.toFixed(2)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </form>
  );
};

// Main Payment Component
function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      // Load cart data
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const address = JSON.parse(localStorage.getItem("shippingAddress") || "{}");
      const orderTotal = JSON.parse(localStorage.getItem("orderTotal") || "0");

      if (cart.length === 0) {
        toast.error("No items in cart!");
        navigate("/cart");
        return;
      }

      if (!address.fullName) {
        toast.error("Shipping address not found!");
        navigate("/checkout");
        return;
      }

      setCartItems(cart);
      setShippingAddress(address);
      setTotal(orderTotal);

      // Initialize Stripe
      const stripe = await getStripePromise();
      if (stripe) {
        setStripeInitialized(true);
      } else {
        toast.error("Failed to load Stripe");
      }

      // Create payment intent
      await createPaymentIntent(cart, address);
    };

    initialize();
  }, [navigate]);

const createPaymentIntent = async (items, address) => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    // ✅ FIX: Ensure country is 2-letter code for Stripe
    const cleanAddress = {
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: "PK",  // Force PK (Pakistan's ISO code)
    };

    console.log("Sending address to Stripe:", cleanAddress); // Debug

    const response = await axios.post("/payments/create-payment-intent", {
      items: items.map(item => ({
        variantId: item.variantId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      shippingAddress: cleanAddress,
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    setClientSecret(response.data.clientSecret);
  } catch (error) {
    console.error("Payment intent error:", error);
    toast.error(error.response?.data?.message || "Failed to initialize payment");
    navigate("/checkout");
  } finally {
    setLoading(false);
  }
};

  const handlePaymentSuccess = (paymentIntent) => {
    navigate("/payment-success", { 
      state: { 
        paymentIntent,
        cartItems,
        total 
      } 
    });
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  const stripePromiseValue = getStripePromise();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto px-4">
        <button 
          onClick={() => navigate("/checkout")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Checkout
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">Payment Details</h2>
              </div>
              
              {clientSecret && stripePromiseValue ? (
                <Elements stripe={stripePromiseValue} options={{ clientSecret }}>
                  <PaymentForm 
                    clientSecret={clientSecret}
                    cartItems={cartItems}
                    shippingAddress={shippingAddress}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Setting up secure payment...</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b">
                    <div>
                      <p className="font-semibold text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
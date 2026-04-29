// components/FloatingCartButton.jsx
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateAndUpdateCartCount();
    
    // Listen for cart updates
    window.addEventListener("storage", validateAndUpdateCartCount);
    window.addEventListener("cartUpdated", validateAndUpdateCartCount);
    
    return () => {
      window.removeEventListener("storage", validateAndUpdateCartCount);
      window.removeEventListener("cartUpdated", validateAndUpdateCartCount);
    };
  }, []);

  const validateAndUpdateCartCount = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      if (cart.length === 0) {
        setItemCount(0);
        setLoading(false);
        return;
      }

      // Validate with backend
      const variantIds = cart.map(item => item.variantId);
      
      try {
        const response = await axios.post("/api/cart/validate", {
          variantIds: variantIds
        });
        
        const validVariantIds = response.data.validVariants;
        
        // Filter valid items and calculate count
        const validCart = cart.filter(item => validVariantIds.includes(item.variantId));
        const count = validCart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update localStorage if invalid items found
        if (validCart.length !== cart.length) {
          localStorage.setItem("cart", JSON.stringify(validCart));
        }
        
        setItemCount(count);
      } catch (error) {
        // If API fails, show count without validation
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setItemCount(count);
      }
    } catch (error) {
      console.error("Error validating cart:", error);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (itemCount === 0) return null;

  return (
    <button
      onClick={() => navigate("/cart")}
      className="fixed top-[8px] right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
    >
      <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ">
        {itemCount}
      </span>
    </button>
  );
};

export default FloatingCartButton;
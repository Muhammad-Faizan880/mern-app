import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/landing";
import AddEditProduct from "./pages/addEditProduct";
import ProductDetail from "./pages/productDetail";
import EditPage from "./pages/editPage";
import Login from "./auth/login";
import Signup from "./auth/register";
import ProtectedRoute from "./routes/protectedRoutes";
import Otp from "./auth/otp";
import Chat from "./pages/chat";
import Cart from "./pages/cart";           
import Checkout from "./pages/Checkout";   
import Payment from "./pages/Payment";     
import PaymentSuccess from "./pages/PaymentSuccess";
import FloatingCartButton from "./components/floatingCartButton"; 

// token check helper
const isAuth = () => {
  return localStorage.getItem("token");
};

// Public Route Guard
const PublicRoute = ({ children }) => {
  if (isAuth()) {
    return <Navigate to="/" replace />;  
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (blocked if logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/otp"
          element={
            <PublicRoute>
              <Otp />
            </PublicRoute>
          }
        />

        {/* 🔐 Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add"
          element={
            <ProtectedRoute adminOnly={true}>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/productDetail/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editPage/:id"
          element={
            <ProtectedRoute adminOnly={true}>
              <EditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* 🛒 Cart & Checkout Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* ✅ FloatingCartButton - Shows on all pages when user is logged in */}
      <FloatingCartButton />
    </BrowserRouter>
  );
}

export default App;
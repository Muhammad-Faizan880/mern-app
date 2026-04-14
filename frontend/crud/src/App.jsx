import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/landing";
import AddEditProduct from "./pages/addEditProduct";
import EditPage from "./pages/editPage";
import Login from "./auth/login";
import Signup from "./auth/register";
import ProtectedRoute from "./routes/protectedRoutes";
import Otp from "./auth/otp";

// token check helper
const isAuth = () => {
  return localStorage.getItem("token");
};

// Public Route Guard (IMPORTANT FIX)
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
        {/* 🚫 Public Routes (blocked if logged in) */}
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
            <ProtectedRoute>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <AddEditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editPage/:id"
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

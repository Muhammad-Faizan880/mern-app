import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("API RESPONSE:>>>>>", data);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
     if (res.ok) {
  login(data.token);
  localStorage.setItem("token", data.token);
  toast.success("Login successful");
  navigate("/");
} else {
        console.log("Login failed:", data);
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server not responding");
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl">
          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Welcome Back 👋
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 py-3 rounded-lg text-white font-semibold"
            >
              Login
            </button>
          </form>

          {/* Extra links */}
          <p className="text-gray-400 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register">
              <span className="text-blue-500 cursor-pointer hover:underline">
                Signup
              </span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleVerify = async () => {
    const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("OTP verified");
      navigate("/login");
    } else {
      toast.error(data.message);
    }
  };

  return (
    <>
      <Toaster />
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
  <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">

    <h1 className="text-2xl font-semibold text-white mb-2">
      Verify OTP
    </h1>

    <p className="text-gray-400 text-sm mb-6">
      Enter the 6-digit code sent to your email
    </p>

    <input
      type="text"
      maxLength={6}
      value={otp}
      onChange={(e) => setOtp(e.target.value.trim())}
      placeholder="------"
      className="w-full text-center tracking-[10px] text-xl bg-gray-800 border border-gray-600 text-white rounded-lg py-3 mb-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
    />

    <button
      onClick={handleVerify}
      className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-3 rounded-lg shadow-md"
    >
      Verify OTP
    </button>

    <p className="text-gray-500 text-xs mt-4">
      Didn’t receive code? <span className="text-blue-400 cursor-pointer">Resend</span>
    </p>

  </div>
</div>
    </>
  );
};

export default Otp;
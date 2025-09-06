import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/use-toast"; // Assuming this is your toast notification system

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp } = useAuth(); // Assuming useAuth provides verifyOtp
  const { toast } = useToast(); // For displaying notifications
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast({ variant: "destructive", title: "Missing OTP", description: "Please enter the OTP." });
      return;
    }

    setIsLoading(true);
    const result = await verifyOtp(otp); // Call your OTP verification function
    setIsLoading(false);

    if (result.success) {
      toast({ title: "OTP Verified", description: "Signed in successfully." });
      navigate("/dashboard"); // Redirect to dashboard on success
    } else {
      toast({ variant: "destructive", title: "Invalid OTP", description: result.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements - adapted for skin tone theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-lg border border-white/30 animate-fade-in">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-300 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-lg">
            🔐
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-4">
            Verify Your Account
          </h2>
          <p className="mt-2 text-md text-gray-800">
            Welcome to our blogging platform! We're thrilled to have you join our community.
          </p>
          <p className="mt-4 text-sm text-gray-700">
            Enter the One-Time Password (OTP) sent to your email to verify your account and unlock a world of creative possibilities. Share your ideas, connect with readers, and build your online presence.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            If you haven't received the OTP, please check your spam folder or request a new one from your account settings.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              OTP *
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your 6-digit OTP"
              required
              maxLength={6}
              className="mt-1 block w-full rounded-xl border-0 bg-pink-50 focus:bg-white p-4 text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-rose-300 shadow-inner placeholder:text-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 hover:shadow-lg hover:-translate-y-1 shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Verifying...
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { SIGNUP_BG_IMAGES } from "../constants"; // Import from constants

// Use first 3 images from SIGNUP_BG_IMAGES
const VERIFICATION_BG_IMAGES = SIGNUP_BG_IMAGES.slice(0, 3);

function AccountVerificationPage() {
  const [current, setCurrent] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5); // Changed from 60 to 5 seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputs = useRef([]);
  
  // Use refs to track if verification code has been generated
  const verificationCodeGeneratedRef = useRef(false);
  const initialLoadRef = useRef(true);

  const { verifyAccount, generateVerificationOTP, setUser, loginData } = useUserStore();
  const userId = location.state?.userId || loginData?.userId;
  const userEmail = location.state?.email || loginData?.email;
  const fromLogin = location.state?.fromLogin || loginData?.fromLogin;

  // Generate verification code function
  const generateVerificationCode = useCallback(() => {
    if (userId && !verificationCodeGeneratedRef.current) {
      const result = generateVerificationOTP(userId);
      if (result.success) {
        toast.success(`Verification code sent: ${result.otp}`);
        verificationCodeGeneratedRef.current = true;
      }
    } else if (!userId) {
      toast.error("No user ID found. Please try signing up again.");
      setTimeout(() => navigate("/signup"), 2000);
    }
  }, [userId, generateVerificationOTP, navigate]);

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (VERIFICATION_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % VERIFICATION_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate verification code on initial load only
  useEffect(() => {
    // Reset refs when component mounts (for new verification)
    if (initialLoadRef.current) {
      verificationCodeGeneratedRef.current = false;
      initialLoadRef.current = false;
      generateVerificationCode();
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generateVerificationCode]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      
      otpInputs.current[3]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join("");
    
    if (otpString.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      setLoading(false);
      return;
    }

    const result = verifyAccount(userId, otpString);
    
    if (result.success) {
      toast.success("Account verified successfully!");
      setUser(result.user);
      
      // Redirect based on user role and source
      setTimeout(() => {
        if (fromLogin) {
          navigate("/dashboard");
        } else {
          // New signup
          if (result.user.role === 'importer' || result.user.role === 'exporter') {
            navigate("/dashboard");
          } else if (result.user.role === 'verifier' || result.user.role === 'freight agent') {
            navigate("/dashboard");
          }
        }
      }, 1500);
    } else {
      toast.error(result.message || "Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    const result = generateVerificationOTP(userId);
    if (result.success) {
      setCountdown(5); // Reset to 5 seconds
      setCanResend(false);
      toast.success(`New verification code sent: ${result.otp}`);
    }
  };

  const handleBack = () => {
    if (fromLogin) {
      navigate("/login");
    } else {
      navigate("/signup");
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images from SIGNUP_BG_IMAGES */}
      {VERIFICATION_BG_IMAGES.map(({ src, alt }, i) => (
        <div
          key={i}
          aria-label={alt}
          role="img"
          className={`
            absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out
            ${i === current ? "opacity-100" : "opacity-0"}
          `}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Semi-transparent green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/50 to-green-600/50" />

      {/* Glass-effect form container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 z-10
                      bg-white/20 backdrop-blur-sm
                      rounded-2xl shadow-lg"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-green-100 hover:text-white mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify Your Account
          </h1>
          <p className="text-green-100">
            We've sent a 4-digit verification code to
          </p>
          <div className="flex items-center justify-center mt-2">
            <FaEnvelope className="text-green-300 mr-2" />
            <span className="font-semibold text-white">{userEmail}</span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Enter verification code
            </label>
            
            <div 
              className="flex justify-center gap-3"
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 text-center text-2xl font-bold bg-white/30 border-2 border-green-300 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50"
                  autoFocus={index === 0}
                  placeholder="0"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-green-100 text-sm">
                Didn't receive code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`font-medium ${
                    canResend
                      ? "text-white hover:text-green-300"
                      : "text-green-300/70 cursor-not-allowed"
                  }`}
                >
                  {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
                </button>
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 4}
            className="w-full py-3 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/50"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          {/* Alternative */}
          <div className="text-center">
            <p className="text-green-100 text-sm">
              Having trouble?{" "}
              <Link to="/contact" className="text-white hover:text-green-300 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-green-100">
          © {new Date().getFullYear()} TraceRx. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AccountVerificationPage;
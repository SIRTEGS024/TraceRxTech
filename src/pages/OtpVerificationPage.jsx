// OtpVerificationPage.js - UPDATED with shared background images

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";
import { FaArrowLeft, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { LOGIN_BG_IMAGES } from "../constants"; // Import from constants

// Use first 3 images from LOGIN_BG_IMAGES
const OTP_BG_IMAGES = LOGIN_BG_IMAGES.slice(0, 3);

function OtpVerificationPage() {
  const [current, setCurrent] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputs = useRef([]);
  
  const otpGeneratedRef = useRef(false);
  const initialLoadRef = useRef(true);

  const { verifyLoginOTP, generateLoginOTP, setUser, loginData, clearLoginData, loginForCompany } = useUserStore();
  const userId = location.state?.userId || loginData?.userId;
  const userEmail = location.state?.email || loginData?.email;
  const companyData = location.state?.companyData || loginData?.companyData;

  // Generate OTP function
  const generateOtp = useCallback(() => {
    if (userId && !otpGeneratedRef.current) {
      const result = generateLoginOTP(userId);
      if (result.success) {
        toast.success(`OTP sent to your email: ${result.otp}`);
        otpGeneratedRef.current = true;
      }
    } else if (!userId) {
      toast.error("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [userId, generateLoginOTP, navigate]);

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (OTP_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % OTP_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate OTP on initial load only
  useEffect(() => {
    if (initialLoadRef.current) {
      otpGeneratedRef.current = false;
      initialLoadRef.current = false;
      generateOtp();
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
  }, [generateOtp]);

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

    const result = verifyLoginOTP(userId, otpString);
    
    if (result.success) {
      toast.success("OTP verified successfully!");
      
      // Handle company login properly
      if (companyData) {
        // Get company and access information
        const companyLoginResult = loginForCompany(
          userId, 
          companyData.companyRole, 
          companyData.traceRxId
        );
        
        if (companyLoginResult.success) {
          // IMPORTANT: Set user with company information INCLUDING access tabs
          console.log("DEBUG: Setting user with access tabs:", companyLoginResult.accessTabs);
          setUser(result.user, companyLoginResult.company, companyLoginResult.accessTabs);
        } else {
          toast.error(companyLoginResult.message);
          setLoading(false);
          return;
        }
      } else {
        // Regular login (not for a company)
        setUser(result.user);
      }
      
      clearLoginData();
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      toast.error(result.message || "Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    const result = generateLoginOTP(userId);
    if (result.success) {
      setCountdown(5);
      setCanResend(false);
      toast.success(`New OTP sent: ${result.otp}`);
    }
  };

  const handleBack = () => {
    navigate("/login");
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
      {/* Background images from LOGIN_BG_IMAGES */}
      {OTP_BG_IMAGES.map(({ src, alt }, i) => (
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
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify Your Identity
          </h1>
          <p className="text-green-100">
            We've sent a 4-digit OTP to
          </p>
          <div className="flex items-center justify-center mt-2">
            <FaEnvelope className="text-green-300 mr-2" />
            <span className="font-semibold text-white">{userEmail}</span>
          </div>
          {companyData && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg border border-green-300">
              <p className="text-sm text-white">
                Logging in as agent for: <span className="font-semibold">
                  {companyData.companyRole === 'exporter' ? 'Exporter' : 'Importer'} Company
                </span>
                <br />
                <span className="text-xs">TraceRx ID: {companyData.traceRxId}</span>
              </p>
            </div>
          )}
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Enter OTP code
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
                Didn't receive OTP?{" "}
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
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-green-100">
            For security reasons, this OTP will expire in 10 minutes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default OtpVerificationPage;
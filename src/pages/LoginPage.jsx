// src/pages/LoginPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaLock, FaEnvelope, FaShippingFast, FaCheckCircle, FaBox, FaTruck, FaChevronDown, FaUser, FaClipboardCheck } from "react-icons/fa";
import ReusableInput from "../components/ReusableInput";
import { LOGIN_BG_IMAGES } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LoginPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1); // 1: Email/Password, 2: OTP Verification
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // New state for role selection
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Available roles (same as signup)
  const roles = [
    {
      id: "importer",
      name: "Importer",
      icon: FaBox,
      description: "Import goods into the country",
      color: "bg-blue-500"
    },
    {
      id: "exporter",
      name: "Exporter",
      icon: FaShippingFast,
      description: "Export goods from the country",
      color: "bg-green-500"
    },
    {
      id: "freight_agent",
      name: "Freight Agent",
      icon: FaTruck,
      description: "Handle logistics and transportation",
      color: "bg-purple-500"
    },
    {
      id: "verifier_auditor_mda",
      name: "Verifier/Auditor/MDA",
      icon: FaClipboardCheck,
      description: "Verify, audit and regulate shipments",
      color: "bg-orange-500"
    }
  ];

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (LOGIN_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % LOGIN_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRoleDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown]);

  const handleLoginStage1 = (e) => {
    e.preventDefault();
    
    // Validate role selection
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      // For demo purposes, check if email is provided
      const formData = new FormData(e.target);
      const userEmail = formData.get("email");

      if (!userEmail) {
        toast.error("Please enter your email");
        return;
      }

      setEmail(userEmail);
      toast.success(`OTP sent to your email for ${roles.find(r => r.id === selectedRole)?.name} account!`);

      // Generate random OTP for demo
      const demoOtp = Math.floor(1000 + Math.random() * 9000);
      toast.info(`Demo OTP: ${demoOtp} (For testing purposes)`);

      setStage(2);
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);

      // Check if all OTP fields are filled
      const isOtpComplete = otp.every(digit => digit !== "");

      if (!isOtpComplete) {
        toast.error("Please enter the complete 4-digit OTP");
        return;
      }

      const selectedRoleName = roles.find(r => r.id === selectedRole)?.name;
      toast.success(`Login successful as ${selectedRoleName}! Redirecting to dashboard...`);

      // Redirect to dashboard after delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }, 1000);
  };

  const handleBack = () => {
    setStage(1);
    setOtp(["", "", "", ""]);
  };

  const handleResendOtp = () => {
    // Generate new random OTP for demo
    const demoOtp = Math.floor(1000 + Math.random() * 9000);
    toast.info(`New OTP sent: ${demoOtp} (For testing purposes)`);
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowRoleDropdown(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      {LOGIN_BG_IMAGES.map(({ src, alt }, i) => (
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
      <div
        className="relative w-full max-w-md p-8 z-10
                      bg-white/20 backdrop-blur-sm
                      rounded-2xl shadow-lg"
      >
        {/* Progress indicator for login stages */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${stage >= 1 ? "bg-green-600 text-white" : "bg-white/30 text-green-100"
                }`}>
                1
              </div>
              <div className={`w-16 h-1 ${stage > 1 ? "bg-green-600" : "bg-white/30"}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${stage >= 2 ? "bg-green-600 text-white" : "bg-white/30 text-green-100"
                }`}>
                2
              </div>
            </div>
            <div className="ml-4 text-green-100 text-sm font-medium">
              {stage === 1 && "Enter Credentials"}
              {stage === 2 && "Verify OTP"}
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-green-100 mb-6 text-center">
          {stage === 1 ? "Welcome Back" : "Verify Your Identity"}
        </h2>

        {/* Stage 1: Email and Password */}
        {stage === 1 && (
          <form onSubmit={handleLoginStage1} className="space-y-5">
            {/* Role Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100">
                Select Your Role *
              </label>
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => {
                    setShowRoleDropdown(!showRoleDropdown);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="flex items-center gap-3">
                    <FaUser className="text-green-300" />
                    {selectedRole 
                      ? roles.find(r => r.id === selectedRole)?.name 
                      : "Select your role"}
                  </span>
                  <FaChevronDown className={`text-green-300 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Role Dropdown */}
                {showRoleDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-20 w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg"
                  >
                    <div className="overflow-y-auto max-h-60">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event from bubbling up
                              handleRoleSelect(role.id);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 ${selectedRole === role.id ? "bg-green-100 font-medium" : ""
                              }`}
                          >
                            <div className={`p-2 rounded-full ${role.color}`}>
                              <Icon className="text-white text-sm" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800">{role.name}</div>
                              <div className="text-xs text-gray-600">{role.description}</div>
                            </div>
                            {selectedRole === role.id && (
                              <FaCheckCircle className="text-green-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {!selectedRole && (
                <p className="text-sm text-yellow-300 italic">Please select your role to continue</p>
              )}
            </div>

            <ReusableInput
              id="email"
              name="email"
              placeholder="Email Address"
              icon={FaEnvelope}
              variant="black"
            />
            <ReusableInput
              id="password"
              name="password"
              placeholder="Password"
              icon={FaLock}
              variant="black"
              type="password"
            />
            
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
              disabled={loading || !selectedRole}
            >
              {loading ? "Sending OTP..." : "Login & Get OTP"}
            </button>
          </form>
        )}

        {/* Stage 2: OTP Verification */}
        {stage === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            {/* Display selected role */}
            <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-300">
              <div className="flex items-center gap-3">
                {selectedRole && (
                  <>
                    <div className={`p-2 rounded-full ${roles.find(r => r.id === selectedRole)?.color}`}>
                      {(() => {
                        const RoleIcon = roles.find(r => r.id === selectedRole)?.icon;
                        return <RoleIcon className="text-white text-sm" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-semibold">
                        Logging in as: {roles.find(r => r.id === selectedRole)?.name}
                      </p>
                      <p className="text-green-200 text-xs">
                        {roles.find(r => r.id === selectedRole)?.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-green-100 text-center">
              We've sent a 4-digit OTP to <span className="font-semibold">{email || "your email"}</span>.
              Enter it below to continue.
            </p>

            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-white/20 border border-green-300 rounded-lg text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-green-200 hover:text-green-300 text-sm font-medium"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-green-200 hover:text-green-300 text-sm font-medium"
              >
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {/* Sign up link (only show in stage 1) */}
        {stage === 1 && (
          <p className="mt-4 text-center text-sm text-green-200">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        )}

        {/* Demo note */}
        <p className="mt-2 text-center text-xs text-green-100 italic">
          Demo: No actual authentication. Check toast for OTP.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
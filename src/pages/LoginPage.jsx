import React, { useState, useEffect, useRef } from "react";
import { FaLock, FaEnvelope, FaShippingFast, FaCheckCircle, FaBox, FaTruck, FaChevronDown, FaUser, FaClipboardCheck, FaBuilding, FaIdCard, FaEye, FaEyeSlash } from "react-icons/fa";
import { LOGIN_BG_IMAGES } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";

function LoginPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loginForCompany, setLoginForCompany] = useState(false);
  const [companyRole, setCompanyRole] = useState("");
  const [traceRxId, setTraceRxId] = useState("");
  const [showCompanyRoleDropdown, setShowCompanyRoleDropdown] = useState(false);
  const [companyVerified, setCompanyVerified] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [verifyingCompany, setVerifyingCompany] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const companyRoleRef = useRef(null);
  const companyButtonRef = useRef(null);

  const { login, loginForCompany: storeLoginForCompany, setLoginData } = useUserStore();

  // Available roles
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
      id: "freight agent",
      name: "Freight Agent",
      icon: FaTruck,
      description: "Handle logistics and transportation",
      color: "bg-purple-500"
    },
    {
      id: "verifier",
      name: "Verifier/Auditor/MDA",
      icon: FaClipboardCheck,
      description: "Verify, audit and regulate shipments",
      color: "bg-orange-500"
    }
  ];

  // Company roles (for agents to select)
  const companyRoles = [
    {
      id: "exporter",
      name: "Exporter",
      icon: FaShippingFast,
      description: "Export company",
      color: "bg-green-500"
    },
    {
      id: "importer",
      name: "Importer",
      icon: FaBox,
      description: "Import company",
      color: "bg-blue-500"
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
      
      if (showCompanyRoleDropdown &&
        companyRoleRef.current &&
        !companyRoleRef.current.contains(event.target) &&
        companyButtonRef.current &&
        !companyButtonRef.current.contains(event.target)) {
        setShowCompanyRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown, showCompanyRoleDropdown]);

  const verifyCompanyAccess = () => {
    if (!companyRole || !traceRxId) {
      toast.error("Please select company type and enter TraceRx ID");
      return;
    }
    
    setVerifyingCompany(true);
    
    // In a real app, this would be an API call
    // For now, we'll simulate verification with the store
    setTimeout(() => {
      // Try to login first to get user ID
      const user = login(email, password, selectedRole);
      
      if (!user) {
        toast.error("Please enter correct credentials first");
        setVerifyingCompany(false);
        return;
      }
      
      // Check company access
      const result = storeLoginForCompany(user.id, companyRole, traceRxId);
      
      if (result.success) {
        setCompanyVerified(true);
        setCompanyInfo({
          name: result.company.basicInfo.companyName,
          traceRxId: result.company.traceRxId,
          country: result.company.basicInfo.country,
          accessTabs: result.accessTabs
        });
        toast.success(`Access verified for ${result.company.basicInfo.companyName}`);
      } else {
        toast.error(result.message);
        setCompanyVerified(false);
        setCompanyInfo(null);
      }
      
      setVerifyingCompany(false);
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate inputs
    if (!selectedRole) {
      toast.error("Please select your role");
      setLoading(false);
      return;
    }

    if (!email || !password) {
      toast.error("Please enter both email and password");
      setLoading(false);
      return;
    }

    // Check if agent wants to login for company
    if ((selectedRole === 'verifier' || selectedRole === 'freight agent') && loginForCompany) {
      if (!companyRole) {
        toast.error("Please select company type");
        setLoading(false);
        return;
      }
      
      if (!traceRxId) {
        toast.error("Please enter TraceRx identification number");
        setLoading(false);
        return;
      }
      
      if (!companyVerified) {
        toast.error("Please verify company access first by clicking 'Verify Access'");
        setLoading(false);
        return;
      }
    }

    // Try to login
    const user = login(email, password, selectedRole);

    if (user) {
      // Check if user is verified
      if (!user.isVerified) {
        // User needs to verify account first
        setLoginData({
          userId: user.id,
          email: email,
          fromLogin: true
        });
        
        // Redirect to account verification
        navigate("/verify-account", {
          state: {
            userId: user.id,
            email: email,
            fromLogin: true
          }
        });
        setLoading(false);
        return;
      }
      
      // Check if agent wants to login for company
      if ((selectedRole === 'verifier' || selectedRole === 'freight agent') && loginForCompany) {
        // Store company data for OTP verification
        setLoginData({
          userId: user.id,
          email: email,
          companyData: {
            companyRole,
            traceRxId
          }
        });
        
        navigate("/verify-otp", {
          state: {
            userId: user.id,
            email: email,
            companyData: {
              companyRole,
              traceRxId
            }
          }
        });
      } else {
        // Regular login - go to OTP verification
        setLoginData({
          userId: user.id,
          email: email
        });
        
        navigate("/verify-otp", {
          state: {
            userId: user.id,
            email: email
          }
        });
      }
    } else {
      toast.error("Invalid email, password, or role. Please check your credentials.");
    }
    
    setLoading(false);
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowRoleDropdown(false);
    // Reset company verification if role changes
    if (roleId !== 'verifier' && roleId !== 'freight agent') {
      setLoginForCompany(false);
      setCompanyVerified(false);
      setCompanyInfo(null);
    }
  };

  const handleCompanyRoleSelect = (roleId) => {
    setCompanyRole(roleId);
    setShowCompanyRoleDropdown(false);
    // Reset verification when company role changes
    setCompanyVerified(false);
    setCompanyInfo(null);
  };

  const handleTraceRxIdChange = (value) => {
    setTraceRxId(value);
    // Reset verification when TraceRx ID changes
    setCompanyVerified(false);
    setCompanyInfo(null);
  };

  const getLicenseLabel = () => {
    if (companyRole === 'exporter') {
      return "TraceRx Identification Number (Exporter) *";
    } else if (companyRole === 'importer') {
      return "TraceRx Identification Number (Importer) *";
    }
    return "TraceRx Identification Number *";
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
        <h2 className="text-3xl font-bold text-green-100 mb-6 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
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
                            e.stopPropagation();
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-green-100">
              Email Address *
            </label>
            <div className="relative">
              <div className="flex items-center">
                <div className="absolute left-3 text-green-300">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-green-100">
              Password *
            </label>
            <div className="relative">
              <div className="flex items-center">
                <div className="absolute left-3 text-green-300">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-green-300 hover:text-green-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Company Login for Agents */}
          {(selectedRole === 'verifier' || selectedRole === 'freight agent') && (
            <div className="space-y-4 p-4 bg-white/10 rounded-lg border border-green-300">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-green-100">
                  <input
                    type="checkbox"
                    checked={loginForCompany}
                    onChange={(e) => {
                      setLoginForCompany(e.target.checked);
                      if (!e.target.checked) {
                        setCompanyVerified(false);
                        setCompanyInfo(null);
                      }
                    }}
                    className="mr-2"
                  />
                  Login on behalf of a company
                </label>
              </div>
              
              {loginForCompany && (
                <div className="space-y-4">
                  {/* Company Type Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-green-100">
                      Company Type *
                    </label>
                    <div className="relative">
                      <button
                        ref={companyButtonRef}
                        type="button"
                        onClick={() => {
                          setShowCompanyRoleDropdown(!showCompanyRoleDropdown);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <span className="flex items-center gap-3">
                          <FaBuilding className="text-green-300" />
                          {companyRole 
                            ? companyRoles.find(r => r.id === companyRole)?.name 
                            : "Select company type"}
                        </span>
                        <FaChevronDown className={`text-green-300 transition-transform ${showCompanyRoleDropdown ? "rotate-180" : ""}`} />
                      </button>

                      {/* Company Role Dropdown */}
                      {showCompanyRoleDropdown && (
                        <div
                          ref={companyRoleRef}
                          className="absolute z-20 w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg"
                        >
                          <div className="overflow-y-auto max-h-60">
                            {companyRoles.map((role) => {
                              const Icon = role.icon;
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompanyRoleSelect(role.id);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 ${companyRole === role.id ? "bg-green-100 font-medium" : ""
                                    }`}
                                >
                                  <div className={`p-2 rounded-full ${role.color}`}>
                                    <Icon className="text-white text-sm" />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-800">{role.name}</div>
                                    <div className="text-xs text-gray-600">{role.description}</div>
                                  </div>
                                  {companyRole === role.id && (
                                    <FaCheckCircle className="text-green-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {!companyRole && (
                      <p className="text-sm text-yellow-300 italic">Please select company type</p>
                    )}
                  </div>

                  {/* TraceRx ID Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-green-100">
                      {getLicenseLabel()}
                    </label>
                    <div className="relative">
                      <div className="flex items-center">
                        <div className="absolute left-3 text-green-300">
                          <FaIdCard />
                        </div>
                        <input
                          type="text"
                          value={traceRxId}
                          onChange={(e) => handleTraceRxIdChange(e.target.value)}
                          placeholder={companyRole === 'exporter' ? "Enter exporter TraceRx ID" : 
                                    companyRole === 'importer' ? "Enter importer TraceRx ID" : 
                                    "Enter TraceRx ID"}
                          className="w-full pl-10 pr-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required={loginForCompany}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Verify Access Button */}
                  <button
                    type="button"
                    onClick={verifyCompanyAccess}
                    disabled={verifyingCompany || !companyRole || !traceRxId || !email || !password}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {verifyingCompany ? "Verifying..." : "Verify Access"}
                  </button>
                  
                  {/* Company Verification Result */}
                  {companyVerified && companyInfo && (
                    <div className="p-3 bg-green-500/20 border border-green-300 rounded-lg">
                      <div className="flex items-center text-green-100 mb-2">
                        <FaCheckCircle className="mr-2" />
                        <span className="font-semibold">Access Verified</span>
                      </div>
                      <div className="text-sm text-green-100">
                        <p>Company: {companyInfo.name}</p>
                        <p>TraceRx ID: {companyInfo.traceRxId}</p>
                        <p>Country: {companyInfo.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
            disabled={loading || !selectedRole || 
              (loginForCompany && (!companyRole || !traceRxId || !companyVerified))}
          >
            {loading ? "Logging in..." : "Continue to Verification"}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-4 text-center text-sm text-green-200">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
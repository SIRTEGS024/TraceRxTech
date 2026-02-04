import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaGlobe, FaIdCard, FaReceipt, FaChevronDown, FaSearch, FaShippingFast, FaCheckCircle, FaBox, FaTruck, FaClipboardCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { SIGNUP_BG_IMAGES } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";

function SignupPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stage, setStage] = useState(1); // 1: Basic info, 2: Company info (for importers/exporters)
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const { signUp, setLoginData } = useUserStore();

  // Available roles with icons and descriptions
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

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
    "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (SIGNUP_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % SIGNUP_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  const handleStage1Submit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!agreed) {
      toast.warning("Please agree to the Terms and Conditions");
      setLoading(false);
      return;
    }
    
    if (!selectedRole) {
      toast.warning("Please select your role");
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    // Check if importer or exporter
    if (selectedRole === 'importer' || selectedRole === 'exporter') {
      // Move to stage 2 for company info
      setStage(2);
      setLoading(false);
    } else {
      // For agents, create user directly
      const userData = {
        role: selectedRole,
        email: email,
        password: password
      };
      
      const result = signUp(userData);
      
      if (result.success) {
        // Store login data for verification page
        setLoginData({
          userId: result.user.id,
          email: email,
          fromLogin: false
        });
        
        // Redirect to account verification
        navigate("/verify-account", {
          state: {
            userId: result.user.id,
            email: email,
            fromLogin: false
          }
        });
      } else {
        toast.error(result.message);
      }
      
      setLoading(false);
    }
  };

  const handleStage2Submit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate inputs
    if (!companyName.trim()) {
      toast.error("Please enter company name");
      setLoading(false);
      return;
    }
    
    if (!selectedCountry) {
      toast.error("Please select a country");
      setLoading(false);
      return;
    }
    
    if (!tinNumber.trim()) {
      toast.error("Please enter TIN number");
      setLoading(false);
      return;
    }
    
    if (!rcNumber.trim()) {
      toast.error("Please enter RC number");
      setLoading(false);
      return;
    }
    
    // Create user data object
    const userData = {
      role: selectedRole,
      email: email,
      password: password,
      companyName: companyName,
      country: selectedCountry,
      tinNumber: tinNumber,
      rcNumber: rcNumber
    };
    
    // Sign up user
    const result = signUp(userData);
    
    if (result.success) {
      toast.success(`Account created successfully! Your TraceRx ID: ${result.user.traceRxId}`);
      
      // Store login data for verification page
      setLoginData({
        userId: result.user.id,
        email: email,
        fromLogin: false
      });
      
      // Redirect to account verification
      navigate("/verify-account", {
        state: {
          userId: result.user.id,
          email: email,
          fromLogin: false
        }
      });
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    if (stage === 2) {
      setStage(1);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setSearchQuery("");
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      {SIGNUP_BG_IMAGES.map(({ src, alt }, i) => (
        <div
          key={i}
          aria-label={alt}
          role="img"
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0"
            }`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/50 to-green-600/50" />

      {/* Progress indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${stage >= step ? "bg-green-600 text-white" : "bg-white/30 text-green-100"
                }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`w-12 h-1 ${stage > step ? "bg-green-600" : "bg-white/30"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Signup Form */}
      <div className="relative w-full max-w-4xl p-8 z-10 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-green-100 mb-6 text-center">
          {stage === 1 && "Create Account"}
          {stage === 2 && "Company Information"}
        </h2>

        {/* Stage 1: Basic Information */}
        {stage === 1 && (
          <form onSubmit={handleStage1Submit} className="space-y-5">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3 text-green-300">
                    <FaLock />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full pl-10 pr-12 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-green-300 hover:text-green-400"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-green-100 mb-2">
                Select Your Role *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedRole === role.id
                        ? "border-green-500 bg-green-500/20"
                        : "border-green-300 bg-white/10 hover:bg-white/20"
                        }`}
                    >
                      <div className={`p-3 rounded-full ${role.color} mb-2`}>
                        <Icon className="text-white text-xl" />
                      </div>
                      <span className="font-semibold text-green-100">{role.name}</span>
                      <span className="text-xs text-green-200 text-center mt-1">{role.description}</span>
                      {selectedRole === role.id && (
                        <div className="mt-2 text-green-400">
                          <FaCheckCircle />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {!selectedRole && (
                <p className="text-sm text-yellow-300">Please select your role to continue</p>
              )}
            </div>

            {/* Terms & Conditions checkbox */}
            <div className="flex items-start gap-2 text-green-100 text-sm">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.value)}
                className="mt-1"
              />
              <label htmlFor="agree">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="underline hover:text-green-300"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed || !selectedRole || !email || !password || !confirmPassword}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : selectedRole === 'importer' || selectedRole === 'exporter' ? "Next →" : "Create Account"}
            </button>
          </form>
        )}

        {/* Stage 2: Company Information (for importers/exporters) */}
        {stage === 2 && (
          <form onSubmit={handleStage2Submit} className="space-y-5">
            <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-300">
              <p className="text-green-100 text-sm">
                <span className="font-semibold">Selected Role: </span>
                {roles.find(r => r.id === selectedRole)?.name}
              </p>
              <p className="text-green-100 text-sm">
                <span className="font-semibold">Email: </span>
                {email}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100">
                Company Name *
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3 text-green-300">
                    <FaBuilding />
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Country Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100 mb-2">Country *</label>
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => {
                    setShowCountryDropdown(!showCountryDropdown);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className={`flex items-center gap-3 ${!selectedCountry ? "text-green-700" : "text-green-100"}`}>
                    <FaGlobe className="text-green-300" />
                    {selectedCountry || "Select a country"}
                  </span>
                  <FaChevronDown className={`text-green-300 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown List */}
                {showCountryDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-20 w-full mt-1 bg-white border border-green-300 rounded-lg shadow-lg"
                    style={{ maxHeight: '300px' }}
                  >
                    <div className="p-2 border-b border-green-200">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" />
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center ${selectedCountry === country ? "bg-green-100 font-medium" : ""
                              }`}
                          >
                            <FaGlobe className="mr-3 text-green-600" />
                            {country}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100">
                RC Number *
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3 text-green-300">
                    <FaIdCard />
                  </div>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="RC Number"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-green-100">
                TIN Number *
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <div className="absolute left-3 text-green-300">
                    <FaReceipt />
                  </div>
                  <input
                    type="text"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    placeholder="TIN Number"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-100 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !companyName || !selectedCountry || !rcNumber || !tinNumber}
                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        {/* Already have account */}
        {stage === 1 && (
          <p className="mt-4 text-center text-sm text-green-200">
            Already have an account?{" "}
            <Link to="/login" className="font-medium hover:underline">
              Login
            </Link>
          </p>
        )}

        {/* Trademark notice */}
        <p className="mt-2 text-center text-xs text-green-100 italic">
          Registered trade mark and copyright of TracerXTech Limited.
        </p>
      </div>

      {/* Terms and Conditions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
            <div className="text-sm text-gray-700 space-y-4">
              <p><strong>1. Acceptance:</strong> By creating an account, you agree to abide by our platform's rules.</p>
              <p><strong>2. Privacy:</strong> Your personal data will be securely stored and processed as outlined in our Privacy Policy.</p>
              <p><strong>3. Usage:</strong> You agree not to misuse the platform or its services.</p>
              <p><strong>4. Changes:</strong> We reserve the right to update these terms anytime with notice.</p>
              <p><strong>5. Termination:</strong> Accounts violating our rules may be suspended or deleted.</p>
            </div>

            <p className="mt-4 text-xs text-gray-500 italic text-center">
              Registered trade mark and copyright of TracerXTech Limited.
            </p>

            <button
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 block mx-auto"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
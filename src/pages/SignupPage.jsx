// src/pages/SignupPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaGlobe, FaIdCard, FaReceipt, FaChevronDown, FaSearch, FaShippingFast, FaCheckCircle, FaBox, FaTruck, FaClipboardCheck, FaUserTie, FaLandmark } from "react-icons/fa";
import ReusableInput from "../components/ReusableInput";
import { SIGNUP_BG_IMAGES } from "../constants";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SignupPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stage, setStage] = useState(1); // 1: Basic info, 2: Company info, 3: OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // New state for role selection
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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
    if (!agreed) {
      toast.warning("Please agree to the Terms and Conditions");
      return;
    }
    if (!selectedRole) {
      toast.warning("Please select your role (Importer/Exporter/Freight Agent/Verifier/Auditor/MDA)");
      return;
    }
    toast.success("Basic information saved!");
    setStage(2);
  };

  const handleStage2Submit = (e) => {
    e.preventDefault();

    // Validate country selection
    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    toast.success("Company information saved!");

    // Generate random OTP for demo
    const demoOtp = Math.floor(1000 + Math.random() * 9000);
    toast.info(`Demo OTP: ${demoOtp} (For testing purposes)`);

    setStage(3);
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

    setTimeout(() => {
      setLoading(false);
      toast.success("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }, 1000);
  };

  const handleBack = () => {
    if (stage > 1) {
      setStage(stage - 1);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setSearchQuery(""); // Clear search when country is selected
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
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${stage >= step ? "bg-green-600 text-white" : "bg-white/30 text-green-100"
                }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 ${stage > step ? "bg-green-600" : "bg-white/30"}`} />
              )}
            </div>
          ))}
          <div className="ml-4 text-green-100 text-sm font-medium">
            {stage === 1 && "Basic Info"}
            {stage === 2 && "Company Info"}
            {stage === 3 && "Verify OTP"}
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="relative w-full max-w-4xl p-8 z-10 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-green-100 mb-6 text-center">
          {stage === 1 && "Create Account"}
          {stage === 2 && "Company Information"}
          {stage === 3 && "Verify Account"}
        </h2>

        {/* Stage 1: Basic Information */}
        {stage === 1 && (
          <form onSubmit={handleStage1Submit} className="space-y-5">
            <ReusableInput id="email" placeholder="Email Address" icon={FaEnvelope} variant="black" />
            <ReusableInput id="password" placeholder="Password" icon={FaLock} variant="black" />
            <ReusableInput id="confirmPassword" placeholder="Confirm Password" icon={FaLock} variant="black" />

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
                onChange={(e) => setAgreed(e.target.checked)}
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
              disabled={!agreed || !selectedRole}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
            >
              Next → Company Info
            </button>
          </form>
        )}

        {/* Stage 2: Company Information */}
        {stage === 2 && (
          <form onSubmit={handleStage2Submit} className="space-y-5">
            <ReusableInput id="companyName" placeholder="Company Name" icon={FaBuilding} variant="black" />

            {/* Display Selected Role */}
            <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-300">
              <p className="text-green-100 text-sm">
                <span className="font-semibold">Selected Role: </span>
                {roles.find(r => r.id === selectedRole)?.name}
              </p>
            </div>

            {/* Country Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-green-100 mb-2">Country *</label>
              <button
                ref={buttonRef}
                type="button"
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setSearchQuery(""); // Clear search when opening
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/20 border border-green-300 rounded-lg text-green-900 placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <span className={`flex items-center gap-3 ${!selectedCountry ? "text-green-700" : "text-green-900"}`}>
                  <FaGlobe className="text-green-700" />
                  {selectedCountry || "Select a country"}
                </span>
                <FaChevronDown className={`text-green-700 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
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

            <ReusableInput id="rcNumber" placeholder="RC No." icon={FaIdCard} variant="black" />
            <ReusableInput id="tinNumber" placeholder="TIN No." icon={FaReceipt} variant="black" />

            {/* Additional fields based on role */}
            {selectedRole === "importer" && (
              <ReusableInput id="importerLicense" placeholder="Importer License Number" icon={FaBox} variant="black" />
            )}
            {selectedRole === "exporter" && (
              <ReusableInput id="exporterLicense" placeholder="Exporter License Number" icon={FaShippingFast} variant="black" />
            )}
            {selectedRole === "freight_agent" && (
              <ReusableInput id="freightLicense" placeholder="Freight Forwarder License" icon={FaTruck} variant="black" />
            )}
            {selectedRole === "verifier_auditor_mda" && (
              <ReusableInput id="agencyId" placeholder="Agency/Department ID" icon={FaLandmark} variant="black" />
            )}

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
                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
              >
                Next → Verify OTP
              </button>
            </div>
          </form>
        )}

        {/* Stage 3: OTP Verification */}
        {stage === 3 && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <p className="text-green-100 text-center">
              We've sent a 4-digit OTP to your email. Enter it below to verify your account.
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

            <p className="text-green-200 text-sm text-center">
              Didn't receive OTP?{" "}
              <button
                type="button"
                className="underline hover:text-green-300"
                onClick={() => toast.info("Demo: New OTP sent! (Check toast notification)")}
              >
                Resend OTP
              </button>
            </p>

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
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </div>
          </form>
        )}

        {/* Already have account (only show in stage 1) */}
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
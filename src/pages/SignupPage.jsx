// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import ReusableInput from "../components/ReusableInput";
import { SIGNUP_BG_IMAGES } from "../constants";
import { Link } from "react-router-dom";

function SignupPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (SIGNUP_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % SIGNUP_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    // TODO: trigger signup request
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      {SIGNUP_BG_IMAGES.map(({ src, alt }, i) => (
        <div
          key={i}
          aria-label={alt}
          role="img"
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/50 to-green-600/50" />

      {/* Signup Form */}
      <div className="relative w-full max-w-md p-8 z-10 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-green-100 mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">
          <ReusableInput id="email" placeholder="Email Address" icon={FaEnvelope} variant="black" />
          <ReusableInput id="password" placeholder="Password" icon={FaLock} variant="black" />
          <ReusableInput id="confirmPassword" placeholder="Confirm Password" icon={FaLock} variant="black" />

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
            disabled={!agreed || loading}
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {/* Already have account */}
        <p className="mt-4 text-center text-sm text-green-200">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline">
            Login
          </Link>
        </p>

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
              <p><strong>1. Acceptance:</strong> By creating an account, you agree to abide by our platform’s rules.</p>
              <p><strong>2. Privacy:</strong> Your personal data will be securely stored and processed as outlined in our Privacy Policy.</p>
              <p><strong>3. Usage:</strong> You agree not to misuse the platform or its services.</p>
              <p><strong>4. Changes:</strong> We reserve the right to update these terms anytime with notice.</p>
              <p><strong>5. Termination:</strong> Accounts violating our rules may be suspended or deleted.</p>
              {/* You can add more sections when the client provides them */}
            </div>

            {/* Trademark notice inside modal */}
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

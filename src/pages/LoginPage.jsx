// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";
import ReusableInput from "../components/ReusableInput";
import { LOGIN_BG_IMAGES } from "../constants";
import { Link } from "react-router-dom";

function LoginPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (LOGIN_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % LOGIN_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: trigger login request
    setTimeout(() => setLoading(false), 1000);
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
          <ReusableInput
            id="email"
            placeholder="Email Address"
            icon={FaEnvelope}
            variant="black"
          />
          <ReusableInput
            id="password"
            placeholder="Password"
            icon={FaLock}
            variant="black"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-green-200">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

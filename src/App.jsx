import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AccountVerificationPage from "./pages/AccountVerificationPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import ScrollToTop from "./components/ScrollToTop";
import MediaPage from "./pages/MediaPage";
import AboutUs from "./pages/AboutUs";
import PartnerDirectory from "./pages/PartnerDirectory";
import ChatWidget from "./components/ChatWidget";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Dashboard from "./pages/Dashboard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserStore } from "./store/useUserStore";
import { GoogleMapsLoader } from "./components/GoogleMapsLoader";
import Payments from "./pages/Payments";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  const location = useLocation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const hideLayout = [
    "/login",
    "/signup",
    "/dashboard",
    "/verify-account",
    "/verify-otp",
  ].includes(location.pathname);

  // Check if we're on dashboard to load Google Maps
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />

        {!hideLayout && <Navbar />}

        <main className={`flex-grow ${!hideLayout ? "pt-20" : ""}`}>
          {!apiKey && isDashboard ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg max-w-md">
                <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
                <p>
                  Google Maps API key is missing. Please check your .env file.
                </p>
                <p className="text-sm mt-2">
                  Make sure you have VITE_GOOGLE_MAPS_API_KEY set
                </p>
              </div>
            </div>
          ) : (
            <RoutesContent
              hideLayout={hideLayout}
              isDashboard={isDashboard}
              apiKey={apiKey}
            />
          )}
        </main>

        {!hideLayout && <Footer />}
        {!hideLayout && <ChatWidget />}
      </div>
    </>
  );
}

function RoutesContent({ hideLayout, isDashboard, apiKey }) {
  if (isDashboard) {
    return (
      <GoogleMapsLoader apiKey={apiKey}>
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard isMapsLoaded={true} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </GoogleMapsLoader>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/media" element={<MediaPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/partners" element={<PartnerDirectory />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/payments" element={<Payments />} />

      {/* Auth routes */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-account" element={<AccountVerificationPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

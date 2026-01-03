// src/App.js
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadScript } from '@react-google-maps/api';
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
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

export default function App() {
  const location = useLocation();
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const hideLayout = ["/login", "/signup", "/dashboard"].includes(location.pathname);

  // Check if Google Maps is already loaded (e.g., on page refresh)
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded');
        setIsMapsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    checkGoogleMaps();

    // Also check on route changes
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      
      {!hideLayout && <Navbar />}

      <main className={`flex-grow ${!hideLayout ? "pt-20" : ""}`}>
        {!apiKey ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg max-w-md">
              <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
              <p>Google Maps API key is missing. Please check your .env file.</p>
              <p className="text-sm mt-2">Make sure you have VITE_GOOGLE_MAPS_API_KEY set</p>
            </div>
          </div>
        ) : (
          <>
            {/* Always load Google Maps script */}
            <LoadScript
              googleMapsApiKey={apiKey}
              libraries={['places', 'drawing']}
              onLoad={() => {
                console.log('Google Maps loaded successfully');
                setIsMapsLoaded(true);
              }}
              onError={(error) => {
                console.error('Google Maps failed to load:', error);
                // Still set loaded to true to prevent infinite loading
                setIsMapsLoaded(true);
              }}
              loadingElement={
                // Only show loading if we're on dashboard AND maps aren't loaded yet
                location.pathname.startsWith('/dashboard') && !isMapsLoaded ? (
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading Google Maps...</p>
                      <p className="text-sm text-gray-500 mt-2">Please wait while we initialize the map</p>
                    </div>
                  </div>
                ) : null
              }
            >
              {/* Conditionally render based on current route */}
              {location.pathname.startsWith('/dashboard') && !isMapsLoaded ? (
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">Setting up your workspace</p>
                  </div>
                </div>
              ) : (
                <RoutesContent hideLayout={hideLayout} isMapsLoaded={isMapsLoaded} />
              )}
            </LoadScript>
          </>
        )}
      </main>

      {!hideLayout && <Footer />}
      {!hideLayout && <ChatWidget />}
    </div>
  );
}

// Separate component for Routes to avoid re-rendering issues
function RoutesContent({ hideLayout, isMapsLoaded }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/media" element={<MediaPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/partners" element={<PartnerDirectory />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy/>} />

      {/* Auth routes */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Dashboard route - Pass isMapsLoaded prop */}
      <Route path="/dashboard/*" element={<Dashboard isMapsLoaded={isMapsLoaded} />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
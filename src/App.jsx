import { Route, Routes, Navigate, useLocation } from "react-router-dom";
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
import GoogleMapsProvider from "./components/GoogleMapsProvider"; // Import the provider
import { useEffect, useState } from "react";
import { LoadScript } from '@react-google-maps/api';


export default function App() {
  const location = useLocation();
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const hideLayout = ["/login", "/signup", "/dashboard"].includes(location.pathname);

  // Check if Google Maps is already loaded (e.g., on page refresh)
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsMapsLoaded(true);
    }
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
        ) : !isMapsLoaded ? (
          <LoadScript
            googleMapsApiKey={apiKey}
            libraries={['places', 'drawing']}
            onLoad={() => {
              console.log('Google Maps loaded successfully');
              setIsMapsLoaded(true);
            }}
            onError={(error) => {
              console.error('Google Maps failed to load:', error);
              // Even if there's an error, continue so dashboard can render
              setIsMapsLoaded(true);
            }}
            loadingElement={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading application...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              </div>
            }
          >
            <RoutesContent hideLayout={hideLayout} />
          </LoadScript>
        ) : (
          <RoutesContent hideLayout={hideLayout} />
        )}
      </main>

      {!hideLayout && <Footer />}
      {!hideLayout && <ChatWidget />}
    </div>
  );

  // Separate component for Routes to avoid re-rendering issues
function RoutesContent({ hideLayout }) {
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
      
      {/* Dashboard route - No wrapper needed since maps are loaded at app level */}
      <Route path="/dashboard/*" element={<Dashboard />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
}
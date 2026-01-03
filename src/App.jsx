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

export default function App() {
  const location = useLocation();

  // Pages without Navbar, Footer, or Chat
  const hideLayout = ["/login", "/signup", "/dashboard"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!hideLayout && <Navbar />}

      <main className={`flex-grow ${!hideLayout ? "pt-20" : ""}`}>
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
          
          {/* Dashboard route - WRAPPED with GoogleMapsProvider */}
          <Route 
            path="/dashboard/*" 
            element={
              <GoogleMapsProvider>
                <Dashboard />
              </GoogleMapsProvider>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
      {!hideLayout && <ChatWidget />}
    </div>
  );
}
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EudrPage from "./pages/EudrPage";
import MrvPage from "./pages/MrvPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import TraceabilityPage from "./pages/TraceabilityPage";
import ManagementPage from "./pages/managementPage";
import AgribusinessPage from "./pages/AgribusinessPage";
import CarbonPage from "./pages/CarbonPage";
import ProcessPage from "./pages/ProcessPage";
import FoundationPage from "./pages/FoundationPage";
import ConsultantPage from "./pages/Consultants";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import ScrollToTop from "./components/ScrollToTop";
import MediaPage from "./pages/MediaPage";
import AboutUs from "./pages/AboutUs";
import BecomePartner from "./pages/BecomePartner";
import PartnerDirectory from "./pages/PartnerDirectory";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  const location = useLocation();
  // Define routes where navbar/footer should be hidden
  const hideNavFooter = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!hideNavFooter && <Navbar />}

      <main className={`flex-grow ${!hideNavFooter ? "pt-20" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eudr-compliance-platform" element={<EudrPage />} />
          <Route path="/digital-mrv-platform" element={<MrvPage />} />
          <Route
            path="/sustainability-platform"
            element={<SustainabilityPage />}
          />
          <Route
            path="/food-traceability-platform"
            element={<TraceabilityPage />}
          />
          <Route
            path="/forest-farm-management-platform"
            element={<ManagementPage />}
          />
          <Route path="/agribusiness" element={<AgribusinessPage />} />
          <Route path="/carbon-project-developer" element={<CarbonPage />} />
          <Route path="/processor" element={<ProcessPage />} />
          <Route path="/foundations" element={<FoundationPage />} />
          <Route path="/consultants" element={<ConsultantPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/partner" element={<BecomePartner />} />
          <Route path="/partners" element={<PartnerDirectory />} />

          {/* Auth routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideNavFooter && <Footer />}
      <ChatWidget />
    </div>
  );
}

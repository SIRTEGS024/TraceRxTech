import { Route, Routes, Navigate } from "react-router-dom"; // 1. Import Navigate
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import EudrPage from "./pages/EudrPage";
import MrvPage from "./pages/MrvPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import TraceabilityPage from "./pages/TraceabilityPage";
import ManagementPage from "./pages/managementPage";
import AgribusinessPage from "./pages/AgribusinessPage";
import CarbonPage from "./pages/CarbonPage";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/eudr-compliance-platform" element={<EudrPage />} />
        <Route path="/digital-mrv-platform" element={<MrvPage />} />
        <Route path="/sustainability-platform" element={<SustainabilityPage />} />
        <Route path="/food-traceability-platform" element={<TraceabilityPage />} />
        <Route path="/farm-management-platform" element={<ManagementPage />} />
        <Route path="/industry/agribusiness" element={<AgribusinessPage />} />
        <Route path="/industry/carbon-project-developer" element={<CarbonPage />} />
        {/* Add catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
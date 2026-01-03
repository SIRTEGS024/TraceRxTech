// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import CompanyDetails from "../components/CompanyDetails";
import EUDRDefinitions from "../components/EudrDefinitions";
import GPSCamera from "../components/GPSCamera";
import InformationRequirements from "../components/InformationRequirements";
import NewShipmentOrigin from "../components/NewShipmentOrigin";
import Overview from "../components/Overview";
import Reports from "../components/Reports";
import Shipments from "../components/Shipments";
import SubjectMatterScope from "../components/SubjectMatterScope";
import SupplyChain from "../components/SupplyChain";
import Sidebar from "../components/SideBar";
import Regulations from "../components/Regulations";
import RegulationsBadge from "../components/RegulationsBadge";
import TargetedRegulations from "../components/TargetedRegulations";
import DashboardNavbar from "../components/DashboardNavbar";

// Map tabs to their corresponding article types
const tabToArticleMap = {
  'subject-matter': 'subject-matter',
  'eudr-definitions': 'eudr-definitions',
  'information-requirements': 'information-requirements',
  'new-shipment': 'new-shipment'
};

// Tabs that should show regulations on first visit
const tabsWithRegulations = ['subject-matter', 'eudr-definitions', 'information-requirements', 'new-shipment'];

// Main Dashboard Component
const Dashboard = ({ isMapsLoaded }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showRegulations, setShowRegulations] = useState(false);
  const [showTargetedRegulations, setShowTargetedRegulations] = useState(false);
  const [hasVisitedTab, setHasVisitedTab] = useState({});
  const [mapsReady, setMapsReady] = useState(false);
  const navbarRef = useRef(null);

  // Detect screen size and handle sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        setNavbarHeight(height);
      }
      
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    const observer = new MutationObserver(checkScreenSize);
    if (navbarRef.current) {
      observer.observe(navbarRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      observer.disconnect();
    };
  }, []);

  // Update navbar height after mount
  useEffect(() => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavbarHeight(height);
    }
  }, []);

  // Check if Google Maps is ready to use
  useEffect(() => {
    if (isMapsLoaded) {
      const checkMaps = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps verified as ready');
          setMapsReady(true);
          return true;
        }
        return false;
      };

      // Check immediately
      if (checkMaps()) return;

      // Poll until maps are available
      const intervalId = setInterval(() => {
        if (checkMaps()) {
          clearInterval(intervalId);
        }
      }, 100);

      // Timeout after 3 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        console.warn('Google Maps not available after timeout');
        setMapsReady(true); // Set to true anyway to render dashboard
      }, 3000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [isMapsLoaded]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Show targeted regulations for specific tabs on first visit
    if (tabsWithRegulations.includes(tabId) && !hasVisitedTab[tabId]) {
      // Mark as visited after showing regulations
      setTimeout(() => {
        setHasVisitedTab(prev => ({ ...prev, [tabId]: true }));
      }, 100);
      
      // Show the targeted regulations modal
      setShowTargetedRegulations(true);
    }
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Add a loading placeholder component for map-dependent components
  const MapLoadingPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-xl min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600">Loading map component...</p>
      <p className="text-sm text-gray-500 mt-2">Please wait while we initialize the map</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'company-details':
        return <CompanyDetails />;
      case 'subject-matter':
        return <SubjectMatterScope />;
      case 'eudr-definitions':
        return <EUDRDefinitions />;
      case 'information-requirements':
        return <InformationRequirements />;
      case 'new-shipment':
        // This component uses Google Maps
        return mapsReady ? <NewShipmentOrigin /> : <MapLoadingPlaceholder />;
      case 'shipments':
        return <Shipments />;
      case 'reports':
        return <Reports />;
      case 'gps-camera':
        // This component uses Google Maps
        return mapsReady ? <GPSCamera /> : <MapLoadingPlaceholder />;
      case 'supply-chain':
        return <SupplyChain />;
      default:
        return <Overview />;
    }
  };

  // If maps aren't loaded at all, show a full-screen loading
  if (!isMapsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Warning for slow map loading */}
      {isMapsLoaded && !mapsReady && (
        <div className="fixed top-20 right-4 z-50 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded shadow-lg max-w-xs">
          <p className="text-sm font-medium">Initializing Maps...</p>
          <p className="text-xs">Map features will be available shortly</p>
        </div>
      )}

      {/* Fixed Navbar with ref for height measurement */}
      <div ref={navbarRef} className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavbar />
      </div>

      {/* Mobile Menu Button */}
      {isMobile && navbarHeight > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed z-40 bg-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          style={{ 
            top: `${navbarHeight + 16}px`,
            left: '1rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
        navbarHeight={navbarHeight}
      />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? 'lg:ml-72' : ''}`}
        style={{ 
          paddingTop: `${navbarHeight}px`,
          minHeight: `calc(100vh - ${navbarHeight}px)`
        }}
      >
        <div className={`p-2 lg:p-6`}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* Regulations Badge */}
      <RegulationsBadge onClick={() => setShowRegulations(!showRegulations)} />

      {/* Full Regulations Panel */}
      <Regulations 
        isOpen={showRegulations} 
        onClose={() => setShowRegulations(false)} 
      />

      {/* Targeted Regulations Modal */}
      <TargetedRegulations 
        isOpen={showTargetedRegulations}
        onClose={() => setShowTargetedRegulations(false)}
        articleType={tabToArticleMap[activeTab]}
      />
    </div>
  );
};

export default Dashboard;
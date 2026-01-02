// Updated Dashboard.jsx
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
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showRegulations, setShowRegulations] = useState(false);
  const [showTargetedRegulations, setShowTargetedRegulations] = useState(false);
  const [hasVisitedTab, setHasVisitedTab] = useState({});
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
        return <NewShipmentOrigin />;
      case 'shipments':
        return <Shipments />;
      case 'reports':
        return <Reports />;
      case 'gps-camera':
        return <GPSCamera />;
      case 'supply-chain':
        return <SupplyChain />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
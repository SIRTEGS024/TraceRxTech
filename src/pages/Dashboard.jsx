// Dashboard.js - Add warning icon logic

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import BioData from "../components/BioData";
import AgentManagement from "../components/AgentManagement";
import PastDueDiligence from "../components/PastDueDiligence";
import CurrentDueDiligence from "../components/CurrentDueDiligence";
import AgentRequests from "../components/AgentRequests";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

// Map tabs to their corresponding article types
const tabToArticleMap = {
  "subject-matter": "subject-matter",
  "eudr-definitions": "eudr-definitions",
  "information-requirements": "information-requirements",
  "new-shipment": "new-shipment",
  "current-due-diligence": "due-diligence",
  "past-due-diligence": "due-diligence",
};

// Tabs that should show regulations on first visit
const tabsWithRegulations = [
  "subject-matter",
  "eudr-definitions",
  "information-requirements",
  "new-shipment",
  "current-due-diligence", 
  "past-due-diligence", 
];

// Main Dashboard Component
const Dashboard = ({ isMapsLoaded }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showRegulations, setShowRegulations] = useState(false);
  const [showTargetedRegulations, setShowTargetedRegulations] = useState(false);
  const [hasVisitedTab, setHasVisitedTab] = useState({});
  const [availableTabs, setAvailableTabs] = useState([]);
  const [initialTabSet, setInitialTabSet] = useState(false);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout, demoData } = useUserStore();

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Helper to get the actual company we're acting as (either user or the company agent is logged in as)
  const getTargetCompany = () => {
    if (!user) return null;
    if (user.loggedInAs?.companyId) {
      // Agent logged in for a company
      return demoData.users[user.loggedInAs.companyId];
    }
    // User is the company itself
    if (user.role === "exporter" || user.role === "importer") {
      return user;
    }
    return null;
  };

  // Compute warning status for tabs based on verifier reports
  const computeTabWarnings = (company) => {
    if (!company) return {};

    const warnings = {};
    const linkedVerifiers = company.linkedVerifiers || [];

    for (const verifierLink of linkedVerifiers) {
      const verifier = demoData.users[verifierLink.id];
      if (!verifier || !verifier.verificationReports) continue;

      // Find reports for this company
      const reports = verifier.verificationReports.filter(
        (report) => report.companyId === company.id
      );

      for (const report of reports) {
        const findings = report.findings || [];
        for (const finding of findings) {
          const tabId = finding.tab;
          if (finding.status === "non-compliant") {
            // Mark tab as warning
            warnings[tabId] = true;
          }
        }
      }
    }

    return warnings;
  };

  // Get available tabs with access information - UPDATED to include warnings
  const getAvailableTabs = () => {
    const allTabs = {
      // Common tabs
      overview: {
        id: "overview",
        name: "Overview",
        icon: "FiHome",
        accessKey: "overview",
      },
      "bio-data": {
        id: "bio-data",
        name: "Bio Data",
        icon: "FiUser",
        accessKey: "overview",
      },
      "company-details": {
        id: "company-details",
        name: "Company Details",
        icon: "FiBuilding",
        accessKey: "companyDetails",
      },
      "subject-matter": {
        id: "subject-matter",
        name: "Subject matter & scope",
        icon: "FiTarget",
        accessKey: "subjectMatterScope",
      },
      shipments: {
        id: "shipments",
        name: "Shipments",
        icon: "FiPackage",
        accessKey: "shipments",
      },
      reports: {
        id: "reports",
        name: "Reports",
        icon: "FiBarChart2",
        accessKey: "reports",
      },
      "gps-camera": {
        id: "gps-camera",
        name: "GPS Camera",
        icon: "FiCamera",
        accessKey: "gpsCamera",
      },
      "supply-chain": {
        id: "supply-chain",
        name: "Supply Chain",
        icon: "FiLink",
        accessKey: "supplyChain",
      },
      "agent-management": {
        id: "agent-management",
        name: "Agent Management",
        icon: "FiUsers",
        accessKey: "overview",
      },

      // Exporter-specific tabs
      "eudr-definitions": {
        id: "eudr-definitions",
        name: "EUDR Definition of terms",
        icon: "FiBook",
        accessKey: "eudrDefinitions",
      },
      "information-requirements": {
        id: "information-requirements",
        name: "Information requirements",
        icon: "FiInfo",
        accessKey: "informationRequirements",
      },
      "new-shipment": {
        id: "new-shipment",
        name: "New Shipment Origin",
        icon: "FiTruck",
        accessKey: "newShipmentOrigin",
      },

      // Importer-specific tabs
      "current-due-diligence": {
        id: "current-due-diligence",
        name: "Current Due Diligence",
        icon: "FiShield",
        accessKey: "currentDueDiligence",
      },
      "past-due-diligence": {
        id: "past-due-diligence",
        name: "Past Due Diligence",
        icon: "FiShield",
        accessKey: "pastDueDiligence",
      },

      // Agent-specific tab
      "agent-requests": {
        id: "agent-requests",
        name: "Company Access",
        icon: "FiSend",
        accessKey: "overview",
      },
    };

    if (!user) return [];

    const isLoggedInAsCompany = user.loggedInAs?.companyId;
    const userRole = user.role;
    const companyType = user.loggedInAs?.companyType;
    const agentAccessTabs = user.loggedInAs?.accessTabs || {};

    // Determine which tabs are available based on user role and login status
    let availableTabKeys = [];

    if (isLoggedInAsCompany && companyType) {
      // Agent logged in for a company
      if (companyType === "exporter") {
        availableTabKeys = [
          "overview",
          "company-details",
          "subject-matter",
          "eudr-definitions",
          "information-requirements",
          "new-shipment",
          "shipments",
          "reports",
          "gps-camera",
          "supply-chain",
        ];
      } else if (companyType === "importer") {
        availableTabKeys = [
          "overview",   
          "company-details",
          "subject-matter",
          "past-due-diligence",
          "current-due-diligence",
          "shipments",
          "reports",
          "gps-camera",
          "supply-chain",
        ];
      }

      // ALWAYS show bio-data and agent-requests for agents logged in for a company
      availableTabKeys.push("bio-data", "agent-requests");
    } else {
      // User logged in as themselves
      if (userRole === "exporter") {
        availableTabKeys = [
          "overview",
          "company-details",
          "subject-matter",
          "eudr-definitions",
          "information-requirements",
          "new-shipment",
          "shipments",
          "reports",
          "gps-camera",
          "supply-chain",
          "agent-management",
        ];
      } else if (userRole === "importer") {
        availableTabKeys = [
          "overview",
          "company-details",
          "subject-matter",
          "past-due-diligence",
          "current-due-diligence",
          "shipments",
          "reports",
          "gps-camera",
          "supply-chain",
          "agent-management",
        ];
      } else if (userRole === "verifier" || userRole === "freight agent") {
        // Agents only see bio-data and agent-requests when logged in as themselves
        availableTabKeys = ["bio-data", "agent-requests"];
      }
    }

    // Compute warnings for the current company (if any)
    const targetCompany = getTargetCompany();
    const warnings = computeTabWarnings(targetCompany);

    // Convert keys to tab objects with access information
    const tabs = availableTabKeys
      .filter((key) => allTabs[key])
      .map((key) => {
        const tab = { ...allTabs[key] };

        // Determine if tab has access
        let hasAccess = true;

        // For agents logged in for a company, check access from company's accessTabs
        if (isLoggedInAsCompany && companyType) {
          if (tab.id === "bio-data" || tab.id === "agent-requests") {
            // Bio-data and agent-requests are always accessible for agents
            hasAccess = true;
          } else {
            // Get the correct access key for this tab
            const accessKey = tab.accessKey;
            hasAccess = agentAccessTabs[accessKey] === true;
          }
        } else {
          // For non-agents or agents logged in as themselves, all tabs have access
          hasAccess = true;
        }

        // Add warning flag if the tab has a non-compliant finding in any report
        const hasWarning = warnings[tab.id] === true;

        return {
          ...tab,
          hasAccess,
          hasWarning,
        };
      });

    return tabs;
  };

  // Update available tabs and set initial active tab when user changes
  useEffect(() => {
    if (user) {
      const tabs = getAvailableTabs();
      console.log("DEBUG: Setting available tabs:", tabs);
      setAvailableTabs(tabs);

      // Set initial active tab (first tab that has access in the list)
      if (tabs.length > 0 && !initialTabSet) {
        const firstAccessibleTab = tabs.find((tab) => tab.hasAccess);
        console.log("DEBUG: First accessible tab:", firstAccessibleTab);
        if (firstAccessibleTab) {
          setActiveTab(firstAccessibleTab.id);
        } else if (tabs.length > 0) {
          // If no tab has access (shouldn't happen), fall back to first tab
          setActiveTab(tabs[0].id);
        }
        setInitialTabSet(true);
      }
    }
  }, [user, demoData]); // Re-run when demoData changes (reports may update)

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
    window.addEventListener("resize", checkScreenSize);

    const observer = new MutationObserver(checkScreenSize);
    if (navbarRef.current) {
      observer.observe(navbarRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", checkScreenSize);
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
    const selectedTab = availableTabs.find((tab) => tab.id === tabId);
    if (selectedTab && selectedTab.hasAccess) {
      setActiveTab(tabId);

      // Show targeted regulations for specific tabs on first visit
      if (tabsWithRegulations.includes(tabId) && !hasVisitedTab[tabId]) {
        // Mark as visited after showing regulations
        setTimeout(() => {
          setHasVisitedTab((prev) => ({ ...prev, [tabId]: true }));
        }, 100);

        // Show the targeted regulations modal
        setShowTargetedRegulations(true);
      }

      // Close sidebar on mobile after selection
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  };

  const renderContent = () => {
    // Check if current active tab is accessible
    const currentTab = availableTabs.find((tab) => tab.id === activeTab);
    if (currentTab && !currentTab.hasAccess) {
      // Find first accessible tab to show instead
      const firstAccessibleTab = availableTabs.find((tab) => tab.hasAccess);
      if (firstAccessibleTab) {
        setActiveTab(firstAccessibleTab.id);
        return null; // Will re-render with new tab
      }
    }

    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "bio-data":
        return <BioData />;
      case "company-details":
        return <CompanyDetails />;
      case "subject-matter":
        return <SubjectMatterScope />;
      case "eudr-definitions":
        return <EUDRDefinitions />;
      case "information-requirements":
        return <InformationRequirements />;
      case "new-shipment":
        // Google Maps is already loaded by the parent component
        return <NewShipmentOrigin />;
      case "shipments":
        return <Shipments />;
      case "reports":
        return <Reports />;
      case "gps-camera":
        // Google Maps is already loaded by the parent component
        return <GPSCamera />;
      case "supply-chain":
        return <SupplyChain />;
      case "past-due-diligence":
        return <PastDueDiligence />;
      case "current-due-diligence":
        return <CurrentDueDiligence />;
      case "agent-management":
        return <AgentManagement />;
      case "agent-requests":
        return <AgentRequests />;
      default:
        return <Overview />;
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

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
            left: "1rem",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
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
        availableTabs={availableTabs}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? "lg:ml-72" : ""}`}
        style={{
          paddingTop: `${navbarHeight}px`,
          minHeight: `calc(100vh - ${navbarHeight}px)`,
        }}
      >
        <div className={`p-2 lg:p-6`}>
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
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
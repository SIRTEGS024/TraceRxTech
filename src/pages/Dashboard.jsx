// Dashboard.js (full corrected version)
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
import VerifierVerification from "../components/VerifierVerification";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const tabToArticleMap = {
  "subject-matter": "subject-matter",
  "eudr-definitions": "eudr-definitions",
  "information-requirements": "information-requirements",
  "new-shipment": "new-shipment",
  "current-due-diligence": "due-diligence",
  "past-due-diligence": "due-diligence",
};

const tabsWithRegulations = [
  "subject-matter",
  "eudr-definitions",
  "information-requirements",
  "new-shipment",
  "current-due-diligence",
  "past-due-diligence",
];

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const getTargetCompany = () => {
    if (!user) return null;
    if (user.loggedInAs?.companyId) {
      return demoData.users[user.loggedInAs.companyId];
    }
    if (user.role === "exporter" || user.role === "importer") {
      return user;
    }
    return null;
  };

  const computeTabWarnings = (company) => {
    if (!company) return {};
    const warnings = {};
    const linkedVerifiers = company.linkedVerifiers || [];
    for (const verifierLink of linkedVerifiers) {
      const verifier = demoData.users[verifierLink.id];
      if (!verifier || !verifier.verificationReports) continue;
      const reports = verifier.verificationReports.filter(
        (report) => report.companyId === company.id,
      );
      for (const report of reports) {
        const findings = report.findings || [];
        for (const finding of findings) {
          if (finding.status === "non-compliant") {
            warnings[finding.tab] = true;
          }
        }
      }
    }
    return warnings;
  };

  const getAvailableTabs = () => {
    const allTabs = {
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
      "agent-requests": {
        id: "agent-requests",
        name: "Company Access",
        icon: "FiSend",
        accessKey: "overview",
      },
      verification: {
        id: "verification",
        name: "Verification",
        icon: "FiClipboard",
        accessKey: "verification",
      },
    };

    if (!user) return [];

    const isLoggedInAsCompany = user.loggedInAs?.companyId;
    const userRole = user.role;
    const companyType = user.loggedInAs?.companyType;
    const agentAccessTabs = user.loggedInAs?.accessTabs || {};

    let availableTabKeys = [];

    if (isLoggedInAsCompany && companyType) {
      if (userRole === "verifier" || userRole === "freight agent") {
        availableTabKeys = ["bio-data", "agent-requests", "verification"];
      } else {
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
        availableTabKeys.push("bio-data", "agent-requests");
      }
    } else {
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
        availableTabKeys = ["bio-data", "agent-requests"];
      }
    }

    const targetCompany = getTargetCompany();
    const warnings = computeTabWarnings(targetCompany);

    const tabs = availableTabKeys
      .filter((key) => allTabs[key])
      .map((key) => {
        const tab = { ...allTabs[key] };
        let hasAccess = true;
        if (isLoggedInAsCompany && companyType) {
          if (
            tab.id === "bio-data" ||
            tab.id === "agent-requests" ||
            tab.id === "verification"
          ) {
            hasAccess = true;
          } else {
            const accessKey = tab.accessKey;
            hasAccess = agentAccessTabs[accessKey] === true;
          }
        }
        const hasWarning = warnings[tab.id] === true;
        return { ...tab, hasAccess, hasWarning };
      });

    return tabs;
  };

  useEffect(() => {
    if (user) {
      const tabs = getAvailableTabs();
      setAvailableTabs(tabs);
      if (tabs.length > 0 && !initialTabSet) {
        const firstAccessibleTab = tabs.find((tab) => tab.hasAccess);
        if (firstAccessibleTab) {
          setActiveTab(firstAccessibleTab.id);
        } else if (tabs.length > 0) {
          setActiveTab(tabs[0].id);
        }
        setInitialTabSet(true);
      }
    }
  }, [user, demoData]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
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

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, []);

  const handleTabChange = (tabId) => {
    const selectedTab = availableTabs.find((tab) => tab.id === tabId);
    if (selectedTab && selectedTab.hasAccess) {
      setActiveTab(tabId);
      if (tabsWithRegulations.includes(tabId) && !hasVisitedTab[tabId]) {
        setTimeout(() => {
          setHasVisitedTab((prev) => ({ ...prev, [tabId]: true }));
        }, 100);
        setShowTargetedRegulations(true);
      }
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  };

  const renderContent = () => {
    const currentTab = availableTabs.find((tab) => tab.id === activeTab);
    if (currentTab && !currentTab.hasAccess) {
      const firstAccessibleTab = availableTabs.find((tab) => tab.hasAccess);
      if (firstAccessibleTab) {
        setActiveTab(firstAccessibleTab.id);
        return null;
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
        return <NewShipmentOrigin />;
      case "shipments":
        return <Shipments />;
      case "reports":
        return <Reports />;
      case "gps-camera":
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
      case "verification":
        return <VerifierVerification />;
      default:
        return <Overview />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div ref={navbarRef} className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavbar />
      </div>

      {isMobile && navbarHeight > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed z-40 bg-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          style={{ top: `${navbarHeight + 16}px`, left: "1rem" }}
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

      <div
        className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? "lg:ml-72" : ""}`}
        style={{
          paddingTop: `${navbarHeight}px`,
          minHeight: `calc(100vh - ${navbarHeight}px)`,
        }}
      >
        <div className="p-2 lg:p-6">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </div>
      </div>

      <RegulationsBadge onClick={() => setShowRegulations(!showRegulations)} />
      <Regulations
        isOpen={showRegulations}
        onClose={() => setShowRegulations(false)}
      />
      <TargetedRegulations
        isOpen={showTargetedRegulations}
        onClose={() => setShowTargetedRegulations(false)}
        articleType={tabToArticleMap[activeTab]}
      />
    </div>
  );
};

export default Dashboard;

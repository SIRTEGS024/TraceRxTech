import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isMobile, navbarHeight }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'FiHome' },
    { id: 'company-details', name: 'Company Details', icon: 'FiBuilding' },
    { id: 'subject-matter', name: 'Subject matter & scope', icon: 'FiTarget' },
    { id: 'eudr-definitions', name: 'EUDR Definition of terms', icon: 'FiBook' },
    { id: 'information-requirements', name: 'Information requirements', icon: 'FiInfo' },
    { id: 'new-shipment', name: 'New Shipment Origin', icon: 'FiTruck' },
    { id: 'shipments', name: 'Shipments', icon: 'FiPackage' },
    { id: 'reports', name: 'Reports', icon: 'FiBarChart2' },
    { id: 'gps-camera', name: 'GPS Camera', icon: 'FiCamera' },
    { id: 'supply-chain', name: 'Supply Chain', icon: 'FiLink' }
  ];

  // Fallback icon component in case of import issues
  const FallbackIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const getIconComponent = (iconName) => {
    try {
      return FiIcons[iconName] || FallbackIcon;
    } catch (error) {
      return FallbackIcon;
    }
  };

  // Determine sidebar state based on device
  const shouldShowSidebar = isMobile ? isSidebarOpen : true;

  return (
    <>
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            style={{ top: `${navbarHeight}px` }} // Start below navbar
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Positioned below navbar */}
      <motion.div
        initial={false}
        animate={{ 
          x: shouldShowSidebar ? 0 : -300, 
          opacity: shouldShowSidebar ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed left-0 w-72 bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-200 shadow-xl flex flex-col ${
          isMobile ? 'z-50' : 'z-30'
        }`}
        style={{ 
          top: `${navbarHeight}px`, // Start right after navbar
          height: `calc(100vh - ${navbarHeight}px)` // Take remaining height
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-green-200 bg-white shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-green-800">EUDR Compliance</h2>
            <p className="text-green-600 text-xs mt-1">Dashboard Navigation</p>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = getIconComponent(tab.icon);
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-md shadow-green-200'
                      : 'text-green-700 hover:bg-green-100 hover:text-green-800'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-left font-medium whitespace-normal break-words">{tab.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-green-200 bg-white shrink-0">
          <p className="text-green-600 text-xs text-center">EUDR Compliance v1.0</p>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
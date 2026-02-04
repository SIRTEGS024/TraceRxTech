// Sidebar.js - UPDATED to show padlock for locked tabs

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { FaSignOutAlt, FaLock } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isMobile, navbarHeight, availableTabs, onLogout }) => {
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

  const handleTabClick = (tab) => {
    if (tab.hasAccess) {
      setActiveTab(tab.id);
    }
  };

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
            {availableTabs.map((tab) => {
              const IconComponent = getIconComponent(tab.icon);
              const isActive = activeTab === tab.id;
              const hasAccess = tab.hasAccess !== false; // Default to true if not specified
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: hasAccess ? 2 : 0 }}
                  whileTap={{ scale: hasAccess ? 0.98 : 1 }}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full flex items-center justify-between space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive && hasAccess
                      ? 'bg-green-600 text-white shadow-md shadow-green-200'
                      : hasAccess
                      ? 'text-green-700 hover:bg-green-100 hover:text-green-800'
                      : 'text-gray-400 cursor-not-allowed bg-gray-100'
                  }`}
                  disabled={!hasAccess}
                  title={!hasAccess ? "You don't have access to this tab" : ""}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="text-left font-medium whitespace-normal break-words">{tab.name}</span>
                  </div>
                  
                  {!hasAccess && (
                    <FaLock className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer with Logout Button */}
        <div className="p-3 border-t border-green-200 bg-white shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
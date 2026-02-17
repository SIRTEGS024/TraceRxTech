import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserClock, 
  FaToggleOn, 
  FaToggleOff, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaFilePdf,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { useUserStore } from "../store/useUserStore";

const AgentManagement = () => {
  const { user, demoData, getCompanyPendingAgents, getCompanyLinkedAgents, updateAgentAccess, updateAgentTabAccess, updateAgentAccessStatus } = useUserStore();
  const [activeTab, setActiveTab] = useState("linked");
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!user || (user.role !== 'importer' && user.role !== 'exporter')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
      >
        <div className="text-center py-8 sm:py-12">
          <FaUsers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">
            Agent Management is only available for Importers and Exporters.
          </p>
        </div>
      </motion.div>
    );
  }
  
  const companyId = user.id;
  const pendingAgents = getCompanyPendingAgents(companyId);
  const linkedAgents = getCompanyLinkedAgents(companyId);
  
  const handleApprove = (agentId, agentRole) => {
    const result = updateAgentAccess(companyId, agentId, agentRole, true);
    if (result.success) {
      alert(result.message);
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleReject = (agentId, agentRole) => {
    const result = updateAgentAccess(companyId, agentId, agentRole, false);
    if (result.success) {
      alert(result.message);
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleToggleAccess = (agentId, agentRole, currentStatus) => {
    const result = updateAgentAccessStatus(companyId, agentId, agentRole, !currentStatus);
    if (result.success) {
      alert(result.message);
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleToggleTabAccess = (agentId, agentRole, tab, currentAccess) => {
    const result = updateAgentTabAccess(companyId, agentId, agentRole, tab, !currentAccess);
    if (result.success) {
      // The store update will trigger a re-render
    } else {
      alert(result.message);
    }
  };
  
  const renderPendingAgents = () => {
    if (pendingAgents.verifiers.length === 0 && pendingAgents.freightAgents.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8">
          <FaUserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-gray-500">No pending agent requests</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Verifiers */}
        {pendingAgents.verifiers.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 px-1">Pending Verifiers</h3>
            <div className="space-y-3 sm:space-y-4">
              {pendingAgents.verifiers.map((verifier) => (
                <div key={verifier.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {verifier.basicInfo?.firstName} {verifier.basicInfo?.lastName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{verifier.basicInfo?.email}</p>
                      {verifier.basicInfo?.agencyDepartmentId && (
                        <p className="text-xs text-gray-500 mt-1">Agency ID: {verifier.basicInfo.agencyDepartmentId}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <button
                        onClick={() => handleApprove(verifier.id, 'verifier')}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <FaCheck className="mr-2 text-xs sm:text-sm" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(verifier.id, 'verifier')}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <FaTimes className="mr-2 text-xs sm:text-sm" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Freight Agents */}
        {pendingAgents.freightAgents.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 px-1">Pending Freight Agents</h3>
            <div className="space-y-3 sm:space-y-4">
              {pendingAgents.freightAgents.map((agent) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {agent.basicInfo?.firstName} {agent.basicInfo?.lastName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{agent.basicInfo?.email}</p>
                      {agent.basicInfo?.freightLicenseNumber && (
                        <p className="text-xs text-gray-500 mt-1">License: {agent.basicInfo.freightLicenseNumber}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <button
                        onClick={() => handleApprove(agent.id, 'freight agent')}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <FaCheck className="mr-2 text-xs sm:text-sm" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(agent.id, 'freight agent')}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <FaTimes className="mr-2 text-xs sm:text-sm" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderLinkedAgents = () => {
    if (linkedAgents.verifiers.length === 0 && linkedAgents.freightAgents.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8">
          <FaUsers className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-gray-500">No linked agents</p>
        </div>
      );
    }
    
    // Define tabs based on company type
    const companyTabs = user.role === 'exporter' ? [
      { id: 'overview', name: 'Overview' },
      { id: 'companyDetails', name: 'Company Details' },
      { id: 'subjectMatterScope', name: 'Subject Matter Scope' },
      { id: 'eudrDefinitions', name: 'EUDR Definitions' },
      { id: 'informationRequirements', name: 'Info Requirements' },
      { id: 'newShipmentOrigin', name: 'New Shipment Origin' },
      { id: 'shipments', name: 'Shipments' },
      { id: 'reports', name: 'Reports' },
      { id: 'gpsCamera', name: 'GPS Camera' },
      { id: 'supplyChain', name: 'Supply Chain' }
    ] : [
      { id: 'overview', name: 'Overview' },
      { id: 'companyDetails', name: 'Company Details' },
      { id: 'subjectMatterScope', name: 'Subject Matter Scope' },
      { id: 'dueDiligence', name: 'Due Diligence' },
      { id: 'riskAssessment', name: 'Risk Assessment' },
      { id: 'riskMitigation', name: 'Risk Mitigation' },
      { id: 'shipments', name: 'Shipments' },
      { id: 'reports', name: 'Reports' },
      { id: 'gpsCamera', name: 'GPS Camera' },
      { id: 'supplyChain', name: 'Supply Chain' }
    ];
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Verifiers */}
        {linkedAgents.verifiers.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 px-1">Linked Verifiers</h3>
            <div className="space-y-3 sm:space-y-4">
              {linkedAgents.verifiers.map((verifier) => {
                const currentAccessTabs = verifier.accessTabs || {};
                
                return (
                  <div key={verifier.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 sm:p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUsers className="text-orange-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {demoData.users[verifier.id]?.basicInfo?.firstName} {demoData.users[verifier.id]?.basicInfo?.lastName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{demoData.users[verifier.id]?.basicInfo?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => setExpandedAgent(expandedAgent === verifier.id ? null : verifier.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center"
                          >
                            <span className="sm:hidden mr-1">
                              {expandedAgent === verifier.id ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                            <span>{expandedAgent === verifier.id ? 'Hide' : 'View Details'}</span>
                          </button>
                          <button
                            onClick={() => handleToggleAccess(verifier.id, 'verifier', verifier.accessStatus)}
                            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${
                              verifier.accessStatus 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {verifier.accessStatus ? (
                              <>
                                <FaToggleOn className="text-sm" />
                                <span className="hidden xs:inline">Active</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOff className="text-sm" />
                                <span className="hidden xs:inline">Inactive</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedAgent === verifier.id && (
                      <div className="p-3 sm:p-4 border-t border-gray-200">
                        {/* Documents */}
                        <div className="mb-4 sm:mb-6">
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Documents</h5>
                          <div className="space-y-2">
                            {demoData.users[verifier.id]?.bioData?.documents?.identification?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                  <FaFilePdf className="text-red-500 flex-shrink-0 text-xs sm:text-sm" />
                                  <span className="text-xs sm:text-sm truncate">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
                                >
                                  <FaEye className="text-sm" />
                                </a>
                              </div>
                            ))}
                            
                            {demoData.users[verifier.id]?.bioData?.documents?.professionalCertificates?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                  <FaFilePdf className="text-red-500 flex-shrink-0 text-xs sm:text-sm" />
                                  <span className="text-xs sm:text-sm truncate">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
                                >
                                  <FaEye className="text-sm" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tab Access Control */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Access Permissions</h5>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Toggle access to dashboard tabs:
                          </p>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            {companyTabs.map((tab) => (
                              <div key={tab.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg">
                                <span className="text-xs sm:text-sm truncate mr-2">{tab.name}</span>
                                <button
                                  onClick={() => handleToggleTabAccess(verifier.id, 'verifier', tab.id, currentAccessTabs[tab.id])}
                                  className={`w-8 sm:w-10 h-5 sm:h-6 rounded-full relative flex-shrink-0 ${currentAccessTabs[tab.id] 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'}`}
                                  title={currentAccessTabs[tab.id] ? 'Access enabled' : 'Access disabled'}
                                >
                                  <div className={`absolute top-0.5 w-4 h-4 sm:w-4 sm:h-4 rounded-full bg-white transition-transform ${
                                    currentAccessTabs[tab.id] 
                                      ? 'translate-x-4 sm:translate-x-5' 
                                      : 'translate-x-1'
                                  }`}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            {Object.values(currentAccessTabs).filter(Boolean).length} of {companyTabs.length} tabs enabled
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Freight Agents */}
        {linkedAgents.freightAgents.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 px-1">Linked Freight Agents</h3>
            <div className="space-y-3 sm:space-y-4">
              {linkedAgents.freightAgents.map((agent) => {
                const currentAccessTabs = agent.accessTabs || {};
                
                return (
                  <div key={agent.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 sm:p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUsers className="text-purple-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {demoData.users[agent.id]?.basicInfo?.firstName} {demoData.users[agent.id]?.basicInfo?.lastName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{demoData.users[agent.id]?.basicInfo?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center"
                          >
                            <span className="sm:hidden mr-1">
                              {expandedAgent === agent.id ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                            <span>{expandedAgent === agent.id ? 'Hide' : 'View Details'}</span>
                          </button>
                          <button
                            onClick={() => handleToggleAccess(agent.id, 'freight agent', agent.accessStatus)}
                            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${
                              agent.accessStatus 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {agent.accessStatus ? (
                              <>
                                <FaToggleOn className="text-sm" />
                                <span className="hidden xs:inline">Active</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOff className="text-sm" />
                                <span className="hidden xs:inline">Inactive</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedAgent === agent.id && (
                      <div className="p-3 sm:p-4 border-t border-gray-200">
                        {/* Documents */}
                        <div className="mb-4 sm:mb-6">
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Documents</h5>
                          <div className="space-y-2">
                            {demoData.users[agent.id]?.bioData?.documents?.identification?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                  <FaFilePdf className="text-red-500 flex-shrink-0 text-xs sm:text-sm" />
                                  <span className="text-xs sm:text-sm truncate">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
                                >
                                  <FaEye className="text-sm" />
                                </a>
                              </div>
                            ))}
                            
                            {demoData.users[agent.id]?.bioData?.documents?.freightLicense?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                  <FaFilePdf className="text-red-500 flex-shrink-0 text-xs sm:text-sm" />
                                  <span className="text-xs sm:text-sm truncate">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
                                >
                                  <FaEye className="text-sm" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tab Access Control */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Access Permissions</h5>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Toggle access to dashboard tabs:
                          </p>
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            {companyTabs.map((tab) => (
                              <div key={tab.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg">
                                <span className="text-xs sm:text-sm truncate mr-2">{tab.name}</span>
                                <button
                                  onClick={() => handleToggleTabAccess(agent.id, 'freight agent', tab.id, currentAccessTabs[tab.id])}
                                  className={`w-8 sm:w-10 h-5 sm:h-6 rounded-full relative flex-shrink-0 ${currentAccessTabs[tab.id] 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'}`}
                                  title={currentAccessTabs[tab.id] ? 'Access enabled' : 'Access disabled'}
                                >
                                  <div className={`absolute top-0.5 w-4 h-4 sm:w-4 sm:h-4 rounded-full bg-white transition-transform ${
                                    currentAccessTabs[tab.id] 
                                      ? 'translate-x-4 sm:translate-x-5' 
                                      : 'translate-x-1'
                                  }`}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            {Object.values(currentAccessTabs).filter(Boolean).length} of {companyTabs.length} tabs enabled
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-full overflow-hidden"
    >
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Agent Management</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage verifiers and freight agents access to your company</p>
      </div>
      
      {/* Navigation Tabs - Mobile Dropdown */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <span className="font-medium">
            {activeTab === "linked" ? "Linked Agents" : "Pending Requests"}
          </span>
          {mobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {mobileMenuOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setActiveTab("linked");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center space-x-2 ${
                activeTab === "linked" ? "bg-green-50 text-green-600" : "text-gray-600"
              }`}
            >
              <FaUserCheck />
              <span>Linked Agents ({linkedAgents.verifiers.length + linkedAgents.freightAgents.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pending");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center space-x-2 border-t border-gray-100 ${
                activeTab === "pending" ? "bg-green-50 text-green-600" : "text-gray-600"
              }`}
            >
              <FaUserClock />
              <span>Pending Requests ({pendingAgents.verifiers.length + pendingAgents.freightAgents.length})</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs - Desktop */}
      <div className="hidden sm:flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("linked")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 ${
            activeTab === "linked" 
              ? "text-green-600 border-b-2 border-green-600" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FaUserCheck />
          <span>Linked Agents ({linkedAgents.verifiers.length + linkedAgents.freightAgents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 ${
            activeTab === "pending" 
              ? "text-green-600 border-b-2 border-green-600" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FaUserClock />
          <span>Pending Requests ({pendingAgents.verifiers.length + pendingAgents.freightAgents.length})</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="mt-4 sm:mt-6">
        {activeTab === "linked" && renderLinkedAgents()}
        {activeTab === "pending" && renderPendingAgents()}
      </div>
      
      {/* Info Section */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">How it works:</h4>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Review and approve/reject pending agent requests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Manage access status for linked agents (Active/Inactive)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Control which dashboard tabs each agent can access</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>All changes are saved immediately and reflected in the agent's access</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AgentManagement;
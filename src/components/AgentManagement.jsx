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
  FaFilePdf 
} from "react-icons/fa";
import { useUserStore } from "../store/useUserStore";

const AgentManagement = () => {
  const { user, demoData, getCompanyPendingAgents, getCompanyLinkedAgents, updateAgentAccess, updateAgentTabAccess, updateAgentAccessStatus } = useUserStore();
  const [activeTab, setActiveTab] = useState("linked");
  const [expandedAgent, setExpandedAgent] = useState(null);
  
  if (!user || (user.role !== 'importer' && user.role !== 'exporter')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="text-center py-12">
          <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
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
      // Refresh the view
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleReject = (agentId, agentRole) => {
    const result = updateAgentAccess(companyId, agentId, agentRole, false);
    if (result.success) {
      alert(result.message);
      // Refresh the view
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleToggleAccess = (agentId, agentRole, currentStatus) => {
    const result = updateAgentAccessStatus(companyId, agentId, agentRole, !currentStatus);
    if (result.success) {
      alert(result.message);
      // Refresh the view
      setExpandedAgent(null);
    } else {
      alert(result.message);
    }
  };
  
  const handleToggleTabAccess = (agentId, agentRole, tab, currentAccess) => {
    const result = updateAgentTabAccess(companyId, agentId, agentRole, tab, !currentAccess);
    if (result.success) {
      // Update local state for immediate UI feedback
      const updatedAgents = { ...linkedAgents };
      if (agentRole === 'verifier') {
        const verifierIndex = updatedAgents.verifiers.findIndex(v => v.id === agentId);
        if (verifierIndex >= 0) {
          updatedAgents.verifiers[verifierIndex].accessTabs[tab] = !currentAccess;
        }
      } else if (agentRole === 'freight agent') {
        const agentIndex = updatedAgents.freightAgents.findIndex(f => f.id === agentId);
        if (agentIndex >= 0) {
          updatedAgents.freightAgents[agentIndex].accessTabs[tab] = !currentAccess;
        }
      }
      // The store update will trigger a re-render
    } else {
      alert(result.message);
    }
  };
  
  const renderPendingAgents = () => {
    if (pendingAgents.verifiers.length === 0 && pendingAgents.freightAgents.length === 0) {
      return (
        <div className="text-center py-8">
          <FaUserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No pending agent requests</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Verifiers */}
        {pendingAgents.verifiers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Verifiers</h3>
            <div className="space-y-4">
              {pendingAgents.verifiers.map((verifier) => (
                <div key={verifier.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {verifier.basicInfo?.firstName} {verifier.basicInfo?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{verifier.basicInfo?.email}</p>
                      {verifier.basicInfo?.agencyDepartmentId && (
                        <p className="text-xs text-gray-500">Agency ID: {verifier.basicInfo.agencyDepartmentId}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(verifier.id, 'verifier')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(verifier.id, 'verifier')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-2" />
                        Reject
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Freight Agents</h3>
            <div className="space-y-4">
              {pendingAgents.freightAgents.map((agent) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {agent.basicInfo?.firstName} {agent.basicInfo?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{agent.basicInfo?.email}</p>
                      {agent.basicInfo?.freightLicenseNumber && (
                        <p className="text-xs text-gray-500">License: {agent.basicInfo.freightLicenseNumber}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(agent.id, 'freight agent')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(agent.id, 'freight agent')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-2" />
                        Reject
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
        <div className="text-center py-8">
          <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No linked agents</p>
        </div>
      );
    }
    
    // Define tabs based on company type - FIXED to match actual state structure
    const companyTabs = user.role === 'exporter' ? [
      { id: 'overview', name: 'Overview' },
      { id: 'companyDetails', name: 'Company Details' },
      { id: 'subjectMatterScope', name: 'Subject Matter Scope' },
      { id: 'eudrDefinitions', name: 'EUDR Definitions' },
      { id: 'informationRequirements', name: 'Information Requirements' },
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
      <div className="space-y-6">
        {/* Verifiers */}
        {linkedAgents.verifiers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Linked Verifiers</h3>
            <div className="space-y-4">
              {linkedAgents.verifiers.map((verifier) => {
                // Get current access tabs from the company's data (SINGLE SOURCE OF TRUTH)
                const currentAccessTabs = verifier.accessTabs || {};
                
                return (
                  <div key={verifier.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <FaUsers className="text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {demoData.users[verifier.id]?.basicInfo?.firstName} {demoData.users[verifier.id]?.basicInfo?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{demoData.users[verifier.id]?.basicInfo?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setExpandedAgent(expandedAgent === verifier.id ? null : verifier.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedAgent === verifier.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          onClick={() => handleToggleAccess(verifier.id, 'verifier', verifier.accessStatus)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${verifier.accessStatus 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'}`}
                        >
                          {verifier.accessStatus ? (
                            <>
                              <FaToggleOn />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <FaToggleOff />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {expandedAgent === verifier.id && (
                      <div className="p-4 border-t border-gray-200">
                        {/* Documents */}
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-700 mb-3">Documents</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {demoData.users[verifier.id]?.bioData?.documents?.identification?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FaFilePdf className="text-red-500" />
                                  <span className="text-sm">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEye />
                                </a>
                              </div>
                            ))}
                            
                            {demoData.users[verifier.id]?.bioData?.documents?.professionalCertificates?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FaFilePdf className="text-red-500" />
                                  <span className="text-sm">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEye />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tab Access Control */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Access Permissions</h5>
                          <p className="text-sm text-gray-600 mb-4">
                            Toggle access to specific dashboard tabs for this verifier:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {companyTabs.map((tab) => (
                              <div key={tab.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <span className="text-sm">{tab.name}</span>
                                <button
                                  onClick={() => handleToggleTabAccess(verifier.id, 'verifier', tab.id, currentAccessTabs[tab.id])}
                                  className={`w-10 h-6 rounded-full relative ${currentAccessTabs[tab.id] 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'}`}
                                  title={currentAccessTabs[tab.id] ? 'Access enabled' : 'Access disabled'}
                                >
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${currentAccessTabs[tab.id] 
                                    ? 'translate-x-5' 
                                    : 'translate-x-1'}`}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-4">
                            Current access: {Object.values(currentAccessTabs).filter(Boolean).length} of {companyTabs.length} tabs enabled
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Linked Freight Agents</h3>
            <div className="space-y-4">
              {linkedAgents.freightAgents.map((agent) => {
                // Get current access tabs from the company's data (SINGLE SOURCE OF TRUTH)
                const currentAccessTabs = agent.accessTabs || {};
                
                return (
                  <div key={agent.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaUsers className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {demoData.users[agent.id]?.basicInfo?.firstName} {demoData.users[agent.id]?.basicInfo?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{demoData.users[agent.id]?.basicInfo?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedAgent === agent.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          onClick={() => handleToggleAccess(agent.id, 'freight agent', agent.accessStatus)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${agent.accessStatus 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'}`}
                        >
                          {agent.accessStatus ? (
                            <>
                              <FaToggleOn />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <FaToggleOff />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {expandedAgent === agent.id && (
                      <div className="p-4 border-t border-gray-200">
                        {/* Documents */}
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-700 mb-3">Documents</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {demoData.users[agent.id]?.bioData?.documents?.identification?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FaFilePdf className="text-red-500" />
                                  <span className="text-sm">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEye />
                                </a>
                              </div>
                            ))}
                            
                            {demoData.users[agent.id]?.bioData?.documents?.freightLicense?.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FaFilePdf className="text-red-500" />
                                  <span className="text-sm">{doc.name}</span>
                                </div>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEye />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tab Access Control */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">Access Permissions</h5>
                          <p className="text-sm text-gray-600 mb-4">
                            Toggle access to specific dashboard tabs for this freight agent:
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {companyTabs.map((tab) => (
                              <div key={tab.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <span className="text-sm">{tab.name}</span>
                                <button
                                  onClick={() => handleToggleTabAccess(agent.id, 'freight agent', tab.id, currentAccessTabs[tab.id])}
                                  className={`w-10 h-6 rounded-full relative ${currentAccessTabs[tab.id] 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'}`}
                                  title={currentAccessTabs[tab.id] ? 'Access enabled' : 'Access disabled'}
                                >
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${currentAccessTabs[tab.id] 
                                    ? 'translate-x-5' 
                                    : 'translate-x-1'}`}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-4">
                            Current access: {Object.values(currentAccessTabs).filter(Boolean).length} of {companyTabs.length} tabs enabled
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
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agent Management</h2>
          <p className="text-gray-600">Manage verifiers and freight agents access to your company</p>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("linked")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 ${activeTab === "linked" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          <FaUserCheck />
          <span>Linked Agents ({linkedAgents.verifiers.length + linkedAgents.freightAgents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 ${activeTab === "pending" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          <FaUserClock />
          <span>Pending Requests ({pendingAgents.verifiers.length + pendingAgents.freightAgents.length})</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="mt-6">
        {activeTab === "linked" && renderLinkedAgents()}
        {activeTab === "pending" && renderPendingAgents()}
      </div>
      
      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Review and approve/reject pending agent requests</li>
          <li>• Manage access status for linked agents (Active/Inactive)</li>
          <li>• Control which dashboard tabs each agent can access</li>
          <li>• All changes are saved immediately and reflected in the agent's access</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AgentManagement;
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FaSearch, 
  FaBuilding, 
  FaIdCard, 
  FaPaperPlane, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUserTie,
  FaTruck,
  FaBox,
  FaShippingFast,
  FaHistory,
  FaExclamationTriangle,
  FaTimes,
  FaEye
} from "react-icons/fa";
import { useUserStore } from "../store/useUserStore";

const AgentRequests = () => {
  const { user, requestCompanyAccess, getCompanyByTraceRxId, getAgentPendingRequests, getAgentLinkedCompanies } = useUserStore();
  const [traceRxId, setTraceRxId] = useState("");
  const [companyRole, setCompanyRole] = useState("exporter");
  const [foundCompany, setFoundCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeTab, setActiveTab] = useState("send"); // "send", "history", or "access"
  const [alreadyLinkedMessage, setAlreadyLinkedMessage] = useState("");
  
  const resultRef = useRef(null);
  const linkedCompanies = getAgentLinkedCompanies(user?.id || '');
  
  useEffect(() => {
    // Scroll to result when foundCompany changes
    if (foundCompany && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [foundCompany]);

  if (!user || (user.role !== 'verifier' && user.role !== 'freight agent')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="text-center py-12">
          <FaUserTie className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            This feature is only available for Verifiers and Freight Agents.
          </p>
        </div>
      </motion.div>
    );
  }
  
  const pendingRequests = getAgentPendingRequests(user.id);
  
  const handleSearchCompany = () => {
    setLoading(true);
    setSearchError("");
    setFoundCompany(null);
    setAlreadyLinkedMessage("");
    
    if (!traceRxId.trim()) {
      setSearchError("Please enter a TraceRx ID");
      setLoading(false);
      return;
    }
    
    const company = getCompanyByTraceRxId(traceRxId);
    
    if (!company) {
      setSearchError("Company not found with this TraceRx ID");
      setLoading(false);
      return;
    }
    
    if (company.role !== companyRole) {
      setSearchError(`This company is not a ${companyRole}. It is a ${company.role}.`);
      setLoading(false);
      return;
    }
    
    // Check if already linked
    const isAlreadyLinked = linkedCompanies.some(link => link.companyId === company.id);
    if (isAlreadyLinked) {
      setAlreadyLinkedMessage(`You already have access to ${company.basicInfo.companyName}`);
    }
    
    setFoundCompany(company);
    setLoading(false);
  };
  
  const handleSendRequest = () => {
    if (!foundCompany) return;
    
    const result = requestCompanyAccess(user.id, companyRole, traceRxId);
    
    if (result.success) {
      alert(result.message);
      setTraceRxId("");
      setFoundCompany(null);
      setActiveTab("history");
    } else {
      alert(result.message);
    }
  };
  
  const handleClearResult = () => {
    setFoundCompany(null);
    setAlreadyLinkedMessage("");
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
            <FaCheckCircle className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Unknown
          </span>
        );
    }
  };
  
  const getCompanyIcon = (companyType) => {
    if (companyType === 'exporter') {
      return <FaShippingFast className="text-green-600" />;
    } else {
      return <FaBox className="text-blue-600" />;
    }
  };
  
  const getCompanyTypeColor = (companyType) => {
    if (companyType === 'exporter') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };
  
  const renderSendRequest = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">How to request access</h4>
            <p className="text-sm text-blue-700">
              1. Enter the TraceRx ID of the company you want to access<br />
              2. Select the company type (Exporter or Importer)<br />
              3. Click "Search Company" to verify<br />
              4. If found, click "Send Request" to submit your access request
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Type
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setCompanyRole("exporter")}
              className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${
                companyRole === "exporter"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaShippingFast className="mr-2" />
              Exporter
            </button>
            <button
              onClick={() => setCompanyRole("importer")}
              className={`flex-1 flex items-center justify-center p-3 rounded-lg border ${
                companyRole === "importer"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaBox className="mr-2" />
              Importer
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TraceRx Identification Number *
          </label>
          <div className="relative">
            <div className="flex items-center">
              <div className="absolute left-3 text-gray-400">
                <FaIdCard />
              </div>
              <input
                type="text"
                value={traceRxId}
                onChange={(e) => setTraceRxId(e.target.value.toUpperCase())}
                placeholder={`Enter ${companyRole === 'exporter' ? 'EX' : 'IM'}...`}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSearchCompany}
        disabled={loading || !traceRxId}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center"
      >
        <FaSearch className="mr-2" />
        {loading ? "Searching..." : "Search Company"}
      </button>
      
      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{searchError}</p>
        </div>
      )}
      
      {foundCompany && (
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-green-200 rounded-lg p-4 bg-green-50 relative"
        >
          <button
            onClick={handleClearResult}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <FaTimes />
          </button>
          
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 border border-green-200">
                {getCompanyIcon(foundCompany.role)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{foundCompany.basicInfo.companyName}</h4>
                <p className="text-sm text-gray-600">{foundCompany.traceRxId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{foundCompany.basicInfo.country}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium truncate">{foundCompany.basicInfo.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium capitalize">{foundCompany.role}</p>
            </div>
          </div>
          
          {alreadyLinkedMessage ? (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-700">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span className="text-sm">{alreadyLinkedMessage}</span>
              </div>
              <button
                onClick={handleClearResult}
                className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Search Another Company
              </button>
            </div>
          ) : (
            <button
              onClick={handleSendRequest}
              className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center"
            >
              <FaPaperPlane className="mr-2" />
              Send Access Request
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
  
  const renderRequestHistory = () => {
    if (pendingRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No access requests found</p>
          <p className="text-sm text-gray-400 mt-1">Send your first request using the "Send Request" tab</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {pendingRequests.map((request, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getCompanyIcon(request.companyType)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{request.companyName}</h4>
                  <p className="text-sm text-gray-600">
                    {request.companyType === 'exporter' ? 'Exporter' : 'Importer'} • {request.traceRxId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested on {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                {getStatusBadge(request.status)}
              </div>
            </div>
            
            {request.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-yellow-700">
                  <FaClock className="mr-2" />
                  Your request is pending approval from the company administrator
                </div>
              </div>
            )}
            
            {request.status === 'rejected' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-red-700">
                  <FaTimesCircle className="mr-2" />
                  Your request was rejected by the company
                </div>
              </div>
            )}
            
            {request.status === 'active' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-green-700">
                  <FaCheckCircle className="mr-2" />
                  Request approved! You can now access this company's dashboard
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderCompaniesWithAccess = () => {
    if (linkedCompanies.length === 0) {
      return (
        <div className="text-center py-8">
          <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No companies with access found</p>
          <p className="text-sm text-gray-400 mt-1">Send requests to companies using the "Send Request" tab</p>
        </div>
      );
    }
    
    // Separate companies by type
    const exporters = linkedCompanies.filter(company => company.companyType === 'exporter');
    const importers = linkedCompanies.filter(company => company.companyType === 'importer');
    
    return (
      <div className="space-y-6">
        {/* Exporters Section */}
        {exporters.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FaShippingFast className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Exporters ({exporters.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exporters.map((company, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{company.companyName}</h4>
                      <p className="text-sm text-gray-600">{company.traceRxId}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompanyTypeColor('exporter')}`}>
                      Exporter
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaIdCard className="mr-2 text-gray-400" />
                      <span>ID: {company.traceRxId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBuilding className="mr-2 text-gray-400" />
                      <span>Type: Exporter</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-green-700">
                      <FaCheckCircle className="mr-2" />
                      <span>Access Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Importers Section */}
        {importers.length > 0 && (
          <div>
            <div className="flex items-center mb-4 mt-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaBox className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Importers ({importers.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importers.map((company, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{company.companyName}</h4>
                      <p className="text-sm text-gray-600">{company.traceRxId}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompanyTypeColor('importer')}`}>
                      Importer
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaIdCard className="mr-2 text-gray-400" />
                      <span>ID: {company.traceRxId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBuilding className="mr-2 text-gray-400" />
                      <span>Type: Importer</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-green-700">
                      <FaCheckCircle className="mr-2" />
                      <span>Access Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Access Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{exporters.length}</div>
              <div className="text-sm text-gray-600">Exporters</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importers.length}</div>
              <div className="text-sm text-gray-600">Importers</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            You have access to {linkedCompanies.length} companies in total.
          </p>
        </div>
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
          <h2 className="text-2xl font-bold text-gray-800">Company Access Requests</h2>
          <p className="text-gray-600">
            {user.role === 'verifier' ? 'Verifier' : 'Freight Agent'}: {user.basicInfo?.firstName} {user.basicInfo?.lastName}
          </p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          {user.role === 'verifier' ? (
            <FaUserTie className="text-green-600 text-xl" />
          ) : (
            <FaTruck className="text-green-600 text-xl" />
          )}
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("send")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === "send" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          <FaPaperPlane />
          <span>Send Request</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === "history" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          <FaHistory />
          <span>Request History ({pendingRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("access")}
          className={`px-4 py-2 font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === "access" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          <FaBuilding />
          <span>Companies with Access ({linkedCompanies.length})</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="mt-6">
        {activeTab === "send" && renderSendRequest()}
        {activeTab === "history" && renderRequestHistory()}
        {activeTab === "access" && renderCompaniesWithAccess()}
      </div>
      
      {/* Info Box */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Send access requests to companies using their TraceRx ID</li>
          <li>• Company administrators will review and approve/reject your request</li>
          <li>• Once approved, you can login on behalf of that company</li>
          <li>• Company admins can control which tabs you can access</li>
          <li>• View all companies you have access to in the "Companies with Access" tab</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AgentRequests;
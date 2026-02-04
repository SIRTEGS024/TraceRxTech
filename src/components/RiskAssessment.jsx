import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import { FiUpload, FiTrash2, FiFile, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RiskAssessment = () => {
  const { user, demoData } = useUserStore();
  const [riskData, setRiskData] = useState({});
  const [supplierRecords, setSupplierRecords] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);

  const years = ['2021', '2022', '2023', '2024', '2025'];
  const riskLevels = ['no risk', 'negligible risk', 'high risk'];

  useEffect(() => {
    console.log("DEBUG: User object:", user);
    console.log("DEBUG: Demo data:", demoData);
    
    if (user?.role === 'importer' || (user?.role === 'verifier' && user?.loggedInAs?.companyType === 'importer')) {
      let companyId;
      
      // Check if logged in as a company
      if (user.loggedInAs?.companyId) {
        companyId = user.loggedInAs.companyId;
        console.log("DEBUG: Logged in as company with ID:", companyId);
      } else {
        // User is logged in as themselves (importer)
        companyId = user.id;
        console.log("DEBUG: Logged in as self with ID:", companyId);
      }
      
      const company = demoData.users[companyId];
      console.log("DEBUG: Found company:", company);
      
      if (company) {
        console.log("DEBUG: Company supplierRecords:", company.supplierRecords);
        console.log("DEBUG: Company riskAssessment:", company.riskAssessment);
        
        setSupplierRecords(company.supplierRecords || {});
        setRiskData(company.riskAssessment || {});
      }
    }
  }, [user, demoData]);

  const toggleYearExpansion = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const handleRiskLevelChange = (year, supplierId, riskLevel) => {
    if (!user) return;

    const companyId = user.loggedInAs?.companyId || user.id;
    const company = demoData.users[companyId];
    
    if (!company) return;

    const updatedRiskData = { ...riskData };

    if (!updatedRiskData[year]) {
      updatedRiskData[year] = [];
    }

    const existingIndex = updatedRiskData[year].findIndex(item => item.supplierId === supplierId);

    if (existingIndex >= 0) {
      updatedRiskData[year][existingIndex] = {
        ...updatedRiskData[year][existingIndex],
        riskLevel
      };
    } else {
      // Create new risk assessment entry
      const trade = getTradeDetails(year, supplierId);
      if (trade) {
        updatedRiskData[year].push({
          supplierId,
          riskLevel,
          assessmentDocs: []
        });
      }
    }

    setRiskData(updatedRiskData);
    toast.success(`Risk level updated to ${riskLevel}`);
  };

  const getTradeDetails = (year, supplierId) => {
    const yearRecords = supplierRecords[year] || [];
    return yearRecords.find(record => record.supplierId === supplierId);
  };

  const openUploadModal = (year, supplierId) => {
    const trade = getTradeDetails(year, supplierId);
    if (trade) {
      setSelectedTrade({ year, supplierId, trade });
      setShowUploadModal(true);
    }
  };

  const handleDocumentUpload = () => {
    if (!documentName.trim() || !selectedTrade) {
      toast.error('Please enter a document name');
      return;
    }

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      const { year, supplierId } = selectedTrade;
      const updatedRiskData = { ...riskData };

      if (!updatedRiskData[year]) {
        updatedRiskData[year] = [];
      }

      const supplierIndex = updatedRiskData[year].findIndex(item => item.supplierId === supplierId);

      if (supplierIndex >= 0) {
        if (!updatedRiskData[year][supplierIndex].assessmentDocs) {
          updatedRiskData[year][supplierIndex].assessmentDocs = [];
        }

        const newDocument = {
          name: documentName,
          url: `https://cloud-storage.com/docs/risk/${year}-${supplierId}-${Date.now()}.pdf`
        };

        updatedRiskData[year][supplierIndex].assessmentDocs.push(newDocument);
      } else {
        // Create new risk assessment entry with default risk level
        updatedRiskData[year].push({
          supplierId,
          riskLevel: 'no risk',
          assessmentDocs: [{
            name: documentName,
            url: `https://cloud-storage.com/docs/risk/${year}-${supplierId}-${Date.now()}.pdf`
          }]
        });
      }

      setRiskData(updatedRiskData);
      setDocumentName('');
      setShowUploadModal(false);
      setUploading(false);
      toast.success('Document uploaded successfully');
    }, 1000);
  };

  const deleteDocument = (year, supplierId, docIndex) => {
    const updatedRiskData = { ...riskData };
    const supplierIndex = updatedRiskData[year].findIndex(item => item.supplierId === supplierId);

    if (supplierIndex >= 0 && updatedRiskData[year][supplierIndex].assessmentDocs) {
      updatedRiskData[year][supplierIndex].assessmentDocs.splice(docIndex, 1);
      setRiskData(updatedRiskData);
      toast.success('Document deleted');
    }
  };

  const getRiskLevelForTrade = (year, supplierId) => {
    const yearData = riskData[year] || [];
    const tradeData = yearData.find(item => item.supplierId === supplierId);
    return tradeData?.riskLevel || 'not assessed';
  };

  const getDocumentsForTrade = (year, supplierId) => {
    const yearData = riskData[year] || [];
    const tradeData = yearData.find(item => item.supplierId === supplierId);
    return tradeData?.assessmentDocs || [];
  };

  // Check if user should see this component
  const shouldShowComponent = () => {
    if (!user) return false;
    
    if (user.role === 'importer') return true;
    
    if ((user.role === 'verifier' || user.role === 'freight agent') && 
        user.loggedInAs?.companyType === 'importer') {
      return true;
    }
    
    return false;
  };

  if (!shouldShowComponent()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">Risk Assessment</h1>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="text-center p-8">
            <FiAlertCircle className="mx-auto text-4xl text-yellow-500 mb-4" />
            <p className="text-gray-600">This feature is only available for importers.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">Risk Assessment</h1>
      
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
        <p className="text-gray-700 mb-6">
          Assess the risk level for each trade with your exporters. For each trade, select the risk level and upload supporting documents.
        </p>

        <div className="space-y-6">
          {years.map(year => {
            const yearRecords = supplierRecords[year] || [];
            const isExpanded = expandedYears[year];

            if (yearRecords.length === 0) {
              return (
                <div key={year} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Year {year}</h3>
                    <span className="text-gray-500">No trades recorded</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleYearExpansion(year)}
                >
                  <h3 className="text-lg font-semibold text-gray-800">Year {year}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {yearRecords.length} trade{yearRecords.length !== 1 ? 's' : ''}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {yearRecords.map((trade, index) => {
                      const currentRiskLevel = getRiskLevelForTrade(year, trade.supplierId);
                      const documents = getDocumentsForTrade(year, trade.supplierId);
                      const riskColor = currentRiskLevel === 'high risk' ? 'red' : 
                                      currentRiskLevel === 'negligible risk' ? 'yellow' : 
                                      currentRiskLevel === 'no risk' ? 'green' : 'gray';

                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-gray-800">{trade.tradeName}</h4>
                              <p className="text-sm text-gray-600">
                                Supplier: {trade.supplierName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Product: {trade.commonName} ({trade.netMassKg} kg)
                              </p>
                              <p className="text-sm text-gray-600">
                                Description: {trade.description}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800`}>
                              {currentRiskLevel.charAt(0).toUpperCase() + currentRiskLevel.slice(1)}
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Risk Assessment Level
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {riskLevels.map(level => (
                                <button
                                  key={level}
                                  onClick={() => handleRiskLevelChange(year, trade.supplierId, level)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    currentRiskLevel === level
                                      ? level === 'no risk'
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : level === 'negligible risk'
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Assessment Documents
                              </label>
                              <button
                                onClick={() => openUploadModal(year, trade.supplierId)}
                                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                              >
                                <FiUpload /> Upload Document
                              </button>
                            </div>
                            
                            {documents.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                            ) : (
                              <div className="space-y-2">
                                {documents.map((doc, docIndex) => (
                                  <div key={docIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      <FiFile className="text-gray-400" />
                                      <span className="text-sm text-gray-700">{doc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        View
                                      </a>
                                      <button
                                        onClick={() => deleteDocument(year, trade.supplierId, docIndex)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Risk Assessment Document
            </h3>
            
            {selectedTrade && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Trade:</span> {selectedTrade.trade.tradeName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Supplier:</span> {selectedTrade.trade.supplierName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Year:</span> {selectedTrade.year}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Risk Assessment Report, Audit Findings"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX up to 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm"
                >
                  Choose File
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setDocumentName('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleDocumentUpload}
                disabled={uploading || !documentName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RiskAssessment;
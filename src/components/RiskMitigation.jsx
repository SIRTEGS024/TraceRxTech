import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import { FiUpload, FiTrash2, FiFile, FiChevronDown, FiChevronUp, FiPlus, FiUser, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RiskMitigation = () => {
  const { user, demoData } = useUserStore();
  const [mitigationData, setMitigationData] = useState({});
  const [supplierRecords, setSupplierRecords] = useState({});
  const [riskAssessmentData, setRiskAssessmentData] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [officerData, setOfficerData] = useState({
    name: '',
    idCard: null,
    appointmentLetter: null
  });
  const [isSme, setIsSme] = useState(true);

  const years = ['2021', '2022', '2023', '2024', '2025'];
  const sections = {
    highRiskSection: {
      label: 'High Risk Section',
      parts: [
        { key: 'additionalInfo', label: 'Additional Information, Data or Documents' },
        { key: 'independentSurveys', label: 'Independent Surveys or Audits' },
        { key: 'otherMeasures', label: 'Other Measures Pertaining to Information Requirements' },
        { key: 'capacityBuilding', label: 'Capacity Building and Investments' }
      ]
    },
    policiesControls: {
      label: 'Policies, Controls and Procedures',
      parts: [
        { 
          key: 'modelPractices', 
          label: 'Model Risk Management Practices',
          subParts: {
            docs: 'Documents',
            officerInfo: 'Officer Information (Non-SME only)'
          }
        },
        { key: 'independentAudit', label: 'Independent Audit Function' }
      ]
    },
    decisionsReview: {
      label: 'Decisions on Risk Mitigation Procedures',
      parts: [
        { key: 'reviewDocs', label: 'Annual Review Documents' }
      ]
    }
  };

  useEffect(() => {
    console.log("DEBUG: User object in RiskMitigation:", user);
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
        console.log("DEBUG: Company riskMitigation:", company.riskMitigation);
        
        setSupplierRecords(company.supplierRecords || {});
        setRiskAssessmentData(company.riskAssessment || {});
        setMitigationData(company.riskMitigation || {});
      }
    }
  }, [user, demoData]);

  const toggleYearExpansion = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const getTradeDetails = (year, supplierId) => {
    const yearRecords = supplierRecords[year] || [];
    return yearRecords.find(record => record.supplierId === supplierId);
  };

  const getHighRiskTrades = (year) => {
    const yearRisks = riskAssessmentData[year] || [];
    return yearRisks.filter(risk => risk.riskLevel === 'high risk');
  };

  const openUploadModal = (year, supplierId, section, part) => {
    const trade = getTradeDetails(year, supplierId);
    if (trade) {
      setSelectedTrade({ year, supplierId, trade });
      setSelectedSection({ section, part });
      setShowUploadModal(true);
    }
  };

  const handleDocumentUpload = () => {
    if (!documentName.trim() || !selectedTrade || !selectedSection) {
      toast.error('Please enter a document name');
      return;
    }

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      const { year, supplierId } = selectedTrade;
      const { section, part } = selectedSection;
      
      const updatedMitigationData = { ...mitigationData };

      if (!updatedMitigationData[year]) {
        updatedMitigationData[year] = [];
      }

      const supplierIndex = updatedMitigationData[year].findIndex(item => item.supplierId === supplierId);

      const newDocument = {
        name: documentName,
        url: `https://cloud-storage.com/docs/mitigation/${year}-${supplierId}-${section}-${part}-${Date.now()}.pdf`
      };

      if (supplierIndex >= 0) {
        // Update existing supplier entry
        let supplierData = updatedMitigationData[year][supplierIndex];
        
        if (!supplierData[section]) {
          supplierData[section] = {};
        }

        if (section === 'policiesControls' && part === 'modelPractices') {
          if (!supplierData[section][part]) {
            supplierData[section][part] = { Docs: [] };
          }
          supplierData[section][part].Docs.push(newDocument);
          
          // Handle officer info if not SME
          if (!isSme && officerData.name) {
            supplierData[section][part].isSme = false;
            supplierData[section][part].officerName = officerData.name;
            supplierData[section][part].officerIdCard = officerData.idCard || { name: 'officer_id_card.pdf', url: '#' };
            supplierData[section][part].appointmentLetter = officerData.appointmentLetter || { name: 'appointment_letter.pdf', url: '#' };
          } else {
            supplierData[section][part].isSme = true;
          }
        } else {
          if (!supplierData[section][part]) {
            supplierData[section][part] = [];
          }
          supplierData[section][part].push(newDocument);
        }
        
        updatedMitigationData[year][supplierIndex] = supplierData;
      } else {
        // Create new supplier entry
        let newSupplierData = {
          supplierId,
          [section]: {}
        };

        if (section === 'policiesControls' && part === 'modelPractices') {
          newSupplierData[section][part] = { 
            Docs: [newDocument],
            isSme: isSme
          };
          
          if (!isSme && officerData.name) {
            newSupplierData[section][part].isSme = false;
            newSupplierData[section][part].officerName = officerData.name;
            newSupplierData[section][part].officerIdCard = officerData.idCard || { name: 'officer_id_card.pdf', url: '#' };
            newSupplierData[section][part].appointmentLetter = officerData.appointmentLetter || { name: 'appointment_letter.pdf', url: '#' };
          }
        } else {
          newSupplierData[section][part] = [newDocument];
        }

        updatedMitigationData[year].push(newSupplierData);
      }

      setMitigationData(updatedMitigationData);
      setDocumentName('');
      setOfficerData({ name: '', idCard: null, appointmentLetter: null });
      setIsSme(true);
      setShowUploadModal(false);
      setUploading(false);
      toast.success('Document uploaded successfully');
    }, 1000);
  };

  const deleteDocument = (year, supplierId, section, part, docIndex) => {
    const updatedMitigationData = { ...mitigationData };
    const supplierIndex = updatedMitigationData[year].findIndex(item => item.supplierId === supplierId);

    if (supplierIndex >= 0 && updatedMitigationData[year][supplierIndex][section]) {
      const supplierData = updatedMitigationData[year][supplierIndex];
      
      if (section === 'policiesControls' && part === 'modelPractices') {
        if (supplierData[section][part]?.Docs) {
          supplierData[section][part].Docs.splice(docIndex, 1);
        }
      } else if (supplierData[section][part]) {
        supplierData[section][part].splice(docIndex, 1);
      }
      
      setMitigationData(updatedMitigationData);
      toast.success('Document deleted');
    }
  };

  const getDocumentsForSection = (year, supplierId, section, part) => {
    const yearData = mitigationData[year] || [];
    const supplierData = yearData.find(item => item.supplierId === supplierId);
    
    if (!supplierData || !supplierData[section]) {
      if (section === 'policiesControls' && part === 'modelPractices') {
        return { Docs: [], isSme: true };
      }
      return [];
    }

    if (section === 'policiesControls' && part === 'modelPractices') {
      return supplierData[section][part] || { Docs: [], isSme: true };
    }
    
    return supplierData[section][part] || [];
  };

  const handleOfficerFileUpload = (field, file) => {
    const fileName = file.name;
    const fileUrl = `https://cloud-storage.com/docs/mitigation/officer_${field}_${Date.now()}.pdf`;
    
    setOfficerData(prev => ({
      ...prev,
      [field]: { name: fileName, url: fileUrl }
    }));
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
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">Risk Mitigation</h1>
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
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">Risk Mitigation</h1>
      
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
        <p className="text-gray-700 mb-6">
          Provide risk mitigation measures for high-risk trades. Upload documents for each section to demonstrate your risk mitigation procedures.
        </p>

        <div className="space-y-6">
          {years.map(year => {
            const highRiskTrades = getHighRiskTrades(year);
            const isExpanded = expandedYears[year];

            if (highRiskTrades.length === 0) {
              return (
                <div key={year} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Year {year}</h3>
                    <span className="text-gray-500">No high-risk trades</span>
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
                      {highRiskTrades.length} high-risk trade{highRiskTrades.length !== 1 ? 's' : ''}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-6">
                    {highRiskTrades.map((riskTrade, index) => {
                      const trade = getTradeDetails(year, riskTrade.supplierId);
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800">{trade?.tradeName}</h4>
                            <p className="text-sm text-gray-600">
                              Supplier: {trade?.supplierName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Product: {trade?.commonName} ({trade?.netMassKg} kg)
                            </p>
                          </div>

                          {/* High Risk Section */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-700 mb-3">{sections.highRiskSection.label}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {sections.highRiskSection.parts.map(part => {
                                const documents = getDocumentsForSection(year, riskTrade.supplierId, 'highRiskSection', part.key);
                                
                                return (
                                  <div key={part.key} className="border border-gray-200 rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium text-gray-700">{part.label}</span>
                                      <button
                                        onClick={() => openUploadModal(year, riskTrade.supplierId, 'highRiskSection', part.key)}
                                        className="text-green-600 hover:text-green-700 text-sm"
                                      >
                                        <FiPlus />
                                      </button>
                                    </div>
                                    
                                    {Array.isArray(documents) && documents.length === 0 ? (
                                      <p className="text-xs text-gray-500 italic">No documents</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {Array.isArray(documents) && documents.map((doc, docIndex) => (
                                          <div key={docIndex} className="flex items-center justify-between p-1">
                                            <div className="flex items-center gap-1">
                                              <FiFile className="text-gray-400 text-xs" />
                                              <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <a 
                                                href={doc.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                              >
                                                View
                                              </a>
                                              <button
                                                onClick={() => deleteDocument(year, riskTrade.supplierId, 'highRiskSection', part.key, docIndex)}
                                                className="text-red-500 hover:text-red-700 text-xs p-0.5"
                                              >
                                                <FiTrash2 />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Policies Controls */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-700 mb-3">{sections.policiesControls.label}</h5>
                            <div className="space-y-4">
                              {sections.policiesControls.parts.map(part => {
                                const data = getDocumentsForSection(year, riskTrade.supplierId, 'policiesControls', part.key);
                                
                                return (
                                  <div key={part.key} className="border border-gray-200 rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium text-gray-700">{part.label}</span>
                                      <button
                                        onClick={() => openUploadModal(year, riskTrade.supplierId, 'policiesControls', part.key)}
                                        className="text-green-600 hover:text-green-700 text-sm"
                                      >
                                        <FiPlus />
                                      </button>
                                    </div>
                                    
                                    {part.key === 'modelPractices' ? (
                                      <div>
                                        {data.isSme === false && data.officerName && (
                                          <div className="mb-3 p-2 bg-blue-50 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                              <FiUser className="text-blue-500" />
                                              <span className="text-sm font-medium text-blue-700">Officer: {data.officerName}</span>
                                            </div>
                                            <div className="text-xs text-blue-600 space-y-1">
                                              {data.officerIdCard && (
                                                <div className="flex items-center justify-between">
                                                  <span>ID Card:</span>
                                                  <a href={data.officerIdCard.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                    {data.officerIdCard.name}
                                                  </a>
                                                </div>
                                              )}
                                              {data.appointmentLetter && (
                                                <div className="flex items-center justify-between">
                                                  <span>Appointment:</span>
                                                  <a href={data.appointmentLetter.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                                    {data.appointmentLetter.name}
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {data.Docs?.length === 0 ? (
                                          <p className="text-xs text-gray-500 italic">No documents</p>
                                        ) : (
                                          <div className="space-y-1">
                                            {data.Docs?.map((doc, docIndex) => (
                                              <div key={docIndex} className="flex items-center justify-between p-1">
                                                <div className="flex items-center gap-1">
                                                  <FiFile className="text-gray-400 text-xs" />
                                                  <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                  >
                                                    View
                                                  </a>
                                                  <button
                                                    onClick={() => deleteDocument(year, riskTrade.supplierId, 'policiesControls', part.key, docIndex)}
                                                    className="text-red-500 hover:text-red-700 text-xs p-0.5"
                                                  >
                                                    <FiTrash2 />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div>
                                        {data.length === 0 ? (
                                          <p className="text-xs text-gray-500 italic">No documents</p>
                                        ) : (
                                          <div className="space-y-1">
                                            {data.map((doc, docIndex) => (
                                              <div key={docIndex} className="flex items-center justify-between p-1">
                                                <div className="flex items-center gap-1">
                                                  <FiFile className="text-gray-400 text-xs" />
                                                  <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                                  >
                                                    View
                                                  </a>
                                                  <button
                                                    onClick={() => deleteDocument(year, riskTrade.supplierId, 'policiesControls', part.key, docIndex)}
                                                    className="text-red-500 hover:text-red-700 text-xs p-0.5"
                                                  >
                                                    <FiTrash2 />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Decisions Review */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-3">{sections.decisionsReview.label}</h5>
                            {sections.decisionsReview.parts.map(part => {
                              const documents = getDocumentsForSection(year, riskTrade.supplierId, 'decisionsReview', part.key);
                              
                              return (
                                <div key={part.key} className="border border-gray-200 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">{part.label}</span>
                                    <button
                                      onClick={() => openUploadModal(year, riskTrade.supplierId, 'decisionsReview', part.key)}
                                      className="text-green-600 hover:text-green-700 text-sm"
                                    >
                                      <FiPlus />
                                    </button>
                                  </div>
                                  
                                  {documents.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">No documents</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {documents.map((doc, docIndex) => (
                                        <div key={docIndex} className="flex items-center justify-between p-1">
                                          <div className="flex items-center gap-1">
                                            <FiFile className="text-gray-400 text-xs" />
                                            <span className="text-xs text-gray-600 truncate">{doc.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <a 
                                              href={doc.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 text-xs"
                                            >
                                              View
                                            </a>
                                            <button
                                              onClick={() => deleteDocument(year, riskTrade.supplierId, 'decisionsReview', part.key, docIndex)}
                                              className="text-red-500 hover:text-red-700 text-xs p-0.5"
                                            >
                                              <FiTrash2 />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Mitigation Document
            </h3>
            
            {selectedTrade && selectedSection && (
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Section:</span> {sections[selectedSection.section]?.label}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Part:</span> {
                    sections[selectedSection.section]?.parts.find(p => p.key === selectedSection.part)?.label
                  }
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
                placeholder="e.g., Risk Mitigation Plan, Audit Report, Policy Document"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Officer Information for Non-SME */}
            {selectedSection?.section === 'policiesControls' && selectedSection?.part === 'modelPractices' && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Is your company an SME?</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSme(true)}
                      className={`px-3 py-1 text-sm rounded ${isSme ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setIsSme(false)}
                      className={`px-3 py-1 text-sm rounded ${!isSme ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {!isSme && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Officer Name *
                      </label>
                      <input
                        type="text"
                        value={officerData.name}
                        onChange={(e) => setOfficerData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name of responsible officer"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Officer ID Card
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleOfficerFileUpload('idCard', e.target.files[0])}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Appointment Letter
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleOfficerFileUpload('appointmentLetter', e.target.files[0])}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  PDF, DOC, DOCX, JPG, PNG up to 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  setOfficerData({ name: '', idCard: null, appointmentLetter: null });
                  setIsSme(true);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleDocumentUpload}
                disabled={uploading || !documentName.trim() || (!isSme && !officerData.name)}
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

export default RiskMitigation;
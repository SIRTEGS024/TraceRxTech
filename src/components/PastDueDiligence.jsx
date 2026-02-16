import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-toastify';
import { 
  FaHistory, 
  FaPlus, 
  FaChevronDown, 
  FaChevronUp, 
  FaFileAlt, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaDownload,
  FaEye,
  FaEdit,
  FaLock,
  FaLockOpen,
  FaClipboardCheck,
  FaShieldAlt,
  FaUpload,
  FaSave,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaIdCard,
  FaEnvelope,
  FaGlobe,
  FaBoxes,
  FaWeight,
  FaUser,
  FaBuilding,
  FaMapMarkerAlt,
  FaTree,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileAlt as FaFileGeneric
} from 'react-icons/fa';

const PastDueDiligence = () => {
  const { user, demoData, updateUser } = useUserStore();
  const [selectedYear, setSelectedYear] = useState('2025');
  const [expandedYears, setExpandedYears] = useState({});
  const [records, setRecords] = useState([]);
  const [exporters, setExporters] = useState({});
  const [yearRecordCounts, setYearRecordCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('start'); // 'start', 'payment', 'details', 'risk-assessment', 'risk-mitigation'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    description: '',
    commonName: '',
    scientificName: '',
    hsCodes: [],
    netMassKg: '',
    customerName: '',
    customerAddress: '',
    customerEmail: ''
  });
  const [selectedHsCodes, setSelectedHsCodes] = useState([]);
  const [showHsCodeSelector, setShowHsCodeSelector] = useState(false);
  const [hsCodeSearch, setHsCodeSearch] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState('');
  const [assessmentDocs, setAssessmentDocs] = useState([]);
  const [showAssessmentDocModal, setShowAssessmentDocModal] = useState(false);
  const [assessmentDocDesc, setAssessmentDocDesc] = useState('');
  const [riskMitigation, setRiskMitigation] = useState({
    highRiskSection: {
      additionalInfo: [],
      independentSurveys: [],
      otherMeasures: [],
      capacityBuilding: []
    },
    policiesControls: {
      modelPractices: {
        isSme: true,
        officerName: '',
        officerIdCard: null,
        appointmentLetter: null,
        Docs: []
      },
      independentAudit: []
    },
    decisionsReview: []
  });
  const [showDocModal, setShowDocModal] = useState(false);
  const [docModalData, setDocModalData] = useState({ section: '', subsection: '', description: '' });
  const [isNonSme, setIsNonSme] = useState(true);
  const [officerName, setOfficerName] = useState('');
  const [officerIdCard, setOfficerIdCard] = useState(null);
  const [appointmentLetter, setAppointmentLetter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewTab, setViewTab] = useState('importer-info'); // 'importer-info', 'exporter-info', 'risk-assessment', 'risk-mitigation'
  const [exporterRecordData, setExporterRecordData] = useState(null);

  const years = ['2021', '2022', '2023', '2024', '2025'];

  useEffect(() => {
    if (user && user.id) {
      // Get the logged in importer
      const importer = demoData.users[user.id];
      
      // Get all exporters
      const exportersMap = {};
      Object.values(demoData.users).forEach(u => {
        if (u.role === 'exporter') {
          exportersMap[u.id] = u;
        }
      });
      setExporters(exportersMap);
      
      // Get connected past records
      if (importer && importer.connectedPastRecords) {
        // Enrich records with exporter info and track counts per year
        const enrichedRecords = importer.connectedPastRecords.map(record => {
          const exporter = exportersMap[record.exporterId];
          const pastSupplierRecord = importer.pastSupplierRecords?.[record.year]?.find(
            r => r.recordId === record.recordId
          );
          
          // Get exporter's facility and past record
          let exporterFacility = null;
          let exporterPastRecord = null;
          
          if (exporter && record.facilityId) {
            exporterFacility = exporter.facilities?.find(f => f.id === record.facilityId);
            if (exporterFacility && exporterFacility.pastRecords) {
              exporterPastRecord = exporterFacility.pastRecords[record.year]?.find(
                r => r.id === record.recordId
              );
            }
          }
          
          return {
            ...record,
            exporterName: exporter?.basicInfo?.companyName || 'Unknown Exporter',
            exporterEmail: exporter?.basicInfo?.email || '',
            exporterAddress: exporter?.facilities?.find(f => f.type === 'Corporate facility')?.address || '',
            exporterFacility,
            exporterPastRecord,
            status: pastSupplierRecord ? (pastSupplierRecord.paymentStatus ? 'completed' : 'in-progress') : 'not-started',
            paymentStatus: pastSupplierRecord?.paymentStatus || false,
            hasDueDiligence: !!pastSupplierRecord,
            dueDiligenceData: pastSupplierRecord || null
          };
        });
        
        setRecords(enrichedRecords);
        
        // Calculate record counts per year
        const counts = {};
        years.forEach(year => {
          counts[year] = enrichedRecords.filter(r => r.year.toString() === year).length;
        });
        setYearRecordCounts(counts);
        
        // Expand years that have records by default
        const initialExpanded = {};
        years.forEach(year => {
          if (counts[year] > 0) {
            initialExpanded[year] = true;
          }
        });
        setExpandedYears(initialExpanded);
      }
    }
  }, [user, demoData]);

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const getRecordsByYear = (year) => {
    return records.filter(record => record.year.toString() === year);
  };

  const handleStartDueDiligence = (record) => {
    setSelectedRecord(record);
    setModalMode('start');
    setCurrentStep(1);
    setFormData({
      description: '',
      commonName: '',
      scientificName: '',
      hsCodes: [],
      netMassKg: '',
      customerName: '',
      customerAddress: '',
      customerEmail: ''
    });
    setSelectedHsCodes([]);
    setShowModal(true);
  };

  const handleContinuePayment = (record) => {
    setSelectedRecord(record);
    setModalMode('payment');
    setShowModal(true);
  };

  const handleViewDetails = (record) => {
    setViewingRecord(record);
    setModalMode('details');
    setViewTab('importer-info');
    setShowModal(true);
    
    // Set exporter record data for viewing
    if (record.exporterPastRecord) {
      setExporterRecordData(record.exporterPastRecord);
    }
  };

  const calculateAmount = (netMassKg) => {
    // $10 per 20000kg
    const amount = Math.ceil((parseFloat(netMassKg) / 20000) * 10);
    return amount;
  };

  const handleHsCodeSelect = (commodity, product) => {
    const existing = selectedHsCodes.find(
      h => h.commodity === commodity && h.code === product.code
    );
    
    if (existing) {
      setSelectedHsCodes(selectedHsCodes.filter(
        h => !(h.commodity === commodity && h.code === product.code)
      ));
    } else {
      setSelectedHsCodes([
        ...selectedHsCodes,
        {
          commodity,
          code: product.code,
          name: product.name
        }
      ]);
    }
  };

  const handleAddHsCodes = () => {
    setFormData({
      ...formData,
      hsCodes: selectedHsCodes
    });
    setShowHsCodeSelector(false);
  };

  const handleSaveImporterInfo = () => {
    // Validate required fields
    if (!formData.description || !formData.commonName || !formData.scientificName || 
        !formData.hsCodes.length || !formData.netMassKg || !formData.customerName || 
        !formData.customerAddress || !formData.customerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setModalMode('payment');
  };

  const handlePayment = () => {
    setPaymentLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Create the due diligence record
      const amount = calculateAmount(formData.netMassKg);
      
      const newRecord = {
        recordId: selectedRecord.recordId,
        supplierId: selectedRecord.exporterId,
        supplierName: selectedRecord.exporterName,
        supplierAddress: selectedRecord.exporterAddress,
        supplierEmail: selectedRecord.exporterEmail,
        description: formData.description,
        commonName: formData.commonName,
        scientificName: formData.scientificName,
        hsCodes: formData.hsCodes,
        netMassKg: parseFloat(formData.netMassKg),
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        customerEmail: formData.customerEmail,
        amount: amount,
        paymentStatus: true,
        status: 'in-progress',
        riskAssessment: null,
        riskMitigation: null
      };

      // Update the user's pastSupplierRecords
      const updatedUser = { ...demoData.users[user.id] };
      
      if (!updatedUser.pastSupplierRecords) {
        updatedUser.pastSupplierRecords = { 2021: [], 2022: [], 2023: [], 2024: [], 2025: [] };
      }
      
      if (!updatedUser.pastSupplierRecords[selectedRecord.year]) {
        updatedUser.pastSupplierRecords[selectedRecord.year] = [];
      }
      
      // Check if record already exists (update) or add new
      const existingIndex = updatedUser.pastSupplierRecords[selectedRecord.year].findIndex(
        r => r.recordId === selectedRecord.recordId
      );
      
      if (existingIndex >= 0) {
        updatedUser.pastSupplierRecords[selectedRecord.year][existingIndex] = newRecord;
      } else {
        updatedUser.pastSupplierRecords[selectedRecord.year].push(newRecord);
      }
      
      updateUser(user.id, updatedUser);
      
      // Update local records
      const updatedRecords = records.map(r => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            status: 'in-progress',
            paymentStatus: true,
            dueDiligenceData: newRecord
          };
        }
        return r;
      });
      
      setRecords(updatedRecords);
      setPaymentLoading(false);
      setModalMode('risk-assessment');
      toast.success('Payment successful! You can now proceed with risk assessment.');
    }, 2000);
  };

  const handleAddAssessmentDoc = () => {
    if (!assessmentDocDesc.trim()) {
      toast.error('Please enter a document description');
      return;
    }

    setAssessmentDocs([
      ...assessmentDocs,
      {
        name: assessmentDocDesc,
        url: 'dummy-document-url.pdf' // Dummy URL for demo
      }
    ]);

    setAssessmentDocDesc('');
    setShowAssessmentDocModal(false);
  };

  const handleRemoveAssessmentDoc = (index) => {
    setAssessmentDocs(assessmentDocs.filter((_, i) => i !== index));
  };

  const handleSaveRiskAssessment = () => {
    if (!riskLevel) {
      toast.error('Please select a risk level');
      return;
    }

    if (assessmentDocs.length === 0) {
      toast.error('Please upload at least one document to support your risk assessment');
      return;
    }

    // Update the record with risk assessment
    const updatedUser = { ...demoData.users[user.id] };
    const recordIndex = updatedUser.pastSupplierRecords[selectedRecord.year].findIndex(
      r => r.recordId === selectedRecord.recordId
    );
    
    if (recordIndex >= 0) {
      updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex].riskAssessment = {
        riskLevel,
        assessmentDocs
      };
      
      updateUser(user.id, updatedUser);
      
      // Update local records
      const updatedRecords = records.map(r => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            dueDiligenceData: {
              ...r.dueDiligenceData,
              riskAssessment: {
                riskLevel,
                assessmentDocs
              }
            }
          };
        }
        return r;
      });
      
      setRecords(updatedRecords);
      
      if (riskLevel === 'high risk') {
        setModalMode('risk-mitigation');
        setCurrentStep(1);
        toast.info('High risk detected. Please complete risk mitigation.');
      } else {
        // Complete the due diligence
        updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex].status = 'approved';
        updateUser(user.id, updatedUser);
        
        toast.success('Risk assessment complete. Due diligence finalized!');
        setShowModal(false);
        setSelectedRecord(null);
      }
    }
  };

  const handleAddDoc = () => {
    if (!docModalData.description.trim()) {
      toast.error('Please enter a document description');
      return;
    }

    const newDoc = {
      name: docModalData.description,
      url: 'dummy-document-url.pdf' // Dummy URL for demo
    };

    setRiskMitigation(prev => {
      const updated = { ...prev };
      
      if (docModalData.section === 'highRiskSection') {
        if (!updated.highRiskSection[docModalData.subsection]) {
          updated.highRiskSection[docModalData.subsection] = [];
        }
        updated.highRiskSection[docModalData.subsection].push(newDoc);
      } else if (docModalData.section === 'policiesControls') {
        if (docModalData.subsection === 'modelPractices') {
          if (!updated.policiesControls.modelPractices.Docs) {
            updated.policiesControls.modelPractices.Docs = [];
          }
          updated.policiesControls.modelPractices.Docs.push(newDoc);
        } else {
          if (!updated.policiesControls[docModalData.subsection]) {
            updated.policiesControls[docModalData.subsection] = [];
          }
          updated.policiesControls[docModalData.subsection].push(newDoc);
        }
      } else if (docModalData.section === 'decisionsReview') {
        if (!updated.decisionsReview) {
          updated.decisionsReview = [];
        }
        updated.decisionsReview.push(newDoc);
      }
      
      return updated;
    });

    setDocModalData({ section: '', subsection: '', description: '' });
    setShowDocModal(false);
    toast.success('Document added');
  };

  const handleAddOfficerIdCard = () => {
    if (!officerName.trim()) {
      toast.error('Please enter officer name');
      return;
    }

    setRiskMitigation(prev => ({
      ...prev,
      policiesControls: {
        ...prev.policiesControls,
        modelPractices: {
          ...prev.policiesControls.modelPractices,
          isSme: isNonSme,
          officerName: isNonSme ? '' : officerName,
          officerIdCard: isNonSme ? null : { name: 'Officer ID Card', url: 'dummy-id-card.pdf' },
          appointmentLetter: isNonSme ? null : { name: 'Appointment Letter', url: 'dummy-appointment.pdf' }
        }
      }
    }));

    toast.success('Officer information saved');
  };

  const handleSaveRiskMitigation = () => {
    // Update the record with risk mitigation
    const updatedUser = { ...demoData.users[user.id] };
    const recordIndex = updatedUser.pastSupplierRecords[selectedRecord.year].findIndex(
      r => r.recordId === selectedRecord.recordId
    );
    
    if (recordIndex >= 0) {
      updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex].riskMitigation = riskMitigation;
      updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex].status = 'approved';
      
      updateUser(user.id, updatedUser);
      
      toast.success('Risk mitigation complete. Due diligence finalized!');
      setShowModal(false);
      setSelectedRecord(null);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch(ext) {
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-blue-500" />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FaFileImage className="text-purple-500" />;
      default: return <FaFileGeneric className="text-gray-500" />;
    }
  };

  const renderDocumentBox = (doc, index) => (
    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {getFileIcon(doc.url)}
        <div>
          <p className="text-sm font-medium text-gray-800">{doc.name}</p>
          <p className="text-xs text-gray-500">{doc.url}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          className="p-1 text-blue-600 hover:text-blue-800"
          onClick={() => toast.info('Document viewing will be available in the final implementation')}
        >
          <FaEye size={14} />
        </button>
        <button 
          className="p-1 text-green-600 hover:text-green-800"
          onClick={() => toast.info('Document download will be available in the final implementation')}
        >
          <FaDownload size={14} />
        </button>
      </div>
    </div>
  );

  const renderExporterInfo = (record) => {
    if (!record || !record.exporterPastRecord) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No exporter information available for this record</p>
        </div>
      );
    }

    const pastRecord = record.exporterPastRecord;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <FaInfoCircle className="mr-2" /> Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{pastRecord.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Common Name</p>
              <p className="font-medium">{pastRecord.commonName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Scientific Name</p>
              <p className="font-medium">{pastRecord.scientificName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country of Production</p>
              <p className="font-medium">{pastRecord.countryOfProduction}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Production Location</p>
              <p className="font-medium">{pastRecord.productionLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Production Date Range</p>
              <p className="font-medium">{pastRecord.productionDateRange?.from || 'N/A'} to {pastRecord.productionDateRange?.to || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Mass (kg)</p>
              <p className="font-medium">{pastRecord.netMassKg?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <FaBoxes className="mr-2" /> HS Codes
          </h3>
          <div className="space-y-2">
            {pastRecord.hsCodes?.map((code, idx) => (
              <div key={idx} className="bg-white p-2 rounded border border-blue-200">
                <p className="text-sm font-medium">{code.code} - {code.name}</p>
                <p className="text-xs text-gray-600">Commodity: {code.commodity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
            <FaTree className="mr-2" /> Planting Areas
          </h3>
          <div className="space-y-4">
            {pastRecord.plantingAreas?.map((area, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                <p className="font-medium">{area.name}</p>
                <p className="text-sm text-gray-600">Hectares: {area.hectares}</p>
                <p className="text-xs text-gray-500">Coordinates: {area.coordinates?.length || 0} points</p>
              </div>
            ))}
          </div>
          {pastRecord.totalHectares && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="font-medium">Total Hectares: {pastRecord.totalHectares}</p>
            </div>
          )}
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
            <FaFileAlt className="mr-2" /> Documents
          </h3>
          <div className="space-y-3">
            {pastRecord.deforestationFreeDocs?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Deforestation-Free Documentation</p>
                {pastRecord.deforestationFreeDocs.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
            {pastRecord.legalComplianceDocs?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Legal Compliance Documentation</p>
                {pastRecord.legalComplianceDocs.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FaBuilding className="mr-2" /> Facility Information
          </h3>
          {record.exporterFacility && (
            <div>
              <p><span className="text-sm text-gray-600">Facility Name:</span> {record.exporterFacility.name}</p>
              <p><span className="text-sm text-gray-600">Facility Type:</span> {record.exporterFacility.type}</p>
              <p><span className="text-sm text-gray-600">Facility Address:</span> {record.exporterFacility.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImporterInfo = (data) => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center">
          <FaInfoCircle className="mr-2" /> Trade Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium">{data.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Common Name</p>
            <p className="font-medium">{data.commonName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scientific Name</p>
            <p className="font-medium">{data.scientificName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Mass (kg)</p>
            <p className="font-medium">{data.netMassKg.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <FaBoxes className="mr-2" /> HS Codes
        </h3>
        <div className="space-y-2">
          {data.hsCodes.map((code, idx) => (
            <div key={idx} className="bg-white p-2 rounded border border-blue-200">
              <p className="text-sm font-medium">{code.code} - {code.name}</p>
              <p className="text-xs text-gray-600">Commodity: {code.commodity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
          <FaUser className="mr-2" /> Customer Information
        </h3>
        <div className="space-y-2">
          <p><span className="text-sm text-gray-600">Name:</span> {data.customerName}</p>
          <p><span className="text-sm text-gray-600">Address:</span> {data.customerAddress}</p>
          <p><span className="text-sm text-gray-600">Email:</span> {data.customerEmail}</p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
          <FaMoneyBillWave className="mr-2" /> Payment Information
        </h3>
        <div className="space-y-2">
          <p><span className="text-sm text-gray-600">Amount Paid:</span> ${data.amount}</p>
          <p><span className="text-sm text-gray-600">Payment Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${data.paymentStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {data.paymentStatus ? 'Paid' : 'Unpaid'}
            </span>
          </p>
          <p><span className="text-sm text-gray-600">Due Diligence Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${data.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {data.status === 'approved' ? 'Approved' : 'In Progress'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderRiskAssessment = (data) => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${
          data.riskLevel === 'high risk' ? 'bg-red-50' : 
          data.riskLevel === 'low risk' ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center">
            <FaExclamationTriangle className="mr-2" /> Risk Level
          </h3>
          <p className={`text-lg font-bold ${
            data.riskLevel === 'high risk' ? 'text-red-800' : 
            data.riskLevel === 'low risk' ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <FaFileAlt className="mr-2" /> Supporting Documents
          </h3>
          <div className="space-y-3">
            {data.assessmentDocs?.map((doc, idx) => renderDocumentBox(doc, idx))}
          </div>
        </div>
      </div>
    );
  };

  const renderRiskMitigation = (data) => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {data.highRiskSection && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">High Risk Section</h3>
            
            {data.highRiskSection.additionalInfo?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Additional Information</p>
                {data.highRiskSection.additionalInfo.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
            
            {data.highRiskSection.independentSurveys?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Independent Surveys/Audits</p>
                {data.highRiskSection.independentSurveys.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
            
            {data.highRiskSection.otherMeasures?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Other Measures</p>
                {data.highRiskSection.otherMeasures.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
            
            {data.highRiskSection.capacityBuilding?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Capacity Building & Investments</p>
                {data.highRiskSection.capacityBuilding.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
          </div>
        )}

        {data.policiesControls && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Policies, Controls & Procedures</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Model Risk Management Practices</p>
              {!data.policiesControls.modelPractices?.isSme && (
                <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                  <p className="text-sm"><span className="font-medium">Officer Name:</span> {data.policiesControls.modelPractices.officerName}</p>
                  <div className="mt-2 space-y-2">
                    {data.policiesControls.modelPractices.officerIdCard && renderDocumentBox(data.policiesControls.modelPractices.officerIdCard, 'officer-id')}
                    {data.policiesControls.modelPractices.appointmentLetter && renderDocumentBox(data.policiesControls.modelPractices.appointmentLetter, 'appointment')}
                  </div>
                </div>
              )}
              {data.policiesControls.modelPractices?.Docs?.map((doc, idx) => renderDocumentBox(doc, idx))}
            </div>
            
            {data.policiesControls.independentAudit?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Independent Audit Function</p>
                {data.policiesControls.independentAudit.map((doc, idx) => renderDocumentBox(doc, idx))}
              </div>
            )}
          </div>
        )}

        {data.decisionsReview?.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Decisions on Risk Mitigation Procedures</h3>
            <p className="text-sm text-gray-600 mb-3">Reviewed at least on an annual basis</p>
            {data.decisionsReview.map((doc, idx) => renderDocumentBox(doc, idx))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">
        Past Due Diligence
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Year</h2>
          <div className="flex flex-wrap gap-3">
            {years.map(year => {
              const recordCount = yearRecordCounts[year] || 0;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-green-600 text-white'
                      : recordCount > 0
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {year}
                  {recordCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {recordCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {yearRecordCounts[selectedYear] === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No records found for {selectedYear}
            </p>
          )}
        </div>

        {yearRecordCounts[selectedYear] > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleYear(selectedYear)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Records for {selectedYear} ({yearRecordCounts[selectedYear]})
              </h3>
              {expandedYears[selectedYear] ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <AnimatePresence>
              {expandedYears[selectedYear] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {getRecordsByYear(selectedYear).map(record => (
                    <motion.div
                      key={record.recordId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">Record ID: {record.recordId}</p>
                          <h4 className="font-semibold text-gray-800">{record.exporterName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {record.dueDiligenceData?.description || record.exporterPastRecord?.description || 'No description yet'}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'completed' ? 'bg-green-100 text-green-800' :
                              record.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status === 'completed' ? 'Completed' :
                               record.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                            </span>
                            {record.paymentStatus && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                Paid
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          {record.status === 'not-started' && (
                            <button
                              onClick={() => handleStartDueDiligence(record)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <FaPlus className="mr-2" size={14} />
                              Start Due Diligence
                            </button>
                          )}
                          {record.status === 'in-progress' && !record.paymentStatus && (
                            <button
                              onClick={() => handleContinuePayment(record)}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                            >
                              <FaMoneyBillWave className="mr-2" size={14} />
                              Continue to Payment
                            </button>
                          )}
                          {record.status === 'in-progress' && record.paymentStatus && (
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <FaEye className="mr-2" size={14} />
                              View Details
                            </button>
                          )}
                          {record.status === 'completed' && (
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <FaEye className="mr-2" size={14} />
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal for Due Diligence Process */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'start' && 'Start Due Diligence'}
                  {modalMode === 'payment' && 'Complete Payment'}
                  {modalMode === 'details' && 'Due Diligence Details'}
                  {modalMode === 'risk-assessment' && 'Risk Assessment'}
                  {modalMode === 'risk-mitigation' && 'Risk Mitigation'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {modalMode === 'start' && (
                  <div className="space-y-6">
                    {currentStep === 1 && (
                      <>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-sm text-blue-800">
                            <FaInfoCircle className="inline mr-2" />
                            Please provide information about this past trade
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description (include trade name and type of products) *
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              rows="3"
                              placeholder="e.g., Import of certified mahogany logs for furniture manufacturing"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Common Name of Species *
                            </label>
                            <input
                              type="text"
                              value={formData.commonName}
                              onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Mahogany"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Scientific Name *
                            </label>
                            <input
                              type="text"
                              value={formData.scientificName}
                              onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Swietenia macrophylla"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              HS Codes (EUDR supported products) *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowHsCodeSelector(true)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
                            >
                              <span>
                                {formData.hsCodes.length > 0 
                                  ? `${formData.hsCodes.length} product(s) selected` 
                                  : 'Select HS Codes'}
                              </span>
                              <FaChevronDown />
                            </button>
                            
                            {formData.hsCodes.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {formData.hsCodes.map((code, idx) => (
                                  <div key={idx} className="bg-green-50 p-2 rounded border border-green-200">
                                    <p className="text-sm font-medium">{code.code} - {code.name}</p>
                                    <p className="text-xs text-gray-600">Commodity: {code.commodity}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Net Mass (kg) *
                            </label>
                            <input
                              type="number"
                              value={formData.netMassKg}
                              onChange={(e) => setFormData({ ...formData, netMassKg: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., 50000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Name *
                            </label>
                            <input
                              type="text"
                              value={formData.customerName}
                              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Adroitsoft Nigeria Limited"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Postal Address *
                            </label>
                            <input
                              type="text"
                              value={formData.customerAddress}
                              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., Lagos, Nigeria"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Customer Email Address *
                            </label>
                            <input
                              type="email"
                              value={formData.customerEmail}
                              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="e.g., customer@company.com"
                            />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Auto-filled supplier information:</p>
                          <p><span className="font-medium">Supplier Name:</span> {selectedRecord?.exporterName}</p>
                          <p><span className="font-medium">Supplier Email:</span> {selectedRecord?.exporterEmail}</p>
                          <p><span className="font-medium">Supplier Address:</span> {selectedRecord?.exporterAddress || 'Not available'}</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveImporterInfo}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {modalMode === 'payment' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <FaMoneyBillWave className="text-5xl text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Required</h3>
                      <p className="text-gray-600 mb-4">
                        Amount to pay: <span className="text-2xl font-bold text-green-600">
                          ${calculateAmount(formData.netMassKg || selectedRecord?.dueDiligenceData?.netMassKg || 0)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        (Calculated as $10 per 20,000kg)
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <FaInfoCircle className="inline mr-2" />
                        This is a dummy payment system for demonstration purposes. Click "Pay Now" to simulate payment.
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setModalMode('start')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === 'details' && viewingRecord && (
                  <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1">
                      <button
                        onClick={() => setViewTab('importer-info')}
                        className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                          viewTab === 'importer-info'
                            ? 'border-b-2 border-green-600 text-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Importer Information
                      </button>
                      {viewingRecord.paymentStatus && (
                        <>
                          <button
                            onClick={() => setViewTab('exporter-info')}
                            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                              viewTab === 'exporter-info'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Exporter Information
                          </button>
                          {viewingRecord.dueDiligenceData?.riskAssessment && (
                            <button
                              onClick={() => setViewTab('risk-assessment')}
                              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                                viewTab === 'risk-assessment'
                                  ? 'border-b-2 border-green-600 text-green-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Risk Assessment
                            </button>
                          )}
                          {viewingRecord.dueDiligenceData?.riskMitigation && (
                            <button
                              onClick={() => setViewTab('risk-mitigation')}
                              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                                viewTab === 'risk-mitigation'
                                  ? 'border-b-2 border-green-600 text-green-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Risk Mitigation
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                      {viewTab === 'importer-info' && renderImporterInfo(viewingRecord.dueDiligenceData)}
                      
                      {viewTab === 'exporter-info' && viewingRecord.paymentStatus && (
                        renderExporterInfo(viewingRecord)
                      )}
                      
                      {viewTab === 'risk-assessment' && viewingRecord.dueDiligenceData?.riskAssessment && (
                        renderRiskAssessment(viewingRecord.dueDiligenceData.riskAssessment)
                      )}
                      
                      {viewTab === 'risk-mitigation' && viewingRecord.dueDiligenceData?.riskMitigation && (
                        renderRiskMitigation(viewingRecord.dueDiligenceData.riskMitigation)
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === 'risk-assessment' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <FaInfoCircle className="inline mr-2" />
                        Please assess the risk level of this trade and provide supporting documentation.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Risk Level *
                      </label>
                      <div className="space-y-2">
                        {['low risk', 'negligible risk', 'high risk'].map(level => (
                          <label key={level} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name="riskLevel"
                              value={level}
                              checked={riskLevel === level}
                              onChange={(e) => setRiskLevel(e.target.value)}
                              className="h-4 w-4 text-green-600"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {level.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Supporting Documents *
                        </label>
                        <button
                          onClick={() => setShowAssessmentDocModal(true)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <FaUpload className="mr-2" size={12} />
                          Add Document
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {assessmentDocs.map((doc, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(doc.url)}
                              <span className="text-sm font-medium">{doc.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveAssessmentDoc(idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                        {assessmentDocs.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No documents added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRiskAssessment}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save & Continue
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === 'risk-mitigation' && (
                  <div className="space-y-8">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800">
                        <FaExclamationTriangle className="inline mr-2" />
                        High risk trade detected. Please complete all required risk mitigation steps.
                      </p>
                    </div>

                    {/* High Risk Section */}
                    <div className="border border-red-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-red-800 mb-4">High Risk Section</h3>
                      
                      <div className="space-y-4">
                        {/* Additional Information */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (a) Requiring additional information, data or documents
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'highRiskSection', subsection: 'additionalInfo', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>
                          <div className="space-y-2">
                            {riskMitigation.highRiskSection.additionalInfo.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>

                        {/* Independent Surveys */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (b) Carrying out independent surveys or audits
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'highRiskSection', subsection: 'independentSurveys', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>
                          <div className="space-y-2">
                            {riskMitigation.highRiskSection.independentSurveys.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>

                        {/* Other Measures */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (c) Taking other measures pertaining to information requirements
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'highRiskSection', subsection: 'otherMeasures', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>
                          <div className="space-y-2">
                            {riskMitigation.highRiskSection.otherMeasures.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>

                        {/* Capacity Building */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (d) Capacity building and investments
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'highRiskSection', subsection: 'capacityBuilding', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>
                          <div className="space-y-2">
                            {riskMitigation.highRiskSection.capacityBuilding.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Policies, Controls and Procedures */}
                    <div className="border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">Policies, Controls and Procedures</h3>
                      
                      <div className="space-y-6">
                        {/* Model Practices */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (a) Model risk management practices, reporting, record-keeping
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'policiesControls', subsection: 'modelPractices', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>

                          {/* Non-SME Section */}
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <label className="flex items-center space-x-2 mb-3">
                              <input
                                type="checkbox"
                                checked={isNonSme}
                                onChange={(e) => setIsNonSme(e.target.checked)}
                                className="h-4 w-4 text-green-600"
                              />
                              <span className="text-sm text-gray-700">I am an SME (Small or Medium Enterprise)</span>
                            </label>

                            {!isNonSme && (
                              <div className="space-y-3 mt-3">
                                <input
                                  type="text"
                                  placeholder="Name of Officer"
                                  value={officerName}
                                  onChange={(e) => setOfficerName(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleAddOfficerIdCard}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                  >
                                    Save Officer Info
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {riskMitigation.policiesControls.modelPractices.Docs?.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>

                        {/* Independent Audit */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              (b) Independent audit function
                            </label>
                            <button
                              onClick={() => {
                                setDocModalData({ section: 'policiesControls', subsection: 'independentAudit', description: '' });
                                setShowDocModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Add Document
                            </button>
                          </div>
                          <div className="space-y-2">
                            {riskMitigation.policiesControls.independentAudit?.map((doc, idx) => renderDocumentBox(doc, idx))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decisions Review */}
                    <div className="border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-green-800">
                          Decisions on Risk Mitigation Procedures and Measures
                        </h3>
                        <button
                          onClick={() => {
                            setDocModalData({ section: 'decisionsReview', subsection: '', description: '' });
                            setShowDocModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Add Document
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Reviewed at least on an annual basis</p>
                      <div className="space-y-2">
                        {riskMitigation.decisionsReview?.map((doc, idx) => renderDocumentBox(doc, idx))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRiskMitigation}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <FaSave className="mr-2" />
                        Save & Complete Due Diligence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HS Code Selector Modal */}
      <AnimatePresence>
        {showHsCodeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowHsCodeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Select HS Codes</h3>
                <button
                  onClick={() => setShowHsCodeSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search HS codes..."
                    value={hsCodeSearch}
                    onChange={(e) => setHsCodeSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  {demoData.commodities.map((commodity, idx) => {
                    const filteredProducts = commodity.products.filter(product =>
                      product.code.includes(hsCodeSearch) ||
                      product.name.toLowerCase().includes(hsCodeSearch.toLowerCase())
                    );

                    if (filteredProducts.length === 0) return null;

                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-2 rounded-t-lg font-semibold text-gray-700">
                          {commodity.commodity}
                        </div>
                        <div className="p-4 space-y-2">
                          {filteredProducts.map((product, pidx) => (
                            <label key={pidx} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedHsCodes.some(h => h.commodity === commodity.commodity && h.code === product.code)}
                                onChange={() => handleHsCodeSelect(commodity.commodity, product)}
                                className="mt-1 h-4 w-4 text-green-600"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{product.code}</p>
                                <p className="text-sm text-gray-600">{product.name}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowHsCodeSelector(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHsCodes}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Selected ({selectedHsCodes.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assessment Document Modal */}
      <AnimatePresence>
        {showAssessmentDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowAssessmentDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Supporting Document</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Description *
                    </label>
                    <input
                      type="text"
                      value={assessmentDocDesc}
                      onChange={(e) => setAssessmentDocDesc(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., Risk Assessment Report"
                      autoFocus
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <FaInfoCircle className="inline mr-2" />
                      In this demo, a dummy document will be created with the description above.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAssessmentDocModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAssessmentDoc}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Mitigation Document Modal */}
      <AnimatePresence>
        {showDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Document</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Description *
                    </label>
                    <input
                      type="text"
                      value={docModalData.description}
                      onChange={(e) => setDocModalData({ ...docModalData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., Audit Report"
                      autoFocus
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <FaInfoCircle className="inline mr-2" />
                      In this demo, a dummy document will be created with the description above.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDocModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDoc}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PastDueDiligence;
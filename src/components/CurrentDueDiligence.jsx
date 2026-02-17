import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-toastify';
import {
  FaBox, FaFileAlt, FaMoneyBillWave, FaCheckCircle,
  FaExclamationTriangle, FaUpload, FaPlus, FaTrash,
  FaArrowLeft, FaArrowRight, FaSave, FaEye, FaFilePdf, 
  FaFileImage, FaChevronRight, FaTimes, FaClipboardList,
  FaShieldAlt, FaCreditCard, FaFileSignature, FaBalanceScale
} from 'react-icons/fa';

// ---------- Helper functions ----------
const calculateTotalKg = (containers) => {
  return containers.reduce((sum, c) => sum + (Number(c.kilograms) || 0), 0);
};

const calculateAmount = (containers) => {
  return (containers.length || 0) * 100; // $100 per container
};

// ---------- Enhanced Shipment Card Component ----------
const ShipmentCard = ({ shipment, status, onClick }) => {
  const statusConfig = {
    start: { 
      text: 'Start Due Diligence', 
      color: 'bg-gradient-to-r from-emerald-500 to-green-600', 
      icon: FaPlus,
      badge: 'New'
    },
    continue: { 
      text: 'Continue to Payment', 
      color: 'bg-gradient-to-r from-amber-500 to-orange-600', 
      icon: FaMoneyBillWave,
      badge: 'Payment Pending'
    },
    view: { 
      text: 'View Details', 
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
      icon: FaEye,
      badge: 'Completed'
    },
  };
  const config = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden cursor-pointer group w-full"
      onClick={onClick}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors truncate">
              Batch: {shipment.batchNumber}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 break-words">{shipment.productDescription}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full self-start whitespace-nowrap ${
            status === 'start' ? 'bg-emerald-100 text-emerald-700' :
            status === 'continue' ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {config.badge}
          </span>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-emerald-50 pt-4 gap-3">
          <span className="text-xs font-mono text-gray-400 break-all">ID: {shipment.id.slice(0, 8)}...</span>
          <button className={`${config.color} text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all w-full sm:w-auto justify-center`}>
            <config.icon className="text-xs" />
            <span className="truncate">{config.text}</span>
            <FaChevronRight className="text-xs flex-shrink-0" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ---------- Enhanced Data Display Component ----------
const DataDisplay = ({ data, level = 0 }) => {
  if (data === null || data === undefined) return <span className="text-gray-400 italic">Not provided</span>;
  if (typeof data !== 'object') return <span className="text-gray-700 break-words">{String(data)}</span>;

  if (Array.isArray(data)) {
    return (
      <div className={`space-y-3 ${level > 0 ? 'ml-2 sm:ml-4' : ''}`}>
        {data.length === 0 ? (
          <span className="text-gray-400 italic">Empty list</span>
        ) : (
          data.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-l-3 border-emerald-300 pl-3 sm:pl-4 py-2 bg-gray-50 rounded-r-lg overflow-hidden"
            >
              <DataDisplay data={item} level={level + 1} />
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-2 sm:ml-4' : ''}`}>
      {Object.entries(data).map(([key, value], idx) => (
        <motion.div 
          key={key} 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <span className="font-medium text-gray-600 capitalize text-xs sm:text-sm break-words">
            {key.replace(/([A-Z])/g, ' $1').trim()}:
          </span>
          <div className="sm:col-span-2">
            <DataDisplay data={value} level={level + 1} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ---------- Enhanced Document Uploader ----------
const DocumentUploader = ({ docs, onAdd }) => {
  const [desc, setDesc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesc(file.name);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setDesc(file.name);
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {docs.map((doc, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <FaFileAlt className="text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700 flex-1 text-sm sm:text-base break-words">{doc.name}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600 whitespace-nowrap self-end sm:self-auto">Draft</span>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 transition-all ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Document description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={triggerFilePicker}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FaFileImage className="text-gray-500 flex-shrink-0" />
              <span className="hidden sm:inline">Browse</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!desc.trim()) {
                  toast.error('Please enter a description');
                  return;
                }
                onAdd(desc.trim());
                setDesc('');
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md text-sm"
            >
              <FaUpload className="flex-shrink-0" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Drag and drop or click to upload</p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
    </div>
  );
};

// ---------- Enhanced Single Document Upload ----------
const SingleDocumentUpload = ({ label, value, onChange }) => {
  const fileInputRef = useRef(null);
  const [desc, setDesc] = useState(value?.name || '');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesc(file.name);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAdd = () => {
    if (!desc.trim()) {
      toast.error('Please enter a description');
      return;
    }
    onChange({ name: desc.trim(), url: 'dummy' });
  };

  return (
    <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
      <label className="block font-semibold text-gray-700 text-xs sm:text-sm">{label}</label>
      {value && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <FaFileAlt className="text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 flex-1 text-sm break-words">{value.name}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600 whitespace-nowrap self-end sm:self-auto">Draft</span>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <input
          type="text"
          placeholder="Document description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={triggerFilePicker}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all text-sm"
          >
            Browse
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FaCheckCircle className="text-sm flex-shrink-0" />
            <span className="hidden sm:inline">Set</span>
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
    </div>
  );
};

// ---------- Enhanced Step Indicator ----------
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-[300px] sm:min-w-0">
        {steps.map((step, index) => (
          <div key={step.number} className="flex-1 relative">
            <div className="flex items-center">
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{
                    scale: currentStep >= step.number ? 1.1 : 1,
                    backgroundColor: currentStep >= step.number ? '#10b981' : '#e5e7eb'
                  }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    currentStep >= step.number ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  {currentStep > step.number ? <FaCheckCircle className="text-white text-xs sm:text-sm" /> : step.number}
                </motion.div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-1 sm:mx-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                    className="h-full bg-emerald-500 rounded-full relative z-10"
                  />
                  <div className={`h-full bg-gray-300 rounded-full -mt-1 ${currentStep > step.number ? 'w-0' : 'w-full'}`} />
                </div>
              )}
            </div>
            <p className={`text-[10px] sm:text-xs mt-2 font-medium whitespace-nowrap ${
              currentStep >= step.number ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const CurrentDueDiligence = () => {
  const { user, demoData, updateDemoData } = useUserStore();
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [formData, setFormData] = useState({
    description: '',
    commonName: '',
    scientificName: '',
    hsCodes: [],
    containers: [],
    netMassKg: 0,
    customerName: '',
    customerAddress: '',
    customerEmail: '',
    supplierId: '',
    supplierName: '',
    supplierAddress: '',
    supplierEmail: '',
    batchNumber: '',
    amount: 0,
    paymentStatus: false,
    status: 'unapproved',
    riskAssessment: null,
    riskMitigation: null,
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSme, setIsSme] = useState(true);
  const [nonSmeFields, setNonSmeFields] = useState({
    officerName: '',
    officerIdCard: null,
    appointmentLetter: null,
  });

  const steps = [
    { number: 1, label: 'Information', icon: FaFileSignature },
    { number: 2, label: 'Payment', icon: FaCreditCard },
    { number: 3, label: 'Assessment', icon: FaBalanceScale },
    { number: 4, label: 'Mitigation', icon: FaShieldAlt },
  ];

  // Load shipments connected to importer
  useEffect(() => {
    if (!user || user.role !== 'importer') return;

    const shipmentIds = user.shipmentId?.map(s => s.id) || [];
    const shipmentsData = shipmentIds
      .map(id => demoData.shipments?.[id])
      .filter(Boolean);

    const enriched = shipmentsData.map(ship => {
      const statusObj = user.shipmentId?.find(s => s.id === ship.id);
      return { ...ship, shipmentStatus: statusObj?.status || 'unapproved' };
    });
    setShipments(enriched);
  }, [user, demoData]);

  const findExistingRecord = (batchNumber) => {
    return user?.currentSupplierRecords?.find(r => r.batchNumber === batchNumber);
  };

  const getShipmentStatus = (shipment) => {
    const record = findExistingRecord(shipment.batchNumber);
    if (!record) return 'start';
    if (!record.paymentStatus) return 'continue';
    return 'view';
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    const record = findExistingRecord(shipment.batchNumber);
    setExistingRecord(record);

    if (record) {
      setFormData({
        ...record,
        containers: record.containers || [],
        hsCodes: record.hsCodes || [],
      });
      if (!record.paymentStatus) {
        setModalStep(2);
      } else if (record.status === 'approved') {
        setModalStep(0);
      } else {
        setModalStep(3);
      }
    } else {
      const exporter = demoData.users[shipment.exporterId];
      const supplierAddress = exporter?.facilities?.find(f => f.type === 'Corporate facility')?.address || exporter?.basicInfo?.country || '';
      setFormData({
        description: '',
        commonName: '',
        scientificName: '',
        hsCodes: [],
        containers: [],
        netMassKg: 0,
        customerName: '',
        customerAddress: '',
        customerEmail: '',
        supplierId: exporter?.id || '',
        supplierName: exporter?.basicInfo?.companyName || '',
        supplierAddress: supplierAddress,
        supplierEmail: exporter?.basicInfo?.email || '',
        batchNumber: shipment.batchNumber,
        amount: 0,
        paymentStatus: false,
        status: 'unapproved',
        riskAssessment: null,
        riskMitigation: null,
      });
      setSelectedProducts([]);
      setModalStep(1);
    }
    setModalOpen(true);
  };

  useEffect(() => {
    const total = calculateTotalKg(formData.containers);
    setFormData(prev => ({ ...prev, netMassKg: total }));
  }, [formData.containers]);

  useEffect(() => {
    const amount = calculateAmount(formData.containers);
    setFormData(prev => ({ ...prev, amount }));
  }, [formData.containers]);

  const addContainer = () => {
    setFormData(prev => ({
      ...prev,
      containers: [...prev.containers, { containerNumber: '', kilograms: 0 }]
    }));
  };

  const removeContainer = (index) => {
    setFormData(prev => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index)
    }));
  };

  const updateContainer = (index, field, value) => {
    const newContainers = [...formData.containers];
    newContainers[index][field] = field === 'kilograms' ? Number(value) : value;
    setFormData(prev => ({ ...prev, containers: newContainers }));
  };

  const addHsCode = (commodity, code, name) => {
    if (!formData.hsCodes.some(h => h.code === code)) {
      setFormData(prev => ({
        ...prev,
        hsCodes: [...prev.hsCodes, { commodity, code, name }]
      }));
    }
  };

  const removeHsCode = (code) => {
    setFormData(prev => ({
      ...prev,
      hsCodes: prev.hsCodes.filter(h => h.code !== code)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = () => {
    if (!formData.description || !formData.commonName || !formData.scientificName || !formData.customerName || !formData.customerAddress || !formData.customerEmail) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.containers.length === 0) {
      toast.error('Please add at least one container');
      return;
    }
    if (formData.containers.some(c => !c.containerNumber || !c.kilograms || c.kilograms <= 0)) {
      toast.error('Please fill all container details correctly');
      return;
    }
    if (formData.hsCodes.length === 0) {
      toast.error('Please select at least one HS code');
      return;
    }

    const newRecord = {
      ...formData,
      supplierId: selectedShipment.exporterId,
      supplierName: formData.supplierName,
      supplierAddress: formData.supplierAddress,
      supplierEmail: formData.supplierEmail,
      batchNumber: selectedShipment.batchNumber,
      paymentStatus: false,
      status: 'unapproved',
    };

    const updatedUser = { ...user };
    if (!updatedUser.currentSupplierRecords) updatedUser.currentSupplierRecords = [];
    updatedUser.currentSupplierRecords.push(newRecord);

    const newDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [user.id]: updatedUser,
      },
    };
    updateDemoData(newDemoData);
    toast.success('Information saved. Proceed to payment.');
    setModalStep(2);
  };

  const handlePayment = () => {
    const updatedRecords = user.currentSupplierRecords.map(r =>
      r.batchNumber === selectedShipment.batchNumber ? { ...r, paymentStatus: true } : r
    );
    const updatedUser = { ...user, currentSupplierRecords: updatedRecords };
    const updatedShipmentId = user.shipmentId.map(s =>
      s.id === selectedShipment.id ? { ...s, status: 'approved' } : s
    );
    updatedUser.shipmentId = updatedShipmentId;

    const newDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [user.id]: updatedUser,
      },
    };
    updateDemoData(newDemoData);
    toast.success('Payment successful! You can now proceed with risk assessment.');
    setModalStep(3);
  };

  const [assessmentDocs, setAssessmentDocs] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');

  const addAssessmentDoc = (description) => {
    setAssessmentDocs(prev => [...prev, { name: description, url: 'dummy' }]);
  };

  const saveRiskAssessment = () => {
    if (!riskLevel) {
      toast.error('Please select a risk level');
      return;
    }
    const updatedRecords = user.currentSupplierRecords.map(r =>
      r.batchNumber === selectedShipment.batchNumber
        ? { ...r, riskAssessment: { riskLevel, assessmentDocs } }
        : r
    );
    const updatedUser = { ...user, currentSupplierRecords: updatedRecords };
    const newDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [user.id]: updatedUser,
      },
    };
    updateDemoData(newDemoData);

    if (riskLevel === 'high risk') {
      setModalStep(4);
    } else {
      completeDueDiligence(updatedRecords.find(r => r.batchNumber === selectedShipment.batchNumber));
    }
  };

  const [mitigationData, setMitigationData] = useState({
    additionalInfo: [],
    independentSurveys: [],
    otherMeasures: [],
    capacityBuilding: [],
    policiesControls: {
      modelPractices: {
        isSme: true,
        officerName: '',
        officerIdCard: null,
        appointmentLetter: null,
        Docs: [],
      },
      independentAudit: [],
    },
    decisionsReview: [],
  });

  const addMitigationDoc = (section, description) => {
    setMitigationData(prev => ({
      ...prev,
      [section]: [...prev[section], { name: description, url: 'dummy' }]
    }));
  };

  const updateModelPracticesDoc = (description) => {
    setMitigationData(prev => ({
      ...prev,
      policiesControls: {
        ...prev.policiesControls,
        modelPractices: {
          ...prev.policiesControls.modelPractices,
          Docs: [...prev.policiesControls.modelPractices.Docs, { name: description, url: 'dummy' }]
        }
      }
    }));
  };

  const updateIndependentAuditDoc = (description) => {
    setMitigationData(prev => ({
      ...prev,
      policiesControls: {
        ...prev.policiesControls,
        independentAudit: [...prev.policiesControls.independentAudit, { name: description, url: 'dummy' }]
      }
    }));
  };

  const saveRiskMitigation = () => {
    const updatedRecords = user.currentSupplierRecords.map(r =>
      r.batchNumber === selectedShipment.batchNumber
        ? { ...r, riskMitigation: mitigationData }
        : r
    );
    const updatedUser = { ...user, currentSupplierRecords: updatedRecords };
    const newDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [user.id]: updatedUser,
      },
    };
    updateDemoData(newDemoData);
    completeDueDiligence(updatedRecords.find(r => r.batchNumber === selectedShipment.batchNumber));
  };

  const completeDueDiligence = (record) => {
    const updatedRecords = user.currentSupplierRecords.map(r =>
      r.batchNumber === selectedShipment.batchNumber ? { ...r, status: 'approved' } : r
    );
    const updatedUser = { ...user, currentSupplierRecords: updatedRecords };
    const newDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [user.id]: updatedUser,
      },
    };
    updateDemoData(newDemoData);
    toast.success('Due diligence completed successfully!');
    setModalOpen(false);
  };

  const renderModalContent = () => {
    if (modalStep === 0) {
      const record = existingRecord;
      const shipment = selectedShipment;
      return (
        <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4 sm:mb-6 break-words">
            Due Diligence Details
          </h2>
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-emerald-100"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FaBox className="text-emerald-600 flex-shrink-0" />
                <span className="break-words">Shipment Information</span>
              </h3>
              <DataDisplay data={shipment} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-emerald-100"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FaClipboardList className="text-emerald-600 flex-shrink-0" />
                <span className="break-words">Importer's Information</span>
              </h3>
              <DataDisplay data={record} />
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
        <StepIndicator currentStep={modalStep} steps={steps} />

        <AnimatePresence mode="wait">
          <motion.div
            key={modalStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8"
          >
            {modalStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">Provide Importer Information</h2>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 sm:p-6 rounded-2xl border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-3 text-sm sm:text-base">Supplier Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Company Name</p>
                      <p className="font-medium text-gray-800 text-sm break-words">{formData.supplierName}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium text-gray-800 text-sm break-words">{formData.supplierAddress}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg sm:col-span-2">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-800 text-sm break-words">{formData.supplierEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input label="Description (trade name, type)" name="description" value={formData.description} onChange={handleInputChange} />
                  <Input label="Common Name" name="commonName" value={formData.commonName} onChange={handleInputChange} />
                  <Input label="Scientific Name" name="scientificName" value={formData.scientificName} onChange={handleInputChange} />
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <label className="block font-semibold text-gray-700 mb-3 text-sm sm:text-base">HS Codes (EUDR supported)</label>
                  <div className="border border-gray-200 rounded-xl p-3 sm:p-4 max-h-60 overflow-y-auto bg-white">
                    {demoData.commodities.map(commodity => (
                      <div key={commodity.commodity} className="mb-4">
                        <p className="font-semibold text-emerald-700 mb-2 text-sm">{commodity.commodity}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {commodity.products.map(prod => (
                            <label key={prod.code} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.hsCodes.some(h => h.code === prod.code)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    addHsCode(commodity.commodity, prod.code, prod.name);
                                  } else {
                                    removeHsCode(prod.code);
                                  }
                                }}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-gray-700 break-words">{prod.code} - {prod.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.hsCodes.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2 text-sm">Selected HS Codes:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.hsCodes.map(h => (
                          <span key={h.code} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                            {h.code}
                            <button onClick={() => removeHsCode(h.code)} className="hover:text-red-600 ml-1">
                              <FaTrash className="text-xs" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <label className="block font-semibold text-gray-700 mb-3 text-sm sm:text-base">Containers</label>
                  {formData.containers.map((c, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3"
                    >
                      <input
                        type="text"
                        placeholder="Container number"
                        value={c.containerNumber}
                        onChange={(e) => updateContainer(idx, 'containerNumber', e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="kg"
                            value={c.kilograms}
                            onChange={(e) => updateContainer(idx, 'kilograms', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm pr-12"
                          />
                          <span className="absolute right-3 top-3 text-gray-400 text-xs">kg</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeContainer(idx)} 
                          className="px-3 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all flex-shrink-0"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addContainer} 
                    className="mt-3 text-emerald-600 hover:text-emerald-700 flex items-center gap-2 font-medium text-sm"
                  >
                    <FaPlus className="text-sm" /> Add Container
                  </motion.button>
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                    <p className="text-base sm:text-lg font-semibold text-emerald-800 break-words">
                      Total Net Mass: {formData.netMassKg} kg
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input label="Customer Name" name="customerName" value={formData.customerName} onChange={handleInputChange} />
                  <Input label="Customer Postal Address" name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} />
                  <Input label="Customer Email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} type="email" />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveInfo} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                  <FaSave className="flex-shrink-0" /> 
                  <span className="truncate">Save & Continue to Payment</span>
                  <FaArrowRight className="flex-shrink-0" />
                </motion.button>
              </div>
            )}

            {modalStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Payment</h2>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 sm:p-8 rounded-2xl border border-emerald-200 text-center">
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">Amount to pay</p>
                  <p className="text-3xl sm:text-5xl font-bold text-emerald-700 mb-2 break-words">${formData.amount}</p>
                  <p className="text-xs sm:text-sm text-gray-500">({formData.containers.length} containers × $100)</p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                  <FaMoneyBillWave className="flex-shrink-0" /> Pay ${formData.amount}
                </motion.button>
              </div>
            )}

            {modalStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Risk Assessment</h2>
                
                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <label className="block font-semibold text-gray-700 mb-3 text-sm sm:text-base">Risk Level</label>
                  <select 
                    value={riskLevel} 
                    onChange={(e) => setRiskLevel(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-sm"
                  >
                    <option value="">Select risk level</option>
                    <option value="low risk" className="text-emerald-600">Low Risk</option>
                    <option value="negligible risk" className="text-blue-600">Negligible Risk</option>
                    <option value="high risk" className="text-red-600">High Risk</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <label className="block font-semibold text-gray-700 mb-3 text-sm sm:text-base">Upload Assessment Documents</label>
                  <DocumentUploader docs={assessmentDocs} onAdd={addAssessmentDoc} />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveRiskAssessment} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Save Assessment
                </motion.button>
              </div>
            )}

            {modalStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Risk Mitigation</h2>
                <p className="text-red-600 bg-red-50 p-3 sm:p-4 rounded-xl flex items-center gap-2 text-sm sm:text-base">
                  <FaExclamationTriangle className="text-xl flex-shrink-0" />
                  <span className="break-words">High Risk - Additional measures required</span>
                </p>

                <MitigationSection 
                  title="Additional information, data or documents" 
                  docs={mitigationData.additionalInfo} 
                  onAdd={(desc) => addMitigationDoc('additionalInfo', desc)} 
                />
                
                <MitigationSection 
                  title="Independent surveys or audits" 
                  docs={mitigationData.independentSurveys} 
                  onAdd={(desc) => addMitigationDoc('independentSurveys', desc)} 
                />
                
                <MitigationSection 
                  title="Other measures per Article 9" 
                  docs={mitigationData.otherMeasures} 
                  onAdd={(desc) => addMitigationDoc('otherMeasures', desc)} 
                />
                
                <MitigationSection 
                  title="Capacity building and investments" 
                  docs={mitigationData.capacityBuilding} 
                  onAdd={(desc) => addMitigationDoc('capacityBuilding', desc)} 
                />

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
                  <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg">Policies, controls and procedures</h3>
                  
                  <div className="mb-6">
                    <p className="font-medium text-gray-700 mb-3 text-sm">Model risk management practices</p>
                    <DocumentUploader
                      docs={mitigationData.policiesControls.modelPractices.Docs}
                      onAdd={updateModelPracticesDoc}
                    />
                    
                    <div className="mt-4">
                      <label className="flex items-start gap-2 p-3 bg-white rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!isSme} 
                          onChange={(e) => setIsSme(!e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1 flex-shrink-0"
                        />
                        <span className="text-gray-700 text-sm break-words">Non-SME (uncheck if SME)</span>
                      </label>
                    </div>

                    {!isSme && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-4"
                      >
                        <Input 
                          label="Officer Name" 
                          value={nonSmeFields.officerName} 
                          onChange={(e) => setNonSmeFields({...nonSmeFields, officerName: e.target.value})} 
                        />
                        <SingleDocumentUpload
                          label="Officer ID Card"
                          value={nonSmeFields.officerIdCard}
                          onChange={(doc) => setNonSmeFields(prev => ({ ...prev, officerIdCard: doc }))}
                        />
                        <SingleDocumentUpload
                          label="Letter of Appointment"
                          value={nonSmeFields.appointmentLetter}
                          onChange={(doc) => setNonSmeFields(prev => ({ ...prev, appointmentLetter: doc }))}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-3 text-sm">Independent audit function</p>
                    <DocumentUploader
                      docs={mitigationData.policiesControls.independentAudit}
                      onAdd={updateIndependentAuditDoc}
                    />
                  </div>
                </div>

                <MitigationSection 
                  title="Annual review of procedures" 
                  docs={mitigationData.decisionsReview} 
                  onAdd={(desc) => addMitigationDoc('decisionsReview', desc)} 
                />

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveRiskMitigation} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Complete Mitigation
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent break-words">
            Current Due Diligence
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your ongoing due diligence processes</p>
        </motion.div>

        {shipments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 px-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-2xl sm:text-3xl lg:text-4xl text-emerald-600" />
            </div>
            <p className="text-gray-600 text-base sm:text-lg">No shipments connected to you yet.</p>
            <p className="text-gray-400 text-sm sm:text-base mt-2">New shipments will appear here when assigned.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {shipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <ShipmentCard
                  shipment={shipment}
                  status={getShipmentStatus(shipment)}
                  onClick={() => handleShipmentClick(shipment)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all z-10"
                >
                  <FaTimes className="text-sm sm:text-base" />
                </button>
                {renderModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Input = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <label className="block font-medium text-gray-700 text-xs sm:text-sm">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white text-sm"
    />
  </div>
);

const MitigationSection = ({ title, docs, onAdd }) => (
  <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl">
    <h3 className="font-bold text-gray-800 mb-4 text-base sm:text-lg break-words">{title}</h3>
    <DocumentUploader docs={docs} onAdd={onAdd} />
  </div>
);

const Section = ({ title, children }) => (
  <div className="border-l-4 border-emerald-500 pl-3 sm:pl-4 py-2">
    <h3 className="font-bold text-base sm:text-lg text-emerald-800 mb-2 break-words">{title}</h3>
    {children}
  </div>
);

export default CurrentDueDiligence;
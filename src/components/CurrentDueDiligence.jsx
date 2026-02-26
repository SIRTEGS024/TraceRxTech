import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-toastify';
import {
  FaBox, FaFileAlt, FaMoneyBillWave, FaCheckCircle,
  FaExclamationTriangle, FaUpload, FaPlus, FaTrash,
  FaArrowRight, FaSave, FaEye, FaChevronRight, FaTimes,
  FaClipboardList, FaShieldAlt, FaCreditCard, FaFileSignature,
  FaBalanceScale, FaDownload, FaFileImage
} from 'react-icons/fa';

// ---------- Helper functions ----------
const calculateTotalKg = (containers) => {
  return containers.reduce((sum, c) => sum + (Number(c.kilograms) || 0), 0);
};

const calculateAmount = (containers) => {
  return (containers.length || 0) * 100; // $100 per container
};

// ---------- Shipment Card Component ----------
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
    <div
      className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden cursor-pointer group w-full hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-200"
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
    </div>
  );
};

// ---------- Data Display Component ----------
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
            <div key={idx} className="border-l-3 border-emerald-300 pl-3 sm:pl-4 py-2 bg-gray-50 rounded-r-lg overflow-hidden">
              <DataDisplay data={item} level={level + 1} />
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-2 sm:ml-4' : ''}`}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <span className="font-medium text-gray-600 capitalize text-xs sm:text-sm break-words">
            {key.replace(/([A-Z])/g, ' $1').trim()}:
          </span>
          <div className="sm:col-span-2">
            <DataDisplay data={value} level={level + 1} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- Document Uploader ----------
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
      {docs.map((doc, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <FaFileAlt className="text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 flex-1 text-sm sm:text-base break-words">{doc.name}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600 whitespace-nowrap self-end sm:self-auto">Draft</span>
        </div>
      ))}

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

// ---------- Single Document Upload ----------
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
              <FaFileAlt className="text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 flex-1 text-sm break-words">{value.name}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600 whitespace-nowrap self-end sm:self-auto">Draft</span>
        </div>
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

// ---------- Step Indicator ----------
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-[300px] sm:min-w-0">
        {steps.map((step, index) => (
          <div key={step.number} className="flex-1 relative">
            <div className="flex items-center">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    currentStep >= step.number ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  {currentStep > step.number ? <FaCheckCircle className="text-white text-xs sm:text-sm" /> : step.number}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-1 sm:mx-2 bg-gray-300 rounded-full">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: currentStep > step.number ? '100%' : '0%' }}
                  />
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

  // ---------- Document display helpers (downloadable) ----------
  const DocumentItem = ({ doc }) => {
    const handleDownload = () => {
      // In a real app, this would trigger download. For demo, we show an alert.
      alert(`Downloading: ${doc.name}`);
      // You could also open a URL: window.open(doc.url, '_blank');
    };

    return (
      <div
        onClick={handleDownload}
        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
          <FaFileAlt className="text-emerald-600" />
        </div>
        <span className="flex-1 text-sm text-gray-700 break-words">{doc.name}</span>
        <FaDownload className="text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
      </div>
    );
  };

  const DocumentList = ({ docs }) => {
    if (!docs || docs.length === 0) return <span className="text-gray-400 italic">None</span>;
    return (
      <div className="space-y-2">
        {docs.map((doc, idx) => (
          <DocumentItem key={idx} doc={doc} />
        ))}
      </div>
    );
  };

  // ---------- Enhanced Details View ----------
  const renderDetailsView = () => {
    const record = existingRecord;
    const shipment = selectedShipment;
    if (!record || !shipment) return null;

    return (
      <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 break-words">
          Due Diligence Details
        </h2>

        <div className="space-y-6">
          {/* Shipment Information */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 sm:px-6 py-3 border-b border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                <FaBox className="text-emerald-600" />
                Shipment Information
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shipment.batchNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{shipment.productDescription || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Importer's Record */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 sm:px-6 py-3 border-b border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                <FaClipboardList className="text-emerald-600" />
                Importer's Information
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {/* Basic Product Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.description || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Common Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.commonName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scientific Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.scientificName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Net Mass (kg)</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.netMassKg}</dd>
                </div>
              </div>

              {/* HS Codes */}
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">HS Codes</dt>
                <dd className="mt-1">
                  {record.hsCodes && record.hsCodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {record.hsCodes.map((h, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {h.code} - {h.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </dd>
              </div>

              {/* Containers */}
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Containers</dt>
                <dd className="mt-1">
                  {record.containers && record.containers.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container Number</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilograms</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {record.containers.map((c, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{c.containerNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{c.kilograms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </dd>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.customerName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.customerEmail || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Customer Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.customerAddress || 'Not provided'}</dd>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.supplierName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.supplierEmail || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Supplier Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.supplierAddress || 'Not provided'}</dd>
                </div>
              </div>

              {/* Financial & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount ($)</dt>
                  <dd className="mt-1 text-sm text-gray-900">${record.amount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.paymentStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.paymentStatus ? 'Paid' : 'Unpaid'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </dd>
                </div>
              </div>

              {/* Risk Assessment */}
              {record.riskAssessment && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Risk Assessment</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.riskAssessment.riskLevel === 'high risk' ? 'bg-red-100 text-red-800' :
                          record.riskAssessment.riskLevel === 'low risk' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.riskAssessment.riskLevel}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assessment Documents</dt>
                      <dd className="mt-1">
                        <DocumentList docs={record.riskAssessment.assessmentDocs} />
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Risk Mitigation */}
              {record.riskMitigation && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Risk Mitigation</h4>
                  <dl className="space-y-4">
                    {record.riskMitigation.additionalInfo?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Additional Info</dt>
                        <dd className="mt-2"><DocumentList docs={record.riskMitigation.additionalInfo} /></dd>
                      </div>
                    )}
                    {record.riskMitigation.independentSurveys?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Independent Surveys</dt>
                        <dd className="mt-2"><DocumentList docs={record.riskMitigation.independentSurveys} /></dd>
                      </div>
                    )}
                    {record.riskMitigation.otherMeasures?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Other Measures</dt>
                        <dd className="mt-2"><DocumentList docs={record.riskMitigation.otherMeasures} /></dd>
                      </div>
                    )}
                    {record.riskMitigation.capacityBuilding?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Capacity Building</dt>
                        <dd className="mt-2"><DocumentList docs={record.riskMitigation.capacityBuilding} /></dd>
                      </div>
                    )}
                    {record.riskMitigation.policiesControls && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Policies, Controls & Procedures</dt>
                        <dd className="mt-2">
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            {/* Model Practices */}
                            {record.riskMitigation.policiesControls.modelPractices && (
                              <div>
                                <span className="font-medium text-gray-700 block mb-2">Model Risk Management Practices</span>
                                <div className="ml-4 space-y-3">
                                  {record.riskMitigation.policiesControls.modelPractices.isSme !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">SME:</span>
                                      <span className={`text-sm px-2 py-0.5 rounded-full ${record.riskMitigation.policiesControls.modelPractices.isSme ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {record.riskMitigation.policiesControls.modelPractices.isSme ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  )}
                                  {record.riskMitigation.policiesControls.modelPractices.officerName && (
                                    <div>
                                      <span className="text-sm text-gray-600">Officer Name:</span>
                                      <p className="text-sm text-gray-900 ml-2">{record.riskMitigation.policiesControls.modelPractices.officerName}</p>
                                    </div>
                                  )}
                                  {record.riskMitigation.policiesControls.modelPractices.officerIdCard && (
                                    <div>
                                      <span className="text-sm text-gray-600">Officer ID Card:</span>
                                      <div className="ml-2 mt-1">
                                        <DocumentItem doc={record.riskMitigation.policiesControls.modelPractices.officerIdCard} />
                                      </div>
                                    </div>
                                  )}
                                  {record.riskMitigation.policiesControls.modelPractices.appointmentLetter && (
                                    <div>
                                      <span className="text-sm text-gray-600">Letter of Appointment:</span>
                                      <div className="ml-2 mt-1">
                                        <DocumentItem doc={record.riskMitigation.policiesControls.modelPractices.appointmentLetter} />
                                      </div>
                                    </div>
                                  )}
                                  {record.riskMitigation.policiesControls.modelPractices.Docs?.length > 0 && (
                                    <div>
                                      <span className="text-sm text-gray-600">Additional Docs:</span>
                                      <div className="ml-2 mt-1">
                                        <DocumentList docs={record.riskMitigation.policiesControls.modelPractices.Docs} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Independent Audit */}
                            {record.riskMitigation.policiesControls.independentAudit?.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700 block mb-2">Independent Audit</span>
                                <div className="ml-4">
                                  <DocumentList docs={record.riskMitigation.policiesControls.independentAudit} />
                                </div>
                              </div>
                            )}
                          </div>
                        </dd>
                      </div>
                    )}
                    {record.riskMitigation.decisionsReview?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Decisions Review</dt>
                        <dd className="mt-2"><DocumentList docs={record.riskMitigation.decisionsReview} /></dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Modal Content ----------
  const renderModalContent = () => {
    if (modalStep === 0) {
      return renderDetailsView();
    }

    return (
      <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
        <StepIndicator currentStep={modalStep} steps={steps} />

        <div className="mt-6 sm:mt-8">
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
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
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
                      <button
                        onClick={() => removeContainer(idx)}
                        className="px-3 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all flex-shrink-0"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addContainer}
                  className="mt-3 text-emerald-600 hover:text-emerald-700 flex items-center gap-2 font-medium text-sm"
                >
                  <FaPlus className="text-sm" /> Add Container
                </button>
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

              <button
                onClick={handleSaveInfo}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3"
              >
                <FaSave className="flex-shrink-0" />
                <span className="truncate">Save & Continue to Payment</span>
                <FaArrowRight className="flex-shrink-0" />
              </button>
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

              <button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3"
              >
                <FaMoneyBillWave className="flex-shrink-0" /> Pay ${formData.amount}
              </button>
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

              <button
                onClick={saveRiskAssessment}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Save Assessment
              </button>
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
                    <div className="mt-4 space-y-4">
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
                    </div>
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

              <button
                onClick={saveRiskMitigation}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Complete Mitigation
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent break-words">
            Current Due Diligence
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your ongoing due diligence processes</p>
        </div>

        {shipments.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-2xl sm:text-3xl lg:text-4xl text-emerald-600" />
            </div>
            <p className="text-gray-600 text-base sm:text-lg">No shipments connected to you yet.</p>
            <p className="text-gray-400 text-sm sm:text-base mt-2">New shipments will appear here when assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {shipments.map((shipment, index) => (
              <div key={shipment.id}>
                <ShipmentCard
                  shipment={shipment}
                  status={getShipmentStatus(shipment)}
                  onClick={() => handleShipmentClick(shipment)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
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
          </div>
        </div>
      )}
    </div>
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

export default CurrentDueDiligence;
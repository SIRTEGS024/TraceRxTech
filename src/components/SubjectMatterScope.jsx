import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import {
  Search, X, Upload, FileText, ChevronRight, ChevronLeft, Check,
  Image as ImageIcon, MessageSquare, Save, ExternalLink, User
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

const SubjectMatterScope = () => {
  // ---------- Common state ----------
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedCommodities, setExpandedCommodities] = useState({});
  const [signatureData, setSignatureData] = useState({
    signature: null,
    signeeName: "",
    signeeFunction: "",
    exporterId: ""
  });
  const [companyLogo, setCompanyLogo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ---------- Verifier state ----------
  const [verificationNotes, setVerificationNotes] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'compliant' | 'non-compliant'
  const [newNote, setNewNote] = useState("");
  const [initialNotes, setInitialNotes] = useState([]);
  const [initialStatus, setInitialStatus] = useState(null);

  // ---------- State for viewing verification history (exporter/importer) ----------
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const { user, demoData, updateUser } = useUserStore();

  // ---------- Determine context ----------
  const isVerifier = user?.role === 'verifier' && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;

  // Get current company data (for both roles)
  const getCurrentCompany = () => {
    if (!user) return null;
    if (isVerifier && companyId) {
      return demoData.users[companyId];
    }
    if (user.loggedInAs?.companyId) {
      return demoData.users[user.loggedInAs.companyId];
    } else if (user.role === 'exporter' || user.role === 'importer') {
      return user;
    }
    return null;
  };

  const currentCompany = getCurrentCompany();
  const isExporter = currentCompany?.role === 'exporter';
  const isImporter = currentCompany?.role === 'importer';

  // ---------- Load company data (products, undertaking, logo) ----------
  useEffect(() => {
    if (currentCompany && initialLoad) {
      // Load selected products from supportedCommodities
      if (currentCompany.supportedCommodities?.length) {
        const existingProducts = currentCompany.supportedCommodities.flatMap(commodity =>
          commodity.products.map(product => ({
            ...product,
            commodity: commodity.commodity
          }))
        );
        setSelectedProducts(existingProducts);

        const expanded = {};
        existingProducts.forEach(p => { expanded[p.commodity] = true; });
        setExpandedCommodities(expanded);
      }

      // Load undertaking
      if (currentCompany.undertaken) {
        setSignatureData({
          signature: currentCompany.undertaken.signature || "",
          signeeName: currentCompany.undertaken.name || "",
          signeeFunction: currentCompany.undertaken.function || "",
          exporterId: currentCompany.traceRxId || ""
        });
      }

      // Load logo
      if (currentCompany.logo?.url) {
        setCompanyLogo(currentCompany.logo.url);
      }

      setInitialLoad(false);
    }
  }, [currentCompany, initialLoad]);

  // ---------- Load verification data (verifier only) ----------
  useEffect(() => {
    if (isVerifier && currentCompany && user) {
      const reports = user.verificationReports || [];
      const report = reports.find(r => r.companyId === currentCompany.id);
      let notes = [];
      let status = null;
      if (report) {
        const subjectFindings = report.findings?.find(f => f.tab === 'subject-matter');
        if (subjectFindings) {
          status = subjectFindings.status || null;
          notes = subjectFindings.articles?.find(a => a.article === 'article-1')?.notes || [];
        }
      }
      setVerificationNotes(notes);
      setVerificationStatus(status);
      setInitialNotes(notes);
      setInitialStatus(status);
    }
  }, [isVerifier, currentCompany, user]);

  // ---------- Load verification history for exporter/importer ----------
  useEffect(() => {
    if (!isVerifier && currentCompany) {
      // Get all linked verifiers for this company
      const linkedVerifiers = currentCompany.linkedVerifiers || [];
      const history = [];

      linkedVerifiers.forEach(verifierLink => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier || !verifier.verificationReports) return;

        // Find the report for this company
        const report = verifier.verificationReports.find(r => r.companyId === currentCompany.id);
        if (report) {
          const subjectFindings = report.findings?.find(f => f.tab === 'subject-matter');
          if (subjectFindings) {
            const notes = subjectFindings.articles?.find(a => a.article === 'article-1')?.notes || [];
            if (notes.length > 0 || subjectFindings.status) {
              history.push({
                verifierName: verifier.basicInfo?.firstName 
                  ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}` 
                  : verifier.basicInfo?.email || verifier.id,
                status: subjectFindings.status,
                notes: notes,
                date: report.date
              });
            }
          }
        }
      });

      setVerificationHistory(history);
    }
  }, [isVerifier, currentCompany, demoData]);

  // ---------- Helper to detect changes ----------
  const hasVerificationChanges = () => {
    return (
      verificationStatus !== initialStatus ||
      JSON.stringify(verificationNotes) !== JSON.stringify(initialNotes)
    );
  };

  // ---------- Helper to get company address ----------
  const getCorporateAddress = () => {
    if (!currentCompany?.facilities) return '';
    const corporate = currentCompany.facilities.find(f => f.type === 'Corporate facility');
    return corporate?.address || currentCompany.basicInfo?.country || '';
  };

  const companyDetails = currentCompany ? {
    name: currentCompany.basicInfo?.companyName || "Company Name",
    country: currentCompany.basicInfo?.country || "Country",
    registration: currentCompany.basicInfo?.rcNumber || "RC Number",
    taxId: currentCompany.basicInfo?.tinNumber || "Tax ID",
    license: currentCompany.basicInfo?.licenseNumber || (isExporter ? "Export License" : "Import License"),
    address: getCorporateAddress()
  } : {
    name: "Company Name",
    country: "Country",
    registration: "RC Number",
    taxId: "Tax ID",
    license: isExporter ? "Export License" : "Import License",
    address: "Corporate Address"
  };

  // ---------- Commodities data ----------
  const commoditiesData = demoData.commodities || [];

  const filteredProducts = searchQuery
    ? commoditiesData.flatMap(commodity =>
        commodity.products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code.includes(searchQuery)
        ).map(product => ({ ...product, commodity: commodity.commodity }))
      )
    : [];

  // ---------- Exporter/Importer handlers (unchanged) ----------
  const handleProductSelect = (product, commodity) => {
    if (!selectedProducts.some(p => p.code === product.code)) {
      setSelectedProducts([...selectedProducts, { ...product, commodity }]);
      setIsEditing(true);
    }
  };

  const handleRemoveProduct = (code) => {
    setSelectedProducts(selectedProducts.filter(p => p.code !== code));
    setIsEditing(true);
  };

  const toggleCommodity = (commodity) => {
    setExpandedCommodities(prev => ({ ...prev, [commodity]: !prev[commodity] }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureData(prev => ({ ...prev, signature: reader.result }));
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToSupportedCommodities = () => {
    const grouped = {};
    selectedProducts.forEach(product => {
      if (!grouped[product.commodity]) {
        grouped[product.commodity] = {
          commodity: product.commodity,
          products: []
        };
      }
      grouped[product.commodity].products.push({ code: product.code, name: product.name });
    });
    return Object.values(grouped);
  };

  const handleSave = () => {
    if (!currentCompany) return;
    const updatedCompany = {
      ...currentCompany,
      supportedCommodities: convertToSupportedCommodities(),
      undertaken: {
        ...currentCompany.undertaken,
        name: signatureData.signeeName,
        function: signatureData.signeeFunction,
        signature: signatureData.signature || currentCompany.undertaken?.signature || ""
      },
      logo: companyLogo ? { name: isExporter ? 'exporter-logo' : 'importer-logo', url: companyLogo } : currentCompany.logo
    };
    updateUser(currentCompany.id, updatedCompany);
    setIsEditing(false);
    alert("Draft saved successfully!");
  };

  const handleSubmit = () => {
    if (!currentCompany) return;
    const updatedCompany = {
      ...currentCompany,
      supportedCommodities: convertToSupportedCommodities(),
      undertaken: {
        ...currentCompany.undertaken,
        name: signatureData.signeeName,
        function: signatureData.signeeFunction,
        signature: signatureData.signature || currentCompany.undertaken?.signature || "",
        url: signatureData.signature || currentCompany.undertaken?.url || ""
      },
      logo: companyLogo ? { name: isExporter ? 'exporter-logo' : 'importer-logo', url: companyLogo } : currentCompany.logo,
      isRegistered: true
    };
    updateUser(currentCompany.id, updatedCompany);
    setIsEditing(false);
    setIsSubmitted(true);
    alert("Undertaking submitted successfully! PDF has been generated.");
  };

  // ---------- Verifier handlers ----------
  const handleAddNote = () => {
    if (newNote.trim()) {
      setVerificationNotes([...verificationNotes, newNote.trim()]);
      setNewNote("");
    }
  };

  const handleRemoveNote = (index) => {
    setVerificationNotes(verificationNotes.filter((_, i) => i !== index));
  };

  const handleSaveVerification = () => {
    if (!currentCompany || !user) return;

    const verifierId = user.id;
    const baseVerifier = demoData.users[verifierId];
    if (!baseVerifier) return;

    let reports = [...(baseVerifier.verificationReports || [])];
    let reportIndex = reports.findIndex(r => r.companyId === currentCompany.id);

    const subjectFindings = {
      tab: 'subject-matter',
      status: verificationStatus || 'non-compliant',
      articles: [
        {
          article: 'article-1',
          notes: verificationNotes
        }
      ]
    };

    if (reportIndex >= 0) {
      // Update existing report
      const report = reports[reportIndex];
      let findings = report.findings || [];
      const existingTabIndex = findings.findIndex(f => f.tab === 'subject-matter');
      if (existingTabIndex >= 0) {
        findings[existingTabIndex] = subjectFindings;
      } else {
        findings.push(subjectFindings);
      }
      reports[reportIndex] = { ...report, findings };
    } else {
      // Create new report
      const newReport = {
        id: `ver-report-${Date.now()}`,
        companyId: currentCompany.id,
        companyType: currentCompany.role,
        date: new Date().toISOString().split('T')[0],
        type: 'compliance audit',
        status: 'pending',
        findings: [subjectFindings]
      };
      reports.push(newReport);
    }

    // Preserve loggedInAs from current user
    const updatedVerifier = {
      ...baseVerifier,
      verificationReports: reports,
      loggedInAs: user.loggedInAs // crucial to keep company context
    };

    updateUser(verifierId, updatedVerifier);

    // Update local initial state to reflect saved changes
    setInitialNotes(verificationNotes);
    setInitialStatus(verificationStatus);

    alert("Verification saved successfully!");
  };

  // ---------- Render ----------
  if (!user || !currentCompany) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6">
          Subject Matter & Scope
        </h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800">
          Subject Matter & Scope
        </h1>
        {!isVerifier && verificationHistory.length > 0 && (
          <button
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">
              {verificationHistory.length} Verifier{verificationHistory.length > 1 ? 's' : ''} left notes
            </span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
        {/* Header description */}
        <p className="text-gray-700 mb-8">
          {isVerifier
            ? "Review the company's undertaking and product declarations under Article 1. Add notes and mark compliance."
            : "This section covers the regulatory scope and subject matter requirements for EUDR compliance, including product categories, geographical scope, and compliance timelines."}
        </p>

        {/* Progress Steps (only for exporter/importer) */}
        {!isVerifier && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{step}</div>
                <div className="ml-2 text-sm font-medium hidden sm:block">
                  {step === 1 ? 'Company Info' : step === 2 ? 'Products' : 'Signature'}
                </div>
                {step < 3 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ---------- Verifier View ---------- */}
        {isVerifier ? (
          <div className="space-y-8">
            {/* Company Information (read‑only) */}
            <div>
              <h2 className="text-xl font-semibold text-green-800 mb-4">Company Information</h2>
              {companyLogo && (
                <div className="mb-6 text-center">
                  <img src={companyLogo} alt="Company Logo" className="max-h-40 mx-auto mb-2" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                <div><span className="text-sm text-gray-500">Company Name:</span> <span className="font-medium">{companyDetails.name}</span></div>
                <div><span className="text-sm text-gray-500">Country:</span> <span className="font-medium">{companyDetails.country}</span></div>
                <div><span className="text-sm text-gray-500">Registration No.:</span> <span className="font-medium">{companyDetails.registration}</span></div>
                <div><span className="text-sm text-gray-500">Tax ID:</span> <span className="font-medium">{companyDetails.taxId}</span></div>
                <div><span className="text-sm text-gray-500">License:</span> <span className="font-medium">{companyDetails.license}</span></div>
                <div className="md:col-span-2"><span className="text-sm text-gray-500">Address:</span> <span className="font-medium whitespace-pre-line">{companyDetails.address}</span></div>
              </div>
            </div>

            {/* Undertaking (read‑only) with dummy document link */}
            <div>
              <h2 className="text-xl font-semibold text-green-800 mb-4">Undertaking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                <div><span className="text-sm text-gray-500">Signee Name:</span> <span className="font-medium">{signatureData.signeeName}</span></div>
                <div><span className="text-sm text-gray-500">Function:</span> <span className="font-medium">{signatureData.signeeFunction}</span></div>
                {signatureData.signature && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500">Signature:</span>
                    <img src={signatureData.signature} alt="Signature" className="max-h-20 mt-2 border rounded" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-500">Undertaking Document:</span>
                  <div className="mt-2">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 border border-green-200 rounded-lg px-4 py-2 bg-white"
                    >
                      <FileText size={18} />
                      <span>View Undertaking (demo document)</span>
                      <ExternalLink size={14} />
                    </a>
                    <p className="text-xs text-gray-400 mt-1">Demo: document preview not available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Products (read‑only) */}
            <div>
              <h2 className="text-xl font-semibold text-green-800 mb-4">Declared Products</h2>
              {selectedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map(p => (
                    <span key={p.code} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {p.code} - {p.name} ({p.commodity})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No products declared.</p>
              )}
            </div>

            {/* Verification Notes */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-green-800">Verification Notes (Article 1)</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  verificationStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                  verificationStatus === 'non-compliant' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {verificationStatus ? verificationStatus.replace('-', ' ') : 'Not set'}
                </span>
              </div>

              {/* Status selection */}
              <div className="mb-4 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="compliant"
                    checked={verificationStatus === 'compliant'}
                    onChange={() => setVerificationStatus('compliant')}
                    className="text-green-600"
                  />
                  <span>Compliant</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="non-compliant"
                    checked={verificationStatus === 'non-compliant'}
                    onChange={() => setVerificationStatus('non-compliant')}
                    className="text-red-600"
                  />
                  <span>Non‑compliant</span>
                </label>
              </div>

              {/* Existing notes */}
              {verificationNotes.length > 0 && (
                <div className="mb-4 space-y-2">
                  {verificationNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <MessageSquare size={18} className="text-gray-400 mt-0.5" />
                      <span className="flex-1 text-gray-700">{note}</span>
                      <button onClick={() => handleRemoveNote(idx)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new note */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Save button - disabled unless changes are made */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveVerification}
                disabled={!hasVerificationChanges() || !verificationStatus}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  !hasVerificationChanges() || !verificationStatus
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save size={20} />
                Save Verification
              </button>
            </div>
          </div>
        ) : (
          /* ---------- Exporter/Importer View (original steps) ---------- */
          <>
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Logo upload and company details – unchanged */}
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-4">Company Information</h2>
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400">
                      {companyLogo ? (
                        <div className="space-y-4">
                          <img src={companyLogo} alt="Company Logo" className="max-h-40 mx-auto" />
                          <button onClick={() => { setCompanyLogo(null); setIsEditing(true); }} className="text-red-600 hover:text-red-800 text-sm">
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-600 mb-2">Upload your company logo</p>
                          <p className="text-sm text-gray-500 mb-4">This logo will appear at the top of your undertaking document</p>
                          <button onClick={() => logoInputRef.current.click()} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            Upload Logo
                          </button>
                          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-green-100"><span className="text-sm text-gray-500">Company Name</span><div className="font-medium">{companyDetails.name}</div></div>
                    <div className="bg-white p-4 rounded-lg border border-green-100"><span className="text-sm text-gray-500">Country</span><div className="font-medium">{companyDetails.country}</div></div>
                    <div className="bg-white p-4 rounded-lg border border-green-100"><span className="text-sm text-gray-500">Registration Number</span><div className="font-medium">{companyDetails.registration}</div></div>
                    <div className="bg-white p-4 rounded-lg border border-green-100"><span className="text-sm text-gray-500">Tax ID Number</span><div className="font-medium">{companyDetails.taxId}</div></div>
                    <div className="bg-white p-4 rounded-lg border border-green-100"><span className="text-sm text-gray-500">{isExporter ? "Export License" : "Import License"}</span><div className="font-medium">{companyDetails.license}</div></div>
                    <div className="bg-white p-4 rounded-lg border border-green-100 md:col-span-2"><span className="text-sm text-gray-500">Corporate Address</span><div className="font-medium whitespace-pre-line">{companyDetails.address}</div></div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">Select Relevant Products</h2>
                    <p className="text-gray-600">Under EUDR regulations, these commodities and derived products must be deforestation‑free…</p>
                  </div>
                  {isEditing && <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>}
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by product name or HS code..." className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  {searchQuery && (
                    <div className="mt-2 bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product, idx) => (
                        <div key={idx} className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0" onClick={() => handleProductSelect(product, product.commodity)}>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.code}</div>
                          <div className="text-xs text-green-600 mt-1">{product.commodity}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {commoditiesData.map(group => (
                    <div key={group.commodity} className="border border-green-200 rounded-lg">
                      <button className="w-full p-4 flex justify-between items-center bg-green-50 hover:bg-green-100 rounded-t-lg" onClick={() => toggleCommodity(group.commodity)}>
                        <span className="font-semibold text-green-800">{group.commodity}</span>
                        <ChevronRight className={`transition-transform ${expandedCommodities[group.commodity] ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedCommodities[group.commodity] && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.products.map(product => {
                            const isSelected = selectedProducts.some(p => p.code === product.code);
                            return (
                              <div key={product.code} className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'}`} onClick={() => handleProductSelect(product, group.commodity)}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">{product.name}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">{product.code}</div>
                                  </div>
                                  {isSelected && <Check className="text-green-600" size={16} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-700 mb-3">Selected Products ({selectedProducts.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map(p => (
                        <div key={p.code} className="bg-green-50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
                          <span className="text-sm font-medium">{p.code}</span>
                          <span className="text-xs text-gray-600">({p.commodity})</span>
                          <button onClick={() => handleRemoveProduct(p.code)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-green-800">Signatory Information</h2>
                  {isEditing && <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name of Signatory *</label>
                      <input type="text" className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" value={signatureData.signeeName} onChange={e => { setSignatureData({ ...signatureData, signeeName: e.target.value }); setIsEditing(true); }} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation of Signee *</label>
                      <input type="text" className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" value={signatureData.signeeFunction} onChange={e => { setSignatureData({ ...signatureData, signeeFunction: e.target.value }); setIsEditing(true); }} placeholder="e.g., Export Manager, CEO" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Upload Signature *</label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
                      {signatureData.signature ? (
                        <div className="space-y-4">
                          <img src={signatureData.signature} alt="Signature" className="max-h-32 mx-auto" />
                          <button onClick={() => { setSignatureData({ ...signatureData, signature: null }); setIsEditing(true); }} className="text-red-600 hover:text-red-800 text-sm">Remove Signature</button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-600 mb-2">Upload a clear image of your signature</p>
                          <p className="text-sm text-gray-500 mb-4">Please sign on a white paper, take a photo or scan it, and upload here</p>
                          <button onClick={() => fileInputRef.current.click()} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Upload Signature</button>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                  <ChevronLeft size={20} /> Previous
                </button>
              )}
              <div className={`${currentStep > 1 ? 'w-full sm:w-auto order-1 sm:order-2' : 'w-full'}`}>
                {currentStep < 3 ? (
                  <button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 w-full">
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button onClick={() => setShowPreview(true)} disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature} className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full ${!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                    Preview
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview Modal (exporter/importer only) */}
      {showPreview && !isVerifier && <PreviewModal />}

      {/* Verification History Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowNotesModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-green-800">Verification Notes</h2>
                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {verificationHistory.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="font-medium text-gray-700">{item.verifierName}</span>
                        {item.date && <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                        item.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status ? item.status.replace('-', ' ') : 'Not set'}
                      </span>
                    </div>
                    {item.notes.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.notes.map((note, noteIdx) => (
                          <div key={noteIdx} className="text-sm text-gray-600 pl-6 border-l-2 border-green-200 ml-2">
                            • {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  // ---------- Preview Modal Component (unchanged from original) ----------
  function PreviewModal() {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const productList = selectedProducts.map(p => `${p.code} - ${p.name}`).join(', ');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">Undertaking Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-8">
              {companyLogo && (
                <div className="mb-8 text-center">
                  <img src={companyLogo} alt="Company Logo" className="max-h-40 mx-auto mb-4" />
                  <div className="h-1 w-32 bg-green-600 mx-auto"></div>
                </div>
              )}
              <div className="text-center mb-8">
                <div className="text-3xl font-bold text-green-800 mb-2">UNDERTAKING</div>
                <div className="h-1 w-32 bg-green-600 mx-auto"></div>
              </div>
              <div className="space-y-6">
                <div className="mb-6">
                  <p className="font-bold text-lg mb-2">Company Address:</p>
                  <div className="whitespace-pre-line text-lg bg-gray-50 p-4 rounded-lg">{companyDetails.address}</div>
                </div>
                <p className="text-lg"><span className="font-bold">{companyDetails.name}</span> shall make available to the competent authorities upon request the information, documents and data collected by TraceRX.</p>
                <p className="text-lg"><span className="font-bold">{companyDetails.name}</span> hereby declare that our product namely <span className="font-semibold text-green-700">{productList}</span> has fulfilled all the following conditions:</p>
                <ol className="list-decimal pl-5 space-y-2 text-lg">
                  <li>they are deforestation-free;</li>
                  <li>they have been produced in accordance with the relevant legislation of the country of production ({companyDetails.country}); and</li>
                  <li>they are covered by a due diligence statement.</li>
                </ol>
                <div className="mt-12 space-y-6">
                  <div className="flex justify-between items-center">
                    <div><div className="font-bold">Signed for and on behalf of:</div><div className="text-xl font-semibold text-green-800">{companyDetails.name}</div></div>
                    <div className="text-right"><div className="font-bold">Date:</div><div>{currentDate}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div><div className="font-bold mb-2">Name and function:</div><div className="border-b-2 border-gray-300 pb-1">{signatureData.signeeName} - {signatureData.signeeFunction}</div></div>
                    <div><div className="font-bold mb-2">Signature:</div>{signatureData.signature && <img src={signatureData.signature} alt="Signature" className="h-16 border-b-2 border-gray-300" />}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button onClick={() => setShowPreview(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto">Back to Edit</button>
              <button onClick={handleSave} className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 w-full sm:w-auto">Save Draft</button>
              <button onClick={handleSubmit} disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature} className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto ${!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}><FileText size={20} /> Submit</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
};

export default SubjectMatterScope;
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Search, X, Upload, FileText, ChevronRight, ChevronLeft, Check, Image as ImageIcon } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

// Static mockAllCompanies removed since we'll use userStore data

const SubjectMatterScope = () => {
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

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const { user, demoData, updateUser } = useUserStore();

  // Get current company data based on logged-in status
  const getCurrentCompany = () => {
    if (!user) return null;
    
    // Check if user is logged in as a company (agent scenario)
    if (user.loggedInAs?.companyId) {
      return demoData.users[user.loggedInAs.companyId];
    } else if (user.role === 'exporter' || user.role === 'importer') {
      // User is an exporter or importer logged in directly
      return user;
    }
    return null;
  };

  const currentCompany = getCurrentCompany();
  const isExporter = currentCompany?.role === 'exporter';
  const isImporter = currentCompany?.role === 'importer';

  // Get commodities data from userStore
  const commoditiesData = demoData.commodities || [];

  // Load existing data on component mount
  useEffect(() => {
    if (currentCompany && initialLoad) {
      // Load existing selected products
      if (currentCompany.supportedCommodities && currentCompany.supportedCommodities.length > 0) {
        const existingProducts = currentCompany.supportedCommodities.flatMap(commodity =>
          commodity.products.map(product => ({
            ...product,
            commodity: commodity.commodity
          }))
        );
        setSelectedProducts(existingProducts);
        
        // Expand commodities that have selected products
        const expanded = {};
        existingProducts.forEach(product => {
          expanded[product.commodity] = true;
        });
        setExpandedCommodities(expanded);
      }

      // Load undertaking data if exists
      if (currentCompany.undertaken) {
        setSignatureData({
          signature: currentCompany.undertaken.signature || "",
          signeeName: currentCompany.undertaken.name || "",
          signeeFunction: currentCompany.undertaken.function || "",
          exporterId: currentCompany.traceRxId || ""
        });
      }

      // Load company logo if exists
      if (currentCompany.logo?.url) {
        setCompanyLogo(currentCompany.logo.url);
      }

      setInitialLoad(false);
    }
  }, [currentCompany, initialLoad]);

  // Get corporate address from first corporate facility
  const getCorporateAddress = () => {
    if (!currentCompany?.facilities) return '';
    
    const corporateFacilities = currentCompany.facilities.filter(
      facility => facility.type === 'Corporate facility'
    );
    
    if (corporateFacilities.length > 0) {
      return corporateFacilities[0].address || '';
    }
    
    return currentCompany.basicInfo?.country || '';
  };

  // Company details from current user
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

  const filteredProducts = searchQuery
    ? commoditiesData.flatMap(commodity =>
      commodity.products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.includes(searchQuery)
      ).map(product => ({ ...product, commodity: commodity.commodity }))
    )
    : [];

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
    setExpandedCommodities(prev => ({
      ...prev,
      [commodity]: !prev[commodity]
    }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureData(prev => ({
          ...prev,
          signature: reader.result
        }));
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

  // Convert selected products to supportedCommodities format
  const convertToSupportedCommodities = () => {
    const groupedByCommodity = {};
    
    selectedProducts.forEach(product => {
      if (!groupedByCommodity[product.commodity]) {
        groupedByCommodity[product.commodity] = {
          commodity: product.commodity,
          products: []
        };
      }
      groupedByCommodity[product.commodity].products.push({
        code: product.code,
        name: product.name
      });
    });
    
    return Object.values(groupedByCommodity);
  };

  const handleSave = () => {
    if (!currentCompany) return;
    
    // Update the user data in the store
    const updatedCompany = {
      ...currentCompany,
      supportedCommodities: convertToSupportedCommodities(),
      undertaken: {
        ...currentCompany.undertaken,
        name: signatureData.signeeName,
        function: signatureData.signeeFunction,
        signature: signatureData.signature || currentCompany.undertaken?.signature || ""
      },
      logo: companyLogo ? {
        name: isExporter ? 'exporter-logo' : 'importer-logo',
        url: companyLogo
      } : currentCompany.logo
    };
    
    updateUser(currentCompany.id, updatedCompany);
    setIsEditing(false);
    alert("Draft saved successfully!");
  };

  const handleSubmit = () => {
    if (!currentCompany) return;
    
    // First save all data
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
      logo: companyLogo ? {
        name: isExporter ? 'exporter-logo' : 'importer-logo',
        url: companyLogo
      } : currentCompany.logo,
      isRegistered: true // Mark as registered after submitting undertaking
    };
    
    updateUser(currentCompany.id, updatedCompany);
    setIsEditing(false);
    setIsSubmitted(true);
    
    // In a real app, you would generate and download PDF here
    alert("Undertaking submitted successfully! PDF has been generated.");
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const productList = selectedProducts.map(p => `${p.code} - ${p.name}`).join(', ');

    return {
      companyName: companyDetails.name,
      products: productList,
      countryOfProduction: companyDetails.country,
      date: currentDate,
      signeeName: signatureData.signeeName,
      signeeFunction: signatureData.signeeFunction,
      signature: signatureData.signature,
      companyLogo: companyLogo,
      companyAddress: companyDetails.address
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-green-800 mb-4">Company Information</h2>
              
              {/* Logo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  {companyLogo ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border flex flex-col items-center">
                        <img
                          src={companyLogo}
                          alt="Company Logo"
                          className="max-h-40 mx-auto mb-4"
                        />
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 text-sm"
                          onClick={() => {
                            setCompanyLogo(null);
                            setIsEditing(true);
                          }}
                        >
                          Remove Logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-gray-600 mb-2">
                        Upload your company logo
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        This logo will appear at the top of your undertaking document
                      </p>
                      <button
                        type="button"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        onClick={() => logoInputRef.current.click()}
                      >
                        Upload Logo
                      </button>
                      <input
                        type="file"
                        ref={logoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Company Name</div>
                  <div className="font-medium">{companyDetails.name}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Country</div>
                  <div className="font-medium">{companyDetails.country}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Registration Number</div>
                  <div className="font-medium">{companyDetails.registration}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Tax ID Number</div>
                  <div className="font-medium">{companyDetails.taxId}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">
                    {isExporter ? "Export License" : "Import License"}
                  </div>
                  <div className="font-medium">{companyDetails.license}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100 md:col-span-2">
                  <div className="text-sm text-gray-500">Corporate Address</div>
                  <div className="font-medium whitespace-pre-line">{companyDetails.address}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">Select Relevant Products</h2>
                  <p className="text-gray-600">
                    Under EUDR regulations, these commodities and derived products must be deforestation-free,
                    produced in accordance with relevant legislation, and covered by a due diligence statement.
                  </p>
                </div>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by product name or HS code..."
                    className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {searchQuery && (
                  <div className="mt-2 bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleProductSelect(product, product.commodity)}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code}</div>
                        <div className="text-xs text-green-600 mt-1">{product.commodity}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {commoditiesData.map((commodityGroup) => (
                  <div key={commodityGroup.commodity} className="border border-green-200 rounded-lg">
                    <button
                      className="w-full p-4 flex justify-between items-center bg-green-50 hover:bg-green-100 rounded-t-lg"
                      onClick={() => toggleCommodity(commodityGroup.commodity)}
                    >
                      <span className="font-semibold text-green-800">{commodityGroup.commodity}</span>
                      <ChevronRight
                        className={`transition-transform ${expandedCommodities[commodityGroup.commodity] ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {expandedCommodities[commodityGroup.commodity] && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {commodityGroup.products.map((product) => {
                          const isSelected = selectedProducts.some(p => p.code === product.code);
                          return (
                            <div
                              key={product.code}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${isSelected
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200'
                                }`}
                              onClick={() => handleProductSelect(product, commodityGroup.commodity)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{product.name}</div>
                                  <div className="text-xs text-gray-500 font-mono mt-1">{product.code}</div>
                                </div>
                                {isSelected && (
                                  <Check className="text-green-600" size={16} />
                                )}
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
                    {selectedProducts.map((product) => (
                      <div
                        key={product.code}
                        className="bg-green-50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2"
                      >
                        <span className="text-sm font-medium">{product.code}</span>
                        <span className="text-xs text-gray-600">({product.commodity})</span>
                        <button
                          onClick={() => handleRemoveProduct(product.code)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-800">Signatory Information</h2>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name of Signee *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={signatureData.signeeName}
                    onChange={(e) => {
                      setSignatureData(prev => ({ ...prev, signeeName: e.target.value }));
                      setIsEditing(true);
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Function of Signee *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={signatureData.signeeFunction}
                    onChange={(e) => {
                      setSignatureData(prev => ({ ...prev, signeeFunction: e.target.value }));
                      setIsEditing(true);
                    }}
                    placeholder="e.g., Export Manager, CEO"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Signature *
                </label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center">
                  {signatureData.signature ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <img
                          src={signatureData.signature}
                          alt="Signature"
                          className="max-h-32 mx-auto"
                        />
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => {
                          setSignatureData(prev => ({ ...prev, signature: null }));
                          setIsEditing(true);
                        }}
                      >
                        Remove Signature
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                      <p className="text-gray-600 mb-2">
                        Upload a clear image of your signature
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Please sign on a white paper, take a photo or scan it, and upload here
                      </p>
                      <button
                        type="button"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Upload Signature
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Undertaking Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-8">
            {/* Logo Section - appears at the top */}
            {companyLogo && (
              <div className="mb-8 text-center">
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="max-h-40 mx-auto mb-4"
                />
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
                <div className="whitespace-pre-line text-lg bg-gray-50 p-4 rounded-lg">
                  {companyDetails.address}
                </div>
              </div>

              <p className="text-lg">
                <span className="font-bold">{companyDetails.name}</span> shall make available to
                the competent authorities upon request the information, documents and data collected
                by TraceRX.
              </p>

              <p className="text-lg">
                <span className="font-bold">{companyDetails.name}</span> hereby declare that our
                product namely{' '}
                <span className="font-semibold text-green-700">
                  {selectedProducts.map(p => `${p.code} - ${p.name}`).join(', ')}
                </span>{' '}
                has fulfilled all the following conditions:
              </p>

              <ol className="list-decimal pl-5 space-y-2 text-lg">
                <li>they are deforestation-free;</li>
                <li>
                  they have been produced in accordance with the relevant legislation of the country
                  of production ({companyDetails.country}); and
                </li>
                <li>they are covered by a due diligence statement.</li>
              </ol>

              <div className="mt-12 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Signed for and on behalf of:</div>
                    <div className="text-xl font-semibold text-green-800">{companyDetails.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">Date:</div>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="font-bold mb-2">Name and function:</div>
                    <div className="border-b-2 border-gray-300 pb-1">
                      {signatureData.signeeName} - {signatureData.signeeFunction}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-2">Signature:</div>
                    {signatureData.signature && (
                      <img
                        src={signatureData.signature}
                        alt="Signature"
                        className="h-16 border-b-2 border-gray-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto order-2 sm:order-1"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 w-full sm:w-auto"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature}
              className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2 ${
                !signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <FileText size={20} />
              Submit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!user || !currentCompany) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6">
        Subject Matter & Scope
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
        <p className="text-gray-700 mb-8">
          This section covers the regulatory scope and subject matter requirements for EUDR compliance,
          including product categories, geographical scope, and compliance timelines.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <div className="ml-2 text-sm font-medium hidden sm:block">
                {step === 1 ? 'Company Info' : step === 2 ? 'Products' : 'Signature'}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons - Updated for mobile responsiveness */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
          )}

          <div className={`${currentStep > 1 ? 'w-full sm:w-auto order-1 sm:order-2' : 'w-full'}`}>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 w-full"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => setShowPreview(true)}
                disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature}
                className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 w-full ${
                  !signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Preview
              </button>
            )}
          </div>
        </div>

        {/* Selected Products Summary (always visible when on other steps) */}
        {currentStep !== 2 && selectedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-700 mb-3">Selected Products</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProducts.slice(0, 5).map((product) => (
                <div
                  key={product.code}
                  className="bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm"
                >
                  {product.code}
                </div>
              ))}
              {selectedProducts.length > 5 && (
                <div className="bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm">
                  +{selectedProducts.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save button for editing */}
        {isEditing && currentStep !== 2 && (
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 w-full"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {showPreview && <PreviewModal />}
    </motion.div>
  );
};

export default SubjectMatterScope;
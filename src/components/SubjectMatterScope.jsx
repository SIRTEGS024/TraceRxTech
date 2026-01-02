import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Search, X, Upload, FileText, ChevronRight, ChevronLeft, Check, Image as ImageIcon } from 'lucide-react';

const mockAllCompanies = [
  {
    id: 1,
    name: "Timber Export Co.",
    country: "Canada",
    address: "456 Timber Lane\nVancouver, BC V6B 1A1\nCanada",
    registrationNumber: "CAN-TIM-2024-001",
    taxId: "TIN-CA-123456",
    exportCertificate: "CA-EXPORT-2024-789",
    documents: [
      {
        category: "Registration Documents",
        files: [
          { name: "Business License 2024", date: "2024-01-15" },
          { name: "Articles of Incorporation", date: "2024-01-10" }
        ]
      },
      {
        category: "Licenses & Permits",
        files: [
          { name: "Export License", date: "2024-02-01" },
          { name: "Forestry Permit", date: "2024-01-20" }
        ]
      }
    ],
    offices: [
      {
        id: 101,
        type: "corporate",
        name: "Head Office",
        address: "456 Timber Lane, Vancouver",
        staff: [
          { id: 1001, name: "John Smith", jobTitle: "CEO", age: 45 },
          { id: 1002, name: "Sarah Johnson", jobTitle: "Export Manager", age: 38 }
        ]
      },
      {
        id: 102,
        type: "production",
        name: "Sawmill Facility",
        address: "789 Forest Road, Whistler",
        staff: [
          { id: 1003, name: "Mike Wilson", jobTitle: "Production Manager", age: 42 },
          { id: 1004, name: "Lisa Chen", jobTitle: "Quality Control", age: 35 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Global Wood Products",
    country: "Sweden",
    address: "789 Pine Street\nStockholm, 111 29\nSweden",
    registrationNumber: "SWE-WOOD-2024-002",
    taxId: "TIN-SE-654321",
    exportCertificate: "SE-EXPORT-2024-456",
    documents: [
      {
        category: "Registration Documents",
        files: [
          { name: "Swedish Business Registration", date: "2024-02-10" },
          { name: "EU Export Certificate", date: "2024-02-15" }
        ]
      }
    ],
    offices: [
      {
        id: 201,
        type: "corporate",
        name: "Stockholm HQ",
        address: "789 Pine Street, Stockholm",
        staff: [
          { id: 2001, name: "Anders Larsson", jobTitle: "Managing Director", age: 50 },
          { id: 2002, name: "Eva Nilsson", jobTitle: "International Sales", age: 41 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Pacific Lumber Inc.",
    country: "United States",
    address: "321 Redwood Ave\nSeattle, WA 98101\nUSA",
    registrationNumber: "US-PAC-2024-003",
    taxId: "TIN-US-987654",
    exportCertificate: "US-EXPORT-2024-123",
    documents: [
      {
        category: "Registration Documents",
        files: [
          { name: "Washington State Business License", date: "2024-01-05" },
          { name: "Federal EIN Certificate", date: "2024-01-10" }
        ]
      },
      {
        category: "Licenses & Permits",
        files: [
          { name: "Sustainable Forestry Certificate", date: "2024-02-20" },
          { name: "USDA Export License", date: "2024-02-15" }
        ]
      }
    ],
    offices: [
      {
        id: 301,
        type: "corporate",
        name: "Seattle Headquarters",
        address: "321 Redwood Ave, Seattle",
        staff: [
          { id: 3001, name: "Robert Brown", jobTitle: "President", age: 52 },
          { id: 3002, name: "Maria Garcia", jobTitle: "Export Director", age: 44 }
        ]
      },
      {
        id: 302,
        type: "production",
        name: "Portland Mill",
        address: "555 Oak Street, Portland",
        staff: [
          { id: 3003, name: "David Wilson", jobTitle: "Plant Manager", age: 48 }
        ]
      }
    ]
  }
];

const commoditiesData = [
  {
    commodity: "Cattle",
    products: [
      { code: "0102 21 00", name: "Live bovine animals (breeding)" },
      { code: "0102 29 05", name: "Live bovine animals (other, <80 kg)" },
      { code: "0102 29 95", name: "Live bovine animals (other)" },
      { code: "0201", name: "Meat of bovine animals, fresh or chilled" },
      { code: "0202", name: "Meat of bovine animals, frozen" },
      { code: "0206 10 95", name: "Edible offal of bovine animals, fresh or chilled" },
      { code: "0206 22 00", name: "Bovine livers, frozen" },
      { code: "0206 29 91", name: "Bovine offal, frozen (excluding tongues and livers)" },
      { code: "0210 20", name: "Meat of bovine animals, salted, in brine, dried or smoked" },
      { code: "4101", name: "Raw hides and skins of bovine animals" },
      { code: "4102", name: "Raw skins of sheep or lambs" },
      { code: "4103", name: "Other raw hides and skins" },
      { code: "4301", name: "Raw furskins" }
    ]
  },
  {
    commodity: "Cocoa",
    products: [
      { code: "1801 00 00", name: "Cocoa beans, whole or broken, raw or roasted" },
      { code: "1802 00 00", name: "Cocoa shells, husks, skins and other cocoa waste" },
      { code: "1803", name: "Cocoa paste, whether or not defatted" },
      { code: "1804 00 00", name: "Cocoa butter, fat and oil" },
      { code: "1805 00 00", name: "Cocoa powder, not containing added sugar" },
      { code: "1806", name: "Chocolate and other food preparations containing cocoa" }
    ]
  },
  {
    commodity: "Coffee",
    products: [
      { code: "ex 0901 11 00", name: "Coffee, not roasted, not decaffeinated" },
      { code: "ex 0901 12 00", name: "Coffee, not roasted, decaffeinated" },
      { code: "ex 0901 21 00", name: "Roasted coffee, not decaffeinated" },
      { code: "ex 0901 22 00", name: "Roasted coffee, decaffeinated" },
      { code: "ex 0901 90 90", name: "Coffee husks and skins; coffee substitutes containing coffee" }
    ]
  },
  {
    commodity: "Oil palm",
    products: [
      { code: "1207 10 00", name: "Palm nuts and kernels" },
      { code: "1511", name: "Palm oil and its fractions" },
      { code: "1513 21", name: "Palm kernel oil, crude" },
      { code: "1513 29", name: "Palm kernel oil and its fractions, refined" },
      { code: "1516 20 96", name: "Palm oil derivatives (vegetable fats and oils)" },
      { code: "2306 60 00", name: "Oil-cake and other solid residues from palm oil extraction" }
    ]
  },
  {
    commodity: "Rubber",
    products: [
      { code: "4001", name: "Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums" },
      { code: "4002", name: "Synthetic rubber and factice derived from oils" },
      { code: "4005", name: "Compounded rubber, unvulcanised" },
      { code: "4006", name: "Unvulcanised rubber in other forms" },
      { code: "4007", name: "Vulcanised rubber thread and cord" },
      { code: "4008", name: "Plates, sheets, strip, rods and profile shapes of vulcanised rubber" },
      { code: "4009", name: "Tubes, pipes and hoses of vulcanised rubber" },
      { code: "4010", name: "Conveyor or transmission belts of vulcanised rubber" },
      { code: "4011", name: "New pneumatic tyres, of rubber" },
      { code: "4012", name: "Retreaded or used pneumatic tyres; solid or cushion tyres" },
      { code: "4013", name: "Inner tubes, of rubber" },
      { code: "4014", name: "Hygienic or pharmaceutical articles of vulcanised rubber" },
      { code: "4015", name: "Articles of apparel and clothing accessories of vulcanised rubber" },
      { code: "4016", name: "Other articles of vulcanised rubber (excluding hard rubber)" },
      { code: "4017", name: "Hard rubber in all forms" }
    ]
  },
  {
    commodity: "Soya",
    products: [
      { code: "1201 90 00", name: "Soya beans, whether or not broken" },
      { code: "1208 10 00", name: "Flours and meals of soya beans" },
      { code: "1507", name: "Soya-bean oil and its fractions" },
      { code: "2304 00 00", name: "Oil-cake and other solid residues from soya-bean oil extraction" }
    ]
  },
  {
    commodity: "Wood",
    products: [
      { code: "4401", name: "Fuel wood" },
      { code: "4402", name: "Wood charcoal" },
      { code: "4403", name: "Wood in the rough" },
      { code: "4404", name: "Hoopwood; split poles; piles, pickets and stakes" },
      { code: "4405", name: "Wood wool; wood flour" },
      { code: "4406", name: "Railway or tramway sleepers of wood" },
      { code: "4407", name: "Wood sawn or chipped lengthwise" },
      { code: "4408", name: "Sheets for veneering" },
      { code: "4409", name: "Wood continuously shaped along any edges" },
      { code: "4410", name: "Particle board, OSB and similar board" },
      { code: "4411", name: "Fibreboard of wood" },
      { code: "4412", name: "Plywood, veneered panels and similar laminated wood" },
      { code: "4413", name: "Densified wood" },
      { code: "4414", name: "Wooden frames for paintings, photographs, etc." },
      { code: "4415", name: "Packing cases, boxes, crates, drums and pallets" },
      { code: "4416", name: "Casks, barrels, vats, tubs and other coopers' products" },
      { code: "4417", name: "Tools, tool bodies, tool handles, broom or brush bodies" },
      { code: "4418", name: "Builders' joinery and carpentry of wood" },
      { code: "4419", name: "Tableware and kitchenware, of wood" },
      { code: "4420", name: "Wood marquetry and inlaid wood; caskets and cases" },
      { code: "4421", name: "Other articles of wood" }
    ]
  }
];

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

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Company details (this would come from props or context in real app)
  const companyDetails = {
    name: "American Timber Exports Inc.",
    country: "United States",
    registration: "BUS-2024-TIM-001",
    taxId: "TIN-US-789012",
    exportCert: "US-EXPORT-2024-345678",
    office: "123 Business District\nPortland, Oregon 97204\nUSA"
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
    }
  };

  const handleRemoveProduct = (code) => {
    setSelectedProducts(selectedProducts.filter(p => p.code !== code));
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
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDFContent = () => {
    const selectedExporter = mockAllCompanies.find(c => c.id.toString() === signatureData.exporterId);
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
      companyLogo: companyLogo
    };
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // In a real app, you would generate and download PDF here
    alert("Undertaking submitted successfully! PDF has been generated.");
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
                          onClick={() => setCompanyLogo(null)}
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
                  <div className="text-sm text-gray-500">Registration</div>
                  <div className="font-medium">{companyDetails.registration}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Tax ID</div>
                  <div className="font-medium">{companyDetails.taxId}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-500">Export Certificate</div>
                  <div className="font-medium">{companyDetails.exportCert}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100 md:col-span-2">
                  <div className="text-sm text-gray-500">Corporate Office</div>
                  <div className="font-medium whitespace-pre-line">{companyDetails.office}</div>
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
              <h2 className="text-xl font-semibold text-green-800 mb-2">Select Relevant Products</h2>
              <p className="text-gray-600 mb-4">
                Under EUDR regulations, these commodities and derived products must be deforestation-free,
                produced in accordance with relevant legislation, and covered by a due diligence statement.
              </p>

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
                        {commodityGroup.products.map((product) => (
                          <div
                            key={product.code}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${selectedProducts.some(p => p.code === product.code)
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
                              {selectedProducts.some(p => p.code === product.code) && (
                                <Check className="text-green-600" size={16} />
                              )}
                            </div>
                          </div>
                        ))}
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
            <h2 className="text-xl font-semibold text-green-800 mb-4">Signatory Information</h2>

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
                    onChange={(e) => setSignatureData(prev => ({ ...prev, signeeName: e.target.value }))}
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
                    onChange={(e) => setSignatureData(prev => ({ ...prev, signeeFunction: e.target.value }))}
                    placeholder="e.g., Export Manager, CEO"
                    required
                  />
                </div>

                {/* Removed Select Exporter field */}
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
                        onClick={() => setSignatureData(prev => ({ ...prev, signature: null }))}
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

                {/* Removed Selected Exporter section from preview */}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              <FileText size={20} />
              Final Submit & Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step
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

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
          )}

          <div className="ml-auto">
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => setShowPreview(true)}
                disabled={!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!signatureData.signeeName || !signatureData.signeeFunction || !signatureData.signature
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                <FileText size={20} />
                Preview & Submit
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
      </div>

      {showPreview && <PreviewModal />}
    </motion.div>
  );
};

export default SubjectMatterScope;
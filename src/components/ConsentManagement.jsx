import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const ConsentManagement = () => {
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
        { code: "4103", name: "Raw hides and skins" },
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

  const mockThirdPartyCompanies = [
    { id: 1, name: "Global Agro Services", serviceFee: 2.50, rating: 4.5 },
    { id: 2, name: "Green Earth Logistics", serviceFee: 3.00, rating: 4.2 },
    { id: 3, name: "Sustainable Trade Partners", serviceFee: 2.75, rating: 4.7 },
    { id: 4, name: "Eco Export Solutions", serviceFee: 3.20, rating: 4.3 },
    { id: 5, name: "Agri-Compliance Specialists", serviceFee: 2.90, rating: 4.6 },
  ];

  const mockForestsInitial = [
    {
      id: 1,
      name: "Amazon Rainforest - Brazil Sector",
      coordinates: { lat: -3.4653, lng: -62.2159 },
      area: "5.5M hectares",
      country: "Brazil",
      region: "South America",
      isAvailable: false,
      feePerKg: 0
    },
    {
      id: 2,
      name: "Congo Basin Forest",
      coordinates: { lat: 0.2280, lng: 15.8277 },
      area: "3.0M hectares",
      country: "Democratic Republic of Congo",
      region: "Central Africa",
      isAvailable: false,
      feePerKg: 0
    },
    {
      id: 3,
      name: "Borneo Rainforest",
      coordinates: { lat: 0.9619, lng: 114.5548 },
      area: "2.2M hectares",
      country: "Indonesia",
      region: "Southeast Asia",
      isAvailable: false,
      feePerKg: 0
    },
    {
      id: 4,
      name: "Canadian Boreal Forest",
      coordinates: { lat: 56.1304, lng: -106.3468 },
      area: "4.8M hectares",
      country: "Canada",
      region: "North America",
      isAvailable: false,
      feePerKg: 0
    },
    {
      id: 5,
      name: "Siberian Taiga",
      coordinates: { lat: 61.5240, lng: 105.3188 },
      area: "6.7M hectares",
      country: "Russia",
      region: "Asia",
      isAvailable: false,
      feePerKg: 0
    }
  ];

  // Third Party Application State
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedHSCodes, setSelectedHSCodes] = useState([]);
  const [containers, setContainers] = useState([
    { containerNumber: '', packingListFile: null, kgPerContainer: '' }
  ]);
  const [totalKg, setTotalKg] = useState('');
  const [portShipment, setPortShipment] = useState('');
  const [portDestination, setPortDestination] = useState('');

  // Forest Management State
  const [forests, setForests] = useState(mockForestsInitial);
  const [globalForestFee, setGlobalForestFee] = useState('');
  const [forestChangesSaved, setForestChangesSaved] = useState(true);

  // Applications State
  const [myApplications, setMyApplications] = useState([
    {
      id: 1,
      companyName: "My Agro Inc.",
      commodity: "Coffee",
      hsCodes: ["ex 0901 11 00", "ex 0901 12 00"],
      totalKg: 25000,
      portShipment: "Mombasa",
      portDestination: "Rotterdam",
      status: "pending",
      appliedDate: "2024-01-15",
      thirdPartyCompany: "Green Earth Logistics",
      serviceFee: 3.00,
      containers: [
        { containerNumber: "CONT001", packingListFile: "packing_list_001.pdf", kgPerContainer: 12500 },
        { containerNumber: "CONT002", packingListFile: "packing_list_002.pdf", kgPerContainer: 12500 }
      ]
    },
    {
      id: 2,
      companyName: "My Agro Inc.",
      commodity: "Cocoa",
      hsCodes: ["1804 00 00", "1805 00 00"],
      totalKg: 15000,
      portShipment: "Lagos",
      portDestination: "Hamburg",
      status: "approved",
      appliedDate: "2024-01-10",
      thirdPartyCompany: "Global Agro Services",
      serviceFee: 2.50,
      containers: [
        { containerNumber: "CONT003", packingListFile: "cocoa_packing.pdf", kgPerContainer: 15000 }
      ]
    }
  ]);

  const [incomingApplications, setIncomingApplications] = useState([
    {
      id: 3,
      companyName: "Sunrise Exports",
      commodity: "Wood",
      hsCodes: ["4407", "4408"],
      totalKg: 40000,
      portShipment: "Jakarta",
      portDestination: "Shanghai",
      status: "pending",
      appliedDate: "2024-01-16",
      thirdPartyCompany: "My Agro Inc.",
      serviceFee: 2.90,
      containers: [
        { containerNumber: "CONT004", packingListFile: "teak_packing.pdf", kgPerContainer: 20000 },
        { containerNumber: "CONT005", packingListFile: "teak_packing2.pdf", kgPerContainer: 20000 }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('apply');

  // Handle HS Code Selection
  const handleHSCodeSelect = (code) => {
    if (selectedHSCodes.includes(code)) {
      setSelectedHSCodes(selectedHSCodes.filter(c => c !== code));
    } else {
      setSelectedHSCodes([...selectedHSCodes, code]);
    }
  };

  // Handle Container Changes
  const handleContainerChange = (index, field, value) => {
    const newContainers = [...containers];
    newContainers[index] = { ...newContainers[index], [field]: value };
    setContainers(newContainers);
  };

  const addContainer = () => {
    setContainers([...containers, { containerNumber: '', packingListFile: null, kgPerContainer: '' }]);
  };

  const removeContainer = (index) => {
    if (containers.length > 1) {
      const newContainers = containers.filter((_, i) => i !== index);
      setContainers(newContainers);
    }
  };

  // Handle File Upload
  const handleFileUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      handleContainerChange(index, 'packingListFile', file.name);
    }
  };

  // Calculate Total Kilograms
  useEffect(() => {
    const total = containers.reduce((sum, container) => {
      return sum + (parseFloat(container.kgPerContainer) || 0);
    }, 0);
    setTotalKg(total.toString());
  }, [containers]);

  // Handle Forest Management
  const toggleForestAvailability = (id) => {
    setForests(forests.map(forest =>
      forest.id === id ? { ...forest, isAvailable: !forest.isAvailable } : forest
    ));
    setForestChangesSaved(false);
  };

  const updateForestFee = (id, fee) => {
    setForests(forests.map(forest =>
      forest.id === id ? { ...forest, feePerKg: parseFloat(fee) || 0 } : forest
    ));
    setForestChangesSaved(false);
  };

  const applyGlobalFee = () => {
    const fee = parseFloat(globalForestFee) || 0;
    setForests(forests.map(forest =>
      forest.isAvailable ? { ...forest, feePerKg: fee } : forest
    ));
    setForestChangesSaved(false);
  };

  // Save Forest Changes
  const saveForestChanges = () => {
    // In a real application, you would save to backend here
    console.log("Saving forest changes:", forests);
    setForestChangesSaved(true);
    alert("Forest estate changes saved successfully!");
  };

  // Handle Application Submission
  const handleSubmitApplication = () => {
    if (!selectedCompany || !companyName || !selectedCommodity || selectedHSCodes.length === 0 || !totalKg) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if all containers have files
    const missingFiles = containers.some(c => !c.packingListFile);
    if (missingFiles) {
      alert("Please upload packing list files for all containers");
      return;
    }

    const selectedCompanyData = mockThirdPartyCompanies.find(c => c.id === parseInt(selectedCompany));

    const newApplication = {
      id: myApplications.length + 1,
      companyName,
      commodity: selectedCommodity,
      hsCodes: [...selectedHSCodes],
      totalKg: parseFloat(totalKg),
      portShipment,
      portDestination,
      status: "pending",
      appliedDate: new Date().toISOString().split('T')[0],
      thirdPartyCompany: selectedCompanyData?.name || '',
      serviceFee: selectedCompanyData?.serviceFee || 0,
      containers: containers.map(c => ({
        containerNumber: c.containerNumber,
        packingListFile: c.packingListFile,
        kgPerContainer: parseFloat(c.kgPerContainer) || 0
      }))
    };

    setMyApplications([...myApplications, newApplication]);
    setActiveTab('my-apps');

    // Reset form
    setSelectedCompany('');
    setCompanyName('');
    setSelectedCommodity('');
    setSelectedHSCodes([]);
    setContainers([{ containerNumber: '', packingListFile: null, kgPerContainer: '' }]);
    setPortShipment('');
    setPortDestination('');
  };

  const handleApplicationDecision = (id, status) => {
    setIncomingApplications(incomingApplications.map(app =>
      app.id === id ? { ...app, status } : app
    ));
  };

  const selectedCompanyData = mockThirdPartyCompanies.find(c => c.id === parseInt(selectedCompany));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 min-h-screen bg-gray-50"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6">Consent Management</h1>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'apply'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Apply for Third Party
          </button>
          <button
            onClick={() => setActiveTab('forest')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'forest'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Manage Forest Estates
          </button>
          <button
            onClick={() => setActiveTab('my-apps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'my-apps'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            My Applications ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'incoming'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Incoming Applications ({incomingApplications.filter(a => a.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* THIRD PARTY APPLICATION */}
      {activeTab === 'apply' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">Apply for Third Party Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Third Party Company *
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose a company...</option>
                {mockThirdPartyCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} (${company.serviceFee}/kg) ⭐{company.rating}
                  </option>
                ))}
              </select>

              {selectedCompanyData && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700">
                    <span className="font-semibold">{selectedCompanyData.name}</span> charges{" "}
                    <span className="font-bold">${selectedCompanyData.serviceFee} per kilogram</span>
                  </p>
                </div>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your company name"
              />
            </div>

            {/* Commodity Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Commodity *
              </label>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose a commodity...</option>
                {commoditiesData.map((item) => (
                  <option key={item.commodity} value={item.commodity}>
                    {item.commodity}
                  </option>
                ))}
              </select>
            </div>

            {/* HS Code Selection */}
            {selectedCommodity && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select HS Code(s) *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commoditiesData
                    .find(item => item.commodity === selectedCommodity)
                    ?.products.map((product) => (
                      <div
                        key={product.code}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedHSCodes.includes(product.code)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        onClick={() => handleHSCodeSelect(product.code)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedHSCodes.includes(product.code)}
                            onChange={() => { }}
                            className="mr-3 h-4 w-4 text-green-600"
                          />
                          <div>
                            <div className="font-mono text-sm text-gray-600">{product.code}</div>
                            <div className="text-sm text-gray-700">{product.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Selected HS Codes */}
                {selectedHSCodes.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected HS Codes:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedHSCodes.map((code) => {
                        const product = commoditiesData
                          .find(c => c.commodity === selectedCommodity)
                          ?.products.find(p => p.code === code);
                        return (
                          <div
                            key={code}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
                          >
                            <span className="font-mono mr-2">{code}</span>
                            <button
                              onClick={() => handleHSCodeSelect(code)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Container Details */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-700">
                  Container Details *
                </label>
                <button
                  type="button"
                  onClick={addContainer}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  + Add Container
                </button>
              </div>

              <div className="space-y-4">
                {containers.map((container, index) => (
                  <div key={index} className="p-4 border border-gray-300 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700">Container #{index + 1}</h4>
                      {containers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContainer(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Container Number *
                        </label>
                        <input
                          type="text"
                          value={container.containerNumber}
                          onChange={(e) => handleContainerChange(index, 'containerNumber', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="e.g., CONT001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Packing List Document *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => handleFileUpload(index, e)}
                            className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                          />
                          {container.packingListFile && (
                            <div className="mt-2 text-sm text-green-600">
                              📄 {container.packingListFile}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kilograms per Container *
                        </label>
                        <input
                          type="number"
                          value={container.kgPerContainer}
                          onChange={(e) => handleContainerChange(index, 'kgPerContainer', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="e.g., 25000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Kilograms */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Kilograms:</span>
                  <span className="text-xl font-bold text-green-700">
                    {parseFloat(totalKg).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Port Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port of Shipment/Exit *
              </label>
              <input
                type="text"
                value={portShipment}
                onChange={(e) => setPortShipment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Mombasa Port"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port of Destination *
              </label>
              <input
                type="text"
                value={portDestination}
                onChange={(e) => setPortDestination(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Rotterdam Port"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmitApplication}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* FOREST ESTATE MANAGEMENT */}
      {activeTab === 'forest' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">Forest Estate Management</h2>
          <p className="text-gray-600 mb-6">
            Select which forests you want to make available for third-party applications and set your service fee.
          </p>

          {/* Global Fee Setting */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <label className="block text-sm font-medium text-green-800 mb-2">
              Set Global Fee for All Selected Forests
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={globalForestFee}
                    onChange={(e) => setGlobalForestFee(e.target.value)}
                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Fee per kilogram"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <button
                onClick={applyGlobalFee}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Apply to All Selected
              </button>
            </div>
          </div>

          {/* Forest List */}
          <div className="space-y-4">
            {forests.map((forest) => (
              <div key={forest.id} className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={forest.isAvailable}
                        onChange={() => toggleForestAvailability(forest.id)}
                        className="h-5 w-5 text-green-600"
                      />
                      <h3 className="font-bold text-green-800">{forest.name}</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📍 {forest.country}, {forest.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📏 Area: {forest.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍 Coordinates: {forest.coordinates.lat}, {forest.coordinates.lng}</span>
                      </div>
                    </div>
                  </div>

                  {forest.isAvailable && (
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fee per kg ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={forest.feePerKg}
                            onChange={(e) => updateForestFee(forest.id, e.target.value)}
                            className="pl-8 p-2 border border-gray-300 rounded-lg w-32"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button and Summary */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {!forestChangesSaved && (
                <div className="flex items-center text-yellow-600">
                  <span className="mr-2">⚠️</span>
                  You have unsaved changes
                </div>
              )}
            </div>

            <button
              onClick={saveForestChanges}
              className={`px-6 py-3 rounded-lg font-medium ${forestChangesSaved
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              disabled={forestChangesSaved}
            >
              {forestChangesSaved ? 'Changes Saved' : 'Save Changes'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-700 mb-2">Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Available Forests</div>
                <div className="text-2xl font-bold text-green-700">
                  {forests.filter(f => f.isAvailable).length}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Total Area Available</div>
                <div className="text-2xl font-bold text-green-700">
                  {forests
                    .filter(f => f.isAvailable)
                    .reduce((sum, f) => {
                      const area = parseFloat(f.area);
                      return sum + (isNaN(area) ? 0 : area);
                    }, 0)
                    .toFixed(1)}M ha
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Average Fee</div>
                <div className="text-2xl font-bold text-green-700">
                  ${(
                    forests
                      .filter(f => f.isAvailable && f.feePerKg > 0)
                      .reduce((sum, f) => sum + f.feePerKg, 0) /
                    Math.max(1, forests.filter(f => f.isAvailable && f.feePerKg > 0).length)
                  ).toFixed(2)}/kg
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MY CONSENT APPLICATIONS */}
      {activeTab === 'my-apps' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">My Applications</h2>

          <div className="space-y-6">
            {myApplications.map((application) => (
              <div key={application.id} className="p-4 border border-gray-300 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Application #{application.id}</h3>
                    <p className="text-gray-600">
                      To: {application.thirdPartyCompany} • Applied: {application.appliedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {application.status.toUpperCase()}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      ${application.serviceFee}/kg
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Commodity:</span>
                    <div className="font-medium">{application.commodity}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Weight:</span>
                    <div className="font-medium">{application.totalKg.toLocaleString()} kg</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <div className="font-medium">{application.portShipment} → {application.portDestination}</div>
                  </div>
                </div>

                {/* Display all HS Codes */}
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">HS Codes:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.hsCodes && application.hsCodes.map((code, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Containers:</span>{" "}
                  {application.containers.map((c, i) => (
                    <span key={i}>
                      {c.containerNumber} ({c.kgPerContainer.toLocaleString()}kg) - 📄 {c.packingListFile}
                      {i < application.containers.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>

                {/* No unapprove button for My Applications - these are applications I sent to others */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INCOMING APPLICATIONS */}
      {activeTab === 'incoming' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-6">Incoming Applications</h2>
          <p className="text-gray-600 mb-6">
            Applications from other companies requesting your third-party services.
          </p>

          <div className="space-y-6">
            {incomingApplications.map((application) => (
              <div key={application.id} className="p-4 border border-gray-300 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{application.productName || `Application #${application.id}`}</h3>
                    <p className="text-gray-600">
                      From: {application.companyName} • Applied: {application.appliedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {application.status.toUpperCase()}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      ${application.serviceFee}/kg
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Commodity:</span>
                    <div className="font-medium">{application.commodity}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Weight:</span>
                    <div className="font-medium">{application.totalKg.toLocaleString()} kg</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <div className="font-medium">{application.portShipment} → {application.portDestination}</div>
                  </div>
                </div>

                {/* Display all HS Codes */}
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">HS Codes:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.hsCodes && application.hsCodes.map((code, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Containers:</span>{" "}
                  {application.containers.map((c, i) => (
                    <span key={i}>
                      {c.containerNumber} ({c.kgPerContainer.toLocaleString()}kg) - 📄 {c.packingListFile}
                      {i < application.containers.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>

                {/* Action buttons for incoming applications */}
                {application.status === 'pending' && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => handleApplicationDecision(application.id, 'approved')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Application
                    </button>
                    <button
                      onClick={() => handleApplicationDecision(application.id, 'rejected')}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject Application
                    </button>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => handleApplicationDecision(application.id, 'pending')}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      ↺ Unapprove Application
                    </button>
                    <button
                      onClick={() => handleApplicationDecision(application.id, 'rejected')}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ConsentManagement;
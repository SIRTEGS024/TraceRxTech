import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Calendar,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Trees,
  Users,
  Globe,
  BarChart3,
  Truck,
  Warehouse,
  Ship,
  FileCheck,
  X,
  File,
  Tag,
  User,
  Hash,
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Layers,
  Building,
  Navigation,
  DollarSign,
  Weight,
} from 'lucide-react';

// Ports list for selection
const portsList = [
  "Port of Shanghai, China",
  "Port of Singapore, Singapore",
  "Port of Ningbo-Zhoushan, China",
  "Port of Shenzhen, China",
  "Port of Qingdao, China",
  "Port of Busan, South Korea",
  "Port of Guangzhou, China",
  "Port of Tianjin, China",
  "Port of Port Klang, Malaysia",
  "Port of Rotterdam, Netherlands",
  "Port of Los Angeles, USA",
  "Port of Long Beach, USA",
  "Port of Dubai (Jebel Ali), UAE",
  "Port of Antwerp-Bruges, Belgium",
  "Port of Hamburg, Germany",
  "Port of Hong Kong, China",
  "Port of Tanjung Pelepas, Malaysia",
  "Port of Xiamen, China",
  "Port of Laem Chabang, Thailand",
  "Port of New York/New Jersey, USA"
];

// Generate more detailed mock shipments with document descriptions
const generateMockShipments = () => {
  const shipments = [];
  const forestNames = [
    "Amazon Rainforest - Brazil",
    "Congo Basin Forest",
    "Borneo Rainforest",
    "Peruvian Amazon",
    "Colombian Rainforest",
    "Malaysian Borneo",
    "Papua New Guinea Forest",
    "Cameroon Forest Reserve",
    "Gabon Rainforest",
    "Vietnam Forest Zone"
  ];

  const countries = ["Brazil", "DR Congo", "Indonesia", "Peru", "Colombia", "Malaysia", "Papua New Guinea", "Cameroon", "Gabon", "Vietnam"];
  const statuses = ["Pending", "Active", "Completed"];
  const statusColors = {
    "Completed": "bg-green-100 text-green-800 border-green-200",
    "Active": "bg-blue-100 text-blue-800 border-blue-200",
    "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  // Document types and descriptions for each section
  const documentTypes = {
    a: [
      "Land Title Document",
      "Purchase Receipt",
      "Survey Plan",
      "Site Plan",
      "Ownership Certificate"
    ],
    b: [
      "Environmental Impact Assessment",
      "Environmental Approval",
      "EIA Report",
      "Environmental Compliance Certificate"
    ],
    c: [
      "Forest Management Plan",
      "Biodiversity Conservation Plan",
      "Species Inventory",
      "Harvesting Schedule",
      "Sustainable Management Certificate"
    ],
    d: [
      "Third Party Agreement",
      "Sublease Contract",
      "Community Agreement",
      "Land Use Agreement"
    ],
    e: [
      "Labor Rights Compliance",
      "Worker Safety Protocol",
      "Employment Contracts",
      "Workers Rights Documentation"
    ],
    f: [
      "Human Rights Due Diligence",
      "Community Impact Assessment",
      "Human Rights Policy"
    ],
    g: [
      "FPIC Agreement",
      "Indigenous Community Consent",
      "Community Consultation Report"
    ],
    h: [
      "Tax Compliance Certificate",
      "Customs Documentation",
      "Anti-corruption Policy",
      "Trade Compliance Documents"
    ]
  };

  const documentDescriptions = {
    a: [
      "Official land ownership title with boundaries",
      "Land purchase receipt and transaction details",
      "Survey plan with GPS coordinates",
      "Detailed site development plan",
      "Certificate of land ownership"
    ],
    b: [
      "Complete environmental impact assessment report",
      "Approval from environmental agency",
      "Environmental impact study findings",
      "Environmental compliance verification"
    ],
    c: [
      "5-year forest management plan",
      "Biodiversity conservation strategy",
      "Inventory of tree species with scientific names",
      "Timber harvesting schedule",
      "Sustainable forest management certification"
    ],
    d: [
      "Agreement with third-party land users",
      "Sublease contract terms and conditions",
      "Community land use agreement",
      "Partnership agreement documentation"
    ],
    e: [
      "Compliance with labor regulations",
      "Worker safety procedures and protocols",
      "Standard employment contracts",
      "Workers rights and benefits documentation"
    ],
    f: [
      "Human rights due diligence report",
      "Community impact assessment results",
      "Company human rights policy",
      "Stakeholder engagement records"
    ],
    g: [
      "Free, Prior and Informed Consent agreement",
      "Indigenous community consent documentation",
      "Community consultation meeting records",
      "FPIC process documentation"
    ],
    h: [
      "Annual tax compliance certificate",
      "Customs and trade documentation",
      "Company anti-corruption policy",
      "Trade regulation compliance documents"
    ]
  };

  // Company names for shipping to (importer/consignee)
  const importerNames = [
    "GreenWood International Ltd.",
    "Sustainable Timber Corp",
    "EcoForest Products Inc.",
    "Global Wood Solutions",
    "Nature's Harvest Co.",
    "Forest Partners Group",
    "Renewable Resources Ltd.",
    "EcoCommodities Trading"
  ];

  // Shipping lines
  const shippingLines = [
    "Maersk Line",
    "MSC (Mediterranean Shipping Company)",
    "CMA CGM",
    "COSCO Shipping",
    "Hapag-Lloyd",
    "ONE (Ocean Network Express)",
    "Evergreen Marine",
    "Yang Ming Marine Transport",
    "HMM (Hyundai Merchant Marine)",
    "ZIM Integrated Shipping Services"
  ];

  for (let i = 1; i <= 12; i++) {
    const forestCount = Math.floor(Math.random() * 3) + 1; // 1-3 forests per shipment
    const selectedForests = [];
    const selectedForestIds = new Set();

    while (selectedForests.length < forestCount) {
      const forestIndex = Math.floor(Math.random() * forestNames.length);
      if (!selectedForestIds.has(forestIndex)) {
        selectedForestIds.add(forestIndex);

        // Generate polygons/areas for this forest (each forest can have multiple plotted areas)
        const areaCount = Math.floor(Math.random() * 3) + 1; // 1-3 areas per forest
        const areas = [];
        
        for (let a = 0; a < areaCount; a++) {
          // Generate polygon coordinates for each area
          const polygonCoordinates = [];
          const vertices = Math.floor(Math.random() * 5) + 3; // 3-7 vertices for polygon
          
          for (let v = 0; v < vertices; v++) {
            polygonCoordinates.push({
              lat: -5 + (Math.random() * 10),
              lng: -60 + (Math.random() * 120)
            });
          }
          
          areas.push({
            id: `area-${a + 1}`,
            name: `Area ${a + 1}`,
            coordinates: polygonCoordinates,
            hectares: (Math.random() * 5000 + 1000).toFixed(0),
            description: `Plotted forest area ${a + 1} for sustainable harvesting`
          });
        }

        // Generate documents for this forest
        const forestDocuments = {};
        Object.keys(documentTypes).forEach(section => {
          const docCount = Math.floor(Math.random() * 3) + 1; // 1-3 documents per section
          const docs = [];

          for (let j = 0; j < docCount; j++) {
            const docTypeIndex = Math.floor(Math.random() * documentTypes[section].length);
            const descriptionIndex = Math.floor(Math.random() * documentDescriptions[section].length);

            docs.push({
              id: `${section}-${j + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: documentTypes[section][docTypeIndex],
              description: documentDescriptions[section][descriptionIndex],
              uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              section: section,
              fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
              format: "PDF",
              uploadedBy: ["Admin User", "Forest Manager", "Compliance Officer"][Math.floor(Math.random() * 3)]
            });
          }

          forestDocuments[section] = docs;
        });

        selectedForests.push({
          id: forestIndex + 1,
          name: forestNames[forestIndex],
          country: countries[forestIndex],
          coordinates: {
            lat: -5 + (Math.random() * 10),
            lng: -60 + (Math.random() * 120)
          },
          areas: areas, // Multiple plotted areas
          area: `${(Math.random() * 10 + 1).toFixed(1)}M hectares`,
          region: ["South America", "Central Africa", "Southeast Asia"][Math.floor(Math.random() * 3)],
          registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          documents: forestDocuments,
          complianceScore: Math.floor(Math.random() * 30) + 70 // 70-100%
        });
      }
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    // Calculate total documents
    const totalDocuments = selectedForests.reduce((sum, forest) => {
      return sum + Object.values(forest.documents).reduce((docSum, docs) => docSum + docs.length, 0);
    }, 0);

    // Calculate total weight (random between 10,000 and 100,000 kg)
    const totalKg = Math.floor(Math.random() * 90000) + 10000;
    // Calculate cost: $100 per 20,000kg
    const totalCost = Math.floor((totalKg / 20000) * 100);

    // Randomly select importer and ports
    const importerIndex = Math.floor(Math.random() * importerNames.length);
    const portOfShipmentIndex = Math.floor(Math.random() * portsList.length);
    const portOfDestinationIndex = Math.floor(Math.random() * portsList.length);

    shipments.push({
      id: `TRX-${String(1000000 + i).substring(1)}`,
      name: `Shipment #${i}`,
      date: date.toISOString().split('T')[0],
      status: status,
      statusColor: statusColors[status],
      totalForests: forestCount,
      forests: selectedForests,
      totalDocuments: totalDocuments,
      // Updated fields
      portOfShipment: portsList[portOfShipmentIndex],
      portOfDestination: portsList[portOfDestinationIndex],
      shippingLine: shippingLines[Math.floor(Math.random() * shippingLines.length)],
      exporterCompany: "American Timber Exports Inc.", // Always use this exporter
      importerConsignee: importerNames[importerIndex],
      totalKg: totalKg,
      totalCost: totalCost,
      costPerUnit: "$100 per 20,000kg",
      volume: `${(totalKg / 1000).toFixed(0)} tons`,
      createdBy: "Admin User",
      lastUpdated: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }

  return shipments.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Document Detail Modal Component
const DocumentDetailModal = ({ isOpen, onClose, shipment, selectedForest, selectedSection }) => {
  if (!isOpen || !shipment || !selectedForest) return null;

  const sectionTitles = {
    a: "(a) Land Use Rights",
    b: "(b) Environmental Protection",
    c: "(c) Forest-related Rules",
    d: "(d) Third Parties Rights",
    e: "(e) Labour Rights",
    f: "(f) Human Rights",
    g: "(g) FPIC (Free, Prior, Informed Consent)",
    h: "(h) Tax, Anti-corruption, Trade & Customs"
  };

  const forest = shipment.forests.find(f => f.id === selectedForest);
  const documents = selectedSection ? forest?.documents[selectedSection] || [] : [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trees className="text-green-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">{forest.name}</h2>
            </div>
            <p className="text-gray-600">
              {selectedSection ? sectionTitles[selectedSection] : "All Documents"} • {forest.country}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Shipment: {shipment.name} ({shipment.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedSection ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {sectionTitles[selectedSection]} Documents
              </h3>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <File className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doc.format}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>By: {doc.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash size={14} />
                        <span>{doc.fileSize}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <File size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No documents found for this section</p>
                </div>
              )}
            </div>
          ) : (
            // Show all documents grouped by section
            <div className="space-y-6">
              {Object.entries(sectionTitles).map(([sectionKey, sectionTitle]) => {
                const sectionDocs = forest?.documents[sectionKey] || [];
                if (sectionDocs.length === 0) return null;

                return (
                  <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-semibold text-gray-800">{sectionTitle}</h3>
                      <p className="text-sm text-gray-600 mt-1">{sectionDocs.length} documents</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {sectionDocs.map((doc) => (
                        <div key={doc.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <File className="text-gray-400 mt-1" size={16} />
                            <div>
                              <p className="font-medium text-gray-800">{doc.name}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                <span>{formatDate(doc.uploadedAt)}</span>
                                <span>•</span>
                                <span>{doc.uploadedBy}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {doc.format}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-600">
            Showing {documents.length} documents
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Shipment Detail Modal Component (Updated)
const ShipmentDetailModal = ({ isOpen, onClose, shipment }) => {
  const [selectedForest, setSelectedForest] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  if (!isOpen || !shipment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const sectionTitles = {
    a: "(a) Land Use Rights",
    b: "(b) Environmental Protection",
    c: "(c) Forest-related Rules",
    d: "(d) Third Parties Rights",
    e: "(e) Labour Rights",
    f: "(f) Human Rights",
    g: "(g) FPIC (Free, Prior, Informed Consent)",
    h: "(h) Tax, Anti-corruption, Trade & Customs"
  };

  const handleViewDocuments = (forestId, section = null) => {
    setSelectedForest(forestId);
    setSelectedSection(section);
    setShowDocumentModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">{shipment.name}</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${shipment.statusColor}`}>
                  {shipment.status}
                </span>
              </div>
              <p className="text-gray-600">ID: {shipment.id} • Created on {formatDate(shipment.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Shipment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={16} className="text-green-600" />
                    <p className="text-sm text-gray-600">Exporter</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.exporterCompany}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={16} className="text-blue-600" />
                    <p className="text-sm text-gray-600">Importer/Consignee</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.importerConsignee}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Ship size={16} className="text-purple-600" />
                    <p className="text-sm text-gray-600">Shipping Line</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.shippingLine}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-sm text-gray-600">Total Cost</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">${formatNumber(shipment.totalCost)}</p>
                  <p className="text-xs text-gray-500 mt-1">{shipment.costPerUnit}</p>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-gray-800 mb-3">Shipment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="font-semibold text-gray-800">{formatNumber(shipment.totalKg)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Volume</p>
                    <p className="font-semibold text-gray-800">{shipment.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Forests</p>
                    <p className="font-semibold text-gray-800">{shipment.totalForests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="font-semibold text-gray-800">{shipment.totalDocuments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipment Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${shipment.statusColor}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipment Date</p>
                    <p className="font-semibold text-gray-800">{formatDate(shipment.date)}</p>
                  </div>
                </div>
              </div>

              {/* Port Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Port of Shipment</h4>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-800">{shipment.portOfShipment}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-purple-600" />
                    <h4 className="font-semibold text-gray-800">Port of Destination</h4>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm font-medium text-purple-800">{shipment.portOfDestination}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={20} className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">Cost Breakdown</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <div className="flex items-center gap-2">
                      <Weight size={20} className="text-gray-400" />
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(shipment.totalKg)} kg</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-lg font-semibold text-gray-800">{shipment.costPerUnit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payment</p>
                    <div className="flex items-center gap-2">
                      <DollarSign size={24} className="text-green-600" />
                      <p className="text-2xl font-bold text-green-700">${formatNumber(shipment.totalCost)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forests Section */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trees size={20} />
                Included Forests ({shipment.forests.length})
              </h3>

              <div className="space-y-6">
                {shipment.forests.map((forest, index) => (
                  <motion.div
                    key={forest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Forest Header */}
                    <div className="bg-green-50 p-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">{forest.name}</h4>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {forest.country}, {forest.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe size={14} />
                              {forest.area}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Registered: {formatDate(forest.registrationDate)}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${forest.complianceScore >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {forest.complianceScore}% compliant
                        </span>
                      </div>
                    </div>

                    {/* Forest Areas */}
                    <div className="p-4 border-b">
                      <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Globe size={16} />
                        Plotted Forest Areas ({forest.areas.length})
                      </h5>
                      <div className="space-y-3">
                        {forest.areas.map((area, areaIndex) => (
                          <div key={area.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-800">{area.name}</p>
                                <p className="text-sm text-gray-600">{area.hectares} hectares</p>
                              </div>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                Polygon {areaIndex + 1}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                            <div className="text-xs text-gray-500">
                              <p className="font-medium mb-1">Coordinates:</p>
                              <div className="grid grid-cols-2 gap-1">
                                {area.coordinates.slice(0, 4).map((coord, coordIndex) => (
                                  <div key={coordIndex} className="flex items-center gap-1">
                                    <span className="text-gray-400">●</span>
                                    <span>Lat: {coord.lat.toFixed(4)}, Lng: {coord.lng.toFixed(4)}</span>
                                  </div>
                                ))}
                                {area.coordinates.length > 4 && (
                                  <div className="text-gray-400">
                                    +{area.coordinates.length - 4} more points
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents by Section */}
                    <div className="p-4">
                      <h5 className="font-medium text-gray-700 mb-3">Compliance Documents</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.entries(sectionTitles).map(([sectionKey, sectionTitle]) => {
                          const documents = forest.documents[sectionKey] || [];
                          const docCount = documents.length;

                          return (
                            <motion.button
                              key={sectionKey}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleViewDocuments(forest.id, sectionKey)}
                              className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} className="text-green-600" />
                                  <span className="font-medium text-gray-800 text-sm">{sectionTitle.split(') ')[1]}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${docCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {docCount}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {docCount > 0 ? `${docCount} document${docCount > 1 ? 's' : ''} uploaded` : 'No documents'}
                              </p>
                              {docCount > 0 && (
                                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                  <Eye size={12} />
                                  View documents
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* View All Documents Button */}
                      <div className="mt-4">
                        <button
                          onClick={() => handleViewDocuments(forest.id)}
                          className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
                        >
                          <Layers size={16} />
                          View All Documents ({Object.values(forest.documents).reduce((sum, docs) => sum + docs.length, 0)})
                          <ChevronRightIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50">
                <Download size={16} />
                Export All Documents
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <ExternalLink size={16} />
                Open in Compliance Portal
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setSelectedForest(null);
          setSelectedSection(null);
        }}
        shipment={shipment}
        selectedForest={selectedForest}
        selectedSection={selectedSection}
      />
    </>
  );
};

// Individual Shipment Card Component (Updated)
const ShipmentCard = ({ shipment, isExpanded, onToggle, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="text-green-600" size={16} />;
      case 'Active': return <Truck className="text-blue-600" size={16} />;
      case 'Pending': return <Clock className="text-yellow-600" size={16} />;
      default: return <Clock className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Shipment Header */}
      <div
        className={`p-4 ${isExpanded ? 'bg-gray-50' : 'bg-white'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-green-600" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800">{shipment.name}</h3>
                <p className="text-sm text-gray-500">ID: {shipment.id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">{formatDate(shipment.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">{shipment.portOfDestination}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={14} className="text-gray-400" />
                <span className="text-gray-600">${formatNumber(shipment.totalCost)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Weight size={14} className="text-gray-400" />
                <span className="text-gray-600">{formatNumber(shipment.totalKg)} kg</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${shipment.statusColor} flex items-center gap-1`}>
              {getStatusIcon(shipment.status)}
              {shipment.status}
            </span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
              >
                <Eye size={14} />
                Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details (Simplified) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Exporter</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.exporterCompany}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Importer/Consignee</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.importerConsignee}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Shipping Line</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.shippingLine}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Port of Shipment</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{shipment.portOfShipment}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: ${formatNumber(shipment.totalCost)} • {formatNumber(shipment.totalKg)} kg • {shipment.totalDocuments} documents
                </div>
                <button
                  onClick={onViewDetails}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Eye size={16} />
                  View Full Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Shipments Component
const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [expandedShipment, setExpandedShipment] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setShipments(generateMockShipments());
  }, []);

  const toggleShipment = (shipmentId) => {
    setExpandedShipment(expandedShipment === shipmentId ? null : shipmentId);
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setShowDetailModal(true);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.portOfDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.importerConsignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.exporterCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const statusOptions = [
    { value: 'all', label: 'All Status', count: shipments.length },
    { value: 'Completed', label: 'Completed', count: shipments.filter(s => s.status === 'Completed').length },
    { value: 'Active', label: 'Active', count: shipments.filter(s => s.status === 'Active').length },
    { value: 'Pending', label: 'Pending', count: shipments.filter(s => s.status === 'Pending').length }
  ];

  // Calculate totals
  const stats = {
    total: shipments.length,
    active: shipments.filter(s => s.status === 'Active').length,
    completed: shipments.filter(s => s.status === 'Completed').length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    totalForests: shipments.reduce((sum, s) => sum + s.totalForests, 0),
    totalDocuments: shipments.reduce((sum, s) => sum + s.totalDocuments, 0),
    totalKg: shipments.reduce((sum, s) => sum + s.totalKg, 0),
    totalCost: shipments.reduce((sum, s) => sum + s.totalCost, 0)
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6">Shipments Management</h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              {formatNumber(stats.totalKg)} kg total
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-yellow-600">
              Awaiting processing
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-blue-600">
              Currently in transit
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-800">${formatNumber(stats.totalCost)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              $100 per 20,000kg rate
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search shipments by ID, port, importer, or exporter..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${statusFilter === option.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${statusFilter === option.value
                    ? 'bg-white text-green-600'
                    : 'bg-gray-300 text-gray-700'
                    }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          {paginatedShipments.length > 0 ? (
            <>
              {paginatedShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  isExpanded={expandedShipment === shipment.id}
                  onToggle={() => toggleShipment(shipment.id)}
                  onViewDetails={() => handleViewDetails(shipment)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShipments.length)} of {filteredShipments.length} shipments
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg ${currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No shipments found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first shipment to get started'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Shipment Detail Modal */}
      <ShipmentDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedShipment(null);
        }}
        shipment={selectedShipment}
      />
    </>
  );
};

export default Shipments;
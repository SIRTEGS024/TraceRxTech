import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Map,
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";

// Document Detail Modal Component
const DocumentDetailModal = ({
  isOpen,
  onClose,
  shipment,
  selectedForest,
  selectedSection,
  demoData,
}) => {
  const [showAllCoordinates, setShowAllCoordinates] = useState(false);

  if (!isOpen || !shipment || !selectedForest) return null;

  const sectionTitles = {
    a: "(a) Land Use Rights",
    b: "(b) Environmental Protection",
    c: "(c) Forest-related Rules",
    d: "(d) Third Parties Rights",
    e: "(e) Labour Rights",
    f: "(f) Human Rights",
    g: "(g) FPIC (Free, Prior, Informed Consent)",
    h: "(h) Tax, Anti-corruption, Trade & Customs",
  };

  const sectionMapping = {
    a: "landUseRights",
    b: "environmentalProtection",
    c: "forestRelatedRules",
    d: "thirdPartiesRights",
    e: "labourRights",
    f: "humanRights",
    g: "fpic",
    h: "taxAntiCorruptionTradeCustoms",
  };

  // Get forest documents from exporter's facilities
  const getForestDocuments = () => {
    const exporter = demoData.users[shipment.exporterId];
    if (!exporter || !exporter.facilities) return [];

    const forest = exporter.facilities.find((f) => f.id === selectedForest);
    if (!forest || !forest.documents) return [];

    if (selectedSection) {
      const sectionKey = sectionMapping[selectedSection];
      return forest.documents[sectionKey] || [];
    }

    // Return all documents grouped by section
    return forest.documents;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get forest details
  const getForestDetails = () => {
    const exporter = demoData.users[shipment.exporterId];
    if (!exporter || !exporter.facilities) return null;

    return exporter.facilities.find((f) => f.id === selectedForest);
  };

  const forest = getForestDetails();
  const documents = getForestDocuments();

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
              <h2 className="text-xl font-semibold text-gray-800">
                {forest?.name || `Forest Plot - ${selectedForest}`}
              </h2>
            </div>
            <p className="text-gray-600">
              {selectedSection
                ? sectionTitles[selectedSection]
                : "All Documents"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Shipment: {shipment.batchNumber}
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
          {/* Forest Information */}
          {forest && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Trees size={16} className="text-green-600" />
                <h4 className="font-semibold text-gray-800">
                  Forest Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Forest Name</p>
                  <p className="font-medium text-gray-800">{forest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-800">{forest.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hectares</p>
                  <p className="font-medium text-gray-800">
                    {forest.totalHectares || "N/A"} ha
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-800">{forest.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Harvest Areas Coordinates - Now using shipment forest data */}
          {shipment.forests?.find((f) => f.forestId === selectedForest)
            ?.harvestAreas &&
            shipment.forests.find((f) => f.forestId === selectedForest)
              .harvestAreas.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Map size={16} />
                    Harvest Area Coordinates
                  </h4>
                  <button
                    onClick={() => setShowAllCoordinates(!showAllCoordinates)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {showAllCoordinates ? "Show Less" : "Show All Points"}
                  </button>
                </div>
                {shipment.forests
                  .find((f) => f.forestId === selectedForest)
                  .harvestAreas.map((area, areaIndex) => (
                    <div key={area.id || areaIndex} className="mb-4 last:mb-0">
                      <p className="font-medium text-gray-700 mb-2">
                        {area.name}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(showAllCoordinates
                          ? area.coordinates
                          : area.coordinates.slice(0, 4)
                        ).map((coord, coordIndex) => (
                          <div
                            key={coordIndex}
                            className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded border"
                          >
                            <span className="text-green-500">●</span>
                            <span>
                              Lat: {coord[0]?.toFixed(4) || "N/A"}, Lng:{" "}
                              {coord[1]?.toFixed(4) || "N/A"}
                            </span>
                          </div>
                        ))}
                        {!showAllCoordinates && area.coordinates.length > 4 && (
                          <div className="text-sm text-gray-500 italic">
                            +{area.coordinates.length - 4} more points...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

          {selectedSection ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {sectionTitles[selectedSection]} Documents
              </h3>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <motion.div
                    key={doc.name || index}
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
                          <h4 className="font-semibold text-gray-800">
                            {doc.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {doc.description ||
                              "Document for compliance verification"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {doc.format || "PDF"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>By: {doc.uploadedBy || "System Admin"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash size={14} />
                        <span>{doc.fileSize || "1.5 MB"}</span>
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
              {Object.entries(sectionTitles).map(
                ([sectionKey, sectionTitle]) => {
                  const sectionName = sectionMapping[sectionKey];
                  const sectionDocs = forest?.documents?.[sectionName] || [];
                  if (sectionDocs.length === 0) return null;

                  return (
                    <div
                      key={sectionKey}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 p-4 border-b">
                        <h3 className="font-semibold text-gray-800">
                          {sectionTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {sectionDocs.length} documents
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        {sectionDocs.map((doc, index) => (
                          <div
                            key={doc.name || index}
                            className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <File className="text-gray-400 mt-1" size={16} />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {doc.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {doc.description ||
                                    "Document for compliance verification"}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                  {doc.uploadedBy && (
                                    <>
                                      <span>Uploaded by: {doc.uploadedBy}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {doc.format || "PDF"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing{" "}
            {Array.isArray(documents)
              ? documents.length
              : Object.values(documents).flat().length}{" "}
            documents
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Shipment Detail Modal Component
const ShipmentDetailModal = ({ isOpen, onClose, shipment, demoData }) => {
  const [selectedForest, setSelectedForest] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAllCoordinates, setShowAllCoordinates] = useState({});

  if (!isOpen || !shipment) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  const sectionTitles = {
    a: "(a) Land Use Rights",
    b: "(b) Environmental Protection",
    c: "(c) Forest-related Rules",
    d: "(d) Third Parties Rights",
    e: "(e) Labour Rights",
    f: "(f) Human Rights",
    g: "(g) FPIC (Free, Prior, Informed Consent)",
    h: "(h) Tax, Anti-corruption, Trade & Customs",
  };

  const sectionMapping = {
    a: "landUseRights",
    b: "environmentalProtection",
    c: "forestRelatedRules",
    d: "thirdPartiesRights",
    e: "labourRights",
    f: "humanRights",
    g: "fpic",
    h: "taxAntiCorruptionTradeCustoms",
  };

  // Get exporter and importer details
  const exporter = demoData.users[shipment.exporterId];
  const importer = demoData.users[shipment.importerId];

  const handleViewDocuments = (forestId, section = null) => {
    setSelectedForest(forestId);
    setSelectedSection(section);
    setShowDocumentModal(true);
  };

  const toggleCoordinates = (forestId) => {
    setShowAllCoordinates((prev) => ({
      ...prev,
      [forestId]: !prev[forestId],
    }));
  };

  // Calculate total documents for a forest
  const calculateForestDocuments = (forestId) => {
    const exporter = demoData.users[shipment.exporterId];
    if (!exporter || !exporter.facilities) return 0;

    const forest = exporter.facilities.find((f) => f.id === forestId);
    if (!forest || !forest.documents) return 0;

    return Object.values(forest.documents).reduce(
      (total, docs) => total + docs.length,
      0,
    );
  };

  // Get forest details from exporter's facilities
  const getForestDetails = (forestId) => {
    const exporter = demoData.users[shipment.exporterId];
    if (!exporter || !exporter.facilities) return null;

    return exporter.facilities.find((f) => f.id === forestId);
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Shipment {shipment.batchNumber}
                </h2>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    shipment.status === "completed"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : shipment.status === "active"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {shipment.status?.charAt(0).toUpperCase() +
                    shipment.status?.slice(1) || "Pending"}
                </span>
              </div>
              <p className="text-gray-600">
                ID: {shipment.batchNumber} • Created on{" "}
                {formatDate(shipment.createdOn)}
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
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Shipment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={16} className="text-green-600" />
                    <p className="text-sm text-gray-600">Exporter</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {exporter?.basicInfo?.companyName || "Unknown Exporter"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={16} className="text-blue-600" />
                    <p className="text-sm text-gray-600">Importer/Consignee</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {importer?.basicInfo?.companyName ||
                      shipment.importerConsignee ||
                      "Unknown Importer"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Ship size={16} className="text-purple-600" />
                    <p className="text-sm text-gray-600">Shipping Line</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {shipment.shippingLine || "Not Specified"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-sm text-gray-600">Total Cost</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    ${formatNumber(shipment.totalShippingFee)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    $100 per container
                  </p>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Shipment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="font-semibold text-gray-800">
                      {formatNumber(shipment.totalKilograms)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Forests</p>
                    <p className="font-semibold text-gray-800">
                      {shipment.forests?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="font-semibold text-gray-800">
                      {shipment.forests?.reduce(
                        (total, forest) =>
                          total + calculateForestDocuments(forest.forestId),
                        0,
                      ) || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Hectares</p>
                    <p className="font-semibold text-gray-800">
                      {formatNumber(shipment.totalHectares)} ha
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipment Status</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        shipment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : shipment.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {shipment.status?.charAt(0).toUpperCase() +
                        shipment.status?.slice(1) || "Pending"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Production Date</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(shipment.productionDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Processing/Loading Date
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(shipment.processingLoadingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(shipment.createdOn)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Forest Quantity Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Weight size={20} className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">
                    Forest Quantity
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shipment.forests?.map((forest, index) => {
                    const forestDetails = getForestDetails(forest.forestId);
                    return (
                      <div
                        key={forest.forestId || index}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Trees size={16} className="text-green-600" />
                          <span className="font-medium text-gray-800">
                            {forestDetails?.name || `Forest ${index + 1}`}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-700">
                            {formatNumber(forest.quantity || 0)} kg
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity from this forest
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Port Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={18} className="text-blue-600" />
                    <h4 className="font-semibold text-gray-800">
                      Port of Shipment
                    </h4>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-800">
                      {shipment.portOfShipment}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-purple-600" />
                    <h4 className="font-semibold text-gray-800">
                      Port of Destination
                    </h4>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm font-medium text-purple-800">
                      {shipment.portOfDestination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={20} className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">
                    Cost Breakdown
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <div className="flex items-center gap-2">
                      <Weight size={20} className="text-gray-400" />
                      <p className="text-2xl font-bold text-gray-800">
                        {formatNumber(shipment.totalKilograms)} kg
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-lg font-semibold text-gray-800">
                      $100 per container
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payment</p>
                    <div className="flex items-center gap-2">
                      <DollarSign size={24} className="text-green-600" />
                      <p className="text-2xl font-bold text-green-700">
                        ${formatNumber(shipment.totalShippingFee)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forests Section */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trees size={20} />
                Included Forests ({shipment.forests?.length || 0})
              </h3>

              <div className="space-y-6">
                {shipment.forests?.map((forest, index) => {
                  const forestDetails = getForestDetails(forest.forestId);
                  const areaIndex = showAllCoordinates[forest.forestId];

                  return (
                    <motion.div
                      key={forest.forestId || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Forest Header */}
                      <div className="bg-green-50 p-4 border-b">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              {forestDetails?.name ||
                                `Forest Plot ${index + 1}`}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Globe size={14} />
                                {forest.harvestAreas?.[0]?.hectares ||
                                  "N/A"}{" "}
                                hectares
                              </span>
                              {forestDetails?.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {forestDetails.address}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Weight size={14} />
                                {formatNumber(forest.quantity || 0)} kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Forest Areas */}
                      {forest.harvestAreas &&
                        forest.harvestAreas.length > 0 && (
                          <div className="p-4 border-b">
                            <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Globe size={16} />
                              Harvest Areas ({forest.harvestAreas.length})
                            </h5>
                            <div className="space-y-3">
                              {forest.harvestAreas.map((area, areaIndex) => (
                                <div
                                  key={area.id || areaIndex}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {area.name ||
                                          `Harvest Area ${areaIndex + 1}`}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {area.hectares} hectares
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        toggleCoordinates(forest.forestId)
                                      }
                                      className="text-xs text-green-600 hover:text-green-700 bg-white px-2 py-1 rounded border border-green-200"
                                    >
                                      {showAllCoordinates[forest.forestId]
                                        ? "Hide Points"
                                        : "Show All Points"}
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <p className="font-medium mb-1">
                                      Coordinates:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                      {(showAllCoordinates[forest.forestId]
                                        ? area.coordinates
                                        : area.coordinates.slice(0, 4)
                                      ).map((coord, coordIndex) => (
                                        <div
                                          key={coordIndex}
                                          className="flex items-center gap-1"
                                        >
                                          <span className="text-green-500">
                                            ●
                                          </span>
                                          <span>
                                            Lat: {coord[0]?.toFixed(4) || "N/A"}
                                            , Lng:{" "}
                                            {coord[1]?.toFixed(4) || "N/A"}
                                          </span>
                                        </div>
                                      ))}
                                      {!showAllCoordinates[forest.forestId] &&
                                        area.coordinates.length > 4 && (
                                          <div className="text-gray-400">
                                            +{area.coordinates.length - 4} more
                                            points
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Selected Products */}
                      {forest.selectedProducts &&
                        forest.selectedProducts.length > 0 && (
                          <div className="p-4 border-b">
                            <h5 className="font-medium text-gray-700 mb-3">
                              Selected Products
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {forest.selectedProducts.map((product, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                  {product.name} ({product.code})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Documents by Section */}
                      <div className="p-4">
                        <h5 className="font-medium text-gray-700 mb-3">
                          Compliance Documents
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {Object.entries(sectionTitles).map(
                            ([sectionKey, sectionTitle]) => {
                              const sectionName = sectionMapping[sectionKey];
                              const documents =
                                forestDetails?.documents?.[sectionName] || [];
                              const docCount = documents.length;

                              return (
                                <motion.button
                                  key={sectionKey}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() =>
                                    handleViewDocuments(
                                      forest.forestId,
                                      sectionKey,
                                    )
                                  }
                                  className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <FileText
                                        size={16}
                                        className="text-green-600"
                                      />
                                      <span className="font-medium text-gray-800 text-sm">
                                        {sectionTitle.split(") ")[1]}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${docCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                    >
                                      {docCount}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {docCount > 0
                                      ? `${docCount} document${docCount > 1 ? "s" : ""} uploaded`
                                      : "No documents"}
                                  </p>
                                  {docCount > 0 && (
                                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                      <Eye size={12} />
                                      View documents
                                    </div>
                                  )}
                                </motion.button>
                              );
                            },
                          )}
                        </div>

                        {/* View All Documents Button */}
                        <div className="mt-4">
                          <button
                            onClick={() => handleViewDocuments(forest.forestId)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 w-full sm:w-auto"
                          >
                            <Layers size={16} />
                            View All Documents (
                            {calculateForestDocuments(forest.forestId)})
                            <ChevronRightIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              Close
            </button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 w-full sm:w-auto">
                <Download size={16} />
                Export All Documents
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto">
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
        demoData={demoData}
      />
    </>
  );
};

// Individual Shipment Card Component
const ShipmentCard = ({
  shipment,
  demoData,
  isExpanded,
  onToggle,
  onViewDetails,
  canViewDetails, // New prop to control if details can be viewed
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />;
      case "active":
        return <Truck className="text-blue-600" size={16} />;
      case "pending":
        return <Clock className="text-yellow-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get exporter and importer details
  const exporter = demoData.users[shipment.exporterId];
  const importer = demoData.users[shipment.importerId];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Shipment Header */}
      <div className={`p-4 ${isExpanded ? "bg-gray-50" : "bg-white"}`}>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-green-600" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800">
                  Shipment {shipment.batchNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {shipment.batchNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">
                  {formatDate(shipment.createdOn)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">
                  {shipment.portOfDestination}
                </span>
              </div>
              {/* Removed DollarSign and Weight from card view */}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(shipment.status)} flex items-center gap-1`}
            >
              {getStatusIcon(shipment.status)}
              {shipment.status?.charAt(0).toUpperCase() +
                shipment.status?.slice(1) || "Pending"}
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canViewDetails) {
                    onViewDetails();
                  } else {
                    toast.info("This shipment is not yet approved for viewing details");
                  }
                }}
                disabled={!canViewDetails}
                className={`flex items-center justify-center gap-1 px-3 py-1 text-sm border rounded-lg flex-1 sm:flex-none ${
                  canViewDetails
                    ? "text-green-600 border-green-300 hover:bg-green-50"
                    : "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                }`}
              >
                <Eye size={14} />
                Details
                {!canViewDetails && (
                  <span className="ml-1 text-xs">(Pending Approval)</span>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {isExpanded ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Exporter
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {exporter?.basicInfo?.companyName || "Unknown Exporter"}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Importer/Consignee
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {importer?.basicInfo?.companyName ||
                      shipment.importerConsignee ||
                      "Unknown Importer"}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Shipping Line
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {shipment.shippingLine || "Not Specified"}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Port of Shipment
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {shipment.portOfShipment}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  {/* Removed price and kg from expanded view summary */}
                  {shipment.totalHectares} ha total
                </div>
                <button
                  onClick={onViewDetails}
                  disabled={!canViewDetails}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto ${
                    canViewDetails
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Eye size={16} />
                  View Full Details
                  {!canViewDetails && " (Approval Required)"}
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
  const [expandedShipment, setExpandedShipment] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { user, demoData } = useUserStore();
  const [shipments, setShipments] = useState([]);
  const [shipmentApprovalStatus, setShipmentApprovalStatus] = useState({});

  useEffect(() => {
    if (!user || !demoData) {
      console.log("Shipments: No user or demoData");
      return;
    }

    console.log("========== SHIPMENTS LOADING ==========");
    console.log("Current user:", user);
    console.log("User role:", user.role);
    console.log("Demo data shipments:", demoData.shipments);
    
    let userShipments = [];
    let approvalMap = {};

    // Check if user is logged in as a company (agent scenario)
    if (user.loggedInAs?.companyId) {
      // Get the company data from demoData
      const company = demoData.users[user.loggedInAs.companyId];
      console.log(
        "Logged in as agent for company:",
        company?.basicInfo?.companyName,
      );

      if (company && company.shipments) {
        console.log("Company shipment IDs:", company.shipments);

        userShipments = company.shipments
          .map((shipmentId) => {
            const shipment = demoData.shipments?.[shipmentId];
            if (!shipment) {
              console.log(
                `WARNING: Shipment ${shipmentId} not found in demoData.shipments!`,
              );
            }
            return shipment;
          })
          .filter(Boolean);
      }
    } else if (user.role === "exporter") {
      // User is an exporter logged in directly
      if (user.shipments) {
        console.log("Exporter shipment IDs:", user.shipments);

        userShipments = user.shipments
          .map((shipmentId) => {
            const shipment = demoData.shipments?.[shipmentId];
            if (!shipment) {
              console.log(
                `WARNING: Shipment ${shipmentId} not found in demoData.shipments!`,
              );
            }
            return shipment;
          })
          .filter(Boolean);
      }
    } else if (user.role === "importer") {
      // User is an importer logged in directly
      if (user.shipmentId) {
        console.log("Importer shipment objects:", user.shipmentId);

        // For importers, shipments are stored as objects with id and status
        userShipments = user.shipmentId
          .map((shipmentObj) => {
            const shipment = demoData.shipments?.[shipmentObj.id];
            if (!shipment) {
              console.log(
                `WARNING: Shipment ${shipmentObj.id} not found in demoData.shipments!`,
              );
              return null;
            }
            // Store approval status for this shipment
            approvalMap[shipmentObj.id] = shipmentObj.status === "approved";
            return shipment;
          })
          .filter(Boolean);
      }
    }

    console.log("Found shipments:", userShipments.length);
    console.log("Approval map:", approvalMap);
    console.log("========== SHIPMENTS LOADING COMPLETE ==========");

    // Sort shipments by created date (newest first)
    userShipments.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
    setShipments(userShipments);
    setShipmentApprovalStatus(approvalMap);
  }, [user, demoData]);

  const toggleShipment = (shipmentId) => {
    setExpandedShipment(expandedShipment === shipmentId ? null : shipmentId);
  };

  const handleViewDetails = (shipment) => {
    // Check if user can view details
    if (user.role === "importer" && !user.loggedInAs) {
      // For importers directly logged in, check approval status
      const canView = shipmentApprovalStatus[shipment.id];
      if (!canView) {
        toast.error("This shipment is not yet approved for viewing details");
        return;
      }
    }
    setSelectedShipment(shipment);
    setShowDetailModal(true);
  };

  // Function to check if user can view shipment details
  const canViewShipmentDetails = (shipmentId) => {
    if (user.role === "importer" && !user.loggedInAs) {
      return shipmentApprovalStatus[shipmentId] || false;
    }
    // Exporters and agents can always view details
    return true;
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.importerConsignee
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.portOfDestination
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.shippingLine?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const statusOptions = [
    { value: "all", label: "All Status", count: shipments.length },
    {
      value: "completed",
      label: "Completed",
      count: shipments.filter((s) => s.status === "completed").length,
    },
    {
      value: "active",
      label: "Active",
      count: shipments.filter((s) => s.status === "active").length,
    },
    {
      value: "pending",
      label: "Pending",
      count: shipments.filter((s) => s.status === "pending").length,
    },
  ];

  // Calculate totals
  const stats = {
    total: shipments.length,
    active: shipments.filter((s) => s.status === "active").length,
    completed: shipments.filter((s) => s.status === "completed").length,
    pending: shipments.filter((s) => s.status === "pending").length,
    totalForests: shipments.reduce(
      (sum, s) => sum + (s.forests?.length || 0),
      0,
    ),
    totalDocuments: shipments.reduce((sum, shipment) => {
      const exporter = demoData.users[shipment.exporterId];
      if (!exporter || !exporter.facilities) return sum;

      return (
        sum +
          shipment.forests?.reduce((forestSum, forest) => {
            const forestDetails = exporter.facilities.find(
              (f) => f.id === forest.forestId,
            );
            if (!forestDetails || !forestDetails.documents) return forestSum;

            return (
              forestSum +
              Object.values(forestDetails.documents).reduce(
                (docSum, docs) => docSum + docs.length,
                0,
              )
            );
          }, 0) || 0
      );
    }, 0),
    totalKg: shipments.reduce((sum, s) => sum + (s.totalKilograms || 0), 0),
    totalCost: shipments.reduce((sum, s) => sum + (s.totalShippingFee || 0), 0),
  };

  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6">
          Shipments Management
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
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
                <p className="text-2xl font-bold text-gray-800">
                  {stats.active}
                </p>
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
                <p className="text-2xl font-bold text-gray-800">
                  ${formatNumber(stats.totalCost)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              $100 per container rate
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search shipments by batch number, port, or importer..."
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
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === option.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                      statusFilter === option.value
                        ? "bg-white text-green-600"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
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
                  demoData={demoData}
                  isExpanded={expandedShipment === shipment.id}
                  onToggle={() => toggleShipment(shipment.id)}
                  onViewDetails={() => handleViewDetails(shipment)}
                  canViewDetails={canViewShipmentDetails(shipment.id)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredShipments.length,
                    )}{" "}
                    of {filteredShipments.length} shipments
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-green-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No shipments found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first shipment to get started"}
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
        demoData={demoData}
      />
    </>
  );
};

export default Shipments;
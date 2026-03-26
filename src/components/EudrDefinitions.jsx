import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  CheckCircle,
  FileText,
  MapPin,
  Trees,
  AlertCircle,
  ChevronDown,
  Search,
  Layers,
  Edit,
  Trash2,
  Save,
  Info,
  Lock,
  Package,
  Tag,
  Maximize2,
  Eye,
  EyeOff,
  MessageSquare,
  ChevronRight,
  User,
} from "lucide-react";
import {
  GoogleMap,
  Autocomplete,
  Polygon,
  DrawingManager,
  Marker,
} from "@react-google-maps/api";
import { useUserStore } from "../store/useUserStore";

// ---------- Helper: Check if Google Maps is loaded ----------
const useGoogleMapsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };
    if (checkGoogleMaps()) return;
    const interval = setInterval(() => {
      if (checkGoogleMaps()) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return isLoaded;
};

// ---------- Static product list (pool of EUDR products) ----------
const companySelectedProducts = {
  Cattle: [
    { code: "0102 21 00", name: "Live bovine animals (breeding)" },
    { code: "0201", name: "Meat of bovine animals, fresh or chilled" },
    { code: "0202", name: "Meat of bovine animals, frozen" },
    { code: "4101", name: "Raw hides and skins of bovine animals" },
  ],
  Cocoa: [
    {
      code: "1801 00 00",
      name: "Cocoa beans, whole or broken, raw or roasted",
    },
    { code: "1804 00 00", name: "Cocoa butter, fat and oil" },
  ],
  Coffee: [
    { code: "ex 0901 11 00", name: "Coffee, not roasted, not decaffeinated" },
    { code: "ex 0901 21 00", name: "Roasted coffee, not decaffeinated" },
  ],
  "Oil palm": [
    { code: "1511", name: "Palm oil and its fractions" },
    { code: "1513 21", name: "Palm kernel oil, crude" },
  ],
  Rubber: [
    {
      code: "4001",
      name: "Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums",
    },
    { code: "4011", name: "New pneumatic tyres, of rubber" },
  ],
  Soya: [
    { code: "1201 90 00", name: "Soya beans, whether or not broken" },
    { code: "1507", name: "Soya-bean oil and its fractions" },
  ],
  Wood: [
    { code: "4401", name: "Fuel wood" },
    { code: "4402", name: "Wood charcoal" },
    { code: "4403", name: "Wood in the rough" },
    { code: "4407", name: "Wood sawn or chipped lengthwise" },
  ],
};

// ---------- Document categories mapping to facility document keys ----------
const documentCategories = [
  {
    id: "a",
    key: "landUseRights",
    title: "(a) Land Use Rights",
    description:
      "Purchase receipt, title documents, survey plan (with coordinates), site plan, fee, levies or charges agreements, location of forest, ownership type etc",
    required: true,
  },
  {
    id: "b",
    key: "environmentalProtection",
    title: "(b) Environmental Protection",
    description: "Environmental Impact Assessment or approval etc",
    required: true,
  },
  {
    id: "c",
    key: "forestRelatedRules",
    title: "(c) Forest-related rules",
    description:
      "Forest management and biodiversity conservation, where directly related to wood harvesting: Such as type of forest, Forest Management Plan, institution that prepared the Management plan and inventory etc of species used to produce the current shipment, for wood derivatives including wood charcoal: includes the names of species, their scientific and local names, description etc",
    required: true,
  },
  {
    id: "d",
    key: "thirdPartiesRights",
    title: "(d) Third Parties Rights",
    description: "Agreements, sublease etc",
    required: true,
  },
  {
    id: "e",
    key: "labourRights",
    title: "(e) Labour Rights",
    description: "Workers rights & safety, payment of workers etc",
    required: true,
  },
  {
    id: "f",
    key: "humanRights",
    title: "(f) Human Rights",
    description: "Human rights compliance under international law",
    required: true,
  },
  {
    id: "g",
    key: "fpic",
    title: "(g) The principle of free, prior and informed consent (FPIC)",
    description:
      "Including as set out in the UN Declaration on the Rights of Indigenous Peoples",
    required: true,
  },
  {
    id: "h",
    key: "taxAntiCorruptionTradeCustoms",
    title: "(h) Tax, Anti-corruption, Trade & Customs",
    description:
      "Tax, anti-corruption, trade and customs compliance documentation",
    required: true,
  },
];

// ---------- Helper functions ----------
const calculatePolygonArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;
  const earthRadius = 6378137;
  let area = 0;
  const coords = [...coordinates, coordinates[0]];
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area +=
      (((p2.lng - p1.lng) * Math.PI) / 180) *
      Math.cos(((p1.lat + p2.lat) * Math.PI) / 360) ** 2;
  }
  area = Math.abs((area * earthRadius ** 2) / 2);
  return parseFloat((area / 10000).toFixed(2));
};

const getPolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  let latSum = 0,
    lngSum = 0;
  coordinates.forEach((coord) => {
    latSum += coord.lat;
    lngSum += coord.lng;
  });
  return { lat: latSum / coordinates.length, lng: lngSum / coordinates.length };
};

const getLocationNameFromCoordinates = async (coordinates) => {
  if (!window.google || !coordinates || coordinates.length === 0) return null;
  try {
    const geocoder = new window.google.maps.Geocoder();
    const center = getPolygonCenter(coordinates);
    return new Promise((resolve) => {
      geocoder.geocode({ location: center }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Convert coordinates from array format [lat, lng] to object format { lat, lng }
const convertCoordinatesToObjects = (areas) => {
  return areas.map((area) => ({
    ...area,
    coordinates:
      area.coordinates?.map((coord) => {
        if (Array.isArray(coord)) {
          return { lat: coord[0], lng: coord[1] };
        }
        return coord; // already object
      }) || [],
  }));
};

// ---------- Modal Components (unchanged) ----------
const CoordinatesModal = ({ isOpen, onClose, coordinates }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Plot Coordinates Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-700">
                    All Coordinates ({coordinates.length} points)
                  </h4>
                </div>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {coordinates.length} points
                </span>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coordinates.map((coord, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-900">
                          Point {index + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Latitude:</span>
                          <span className="font-mono font-medium text-gray-900">
                            {coord.lat?.toFixed(6) ?? "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Longitude:</span>
                          <span className="font-mono font-medium text-gray-900">
                            {coord.lng?.toFixed(6) ?? "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const UploadModal = ({
  isOpen,
  onClose,
  categoryId,
  categoryTitle,
  onUpload,
  forestName,
}) => {
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) setDocumentName(file.name.split(".")[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && documentName.trim()) {
      onUpload({
        name: documentName.trim(),
        file: selectedFile,
        categoryId,
        uploadedAt: new Date(),
      });
      setDocumentName("");
      setSelectedFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Document for {categoryTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Forest:{" "}
                <span className="font-medium text-green-600">{forestName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter document name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-green-600" />
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to select a file
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !documentName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ---------- Product Selection Component (unchanged) ----------
const ProductSelection = ({
  selectedProducts = [],
  onProductsChange,
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const availableProductsByCommodity = Object.entries(
    companySelectedProducts,
  ).map(([commodity, products]) => ({
    commodity,
    products: products.map((product) => ({
      ...product,
      commodity,
      id: `${commodity}-${product.code}`,
    })),
  }));

  const filteredProductsByCommodity = availableProductsByCommodity
    .map(({ commodity, products }) => ({
      commodity,
      products: products.filter(
        (product) =>
          !selectedProducts.some((sp) => sp.code === product.code) &&
          (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            commodity.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    }))
    .filter(({ products }) => products.length > 0);

  const selectedProductsByCommodity = selectedProducts.reduce(
    (acc, product) => {
      if (!acc[product.commodity]) acc[product.commodity] = [];
      acc[product.commodity].push(product);
      return acc;
    },
    {},
  );

  const handleAddProduct = (product) => {
    onProductsChange([...selectedProducts, product]);
    setSearchQuery("");
  };

  const handleRemoveProduct = (productId) => {
    onProductsChange(selectedProducts.filter((p) => p.id !== productId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Select EUDR Products</h4>
        </div>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      <div className="relative" ref={dropdownRef}>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, code, or commodity..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-64">
              {filteredProductsByCommodity.length > 0 ? (
                filteredProductsByCommodity.map(({ commodity, products }) => (
                  <div
                    key={commodity}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {commodity}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({products.length} available)
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className="w-full flex items-start p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-medium text-gray-900 text-sm">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">
                                Code: {product.code}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery
                    ? `No products found matching "${searchQuery}"`
                    : "All available products have been selected"}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50">
              {searchQuery
                ? `Searching for "${searchQuery}"`
                : `Showing ${filteredProductsByCommodity.length} commodity groups`}
            </div>
          </motion.div>
        )}
      </div>
      {Object.keys(selectedProductsByCommodity).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(selectedProductsByCommodity).map(
            ([commodity, products]) => (
              <div
                key={commodity}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <h5 className="font-medium text-gray-800">{commodity}</h5>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {products.length} product{products.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-green-200 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Code: {product.code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        disabled={disabled}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Remove product"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No EUDR products selected for this forest
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Click "Add Product" to select EUDR-compliant products from this
            forest
          </p>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span> These are the EUDR products
          that your company has pre-selected. Only select products that are
          actually supported by this specific forest area.
        </p>
      </div>
    </div>
  );
};

// ---------- Plot Manager (unchanged) ----------
const PlotManager = ({
  plots = [],
  onPlotsChange,
  selectedPlotId,
  onPlotSelect,
  disabled = false,
}) => {
  const [newPlotName, setNewPlotName] = useState("");
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [showAllPlots, setShowAllPlots] = useState(true);
  const [coordinatesModal, setCoordinatesModal] = useState({
    isOpen: false,
    coordinates: [],
  });
  const [expandedPlots, setExpandedPlots] = useState(new Set());

  const handleAddPlot = () => {
    if (newPlotName.trim()) {
      const plotName = newPlotName.trim();
      const plotNumber = plots.length + 1;
      const defaultName = `Area ${plotNumber}`;
      const newPlot = {
        id: Date.now(),
        name: plotName || defaultName,
        coordinates: [],
        hectares: 0,
        locationName: "",
      };
      onPlotsChange([...plots, newPlot]);
      onPlotSelect(newPlot.id);
      setNewPlotName("");
    } else {
      const plotNumber = plots.length + 1;
      const newPlot = {
        id: Date.now(),
        name: `Area ${plotNumber}`,
        coordinates: [],
        hectares: 0,
        locationName: "",
      };
      onPlotsChange([...plots, newPlot]);
      onPlotSelect(newPlot.id);
    }
  };

  const handleRenamePlot = (plotId, newName) => {
    if (newName.trim()) {
      const updatedPlots = plots.map((plot) =>
        plot.id === plotId ? { ...plot, name: newName.trim() } : plot,
      );
      onPlotsChange(updatedPlots);
      setEditingPlotId(null);
    }
  };

  const handleDeletePlot = (plotId) => {
    const updatedPlots = plots.filter((plot) => plot.id !== plotId);
    onPlotsChange(updatedPlots);
    if (plotId === selectedPlotId)
      onPlotSelect(updatedPlots.length > 0 ? updatedPlots[0].id : null);
    if (expandedPlots.has(plotId)) {
      const newExpanded = new Set(expandedPlots);
      newExpanded.delete(plotId);
      setExpandedPlots(newExpanded);
    }
  };

  const togglePlotExpansion = (plotId, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPlots);
    newExpanded.has(plotId)
      ? newExpanded.delete(plotId)
      : newExpanded.add(plotId);
    setExpandedPlots(newExpanded);
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  const totalHectares = plots.reduce(
    (total, plot) => total + (plot.hectares || 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Plot Areas</h4>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {plots.length} plot{plots.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowAllPlots(!showAllPlots)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${showAllPlots ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {showAllPlots ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showAllPlots ? "Hide All" : "Show All"}
          </button>
          <button
            onClick={handleAddPlot}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
          >
            <Plus className="w-4 h-4" /> Add Plot Area
          </button>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-medium text-gray-700">
            Create New Plot Area
          </h5>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newPlotName}
            onChange={(e) => setNewPlotName(e.target.value)}
            placeholder="Enter plot name (e.g., Area 1, Northern Section)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={disabled}
            onKeyPress={(e) => e.key === "Enter" && handleAddPlot()}
          />
          <button
            onClick={handleAddPlot}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
          >
            Create
          </button>
        </div>
      </div>
      {plots.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plots.map((plot) => {
              const isExpanded = expandedPlots.has(plot.id);
              const displayLocationName = isExpanded
                ? plot.locationName
                : truncateText(plot.locationName, 25);
              return (
                <div
                  key={plot.id}
                  className={`bg-white rounded-lg border p-4 transition-all duration-200 ${showAllPlots ? "block" : "hidden"} ${selectedPlotId === plot.id ? "border-green-500 border-2 shadow-sm" : "border-gray-200 hover:border-green-300 hover:shadow-sm"}`}
                  onClick={() => onPlotSelect(plot.id)}
                >
                  <div className="flex items-start justify-between mb-3 min-h-[3rem]">
                    <div className="flex-1 min-w-0">
                      {editingPlotId === plot.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={plot.name}
                            onBlur={(e) =>
                              handleRenamePlot(plot.id, e.target.value)
                            }
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              handleRenamePlot(plot.id, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenamePlot(plot.id, plot.name)}
                            className="text-green-600 hover:text-green-800 shrink-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <h5
                              className={`font-medium truncate ${selectedPlotId === plot.id ? "text-green-700" : "text-gray-900"}`}
                            >
                              {plot.name}
                            </h5>
                            {selectedPlotId === plot.id && (
                              <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-1">
                                Selected
                              </span>
                            )}
                            {plot.locationName && (
                              <div className="mt-1">
                                <p className="text-xs text-gray-500 flex items-start">
                                  <MapPin className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
                                  <span
                                    className={`${isExpanded ? "" : "truncate"} break-words`}
                                  >
                                    {displayLocationName}
                                  </span>
                                  {plot.locationName &&
                                    plot.locationName.length > 25 && (
                                      <button
                                        onClick={(e) =>
                                          togglePlotExpansion(plot.id, e)
                                        }
                                        className="text-blue-600 hover:text-blue-800 text-xs ml-1 shrink-0"
                                      >
                                        {isExpanded ? "Show less" : "...more"}
                                      </button>
                                    )}
                                </p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlotId(plot.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
                            title="Rename plot"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlot(plot.id);
                      }}
                      className="text-red-500 hover:text-red-700 shrink-0 ml-2"
                      title="Delete plot"
                      disabled={disabled}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Coordinates:</span>
                      <span className="font-medium text-gray-900">
                        {plot.coordinates?.length || 0} points
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium text-green-700">
                        {plot.hectares?.toFixed(2) ?? "0.00"} hectares
                      </span>
                    </div>
                  </div>
                  {plot.coordinates?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Coordinates Preview:
                      </div>
                      <div className="text-xs font-mono text-gray-600 max-h-20 overflow-y-auto">
                        {plot.coordinates.slice(0, 3).map((coord, idx) => (
                          <div key={idx} className="truncate">
                            Point {idx + 1}: {coord.lat?.toFixed(5) ?? "?"},{" "}
                            {coord.lng?.toFixed(5) ?? "?"}
                          </div>
                        ))}
                        {plot.coordinates.length > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoordinatesModal({
                                isOpen: true,
                                coordinates: plot.coordinates,
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium"
                          >
                            View all {plot.coordinates.length} coordinates →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Total Forest Area
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {totalHectares.toFixed(2)} hectares
                </div>
                <div className="text-sm text-green-600">
                  across {plots.length} plot{plots.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CoordinatesModal
        isOpen={coordinatesModal.isOpen}
        onClose={() => setCoordinatesModal({ isOpen: false, coordinates: [] })}
        coordinates={coordinatesModal.coordinates}
      />
      {plots.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No plot areas defined yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Create plot areas to define different sections of your forest
          </p>
        </div>
      )}
    </div>
  );
};

// ---------- Enhanced Coordinate Input (unchanged) ----------
const EnhancedCoordinateInput = ({
  selectedPlot,
  onCoordinatesChange,
  disabled = false,
}) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    if (lat && lng && selectedPlot) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const currentCoords = selectedPlot.coordinates || [];
        if (editingIndex !== null) {
          const newCoords = [...currentCoords];
          newCoords[editingIndex] = { lat: latNum, lng: lngNum };
          onCoordinatesChange(newCoords);
          setEditingIndex(null);
        } else {
          onCoordinatesChange([...currentCoords, { lat: latNum, lng: lngNum }]);
        }
        setLat("");
        setLng("");
      }
    }
  };

  const handleEdit = (index) => {
    if (selectedPlot?.coordinates?.[index]) {
      setLat(selectedPlot.coordinates[index].lat.toString());
      setLng(selectedPlot.coordinates[index].lng.toString());
      setEditingIndex(index);
    }
  };

  const handleDelete = (index) => {
    if (selectedPlot?.coordinates) {
      const newCoords = selectedPlot.coordinates.filter((_, i) => i !== index);
      onCoordinatesChange(newCoords);
      if (editingIndex === index) {
        setEditingIndex(null);
        setLat("");
        setLng("");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setLat("");
    setLng("");
  };

  if (!selectedPlot) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Select a plot area to enter coordinates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-green-600" />
        <h4 className="font-medium text-gray-700">
          Coordinates for {selectedPlot.name}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            placeholder="e.g., -3.4653"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            placeholder="e.g., -62.2159"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleAdd}
          disabled={!lat || !lng || disabled}
          className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled || !lat || !lng ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {editingIndex !== null ? "Update Coordinate" : "Add Coordinate"}
        </button>
        {editingIndex !== null && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={disabled}
          >
            Cancel
          </button>
        )}
      </div>
      {selectedPlot.coordinates?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Plot Coordinates ({selectedPlot.coordinates.length} points)
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedPlot.coordinates.map((coord, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Point {index + 1}:
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      {coord.lat?.toFixed(5) ?? "?"},{" "}
                      {coord.lng?.toFixed(5) ?? "?"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="Edit"
                    disabled={disabled}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Delete"
                    disabled={disabled}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <strong>Note:</strong> A polygon requires at least 3 coordinates to
            form a closed shape. Add coordinates in order around the plot
            boundary.
          </p>
        </div>
      )}
    </div>
  );
};

// ---------- Enhanced Polygon Map Component (unchanged) ----------
const EnhancedPolygonMapComponent = ({
  plots = [],
  onPlotsChange,
  isLoaded,
  disabled = false,
  selectedPlotId,
  onPlotSelect,
}) => {
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [searchPlace, setSearchPlace] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [manualLocationName, setManualLocationName] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const locationInputRef = useRef(null);

  const plotColors = [
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#10b981",
    "#f97316",
  ];

  const onLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      mapRef.current = mapInstance;
      if (plots.length > 0 && plots[0].coordinates?.length > 0) {
        const firstPlot = plots[0];
        const centerPoint =
          getPolygonCenter(firstPlot.coordinates) || firstPlot.coordinates[0];
        setCenter(centerPoint);
        setZoom(12);
      }
    },
    [plots],
  );

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);
  const onDrawingManagerLoad = useCallback(
    (manager) => setDrawingManager(manager),
    [],
  );

  const onPolygonComplete = useCallback(
    async (polygon) => {
      if (disabled || !selectedPlotId) return;
      const paths = polygon.getPath();
      const coords = [];
      for (let i = 0; i < paths.getLength(); i++) {
        const point = paths.getAt(i);
        coords.push({ lat: point.lat(), lng: point.lng() });
      }
      const area = calculatePolygonArea(coords);
      let locationName =
        searchPlace?.name ||
        searchPlace?.formatted_address ||
        manualLocationName;
      if (!locationName && coords.length > 0)
        locationName = await getLocationNameFromCoordinates(coords);
      const updatedPlots = plots.map((plot) =>
        plot.id === selectedPlotId
          ? {
              ...plot,
              coordinates: coords,
              hectares: area,
              locationName:
                locationName || plot.locationName || "Unnamed Location",
            }
          : plot,
      );
      onPlotsChange(updatedPlots);
      polygon.setMap(null);
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      setManualLocationName("");
    },
    [
      drawingManager,
      selectedPlotId,
      plots,
      onPlotsChange,
      searchPlace,
      manualLocationName,
    ],
  );

  const startDrawing = () => {
    if (disabled || !selectedPlotId) {
      alert("Please select a plot area first");
      return;
    }
    if (drawingManager && mapRef.current) {
      drawingManager.setDrawingMode(
        window.google.maps.drawing.OverlayType.POLYGON,
      );
      setIsDrawing(true);
    }
  };

  const cancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
    }
  };

  const handleSearchPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        setSearchPlace(place);
        setManualLocationName(place.formatted_address);
        if (mapRef.current) {
          new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapRef.current,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3B82F6",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          });
          mapRef.current.panTo(place.geometry.location);
          mapRef.current.setZoom(15);
        }
        if (selectedPlotId) {
          const updatedPlots = plots.map((plot) =>
            plot.id === selectedPlotId
              ? { ...plot, locationName: place.formatted_address || place.name }
              : plot,
          );
          onPlotsChange(updatedPlots);
        }
      }
    }
  };

  const handleManualPlot = async () => {
    if (!selectedPlotId) {
      alert("Please select a plot area first");
      return;
    }
    const plot = plots.find((p) => p.id === selectedPlotId);
    if (!plot) return;
    if (plot.coordinates.length < 3) {
      alert("Please add at least 3 coordinates to plot");
      return;
    }
    const area = calculatePolygonArea(plot.coordinates);
    let locationName = plot.locationName || manualLocationName;
    if (!locationName && plot.coordinates.length >= 3)
      locationName = await getLocationNameFromCoordinates(plot.coordinates);
    const updatedPlots = plots.map((p) =>
      p.id === selectedPlotId
        ? {
            ...p,
            hectares: area,
            locationName: locationName || p.locationName || "Unnamed Location",
          }
        : p,
    );
    onPlotsChange(updatedPlots);
    setManualLocationName("");
  };

  const searchLocationByName = async (query) => {
    if (!query.trim() || !window.google) return;
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query }, (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setLocationSuggestions(predictions);
          setShowSuggestions(true);
        } else setLocationSuggestions([]);
      });
    } catch (error) {
      console.error("Location search error:", error);
    }
  };

  const handleLocationSuggestionSelect = async (placeId) => {
    if (!window.google || !mapRef.current) return;
    try {
      const service = new window.google.maps.places.PlacesService(
        mapRef.current,
      );
      service.getDetails({ placeId }, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          setSearchPlace(place);
          setManualLocationName(place.formatted_address);
          setShowSuggestions(false);
          if (selectedPlotId) {
            const updatedPlots = plots.map((plot) =>
              plot.id === selectedPlotId
                ? {
                    ...plot,
                    locationName: place.formatted_address || place.name,
                  }
                : plot,
            );
            onPlotsChange(updatedPlots);
          }
          if (place.geometry?.location) {
            mapRef.current.panTo(place.geometry.location);
            mapRef.current.setZoom(15);
          }
        }
      });
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  };

  const displayLocationName =
    searchPlace?.formatted_address ||
    manualLocationName ||
    (selectedPlotId &&
      plots.find((p) => p.id === selectedPlotId)?.locationName);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
          </div>
        </div>
        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-300">
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
          {selectedPlotId && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Editing: {plots.find((p) => p.id === selectedPlotId)?.name}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!isDrawing && selectedPlotId && (
            <button
              onClick={startDrawing}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
            >
              <Plus className="w-4 h-4" /> Draw Plot Boundary
            </button>
          )}
          {isDrawing && (
            <button
              onClick={cancelDrawing}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel Drawing
            </button>
          )}
          <button
            onClick={handleManualPlot}
            disabled={!selectedPlotId || disabled}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors ${!selectedPlotId || disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
          >
            <CheckCircle className="w-4 h-4" /> Plot from Coordinates
          </button>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-medium text-gray-700">
            Location Name (Optional)
          </h5>
        </div>
        <div className="relative">
          <input
            ref={locationInputRef}
            type="text"
            value={manualLocationName}
            onChange={(e) => {
              setManualLocationName(e.target.value);
              searchLocationByName(e.target.value);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter location name or address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={disabled}
          />
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() =>
                    handleLocationSuggestionSelect(suggestion.place_id)
                  }
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {suggestion.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter a location name or select from suggestions. This helps identify
          the plot area.
        </p>
      </div>
      <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: "satellite",
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            fullscreenControl: true,
            clickableIcons: false,
            gestureHandling: "greedy",
          }}
        >
          {!disabled && selectedPlotId && (
            <DrawingManager
              onLoad={onDrawingManagerLoad}
              onPolygonComplete={onPolygonComplete}
              drawingMode={
                isDrawing
                  ? window.google.maps.drawing.OverlayType.POLYGON
                  : null
              }
              options={{
                drawingControl: false,
                polygonOptions: {
                  fillColor: "#22c55e",
                  fillOpacity: 0.3,
                  strokeColor: "#16a34a",
                  strokeWeight: 2,
                  editable: false,
                  draggable: false,
                },
              }}
            />
          )}
          {plots.map((plot, index) => {
            if (!plot.coordinates || plot.coordinates.length < 3) return null;
            const color = plotColors[index % plotColors.length];
            const center = getPolygonCenter(plot.coordinates);
            const isSelected = plot.id === selectedPlotId;
            return (
              <div key={plot.id}>
                <Polygon
                  paths={plot.coordinates}
                  options={{
                    fillColor: color,
                    fillOpacity: isSelected ? 0.5 : 0.3,
                    strokeColor: isSelected ? "#000000" : color,
                    strokeWeight: isSelected ? 3 : 2,
                    clickable: true,
                  }}
                  onClick={() => onPlotSelect(plot.id)}
                />
                {center && (
                  <Marker
                    position={center}
                    label={{
                      text: plot.name,
                      color: isSelected ? "#000000" : "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    icon={{
                      path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                      fillColor: isSelected ? "#FFFFFF" : color,
                      fillOpacity: 1,
                      strokeColor: isSelected ? "#000000" : "#FFFFFF",
                      strokeWeight: 2,
                      scale: 1,
                      labelOrigin: new window.google.maps.Point(0, -30),
                    }}
                    onClick={() => onPlotSelect(plot.id)}
                  />
                )}
              </div>
            );
          })}
          {!disabled && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 sm:left-4 sm:transform-none z-10 w-[90%] sm:w-auto">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                  autocomplete.addListener(
                    "place_changed",
                    handleSearchPlaceChanged,
                  );
                }}
                options={{
                  fields: ["geometry", "name", "formatted_address"],
                  strictBounds: false,
                }}
              >
                <div className="flex items-center bg-white bg-opacity-90 rounded shadow-lg w-full">
                  <input
                    type="text"
                    placeholder="Search location..."
                    className="p-2 h-10 flex-1 sm:w-80 border-none rounded-l focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchPlaceChanged()
                    }
                  />
                  <button
                    type="button"
                    className="p-2 h-10 bg-green-500 text-white rounded-r hover:bg-green-600"
                    onClick={handleSearchPlaceChanged}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </Autocomplete>
            </div>
          )}
          {displayLocationName && (
            <div className="absolute top-16 sm:top-4 right-4 z-10 w-[90%] sm:w-auto">
              <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg max-w-xs sm:max-w-md">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 break-words truncate sm:whitespace-normal">
                      {displayLocationName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isDrawing && !disabled && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg w-[90%] sm:w-auto">
              <p className="text-sm text-gray-700 text-center">
                Click on the map to draw your plot boundary. Click the first
                point again to close the polygon.
              </p>
            </div>
          )}
          {disabled && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center mx-4">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Select a forest area first
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  You need to select a forest area before defining plot
                  boundaries
                </p>
              </div>
            </div>
          )}
        </GoogleMap>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-1">
              Instructions
            </h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select a plot area from the list above to edit it</li>
              <li>• Click "Draw Plot Boundary" to start drawing on the map</li>
              <li>
                • Alternatively, enter coordinates manually and click "Plot from
                Coordinates"
              </li>
              <li>
                • Each plot area will be displayed with a unique color and label
              </li>
              <li>
                • Search for locations or enter location name for better
                identification
              </li>
              {disabled && (
                <li className="text-amber-600 font-medium">
                  • Please select a forest area first to enable mapping features
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main EUDRDefinitions Component ----------
const EUDRDefinitions = () => {
  const isLoaded = useGoogleMapsLoaded();
  const { user, demoData, updateUser } = useUserStore();

  const isVerifier = user?.role === "verifier" && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;
  const currentCompany = isVerifier
    ? demoData.users[companyId]
    : user?.role === "exporter"
      ? user
      : null;

  // Get all forests (production/forest sites)
  const forests =
    currentCompany?.facilities?.filter(
      (f) => f.type === "production/forest site",
    ) || [];

  // ---------- Exporter state ----------
  const [selectedForest, setSelectedForest] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Forest data states (for exporter)
  const [plots, setPlots] = useState([]);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [supportedProducts, setSupportedProducts] = useState([]); // flat array
  const [documentsByCategory, setDocumentsByCategory] = useState({}); // { categoryKey: [documents] }

  // Upload modal
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    categoryId: "",
    categoryTitle: "",
  });

  // Dirty state for exporter
  const [initialPlots, setInitialPlots] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);
  const [initialDocuments, setInitialDocuments] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ---------- Verifier state (tab-level) ----------
  const [verificationStatus, setVerificationStatus] = useState(null); // 'compliant' | 'non-compliant'
  const [verificationNotes, setVerificationNotes] = useState([]);
  const [initialVerificationStatus, setInitialVerificationStatus] =
    useState(null);
  const [initialVerificationNotes, setInitialVerificationNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // State to control collapsed forests
  const [expandedForests, setExpandedForests] = useState(new Set());

  // ---------- Verification history for exporter/importer ----------
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // ---------- Load forest data when exporter selects a forest ----------
  useEffect(() => {
    if (selectedForest && !isVerifier) {
      const convertedAreas = convertCoordinatesToObjects(
        selectedForest.areas || [],
      );
      setPlots(convertedAreas);
      setInitialPlots(convertedAreas);

      const flatProducts = [];
      (selectedForest.supportedProducts || []).forEach((commodityGroup) => {
        commodityGroup.products.forEach((product) => {
          flatProducts.push({
            ...product,
            commodity: commodityGroup.commodity,
            id: `${commodityGroup.commodity}-${product.code}`,
          });
        });
      });
      setSupportedProducts(flatProducts);
      setInitialProducts(flatProducts);

      const docs = selectedForest.documents || {};
      setDocumentsByCategory(docs);
      setInitialDocuments(docs);

      if (convertedAreas.length > 0 && !selectedPlotId) {
        setSelectedPlotId(convertedAreas[0].id);
      }
    }
  }, [selectedForest, isVerifier]);

  // ---------- Load verifier's existing verification for this tab ----------
  useEffect(() => {
    if (isVerifier && currentCompany && user) {
      const reports = user.verificationReports || [];
      const report = reports.find((r) => r.companyId === currentCompany.id);
      if (report) {
        const artFindings = report.findings?.find(
          (f) => f.tab === "eudr-definitions",
        );
        if (artFindings) {
          setVerificationStatus(artFindings.status || null);
          setVerificationNotes(
            artFindings.articles?.find((a) => a.article === "article-2")
              ?.notes || [],
          );
          setInitialVerificationStatus(artFindings.status || null);
          setInitialVerificationNotes(
            artFindings.articles?.find((a) => a.article === "article-2")
              ?.notes || [],
          );
        }
      }
    }
  }, [isVerifier, currentCompany, user]);

  // ---------- Load verification history for exporter/importer ----------
  useEffect(() => {
    if (!isVerifier && currentCompany) {
      const linkedVerifiers = currentCompany.linkedVerifiers || [];
      const history = [];

      linkedVerifiers.forEach((verifierLink) => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier || !verifier.verificationReports) return;

        const report = verifier.verificationReports.find(
          (r) => r.companyId === currentCompany.id,
        );
        if (report) {
          const artFindings = report.findings?.find(
            (f) => f.tab === "eudr-definitions",
          );
          if (artFindings) {
            const notes =
              artFindings.articles?.find((a) => a.article === "article-2")
                ?.notes || [];
            if (notes.length > 0 || artFindings.status) {
              history.push({
                verifierName: verifier.basicInfo?.firstName
                  ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}`
                  : verifier.basicInfo?.email || verifier.id,
                status: artFindings.status,
                notes: notes,
                date: report.date,
              });
            }
          }
        }
      });

      setVerificationHistory(history);
    }
  }, [isVerifier, currentCompany, demoData]);

  // ---------- Dirty check for exporter ----------
  const hasExporterChanges = () => {
    return (
      JSON.stringify(plots) !== JSON.stringify(initialPlots) ||
      JSON.stringify(supportedProducts) !== JSON.stringify(initialProducts) ||
      JSON.stringify(documentsByCategory) !== JSON.stringify(initialDocuments)
    );
  };

  // ---------- Dirty check for verifier ----------
  const hasVerificationChanges = () => {
    return (
      verificationStatus !== initialVerificationStatus ||
      JSON.stringify(verificationNotes) !==
        JSON.stringify(initialVerificationNotes)
    );
  };

  // ---------- Handlers for exporter ----------
  const handleForestSelect = (forest) => {
    setSelectedForest(forest);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handlePlotsChange = (newPlots) => {
    setPlots(newPlots);
  };

  const handleProductsChange = (newProducts) => {
    setSupportedProducts(newProducts);
  };

  const handleDocumentUpload = (newDoc) => {
    if (!selectedForest) return;
    const categoryKey = documentCategories.find(
      (c) => c.id === newDoc.categoryId,
    )?.key;
    if (!categoryKey) return;
    const document = {
      ...newDoc,
      id: `${categoryKey}-${Date.now()}`,
      forestId: selectedForest.id,
      forestName: selectedForest.name,
    };
    setDocumentsByCategory((prev) => {
      const categoryDocs = prev[categoryKey] || [];
      return { ...prev, [categoryKey]: [...categoryDocs, document] };
    });
  };

  const removeDocument = (categoryKey, documentId) => {
    setDocumentsByCategory((prev) => {
      const categoryDocs = prev[categoryKey] || [];
      return {
        ...prev,
        [categoryKey]: categoryDocs.filter((doc) => doc.id !== documentId),
      };
    });
  };

  const flattenToGroupedProducts = (flatArray) => {
    const grouped = {};
    flatArray.forEach((product) => {
      if (!grouped[product.commodity]) {
        grouped[product.commodity] = {
          commodity: product.commodity,
          products: [],
        };
      }
      grouped[product.commodity].products.push({
        code: product.code,
        name: product.name,
      });
    });
    return Object.values(grouped);
  };

  const handleSaveAll = () => {
    if (!currentCompany || !selectedForest) return;
    setIsSaving(true);

    const updatedFacilities = currentCompany.facilities.map((facility) =>
      facility.id === selectedForest.id
        ? {
            ...facility,
            areas: plots,
            supportedProducts: flattenToGroupedProducts(supportedProducts),
            documents: documentsByCategory,
          }
        : facility,
    );

    const updatedCompany = { ...currentCompany, facilities: updatedFacilities };
    updateUser(currentCompany.id, updatedCompany);
    setSelectedForest(
      updatedFacilities.find((f) => f.id === selectedForest.id),
    );

    // Update initial states after save
    setInitialPlots(plots);
    setInitialProducts(supportedProducts);
    setInitialDocuments(documentsByCategory);

    setTimeout(() => {
      setIsSaving(false);
      alert("Changes saved successfully!");
    }, 500);
  };

  // ---------- Handlers for verifier ----------
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
    let reportIndex = reports.findIndex(
      (r) => r.companyId === currentCompany.id,
    );

    const artFindings = {
      tab: "eudr-definitions",
      status: verificationStatus || "non-compliant",
      articles: [
        {
          article: "article-2",
          notes: verificationNotes,
        },
      ],
    };

    if (reportIndex >= 0) {
      const report = reports[reportIndex];
      let findings = report.findings || [];
      const existingIdx = findings.findIndex(
        (f) => f.tab === "eudr-definitions",
      );
      if (existingIdx >= 0) {
        findings[existingIdx] = artFindings;
      } else {
        findings.push(artFindings);
      }
      reports[reportIndex] = { ...report, findings };
    } else {
      const newReport = {
        id: `ver-report-${Date.now()}`,
        companyId: currentCompany.id,
        companyType: currentCompany.role,
        date: new Date().toISOString().split("T")[0],
        type: "compliance audit",
        status: "pending",
        findings: [artFindings],
      };
      reports.push(newReport);
    }

    const updatedVerifier = {
      ...baseVerifier,
      verificationReports: reports,
      loggedInAs: user.loggedInAs,
    };
    updateUser(verifierId, updatedVerifier);

    setInitialVerificationStatus(verificationStatus);
    setInitialVerificationNotes(verificationNotes);
    alert("Verification saved successfully!");
  };

  const toggleForest = (forestId) => {
    const newExpanded = new Set(expandedForests);
    if (newExpanded.has(forestId)) {
      newExpanded.delete(forestId);
    } else {
      newExpanded.add(forestId);
    }
    setExpandedForests(newExpanded);
  };

  const filteredForests = forests.filter(
    (forest) =>
      forest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forest.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forest.region?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalHectares = plots.reduce(
    (total, plot) => total + (plot.hectares || 0),
    0,
  );
  const selectedPlot = plots.find((p) => p.id === selectedPlotId);

  if (!currentCompany) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading company data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 max-w-6xl mx-auto"
    >
      <div className="mb-6 sm:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-2">
            Article 2 (40) Compliance Documentation
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">
            {isVerifier
              ? "Review the company's forest compliance documentation under Article 2. Add notes and mark overall compliance."
              : "Upload documents demonstrating compliance with relevant legislation of the country of production."}
          </p>
        </div>
        {!isVerifier && verificationHistory.length > 0 && (
          <button
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">
              {verificationHistory.length} Verifier
              {verificationHistory.length > 1 ? "s" : ""} left notes
            </span>
          </button>
        )}
      </div>

      {/* Forest Selection (only for exporter) */}
      {!isVerifier && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trees className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Select Forest Area
            </h2>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <div className="flex items-center gap-3">
                {selectedForest ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        {selectedForest.name}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm ml-2">
                        ({selectedForest.country})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-gray-500 text-sm sm:text-base">
                      Select a forest area...
                    </span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search forests by name, country, or region..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-64">
                  {filteredForests.length > 0 ? (
                    filteredForests.map((forest) => {
                      const forestTotalHectares =
                        forest.areas?.reduce(
                          (t, p) => t + (p.hectares || 0),
                          0,
                        ) || 0;
                      const forestPlotCount = forest.areas?.length || 0;
                      const forestProductCount =
                        forest.supportedProducts?.reduce(
                          (sum, g) => sum + g.products.length,
                          0,
                        ) || 0;
                      return (
                        <button
                          key={forest.id}
                          onClick={() => handleForestSelect(forest)}
                          className={`w-full flex items-start p-4 hover:bg-gray-50 transition-colors ${selectedForest?.id === forest.id ? "bg-green-50" : ""}`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`w-3 h-3 rounded-full ${selectedForest?.id === forest.id ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {forest.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                              <span className="font-medium">
                                {forest.country}
                              </span>
                              <span className="mx-2">•</span>
                              <span>{forest.region}</span>
                              {forestTotalHectares > 0 && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="text-green-600 font-medium">
                                    {forestTotalHectares.toFixed(2)} hectares
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {forestPlotCount} plot
                              {forestPlotCount !== 1 ? "s" : ""} •{" "}
                              {forestProductCount} EUDR product
                              {forestProductCount !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No forests found matching "{searchQuery}"
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 text-sm text-gray-500 bg-gray-50">
                  Showing {filteredForests.length} of {forests.length} forests
                </div>
              </motion.div>
            )}
          </div>
          {selectedForest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 text-sm sm:text-base mb-2">
                    {selectedForest.name}
                    {totalHectares > 0 && (
                      <span className="ml-2 text-green-600">
                        • {totalHectares.toFixed(2)} hectares
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <div className="text-gray-600 mb-1">Total Area</div>
                      <div className="font-medium text-green-700">
                        {totalHectares > 0
                          ? `${totalHectares.toFixed(2)} hectares`
                          : "Not defined yet"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <div className="text-gray-600 mb-1">Plots</div>
                      <div className="font-medium text-green-700">
                        {plots.length} plot{plots.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <div className="text-gray-600 mb-1">Country & Region</div>
                      <div className="font-medium text-green-700">
                        {selectedForest.country} • {selectedForest.region}
                      </div>
                    </div>
                  </div>
                  {supportedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="text-gray-600 mb-1">
                        Current EUDR Products
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {supportedProducts.map((product, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {!selectedForest && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium text-amber-600">Important:</span>{" "}
                You must select a forest area before uploading compliance
                documents.
              </p>
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Lock className="w-4 h-4" />
                <span>
                  Document upload features are locked until a forest is selected
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exporter View */}
      {!isVerifier && selectedForest && (
        <>
          {/* Plot Management */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6 sm:mb-8">
            <PlotManager
              plots={plots}
              onPlotsChange={handlePlotsChange}
              selectedPlotId={selectedPlotId}
              onPlotSelect={setSelectedPlotId}
              disabled={false}
            />
          </div>

          {/* Plot Mapping */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Define Plot Boundaries
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showMap ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  {showMap ? "Show Coordinate Input" : "Show Map"}
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Define the exact boundaries of your forest plots using coordinates
              or by drawing on the map.
              {selectedPlotId && (
                <span className="text-green-600 font-medium ml-2">
                  Currently editing: {selectedPlot?.name}
                </span>
              )}
            </p>
            {showMap ? (
              <EnhancedPolygonMapComponent
                isLoaded={isLoaded}
                plots={plots}
                onPlotsChange={handlePlotsChange}
                disabled={false}
                selectedPlotId={selectedPlotId}
                onPlotSelect={setSelectedPlotId}
              />
            ) : (
              <div className="space-y-6">
                <EnhancedCoordinateInput
                  selectedPlot={selectedPlot}
                  onCoordinatesChange={(coords) =>
                    handlePlotsChange(
                      plots.map((p) =>
                        p.id === selectedPlotId
                          ? { ...p, coordinates: coords }
                          : p,
                      ),
                    )
                  }
                  disabled={false}
                />
              </div>
            )}
          </div>

          {/* EUDR Products Selection */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6 sm:mb-8">
            <ProductSelection
              selectedProducts={supportedProducts}
              onProductsChange={handleProductsChange}
              disabled={false}
            />
          </div>

          {/* Document Categories */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {documentCategories.map((category) => {
              const categoryDocs = documentsByCategory[category.key] || [];
              const completed = categoryDocs.length > 0;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            {category.title}
                          </h3>
                          {completed && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          {category.description}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setUploadModal({
                            isOpen: true,
                            categoryId: category.id,
                            categoryTitle: category.title,
                          })
                        }
                        disabled={!selectedForest}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!selectedForest ? "text-gray-500 bg-gray-100 cursor-not-allowed" : "text-white bg-green-600 hover:bg-green-700"}`}
                      >
                        <Plus className="w-4 h-4" />
                        Add Document
                      </button>
                    </div>
                    {categoryDocs.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {categoryDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {doc.name}
                              </span>
                              <button
                                onClick={() =>
                                  removeDocument(category.key, doc.id)
                                }
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 text-xs sm:text-sm">
                      {!selectedForest ? (
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          Select a forest area to upload documents
                        </span>
                      ) : completed ? (
                        <span className="text-green-600 font-medium">
                          ✓ Document uploaded for {selectedForest.name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          ⚠ Required: Upload at least one document for{" "}
                          {selectedForest.name}
                        </span>
                      )}
                      {categoryDocs.length > 0 && (
                        <span className="text-gray-500 ml-3">
                          {categoryDocs.length} document
                          {categoryDocs.length > 1 ? "s" : ""} uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Exporter Save Button */}
          <div className="mt-6 sm:mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  Save Your Changes
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Save all your updates for {selectedForest.name} including{" "}
                  {plots.length} plot{plots.length !== 1 ? "s" : ""} (
                  {totalHectares.toFixed(2)} hectares),{" "}
                  {supportedProducts.length} EUDR product
                  {supportedProducts.length !== 1 ? "s" : ""}, and{" "}
                  {Object.values(documentsByCategory).flat().length} document
                  {Object.values(documentsByCategory).flat().length !== 1
                    ? "s"
                    : ""}
                  .
                </p>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={!hasExporterChanges() || isSaving}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors ${!hasExporterChanges() || isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Updates
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Verifier View – show all forests in collapsible cards, with tab‑level verification */}
      {isVerifier && (
        <div className="space-y-6">
          {/* Tab‑level compliance status */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Article 2 Compliance
              </h2>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  verificationStatus === "compliant"
                    ? "bg-green-100 text-green-800"
                    : verificationStatus === "non-compliant"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {verificationStatus
                  ? verificationStatus.replace("-", " ")
                  : "Not set"}
              </span>
            </div>

            <div className="mb-4 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="compliant"
                  checked={verificationStatus === "compliant"}
                  onChange={() => setVerificationStatus("compliant")}
                  className="text-green-600"
                />
                <span>Compliant</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="non-compliant"
                  checked={verificationStatus === "non-compliant"}
                  onChange={() => setVerificationStatus("non-compliant")}
                  className="text-red-600"
                />
                <span>Non‑compliant</span>
              </label>
            </div>

            {verificationNotes.length > 0 && (
              <div className="mb-4 space-y-2">
                {verificationNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                  >
                    <MessageSquare size={18} className="text-gray-400 mt-0.5" />
                    <span className="flex-1 text-gray-700">{note}</span>
                    <button
                      onClick={() => handleRemoveNote(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

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

          {/* Forests list with collapsible cards */}
          <div className="space-y-4">
            {forests.map((forest) => {
              const forestPlots = convertCoordinatesToObjects(
                forest.areas || [],
              );
              const forestTotalHectares = forestPlots.reduce(
                (t, p) => t + (p.hectares || 0),
                0,
              );
              const forestProducts = [];
              (forest.supportedProducts || []).forEach((group) => {
                group.products.forEach((product) => {
                  forestProducts.push({
                    ...product,
                    commodity: group.commodity,
                  });
                });
              });
              const forestDocs = forest.documents || {};
              const isExpanded = expandedForests.has(forest.id);

              return (
                <div
                  key={forest.id}
                  className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden"
                >
                  {/* Forest header - click to expand/collapse */}
                  <button
                    onClick={() => toggleForest(forest.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trees className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800">
                          {forest.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {forest.country} • {forest.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-3 text-sm">
                        <span className="text-gray-600">
                          {forestPlots.length} plots
                        </span>
                        <span className="text-gray-600">
                          {forestProducts.length} products
                        </span>
                        <span className="text-gray-600">
                          {Object.values(forestDocs).flat().length} docs
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 sm:p-6 border-t border-green-100"
                    >
                      {/* Summary stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">
                            Total Area
                          </div>
                          <div className="text-xl font-bold text-green-700">
                            {forestTotalHectares.toFixed(2)} hectares
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {forestPlots.length} plot
                            {forestPlots.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">
                            EUDR Products
                          </div>
                          <div className="text-xl font-bold text-blue-700">
                            {forestProducts.length}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            selected products
                          </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">
                            Documents
                          </div>
                          <div className="text-xl font-bold text-amber-700">
                            {Object.values(forestDocs).flat().length}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            uploaded
                          </div>
                        </div>
                      </div>

                      {/* Plots (simplified list) */}
                      {forestPlots.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Plots
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {forestPlots.map((plot) => (
                              <div
                                key={plot.id}
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                              >
                                <div className="font-medium text-gray-800">
                                  {plot.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Area: {plot.hectares?.toFixed(2) || "0"} ha
                                </div>
                                <div className="text-xs text-gray-500">
                                  {plot.coordinates?.length || 0} coordinate
                                  points
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products */}
                      {forestProducts.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            EUDR Products
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {forestProducts.map((prod, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {prod.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents by category */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Compliance Documents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {documentCategories.map((cat) => {
                            const docs = forestDocs[cat.key] || [];
                            if (docs.length === 0) return null;
                            return (
                              <div
                                key={cat.id}
                                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                              >
                                <div className="font-medium text-gray-800 text-sm mb-2">
                                  {cat.title}
                                </div>
                                <div className="space-y-1">
                                  {docs.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center gap-2 text-xs text-green-700"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>{doc.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Verification Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveVerification}
              disabled={!hasVerificationChanges()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!hasVerificationChanges() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              <Save size={20} /> Save Verification
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal (exporter only) */}
      {uploadModal.isOpen && !isVerifier && (
        <UploadModal
          isOpen={uploadModal.isOpen}
          onClose={() =>
            setUploadModal({ isOpen: false, categoryId: "", categoryTitle: "" })
          }
          categoryId={uploadModal.categoryId}
          categoryTitle={uploadModal.categoryTitle}
          onUpload={handleDocumentUpload}
          forestName={selectedForest?.name}
        />
      )}

      {/* Verification History Modal */}
      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNotesModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-green-800">
                  Verification Notes
                </h2>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {verificationHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {item.verifierName}
                        </span>
                        {item.date && (
                          <span className="text-xs text-gray-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "compliant"
                            ? "bg-green-100 text-green-800"
                            : item.status === "non-compliant"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status ? item.status.replace("-", " ") : "Not set"}
                      </span>
                    </div>
                    {item.notes.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.notes.map((note, noteIdx) => (
                          <div
                            key={noteIdx}
                            className="text-sm text-gray-600 pl-6 border-l-2 border-green-200 ml-2"
                          >
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
};

export default EUDRDefinitions;
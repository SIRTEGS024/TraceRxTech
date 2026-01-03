import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  EyeOff
} from 'lucide-react';

// Google Maps imports - REMOVED useJsApiLoader
import { GoogleMap, Autocomplete, Polygon, DrawingManager, Marker } from '@react-google-maps/api';

// Custom hook to check if Google Maps is loaded
const useGoogleMapsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is available
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Initial check
    if (checkGoogleMaps()) return;

    // If not loaded, check periodically
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return isLoaded;
};

// Company's selected EUDR products (assumed to be pre-selected by the company)
const companySelectedProducts = {
  "Cattle": [
    { code: "0102 21 00", name: "Live bovine animals (breeding)" },
    { code: "0201", name: "Meat of bovine animals, fresh or chilled" },
    { code: "0202", name: "Meat of bovine animals, frozen" },
    { code: "4101", name: "Raw hides and skins of bovine animals" }
  ],
  "Cocoa": [
    { code: "1801 00 00", name: "Cocoa beans, whole or broken, raw or roasted" },
    { code: "1804 00 00", name: "Cocoa butter, fat and oil" }
  ],
  "Coffee": [
    { code: "ex 0901 11 00", name: "Coffee, not roasted, not decaffeinated" },
    { code: "ex 0901 21 00", name: "Roasted coffee, not decaffeinated" }
  ],
  "Oil palm": [
    { code: "1511", name: "Palm oil and its fractions" },
    { code: "1513 21", name: "Palm kernel oil, crude" }
  ],
  "Rubber": [
    { code: "4001", name: "Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums" },
    { code: "4011", name: "New pneumatic tyres, of rubber" }
  ],
  "Soya": [
    { code: "1201 90 00", name: "Soya beans, whether or not broken" },
    { code: "1507", name: "Soya-bean oil and its fractions" }
  ],
  "Wood": [
    { code: "4401", name: "Fuel wood" },
    { code: "4402", name: "Wood charcoal" },
    { code: "4403", name: "Wood in the rough" },
    { code: "4407", name: "Wood sawn or chipped lengthwise" }
  ]
};

// Mock forest data - will come from API (initial with no coordinates)
const mockForests = [
  {
    id: 1,
    name: "Amazon Rainforest - Brazil Sector",
    area: "", // Will be calculated from plots
    country: "Brazil",
    region: "South America",
    supportedProducts: [],
    totalHectares: 0, // Will be calculated from plots
    plots: [] // Array of plot areas
  },
  {
    id: 2,
    name: "Congo Basin Forest",
    area: "",
    country: "Democratic Republic of Congo",
    region: "Central Africa",
    supportedProducts: [],
    totalHectares: 0,
    plots: []
  },
  {
    id: 3,
    name: "Borneo Rainforest",
    area: "",
    country: "Indonesia",
    region: "Southeast Asia",
    supportedProducts: [],
    totalHectares: 0,
    plots: []
  },
  {
    id: 4,
    name: "Temperate Forest - European Union",
    area: "",
    country: "Austria/Germany",
    region: "Europe",
    supportedProducts: [],
    totalHectares: 0,
    plots: []
  },
  {
    id: 5,
    name: "Tongass National Forest",
    area: "",
    country: "United States",
    region: "North America",
    supportedProducts: [],
    totalHectares: 0,
    plots: []
  },
  {
    id: 6,
    name: "Daintree Rainforest",
    area: "",
    country: "Australia",
    region: "Oceania",
    supportedProducts: [],
    totalHectares: 0,
    plots: []
  }
];

// Document categories as specified
const documentCategories = [
  {
    id: 'a',
    title: '(a) Land Use Rights',
    description: 'Purchase receipt, title documents, survey plan (with coordinates), site plan, fee, levies or charges agreements, location of forest, ownership type etc',
    required: true
  },
  {
    id: 'b',
    title: '(b) Environmental Protection',
    description: 'Environmental Impact Assessment or approval etc',
    required: true
  },
  {
    id: 'c',
    title: '(c) Forest-related rules',
    description: 'Forest management and biodiversity conservation, where directly related to wood harvesting: Such as type of forest, Forest Management Plan, institution that prepared the Management plan and inventory etc of species used to produce the current shipment, for wood derivatives including wood charcoal: includes the names of species, their scientific and local names, description etc',
    required: true
  },
  {
    id: 'd',
    title: '(d) Third Parties Rights',
    description: 'Agreements, sublease etc',
    required: true
  },
  {
    id: 'e',
    title: '(e) Labour Rights',
    description: 'Workers rights & safety, payment of workers etc',
    required: true
  },
  {
    id: 'f',
    title: '(f) Human Rights',
    description: 'Human rights compliance under international law',
    required: true
  },
  {
    id: 'g',
    title: '(g) The principle of free, prior and informed consent (FPIC)',
    description: 'Including as set out in the UN Declaration on the Rights of Indigenous Peoples',
    required: true
  },
  {
    id: 'h',
    title: '(h) Tax, Anti-corruption, Trade & Customs',
    description: 'Tax, anti-corruption, trade and customs compliance documentation',
    required: true
  }
];

// Helper function to calculate area of polygon in hectares
const calculatePolygonArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;
  
  const earthRadius = 6378137; // Earth's radius in meters
  
  let area = 0;
  const coords = [...coordinates, coordinates[0]]; // Close the polygon
  
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    
    area += (p2.lng - p1.lng) * Math.PI / 180 * 
            Math.cos((p1.lat + p2.lat) * Math.PI / 360) ** 2;
  }
  
  area = Math.abs(area * earthRadius ** 2 / 2);
  return parseFloat((area / 10000).toFixed(2)); // Convert to hectares
};

// Helper function to get center of polygon for label placement
const getPolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  
  let latSum = 0;
  let lngSum = 0;
  
  coordinates.forEach(coord => {
    latSum += coord.lat;
    lngSum += coord.lng;
  });
  
  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length
  };
};

// Helper function to get location name from coordinates
const getLocationNameFromCoordinates = async (coordinates) => {
  if (!window.google || !coordinates || coordinates.length === 0) return null;
  
  try {
    const geocoder = new window.google.maps.Geocoder();
    const center = getPolygonCenter(coordinates);
    
    return new Promise((resolve) => {
      geocoder.geocode({ location: center }, (results, status) => {
        if (status === 'OK' && results[0]) {
          // Get the locality, administrative area, or country
          const locationName = results[0].formatted_address || 
                               results[0].address_components[0]?.long_name || 
                               'Unknown Location';
          resolve(locationName);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Coordinates Modal Component
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
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                            {coord.lat.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Longitude:</span>
                          <span className="font-mono font-medium text-gray-900">
                            {coord.lng.toFixed(6)}
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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

// Upload Modal Component
const UploadModal = ({ isOpen, onClose, categoryId, categoryTitle, onUpload, forestName }) => {
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile && documentName.trim()) {
      onUpload({
        name: documentName.trim(),
        file: selectedFile,
        categoryId,
        uploadedAt: new Date()
      });
      setDocumentName('');
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
                Forest: <span className="font-medium text-green-600">{forestName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
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

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !documentName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

// UPDATED Product Selection Component with better grouping
const ProductSelection = ({ selectedProducts = [], onProductsChange, disabled = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Get all available products from company selection, grouped by commodity
  const availableProductsByCommodity = Object.entries(companySelectedProducts).map(([commodity, products]) => ({
    commodity,
    products: products.map(product => ({
      ...product,
      commodity,
      id: `${commodity}-${product.code}`
    }))
  }));

  // Filter products based on search query
  const filteredProductsByCommodity = availableProductsByCommodity
    .map(({ commodity, products }) => ({
      commodity,
      products: products.filter(product =>
        !selectedProducts.some(sp => sp.code === product.code) &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          commodity.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(({ products }) => products.length > 0);

  // Group selected products by commodity
  const selectedProductsByCommodity = selectedProducts.reduce((acc, product) => {
    if (!acc[product.commodity]) {
      acc[product.commodity] = [];
    }
    acc[product.commodity].push(product);
    return acc;
  }, {});

  const handleAddProduct = (product) => {
    onProductsChange([...selectedProducts, product]);
    setSearchQuery('');
  };

  const handleRemoveProduct = (productId) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Select EUDR Products</h4>
        </div>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Product Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, code, or commodity..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Products List - Grouped by Commodity */}
            <div className="overflow-y-auto max-h-64">
              {filteredProductsByCommodity.length > 0 ? (
                filteredProductsByCommodity.map(({ commodity, products }) => (
                  <div key={commodity} className="border-b border-gray-100 last:border-b-0">
                    <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">{commodity}</span>
                        <span className="text-xs text-gray-500">({products.length} available)</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {products.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className="w-full flex items-start p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                          </div>
                          <div className="ml-3 text-left">
                            <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Code: {product.code}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? `No products found matching "${searchQuery}"` : 'All available products have been selected'}
                </div>
              )}
            </div>

            {/* Info Footer */}
            <div className="p-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50">
              {searchQuery ? (
                `Searching for "${searchQuery}"`
              ) : (
                `Showing ${filteredProductsByCommodity.length} commodity groups`
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Products Display - Grouped by Commodity */}
      {Object.keys(selectedProductsByCommodity).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(selectedProductsByCommodity).map(([commodity, products]) => (
            <div key={commodity} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-blue-600" />
                <h5 className="font-medium text-gray-800">{commodity}</h5>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {products.length} product{products.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-green-200 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Code: {product.code}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove product"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No EUDR products selected for this forest</p>
          <p className="text-sm text-gray-500 mt-1">
            Click "Add Product" to select EUDR-compliant products from this forest
          </p>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span> These are the EUDR products that your company has pre-selected.
          Only select products that are actually supported by this specific forest area.
        </p>
      </div>
    </div>
  );
};

// UPDATED Plot Management Component with improved area switching
const PlotManager = ({ plots = [], onPlotsChange, selectedPlotId, onPlotSelect, disabled = false }) => {
  const [newPlotName, setNewPlotName] = useState('');
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [showAllPlots, setShowAllPlots] = useState(true);
  const [coordinatesModal, setCoordinatesModal] = useState({
    isOpen: false,
    coordinates: []
  });

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
        locationName: ''
      };
      
      onPlotsChange([...plots, newPlot]);
      // Automatically select the newly created plot
      onPlotSelect(newPlot.id);
      setNewPlotName('');
    } else {
      // If no name provided, still create a plot with default name
      const plotNumber = plots.length + 1;
      const newPlot = {
        id: Date.now(),
        name: `Area ${plotNumber}`,
        coordinates: [],
        hectares: 0,
        locationName: ''
      };
      
      onPlotsChange([...plots, newPlot]);
      // Automatically select the newly created plot
      onPlotSelect(newPlot.id);
    }
  };

  const handleRenamePlot = (plotId, newName) => {
    if (newName.trim()) {
      const updatedPlots = plots.map(plot => 
        plot.id === plotId ? { ...plot, name: newName.trim() } : plot
      );
      onPlotsChange(updatedPlots);
      setEditingPlotId(null);
    }
  };

  const handleDeletePlot = (plotId) => {
    const updatedPlots = plots.filter(plot => plot.id !== plotId);
    onPlotsChange(updatedPlots);
    
    // If we deleted the selected plot, select another one if available
    if (plotId === selectedPlotId) {
      if (updatedPlots.length > 0) {
        onPlotSelect(updatedPlots[0].id);
      } else {
        onPlotSelect(null);
      }
    }
  };

  const handleSelectPlot = (plotId) => {
    onPlotSelect(plotId);
  };

  const totalHectares = plots.reduce((total, plot) => total + (plot.hectares || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Plot Areas</h4>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {plots.length} plot{plots.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllPlots(!showAllPlots)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showAllPlots 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showAllPlots ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAllPlots ? 'Hide All' : 'Show All'}
          </button>
          <button
            onClick={handleAddPlot}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-4 h-4" />
            Add Plot Area
          </button>
        </div>
      </div>

      {/* Add new plot input */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-medium text-gray-700">Create New Plot Area</h5>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlotName}
            onChange={(e) => setNewPlotName(e.target.value)}
            placeholder="Enter plot name (e.g., Area 1, Northern Section)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
            disabled={disabled}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlot()}
          />
          <button
            onClick={handleAddPlot}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Create
          </button>
        </div>
      </div>

      {/* Plots list */}
      {plots.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plots.map(plot => (
              <div
                key={plot.id}
                className={`bg-white rounded-lg border p-4 ${showAllPlots ? 'block' : 'hidden'} ${
                  selectedPlotId === plot.id ? 'border-green-500 border-2' : 'border-gray-200'
                }`}
                onClick={() => handleSelectPlot(plot.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {editingPlotId === plot.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={plot.name}
                          onBlur={(e) => handleRenamePlot(plot.id, e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRenamePlot(plot.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenamePlot(plot.id, plot.name)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h5 className={`font-medium ${selectedPlotId === plot.id ? 'text-green-700' : 'text-gray-900'}`}>
                          {plot.name}
                          {selectedPlotId === plot.id && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlotId(plot.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Rename plot"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {plot.locationName && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{plot.locationName}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlot(plot.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
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
                      {plot.hectares?.toFixed(2) || 0} hectares
                    </span>
                  </div>
                </div>

                {plot.coordinates?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Coordinates Preview:</div>
                    <div className="text-xs font-mono text-gray-600 max-h-20 overflow-y-auto">
                      {plot.coordinates.slice(0, 3).map((coord, idx) => (
                        <div key={idx}>
                          Point {idx + 1}: {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                        </div>
                      ))}
                      {plot.coordinates.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoordinatesModal({
                              isOpen: true,
                              coordinates: plot.coordinates
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
            ))}
          </div>

          {/* Total area summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Total Forest Area</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {totalHectares.toFixed(2)} hectares
                </div>
                <div className="text-sm text-green-600">
                  across {plots.length} plot{plots.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coordinates Modal */}
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

// Enhanced Coordinate Input Component
const EnhancedCoordinateInput = ({ 
  selectedPlot, 
  onCoordinatesChange, 
  disabled = false 
}) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    if (lat && lng && selectedPlot) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const currentCoords = selectedPlot.coordinates || [];
        
        if (editingIndex !== null) {
          // Update existing coordinate
          const newCoords = [...currentCoords];
          newCoords[editingIndex] = { lat: latNum, lng: lngNum };
          onCoordinatesChange(newCoords);
          setEditingIndex(null);
        } else {
          // Add new coordinate
          onCoordinatesChange([...currentCoords, { lat: latNum, lng: lngNum }]);
        }
        setLat('');
        setLng('');
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
        setLat('');
        setLng('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setLat('');
    setLng('');
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
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="e.g., -62.2159"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!lat || !lng || disabled}
          className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled || !lat || !lng ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {editingIndex !== null ? 'Update Coordinate' : 'Add Coordinate'}
        </button>
        {editingIndex !== null && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                      {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
                    disabled={disabled}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <strong>Note:</strong> A polygon requires at least 3 coordinates to form a closed shape.
            Add coordinates in order around the plot boundary.
          </p>
        </div>
      )}
    </div>
  );
};

// Enhanced Map Component with Multiple Polygons - UPDATED
const EnhancedPolygonMapComponent = ({ 
  plots = [], 
  onPlotsChange, 
  isLoaded, 
  disabled = false,
  selectedPlotId,
  onPlotSelect 
}) => {
  // ADD THIS LOADING CHECK AT THE BEGINNING OF THE COMPONENT
  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
          </div>
        </div>
        <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-300">
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

  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [searchPlace, setSearchPlace] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [manualLocationName, setManualLocationName] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const locationInputRef = useRef(null);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    
    // Set initial view based on existing plots
    if (plots.length > 0 && plots[0].coordinates?.length > 0) {
      const firstPlot = plots[0];
      const centerPoint = getPolygonCenter(firstPlot.coordinates) || firstPlot.coordinates[0];
      setCenter(centerPoint);
      setZoom(12);
    }
  }, [plots]);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  const onDrawingManagerLoad = useCallback((manager) => {
    setDrawingManager(manager);
  }, []);

  const onPolygonComplete = useCallback(async (polygon) => {
    if (disabled || !selectedPlotId) return;

    const paths = polygon.getPath();
    const coords = [];

    for (let i = 0; i < paths.getLength(); i++) {
      const point = paths.getAt(i);
      coords.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }

    // Calculate area in hectares
    const area = calculatePolygonArea(coords);
    
    // Get location name from search or geocoding
    let locationName = searchPlace?.name || searchPlace?.formatted_address || manualLocationName;
    
    // If no search place or manual name, try to geocode the coordinates
    if (!locationName && coords.length > 0) {
      locationName = await getLocationNameFromCoordinates(coords);
    }

    // Update the selected plot with coordinates and area
    const updatedPlots = plots.map(plot => {
      if (plot.id === selectedPlotId) {
        return {
          ...plot,
          coordinates: coords,
          hectares: area,
          locationName: locationName || plot.locationName || 'Unnamed Location'
        };
      }
      return plot;
    });

    onPlotsChange(updatedPlots);
    polygon.setMap(null);
    drawingManager.setDrawingMode(null);
    setIsDrawing(false);
    setManualLocationName('');
  }, [drawingManager, selectedPlotId, plots, onPlotsChange, searchPlace, manualLocationName]);

  // Function to search for location by name
  const searchLocationByName = async (query) => {
    if (!query.trim() || !window.google) return;
    
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setLocationSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setLocationSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  // Handle location suggestion selection
  const handleLocationSuggestionSelect = async (placeId) => {
    if (!window.google || !mapRef.current) return;
    
    try {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails({ placeId }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          setSearchPlace(place);
          setManualLocationName(place.formatted_address);
          setShowSuggestions(false);
          
          // Update the selected plot with location name
          if (selectedPlotId) {
            const updatedPlots = plots.map(plot => {
              if (plot.id === selectedPlotId) {
                return {
                  ...plot,
                  locationName: place.formatted_address || place.name
                };
              }
              return plot;
            });
            onPlotsChange(updatedPlots);
          }
          
          // Center map on the location
          if (place.geometry?.location) {
            mapRef.current.panTo(place.geometry.location);
            mapRef.current.setZoom(15);
          }
        }
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const startDrawing = () => {
    if (disabled || !selectedPlotId) {
      alert('Please select a plot area first');
      return;
    }
    
    if (drawingManager && mapRef.current) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
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
        
        // Add marker for searched location
        if (mapRef.current) {
          new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapRef.current,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }
          });
          
          mapRef.current.panTo(place.geometry.location);
          mapRef.current.setZoom(15);
        }

        // Update the selected plot with location name
        if (selectedPlotId) {
          const updatedPlots = plots.map(plot => {
            if (plot.id === selectedPlotId) {
              return {
                ...plot,
                locationName: place.formatted_address || place.name
              };
            }
            return plot;
          });
          onPlotsChange(updatedPlots);
        }
      }
    }
  };

  const handleManualPlot = async () => {
    if (!selectedPlotId) {
      alert('Please select a plot area first');
      return;
    }
    
    const plot = plots.find(p => p.id === selectedPlotId);
    if (!plot) return;

    if (plot.coordinates.length < 3) {
      alert('Please add at least 3 coordinates to plot');
      return;
    }

    // Calculate area
    const area = calculatePolygonArea(plot.coordinates);
    
    // Get location name if not already set
    let locationName = plot.locationName || manualLocationName;
    if (!locationName && plot.coordinates.length >= 3) {
      locationName = await getLocationNameFromCoordinates(plot.coordinates);
    }
    
    // Update plot with area
    const updatedPlots = plots.map(p => {
      if (p.id === selectedPlotId) {
        return {
          ...p,
          hectares: area,
          locationName: locationName || p.locationName || 'Unnamed Location'
        };
      }
      return p;
    });

    onPlotsChange(updatedPlots);
    setManualLocationName('');
  };

  // Colors for different plots
  const plotColors = [
    '#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#f97316',
  ];

  // Get location name for display
  const displayLocationName = searchPlace?.formatted_address || 
                             manualLocationName || 
                             (selectedPlotId && plots.find(p => p.id === selectedPlotId)?.locationName);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
          {selectedPlotId && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Editing: {plots.find(p => p.id === selectedPlotId)?.name}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isDrawing && selectedPlotId && (
            <button
              onClick={startDrawing}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-4 h-4" />
              Draw Plot Boundary
            </button>
          )}
          {isDrawing && (
            <button
              onClick={cancelDrawing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel Drawing
            </button>
          )}
          <button
            onClick={handleManualPlot}
            disabled={!selectedPlotId || disabled}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${!selectedPlotId || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CheckCircle className="w-4 h-4" />
            Plot from Coordinates
          </button>
        </div>
      </div>

      {/* Location Name Input for Manual Coordinates */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-medium text-gray-700">Location Name (Optional)</h5>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
            disabled={disabled}
          />
          
          {/* Location Suggestions */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleLocationSuggestionSelect(suggestion.place_id)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{suggestion.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter a location name or select from suggestions. This helps identify the plot area.
        </p>
      </div>

      <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'satellite',
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            fullscreenControl: true,
            clickableIcons: false,
            gestureHandling: 'greedy'
          }}
        >
          {/* Drawing Manager */}
          {!disabled && selectedPlotId && (
            <DrawingManager
              onLoad={onDrawingManagerLoad}
              onPolygonComplete={onPolygonComplete}
              drawingMode={isDrawing ? window.google.maps.drawing.OverlayType.POLYGON : null}
              options={{
                drawingControl: false,
                polygonOptions: {
                  fillColor: '#22c55e',
                  fillOpacity: 0.3,
                  strokeColor: '#16a34a',
                  strokeWeight: 2,
                  editable: false,
                  draggable: false,
                }
              }}
            />
          )}

          {/* Display all saved polygons with labels */}
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
                    strokeColor: isSelected ? '#000000' : color,
                    strokeWeight: isSelected ? 3 : 2,
                    clickable: true
                  }}
                  onClick={() => onPlotSelect(plot.id)}
                />
                
                {/* Label for polygon */}
                {center && (
                  <Marker
                    position={center}
                    label={{
                      text: plot.name,
                      color: isSelected ? '#000000' : '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    icon={{
                      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                      fillColor: isSelected ? '#FFFFFF' : color,
                      fillOpacity: 1,
                      strokeColor: isSelected ? '#000000' : '#FFFFFF',
                      strokeWeight: 2,
                      scale: 1,
                      labelOrigin: new window.google.maps.Point(0, -30)
                    }}
                    onClick={() => onPlotSelect(plot.id)}
                  />
                )}
              </div>
            );
          })}

          {/* Search overlay */}
          {!disabled && (
            <div className="absolute top-4 left-4 z-10">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                  autocomplete.addListener('place_changed', handleSearchPlaceChanged);
                }}
                options={{
                  fields: ["geometry", "name", "formatted_address"],
                  strictBounds: false,
                }}
              >
                <div className="flex items-center bg-white bg-opacity-90 rounded shadow-lg">
                  <input
                    type="text"
                    placeholder="Search location..."
                    className="p-2 h-10 w-80 border-none rounded-l focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                    style={{ outline: 'none' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPlaceChanged()}
                  />
                  <button
                    type="button"
                    className="p-2 h-10 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none flex items-center justify-center"
                    onClick={handleSearchPlaceChanged}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </Autocomplete>
            </div>
          )}

          {/* Location Name Display */}
          {displayLocationName && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 break-words">
                      {displayLocationName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drawing Instructions */}
          {isDrawing && !disabled && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm text-gray-700">
                Click on the map to draw your plot boundary. Click the first point again to close the polygon.
              </p>
            </div>
          )}

          {/* Disabled Overlay */}
          {disabled && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Select a forest area first</p>
                <p className="text-gray-500 text-sm mt-1">You need to select a forest area before defining plot boundaries</p>
              </div>
            </div>
          )}
        </GoogleMap>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-1">Instructions</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select a plot area from the list above to edit it</li>
              <li>• Click "Draw Plot Boundary" to start drawing on the map</li>
              <li>• Alternatively, enter coordinates manually and click "Plot from Coordinates"</li>
              <li>• Each plot area will be displayed with a unique color and label</li>
              <li>• Search for locations or enter location name for better identification</li>
              {disabled && <li className="text-amber-600 font-medium">• Please select a forest area first to enable mapping features</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const EUDRDefinitions = () => {
  // USE THE CUSTOM HOOK INSTEAD OF useJsApiLoader
  const isLoaded = useGoogleMapsLoaded();

  const [selectedForest, setSelectedForest] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    categoryId: '',
    categoryTitle: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForests, setFilteredForests] = useState(mockForests);
  const [plots, setPlots] = useState([]);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [supportedProducts, setSupportedProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [forestsData, setForestsData] = useState(() => {
    const savedData = localStorage.getItem('eudr_definitions_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      // Merge saved data with mock forests
      return mockForests.map(forest => {
        const savedForest = data.forests?.find(f => f.id === forest.id);
        return savedForest ? { ...forest, ...savedForest } : forest;
      });
    }
    return mockForests;
  });
  const dropdownRef = useRef(null);

  // Filter forests based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredForests(forestsData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = forestsData.filter(forest =>
        forest.name.toLowerCase().includes(query) ||
        forest.country.toLowerCase().includes(query) ||
        forest.region.toLowerCase().includes(query)
      );
      setFilteredForests(filtered);
    }
  }, [searchQuery, forestsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When forest selection changes, update plots and products
  useEffect(() => {
    if (selectedForest) {
      setPlots(selectedForest.plots || []);
      setSupportedProducts(selectedForest.supportedProducts || []);
      
      // Select first plot if available
      if (selectedForest.plots?.length > 0 && !selectedPlotId) {
        setSelectedPlotId(selectedForest.plots[0].id);
      }
    }
  }, [selectedForest]);

  // Calculate total hectares whenever plots change
  const totalHectares = plots.reduce((total, plot) => total + (plot.hectares || 0), 0);

  // Calculate upload progress
  const uploadProgress = documentCategories.map(category => {
    const categoryDocs = documents.filter(doc => doc.categoryId === category.id);
    return {
      ...category,
      completed: categoryDocs.length > 0,
      count: categoryDocs.length
    };
  });

  const completedCategories = uploadProgress.filter(cat => cat.completed).length;
  const totalCategories = documentCategories.length;
  const progressPercentage = (completedCategories / totalCategories) * 100;

  const handleDocumentUpload = (newDoc) => {
    const document = {
      ...newDoc,
      id: `${newDoc.categoryId}-${Date.now()}`,
      forestId: selectedForest.id,
      forestName: selectedForest.name
    };
    setDocuments(prev => [...prev, document]);
  };

  const removeDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleForestSelect = (forest) => {
    // Get the forest with saved data
    const forestWithData = forestsData.find(f => f.id === forest.id) || forest;
    
    const forestWithPlots = {
      ...forestWithData,
      plots: forestWithData.plots || [],
      totalHectares: forestWithData.plots?.reduce((total, plot) => total + (plot.hectares || 0), 0) || 0,
      area: forestWithData.plots?.length > 0 
        ? `${forestWithData.plots.reduce((total, plot) => total + (plot.hectares || 0), 0).toFixed(2)} hectares`
        : ''
    };
    
    setSelectedForest(forestWithPlots);
    setPlots(forestWithPlots.plots || []);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Select first plot if available
    if (forestWithPlots.plots?.length > 0) {
      setSelectedPlotId(forestWithPlots.plots[0].id);
    } else {
      setSelectedPlotId(null);
    }
  };

  const handlePlotsChange = (newPlots) => {
    setPlots(newPlots);
    
    // Update selected forest with new plots and recalculate total area
    if (selectedForest) {
      const newTotalHectares = newPlots.reduce((total, plot) => total + (plot.hectares || 0), 0);
      const updatedForest = {
        ...selectedForest,
        plots: newPlots,
        totalHectares: newTotalHectares,
        area: newTotalHectares > 0 ? `${newTotalHectares.toFixed(2)} hectares` : selectedForest.area
      };
      setSelectedForest(updatedForest);
    }
  };

  const handlePlotCoordinatesChange = (coordinates) => {
    if (!selectedPlotId) return;
    
    const updatedPlots = plots.map(plot => {
      if (plot.id === selectedPlotId) {
        return { ...plot, coordinates };
      }
      return plot;
    });
    
    handlePlotsChange(updatedPlots);
  };

  const handleProductsChange = (products) => {
    setSupportedProducts(products);
    if (selectedForest) {
      setSelectedForest({
        ...selectedForest,
        supportedProducts: products
      });
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);

    // Prepare data to save
    const saveData = {
      selectedForest: {
        ...selectedForest,
        plots: plots,
        totalHectares: totalHectares,
        area: `${totalHectares.toFixed(2)} hectares`,
        supportedProducts: supportedProducts,
        lastUpdated: new Date().toISOString()
      },
      documents: documents.map(doc => ({
        ...doc,
        forestId: selectedForest?.id,
        forestName: selectedForest?.name
      })),
      // Save all forests data
      forests: forestsData.map(forest => 
        forest.id === selectedForest.id 
          ? {
              ...selectedForest,
              plots: plots,
              totalHectares: totalHectares,
              area: `${totalHectares.toFixed(2)} hectares`,
              supportedProducts: supportedProducts,
              lastUpdated: new Date().toISOString()
            }
          : forest
      ),
      savedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('eudr_definitions_data', JSON.stringify(saveData));

    // Update the forests data state
    setForestsData(saveData.forests);

    // Update filtered forests
    const query = searchQuery.toLowerCase();
    const filtered = saveData.forests.filter(forest =>
      forest.name.toLowerCase().includes(query) ||
      forest.country.toLowerCase().includes(query) ||
      forest.region.toLowerCase().includes(query)
    );
    setFilteredForests(filtered);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('All changes saved successfully!');
    }, 500);
  };

  const handleUploadButtonClick = (category) => {
    if (!selectedForest) {
      alert('Please select a forest area first before uploading documents.');
      return;
    }
    setUploadModal({
      isOpen: true,
      categoryId: category.id,
      categoryTitle: category.title
    });
  };

  const selectedPlot = plots.find(p => p.id === selectedPlotId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">
          Article 2 (40) Compliance Documentation
        </h1>
        <p className="text-gray-600 text-lg">
          Upload documents demonstrating compliance with relevant legislation of the country of production.
        </p>
      </div>

      {/* Forest Selection Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trees className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Select Forest Area
          </h2>
        </div>

        {/* Warning message if trying to upload without selecting forest */}
        {!selectedForest && documents.length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">
                  Forest Not Selected
                </p>
                <p className="text-amber-700 text-sm">
                  You have uploaded documents but haven't selected a forest area.
                  Please select a forest area to associate these documents with.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown Trigger */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <div className="flex items-center gap-3">
              {selectedForest ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <span className="font-medium text-gray-900">{selectedForest.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({selectedForest.country})</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500">Select a forest area...</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forests by name, country, or region..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Forests List */}
              <div className="overflow-y-auto max-h-64">
                {filteredForests.length > 0 ? (
                  filteredForests.map(forest => (
                    <button
                      key={forest.id}
                      onClick={() => handleForestSelect(forest)}
                      className={`w-full flex items-start p-4 hover:bg-gray-50 transition-colors ${selectedForest?.id === forest.id ? 'bg-green-50' : ''
                        }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-3 h-3 rounded-full ${selectedForest?.id === forest.id ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                      </div>
                      <div className="ml-3 text-left">
                        <div className="font-medium text-gray-900">{forest.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{forest.country}</span>
                          <span className="mx-2">•</span>
                          <span>{forest.region}</span>
                          {forest.totalHectares > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600 font-medium">
                                {forest.totalHectares.toFixed(2)} hectares
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {forest.plots?.length || 0} plot{forest.plots?.length !== 1 ? 's' : ''} •{' '}
                          {forest.supportedProducts?.length || 0} EUDR product{forest.supportedProducts?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No forests found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="p-3 border-t border-gray-100 text-sm text-gray-500 bg-gray-50">
                Showing {filteredForests.length} of {forestsData.length} forests
              </div>
            </motion.div>
          )}
        </div>

        {/* Selected Forest Details */}
        {selectedForest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-2">
                  {selectedForest.name}
                  {totalHectares > 0 && (
                    <span className="ml-2 text-green-600">
                      • {totalHectares.toFixed(2)} hectares
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="text-gray-600 mb-1">Total Area</div>
                    <div className="font-medium text-green-700">
                      {totalHectares > 0 ? `${totalHectares.toFixed(2)} hectares` : 'Not defined yet'}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="text-gray-600 mb-1">Plots</div>
                    <div className="font-medium text-green-700">
                      {plots.length} plot{plots.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="text-gray-600 mb-1">Country & Region</div>
                    <div className="font-medium text-green-700">
                      {selectedForest.country} • {selectedForest.region}
                    </div>
                  </div>
                </div>

                {/* Current EUDR Products */}
                {selectedForest.supportedProducts && selectedForest.supportedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="text-gray-600 mb-1">Current EUDR Products</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedForest.supportedProducts.map((product, index) => (
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

        {/* Helper Text */}
        {!selectedForest && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium text-amber-600">Important:</span> You must select a forest area before uploading compliance documents.
            </p>
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Lock className="w-4 h-4" />
              <span>Document upload features are locked until a forest is selected</span>
            </div>
          </div>
        )}
      </div>

      {/* Plot Management Section */}
      {selectedForest && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <PlotManager
            plots={plots}
            onPlotsChange={handlePlotsChange}
            selectedPlotId={selectedPlotId}
            onPlotSelect={setSelectedPlotId}
            disabled={!selectedForest}
          />
        </div>
      )}

      {/* Plot Mapping Section */}
      {selectedForest && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Define Plot Boundaries
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showMap
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {showMap ? 'Show Coordinate Input' : 'Show Map'}
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Define the exact boundaries of your forest plots using coordinates or by drawing on the map.
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
              disabled={!selectedForest}
              selectedPlotId={selectedPlotId}
              onPlotSelect={setSelectedPlotId}
            />
          ) : (
            <div className="space-y-6">
              <EnhancedCoordinateInput
                selectedPlot={selectedPlot}
                onCoordinatesChange={handlePlotCoordinatesChange}
                disabled={!selectedForest || !selectedPlotId}
              />
            </div>
          )}
        </div>
      )}

      {/* EUDR Products Selection Section - MOVED AFTER PLOT BOUNDARIES */}
      {selectedForest && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <ProductSelection
            selectedProducts={supportedProducts}
            onProductsChange={handleProductsChange}
            disabled={!selectedForest}
          />
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload Progress
          </h3>
          <span className="text-sm font-medium text-green-600">
            {completedCategories}/{totalCategories} categories completed
          </span>
        </div>

        <div className="mb-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-green-600 rounded-full"
            />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {completedCategories === totalCategories ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              All required documents uploaded successfully!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              {selectedForest
                ? 'Upload at least one document for each category to comply with EUDR regulations.'
                : 'Select a forest area first to begin uploading compliance documents.'}
            </span>
          )}
        </p>
      </div>

      {/* Document Categories Section */}
      <div className="space-y-6">
        {uploadProgress.map(category => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-lg border overflow-hidden ${!selectedForest ? 'border-gray-200 opacity-75' : 'border-green-100'}`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.title}
                    </h3>
                    {category.completed && selectedForest && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>

                <button
                  onClick={() => handleUploadButtonClick(category)}
                  disabled={!selectedForest}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedForest
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-500 bg-gray-100 cursor-not-allowed'
                    }`}
                >
                  {!selectedForest && <Lock className="w-4 h-4" />}
                  <Plus className="w-4 h-4" />
                  {selectedForest ? 'Add Document' : 'Locked'}
                </button>
              </div>

              {/* Uploaded Documents */}
              {documents.filter(doc => doc.categoryId === category.id).length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {documents
                      .filter(doc => doc.categoryId === category.id)
                      .map(document => (
                        <div
                          key={document.id}
                          className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {document.name}
                          </span>
                          <button
                            onClick={() => removeDocument(document.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              <div className="mt-4 text-sm">
                {!selectedForest ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Select a forest area to upload documents
                  </span>
                ) : category.completed ? (
                  <span className="text-green-600 font-medium">
                    ✓ Document uploaded for {selectedForest.name}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    ⚠ Required: Upload at least one document for {selectedForest.name}
                  </span>
                )}
                {category.count > 0 && selectedForest && (
                  <span className="text-gray-500 ml-3">
                    {category.count} document{category.count > 1 ? 's' : ''} uploaded for {selectedForest.name}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save All Button */}
      {selectedForest && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Save Your Changes
              </h3>
              <p className="text-gray-600 text-sm">
                Save all your updates for {selectedForest.name} including {plots.length} plot{plots.length !== 1 ? 's' : ''} ({totalHectares.toFixed(2)} hectares), {supportedProducts.length} EUDR product{supportedProducts.length !== 1 ? 's' : ''}, and {documents.length} document{documents.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-xs text-gray-500 mt-3">
            Your data will be saved locally and automatically loaded when you return to this forest.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false, categoryId: '', categoryTitle: '' })}
        categoryId={uploadModal.categoryId}
        categoryTitle={uploadModal.categoryTitle}
        onUpload={handleDocumentUpload}
        forestName={selectedForest?.name}
      />
    </motion.div>
  );
};

export default EUDRDefinitions;
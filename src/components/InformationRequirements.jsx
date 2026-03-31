import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from "../store/useUserStore";
import {
  ChevronDown,
  Search,
  MapPin,
  Trees,
  Upload,
  Plus,
  X,
  FileText,
  Save,
  Calendar,
  Globe,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  Tag,
  Map,
  Layers,
  Edit,
  Trash2,
  DollarSign,
  CreditCard,
  Maximize2,
  ArrowLeft,
  MessageSquare,
  User
} from 'lucide-react';

// For the map - we'll use Google Maps
import { GoogleMap, Autocomplete, Polygon, DrawingManager, Marker, InfoWindow } from '@react-google-maps/api';

// Helper function to convert [lat, lng] array to {lat, lng} object
const convertToLatLng = (coord) => {
  if (Array.isArray(coord)) {
    return { lat: coord[0], lng: coord[1] };
  }
  return coord;
};

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

// Years to cover
const years = [2021, 2022, 2023, 2024, 2025];

// Document upload modal component
const DocumentUploadModal = ({ isOpen, onClose, documentType, onUpload }) => {
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
      // For demo purposes, we create a dummy URL
      const dummyUrl = `https://cloud-storage.com/demo/docs/${Date.now()}-${documentName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      
      onUpload({
        name: documentName.trim(),
        url: dummyUrl,
        type: documentType,
        uploadedAt: new Date().toISOString()
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
            <h3 className="text-lg font-semibold text-gray-900">
              Upload {documentType} Document
            </h3>
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

// HS Code Selector Component - Modified to use facility's supportedProducts
const HSCodeSelector = ({ selectedCodes = [], onSelect, onRemove, supportedProducts = [], disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search query
  const filteredCommodities = supportedProducts
    .map(commodity => ({
      ...commodity,
      products: commodity.products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.includes(searchQuery)
      )
    }))
    .filter(commodity => commodity.products.length > 0);

  const handleSelect = (code, name, commodity) => {
    if (!selectedCodes.some(c => c.code === code)) {
      onSelect({ code, name, commodity });
    }
  };

  return (
    <div className="relative">
      {/* Selected Codes Display */}
      <div className="mb-3">
        {selectedCodes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCodes.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
              >
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {item.code} - {item.name}
                </span>
                {!disabled && (
                  <button
                    onClick={() => onRemove(index)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No HS codes selected</p>
        )}
      </div>

      {/* Dropdown Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg transition-colors bg-white text-left ${
          disabled ? 'cursor-default opacity-75' : 'hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400" />
          <span className="text-gray-700">
            {selectedCodes.length > 0
              ? `${selectedCodes.length} HS Code${selectedCodes.length > 1 ? 's' : ''} selected`
              : 'Select HS Code(s)'}
          </span>
        </div>
        {!disabled && <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {/* Dropdown Content */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search HS codes or commodities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Commodities List */}
          <div className="overflow-y-auto max-h-64">
            {filteredCommodities.length > 0 ? (
              filteredCommodities.map(commodity => (
                <div key={commodity.commodity} className="border-b border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900">{commodity.commodity}</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {commodity.products.map(product => (
                      <button
                        key={product.code}
                        onClick={() => handleSelect(product.code, product.name, commodity.commodity)}
                        disabled={selectedCodes.some(c => c.code === product.code)}
                        className={`w-full flex items-start p-3 hover:bg-gray-50 transition-colors text-left ${
                          selectedCodes.some(c => c.code === product.code) ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedCodes.some(c => c.code === product.code) ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{product.code}</div>
                          <div className="text-sm text-gray-600">{product.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {supportedProducts.length === 0 
                  ? "This facility doesn't have any supported products configured yet."
                  : `No HS codes found matching "${searchQuery}"`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Importer Selector Component
const ImporterSelector = ({ importers = [], selectedImporter, onSelect, onClear, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredImporters = importers.filter(importer =>
    importer.basicInfo.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Selected Importer Display */}
      {selectedImporter ? (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">{selectedImporter.basicInfo.companyName}</p>
              <p className="text-xs text-green-600 mt-1">{selectedImporter.basicInfo.email}</p>
              <p className="text-xs text-green-600">{selectedImporter.basicInfo.country}</p>
            </div>
            {!disabled && (
              <button
                onClick={onClear}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg transition-colors bg-white text-left ${
            disabled ? 'cursor-default opacity-75' : 'hover:border-green-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Select an importer...</span>
          </div>
          {!disabled && <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </button>
      )}

      {/* Dropdown Content */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search importers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Importers List */}
          <div className="overflow-y-auto max-h-64">
            {filteredImporters.length > 0 ? (
              filteredImporters.map(importer => (
                <button
                  key={importer.id}
                  onClick={() => {
                    onSelect(importer);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-start p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-3 text-left">
                    <div className="font-medium text-gray-900">{importer.basicInfo.companyName}</div>
                    <div className="text-sm text-gray-600 mt-1">{importer.basicInfo.country} • {importer.basicInfo.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No importers found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Record Card Component for displaying existing records
const RecordCard = ({ record, year, onView, onPayment, isPaid, viewOnly = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">{record.description?.substring(0, 50)}...</h4>
            {isPaid ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Paid
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Payment Pending
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">HS Codes:</span>
              <span className="ml-1 font-medium">{record.hsCodes?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Net Mass:</span>
              <span className="ml-1 font-medium">{record.netMassKg?.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-gray-500">Customer:</span>
              <span className="ml-1 font-medium">{record.customerName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Planting Areas:</span>
              <span className="ml-1 font-medium">{record.plantingAreas?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onView(record)}
            className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View
          </button>
          {!viewOnly && !isPaid && (
            <button
              onClick={() => onPayment(record)}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Pay
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Map Component for Polygon Drawing and Visualization - UPDATED with zIndex handling and removed map/satellite label
const PolygonMapComponent = ({ 
  coordinates = [], 
  onCoordinatesChange, 
  isLoaded, 
  facilityAreas = [],
  facilityName = '',
  facilityAddress = '',
  viewOnly = false,
  initialCenter = null,
  initialZoom = 15
}) => {
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [plotName, setPlotName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState([]);
  const [plotToSave, setPlotToSave] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [expandedPlot, setExpandedPlot] = useState(null);
  const autocompleteRef = useRef(null);

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

  // Calculate center based on facility areas or first planting area
  const calculateCenter = () => {
    if (initialCenter) return initialCenter;
    
    if (facilityAreas.length > 0 && facilityAreas[0].coordinates && facilityAreas[0].coordinates.length > 0) {
      // Use the first coordinate of the first facility area
      const coord = convertToLatLng(facilityAreas[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    
    if (coordinates.length > 0 && coordinates[0].coordinates && coordinates[0].coordinates.length > 0) {
      // Use the first coordinate of the first planting area
      const coord = convertToLatLng(coordinates[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    
    return { lat: 0, lng: 0 };
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onDrawingManagerLoad = useCallback((manager) => {
    setDrawingManager(manager);
  }, []);

  const onPolygonComplete = useCallback((polygon) => {
    if (viewOnly) return; // No drawing in view-only mode
    const paths = polygon.getPath();
    const coords = [];

    for (let i = 0; i < paths.getLength(); i++) {
      const point = paths.getAt(i);
      coords.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }

    // Store the drawn polygon temporarily
    setTempCoordinates(coords);
    setPlotToSave(polygon);
    
    // Show save dialog
    setShowSaveDialog(true);
    
    // Exit drawing mode
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
    }
  }, [drawingManager, viewOnly]);

  const handleSavePlot = () => {
    if (plotName.trim() && tempCoordinates.length >= 3) {
      // Calculate hectares (simplified calculation - in real app would use more accurate method)
      const hectares = calculateHectares(tempCoordinates);
      
      // Add the plot to the list
      onCoordinatesChange([
        ...coordinates,
        {
          id: `plot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: plotName.trim(),
          coordinates: tempCoordinates,
          hectares: hectares
        }
      ]);
      
      // Reset
      setPlotName('');
      setTempCoordinates([]);
      setShowSaveDialog(false);
      
      // Remove the drawn polygon from map
      if (plotToSave) {
        plotToSave.setMap(null);
        setPlotToSave(null);
      }
    }
  };

  const cancelSavePlot = () => {
    // Remove the drawn polygon from map
    if (plotToSave) {
      plotToSave.setMap(null);
      setPlotToSave(null);
    }
    setTempCoordinates([]);
    setPlotName('');
    setShowSaveDialog(false);
  };

  const calculateHectares = (coords) => {
    // Simplified calculation - in production, use proper geodesic area calculation
    // For demo purposes, we'll return a random value between 10 and 100
    return Math.round((Math.random() * 90 + 10) * 100) / 100;
  };

  const startDrawing = () => {
    if (viewOnly) return;
    if (drawingManager) {
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

  const deletePlot = (plotId) => {
    if (viewOnly) return;
    onCoordinatesChange(coordinates.filter(plot => plot.id !== plotId));
  };

  const handleAreaClick = (area, event) => {
    // Stop event propagation to prevent parent handlers from firing
    event.stop();
    
    setSelectedArea(area);
    setInfoWindowPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    setShowInfoWindow(true);
  };

  // Zoom to facility areas when map loads
  useEffect(() => {
    if (map && facilityAreas.length > 0 && facilityAreas[0].coordinates && facilityAreas[0].coordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add all facility area coordinates to bounds
      facilityAreas.forEach(area => {
        if (area.coordinates && area.coordinates.length > 0) {
          area.coordinates.forEach(coord => {
            const latLng = convertToLatLng(coord);
            bounds.extend(latLng);
          });
        }
      });
      
      // Add all planting areas to bounds
      coordinates.forEach(plot => {
        if (plot.coordinates && plot.coordinates.length > 0) {
          plot.coordinates.forEach(coord => {
            const latLng = convertToLatLng(coord);
            bounds.extend(latLng);
          });
        }
      });
      
      map.fitBounds(bounds);
    }
  }, [map, facilityAreas, coordinates]);

  // Helper to convert coordinates for polygon paths
  const getPolygonPaths = (coords) => {
    return coords.map(coord => convertToLatLng(coord));
  };

  return (
    <div className="space-y-4">
      {!viewOnly && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
          </div>
          <div className="flex gap-2">
            {!isDrawing && (
              <button
                onClick={startDrawing}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Draw New Plot
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
          </div>
        </div>
      )}

      <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-300">
        {/* Facility Address Overlay */}
        {facilityAddress && (
          <div className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{facilityName}</span>
              <span className="text-xs text-gray-500">| {facilityAddress}</span>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={calculateCenter()}
          zoom={initialZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'satellite',
            streetViewControl: false,
            mapTypeControl: false, // This removes the map/satellite label
            zoomControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Drawing Manager - only show if not in viewOnly mode */}
          {!viewOnly && (
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
                  zIndex: 2 // Higher zIndex for drawn polygons
                }
              }}
            />
          )}

          {/* Display facility areas (base forest areas) with labels - lower zIndex */}
          {facilityAreas.map((area, index) => (
            area.coordinates && area.coordinates.length >= 3 && (
              <Polygon
                key={`facility-${index}`}
                paths={getPolygonPaths(area.coordinates)}
                options={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  strokeColor: '#2563eb',
                  strokeWeight: 2,
                  strokeOpacity: 0.8,
                  zIndex: 1, // Lower zIndex for facility areas
                  clickable: true // Always clickable in both view and edit modes
                }}
                onClick={(e) => handleAreaClick({
                  type: 'facility',
                  name: area.name || facilityName || 'Production Site',
                  hectares: area.hectares || 0,
                  points: area.coordinates.length
                }, e)}
              />
            )
          ))}

          {/* Display saved planting areas with labels - higher zIndex */}
          {coordinates.map((plot) => (
            plot.coordinates && plot.coordinates.length >= 3 && (
              <Polygon
                key={plot.id}
                paths={getPolygonPaths(plot.coordinates)}
                options={{
                  fillColor: '#22c55e',
                  fillOpacity: 0.4,
                  strokeColor: '#16a34a',
                  strokeWeight: 2,
                  zIndex: 2, // Higher zIndex for planting areas
                  clickable: true // Always clickable
                }}
                onClick={(e) => handleAreaClick({
                  type: 'planting',
                  name: plot.name,
                  hectares: plot.hectares,
                  points: plot.coordinates.length,
                  coordinates: plot.coordinates // Pass coordinates for detailed view
                }, e)}
              />
            )
          ))}

          {/* Info Window for clicked areas */}
          {showInfoWindow && selectedArea && infoWindowPosition && (
            <InfoWindow
              position={infoWindowPosition}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedArea.name}</h4>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span> {selectedArea.type === 'facility' ? 'Production Site' : 'Planting Area'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Area:</span> {selectedArea.hectares} hectares
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Points:</span> {selectedArea.points}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Search overlay - only show when not in viewOnly mode */}
          {!viewOnly && (
            <div className="absolute top-4 left-4 z-10">
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={() => {
                  if (autocompleteRef.current) {
                    const place = autocompleteRef.current.getPlace();
                    if (place.geometry) {
                      map.panTo(place.geometry.location);
                      map.setZoom(15);
                    }
                  }
                }}
                options={{
                  fields: ["geometry", "name"],
                  strictBounds: false,
                }}
              >
                <div className="flex items-center bg-white bg-opacity-90 rounded shadow-lg">
                  <input
                    type="text"
                    placeholder="Search location..."
                    className="p-2 h-10 w-80 border-none rounded-l focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    className="p-2 h-10 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none flex items-center justify-center"
                    onClick={() => autocompleteRef.current && autocompleteRef.current.focus()}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </Autocomplete>
            </div>
          )}

          {/* Drawing Instructions */}
          {isDrawing && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm text-gray-700">
                Click on the map to draw your plot boundary. Click the first point again to close the polygon.
              </p>
            </div>
          )}
        </GoogleMap>
      </div>

      {/* Save Plot Dialog */}
      {showSaveDialog && !viewOnly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Save Planting Area
                </h3>
                <button
                  onClick={cancelSavePlot}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Name
                  </label>
                  <input
                    type="text"
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., North Section, Plot A"
                    autoFocus
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Plot Details</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Points:</span> {tempCoordinates.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Coordinates:</span>
                    </p>
                    <div className="max-h-32 overflow-y-auto bg-white rounded p-2 text-xs">
                      {tempCoordinates.map((coord, idx) => (
                        <div key={idx} className="font-mono">
                          {idx + 1}. {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={cancelSavePlot}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePlot}
                    disabled={!plotName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Plot
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Existing Plots List - Enhanced with detailed information */}
      {!viewOnly && coordinates.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Planting Areas</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {coordinates.map((plot) => (
              <div
                key={plot.id}
                className="bg-green-50 rounded-lg border border-green-200 overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => setExpandedPlot(expandedPlot === plot.id ? null : plot.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{plot.name}</span>
                      <div className="text-xs text-gray-600">
                        <span>Points: {plot.coordinates.length} • </span>
                        <span>Area: {plot.hectares} ha</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlot(plot.id);
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete Plot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedPlot === plot.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedPlot === plot.id && (
                  <div className="px-3 pb-3 pt-1 border-t border-green-200 bg-green-50/50">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Coordinates:</h5>
                    <div className="max-h-40 overflow-y-auto bg-white rounded p-2 text-xs font-mono">
                      {plot.coordinates.map((coord, idx) => {
                        const latLng = convertToLatLng(coord);
                        return (
                          <div key={idx} className="py-0.5">
                            {idx + 1}. {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-500">Hectares:</span>
                        <span className="ml-1 font-medium">{plot.hectares}</span>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-500">Total Points:</span>
                        <span className="ml-1 font-medium">{plot.coordinates.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!viewOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-800 mb-1">Instructions</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Blue areas show your facility's base forest boundaries</li>
                <li>• Click "Draw New Plot" to draw a planting area polygon</li>
                <li>• After drawing, give it a name and save it</li>
                <li>• You can draw multiple plots for different planting areas</li>
                <li>• Click on any polygon to see its details</li>
                <li>• Click on a saved plot to expand and see detailed coordinates</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Record Detail Modal with Enhanced Map View - UPDATED to ensure both facility and planting areas are shown
const RecordDetailModal = ({ record, year, facility, onClose, viewOnly = false }) => {
  const isLoaded = useGoogleMapsLoaded();
  const [selectedTab, setSelectedTab] = useState('details');
  const [mapError, setMapError] = useState(null);
  
  if (!record) return null;

  // Calculate center from facility or first planting area
  const getInitialCenter = () => {
    // Try facility areas first
    if (facility?.areas && facility.areas.length > 0 && facility.areas[0].coordinates && facility.areas[0].coordinates.length > 0) {
      const coord = convertToLatLng(facility.areas[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    // Then try planting areas
    if (record.plantingAreas && record.plantingAreas.length > 0 && record.plantingAreas[0].coordinates && record.plantingAreas[0].coordinates.length > 0) {
      const coord = convertToLatLng(record.plantingAreas[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    return { lat: 0, lng: 0 };
  };

  // Check if there are any areas to display
  const hasFacilityAreas = facility?.areas && facility.areas.length > 0 && 
    facility.areas.some(area => area.coordinates && area.coordinates.length >= 3);
  
  const hasPlantingAreas = record.plantingAreas && record.plantingAreas.length > 0 && 
    record.plantingAreas.some(area => area.coordinates && area.coordinates.length >= 3);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Record Details - {year}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setSelectedTab('details')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedTab === 'details'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setSelectedTab('map')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedTab === 'map'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setSelectedTab('documents')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedTab === 'documents'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents
            </button>
          </div>

          {selectedTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{record.description}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Species</p>
                  <p className="font-medium">{record.commonName} ({record.scientificName})</p>
                </div>
              </div>

              {/* HS Codes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">HS Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {record.hsCodes?.map((code, index) => (
                    <div key={index} className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                      <span className="font-medium">{code.code}</span> - {code.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity and Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Net Mass</p>
                  <p className="font-medium text-lg">{record.netMassKg?.toLocaleString()} kg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Production Location</p>
                  <p className="font-medium">{record.productionLocation}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Production Date Range</p>
                  <p className="font-medium">
                    {record.productionDateRange?.from} to {record.productionDateRange?.to}
                  </p>
                </div>
              </div>

              {/* Facility Main Harvest Zone (if available) */}
              {facility?.areas && facility.areas.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Facility Main Harvest Zone</h4>
                  <div className="space-y-3">
                    {facility.areas.map((area, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{area.name}</span>
                          <span className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-700">
                            {area.hectares} hectares
                          </span>
                        </div>
                        
                        {/* Coordinates Section */}
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Coordinates:</p>
                          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2 text-xs font-mono">
                            {area.coordinates && area.coordinates.map((coord, coordIdx) => {
                              const latLng = convertToLatLng(coord);
                              return (
                                <div key={coordIdx} className="py-0.5">
                                  {coordIdx + 1}. {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Total Points: {area.coordinates?.length || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planting Areas Summary */}
              {record.plantingAreas && record.plantingAreas.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Planting Areas</h4>
                  <div className="space-y-3">
                    {record.plantingAreas.map((area, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{area.name}</span>
                          <span className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                            {area.hectares} hectares
                          </span>
                        </div>
                        
                        {/* Coordinates Section */}
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Coordinates:</p>
                          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2 text-xs font-mono">
                            {area.coordinates && area.coordinates.map((coord, coordIdx) => {
                              const latLng = convertToLatLng(coord);
                              return (
                                <div key={coordIdx} className="py-0.5">
                                  {coordIdx + 1}. {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Total Points: {area.coordinates?.length || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-green-200 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Area:</span>
                        <span>{record.totalHectares || record.plantingAreas.reduce((sum, a) => sum + (a.hectares || 0), 0)} hectares</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-blue-600">Name</p>
                    <p className="font-medium">{record.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Address</p>
                    <p className="font-medium">{record.customerAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Email</p>
                    <p className="font-medium">{record.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    {record.paymentStatus ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Paid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Payment Pending</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-gray-900">${record.amount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'map' && (
            <div className="space-y-4">
              {/* Map Legend */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 opacity-30 border-2 border-blue-600 rounded"></div>
                  <span className="text-sm text-gray-700">Facility Main Harvest Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 opacity-40 border-2 border-green-600 rounded"></div>
                  <span className="text-sm text-gray-700">Planting Areas</span>
                </div>
              </div>

              {/* Area Summary */}
              <div className="grid grid-cols-2 gap-4">
                {hasFacilityAreas && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Facility Areas</p>
                    <p className="text-lg font-bold text-blue-900">
                      {facility.areas.reduce((sum, a) => sum + (a.hectares || 0), 0)} ha
                    </p>
                    <p className="text-xs text-blue-600">
                      {facility.areas.length} area{facility.areas.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {hasPlantingAreas && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Planting Areas</p>
                    <p className="text-lg font-bold text-green-900">
                      {record.plantingAreas.reduce((sum, a) => sum + (a.hectares || 0), 0)} ha
                    </p>
                    <p className="text-xs text-green-600">
                      {record.plantingAreas.length} area{record.plantingAreas.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message if no areas */}
              {!hasFacilityAreas && !hasPlantingAreas && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-amber-800">No geographic areas found for this record.</p>
                </div>
              )}

              {/* Map Component */}
              <PolygonMapComponent
                isLoaded={isLoaded}
                coordinates={record.plantingAreas || []}
                onCoordinatesChange={() => {}} // No-op for view-only
                facilityAreas={facility?.areas || []}
                facilityName={facility?.name}
                facilityAddress={facility?.address}
                viewOnly={true}
                initialCenter={getInitialCenter()}
                initialZoom={16}
              />
            </div>
          )}

          {selectedTab === 'documents' && (
            <div className="space-y-6">
              {/* Deforestation-free Docs */}
              {record.deforestationFreeDocs && record.deforestationFreeDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Deforestation-free Documents</h4>
                  <div className="space-y-2">
                    {record.deforestationFreeDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Compliance Docs */}
              {record.legalComplianceDocs && record.legalComplianceDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Legal Compliance Documents</h4>
                  <div className="space-y-2">
                    {record.legalComplianceDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Documents Message */}
              {(!record.deforestationFreeDocs || record.deforestationFreeDocs.length === 0) &&
               (!record.legalComplianceDocs || record.legalComplianceDocs.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No documents uploaded for this record</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ---------- Main InformationRequirements Component ----------
const InformationRequirements = () => {
  const isLoaded = useGoogleMapsLoaded();
  const { user, demoData, updateUser } = useUserStore();

  // Determine role
  const isVerifier = user?.role === 'verifier' && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;
  const targetCompany = isVerifier
    ? demoData.users[companyId]  // The exporter the verifier is reviewing
    : user;                      // The exporter themselves (if logged in as exporter)

  // Facilities (production/forest sites) from target company
  const facilities = targetCompany?.facilities?.filter(f => f.type === 'production/forest site') || [];

  // Importers linked to the target company (for exporter view)
  const importers = (targetCompany?.importers || [])
    .map(id => demoData.users[id])
    .filter(i => i && i.role === 'importer');

  // ---------- Exporter state ----------
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    documentType: '',
    fieldId: ''
  });

  // Form state for new record
  const [formData, setFormData] = useState({
    description: '',
    commonName: '',
    scientificName: '',
    hsCodes: [],
    netMassKg: '',
    productionLocation: '',
    plantingAreas: [],
    productionDateRange: {
      from: '',
      to: ''
    },
    customerId: null,
    customerName: '',
    customerAddress: '',
    customerEmail: '',
    deforestationFreeDocs: [],
    legalComplianceDocs: [],
    amount: 0,
    paymentStatus: false
  });

  // Dirty state for exporter
  const [initialFormData, setInitialFormData] = useState({ ...formData });
  const [isSaving, setIsSaving] = useState(false);

  // ---------- Verifier state (tab-level) ----------
  const [verificationStatus, setVerificationStatus] = useState(null); // 'compliant' | 'non-compliant'
  const [verificationNotes, setVerificationNotes] = useState([]);
  const [initialVerificationStatus, setInitialVerificationStatus] = useState(null);
  const [initialVerificationNotes, setInitialVerificationNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // State to control expanded facilities in verifier view
  const [expandedFacilities, setExpandedFacilities] = useState(new Set());

  // ---------- Verification history for exporter ----------
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // ---------- Load facility data when exporter selects one ----------
  useEffect(() => {
    if (selectedFacility && !isVerifier) {
      const location = selectedFacility.address || '';
      setFormData(prev => ({ ...prev, productionLocation: location }));
      // No need to load initial form data for existing records; handled by create/edit
    }
  }, [selectedFacility, isVerifier]);

  // ---------- Load verifier's existing verification ----------
  useEffect(() => {
    if (isVerifier && targetCompany && user) {
      const reports = user.verificationReports || [];
      const report = reports.find(r => r.companyId === targetCompany.id);
      if (report) {
        // Tab identifier in store is "informationRequirements" (camelCase)
        const artFindings = report.findings?.find(f => f.tab === 'informationRequirements');
        if (artFindings) {
          setVerificationStatus(artFindings.status || null);
          setVerificationNotes(artFindings.articles?.find(a => a.article === 'article-9')?.notes || []);
          setInitialVerificationStatus(artFindings.status || null);
          setInitialVerificationNotes(artFindings.articles?.find(a => a.article === 'article-9')?.notes || []);
        }
      }
    }
  }, [isVerifier, targetCompany, user]);

  // ---------- Load verification history for exporter ----------
  useEffect(() => {
    if (!isVerifier && targetCompany) {
      const linkedVerifiers = targetCompany.linkedVerifiers || [];
      const history = [];

      linkedVerifiers.forEach(verifierLink => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier || !verifier.verificationReports) return;

        const report = verifier.verificationReports.find(r => r.companyId === targetCompany.id);
        if (report) {
          const artFindings = report.findings?.find(f => f.tab === 'informationRequirements');
          if (artFindings) {
            const notes = artFindings.articles?.find(a => a.article === 'article-9')?.notes || [];
            if (notes.length > 0 || artFindings.status) {
              history.push({
                verifierName: verifier.basicInfo?.firstName 
                  ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}` 
                  : verifier.basicInfo?.email || verifier.id,
                status: artFindings.status,
                notes: notes,
                date: report.date
              });
            }
          }
        }
      });

      setVerificationHistory(history);
    }
  }, [isVerifier, targetCompany, demoData]);

  // ---------- Dirty check for exporter ----------
  const hasExporterChanges = () => {
    // For simplicity, we compare formData with initialFormData (but we don't track initial for new records)
    // In a real app, you'd track initial state more thoroughly.
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // ---------- Dirty check for verifier ----------
  const hasVerificationChanges = () => {
    return (
      verificationStatus !== initialVerificationStatus ||
      JSON.stringify(verificationNotes) !== JSON.stringify(initialVerificationNotes)
    );
  };

  // ---------- Get existing records for selected facility and year ----------
  const getExistingRecords = () => {
    if (!selectedFacility || !selectedYear) return [];
    return selectedFacility.pastRecords?.[selectedYear] || [];
  };

  const existingRecords = getExistingRecords();

  // ---------- Handlers for exporter ----------
  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setIsCreating(false);
    setIsEditing(false);
    setCurrentRecord(null);
    
    // Set production location from facility address
    setFormData(prev => ({
      ...prev,
      productionLocation: facility.address || ''
    }));
    setInitialFormData({ ...formData, productionLocation: facility.address || '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Calculate payment when netMassKg changes
    if (field === 'netMassKg') {
      const quantity = parseFloat(value) || 0;
      const units = Math.ceil(quantity / 20000);
      const paymentAmount = units * 10;
      setFormData(prev => ({
        ...prev,
        amount: paymentAmount
      }));
    }
  };

  const handleDateChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      productionDateRange: {
        ...prev.productionDateRange,
        [type]: value
      }
    }));
  };

  const handleHSCodeSelect = (hsCode) => {
    setFormData(prev => ({
      ...prev,
      hsCodes: [...prev.hsCodes, hsCode]
    }));
  };

  const handleHSCodeRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      hsCodes: prev.hsCodes.filter((_, i) => i !== index)
    }));
  };

  const handleImporterSelect = (importer) => {
    setFormData(prev => ({
      ...prev,
      customerId: importer.id,
      customerName: importer.basicInfo.companyName,
      customerAddress: importer.basicInfo.country,
      customerEmail: importer.basicInfo.email
    }));
  };

  const handleImporterClear = () => {
    setFormData(prev => ({
      ...prev,
      customerId: null,
      customerName: '',
      customerAddress: '',
      customerEmail: ''
    }));
  };

  const handleDocumentUpload = (fieldId, document) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), document]
    }));
  };

  const removeDocument = (fieldId, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, i) => i !== index)
    }));
  };

  const handlePlantingAreasChange = (areas) => {
    setFormData(prev => ({
      ...prev,
      plantingAreas: areas
    }));
  };

  const handleSaveRecord = () => {
    if (!selectedFacility || !selectedYear) return;

    // Validate required fields
    if (!formData.description || !formData.commonName || !formData.scientificName || 
        formData.hsCodes.length === 0 || !formData.netMassKg || !formData.customerId) {
      alert('Please fill in all required fields');
      return;
    }

    // Generate record ID
    const recordId = `record-${selectedYear}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total hectares from planting areas
    const totalHectares = formData.plantingAreas.reduce((sum, area) => sum + (area.hectares || 0), 0);

    // Create new record object
    const newRecord = {
      id: recordId,
      ...formData,
      netMassKg: parseFloat(formData.netMassKg),
      amount: formData.amount,
      paymentStatus: false,
      totalHectares: totalHectares
    };

    // Update the facility's pastRecords
    const updatedFacility = { ...selectedFacility };
    
    if (!updatedFacility.pastRecords) {
      updatedFacility.pastRecords = { 2021: [], 2022: [], 2023: [], 2024: [], 2025: [] };
    }
    
    if (!updatedFacility.pastRecords[selectedYear]) {
      updatedFacility.pastRecords[selectedYear] = [];
    }
    
    updatedFacility.pastRecords[selectedYear].push(newRecord);

    // Update the user's facilities array
    const updatedFacilities = targetCompany.facilities.map(facility => 
      facility.id === selectedFacility.id ? updatedFacility : facility
    );

    const updatedUser = {
      ...targetCompany,
      facilities: updatedFacilities
    };

    updateUser(targetCompany.id, updatedUser);

    // Update local state
    setSelectedFacility(updatedFacility);
    setIsCreating(false);
    
    // Reset form
    setFormData({
      description: '',
      commonName: '',
      scientificName: '',
      hsCodes: [],
      netMassKg: '',
      productionLocation: selectedFacility.address || '',
      plantingAreas: [],
      productionDateRange: {
        from: '',
        to: ''
      },
      customerId: null,
      customerName: '',
      customerAddress: '',
      customerEmail: '',
      deforestationFreeDocs: [],
      legalComplianceDocs: [],
      amount: 0,
      paymentStatus: false
    });

    alert('Record saved successfully!');
  };

  const handlePayment = (record) => {
    if (!selectedFacility || !selectedYear) return;

    // Update record payment status
    const updatedFacility = { ...selectedFacility };
    const records = updatedFacility.pastRecords[selectedYear] || [];
    const recordIndex = records.findIndex(r => r.id === record.id);
    
    if (recordIndex !== -1) {
      records[recordIndex].paymentStatus = true;
      
      // Also update the connectedPastRecords for the importer
      if (record.customerId) {
        const importer = demoData.users[record.customerId];
        if (importer) {
          const updatedImporter = { ...importer };
          
          if (!updatedImporter.connectedPastRecords) {
            updatedImporter.connectedPastRecords = [];
          }
          
          // Add to connectedPastRecords
          updatedImporter.connectedPastRecords.push({
            recordId: record.id,
            exporterId: targetCompany.id,
            year: selectedYear,
            facilityId: selectedFacility.id
          });
          
          updateUser(importer.id, updatedImporter);
        }
      }
      
      updatedFacility.pastRecords[selectedYear] = records;
      
      // Update user
      const updatedFacilities = targetCompany.facilities.map(facility => 
        facility.id === selectedFacility.id ? updatedFacility : facility
      );
      
      const updatedUser = {
        ...targetCompany,
        facilities: updatedFacilities
      };
      
      updateUser(targetCompany.id, updatedUser);
      setSelectedFacility(updatedFacility);
    }
    
    alert(`Payment of $${record.amount} processed successfully!`);
  };

  const handleViewRecord = (record) => {
    setViewingRecord(record);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setCurrentRecord(null);
    const newFormData = {
      description: '',
      commonName: '',
      scientificName: '',
      hsCodes: [],
      netMassKg: '',
      productionLocation: selectedFacility?.address || '',
      plantingAreas: [],
      productionDateRange: {
        from: '',
        to: ''
      },
      customerId: null,
      customerName: '',
      customerAddress: '',
      customerEmail: '',
      deforestationFreeDocs: [],
      legalComplianceDocs: [],
      amount: 0,
      paymentStatus: false
    };
    setFormData(newFormData);
    setInitialFormData(newFormData);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentRecord(null);
  };

  // ---------- Handlers for verifier ----------
  const handleAddNote = () => {
    if (newNote.trim()) {
      setVerificationNotes([...verificationNotes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index) => {
    setVerificationNotes(verificationNotes.filter((_, i) => i !== index));
  };

  const handleSaveVerification = () => {
    if (!targetCompany || !user) return;

    const verifierId = user.id;
    const baseVerifier = demoData.users[verifierId];
    if (!baseVerifier) return;

    let reports = [...(baseVerifier.verificationReports || [])];
    let reportIndex = reports.findIndex(r => r.companyId === targetCompany.id);

    const artFindings = {
      tab: 'informationRequirements', // Match store key
      status: verificationStatus || 'non-compliant',
      articles: [
        {
          article: 'article-9',
          notes: verificationNotes
        }
      ]
    };

    if (reportIndex >= 0) {
      const report = reports[reportIndex];
      let findings = report.findings || [];
      const existingIdx = findings.findIndex(f => f.tab === 'informationRequirements');
      if (existingIdx >= 0) {
        findings[existingIdx] = artFindings;
      } else {
        findings.push(artFindings);
      }
      reports[reportIndex] = { ...report, findings };
    } else {
      const newReport = {
        id: `ver-report-${Date.now()}`,
        companyId: targetCompany.id,
        companyType: targetCompany.role,
        date: new Date().toISOString().split('T')[0],
        type: 'compliance audit',
        status: 'pending',
        findings: [artFindings]
      };
      reports.push(newReport);
    }

    const updatedVerifier = { ...baseVerifier, verificationReports: reports, loggedInAs: user.loggedInAs };
    updateUser(verifierId, updatedVerifier);

    setInitialVerificationStatus(verificationStatus);
    setInitialVerificationNotes(verificationNotes);
    alert("Verification saved successfully!");
  };

  const toggleFacility = (facilityId) => {
    const newExpanded = new Set(expandedFacilities);
    if (newExpanded.has(facilityId)) {
      newExpanded.delete(facilityId);
    } else {
      newExpanded.add(facilityId);
    }
    setExpandedFacilities(newExpanded);
  };

  const filteredFacilities = facilities.filter(f =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!targetCompany) {
    return (<div className="p-6 text-center"><p className="text-gray-600">Loading company data...</p></div>);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Title Section with Verification Notes Button */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">
            5 YEARS MINIMUM PAST RECORDS
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Documents and data of shipments, forest, management permits and approvals since 2021.
            Year 2021 is the cut off date for deforestation.
          </p>
        </div>
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

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">
              Important Notice:
            </p>
            <p className="text-amber-700 text-sm">
              All users/Exporters are to pay $10 per 20,000kg for 2021 till date records of past shipment whether authenticated or not.
            </p>
          </div>
        </div>
      </div>

      {/* Verifier View: Collapsible Forest Cards with Verification Panel */}
      {isVerifier ? (
        <div className="space-y-6">
          {/* Tab-level verification status and notes */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Article 9 Compliance</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                verificationStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                verificationStatus === 'non-compliant' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {verificationStatus ? verificationStatus.replace('-', ' ') : 'Not set'}
              </span>
            </div>

            <div className="mb-4 flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="status" value="compliant" checked={verificationStatus === 'compliant'} onChange={() => setVerificationStatus('compliant')} className="text-green-600" /><span>Compliant</span></label>
              <label className="flex items-center gap-2"><input type="radio" name="status" value="non-compliant" checked={verificationStatus === 'non-compliant'} onChange={() => setVerificationStatus('non-compliant')} className="text-red-600" /><span>Non‑compliant</span></label>
            </div>

            {verificationNotes.length > 0 && (
              <div className="mb-4 space-y-2">
                {verificationNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <MessageSquare size={18} className="text-gray-400 mt-0.5" />
                    <span className="flex-1 text-gray-700">{note}</span>
                    <button onClick={() => handleRemoveNote(idx)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              <button onClick={handleAddNote} disabled={!newNote.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Add Note</button>
            </div>
          </div>

          {/* Facilities List with Collapsible Cards */}
          <div className="space-y-4">
            {facilities.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl shadow-lg border border-green-100">
                <Trees className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No production sites found for this exporter.</p>
              </div>
            ) : (
              facilities.map(facility => {
                const isExpanded = expandedFacilities.has(facility.id);
                const facilityRecordsByYear = years.reduce((acc, year) => {
                  acc[year] = facility.pastRecords?.[year] || [];
                  return acc;
                }, {});

                return (
                  <div key={facility.id} className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
                    {/* Facility Header */}
                    <button
                      onClick={() => toggleFacility(facility.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-6 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trees className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">{facility.name}</h3>
                          <p className="text-sm text-gray-600">{facility.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 text-sm">
                          <span className="text-gray-600">Total Area: {facility.totalHectares || 0} ha</span>
                          <span className="text-gray-600">Records: {Object.values(facilityRecordsByYear).flat().length}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 sm:p-6 border-t border-green-100">
                        {/* Year tabs and records */}
                        <div className="space-y-6">
                          {years.map(year => {
                            const records = facility.pastRecords?.[year] || [];
                            if (records.length === 0) return null;

                            return (
                              <div key={year} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Year {year}</h4>
                                <div className="space-y-3">
                                  {records.map(record => (
                                    <RecordCard
                                      key={record.id}
                                      record={record}
                                      year={year}
                                      onView={handleViewRecord}
                                      onPayment={() => {}} // No payment in verifier view
                                      isPaid={record.paymentStatus}
                                      viewOnly={true}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {Object.values(facilityRecordsByYear).flat().length === 0 && (
                            <p className="text-gray-500 italic">No records for this facility.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Save Verification Button */}
          <div className="flex justify-end pt-4">
            <button onClick={handleSaveVerification} disabled={!hasVerificationChanges()} className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!hasVerificationChanges() ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              <Save size={20} /> Save Verification
            </button>
          </div>
        </div>
      ) : (
        /* ---------- Exporter View (unchanged) ---------- */
        <>
          {/* Facility Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trees className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Select Production Site / Forest Area
              </h2>
            </div>

            <div className="relative mb-6">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  {selectedFacility ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <span className="font-medium text-gray-900">{selectedFacility.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({selectedFacility.address})</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="text-gray-500">Select a production site...</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
                  {/* Search */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sites..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto max-h-64">
                    {facilities.length > 0 ? (
                      facilities
                        .filter(facility => facility.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(facility => (
                          <button
                            key={facility.id}
                            onClick={() => handleFacilitySelect(facility)}
                            className="w-full flex items-start p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${selectedFacility?.id === facility.id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="ml-3 text-left">
                              <div className="font-medium text-gray-900">{facility.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{facility.address}</div>
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No production sites found. Please add a production site first.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedFacility && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">{selectedFacility.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Address: </span>
                        <span className="font-medium">{selectedFacility.address}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Area: </span>
                        <span className="font-medium">{selectedFacility.totalHectares || 0} hectares</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Year Selection and Records Display */}
          {selectedFacility && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Information requirements according to Article 9 EUDR:
              </h3>

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedYear === year
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                
                {!isCreating && !isEditing && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Record
                  </button>
                )}
              </div>

              {/* Existing Records List */}
              {!isCreating && !isEditing && existingRecords.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Existing Records for {selectedYear}</h4>
                  <div className="space-y-3">
                    {existingRecords.map(record => (
                      <RecordCard
                        key={record.id}
                        record={record}
                        year={selectedYear}
                        onView={handleViewRecord}
                        onPayment={handlePayment}
                        isPaid={record.paymentStatus}
                        viewOnly={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isCreating && !isEditing && existingRecords.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No records found for {selectedYear}</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Create New Record" to add one</p>
                </div>
              )}

              {/* New/Edit Record Form */}
              {(isCreating || isEditing) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border-t pt-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                      </button>
                      <h4 className="text-xl font-bold text-green-700">
                        {isCreating ? 'Create New Record' : 'Edit Record'} - {selectedYear}
                      </h4>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* 1. Description */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1. Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={4}
                        placeholder="Enter product description including trade name, type, and list of commodities..."
                      />
                    </div>

                    {/* 2. Species Information */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Species Information *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Common Name
                          </label>
                          <input
                            type="text"
                            value={formData.commonName}
                            onChange={(e) => handleInputChange('commonName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Mahogany, Oak, Pine"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Scientific Name
                          </label>
                          <input
                            type="text"
                            value={formData.scientificName}
                            onChange={(e) => handleInputChange('scientificName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Swietenia macrophylla"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. HS Code */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3. HS Code *
                      </label>
                      <HSCodeSelector
                        selectedCodes={formData.hsCodes}
                        onSelect={handleHSCodeSelect}
                        onRemove={handleHSCodeRemove}
                        supportedProducts={selectedFacility.supportedProducts || []}
                        disabled={false}
                      />
                    </div>

                    {/* 4. Quantity */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        4. Total Quantity (Kilograms) *
                      </label>
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.netMassKg}
                            onChange={(e) => handleInputChange('netMassKg', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-24"
                            placeholder="e.g., 50000"
                            min="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500">kg</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Note: Payment is calculated at $10 per 20,000kg
                        </p>
                      </div>

                      {/* Payment Preview */}
                      {formData.netMassKg > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Estimated Payment:</span>
                            <span className="text-lg font-bold text-green-700">${formData.amount}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Based on {Math.ceil(parseFloat(formData.netMassKg) / 20000)} units of 20,000kg
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 5. Production Location */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        5. Production Location *
                      </label>
                      <input
                        type="text"
                        value={formData.productionLocation}
                        onChange={(e) => handleInputChange('productionLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-100"
                        readOnly
                        placeholder="Auto-filled from facility address"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This is auto-filled from the selected facility's address
                      </p>
                    </div>

                    {/* 6. Geolocation - Planting Areas */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        6. Planting Areas (Geolocation)
                      </label>
                      
                      <PolygonMapComponent
                        isLoaded={isLoaded}
                        coordinates={formData.plantingAreas}
                        onCoordinatesChange={handlePlantingAreasChange}
                        facilityAreas={selectedFacility.areas || []}
                        facilityName={selectedFacility.name}
                        facilityAddress={selectedFacility.address}
                        viewOnly={false}
                      />
                    </div>

                    {/* 7. Production Date Range */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        7. Production Date Range
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">From date</label>
                          <input
                            type="date"
                            value={formData.productionDateRange.from}
                            onChange={(e) => handleDateChange('from', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">To date</label>
                          <input
                            type="date"
                            value={formData.productionDateRange.to}
                            onChange={(e) => handleDateChange('to', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 8. Customer Information */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        8. Customer Information *
                      </label>
                      
                      <ImporterSelector
                        importers={importers}
                        selectedImporter={formData.customerId ? importers.find(i => i.id === formData.customerId) : null}
                        onSelect={handleImporterSelect}
                        onClear={handleImporterClear}
                        disabled={false}
                      />
                      
                      {!formData.customerId && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-700">
                            Please select an importer from the dropdown above. The name, address, and email will be auto-filled.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 9. Deforestation-free Documentation */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          9. Deforestation-free Documents
                        </label>
                        <button
                          onClick={() => setUploadModal({ isOpen: true, documentType: 'Deforestation-free verification', fieldId: 'deforestationFreeDocs' })}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Document
                        </button>
                      </div>

                      {/* Uploaded Documents */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.deforestationFreeDocs.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm font-medium">{doc.name}</span>
                              <button
                                onClick={() => removeDocument('deforestationFreeDocs', index)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 10. Legal Compliance Documentation */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          10. Legal Compliance Documents
                        </label>
                        <button
                          onClick={() => setUploadModal({ isOpen: true, documentType: 'Compliance verification', fieldId: 'legalComplianceDocs' })}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Document
                        </button>
                      </div>

                      {/* Uploaded Documents */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.legalComplianceDocs.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm font-medium">{doc.name}</span>
                              <button
                                onClick={() => removeDocument('legalComplianceDocs', index)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveRecord}
                        className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <Save className="w-5 h-5" />
                        Save Record
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}

      {/* Document Upload Modal (exporter only) */}
      {uploadModal.isOpen && !isVerifier && (
        <DocumentUploadModal
          isOpen={uploadModal.isOpen}
          onClose={() => setUploadModal({ isOpen: false, documentType: '', fieldId: '' })}
          documentType={uploadModal.documentType}
          onUpload={(document) => {
            if (uploadModal.fieldId) {
              handleDocumentUpload(uploadModal.fieldId, document);
            }
          }}
        />
      )}

      {/* Record Detail Modal */}
      {viewingRecord && (
        <RecordDetailModal
          record={viewingRecord}
          year={selectedYear}
          facility={selectedFacility}
          onClose={() => setViewingRecord(null)}
          viewOnly={isVerifier}
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
                          item.status === 'compliant'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'non-compliant'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status ? item.status.replace('-', ' ') : 'Not set'}
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

export default InformationRequirements;  
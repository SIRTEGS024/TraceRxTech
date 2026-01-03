import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Trash2
} from 'lucide-react';

// For the map - we'll use Google Maps
import { GoogleMap, Autocomplete, Polygon, DrawingManager } from '@react-google-maps/api';

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

// Mock forest data
const mockForests = [
  {
    id: 1,
    name: "Amazon Rainforest - Brazil Sector",
    coordinates: { lat: -3.4653, lng: -62.2159 },
    area: "5.5M hectares",
    country: "Brazil",
    region: "South America"
  },
  {
    id: 2,
    name: "Congo Basin Forest",
    coordinates: { lat: 0.2280, lng: 15.8277 },
    area: "3.0M hectares",
    country: "Democratic Republic of Congo",
    region: "Central Africa"
  },
  {
    id: 3,
    name: "Borneo Rainforest",
    coordinates: { lat: 0.9619, lng: 114.5548 },
    area: "2.2M hectares",
    country: "Indonesia",
    region: "Southeast Asia"
  }
];

// Years to cover
const years = [2020, 2021, 2022, 2023, 2024, 2025];

// HS Codes data - grouped by commodity
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

// Countries list for dropdown
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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
      onUpload({
        name: documentName.trim(),
        file: selectedFile,
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

// HS Code Selector Component
const HSCodeSelector = ({ selectedCodes, onSelect, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommodities = commoditiesData.filter(commodity =>
    commodity.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commodity.products.some(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.includes(searchQuery)
    )
  );

  const handleSelect = (code, name) => {
    if (!selectedCodes.some(c => c.code === code)) {
      onSelect({ code, name });
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
                <button
                  onClick={() => onRemove(index)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No HS codes selected</p>
        )}
      </div>

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-white text-left"
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400" />
          <span className="text-gray-700">
            {selectedCodes.length > 0
              ? `${selectedCodes.length} HS Code${selectedCodes.length > 1 ? 's' : ''} selected`
              : 'Select HS Code(s)'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
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
                        onClick={() => handleSelect(product.code, product.name)}
                        disabled={selectedCodes.some(c => c.code === product.code)}
                        className={`w-full flex items-start p-3 hover:bg-gray-50 transition-colors text-left ${selectedCodes.some(c => c.code === product.code) ? 'bg-green-50' : ''
                          }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${selectedCodes.some(c => c.code === product.code) ? 'bg-green-500' : 'bg-gray-300'
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
                No HS codes found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Coordinate Input Component
const CoordinateInput = ({ coordinates = [], onCoordinatesChange }) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        if (editingIndex !== null) {
          // Update existing coordinate
          const newCoords = [...coordinates];
          newCoords[editingIndex] = { lat: latNum, lng: lngNum };
          onCoordinatesChange(newCoords);
          setEditingIndex(null);
        } else {
          // Add new coordinate
          onCoordinatesChange([...coordinates, { lat: latNum, lng: lngNum }]);
        }
        setLat('');
        setLng('');
      }
    }
  };

  const handleEdit = (index) => {
    setLat(coordinates[index].lat.toString());
    setLng(coordinates[index].lng.toString());
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const newCoords = coordinates.filter((_, i) => i !== index);
    onCoordinatesChange(newCoords);
    if (editingIndex === index) {
      setEditingIndex(null);
      setLat('');
      setLng('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setLat('');
    setLng('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., 9.12345"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., 7.12345"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!lat || !lng}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {editingIndex !== null ? 'Update Coordinate' : 'Add Coordinate'}
        </button>
        {editingIndex !== null && (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {coordinates.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Plot Coordinates ({coordinates.length} points)</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {coordinates.map((coord, index) => (
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
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete"
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

// Map Component for Polygon Drawing - UPDATED
const PolygonMapComponent = ({ coordinates = [], onCoordinatesChange, isLoaded }) => {
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
  const autocompleteRef = useRef(null);

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
    const paths = polygon.getPath();
    const coords = [];

    for (let i = 0; i < paths.getLength(); i++) {
      const point = paths.getAt(i);
      coords.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }

    onCoordinatesChange(coords);
    polygon.setMap(null); // Remove the drawn polygon
    drawingManager.setDrawingMode(null); // Exit drawing mode
    setIsDrawing(false);
  }, [drawingManager, onCoordinatesChange]);

  const startDrawing = () => {
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

  const clearPolygon = () => {
    onCoordinatesChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-700">Plot Boundary Map</h4>
        </div>
        <div className="flex gap-2">
          {!isDrawing && coordinates.length === 0 && (
            <button
              onClick={startDrawing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
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
          {coordinates.length > 0 && (
            <button
              onClick={clearPolygon}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Plot
            </button>
          )}
        </div>
      </div>

      <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={coordinates.length > 0 ? coordinates[0] : { lat: 0, lng: 0 }}
          zoom={coordinates.length > 0 ? 12 : 2}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'satellite',
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
          }}
        >
          {/* Drawing Manager */}
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

          {/* Display saved polygon */}
          {coordinates.length >= 3 && (
            <Polygon
              paths={coordinates}
              options={{
                fillColor: '#22c55e',
                fillOpacity: 0.3,
                strokeColor: '#16a34a',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Search overlay */}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-800 mb-1">Instructions</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click "Draw Plot Boundary" to start drawing your forest plot area</li>
              <li>• Alternatively, enter latitude/longitude coordinates manually</li>
              <li>• A polygon requires at least 3 points to form a closed shape</li>
              <li>• You can also search for locations using the search bar on the map</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const InformationRequirements = () => {
  // USE THE CUSTOM HOOK INSTEAD OF useJsApiLoader
  const isLoaded = useGoogleMapsLoaded();

  // State management
  const [selectedForest, setSelectedForest] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2020);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({});
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    documentType: '',
    fieldId: ''
  });

  // Initialize form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('eudr_information_requirements');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save form data to localStorage
  const saveData = (forestId, year, data) => {
    const newFormData = {
      ...formData,
      [`${forestId}_${year}`]: data
    };
    setFormData(newFormData);
    localStorage.setItem('eudr_information_requirements', JSON.stringify(newFormData));
  };

  // Get current form data
  const currentData = selectedForest ? formData[`${selectedForest.id}_${selectedYear}`] || {} : {};

  // Filter forests based on search
  const filteredForests = mockForests.filter(forest =>
    forest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    forest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (!selectedForest) return;

    const updatedData = {
      ...currentData,
      [field]: value
    };
    saveData(selectedForest.id, selectedYear, updatedData);
  };

  // Handle HS Code selection
  const handleHSCodeSelect = (hsCode) => {
    if (!selectedForest) return;

    const currentCodes = currentData.hsCodes || [];
    const updatedCodes = [...currentCodes, hsCode];

    const updatedData = {
      ...currentData,
      hsCodes: updatedCodes
    };
    saveData(selectedForest.id, selectedYear, updatedData);
  };

  // Handle HS Code removal
  const handleHSCodeRemove = (index) => {
    if (!selectedForest) return;

    const currentCodes = currentData.hsCodes || [];
    const updatedCodes = currentCodes.filter((_, i) => i !== index);

    const updatedData = {
      ...currentData,
      hsCodes: updatedCodes
    };
    saveData(selectedForest.id, selectedYear, updatedData);
  };

  // Handle document upload
  const handleDocumentUpload = (fieldId, document) => {
    if (!selectedForest) return;

    const currentDocuments = currentData[fieldId] || [];
    const updatedDocuments = [...currentDocuments, document];

    const updatedData = {
      ...currentData,
      [fieldId]: updatedDocuments
    };
    saveData(selectedForest.id, selectedYear, updatedData);
  };

  // Remove document
  const removeDocument = (fieldId, index) => {
    if (!selectedForest) return;

    const currentDocuments = currentData[fieldId] || [];
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);

    const updatedData = {
      ...currentData,
      [fieldId]: updatedDocuments
    };
    saveData(selectedForest.id, selectedYear, updatedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">
          5 YEARS MINIMUM PAST RECORDS
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          Documents and data of shipments, forest, management permits and approvals since 2020.
          Year 2020 is the cut off date for deforestation.
        </p>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">
                Important Notice:
              </p>
              <p className="text-amber-700 text-sm">
                All users/Exporters are to pay $5 per container or per 20 metric tons
                for 2020 till date records of past shipment whether authenticated or not.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forest Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trees className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Select Forest Area
          </h2>
        </div>

        {/* Dropdown */}
        <div className="relative mb-6">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors bg-white text-left"
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
                    placeholder="Search forests..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto max-h-64">
                {filteredForests.map(forest => (
                  <button
                    key={forest.id}
                    onClick={() => {
                      setSelectedForest(forest);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-start p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${selectedForest?.id === forest.id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="ml-3 text-left">
                      <div className="font-medium text-gray-900">{forest.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{forest.country} • {forest.area}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Forest Details */}
        {selectedForest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">{selectedForest.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Coordinates: </span>
                    <span className="font-medium">
                      {selectedForest.coordinates.lat.toFixed(4)}°, {selectedForest.coordinates.lng.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Area: </span>
                    <span className="font-medium">{selectedForest.area}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Year Selection */}
      {selectedForest && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Information requirements according to Article 9 EUDR:
          </h3>

          <div className="flex flex-wrap gap-2 mb-6">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg border transition-colors ${selectedYear === year
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                  }`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-green-700">
              {selectedYear}: Information requirements according to Article 9 EUDR
            </h4>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* 1. Product Description */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. a description, including the trade name and type of the relevant products. the product description shall include the list of relevant commodities or relevant products contained therein or used to make those products
              </label>
              <textarea
                value={currentData.productDescription || ''}
                onChange={(e) => handleInputChange('productDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                placeholder="Enter product description including trade name, type, and list of commodities..."
              />
            </div>

            {/* 2. Species Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. as well as, in the case of relevant products that contain or have been made using wood
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    a. the common name of the species
                  </label>
                  <input
                    type="text"
                    value={currentData.commonName || ''}
                    onChange={(e) => handleInputChange('commonName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Oak, Pine, Teak"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    b. and their full scientific name
                  </label>
                  <input
                    type="text"
                    value={currentData.scientificName || ''}
                    onChange={(e) => handleInputChange('scientificName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Quercus robur, Pinus sylvestris"
                  />
                </div>
              </div>
            </div>

            {/* 3. HS Code */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. HS Code
              </label>
              <HSCodeSelector
                selectedCodes={currentData.hsCodes || []}
                onSelect={handleHSCodeSelect}
                onRemove={handleHSCodeRemove}
              />
            </div>

            {/* 4. Quantity */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4. the quantity of the relevant products in Kilograms; net mass, volume, number of items
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Net mass (Kilograms)</label>
                  <input
                    type="number"
                    value={currentData.netMass || ''}
                    onChange={(e) => handleInputChange('netMass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 10000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    value={currentData.volume || ''}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Number of items</label>
                  <input
                    type="number"
                    value={currentData.numberOfItems || ''}
                    onChange={(e) => handleInputChange('numberOfItems', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>
            </div>

            {/* 5. Country of Production */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                5. the country of production and, where relevant, parts thereof
              </label>
              <select
                value={currentData.countryOfProduction || ''}
                onChange={(e) => handleInputChange('countryOfProduction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select country of production</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* 6. Geolocation */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6. the geolocation of all plots of land where the relevant commodities that the relevant product contains, or has been made using, were produced
              </label>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Enter Plot Coordinates</h4>
                <CoordinateInput
                  coordinates={currentData.plotCoordinates || []}
                  onCoordinatesChange={(coords) => handleInputChange('plotCoordinates', coords)}
                />
              </div>

              <PolygonMapComponent
                isLoaded={isLoaded}
                coordinates={currentData.plotCoordinates || []}
                onCoordinatesChange={(coords) => handleInputChange('plotCoordinates', coords)}
              />

              {(currentData.plotCoordinates || []).length >= 3 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Plot boundary defined with {currentData.plotCoordinates.length} coordinates
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    The polygon will be saved and displayed when you return to this section.
                  </p>
                </div>
              )}
            </div>

            {/* 7. Date of Production */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                7. the date or time range of production
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">From date</label>
                  <input
                    type="date"
                    value={currentData.productionDateFrom || ''}
                    onChange={(e) => handleInputChange('productionDateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">To date</label>
                  <input
                    type="date"
                    value={currentData.productionDateTo || ''}
                    onChange={(e) => handleInputChange('productionDateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* 9. Supplier Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                9. the name, postal address and email address of any business or person from whom they have been supplied with the relevant products
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={currentData.supplierName || ''}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Postal address</label>
                  <textarea
                    value={currentData.supplierAddress || ''}
                    onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    placeholder="Enter supplier postal address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email address</label>
                  <input
                    type="email"
                    value={currentData.supplierEmail || ''}
                    onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter supplier email address"
                  />
                </div>
              </div>
            </div>

            {/* 10. Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                10. the name, postal address and email address of any business, operator or trader to whom the relevant products have been supplied
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={currentData.customerName || ''}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Postal address</label>
                  <textarea
                    value={currentData.customerAddress || ''}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    placeholder="Enter customer postal address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email address</label>
                  <input
                    type="email"
                    value={currentData.customerEmail || ''}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter customer email address"
                  />
                </div>
              </div>
            </div>

            {/* 11. Deforestation-free Documentation */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  11. adequately conclusive and verifiable information, data and documents that the relevant products are deforestation-free
                </label>
                <button
                  onClick={() => setUploadModal({ isOpen: true, documentType: 'Deforestation-free verification', fieldId: 'deforestationDocs' })}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Document
                </button>
              </div>

              {/* Uploaded Documents */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {(currentData.deforestationDocs || []).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{doc.name}</span>
                      <button
                        onClick={() => removeDocument('deforestationDocs', index)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 12. Compliance Documentation */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  12. adequately conclusive and verifiable information, data and documents that the relevant commodities have been produced in accordance with the relevant legislation of the country of production, including any arrangement conferring the right to use the respective area for the purposes of the production of the relevant commodity
                </label>
                <button
                  onClick={() => setUploadModal({ isOpen: true, documentType: 'Compliance verification', fieldId: 'complianceDocs' })}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Document
                </button>
              </div>

              {/* Uploaded Documents */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {(currentData.complianceDocs || []).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{doc.name}</span>
                      <button
                        onClick={() => removeDocument('complianceDocs', index)}
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
                onClick={() => {
                  // Data is auto-saved, just show confirmation
                  alert('Data saved successfully!');
                }}
                className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Save Information for {selectedYear}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
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
    </motion.div>
  );
};

export default InformationRequirements;
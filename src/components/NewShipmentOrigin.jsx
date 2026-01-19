import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Trees,
  MapPin,
  Globe,
  Package,
  Ship,
  Calendar,
  Container,
  Map,
  Hash,
  Weight,
  Image as ImageIcon,
  Factory,
  Building,
  Truck,
  Box,
  Tag,
  FileDigit,
  Layers,
  Info,
  Maximize2,
  CreditCard,
  DollarSign,
  Camera,
  Video,
  RotateCw,
  Square,
  Circle,
  Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Webcam from 'react-webcam';

// UPDATED: Use the correct imports for Google Maps with provider pattern
import { GoogleMap, Polygon, Marker, DrawingManager } from '@react-google-maps/api';

// Helper function to calculate polygon area
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

// Helper function to get center of polygon
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

// Generate fixed pre-plotted areas for each forest
const generateFixedPlots = (forestId, baseLat, baseLng) => {
  const plotTemplates = [
    {
      name: "Area 1",
      coordinates: [
        { lat: baseLat + 0.1, lng: baseLng + 0.1 },
        { lat: baseLat + 0.1, lng: baseLng + 0.2 },
        { lat: baseLat + 0.2, lng: baseLng + 0.2 },
        { lat: baseLat + 0.2, lng: baseLng + 0.1 }
      ],
      locationName: "North-East Section"
    },
    {
      name: "Area 2",
      coordinates: [
        { lat: baseLat - 0.1, lng: baseLng + 0.05 },
        { lat: baseLat - 0.1, lng: baseLng + 0.15 },
        { lat: baseLat - 0.05, lng: baseLng + 0.15 },
        { lat: baseLat - 0.05, lng: baseLng + 0.05 }
      ],
      locationName: "Southern Zone"
    },
    {
      name: "Area 3",
      coordinates: [
        { lat: baseLat + 0.05, lng: baseLng - 0.15 },
        { lat: baseLat + 0.05, lng: baseLng - 0.05 },
        { lat: baseLat + 0.15, lng: baseLng - 0.05 },
        { lat: baseLat + 0.15, lng: baseLng - 0.15 }
      ],
      locationName: "Western Fields"
    }
  ];

  return plotTemplates.map((template, index) => ({
    id: `${forestId}-plot-${index + 1}`,
    name: template.name,
    coordinates: template.coordinates,
    locationName: template.locationName,
    hectares: calculatePolygonArea(template.coordinates),
    isPredefined: true
  }));
};

// Mock ports data
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

// Mock shipping lines
const shippingLines = [
  "MAERSK",
  "HAPAG_LLOYD",
  "HMM",
  "ONE",
  "EVERGREEN",
  "MSC",
  "CMA_CGM",
  "COSCO",
  "ZIM",
  "YANG_MING"
];

// Fixed commodities data - Each forest has specific commodities
const getForestCommodities = (forestId) => {
  const commoditiesMap = {
    1: [ // Amazon Rainforest
      {
        commodity: "Wood",
        products: [
          { code: "4401", name: "Fuel wood" },
          { code: "4402", name: "Wood charcoal" },
          { code: "4403", name: "Wood in the rough" },
          { code: "4407", name: "Wood sawn or chipped lengthwise" }
        ]
      },
      {
        commodity: "Rubber",
        products: [
          { code: "4001", name: "Natural rubber" },
          { code: "4005", name: "Compounded rubber" }
        ]
      }
    ],
    2: [ // Congo Basin
      {
        commodity: "Wood",
        products: [
          { code: "4403", name: "Wood in the rough" },
          { code: "4404", name: "Hoopwood; split poles" },
          { code: "4407", name: "Wood sawn or chipped lengthwise" }
        ]
      },
      {
        commodity: "Coffee",
        products: [
          { code: "ex 0901 11 00", name: "Coffee, not roasted" },
          { code: "ex 0901 12 00", name: "Coffee, decaffeinated" }
        ]
      }
    ],
    3: [ // Borneo Rainforest
      {
        commodity: "Oil palm",
        products: [
          { code: "1207 10 00", name: "Palm nuts and kernels" },
          { code: "1511", name: "Palm oil and its fractions" },
          { code: "1513 21", name: "Palm kernel oil, crude" }
        ]
      },
      {
        commodity: "Wood",
        products: [
          { code: "4401", name: "Fuel wood" },
          { code: "4402", name: "Wood charcoal" },
          { code: "4403", name: "Wood in the rough" },
          { code: "4407", name: "Wood sawn or chipped lengthwise" }
        ]
      },
      {
        commodity: "Rubber",
        products: [
          { code: "4001", name: "Natural rubber" }
        ]
      }
    ]
  };

  // Default for other forests
  return commoditiesMap[forestId] || [
    {
      commodity: "Wood",
      products: [
        { code: "4401", name: "Fuel wood" },
        { code: "4403", name: "Wood in the rough" }
      ]
    },
    {
      commodity: "Cocoa",
      products: [
        { code: "1801 00 00", name: "Cocoa beans" }
      ]
    }
  ];
};

// Updated mockForests with fixed commodities and pre-plotted areas
const mockForests = Array.from({ length: 30 }, (_, i) => {
  const baseForests = [
    {
      id: 1,
      name: "Amazon Rainforest - Brazil",
      coordinates: { lat: -3.4653, lng: -62.2159 },
      area: "5.5M hectares",
      country: "Brazil",
      region: "South America",
      commodities: getForestCommodities(1),
      documents: {
        a: [
          { id: 1, name: "Land Title.pdf", description: "Land ownership title", uploadedAt: "2024-01-15" },
          { id: 2, name: "Survey Plan.pdf", description: "Survey with coordinates", uploadedAt: "2024-01-16" }
        ],
        b: [
          { id: 1, name: "EIA Report.pdf", description: "EIA Report 2023", uploadedAt: "2024-01-17" }
        ],
        c: [
          { id: 1, name: "Forest Management.pdf", description: "5-year plan", uploadedAt: "2024-01-18" }
        ],
        d: [
          { id: 1, name: "Sublease Agreement.pdf", description: "Sublease agreement", uploadedAt: "2024-01-19" }
        ],
        e: [
          { id: 1, name: "Labor Rights.pdf", description: "Workers rights", uploadedAt: "2024-01-20" }
        ],
        f: [],
        g: [],
        h: [
          { id: 1, name: "Tax Certificate.pdf", description: "Tax compliance", uploadedAt: "2024-01-21" }
        ]
      },
      plots: generateFixedPlots(1, -3.4653, -62.2159)
    },
    {
      id: 2,
      name: "Congo Basin Forest",
      coordinates: { lat: 0.2280, lng: 15.8277 },
      area: "3.0M hectares",
      country: "DR Congo",
      region: "Central Africa",
      commodities: getForestCommodities(2),
      documents: {
        a: [
          { id: 1, name: "Purchase Receipt.pdf", description: "Land purchase", uploadedAt: "2024-02-10" }
        ],
        b: [
          { id: 1, name: "Env Approval.pdf", description: "Agency approval", uploadedAt: "2024-02-11" }
        ],
        c: [],
        d: [],
        e: [
          { id: 1, name: "Safety Protocol.pdf", description: "Safety procedures", uploadedAt: "2024-02-12" }
        ],
        f: [],
        g: [
          { id: 1, name: "FPIC Agreement.pdf", description: "Community consent", uploadedAt: "2024-02-13" }
        ],
        h: []
      },
      plots: generateFixedPlots(2, 0.2280, 15.8277)
    },
    {
      id: 3,
      name: "Borneo Rainforest",
      coordinates: { lat: 0.9619, lng: 114.5548 },
      area: "2.2M hectares",
      country: "Indonesia",
      region: "Southeast Asia",
      commodities: getForestCommodities(3),
      documents: {
        a: [
          { id: 1, name: "Title Docs.pdf", description: "Property titles", uploadedAt: "2024-03-05" }
        ],
        b: [
          { id: 1, name: "EIA Report.pdf", description: "Impact study", uploadedAt: "2024-03-06" }
        ],
        c: [
          { id: 1, name: "Biodiversity Plan.pdf", description: "Species protection", uploadedAt: "2024-03-07" }
        ],
        d: [
          { id: 1, name: "Third Party Contracts.pdf", description: "Agreements", uploadedAt: "2024-03-08" }
        ],
        e: [],
        f: [
          { id: 1, name: "Human Rights.pdf", description: "Due diligence", uploadedAt: "2024-03-09" }
        ],
        g: [],
        h: [
          { id: 1, name: "Customs Docs.pdf", description: "Trade compliance", uploadedAt: "2024-03-10" },
          { id: 2, name: "Anti-corruption.pdf", description: "Company policy", uploadedAt: "2024-03-11" }
        ]
      },
      plots: generateFixedPlots(3, 0.9619, 114.5548)
    }
  ];

  // Create additional forests for testing
  if (i >= 3) {
    const countries = ["Peru", "Colombia", "Malaysia", "Papua New Guinea", "Cameroon", "Gabon", "Vietnam", "Laos", "Myanmar", "Thailand"];
    const regions = ["South America", "Central Africa", "Southeast Asia", "Oceania", "West Africa"];
    const areaSizes = ["1.2M hectares", "800K hectares", "2.5M hectares", "1.8M hectares", "3.2M hectares"];

    const baseLat = -5 + (i * 0.5);
    const baseLng = -60 + (i * 2);

    const forest = {
      id: i + 1,
      name: `Forest Reserve ${i + 1} - ${countries[i % countries.length]}`,
      coordinates: { lat: baseLat, lng: baseLng },
      area: areaSizes[i % areaSizes.length],
      country: countries[i % countries.length],
      region: regions[i % regions.length],
      commodities: getForestCommodities(i + 1),
      documents: {},
      plots: generateFixedPlots(i + 1, baseLat, baseLng)
    };

    return forest;
  }

  return baseForests[i];
});

// Mock data for processing/loading sites
const mockProcessingSites = [
  { id: 1, name: "Port of Santos Processing Center", location: "Santos, Brazil", capacity: "500 containers/day" },
  { id: 2, name: "Manaus Timber Processing Facility", location: "Manaus, Brazil", capacity: "300 containers/day" },
  { id: 3, name: "Congo Basin Processing Plant", location: "Kinshasa, DR Congo", capacity: "200 containers/day" },
  { id: 4, name: "Borneo Wood Processing Center", location: "Pontianak, Indonesia", capacity: "400 containers/day" },
  { id: 5, name: "Lagos Port Processing Facility", location: "Lagos, Nigeria", capacity: "350 containers/day" },
  { id: 6, name: "Singapore Timber Hub", location: "Singapore", capacity: "600 containers/day" },
  { id: 7, name: "Rotterdam EU Processing Center", location: "Rotterdam, Netherlands", capacity: "800 containers/day" }
];

// Mock data for importers/consignees
const mockImporters = [
  { id: 1, name: "TimberCorp International", country: "Germany", type: "Importer" },
  { id: 2, name: "Global Wood Products Ltd", country: "USA", type: "Consignee" },
  { id: 3, name: "Sustainable Timber Inc", country: "Canada", type: "Importer" },
  { id: 4, name: "EcoForest Enterprises", country: "Sweden", type: "Consignee" },
  { id: 5, name: "Tropical Woods Co.", country: "Japan", type: "Importer" },
  { id: 6, name: "Amazon Timber Exporters", country: "Brazil", type: "Consignee" }
];

// Payment calculation function
const calculatePayment = (totalKg) => {
  const ratePer20000kg = 100; // $100 per 20,000kg
  const payment = Math.ceil(totalKg / 20000) * ratePer20000kg;
  return payment;
};

// Document Upload Modal Component
const DocumentUploadModal = ({ isOpen, onClose, onUpload, section, forestName }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const sectionTitles = {
    a: "Land Use Rights",
    b: "Environmental Protection",
    c: "Forest-related rules",
    d: "Third Parties Rights",
    e: "Labour Rights",
    f: "Human Rights",
    g: "FPIC (Free, Prior, Informed Consent)",
    h: "Tax, Anti-corruption, Trade & Customs"
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!description.trim() || !file) {
      toast.error('Please provide a description and select a file');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newDocument = {
      id: Date.now(),
      name: file.name,
      description: description,
      uploadedAt: new Date().toISOString().split('T')[0],
      isNew: true
    };

    onUpload(newDocument);
    setIsUploading(false);
    setDescription('');
    setFile(null);
    onClose();
    toast.success('Document uploaded successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload Document for {sectionTitles[section]}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Forest: <span className="font-semibold">{forestName}</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Add additional documentation for this shipment
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              placeholder="Describe the document being uploaded..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-sm text-gray-600">
                  {file ? file.name : 'Click to select a file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, XLS, JPG, PNG up to 10MB
                </p>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
            {!isUploading && <Upload size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Payment Information Component
const PaymentInformation = ({ totalKg, onPaymentComplete }) => {
  const paymentAmount = calculatePayment(totalKg);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      toast.error('Please fill all card details');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onPaymentComplete();
    toast.success(`Payment of $${paymentAmount} processed successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
        </div>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Total Product Weight</p>
                <p className="text-lg font-semibold text-gray-800">{totalKg.toLocaleString()} kg</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Rate</p>
                <p className="text-lg font-semibold text-green-600">$100 / 20,000 kg</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800">Total Amount Due</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">${paymentAmount}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Calculated as: {Math.ceil(totalKg / 20000)} × $100 for every 20,000kg
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === 'card'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <CreditCard className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center ${paymentMethod === 'bank'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <Building className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Card Details (only show if card selected) */}
          {paymentMethod === 'card' && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
              <h4 className="font-medium text-gray-800">Card Details</h4>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="MM/YY"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details (only show if bank selected) */}
          {paymentMethod === 'bank' && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Bank Transfer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-medium">Global Commerce Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium">EUDR Compliance Platform</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-mono font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Routing Number:</span>
                  <span className="font-mono font-medium">021000021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SWIFT/BIC:</span>
                  <span className="font-mono font-medium">GCBUS33</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono font-medium">EUDR-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ${paymentAmount}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Your payment information is securely processed.
          </p>
        </div>
      </div>
    </div>
  );
};

// UPDATED: Enhanced Forest Plot Selection Component with delete button and proper naming
const EnhancedForestPlotSelection = ({ 
  forest, 
  selectedPlots, 
  onPlotToggle,
  onNewPlotAdded,
  onPlotDeleted,
  isLoaded,
  newlyCreatedPlots = [],
  forestIndex // Added to create unique IDs for each forest
}) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(10);
  const [showMap, setShowMap] = useState(true);
  const [drawingManager, setDrawingManager] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPlot, setTempPlot] = useState(null);
  const [showCoordinates, setShowCoordinates] = useState({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Plot colors for visualization - pre-defined areas use red, green, blue
  const plotColors = [
    '#22c55e', // green
    '#3b82f6', // blue
    '#ef4444', // red
    '#f59e0b', // yellow (for custom plots)
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // emerald
    '#f97316', // orange
  ];

  // Get all plots including newly created ones
  const allPlots = [...(forest.plots || []), ...newlyCreatedPlots];

  // Get the next harvest zone number for custom plots
  const getNextHarvestZoneNumber = () => {
    const customPlots = allPlots.filter(plot => plot.isCustom);
    const allZoneNumbers = customPlots
      .map(plot => {
        const match = plot.name.match(/Harvest Area (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    if (allZoneNumbers.length === 0) return 1;
    return Math.max(...allZoneNumbers) + 1;
  };

  // Create unique save button ID for this forest
  const saveButtonId = `save-area-${forest.id}-${forestIndex}`;

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    
    // Set initial view based on forest coordinates
    if (forest.coordinates) {
      setCenter(forest.coordinates);
      setZoom(12);
      
      // Fit bounds to show all plots (including newly created ones)
      if (allPlots.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        allPlots.forEach(plot => {
          if (plot.coordinates && plot.coordinates.length > 0) {
            plot.coordinates.forEach(coord => {
              bounds.extend(coord);
            });
          }
        });
        
        if (!bounds.isEmpty()) {
          mapInstance.fitBounds(bounds);
          mapInstance.panToBounds(bounds);
        }
      }
    }
  }, [forest, allPlots]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onDrawingManagerLoad = useCallback((manager) => {
    setDrawingManager(manager);
  }, []);

  const onPolygonComplete = useCallback((polygon) => {
    if (!isDrawing) return;
    
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
    
    // Get next harvest zone number for custom plots
    const nextZoneNumber = getNextHarvestZoneNumber();
    const defaultName = `Harvest Area ${nextZoneNumber}`;
    
    const newPlot = {
      id: `temp-${Date.now()}`,
      name: defaultName,
      coordinates: coords,
      hectares: area,
      locationName: "Custom harvest area",
      isNew: true,
      isCustom: true
    };

    setTempPlot(newPlot);
    polygon.setMap(null);
    drawingManager.setDrawingMode(null);
    setIsDrawing(false);
    setShowSavePrompt(true); // Show save prompt
    
    // Scroll to save button area for THIS specific forest
    setTimeout(() => {
      const saveButtonArea = document.getElementById(saveButtonId);
      if (saveButtonArea) {
        saveButtonArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [isDrawing, drawingManager, allPlots, saveButtonId]);

  const handlePlotToggle = (plotId) => {
    onPlotToggle(forest.id, plotId);
  };

  const handlePlotDelete = (plotId, e) => {
    e.stopPropagation(); // Prevent triggering the plot selection
    if (confirm('Are you sure you want to delete this harvest zone?')) {
      onPlotDeleted(forest.id, plotId);
    }
  };

  const toggleCoordinates = (plotId) => {
    setShowCoordinates(prev => ({
      ...prev,
      [plotId]: !prev[plotId]
    }));
  };

  const startDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      setIsDrawing(true);
      setShowSavePrompt(false);
    }
  };

  const cancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      setTempPlot(null);
      setShowSavePrompt(false);
    }
  };

  const saveNewPlot = () => {
    if (tempPlot) {
      const permanentPlot = {
        ...tempPlot,
        id: `${forest.id}-custom-${Date.now()}`
      };
      
      onNewPlotAdded(forest.id, permanentPlot);
      setTempPlot(null);
      setShowSavePrompt(false);
      toast.success('New harvest area saved and added!');
    }
  };

  const removeTempPlot = () => {
    setTempPlot(null);
    setShowSavePrompt(false);
  };

  // Calculate total area of selected plots
  const selectedArea = allPlots
    .filter(plot => selectedPlots.includes(plot.id))
    .reduce((total, plot) => total + (plot.hectares || 0), 0);

  const tempPlotArea = tempPlot ? tempPlot.hectares : 0;
  const totalDisplayArea = selectedArea + (tempPlot ? tempPlotArea : 0);

  return (
    <div className="space-y-4">
      {/* Plot Selection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-green-600" />
          <h4 className="font-medium text-gray-700">Harvest Plot Selection</h4>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {selectedPlots.length} plot{selectedPlots.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showMap 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showMap ? 'Show List View' : 'Show Map View'}
        </button>
      </div>

      {/* Selected Area Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-green-600" />
            <span className="font-medium text-green-800">
              Harvest Area for {forest.name}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-700">
              {totalDisplayArea.toFixed(2)} hectares
            </div>
            <div className="text-sm text-green-600">
              {selectedPlots.length} selected plot{selectedPlots.length !== 1 ? 's' : ''}
              {tempPlot && " + 1 new plot pending save"}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMap && isLoaded ? (
        <div className="space-y-4">
          {/* Drawing Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h5 className="font-medium text-gray-700">Plot Drawing Tools</h5>
              <div className="flex gap-2">
                {!isDrawing ? (
                  <button
                    onClick={startDrawing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus size={14} />
                    Draw New Harvest Area
                  </button>
                ) : (
                  <button
                    onClick={cancelDrawing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel Drawing
                  </button>
                )}
              </div>
            </div>
            
            {isDrawing && (
              <p className="text-sm text-gray-600 mb-2">
                Click on the map to draw your harvest area polygon. Close the polygon by clicking the first point.
              </p>
            )}

            {/* Save Prompt Area - FIXED: Uses unique ID for each forest */}
            <div id={saveButtonId} className="save-prompt-area">
              {tempPlot && (
                <div className="space-y-3 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">New Harvest Area Ready to Save</h5>
                      <div className="text-sm text-yellow-700">
                        <span className="font-medium">Name:</span> {tempPlot.name}
                      </div>
                      <div className="text-sm text-yellow-700">
                        <span className="font-medium">Area:</span> {tempPlotArea.toFixed(2)} hectares
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveNewPlot}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Save Area
                      </button>
                      <button
                        onClick={removeTempPlot}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X size={14} />
                        Discard
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-600">
                    Click "Save Area" to add this custom harvest zone. It will be named "{tempPlot.name}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-300">
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
              {/* Drawing Manager for new plots */}
              {showMap && isLoaded && (
                <DrawingManager
                  onLoad={onDrawingManagerLoad}
                  onPolygonComplete={onPolygonComplete}
                  drawingMode={isDrawing ? window.google.maps.drawing.OverlayType.POLYGON : null}
                  options={{
                    drawingControl: false,
                    polygonOptions: {
                      fillColor: '#f59e0b', // Yellow for custom plots
                      fillOpacity: 0.4,
                      strokeColor: '#f59e0b',
                      strokeWeight: 2,
                      editable: false,
                      draggable: false,
                    }
                  }}
                />
              )}

              {/* Display all plots including newly created ones */}
              {allPlots.map((plot, index) => {
                if (!plot.coordinates || plot.coordinates.length < 3) return null;
                
                // Use yellow for custom plots, otherwise use pre-defined colors based on index
                const color = plot.isCustom ? '#f59e0b' : plotColors[index % plotColors.length];
                const centerPoint = getPolygonCenter(plot.coordinates);
                const isSelected = selectedPlots.includes(plot.id);
                
                return (
                  <div key={plot.id}>
                    <Polygon
                      paths={plot.coordinates}
                      options={{
                        fillColor: color,
                        fillOpacity: isSelected ? 0.5 : 0.3,
                        strokeColor: isSelected ? '#000000' : color,
                        strokeWeight: isSelected ? 3 : 2,
                        strokeOpacity: 0.8,
                        clickable: true,
                        zIndex: isSelected ? 1000 : 1
                      }}
                      onClick={() => handlePlotToggle(plot.id)}
                    />
                    
                    {/* Label for selected plots - FIXED: Always use the plot color, not green for selected */}
                    {centerPoint && (
                      <Marker
                        position={centerPoint}
                        label={{
                          text: plot.name,
                          color: isSelected ? '#FFFFFF' : '#000000',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        icon={{
                          path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                          fillColor: color, // ALWAYS use the plot color (yellow for custom plots)
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                          scale: 1,
                          labelOrigin: new window.google.maps.Point(0, -30)
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Display temporary new plot in progress */}
              {tempPlot && tempPlot.coordinates && tempPlot.coordinates.length >= 3 && (
                <Polygon
                  paths={tempPlot.coordinates}
                  options={{
                    fillColor: '#f59e0b', // Yellow for custom plots
                    fillOpacity: 0.4,
                    strokeColor: '#f59e0b',
                    strokeWeight: 3,
                    strokeOpacity: 0.8,
                    clickable: false,
                    zIndex: 2000
                  }}
                />
              )}

              {/* Drawing Instructions Overlay */}
              {isDrawing && (
                <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg z-10 max-w-[90%]">
                  <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 sm:gap-2">
                    <Info size={12} className="hidden sm:block" />
                    Click on map to draw harvest area. Close polygon by clicking first point.
                  </p>
                </div>
              )}

              {/* Save Prompt Overlay when a plot is drawn */}
              {tempPlot && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 bg-opacity-90 px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg z-10 max-w-[90%]">
                  <p className="text-xs sm:text-sm text-white font-medium flex items-center gap-1 sm:gap-2">
                    <CheckCircle size={12} className="hidden sm:block" />
                    Harvest area drawn! Scroll up to save it.
                  </p>
                </div>
              )}

              {/* Simple dark transparent box with just forest name (top-left) */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                <div className="bg-black bg-opacity-70 rounded-lg shadow-lg p-2 sm:p-3 max-w-[200px]">
                  <div className="text-white font-medium text-xs sm:text-sm truncate">
                    {forest.name}
                  </div>
                </div>
              </div>
            </GoogleMap>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-1">Map Instructions</h5>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                  <li>• <strong>Select existing plots:</strong> Click on any colored polygon to select/deselect</li>
                  <li>• <strong>Pre-defined plots:</strong> Red, Green, and Blue areas are pre-defined harvest zones (Area 1, Area 2, Area 3)</li>
                  <li>• <strong>Draw new areas:</strong> Use "Draw New Harvest Area" button to create custom polygons (yellow)</li>
                  <li>• <strong>Save new plots:</strong> After drawing, click "Save Area" to add the custom harvest zone</li>
                  <li>• <strong>Automatic naming:</strong> New areas are automatically named "Harvest Area X"</li>
                  <li>• <strong>Multiple selection:</strong> You can select multiple plots from different areas</li>
                  <li>• <strong>Area calculation:</strong> Total harvest area updates automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View with Coordinates and Delete Button */
        <div className="space-y-4">
          {/* Simple forest name display for list view */}
          <div className="bg-black bg-opacity-70 border border-gray-700 rounded-lg p-4">
            <div className="text-white font-medium text-sm sm:text-base">
              {forest.name}
            </div>
          </div>

          {/* Pre-plotted Areas */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700 flex items-center gap-2">
              <MapPin size={16} />
              Available Harvest Areas
            </h5>
            <div className="space-y-3">
              {allPlots.length > 0 ? (
                allPlots.map((plot, index) => {
                  const isSelected = selectedPlots.includes(plot.id);
                  // Use yellow for custom plots, otherwise use pre-defined colors based on index
                  const color = plot.isCustom ? '#f59e0b' : plotColors[index % plotColors.length];
                  const showCoords = showCoordinates[plot.id];
                  
                  return (
                    <div
                      key={plot.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected 
                          ? 'border-green-500 border-2 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            ></div>
                            <h5 className="font-medium text-gray-800 truncate">{plot.name}</h5>
                            {plot.isCustom ? (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                Custom
                              </span>
                            ) : (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                Pre-defined
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                          {plot.locationName && (
                            <p className="text-xs text-gray-500 truncate">{plot.locationName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          <button
                            onClick={() => toggleCoordinates(plot.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          >
                            {showCoords ? 'Hide Coords' : 'Show Coords'}
                          </button>
                          {plot.isCustom && !plot.isPredefined && (
                            <button
                              onClick={(e) => handlePlotDelete(plot.id, e)}
                              className="text-xs text-red-600 hover:text-red-800"
                              title="Delete harvest zone"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle size={12} className="text-white" />}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium text-green-700">
                            {plot.hectares?.toFixed(2) || 0} hectares
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-gray-600">Coordinates:</span>
                          <span className="font-mono text-xs text-gray-500">
                            {plot.coordinates?.length || 0} points
                          </span>
                        </div>
                      </div>

                      {/* Show Coordinates */}
                      {showCoords && plot.coordinates && plot.coordinates.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Coordinates:</p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {plot.coordinates.map((coord, idx) => (
                              <div key={idx} className="flex flex-wrap items-center justify-between text-xs gap-1">
                                <span className="text-gray-600">Point {idx + 1}:</span>
                                <span className="font-mono text-gray-800 break-all">
                                  {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3">
                        <button
                          onClick={() => handlePlotToggle(plot.id)}
                          className={`w-full text-sm py-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'text-white bg-green-600 hover:bg-green-700'
                              : 'text-green-600 border border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {isSelected ? 'Deselect Area' : 'Select Area for Harvest'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600">No harvest areas available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Use the map view to draw new harvest areas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* View Map Button for List View */}
          <div className="text-center">
            <button
              onClick={() => setShowMap(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 border border-green-300 rounded-lg hover:bg-green-50 w-full sm:w-auto"
            >
              <Maximize2 size={14} />
              Open Map View to Draw New Areas
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Instructions:</span> Select existing pre-defined harvest areas (Area 1, Area 2, Area 3) or draw new custom polygons to specify exactly where products for this shipment were harvested from within {forest.name}. <strong>Pre-defined areas</strong> are shown in red, green, and blue. <strong>Custom areas</strong> are drawn in yellow. New custom areas are automatically named "Harvest Area X" and can be saved with one click.
        </p>
      </div>
    </div>
  );
};

// FIXED: GPS Camera Component for Shipment - Now scrollable
const ShipmentCamera = ({ 
  isOpen, 
  onClose, 
  onSaveMedia,
  shipmentId,
  shipmentName 
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [captureMode, setCaptureMode] = useState('photo');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo' or 'video'
  const [expandedMedia, setExpandedMedia] = useState(null);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStartTime = useRef(null);

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Initialize location and update time
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          };
          setCurrentLocation(coords);

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.address) {
                const addr = data.address;
                const addressParts = [];
                if (addr.road) addressParts.push(addr.road);
                if (addr.suburb) addressParts.push(addr.suburb);
                if (addr.city_district) addressParts.push(addr.city_district);
                if (addr.city) addressParts.push(addr.city);
                if (addr.state) addressParts.push(addr.state);
                if (addr.country) addressParts.push(addr.country);
                setAddress(addressParts.join(', '));
              }
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            setAddress(`${coords.lat}, ${coords.lng}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not retrieve GPS location');
        }
      );
    }

    return () => clearInterval(timeInterval);
  }, []);

  // Toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setCameraFacingMode(prevMode => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
    toast.success(`Switched to ${cameraFacingMode === 'environment' ? 'front' : 'back'} camera`);
  };

  // Start video recording
  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const stream = webcamRef.current.stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);

        const newVideo = {
          id: Date.now(),
          url: videoUrl,
          blob: blob,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          address: address,
          description: description,
          type: 'video',
          shipmentId: shipmentId,
          shipmentName: shipmentName,
          cameraMode: cameraFacingMode,
          duration: (Date.now() - recordingStartTime.current) / 1000
        };

        setCapturedVideos([...capturedVideos, newVideo]);
        setRecordedChunks([]);
        toast.success('Video recorded successfully!');
        setDescription('');
      };

      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      const newImage = {
        id: Date.now(),
        src: imageSrc,
        timestamp: new Date().toISOString(),
        location: currentLocation,
        address: address,
        description: description,
        type: 'photo',
        shipmentId: shipmentId,
        shipmentName: shipmentName,
        cameraMode: cameraFacingMode
      };

      setCapturedImages([...capturedImages, newImage]);
      toast.success('Image captured successfully!');
      setDescription('');
    }
  };

  // Handle capture based on mode
  const handleCapture = () => {
    if (mediaType === 'photo') {
      captureImage();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  // Remove media
  const removeMedia = (id, type) => {
    if (type === 'photo') {
      setCapturedImages(capturedImages.filter(img => img.id !== id));
    } else {
      const video = capturedVideos.find(v => v.id === id);
      if (video && video.url) {
        URL.revokeObjectURL(video.url);
      }
      setCapturedVideos(capturedVideos.filter(vid => vid.id !== id));
    }
    toast.info('Media removed');
  };

  // Save all media to shipment
  const saveToShipment = () => {
    if (capturedImages.length === 0 && capturedVideos.length === 0) {
      toast.error('No media to save');
      return;
    }

    const allMedia = [
      ...capturedImages.map(img => ({
        ...img,
        uploadedAt: new Date().toISOString()
      })),
      ...capturedVideos.map(vid => ({
        ...vid,
        uploadedAt: new Date().toISOString()
      }))
    ];

    // Pass media to parent component
    onSaveMedia(allMedia);

    // Clean up video URLs
    capturedVideos.forEach(video => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });

    // Reset state
    setCapturedImages([]);
    setCapturedVideos([]);
    setDescription('');
    setIsCameraActive(false);
    setExpandedMedia(null);
    setIsRecording(false);
    
    toast.success(`Saved ${capturedImages.length} photo(s) and ${capturedVideos.length} video(s) to shipment`);
  };

  // Format time in seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video constraints
  const videoConstraints = {
    facingMode: cameraFacingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Capture Media for Shipment
            </h3>
            <p className="text-sm text-gray-600">
              {shipmentName} • Photos/Videos with GPS metadata
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* FIXED: Main content area now scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
              {/* Left Panel: Camera Controls - Now scrollable */}
              <div className="border-r p-4 lg:p-6 overflow-y-auto h-full">
                {/* Camera Activation */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">Camera Control</h4>
                    <button
                      onClick={() => setIsCameraActive(!isCameraActive)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isCameraActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      <Camera size={20} />
                      {isCameraActive ? 'Turn Off Camera' : 'Activate Camera'}
                    </button>
                  </div>

                  {/* Media Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMediaType('photo')}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${mediaType === 'photo'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <Camera size={16} />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={() => setMediaType('video')}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${mediaType === 'video'
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <Video size={16} />
                        <span>Video</span>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="2"
                      placeholder="Describe what you're capturing (e.g., 'Container loading', 'Product inspection', etc.)"
                    />
                  </div>

                  {/* Camera Feed */}
                  {isCameraActive && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Live Camera</h4>
                      
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        {/* GPS/Time Overlay */}
                        <div className="absolute top-2 left-2 right-2 z-10">
                          <div className="flex flex-col gap-1 bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="flex-shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-medium truncate">
                                  {currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Getting location...'}
                                </p>
                                {address && (
                                  <p className="text-[10px] text-gray-300 truncate">
                                    {address}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="flex-shrink-0" />
                              <p className="text-xs">
                                {currentDateTime.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recording Indicator */}
                        {isRecording && (
                          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">REC</span>
                            <span className="text-xs ml-1">
                              {recordingStartTime.current && formatTime((Date.now() - recordingStartTime.current) / 1000)}
                            </span>
                          </div>
                        )}

                        <Webcam
                          ref={webcamRef}
                          audio={mediaType === 'video'}
                          screenshotFormat="image/png"
                          videoConstraints={videoConstraints}
                          className="w-full h-auto"
                          mirrored={cameraFacingMode === 'user'}
                        />

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                          {/* Camera flip button - show on mobile or always */}
                          {isMobile && (
                            <button
                              onClick={toggleCameraFacingMode}
                              className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-full font-medium shadow-lg transition-all hover:scale-105"
                            >
                              <RotateCw size={14} />
                              {cameraFacingMode === 'environment' ? 'Front' : 'Back'}
                            </button>
                          )}
                          
                          <button
                            onClick={handleCapture}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105 ${
                              mediaType === 'video' && isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-white/90 hover:bg-white text-gray-800'
                            }`}
                          >
                            {mediaType === 'photo' ? (
                              <>
                                <Camera size={20} />
                                <span>Capture Photo</span>
                              </>
                            ) : isRecording ? (
                              <>
                                <Square size={20} />
                                <span>Stop Recording</span>
                              </>
                            ) : (
                              <>
                                <Circle size={20} className="text-red-500" />
                                <span>Start Recording</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera Controls for Non-Mobile */}
                  {isCameraActive && !isMobile && (
                    <div className="flex justify-center gap-2 mb-6">
                      <button
                        onClick={toggleCameraFacingMode}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      >
                        <RotateCw size={18} />
                        <span className="font-medium">
                          Switch to {cameraFacingMode === 'environment' ? 'Front' : 'Back'} Camera
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={saveToShipment}
                    disabled={capturedImages.length === 0 && capturedVideos.length === 0}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${capturedImages.length === 0 && capturedVideos.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                      }`}
                  >
                    <CheckCircle size={20} />
                    Save {capturedImages.length} Photo(s) and {capturedVideos.length} Video(s) to Shipment
                  </button>
                </div>
              </div>

              {/* Right Panel: Captured Media */}
              <div className="p-4 lg:p-6 overflow-y-auto h-full">
                <h4 className="font-semibold text-gray-800 mb-4">Captured Media</h4>
                
                {capturedImages.length === 0 && capturedVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Camera className="mx-auto mb-2" size={48} />
                    <p>No media captured yet</p>
                    <p className="text-sm">Activate the camera and capture photos or videos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Display Images */}
                    {capturedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedMedia({ ...image, type: 'photo' })}
                        >
                          <img
                            src={image.src}
                            alt={`Capture ${image.id}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 size={20} className="text-white" />
                          </div>
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                            PHOTO
                          </div>
                          {image.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                              {image.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedia(image.id, 'photo');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {/* Display Videos */}
                    {capturedVideos.map((video) => (
                      <div key={video.id} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedMedia({ ...video, type: 'video' })}
                        >
                          <div className="w-full h-32 bg-gray-800 rounded-lg border border-gray-200 hover:border-red-500 transition-colors overflow-hidden relative">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover opacity-70"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-2">
                                <Video size={20} className="text-white" />
                              </div>
                            </div>
                            <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">
                              VIDEO
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                              {formatTime(video.duration || 0)}
                            </div>
                            {video.description && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                                {video.description}
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 size={20} className="text-white" />
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedia(video.id, 'video');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">GPS Status:</span> {currentLocation ? 'Active' : 'Inactive'}
              <span className="mx-2">•</span>
              <span className="font-medium">Location:</span> {address ? address.substring(0, 50) + (address.length > 50 ? '...' : '') : 'Unknown'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveToShipment}
                disabled={capturedImages.length === 0 && capturedVideos.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${capturedImages.length === 0 && capturedVideos.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                Save to Shipment
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Media Modal */}
        {expandedMedia && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button
                onClick={() => setExpandedMedia(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black/80 text-white rounded-full p-2 z-10 backdrop-blur-sm"
              >
                <X size={24} />
              </button>

              <div className="bg-white rounded-lg overflow-hidden">
                {expandedMedia.type === 'photo' ? (
                  <img
                    src={expandedMedia.src}
                    alt="Expanded view"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : (
                  <video
                    src={expandedMedia.url}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[70vh] bg-black"
                  />
                )}

                <div className="bg-gray-800 text-white p-4">
                  <h3 className="font-semibold text-lg mb-2">Media Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Type:</span> {expandedMedia.type === 'photo' ? 'Photo' : 'Video'}</p>
                      <p><span className="text-gray-400">Shipment:</span> {expandedMedia.shipmentName}</p>
                      <p><span className="text-gray-400">Captured:</span> {new Date(expandedMedia.timestamp).toLocaleString()}</p>
                      {expandedMedia.description && (
                        <p><span className="text-gray-400">Description:</span> {expandedMedia.description}</p>
                      )}
                      {expandedMedia.type === 'video' && (
                        <p><span className="text-gray-400">Duration:</span> {formatTime(expandedMedia.duration || 0)}</p>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{expandedMedia.address || (expandedMedia.location ? `${expandedMedia.location.lat}, ${expandedMedia.location.lng}` : 'No location data')}</span>
                      </p>
                      {expandedMedia.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span> {expandedMedia.location.lat}, {expandedMedia.location.lng}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                    <button
                      onClick={() => {
                        removeMedia(expandedMedia.id, expandedMedia.type);
                        setExpandedMedia(null);
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      <X size={16} />
                      Delete
                    </button>

                    {expandedMedia.type === 'photo' ? (
                      <a
                        href={expandedMedia.src}
                        download={`${expandedMedia.shipmentName}-${expandedMedia.id}.png`}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        <Download size={16} />
                        Download Photo
                      </a>
                    ) : (
                      <a
                        href={expandedMedia.url}
                        download={`${expandedMedia.shipmentName}-${expandedMedia.id}.webm`}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        <Download size={16} />
                        Download Video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// UPDATED: Container Management Component without image upload
const ContainerManagement = ({ 
  containers, 
  onAddContainer, 
  onUpdateContainer, 
  onRemoveContainer, 
  totalForestQuantity 
}) => {
  const [showContainerForm, setShowContainerForm] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [containerForm, setContainerForm] = useState({
    containerNumber: '',
    kilograms: '',
    packingList: null,
  });

  // Calculate remaining quantity that can be allocated to containers
  const allocatedQuantity = containers.reduce((sum, container) => sum + (container.kilograms || 0), 0);
  const remainingQuantity = totalForestQuantity - allocatedQuantity;
  const isTotalAllocated = Math.abs(remainingQuantity) < 0.01; // Account for floating point

  const handleAddContainer = () => {
    if (!containerForm.containerNumber || !containerForm.kilograms || !containerForm.packingList) {
      toast.error('Please fill all required fields');
      return;
    }

    const containerKg = parseFloat(containerForm.kilograms);
    
    // Check if adding this container would exceed total forest quantity
    if (allocatedQuantity + containerKg > totalForestQuantity) {
      toast.error(`Cannot exceed total forest quantity of ${totalForestQuantity.toLocaleString()} kg. Remaining: ${remainingQuantity.toLocaleString()} kg`);
      return;
    }

    const newContainer = {
      id: editingContainer ? editingContainer.id : Date.now(),
      containerNumber: containerForm.containerNumber,
      kilograms: containerKg,
      packingList: containerForm.packingList
    };

    if (editingContainer) {
      onUpdateContainer(newContainer);
    } else {
      onAddContainer(newContainer);
    }

    setContainerForm({ containerNumber: '', kilograms: '', packingList: null });
    setShowContainerForm(false);
    setEditingContainer(null);
  };

  const handleEditContainer = (container) => {
    setContainerForm({
      containerNumber: container.containerNumber,
      kilograms: container.kilograms.toString(),
      packingList: container.packingList,
    });
    setEditingContainer(container);
    setShowContainerForm(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files[0]) {
      setContainerForm(prev => ({ ...prev, packingList: files[0] }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Containers</h3>
          <p className="text-sm text-gray-600">
            Allocated: <span className="font-semibold">{allocatedQuantity.toLocaleString()} kg</span>
            {' / '}
            Total: <span className="font-semibold">{totalForestQuantity.toLocaleString()} kg</span>
          </p>
        </div>
        <button
          onClick={() => setShowContainerForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          Add Container
        </button>
      </div>

      {/* Quantity Allocation Status */}
      <div className={`p-3 rounded-lg ${isTotalAllocated ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className={isTotalAllocated ? 'text-green-600' : 'text-yellow-600'} />
            <span className={`font-medium ${isTotalAllocated ? 'text-green-800' : 'text-yellow-800'}`}>
              Quantity Allocation
            </span>
          </div>
          <div className="text-right">
            <span className={`text-sm ${isTotalAllocated ? 'text-green-600' : 'text-yellow-600'}`}>
              {isTotalAllocated ? '✅ Fully Allocated' : `Remaining: ${remainingQuantity.toLocaleString()} kg`}
            </span>
          </div>
        </div>
        {!isTotalAllocated && (
          <p className="text-xs text-yellow-600 mt-1">
            Add containers to allocate the remaining {remainingQuantity.toLocaleString()} kg
          </p>
        )}
      </div>

      {/* Container List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {containers.map((container, index) => (
          <div key={container.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Container size={16} className="text-green-600 flex-shrink-0" />
                  <h4 className="font-medium text-gray-800 truncate">Container #{container.containerNumber}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Weight size={14} className="flex-shrink-0" />
                  <span>{container.kilograms.toLocaleString()} kg</span>
                </div>
              </div>
              <button
                onClick={() => onRemoveContainer(container.id)}
                className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-gray-500 flex-shrink-0" />
                <span className="truncate">{container.packingList?.name || 'Packing list'}</span>
              </div>
            </div>

            <button
              onClick={() => handleEditContainer(container)}
              className="mt-3 w-full text-sm text-green-600 hover:text-green-800 border border-green-200 rounded-lg py-1 hover:bg-green-50"
            >
              Edit Container
            </button>
          </div>
        ))}
      </div>

      {/* Quantity Correlation Summary */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-medium text-blue-800">Quantity Correlation</h4>
            <p className="text-sm text-blue-600">
              Container quantities must match total forest quantities
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-700">
              {allocatedQuantity.toLocaleString()} / {totalForestQuantity.toLocaleString()} kg
            </div>
            <div className={`text-sm ${Math.abs(remainingQuantity) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(remainingQuantity) < 0.01 ? '✓ Quantities Match' : `✗ Difference: ${remainingQuantity.toLocaleString()} kg`}
            </div>
          </div>
        </div>
        
        {/* Progress bar showing allocation */}
        {totalForestQuantity > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Allocation Progress</span>
              <span>{Math.round((allocatedQuantity / totalForestQuantity) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(allocatedQuantity / totalForestQuantity) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Preview */}
      {totalForestQuantity > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-yellow-600 flex-shrink-0" />
            <h4 className="font-medium text-yellow-800">Payment Preview</h4>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-yellow-700">
                {totalForestQuantity.toLocaleString()} kg × $100 per 20,000kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-700">
                ${calculatePayment(totalForestQuantity)}
              </p>
              <p className="text-xs text-yellow-600">
                Due after shipment creation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Container Form Modal */}
      {showContainerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingContainer ? 'Edit Container' : 'Add New Container'}
              </h3>
              <button
                onClick={() => { setShowContainerForm(false); setEditingContainer(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Container Number *
                  </label>
                  <input
                    type="text"
                    value={containerForm.containerNumber}
                    onChange={(e) => setContainerForm(prev => ({ ...prev, containerNumber: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., MSCU1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilograms per Container *
                  </label>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">Available: {remainingQuantity.toLocaleString()} kg</span>
                    {editingContainer && (
                      <span className="text-blue-600">
                        Currently: {editingContainer.kilograms.toLocaleString()} kg
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={containerForm.kilograms}
                    onChange={(e) => {
                      const value = e.target.value;
                      const maxKg = editingContainer 
                        ? remainingQuantity + editingContainer.kilograms 
                        : remainingQuantity;
                      
                      // Limit input to remaining quantity
                      const limitedValue = value === '' ? '' : 
                        Math.min(parseFloat(value) || 0, maxKg);
                      
                      setContainerForm(prev => ({ 
                        ...prev, 
                        kilograms: limitedValue === '' ? '' : limitedValue.toString()
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Max: ${remainingQuantity.toLocaleString()} kg`}
                    min="0"
                    max={remainingQuantity}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum available: {remainingQuantity.toLocaleString()} kg
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packing List (PDF) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="packing-list-upload"
                      accept=".pdf"
                    />
                    <label htmlFor="packing-list-upload" className="cursor-pointer">
                      <FileText className="mx-auto mb-2 text-gray-400" size={24} />
                      <p className="text-sm text-gray-600">
                        {containerForm.packingList ? containerForm.packingList.name : 'Click to select packing list PDF'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF only</p>
                    </label>
                  </div>
                </div>

                {/* Progress bar showing allocation */}
                {totalForestQuantity > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Allocation Progress</span>
                      <span>{Math.round((allocatedQuantity / totalForestQuantity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(allocatedQuantity / totalForestQuantity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t">
              <button
                onClick={() => { setShowContainerForm(false); setEditingContainer(null); }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContainer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 order-1 sm:order-2"
              >
                {editingContainer ? 'Update Container' : 'Add Container'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Document Section Component
const DocumentSection = ({
  sectionKey,
  title,
  description,
  documents = [],
  onAddDocument,
  onRemoveDocument,
  forestId,
  forestName
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const existingDocuments = documents.filter(doc => !doc.isNew);
  const newDocuments = documents.filter(doc => doc.isNew);

  const handleUpload = (newDoc) => {
    onAddDocument(forestId, sectionKey, newDoc);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-medium text-gray-800 text-sm truncate">{title}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${existingDocuments.length > 0
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {existingDocuments.length} ex, {newDocuments.length} new
            </span>
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t">
                <p className="text-sm text-gray-600 mb-3">{description}</p>

                {/* Existing Documents */}
                {existingDocuments.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {existingDocuments.map(doc => (
                        <div
                          key={`existing-${doc.id}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText size={14} className="text-gray-500 flex-shrink-0" />
                            <div className="truncate min-w-0">
                              <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{doc.uploadedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Documents (can be removed) */}
                {newDocuments.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {newDocuments.map(doc => (
                        <div
                          key={`new-${doc.id}`}
                          className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200 text-sm"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText size={14} className="text-green-600 flex-shrink-0" />
                            <div className="truncate min-w-0">
                              <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveDocument(forestId, sectionKey, doc.id)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 ml-2"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Document Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50 w-full sm:w-auto justify-center"
                >
                  <Plus size={14} />
                  Add Document
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        section={sectionKey}
        forestName={forestName}
      />
    </>
  );
};

// Forest-specific Product Information Component
const ForestProductInformation = ({
  forest,
  selectedHS,
  onHSSelect,
  formData,
  onChange,
  isPrimaryForest = false
}) => {
  const [expandedCommodity, setExpandedCommodity] = useState(null);

  const handleHSSelect = (product) => {
    const exists = selectedHS.find(p => p.code === product.code);

    if (exists) {
      onHSSelect(forest.id, selectedHS.filter(p => p.code !== product.code));
    } else {
      onHSSelect(forest.id, [...selectedHS, product]);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onChange({
      ...formData,
      forestQuantities: {
        ...formData.forestQuantities,
        [forest.id]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 mb-1">
              {forest.name}
              {isPrimaryForest && (
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Primary Forest
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600 truncate">{forest.country} • {forest.area}</p>
          </div>
        </div>

        {/* HS Code Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select HS Codes for this Forest *
          </label>
          {forest.commodities && forest.commodities.length > 0 ? (
            <div className="space-y-3">
              {forest.commodities.map((commodity) => (
                <div key={commodity.commodity} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedCommodity(expandedCommodity === commodity.commodity ? null : commodity.commodity)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="font-medium text-gray-800 truncate">{commodity.commodity}</span>
                      <span className="text-sm text-gray-500">
                        ({commodity.products.length} products available)
                      </span>
                    </div>
                    {expandedCommodity === commodity.commodity ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <AnimatePresence>
                    {expandedCommodity === commodity.commodity && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t grid grid-cols-1 gap-2">
                          {commodity.products.map(product => {
                            const isSelected = selectedHS.some(p => p.code === product.code);
                            return (
                              <div
                                key={product.code}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                                onClick={() => handleHSSelect({ ...product, commodity: commodity.commodity, forestId: forest.id })}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileDigit size={14} className="text-gray-500 flex-shrink-0" />
                                      <span className="font-medium text-gray-800">{product.code}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{product.name}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {isSelected && <CheckCircle size={12} className="text-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-lg bg-gray-50">
            </div>
          )}
        </div>

        {/* Selected HS Codes Summary */}
        {selectedHS.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Selected HS Codes for this Forest:</h5>
            <div className="space-y-1">
              {selectedHS.map((product, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                  <div className="min-w-0">
                    <span className="font-medium">{product.code}</span>
                    <span className="text-gray-600 ml-2 truncate">{product.name}</span>
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      {product.commodity}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHSSelect(product)}
                    className="text-red-500 hover:text-red-700 self-end sm:self-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity per Forest */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity from this Forest (kg) *
          </label>
          <p className="text-xs text-gray-500 mb-2">Enter the quantity harvested from this specific forest</p>
          <input
            type="number"
            value={formData.forestQuantities?.[forest.id] || ''}
            onChange={handleQuantityChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 25000"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
    </div>
  );
};

// Product Information Component (Combined for all forests)
const ProductInformation = ({
  formData,
  onChange,
  selectedForests,
  forestHSSelections = {},
  onForestHSSelect
}) => {
  const [productDescription, setProductDescription] = useState(formData.productDescription || '');

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setProductDescription(value);
    onChange({ ...formData, productDescription: value });
  };

  // Calculate total quantity from all forests
  const totalForestQuantity = Object.values(formData.forestQuantities || {}).reduce((sum, qty) => sum + (parseFloat(qty) || 0), 0);
  const paymentAmount = calculatePayment(totalForestQuantity);

  // Get all selected HS codes across all forests
  const allSelectedHS = Object.values(forestHSSelections).flat();

  // Generate combined HS codes string
  const hsCodes = [...new Set(allSelectedHS.map(p => p.code))].join(', ');

  // Generate product names string
  const productNames = [...new Set(allSelectedHS.map(p => p.name))].join(', ');

  // Generate species info for wood products
  const woodProducts = allSelectedHS.filter(p => p.commodity === "Wood");
  const speciesInfo = woodProducts.length > 0
    ? woodProducts.map(p => `${p.name} (HS: ${p.code})`).join('; ')
    : '';

  // Update parent form data whenever selections change
  useEffect(() => {
    onChange({
      ...formData,
      hsCodes,
      productNames,
      speciesInfo,
      quantity: totalForestQuantity,
      paymentAmount: paymentAmount
    });
  }, [hsCodes, productNames, speciesInfo, totalForestQuantity, paymentAmount]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Box size={18} className="text-green-600" />
          Product Information per Forest
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select HS codes and specify quantities for each forest in this shipment.
        </p>
      </div>

      {/* Product Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          A. Overall Product Description *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Include trade name, type, list of relevant commodities or products contained or used
        </p>
        <textarea
          value={productDescription}
          onChange={handleDescriptionChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="3"
          placeholder="Describe the products in this shipment including trade names, types, and all commodities involved..."
          required
        />
      </div>

      {/* Forests Product Info */}
      {selectedForests.map(forestId => {
        const forest = mockForests.find(f => f.id === forestId);
        if (!forest) return null;

        return (
          <ForestProductInformation
            key={forestId}
            forest={forest}
            selectedHS={forestHSSelections[forestId] || []}
            onHSSelect={(forestId, selectedHS) => onForestHSSelect(forestId, selectedHS)}
            formData={formData}
            onChange={onChange}
            isPrimaryForest={false}
          />
        );
      })}

      {/* Summary Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Shipment Summary</h3>

        {/* Selected HS Codes Summary */}
        {allSelectedHS.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-green-700 mb-2">Selected HS Codes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allSelectedHS.map((product, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <span className="font-medium">{product.code}</span>
                    <span className="text-sm text-gray-600 truncate">{product.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                    <span className="text-gray-500">{product.commodity}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {mockForests.find(f => f.id === product.forestId)?.name.split(' - ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Species Information (for wood products) */}
        {woodProducts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Wood Species Information
            </h4>
            <p className="text-sm text-blue-700">
              {speciesInfo}
            </p>
          </div>
        )}

        {/* Quantity and Payment Summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Forest Quantities</h4>
              <div className="space-y-2">
                {Object.entries(formData.forestQuantities || {}).map(([forestId, quantity]) => {
                  const forest = mockForests.find(f => f.id === parseInt(forestId));
                  if (!forest || !quantity) return null;

                  return (
                    <div key={forestId} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                      <span className="text-gray-600 truncate">{forest.name.split(' - ')[0]}</span>
                      <span className="font-medium">{quantity.toLocaleString()} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-green-700 mb-2">Payment Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total Forest Quantity</p>
                  <p className="text-2xl font-bold text-green-700">{totalForestQuantity.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Rate</p>
                  <p className="text-lg font-semibold text-green-700">$100 / 20,000 kg</p>
                </div>
                <div className="border-t pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-lg font-bold text-green-800">Total Amount Due</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">${paymentAmount}</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Calculation: {Math.ceil(totalForestQuantity / 20000)} × $100 = ${paymentAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPDATED: Shipping Information Form Component with multi-select forest dropdown and date-only processing/loading
const ShippingInfoForm = ({ formData, onChange, selectedForests, onForestToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const filteredForests = mockForests.filter(forest =>
    forest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forest.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-green-600" />
          Dates & Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Production *
            </label>
            <input
              type="date"
              value={formData.productionDate}
              onChange={(e) => handleInputChange('productionDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* CHANGED: Changed from datetime-local to date-only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Processing/Loading *
            </label>
            <input
              type="date"
              value={formData.processingDate}
              onChange={(e) => handleInputChange('processingDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importer/Consignee *
            </label>
            <select
              value={formData.importer}
              onChange={(e) => handleInputChange('importer', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select importer/consignee</option>
              {mockImporters.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.country}) - {company.type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Factory size={18} className="text-green-600" />
          Site Selection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* UPDATED: Multi-select Forest/Production Site */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forest/Production Site(s) *
            </label>
            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer flex items-center justify-between"
              >
                <div className="truncate">
                  {selectedForests.length === 0 ? (
                    <span className="text-gray-500">Select forest(s)...</span>
                  ) : (
                    <span className="text-gray-800">
                      {selectedForests.length} forest{selectedForests.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search forests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredForests.map(forest => {
                      const isSelected = selectedForests.includes(forest.id);
                      return (
                        <div
                          key={forest.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-green-50' : ''
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onForestToggle(forest.id);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Trees size={14} className="text-green-600 flex-shrink-0" />
                              <span className="font-medium text-gray-800 truncate">{forest.name}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="truncate">{forest.country}</span>
                              <span className="mx-2">•</span>
                              <span>{forest.area}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 flex-shrink-0 ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                            {isSelected && <CheckCircle size={12} className="text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {selectedForests.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {selectedForests.slice(0, 3).map(forestId => {
                    const forest = mockForests.find(f => f.id === forestId);
                    if (!forest) return null;
                    return (
                      <span
                        key={forestId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                      >
                        <span className="truncate max-w-[100px]">{forest.name.split(' - ')[0]}</span>
                        <button
                          type="button"
                          onClick={() => onForestToggle(forestId)}
                          className="text-green-600 hover:text-green-800 flex-shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                  {selectedForests.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      +{selectedForests.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Select one or more forests involved in this shipment</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing/Loading Site *
            </label>
            <select
              value={formData.processingSite}
              onChange={(e) => handleInputChange('processingSite', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select a processing/loading site</option>
              {mockProcessingSites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.name} • {site.location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Ship size={18} className="text-green-600" />
          Shipping Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Line *
            </label>
            <select
              value={formData.shippingLine}
              onChange={(e) => handleInputChange('shippingLine', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select shipping line</option>
              {shippingLines.map(line => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port of Shipment *
            </label>
            <select
              value={formData.portOfShipment}
              onChange={(e) => handleInputChange('portOfShipment', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select port of shipment</option>
              {portsList.map(port => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port of Destination *
            </label>
            <select
              value={formData.portOfDestination}
              onChange={(e) => handleInputChange('portOfDestination', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select port of destination</option>
              {portsList.map(port => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Shipment Media Section
const ShipmentMediaSection = ({ shipmentMedia = [], onAddMedia, onRemoveMedia }) => {
  const [showCamera, setShowCamera] = useState(false);

  const handleSaveMedia = (media) => {
    onAddMedia(media);
    setShowCamera(false);
  };

  // Group media by type
  const photos = shipmentMedia.filter(item => item.type === 'photo');
  const videos = shipmentMedia.filter(item => item.type === 'video');

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Shipment Media</h3>
            <p className="text-sm text-gray-600">
              Photos and videos with GPS metadata
            </p>
          </div>
          <button
            onClick={() => setShowCamera(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto justify-center"
          >
            <Camera size={16} />
            Capture Media
          </button>
        </div>

        {/* Media Summary */}
        {(photos.length > 0 || videos.length > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">{photos.length}</div>
                  <div className="text-sm text-green-600">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">{videos.length}</div>
                  <div className="text-sm text-green-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">{shipmentMedia.length}</div>
                  <div className="text-sm text-green-600">Total Media</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">All media include GPS location and timestamp</p>
              </div>
            </div>
          </div>
        )}

        {/* Media Grid */}
        {shipmentMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {shipmentMedia.map((media) => (
              <div key={media.id} className="relative group">
                {media.type === 'photo' ? (
                  <div className="relative">
                    <img
                      src={media.src}
                      alt={media.description || 'Shipment photo'}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                      PHOTO
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-full h-40 bg-gray-800 rounded-lg border border-gray-200 overflow-hidden">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover opacity-70"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <Video size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">
                        VIDEO
                      </div>
                    </div>
                  </div>
                )}
                
                {media.description && (
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {media.description}
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(media.timestamp).toLocaleDateString()}
                </div>
                
                <button
                  onClick={() => onRemoveMedia(media.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Camera className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600">No media captured yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Capture Media" to add photos or videos with GPS metadata
            </p>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      <ShipmentCamera
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onSaveMedia={handleSaveMedia}
        shipmentId="SHIPMENT-001"
        shipmentName="Current Shipment"
      />
    </>
  );
};

// Create a custom hook to check if Google Maps is loaded
const useGoogleMapsStatus = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) return;

    // If not loaded, check periodically
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return isLoaded;
};

// Main Component
const NewShipmentOrigin = () => {
  const [selectedForests, setSelectedForests] = useState([]);
  const [shipmentData, setShipmentData] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    productionDate: '',
    processingDate: '', // CHANGED: Now date-only, not datetime
    importer: '',
    processingSite: '',
    shippingLine: '',
    portOfShipment: '',
    portOfDestination: '',
    productDescription: '',
    hsCodes: '',
    productNames: '',
    speciesInfo: '',
    quantity: 0,
    unit: 'kilograms',
    paymentAmount: 0,
    forestQuantities: {}
  });
  const [containers, setContainers] = useState([]);
  const [selectedForestPlots, setSelectedForestPlots] = useState({});
  const [newlyCreatedPlots, setNewlyCreatedPlots] = useState({});
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [forestHSSelections, setForestHSSelections] = useState({});
  // NEW: Shipment media state
  const [shipmentMedia, setShipmentMedia] = useState([]);

  // Use custom hook to check if Google Maps is loaded (via the provider)
  const isLoaded = useGoogleMapsStatus();

  // Calculate total forest quantity
  const totalForestQuantity = selectedForests.reduce((total, forestId) => {
    return total + (parseFloat(shippingInfo.forestQuantities?.[forestId]) || 0);
  }, 0);

  const sectionConfig = {
    a: {
      title: "(a) Land Use Rights",
      description: "Purchase receipt, title documents, survey plan (with coordinates), site plan, fee, levies or charges agreements, location of forest, ownership type etc"
    },
    b: {
      title: "(b) Environmental Protection",
      description: "Environmental Impact Assessment or approval etc"
    },
    c: {
      title: "(c) Forest-related rules",
      description: "Forest management and biodiversity conservation, where directly related to wood harvesting: Such as type of forest, Forest Management Plan, institution that prepared the Management plan and inventory etc of species used to produce the current shipment, for wood derivatives including wood charcoal: includes the names of species, their scientific and local names, description etc"
    },
    d: {
      title: "(d) Third Parties Rights",
      description: "Agreements, sublease etc"
    },
    e: {
      title: "(e) Labour Rights",
      description: "Workers rights & safety, payment of workers etc"
    },
    f: {
      title: "(f) Human Rights",
      description: "Human rights compliance under international law"
    },
    g: {
      title: "(g) FPIC (Free, Prior, Informed Consent)",
      description: "Including as set out in the UN Declaration on the Rights of Indigenous Peoples"
    },
    h: {
      title: "(h) Tax, Anti-corruption, Trade & Customs",
      description: "Tax, anti-corruption, trade and customs compliance documentation"
    }
  };

  const toggleForest = (forestId) => {
    setSelectedForests(prev => {
      if (prev.includes(forestId)) {
        const newData = { ...shipmentData };
        delete newData[forestId];
        setShipmentData(newData);

        setSelectedForestPlots(prevPlots => {
          const newPlots = { ...prevPlots };
          delete newPlots[forestId];
          return newPlots;
        });

        setNewlyCreatedPlots(prevPlots => {
          const newPlots = { ...prevPlots };
          delete newPlots[forestId];
          return newPlots;
        });

        setForestHSSelections(prev => {
          const newSelections = { ...prev };
          delete newSelections[forestId];
          return newSelections;
        });

        // Remove forest quantity
        const newQuantities = { ...shippingInfo.forestQuantities };
        delete newQuantities[forestId];
        setShippingInfo(prev => ({
          ...prev,
          forestQuantities: newQuantities
        }));

        return prev.filter(id => id !== forestId);
      } else {
        return [...prev, forestId];
      }
    });
  };

  const addDocument = (forestId, sectionKey, document) => {
    setShipmentData(prev => {
      const forestData = prev[forestId] || { documents: {} };
      const sectionDocuments = forestData.documents[sectionKey] || [];

      return {
        ...prev,
        [forestId]: {
          ...forestData,
          documents: {
            ...forestData.documents,
            [sectionKey]: [...sectionDocuments, document]
          }
        }
      };
    });
  };

  const removeDocument = (forestId, sectionKey, documentId) => {
    setShipmentData(prev => {
      const forestData = prev[forestId];
      if (!forestData) return prev;

      const updatedDocuments = {
        ...forestData.documents,
        [sectionKey]: forestData.documents[sectionKey].filter(doc => doc.id !== documentId)
      };

      return {
        ...prev,
        [forestId]: {
          ...forestData,
          documents: updatedDocuments
        }
      };
    });
  };

  const addContainer = (container) => {
    setContainers(prev => [...prev, container]);
  };

  const updateContainer = (updatedContainer) => {
    setContainers(prev => prev.map(container =>
      container.id === updatedContainer.id ? updatedContainer : container
    ));
  };

  const removeContainer = (containerId) => {
    setContainers(prev => prev.filter(container => container.id !== containerId));
  };

  const handlePlotToggle = (forestId, plotId) => {
    setSelectedForestPlots(prev => {
      const currentPlots = prev[forestId] || [];
      const newPlots = currentPlots.includes(plotId)
        ? currentPlots.filter(id => id !== plotId)
        : [...currentPlots, plotId];

      return {
        ...prev,
        [forestId]: newPlots
      };
    });
  };

  const handleNewPlotAdded = (forestId, newPlot) => {
    setNewlyCreatedPlots(prev => ({
      ...prev,
      [forestId]: [...(prev[forestId] || []), newPlot]
    }));

    // Auto-select the new plot
    handlePlotToggle(forestId, newPlot.id);
  };

  const handlePlotDeleted = (forestId, plotId) => {
    // Remove from newly created plots
    setNewlyCreatedPlots(prev => ({
      ...prev,
      [forestId]: (prev[forestId] || []).filter(plot => plot.id !== plotId)
    }));

    // Remove from selected plots if selected
    setSelectedForestPlots(prev => ({
      ...prev,
      [forestId]: (prev[forestId] || []).filter(id => id !== plotId)
    }));

    toast.success('Harvest zone deleted successfully!');
  };

  const handleForestHSSelect = (forestId, selectedHS) => {
    setForestHSSelections(prev => ({
      ...prev,
      [forestId]: selectedHS
    }));
  };

  const getForestPlots = (forestId) => {
    const forest = mockForests.find(f => f.id === forestId);
    const existingPlots = forest?.plots || [];
    const newPlots = newlyCreatedPlots[forestId] || [];

    return [...existingPlots, ...newPlots];
  };

  const getForestHarvestArea = (forestId) => {
    const allPlots = getForestPlots(forestId);
    const selectedPlotIds = selectedForestPlots[forestId] || [];

    return allPlots
      .filter(plot => selectedPlotIds.includes(plot.id))
      .reduce((total, plot) => total + (plot.hectares || 0), 0);
  };

  const getTotalHarvestArea = () => {
    return selectedForests.reduce((total, forestId) => {
      return total + getForestHarvestArea(forestId);
    }, 0);
  };

  const validateShippingInfo = () => {
    const requiredFields = [
      'productionDate',
      'processingDate',
      'importer',
      'processingSite',
      'shippingLine',
      'portOfShipment',
      'portOfDestination'
    ];

    for (const field of requiredFields) {
      if (!shippingInfo[field]?.toString().trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please fill in ${fieldName}`);
        return false;
      }
    }

    // Check if at least one forest is selected
    if (selectedForests.length === 0) {
      toast.error('Please select at least one forest');
      return false;
    }

    const productionDate = new Date(shippingInfo.productionDate);
    const processingDate = new Date(shippingInfo.processingDate);

    if (processingDate < productionDate) {
      toast.error('Processing date cannot be before production date');
      return false;
    }

    return true;
  };

  const validateProductInfo = () => {
    if (!shippingInfo.productDescription?.trim()) {
      toast.error('Please fill in product description');
      return false;
    }

    // Check if each forest has at least one HS code selected
    for (const forestId of selectedForests) {
      if (!forestHSSelections[forestId]?.length) {
        const forest = mockForests.find(f => f.id === forestId);
        toast.error(`Please select at least one HS code for ${forest?.name}`);
        return false;
      }

      // Check if quantity is provided for each forest
      if (!shippingInfo.forestQuantities?.[forestId] || shippingInfo.forestQuantities[forestId] <= 0) {
        const forest = mockForests.find(f => f.id === forestId);
        toast.error(`Please enter quantity for ${forest?.name}`);
        return false;
      }
    }

    return true;
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    handleCreateShipment();
  };

  const handleCreateShipment = async () => {
    if (!validateShippingInfo()) {
      setStep(1);
      return;
    }

    if (!validateProductInfo()) {
      setStep(2);
      return;
    }

    if (containers.length === 0) {
      toast.error('Please add at least one container');
      setStep(4); // Go to containers step
      return;
    }

    // Check if container quantities match total forest quantity
    const allocatedQuantity = containers.reduce((sum, container) => sum + (container.kilograms || 0), 0);
    const remainingQuantity = totalForestQuantity - allocatedQuantity;
    
    if (Math.abs(remainingQuantity) > 0.01) { // Allow small rounding differences
      toast.error(`Container quantities (${allocatedQuantity.toLocaleString()} kg) must equal total forest quantity (${totalForestQuantity.toLocaleString()} kg). Remaining: ${remainingQuantity.toLocaleString()} kg`);
      setStep(4);
      return;
    }

    // Check payment if not already completed
    const paymentAmount = calculatePayment(totalForestQuantity);

    if (paymentAmount > 0 && !paymentCompleted) {
      // Show payment step
      setStep(6);
      return;
    }

    setIsCreating(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const selectedImporter = mockImporters.find(
      company => company.id === parseInt(shippingInfo.importer)
    );

    const selectedProcessingSite = mockProcessingSites.find(
      site => site.id === parseInt(shippingInfo.processingSite)
    );

    const plotsInfo = {};

    selectedForests.forEach(forestId => {
      const plotIds = selectedForestPlots[forestId] || [];
      if (plotIds.length > 0) {
        const allPlots = getForestPlots(forestId);
        plotsInfo[forestId] = allPlots
          .filter(plot => plotIds.includes(plot.id))
          .map(plot => ({
            id: plot.id,
            name: plot.name,
            area: plot.hectares,
            coordinates: plot.coordinates,
            isNew: plot.isNew || false,
            isCustom: plot.isCustom || false
          }));
      }
    });

    const shipmentDate = new Date();
    const shipmentName = `SH-${shipmentDate.getFullYear()}${(shipmentDate.getMonth() + 1).toString().padStart(2, '0')}${shipmentDate.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    const newShipment = {
      id: Date.now(),
      name: shipmentName,
      date: shipmentDate.toISOString(),
      shippingInfo: {
        ...shippingInfo,
        importerName: selectedImporter?.name || 'Unknown',
        processingSiteName: selectedProcessingSite?.name || 'Unknown'
      },
      containers: containers,
      forestIds: selectedForests,
      documentsAdded: shipmentData,
      selectedPlots: plotsInfo,
      shipmentMedia: shipmentMedia,
      totalHarvestArea: getTotalHarvestArea().toFixed(2),
      newlyCreatedPlots: newlyCreatedPlots,
      forestHSSelections: forestHSSelections,
      totalKg: totalForestQuantity,
      paymentAmount: paymentAmount,
      paymentCompleted: paymentCompleted,
      paymentDate: paymentCompleted ? new Date().toISOString() : null
    };

    console.log('New Shipment Created:', newShipment);

    // Reset form
    setSelectedForests([]);
    setShipmentData({});
    setShippingInfo({
      productionDate: '',
      processingDate: '',
      importer: '',
      processingSite: '',
      shippingLine: '',
      portOfShipment: '',
      portOfDestination: '',
      productDescription: '',
      hsCodes: '',
      productNames: '',
      speciesInfo: '',
      quantity: 0,
      unit: 'kilograms',
      paymentAmount: 0,
      forestQuantities: {}
    });
    setContainers([]);
    setSelectedForestPlots({});
    setNewlyCreatedPlots({});
    setForestHSSelections({});
    setShipmentMedia([]);
    setPaymentCompleted(false);
    setIsCreating(false);
    setStep(0);

    toast.success(
      <div>
        <p className="font-semibold">Shipment created successfully!</p>
        <p className="text-sm">Total weight: {totalForestQuantity.toLocaleString()} kg</p>
        <p className="text-sm">Total harvest area: {getTotalHarvestArea().toFixed(2)} hectares</p>
        <p className="text-sm">Forests: {selectedForests.length}</p>
        <p className="text-sm">Media: {shipmentMedia.length} items</p>
        {paymentCompleted && <p className="text-sm">Payment processed: ${paymentAmount}</p>}
      </div>,
      { duration: 4000 }
    );
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleContinue = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (validateShippingInfo()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateProductInfo()) {
        setStep(3);
      }
    } else if (step === 3) {
      // Plot selection step - no validation needed
      setStep(4);
    } else if (step === 4) {
      // Container step - check if containers exist and quantities match
      if (containers.length === 0) {
        toast.error('Please add at least one container');
        return;
      }
      
      const allocatedQuantity = containers.reduce((sum, container) => sum + (container.kilograms || 0), 0);
      const remainingQuantity = totalForestQuantity - allocatedQuantity;
      
      if (Math.abs(remainingQuantity) > 0.01) {
        toast.error(`Container quantities (${allocatedQuantity.toLocaleString()} kg) must equal total forest quantity (${totalForestQuantity.toLocaleString()} kg). Remaining: ${remainingQuantity.toLocaleString()} kg`);
        return;
      }
      
      setStep(5);
    } else if (step === 5) {
      // Documents & Media step - no validation needed
      // Check if payment is needed
      const paymentAmount = calculatePayment(totalForestQuantity);

      if (paymentAmount > 0) {
        setStep(6); // Go to payment step
      } else {
        handleCreateShipment(); // No payment needed
      }
    }
  };

  // Calculate allocated container quantity
  const allocatedQuantity = containers.reduce((sum, container) => sum + (container.kilograms || 0), 0);
  const remainingQuantity = totalForestQuantity - allocatedQuantity;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#10b981',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-6">New Shipment</h1>

        {step > 0 && (
          <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
            <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap min-w-max sm:min-w-0">
              {['Shipping Info', 'Product Info', 'Plot Selection', 'Containers', 'Documents & Media', 'Payment'].map((label, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step >= index + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium ${step >= index + 1 ? 'text-green-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {index < 5 && (
                    <div className={`hidden sm:block w-8 sm:w-12 h-1 mx-2 ${step > index + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-green-100 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Create New Shipment</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Start a new shipment by entering shipping details, selecting forests, and managing containers and documents.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Create New Shipment
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Shipping Information</h2>
              <p className="text-gray-600">
                Enter the shipping information including dates, company details, and select forests involved in this shipment.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <ShippingInfoForm
                formData={shippingInfo}
                onChange={setShippingInfo}
                selectedForests={selectedForests}
                onForestToggle={toggleForest}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 order-1 sm:order-2"
              >
                Continue to Product Information ({selectedForests.length} forests selected)
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Shipping Info
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Product Information per Forest</h2>
              <p className="text-gray-600">
                Select HS codes and specify quantities for each forest in this shipment.
              </p>
              {selectedForests.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  <span className="font-medium">Selected Forests:</span>{' '}
                  {selectedForests.length} forest{selectedForests.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <ProductInformation
                formData={shippingInfo}
                onChange={setShippingInfo}
                selectedForests={selectedForests}
                forestHSSelections={forestHSSelections}
                onForestHSSelect={handleForestHSSelect}
              />
            </div>

            {/* Total Forest Quantity Summary */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-green-600" />
                  <h3 className="font-medium text-green-800">Total Forest Quantity</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {totalForestQuantity.toLocaleString()} kg
                  </div>
                  <p className="text-sm text-green-600">
                    This total must be allocated to containers in the next step
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 order-1 sm:order-2"
              >
                Continue to Plot Selection
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Product Information
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Plot Selection for Each Forest</h2>
              <p className="text-gray-600 mb-4">
                Select harvest plots for each forest in this shipment.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">{selectedForests.length}</span>
                </div>
                <div>
                  <span className="font-medium">Processing Site:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {shippingInfo.processingSite ?
                      mockProcessingSites.find(s => s.id === parseInt(shippingInfo.processingSite))?.name || 'None'
                      : 'None'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Forest Quantity:</span>
                  <span className="text-green-600 font-semibold ml-2">{totalForestQuantity.toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            {/* Plot Selection for Each Forest */}
            {selectedForests.map((forestId, index) => {
              const forest = mockForests.find(f => f.id === forestId);
              if (!forest) return null;

              return (
                <div key={forestId} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 p-3 bg-green-50 rounded-lg">
                    <Trees size={18} className="text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{forest.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{forest.country} • {forest.area}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Quantity: {shippingInfo.forestQuantities?.[forestId]?.toLocaleString() || 0} kg
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
                    {/* FIXED: Pass forestIndex to create unique save button IDs */}
                    <EnhancedForestPlotSelection
                      forest={forest}
                      selectedPlots={selectedForestPlots[forestId] || []}
                      onPlotToggle={handlePlotToggle}
                      onNewPlotAdded={handleNewPlotAdded}
                      onPlotDeleted={handlePlotDeleted}
                      isLoaded={isLoaded}
                      newlyCreatedPlots={newlyCreatedPlots[forestId] || []}
                      forestIndex={index} // Pass the index to create unique IDs
                    />
                  </div>

                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers size={18} className="text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-800 truncate">Selected Harvest Area for {forest.name}:</span>
                      </div>
                      <div className="text-xl font-bold text-green-700">
                        {getForestHarvestArea(forestId).toFixed(2)} hectares
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total Harvest Area Summary */}
            {selectedForests.length > 0 && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Layers size={24} className="text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-green-800 truncate">Total Harvest Area Summary</h3>
                      <p className="text-sm text-green-600">
                        Combined area from all selected plots across all forests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-green-700">
                      {getTotalHarvestArea().toFixed(2)} hectares
                    </div>
                    <div className="text-sm text-green-600">
                      {selectedForests.length} forest{selectedForests.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 order-1 sm:order-2"
              >
                Continue to Containers
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Plot Selection
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 4: Container Information</h2>
              <p className="text-gray-600 mb-4">
                Add containers for this shipment. Container quantities must match the total forest quantity of {totalForestQuantity.toLocaleString()} kg.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">{selectedForests.length}</span>
                </div>
                <div>
                  <span className="font-medium">Processing Site:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {shippingInfo.processingSite ?
                      mockProcessingSites.find(s => s.id === parseInt(shippingInfo.processingSite))?.name || 'None'
                      : 'None'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Forest Quantity:</span>
                  <span className="text-green-600 font-semibold ml-2">{totalForestQuantity.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="font-medium">Total Harvest Area:</span>
                  <span className="text-green-600 font-semibold ml-2">{getTotalHarvestArea().toFixed(2)} hectares</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <ContainerManagement
                containers={containers}
                onAddContainer={addContainer}
                onUpdateContainer={updateContainer}
                onRemoveContainer={removeContainer}
                totalForestQuantity={totalForestQuantity}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={Math.abs(remainingQuantity) > 0.01}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {Math.abs(remainingQuantity) <= 0.01 
                  ? `Continue to Documents & Media (${containers.length} containers)` 
                  : `Allocate Remaining ${remainingQuantity.toLocaleString()} kg`}
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Container Management
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 5: Manage Documents & Media</h2>
              <p className="text-gray-600 mb-4">
                Upload documents and capture media for this shipment.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">{selectedForests.length}</span>
                </div>
                <div>
                  <span className="font-medium">Containers:</span>
                  <span className="text-green-600 font-semibold ml-2">{containers.length}</span>
                </div>
                <div>
                  <span className="font-medium">Total Weight:</span>
                  <span className="text-green-600 font-semibold ml-2">{totalForestQuantity.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="font-medium">Total Harvest Area:</span>
                  <span className="text-green-600 font-semibold ml-2">{getTotalHarvestArea().toFixed(2)} hectares</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${Math.abs(remainingQuantity) <= 0.01 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {Math.abs(remainingQuantity) <= 0.01 ? '✓ Quantities Match' : '✗ Quantities Mismatch'}
                </div>
              </div>
            </div>

            {/* Shipment Media Section */}
            <div className="mb-6 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
              <ShipmentMediaSection
                shipmentMedia={shipmentMedia}
                onAddMedia={(media) => setShipmentMedia([...shipmentMedia, ...media])}
                onRemoveMedia={(id) => setShipmentMedia(shipmentMedia.filter(item => item.id !== id))}
              />
            </div>

            {/* Documents for Each Forest */}
            {selectedForests.map(forestId => {
              const forest = mockForests.find(f => f.id === forestId);
              const forestNewDocs = shipmentData[forestId]?.documents || {};

              return (
                <div key={forestId} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                    <Trees size={18} className="text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{forest.name}</h3>
                      <p className="text-sm text-gray-600">
                        Harvest area: {getForestHarvestArea(forestId).toFixed(2)} hectares • {forest.country}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Quantity: {shippingInfo.forestQuantities?.[forestId]?.toLocaleString() || 0} kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(sectionConfig).map(([key, config]) => {
                      const existingDocs = forest.documents[key] || [];
                      const newDocs = forestNewDocs[key] || [];
                      const allDocs = [...existingDocs, ...newDocs];

                      return (
                        <DocumentSection
                          key={`${forestId}-${key}`}
                          sectionKey={key}
                          title={config.title}
                          description={config.description}
                          documents={allDocs}
                          onAddDocument={addDocument}
                          onRemoveDocument={removeDocument}
                          forestId={forestId}
                          forestName={forest.name}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Total Summary */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Layers size={24} className="text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-green-800">Shipment Summary</h3>
                    <p className="text-sm text-green-600">
                      Complete overview of your shipment
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-green-700">
                    {getTotalHarvestArea().toFixed(2)} hectares
                  </div>
                  <div className="text-sm text-green-600">
                    Total harvest area
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {totalForestQuantity > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-green-700">Total Product Weight</p>
                      <p className="text-lg font-semibold text-green-800">{totalForestQuantity.toLocaleString()} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">Payment Due</p>
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">${calculatePayment(totalForestQuantity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center"
                >
                  <CreditCard size={18} />
                  Continue to Payment
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Documents & Media
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 6: Payment</h2>
              <p className="text-gray-600">
                Complete payment for your shipment. Rate: $100 per 20,000kg of product.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <PaymentInformation
                totalKg={totalForestQuantity}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleCreateShipment}
                disabled={isCreating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center order-1 sm:order-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Shipment...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Skip Payment & Create Shipment
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default NewShipmentOrigin;
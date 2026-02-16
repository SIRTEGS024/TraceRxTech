import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Webcam from "react-webcam";
import { useUserStore } from "../store/useUserStore"; // Import userStore

// UPDATED: Use the correct imports for Google Maps with provider pattern
import {
  GoogleMap,
  Polygon,
  Marker,
  DrawingManager,
} from "@react-google-maps/api";

// Helper function to calculate polygon area
// Helper function to calculate polygon area - UPDATED to handle both coordinate formats
const calculatePolygonArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) {
    console.log("calculatePolygonArea: Invalid coordinates", coordinates);
    return 0;
  }

  const earthRadius = 6378137; // Earth's radius in meters

  // Normalize coordinates to {lat, lng} format
  const normalizedCoords = coordinates.map((coord) => {
    if (Array.isArray(coord)) {
      return { lat: coord[0], lng: coord[1] };
    }
    return coord;
  });

  let area = 0;
  const coords = [...normalizedCoords, normalizedCoords[0]]; // Close the polygon

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];

    // Convert degrees to radians
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const lng1 = (p1.lng * Math.PI) / 180;
    const lng2 = (p2.lng * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * earthRadius ** 2) / 2);
  const hectares = parseFloat((area / 10000).toFixed(2)); // Convert to hectares

  console.log("calculatePolygonArea:", {
    hectares: hectares,
    points: normalizedCoords.length,
    firstPoint: normalizedCoords[0],
  });

  return hectares;
};
// Helper function to get center of polygon
const getPolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;

  let latSum = 0;
  let lngSum = 0;

  coordinates.forEach((coord) => {
    latSum += coord.lat;
    lngSum += coord.lng;
  });

  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length,
  };
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
  "Port of New York/New Jersey, USA",
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
  "YANG_MING",
];

// Payment calculation function - UPDATED: $100 per container
const calculatePayment = (containerCount) => {
  return containerCount * 100;
};

// Document Upload Modal Component
const DocumentUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  section,
  forestName,
}) => {
  const [description, setDescription] = useState("");
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
    h: "Tax, Anti-corruption, Trade & Customs",
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!description.trim() || !file) {
      toast.error("Please provide a description and select a file");
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newDocument = {
      id: Date.now(),
      name: file.name,
      description: description,
      uploadedAt: new Date().toISOString().split("T")[0],
      isNew: true,
    };

    onUpload(newDocument);
    setIsUploading(false);
    setDescription("");
    setFile(null);
    onClose();
    toast.success("Document uploaded successfully!");
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
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
                  {file ? file.name : "Click to select a file"}
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
            {isUploading ? "Uploading..." : "Upload Document"}
            {!isUploading && <Upload size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Payment Information Component
const PaymentInformation = ({ containerCount, onPaymentComplete }) => {
  const paymentAmount = calculatePayment(containerCount);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentMethod === "card" && (!cardNumber || !expiryDate || !cvv)) {
      toast.error("Please fill all card details");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onPaymentComplete();
    toast.success(`Payment of $${paymentAmount} processed successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Payment Information
          </h3>
        </div>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Total Containers</p>
                <p className="text-lg font-semibold text-gray-800">
                  {containerCount} containers
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Rate</p>
                <p className="text-lg font-semibold text-green-600">
                  $100 per container
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800">
                  Total Amount Due
                </p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    ${paymentAmount}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Calculated as: {containerCount} × $100
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
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                  paymentMethod === "card"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <CreditCard className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
                  paymentMethod === "bank"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <Building className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Card Details (only show if card selected) */}
          {paymentMethod === "card" && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
              <h4 className="font-medium text-gray-800">Card Details</h4>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 16),
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) =>
                      setExpiryDate(
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    placeholder="MM/YY"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="123"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details (only show if bank selected) */}
          {paymentMethod === "bank" && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">
                Bank Transfer Details
              </h4>
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
                  <span className="font-mono font-medium">
                    EUDR-{Date.now().toString().slice(-6)}
                  </span>
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

// UPDATED: Enhanced Forest Plot Selection Component with harvest area naming
const EnhancedForestPlotSelection = ({
  forest,
  selectedPlots,
  onPlotToggle,
  onNewPlotAdded,
  onPlotDeleted,
  isLoaded,
  newlyCreatedPlots = [],
  forestIndex,
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
  const [harvestAreaName, setHarvestAreaName] = useState("");

  // Plot colors for visualization - pre-defined areas use red, green, blue
  const plotColors = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#ef4444", // red
    "#f59e0b", // yellow (for custom plots)
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#10b981", // emerald
    "#f97316", // orange
  ];

  // Get all plots including newly created ones
  const allPlots = forest.plots || [];

  // Get the next harvest zone number for custom plots
  const getNextHarvestZoneNumber = () => {
    const customPlots = allPlots.filter((plot) => plot.isCustom);
    const allZoneNumbers = customPlots
      .map((plot) => {
        const match = plot.name.match(/Harvest Area (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0);

    if (allZoneNumbers.length === 0) return 1;
    return Math.max(...allZoneNumbers) + 1;
  };

  // Create unique save button ID for this forest
  const saveButtonId = `save-area-${forest.id}-${forestIndex}`;

  const onLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);

      // Fit bounds to show all plots (including newly created ones)
      if (allPlots.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        allPlots.forEach((plot) => {
          if (plot.coordinates && plot.coordinates.length > 0) {
            plot.coordinates.forEach((coord) => {
              bounds.extend(coord);
            });
          }
        });

        if (!bounds.isEmpty()) {
          mapInstance.fitBounds(bounds);
          mapInstance.panToBounds(bounds);

          // If there's only one plot, zoom in closer
          if (allPlots.length === 1) {
            setTimeout(() => {
              mapInstance.setZoom(15);
            }, 500);
          }
        }
      } else {
        // If no plots, use forest coordinates or default
        if (forest.coordinates) {
          setCenter(forest.coordinates);
          setZoom(12);
        } else {
          // Default center (Amazon region)
          setCenter({ lat: -3.4653, lng: -62.2159 });
          setZoom(10);
        }
      }
    },
    [forest, allPlots],
  );
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onDrawingManagerLoad = useCallback((manager) => {
    setDrawingManager(manager);
  }, []);

  const onPolygonComplete = useCallback(
    (polygon) => {
      if (!isDrawing) return;

      const paths = polygon.getPath();
      const coords = [];

      for (let i = 0; i < paths.getLength(); i++) {
        const point = paths.getAt(i);
        coords.push({
          lat: point.lat(),
          lng: point.lng(),
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
        isCustom: true,
      };

      setTempPlot(newPlot);
      setHarvestAreaName(defaultName);
      polygon.setMap(null);
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      setShowSavePrompt(true); // Show save prompt

      // Scroll to save button area for THIS specific forest
      setTimeout(() => {
        const saveButtonArea = document.getElementById(saveButtonId);
        if (saveButtonArea) {
          saveButtonArea.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    },
    [isDrawing, drawingManager, allPlots, saveButtonId],
  );

  const handlePlotToggle = (plotId) => {
    onPlotToggle(forest.id, plotId);
  };

  const handlePlotDelete = (plotId, e) => {
    e.stopPropagation(); // Prevent triggering the plot selection
    if (confirm("Are you sure you want to delete this harvest zone?")) {
      onPlotDeleted(forest.id, plotId);
    }
  };

  const toggleCoordinates = (plotId) => {
    setShowCoordinates((prev) => ({
      ...prev,
      [plotId]: !prev[plotId],
    }));
  };

  const startDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(
        window.google.maps.drawing.OverlayType.POLYGON,
      );
      setIsDrawing(true);
      setShowSavePrompt(false);
      setHarvestAreaName("");
    }
  };

  const cancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      setIsDrawing(false);
      setTempPlot(null);
      setShowSavePrompt(false);
      setHarvestAreaName("");
    }
  };

  const saveNewPlot = () => {
    if (tempPlot && harvestAreaName.trim()) {
      // GENERATE A UNIQUE ID WITH TIMESTAMP AND RANDOM NUMBER
      const uniqueId = `${forest.id}-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const permanentPlot = {
        ...tempPlot,
        id: uniqueId,
        name: harvestAreaName.trim(),
      };

      onNewPlotAdded(forest.id, permanentPlot);
      setTempPlot(null);
      setShowSavePrompt(false);
      setHarvestAreaName("");
      toast.success("New harvest area saved and added!");
    } else {
      toast.error("Please provide a name for the harvest area");
    }
  };

  const removeTempPlot = () => {
    setTempPlot(null);
    setShowSavePrompt(false);
    setHarvestAreaName("");
  };

  // Calculate total area of selected plots
  const selectedArea = allPlots
    .filter((plot) => selectedPlots.includes(plot.id))
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
            {selectedPlots.length} plot{selectedPlots.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showMap
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showMap ? "Show List View" : "Show Map View"}
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
              {selectedPlots.length} selected plot
              {selectedPlots.length !== 1 ? "s" : ""}
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
                Click on the map to draw your harvest area polygon. Close the
                polygon by clicking the first point.
              </p>
            )}

            {/* Save Prompt Area - FIXED: Uses unique ID for each forest */}
            <div id={saveButtonId} className="save-prompt-area">
              {tempPlot && (
                <div className="space-y-3 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-yellow-800 mb-2">
                        New Harvest Area Ready to Save
                      </h5>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-yellow-700 mb-1">
                            Harvest Area Name *
                          </label>
                          <input
                            type="text"
                            value={harvestAreaName}
                            onChange={(e) => setHarvestAreaName(e.target.value)}
                            className="w-full p-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Enter a name for this harvest area"
                          />
                        </div>
                        <div className="text-sm text-yellow-700">
                          <span className="font-medium">Area:</span>{" "}
                          {tempPlotArea.toFixed(2)} hectares
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveNewPlot}
                        disabled={!harvestAreaName.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Provide a name and click "Save Area" to add this custom
                    harvest zone
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-300">
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
              {/* Drawing Manager for new plots */}
              {showMap && isLoaded && (
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
                      fillColor: "transparent", // CHANGED
                      strokeColor: "#f59e0b",
                      strokeWeight: 2,
                      editable: false,
                      draggable: false,
                    },
                  }}
                />
              )}

              {/* Display all plots including newly created ones */}
              {allPlots.map((plot, index) => {
                if (!plot.coordinates || plot.coordinates.length < 3)
                  return null;

                // Use yellow for custom plots, otherwise use pre-defined colors based on index
                const color = plot.isCustom
                  ? "#f59e0b"
                  : plotColors[index % plotColors.length];
                const centerPoint = getPolygonCenter(plot.coordinates);
                const isSelected = selectedPlots.includes(plot.id);

                return (
                  <div key={plot.id}>
                    <Polygon
                      paths={plot.coordinates}
                      options={{
                        fillColor: "transparent", // REMOVED BACKGROUND COLOR
                        strokeColor: isSelected ? "#000000" : color,
                        strokeWeight: isSelected ? 4 : 3, // THICKER BORDER
                        strokeOpacity: 1,
                        clickable: true,
                        zIndex: isSelected ? 1000 : 1,
                      }}
                      onClick={() => handlePlotToggle(plot.id)}
                    />

                    {/* Label for selected plots - FIXED: Always use the plot color, not green for selected */}
                    {centerPoint && (
                      <Marker
                        position={centerPoint}
                        label={{
                          text: plot.name,
                          color: isSelected ? "#FFFFFF" : "#000000",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        icon={{
                          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                          fillColor: color, // ALWAYS use the plot color (yellow for custom plots)
                          fillOpacity: 1,
                          strokeColor: "#FFFFFF",
                          strokeWeight: 2,
                          scale: 1,
                          labelOrigin: new window.google.maps.Point(0, -30),
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Display temporary new plot in progress */}
              {tempPlot &&
                tempPlot.coordinates &&
                tempPlot.coordinates.length >= 3 && (
                  <Polygon
                    paths={tempPlot.coordinates}
                    options={{
                      fillColor: "transparent", // <-- CHANGED TO TRANSPARENT
                      strokeColor: "#f59e0b",
                      strokeWeight: 3,
                      strokeOpacity: 0.8,
                      clickable: false,
                      zIndex: 2000,
                    }}
                  />
                )}

              {/* Drawing Instructions Overlay */}
              {isDrawing && (
                <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg z-10 max-w-[90%]">
                  <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-1 sm:gap-2">
                    <Info size={12} className="hidden sm:block" />
                    Click on map to draw harvest area. Close polygon by clicking
                    first point.
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
                <h5 className="text-sm font-medium text-blue-800 mb-1">
                  Map Instructions
                </h5>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Select existing plots:</strong> Click on any
                    colored polygon to select/deselect
                  </li>
                  <li>
                    • <strong>Pre-defined plots:</strong> Red, Green, and Blue
                    areas are pre-defined harvest zones (Area 1, Area 2, Area 3)
                  </li>
                  <li>
                    • <strong>Draw new areas:</strong> Use "Draw New Harvest
                    Area" button to create custom polygons (yellow)
                  </li>
                  <li>
                    • <strong>Save new plots:</strong> After drawing, provide a
                    name and click "Save Area" to add the custom harvest zone
                  </li>
                  <li>
                    • <strong>Multiple selection:</strong> You can select
                    multiple plots from different areas
                  </li>
                  <li>
                    • <strong>Area calculation:</strong> Total harvest area
                    updates automatically
                  </li>
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
                  const color = plot.isCustom
                    ? "#f59e0b"
                    : plotColors[index % plotColors.length];
                  const showCoords = showCoordinates[plot.id];

                  return (
                    <div
                      key={plot.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected
                          ? "border-green-500 border-2 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            ></div>
                            <h5 className="font-medium text-gray-800 truncate">
                              {plot.name}
                            </h5>
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
                            <p className="text-xs text-gray-500 truncate">
                              {plot.locationName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          <button
                            onClick={() => toggleCoordinates(plot.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          >
                            {showCoords ? "Hide Coords" : "Show Coords"}
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
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle size={12} className="text-white" />
                            )}
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
                      {showCoords &&
                        plot.coordinates &&
                        plot.coordinates.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Coordinates:
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {plot.coordinates.map((coord, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-wrap items-center justify-between text-xs gap-1"
                                >
                                  <span className="text-gray-600">
                                    Point {idx + 1}:
                                  </span>
                                  <span className="font-mono text-gray-800 break-all">
                                    {coord.lat.toFixed(6)},{" "}
                                    {coord.lng.toFixed(6)}
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
                              ? "text-white bg-green-600 hover:bg-green-700"
                              : "text-green-600 border border-green-300 hover:bg-green-50"
                          }`}
                        >
                          {isSelected
                            ? "Deselect Area"
                            : "Select Area for Harvest"}
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
          <span className="font-medium">Instructions:</span> Select existing
          pre-defined harvest areas (Area 1, Area 2, Area 3) or draw new custom
          polygons to specify exactly where products for this shipment were
          harvested from within {forest.name}.{" "}
          <strong>Pre-defined areas</strong> are shown in red, green, and blue.{" "}
          <strong>Custom areas</strong> are drawn in yellow. Provide a name for
          new custom areas before saving.
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
  shipmentName,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [captureMode, setCaptureMode] = useState("photo");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState("photo"); // 'photo' or 'video'
  const [expandedMedia, setExpandedMedia] = useState(null);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStartTime = useRef(null);

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;

      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
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
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`,
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
                setAddress(addressParts.join(", "));
              }
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setAddress(`${coords.lat}, ${coords.lng}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not retrieve GPS location");
        },
      );
    }

    return () => clearInterval(timeInterval);
  }, []);

  // Toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setCameraFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment",
    );
    toast.success(
      `Switched to ${cameraFacingMode === "environment" ? "front" : "back"} camera`,
    );
  };

  // Start video recording
  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const stream = webcamRef.current.stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);

        const newVideo = {
          id: Date.now(),
          url: videoUrl,
          blob: blob,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          address: address,
          description: description,
          type: "video",
          shipmentId: shipmentId,
          shipmentName: shipmentName,
          cameraMode: cameraFacingMode,
          duration: (Date.now() - recordingStartTime.current) / 1000,
        };

        setCapturedVideos([...capturedVideos, newVideo]);
        setRecordedChunks([]);
        toast.success("Video recorded successfully!");
        setDescription("");
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
        type: "photo",
        shipmentId: shipmentId,
        shipmentName: shipmentName,
        cameraMode: cameraFacingMode,
      };

      setCapturedImages([...capturedImages, newImage]);
      toast.success("Image captured successfully!");
      setDescription("");
    }
  };

  // Handle capture based on mode
  const handleCapture = () => {
    if (mediaType === "photo") {
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
    if (type === "photo") {
      setCapturedImages(capturedImages.filter((img) => img.id !== id));
    } else {
      const video = capturedVideos.find((v) => v.id === id);
      if (video && video.url) {
        URL.revokeObjectURL(video.url);
      }
      setCapturedVideos(capturedVideos.filter((vid) => vid.id !== id));
    }
    toast.info("Media removed");
  };

  // Save all media to shipment
  const saveToShipment = () => {
    if (capturedImages.length === 0 && capturedVideos.length === 0) {
      toast.error("No media to save");
      return;
    }

    const allMedia = [
      ...capturedImages.map((img) => ({
        ...img,
        uploadedAt: new Date().toISOString(),
      })),
      ...capturedVideos.map((vid) => ({
        ...vid,
        uploadedAt: new Date().toISOString(),
      })),
    ];

    // Pass media to parent component
    onSaveMedia(allMedia);

    // Clean up video URLs
    capturedVideos.forEach((video) => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });

    // Reset state
    setCapturedImages([]);
    setCapturedVideos([]);
    setDescription("");
    setIsCameraActive(false);
    setExpandedMedia(null);
    setIsRecording(false);

    toast.success(
      `Saved ${capturedImages.length} photo(s) and ${capturedVideos.length} video(s) to shipment`,
    );
  };

  // Format time in seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Video constraints
  const videoConstraints = {
    facingMode: cameraFacingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
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
                    <h4 className="font-semibold text-gray-800">
                      Camera Control
                    </h4>
                    <button
                      onClick={() => setIsCameraActive(!isCameraActive)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isCameraActive
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      <Camera size={20} />
                      {isCameraActive ? "Turn Off Camera" : "Activate Camera"}
                    </button>
                  </div>

                  {/* Media Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMediaType("photo")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                          mediaType === "photo"
                            ? "bg-blue-100 border-blue-500 text-blue-800"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Camera size={16} />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={() => setMediaType("video")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                          mediaType === "video"
                            ? "bg-red-100 border-red-500 text-red-800"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
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
                      <h4 className="font-medium text-gray-700 mb-3">
                        Live Camera
                      </h4>

                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        {/* GPS/Time Overlay */}
                        <div className="absolute top-2 left-2 right-2 z-10">
                          <div className="flex flex-col gap-1 bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="flex-shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-medium truncate">
                                  {currentLocation
                                    ? `${currentLocation.lat}, ${currentLocation.lng}`
                                    : "Getting location..."}
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
                              {recordingStartTime.current &&
                                formatTime(
                                  (Date.now() - recordingStartTime.current) /
                                    1000,
                                )}
                            </span>
                          </div>
                        )}

                        <Webcam
                          ref={webcamRef}
                          audio={mediaType === "video"}
                          screenshotFormat="image/png"
                          videoConstraints={videoConstraints}
                          className="w-full h-auto"
                          mirrored={cameraFacingMode === "user"}
                        />

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                          {/* Camera flip button - show on mobile or always */}
                          {isMobile && (
                            <button
                              onClick={toggleCameraFacingMode}
                              className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-full font-medium shadow-lg transition-all hover:scale-105"
                            >
                              <RotateCw size={14} />
                              {cameraFacingMode === "environment"
                                ? "Front"
                                : "Back"}
                            </button>
                          )}

                          <button
                            onClick={handleCapture}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105 ${
                              mediaType === "video" && isRecording
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-white/90 hover:bg-white text-gray-800"
                            }`}
                          >
                            {mediaType === "photo" ? (
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
                          Switch to{" "}
                          {cameraFacingMode === "environment"
                            ? "Front"
                            : "Back"}{" "}
                          Camera
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={saveToShipment}
                    disabled={
                      capturedImages.length === 0 && capturedVideos.length === 0
                    }
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      capturedImages.length === 0 && capturedVideos.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <CheckCircle size={20} />
                    Save {capturedImages.length} Photo(s) and{" "}
                    {capturedVideos.length} Video(s) to Shipment
                  </button>
                </div>
              </div>

              {/* Right Panel: Captured Media */}
              <div className="p-4 lg:p-6 overflow-y-auto h-full">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Captured Media
                </h4>

                {capturedImages.length === 0 && capturedVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Camera className="mx-auto mb-2" size={48} />
                    <p>No media captured yet</p>
                    <p className="text-sm">
                      Activate the camera and capture photos or videos
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Display Images */}
                    {capturedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedMedia({ ...image, type: "photo" })
                          }
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
                            removeMedia(image.id, "photo");
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
                          onClick={() =>
                            setExpandedMedia({ ...video, type: "video" })
                          }
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
                            removeMedia(video.id, "video");
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
              <span className="font-medium">GPS Status:</span>{" "}
              {currentLocation ? "Active" : "Inactive"}
              <span className="mx-2">•</span>
              <span className="font-medium">Location:</span>{" "}
              {address
                ? address.substring(0, 50) + (address.length > 50 ? "..." : "")
                : "Unknown"}
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
                disabled={
                  capturedImages.length === 0 && capturedVideos.length === 0
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  capturedImages.length === 0 && capturedVideos.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
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
                {expandedMedia.type === "photo" ? (
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
                      <p>
                        <span className="text-gray-400">Type:</span>{" "}
                        {expandedMedia.type === "photo" ? "Photo" : "Video"}
                      </p>
                      <p>
                        <span className="text-gray-400">Shipment:</span>{" "}
                        {expandedMedia.shipmentName}
                      </p>
                      <p>
                        <span className="text-gray-400">Captured:</span>{" "}
                        {new Date(expandedMedia.timestamp).toLocaleString()}
                      </p>
                      {expandedMedia.description && (
                        <p>
                          <span className="text-gray-400">Description:</span>{" "}
                          {expandedMedia.description}
                        </p>
                      )}
                      {expandedMedia.type === "video" && (
                        <p>
                          <span className="text-gray-400">Duration:</span>{" "}
                          {formatTime(expandedMedia.duration || 0)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>
                          {expandedMedia.address ||
                            (expandedMedia.location
                              ? `${expandedMedia.location.lat}, ${expandedMedia.location.lng}`
                              : "No location data")}
                        </span>
                      </p>
                      {expandedMedia.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span>{" "}
                          {expandedMedia.location.lat},{" "}
                          {expandedMedia.location.lng}
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

                    {expandedMedia.type === "photo" ? (
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
  totalForestQuantity,
}) => {
  const [showContainerForm, setShowContainerForm] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [containerForm, setContainerForm] = useState({
    containerNumber: "",
    kilograms: "",
    packingList: null,
  });

  // Calculate remaining quantity that can be allocated to containers
  const allocatedQuantity = containers.reduce(
    (sum, container) => sum + (container.kilograms || 0),
    0,
  );
  const remainingQuantity = totalForestQuantity - allocatedQuantity;
  const isTotalAllocated = Math.abs(remainingQuantity) < 0.01; // Account for floating point

  const handleAddContainer = () => {
    if (
      !containerForm.containerNumber ||
      !containerForm.kilograms ||
      !containerForm.packingList
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const containerKg = parseFloat(containerForm.kilograms);

    // Check if adding this container would exceed total forest quantity
    if (allocatedQuantity + containerKg > totalForestQuantity) {
      toast.error(
        `Cannot exceed total forest quantity of ${totalForestQuantity.toLocaleString()} kg. Remaining: ${remainingQuantity.toLocaleString()} kg`,
      );
      return;
    }

    const newContainer = {
      id: editingContainer ? editingContainer.id : Date.now(),
      containerNumber: containerForm.containerNumber,
      kilograms: containerKg,
      packingList: {
        name: containerForm.packingList.name,
        url: "https://cloud-storage.com/docs/shipment/packing-list.pdf", // Dummy URL
      },
    };

    if (editingContainer) {
      onUpdateContainer(newContainer);
    } else {
      onAddContainer(newContainer);
    }

    setContainerForm({ containerNumber: "", kilograms: "", packingList: null });
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
      setContainerForm((prev) => ({ ...prev, packingList: files[0] }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Containers</h3>
          <p className="text-sm text-gray-600">
            Allocated:{" "}
            <span className="font-semibold">
              {allocatedQuantity.toLocaleString()} kg
            </span>
            {" / "}
            Total:{" "}
            <span className="font-semibold">
              {totalForestQuantity.toLocaleString()} kg
            </span>
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
      <div
        className={`p-3 rounded-lg ${isTotalAllocated ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package
              size={16}
              className={
                isTotalAllocated ? "text-green-600" : "text-yellow-600"
              }
            />
            <span
              className={`font-medium ${isTotalAllocated ? "text-green-800" : "text-yellow-800"}`}
            >
              Quantity Allocation
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-sm ${isTotalAllocated ? "text-green-600" : "text-yellow-600"}`}
            >
              {isTotalAllocated
                ? "✅ Fully Allocated"
                : `Remaining: ${remainingQuantity.toLocaleString()} kg`}
            </span>
          </div>
        </div>
        {!isTotalAllocated && (
          <p className="text-xs text-yellow-600 mt-1">
            Add containers to allocate the remaining{" "}
            {remainingQuantity.toLocaleString()} kg
          </p>
        )}
      </div>

      {/* Container List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {containers.map((container, index) => (
          <div
            key={container.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Container
                    size={16}
                    className="text-green-600 flex-shrink-0"
                  />
                  <h4 className="font-medium text-gray-800 truncate">
                    Container #{container.containerNumber}
                  </h4>
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

            <div className="space-y:2">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  {container.packingList?.name || "Packing list"}
                </span>
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
              {allocatedQuantity.toLocaleString()} /{" "}
              {totalForestQuantity.toLocaleString()} kg
            </div>
            <div
              className={`text-sm ${Math.abs(remainingQuantity) < 0.01 ? "text-green-600" : "text-red-600"}`}
            >
              {Math.abs(remainingQuantity) < 0.01
                ? "✓ Quantities Match"
                : `✗ Difference: ${remainingQuantity.toLocaleString()} kg`}
            </div>
          </div>
        </div>

        {/* Progress bar showing allocation */}
        {totalForestQuantity > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Allocation Progress</span>
              <span>
                {Math.round((allocatedQuantity / totalForestQuantity) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(allocatedQuantity / totalForestQuantity) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Preview */}
      {containers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-yellow-600 flex-shrink-0" />
            <h4 className="font-medium text-yellow-800">Payment Preview</h4>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-yellow-700">
                {containers.length} containers × $100 per container
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-700">
                ${calculatePayment(containers.length)}
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
                {editingContainer ? "Edit Container" : "Add New Container"}
              </h3>
              <button
                onClick={() => {
                  setShowContainerForm(false);
                  setEditingContainer(null);
                }}
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
                    onChange={(e) =>
                      setContainerForm((prev) => ({
                        ...prev,
                        containerNumber: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., MSCU1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilograms per Container *
                  </label>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">
                      Available: {remainingQuantity.toLocaleString()} kg
                    </span>
                    {editingContainer && (
                      <span className="text-blue-600">
                        Currently: {editingContainer.kilograms.toLocaleString()}{" "}
                        kg
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
                      const limitedValue =
                        value === ""
                          ? ""
                          : Math.min(parseFloat(value) || 0, maxKg);

                      setContainerForm((prev) => ({
                        ...prev,
                        kilograms:
                          limitedValue === "" ? "" : limitedValue.toString(),
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
                    <label
                      htmlFor="packing-list-upload"
                      className="cursor-pointer"
                    >
                      <FileText
                        className="mx-auto mb-2 text-gray-400"
                        size={24}
                      />
                      <p className="text-sm text-gray-600">
                        {containerForm.packingList
                          ? containerForm.packingList.name
                          : "Click to select packing list PDF"}
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
                      <span>
                        {Math.round(
                          (allocatedQuantity / totalForestQuantity) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(allocatedQuantity / totalForestQuantity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowContainerForm(false);
                  setEditingContainer(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContainer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 order-1 sm:order-2"
              >
                {editingContainer ? "Update Container" : "Add Container"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Document Section Component - UPDATED: Remove add/remove functionality
const DocumentSection = ({
  sectionKey,
  title,
  description,
  documents = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-medium text-gray-800 text-sm truncate">
            {title}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              documents.length > 0
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600 mb-3">{description}</p>

              {/* Existing Documents */}
              {documents.length > 0 ? (
                <div className="mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {documents.map((doc) => (
                      <div
                        key={`existing-${doc.id}`}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <FileText
                            size={14}
                            className="text-gray-500 flex-shrink-0"
                          />
                          <div className="truncate min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {doc.uploadedAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600">No documents available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Forest-specific Product Information Component
const ForestProductInformation = ({
  forest,
  selectedHS,
  onHSSelect,
  formData,
  onChange,
  facilityData,
}) => {
  const [expandedCommodity, setExpandedCommodity] = useState(null);

  const handleHSSelect = (product) => {
    const exists = selectedHS.find((p) => p.code === product.code);

    if (exists) {
      onHSSelect(
        forest.id,
        selectedHS.filter((p) => p.code !== product.code),
      );
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
        [forest.id]: value,
      },
    });
  };

  // Get supported products from facility data
  const supportedProducts = facilityData?.supportedProducts || [];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 mb-1">{forest.name}</h4>
            <p className="text-sm text-gray-600 truncate">
              {forest.address} • {forest.totalHectares || 0} hectares
            </p>
          </div>
        </div>

        {/* HS Code Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select HS Codes for this Forest/Production Site *
          </label>
          {supportedProducts.length > 0 ? (
            <div className="space-y-3">
              {supportedProducts.map((commodity) => (
                <div
                  key={commodity.commodity}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCommodity(
                        expandedCommodity === commodity.commodity
                          ? null
                          : commodity.commodity,
                      )
                    }
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="font-medium text-gray-800 truncate">
                        {commodity.commodity}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({commodity.products.length} products available)
                      </span>
                    </div>
                    {expandedCommodity === commodity.commodity ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedCommodity === commodity.commodity && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t grid grid-cols-1 gap-2">
                          {commodity.products.map((product) => {
                            const isSelected = selectedHS.some(
                              (p) => p.code === product.code,
                            );
                            return (
                              <div
                                key={product.code}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
                                onClick={() =>
                                  handleHSSelect({
                                    ...product,
                                    commodity: commodity.commodity,
                                    forestId: forest.id,
                                  })
                                }
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileDigit
                                        size={14}
                                        className="text-gray-500 flex-shrink-0"
                                      />
                                      <span className="font-medium text-gray-800">
                                        {product.code}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                      {product.name}
                                    </p>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-green-500 border-green-500" : "border-gray-300"}`}
                                  >
                                    {isSelected && (
                                      <CheckCircle
                                        size={12}
                                        className="text-white"
                                      />
                                    )}
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
              No supported products found for this facility
            </div>
          )}
        </div>

        {/* Selected HS Codes Summary */}
        {selectedHS.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">
              Selected HS Codes for this Forest:
            </h5>
            <div className="space-y-1">
              {selectedHS.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1"
                >
                  <div className="min-w-0">
                    <span className="font-medium">{product.code}</span>
                    <span className="text-gray-600 ml-2 truncate">
                      {product.name}
                    </span>
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
          <p className="text-xs text-gray-500 mb-2">
            Enter the quantity harvested from this specific forest
          </p>
          <input
            type="number"
            value={formData.forestQuantities?.[forest.id] || ""}
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
  onForestHSSelect,
  exporterData,
}) => {
  const [productDescription, setProductDescription] = useState(
    formData.productDescription || "",
  );

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setProductDescription(value);
    onChange({ ...formData, productDescription: value });
  };

  // Calculate total quantity from all forests
  const totalForestQuantity = Object.values(
    formData.forestQuantities || {},
  ).reduce((sum, qty) => sum + (parseFloat(qty) || 0), 0);
  const containerCount = formData.containers?.length || 0;
  const paymentAmount = calculatePayment(containerCount);

  // Get all selected HS codes across all forests
  const allSelectedHS = Object.values(forestHSSelections).flat();

  // Generate combined HS codes string
  const hsCodes = [...new Set(allSelectedHS.map((p) => p.code))].join(", ");

  // Generate product names string
  const productNames = [...new Set(allSelectedHS.map((p) => p.name))].join(
    ", ",
  );

  // Generate species info for wood products
  const woodProducts = allSelectedHS.filter((p) => p.commodity === "Wood");
  const speciesInfo =
    woodProducts.length > 0
      ? woodProducts.map((p) => `${p.name} (HS: ${p.code})`).join("; ")
      : "";

  // Update parent form data whenever selections change
  useEffect(() => {
    onChange({
      ...formData,
      hsCodes,
      productNames,
      speciesInfo,
      quantity: totalForestQuantity,
      paymentAmount: paymentAmount,
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
          Select HS codes and specify quantities for each forest in this
          shipment.
        </p>
      </div>

      {/* Product Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          A. Overall Product Description *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Include trade name, type, list of relevant commodities or products
          contained or used
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
      {selectedForests.map((forestId) => {
        const facility = exporterData?.facilities?.find(
          (f) => f.id === forestId,
        );
        if (!facility) return null;

        return (
          <ForestProductInformation
            key={forestId}
            forest={facility}
            selectedHS={forestHSSelections[forestId] || []}
            onHSSelect={(forestId, selectedHS) =>
              onForestHSSelect(forestId, selectedHS)
            }
            formData={formData}
            onChange={onChange}
            facilityData={facility}
          />
        );
      })}

      {/* Summary Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Shipment Summary
        </h3>

        {/* Selected HS Codes Summary */}
        {allSelectedHS.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-green-700 mb-2">
              Selected HS Codes:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allSelectedHS.map((product, index) => {
                const facility = exporterData?.facilities?.find(
                  (f) => f.id === product.forestId,
                );
                return (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg border border-green-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <span className="font-medium">{product.code}</span>
                      <span className="text-sm text-gray-600 truncate">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                      <span className="text-gray-500">{product.commodity}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {facility?.name || "Unknown Facility"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Species Information (for wood products) */}
        {woodProducts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Wood Species Information
            </h4>
            <p className="text-sm text-blue-700">{speciesInfo}</p>
          </div>
        )}

        {/* Quantity and Payment Summary */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">
                Forest Quantities
              </h4>
              <div className="space-y-2">
                {Object.entries(formData.forestQuantities || {}).map(
                  ([forestId, quantity]) => {
                    const facility = exporterData?.facilities?.find(
                      (f) => f.id === forestId,
                    );
                    if (!facility || !quantity) return null;

                    return (
                      <div
                        key={forestId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1"
                      >
                        <span className="text-gray-600 truncate">
                          {facility.name}
                        </span>
                        <span className="font-medium">
                          {quantity.toLocaleString()} kg
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UPDATED: Shipping Information Form Component with userStore integration
const ShippingInfoForm = ({
  formData,
  onChange,
  selectedForests,
  onForestToggle,
  exporterData,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  // Get exporter's linked importers
  const linkedImporters =
    exporterData?.importers
      ?.map((importerId) => {
        const importer = useUserStore.getState().demoData.users[importerId];
        return importer
          ? {
              id: importerId,
              name: importer.basicInfo?.companyName || "Unknown",
              country: importer.basicInfo?.country || "Unknown",
            }
          : null;
      })
      .filter(Boolean) || [];

  // Get exporter's forest/production facilities
  const forestFacilities =
    exporterData?.facilities?.filter(
      (f) => f.type === "production/forest site",
    ) || [];

  // Get exporter's processing/loading facilities
  const processingFacilities =
    exporterData?.facilities?.filter((f) => f.type === "Corporate facility") ||
    [];

  const filteredForests = forestFacilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchTerm.toLowerCase()),
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
              onChange={(e) =>
                handleInputChange("productionDate", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Processing/Loading *
            </label>
            <input
              type="date"
              value={formData.processingDate}
              onChange={(e) =>
                handleInputChange("processingDate", e.target.value)
              }
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
              onChange={(e) => handleInputChange("importer", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select importer/consignee</option>
              {linkedImporters.map((importer) => (
                <option key={importer.id} value={importer.id}>
                  {importer.name} ({importer.country})
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
                      {selectedForests.length} forest
                      {selectedForests.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-500 flex-shrink-0"
                />
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
                    {filteredForests.map((facility) => {
                      const isSelected = selectedForests.includes(facility.id);
                      return (
                        <div
                          key={facility.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-green-50" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onForestToggle(facility.id);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Trees
                                size={14}
                                className="text-green-600 flex-shrink-0"
                              />
                              <span className="font-medium text-gray-800 truncate">
                                {facility.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="truncate">
                                {facility.address}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                {facility.totalHectares || 0} hectares
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ml-2 flex-shrink-0 ${
                              isSelected
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle size={12} className="text-white" />
                            )}
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
                  {selectedForests.slice(0, 3).map((facilityId) => {
                    const facility = forestFacilities.find(
                      (f) => f.id === facilityId,
                    );
                    if (!facility) return null;
                    return (
                      <span
                        key={facilityId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                      >
                        <span className="truncate max-w-[100px]">
                          {facility.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onForestToggle(facilityId)}
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
            <p className="text-xs text-gray-500 mt-1">
              Select one or more forests involved in this shipment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing/Loading Site *
            </label>
            <select
              value={formData.processingSite}
              onChange={(e) =>
                handleInputChange("processingSite", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select a processing/loading site</option>
              {processingFacilities.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} • {site.address}
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
              onChange={(e) =>
                handleInputChange("shippingLine", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select shipping line</option>
              {shippingLines.map((line) => (
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
              onChange={(e) =>
                handleInputChange("portOfShipment", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select port of shipment</option>
              {portsList.map((port) => (
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
              onChange={(e) =>
                handleInputChange("portOfDestination", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select port of destination</option>
              {portsList.map((port) => (
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
const ShipmentMediaSection = ({
  shipmentMedia = [],
  onAddMedia,
  onRemoveMedia,
}) => {
  const [showCamera, setShowCamera] = useState(false);

  const handleSaveMedia = (media) => {
    onAddMedia(media);
    setShowCamera(false);
  };

  // Group media by type
  const photos = shipmentMedia.filter((item) => item.type === "photo");
  const videos = shipmentMedia.filter((item) => item.type === "video");

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Shipment Media
            </h3>
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
                  <div className="text-xl font-bold text-green-700">
                    {photos.length}
                  </div>
                  <div className="text-sm text-green-600">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">
                    {videos.length}
                  </div>
                  <div className="text-sm text-green-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">
                    {shipmentMedia.length}
                  </div>
                  <div className="text-sm text-green-600">Total Media</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">
                  All media include GPS location and timestamp
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Media Grid */}
        {shipmentMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {shipmentMedia.map((media) => (
              <div key={media.id} className="relative group">
                {media.type === "photo" ? (
                  <div className="relative">
                    <img
                      src={media.src}
                      alt={media.description || "Shipment photo"}
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

// Generate batch number
const generateBatchNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${year}${month}${day}-${random}`;
};

// Main Component - UPDATED: Integrated with userStore
const NewShipmentOrigin = () => {
  const { user, demoData, updateUser } = useUserStore();
  const [selectedForests, setSelectedForests] = useState([]);
  const [shipmentData, setShipmentData] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    productionDate: "",
    processingDate: "",
    importer: "",
    processingSite: "",
    shippingLine: "",
    portOfShipment: "",
    portOfDestination: "",
    productDescription: "",
    hsCodes: "",
    productNames: "",
    speciesInfo: "",
    quantity: 0,
    unit: "kilograms",
    paymentAmount: 0,
    forestQuantities: {},
  });
  const [containers, setContainers] = useState([]);
  const [selectedForestPlots, setSelectedForestPlots] = useState({});
  const [newlyCreatedPlots, setNewlyCreatedPlots] = useState({});
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [forestHSSelections, setForestHSSelections] = useState({});
  const [shipmentMedia, setShipmentMedia] = useState([]);
  const [exporterData, setExporterData] = useState(null);

  // Use custom hook to check if Google Maps is loaded (via the provider)
  const isLoaded = useGoogleMapsStatus();

  // Get exporter data from userStore
  useEffect(() => {
    if (user) {
      // Check if user is logged in as a company
      if (user.loggedInAs?.companyId) {
        const company = demoData.users[user.loggedInAs.companyId];
        if (company && company.role === "exporter") {
          setExporterData(company);
        }
      } else if (user.role === "exporter") {
        setExporterData(user);
      }
    }
  }, [user, demoData]);

  // Calculate total forest quantity
  const totalForestQuantity = selectedForests.reduce((total, forestId) => {
    return total + (parseFloat(shippingInfo.forestQuantities?.[forestId]) || 0);
  }, 0);

  const sectionConfig = {
    a: {
      title: "(a) Land Use Rights",
      description:
        "Purchase receipt, title documents, survey plan (with coordinates), site plan, fee, levies or charges agreements, location of forest, ownership type etc",
    },
    b: {
      title: "(b) Environmental Protection",
      description: "Environmental Impact Assessment or approval etc",
    },
    c: {
      title: "(c) Forest-related rules",
      description:
        "Forest management and biodiversity conservation, where directly related to wood harvesting: Such as type of forest, Forest Management Plan, institution that prepared the Management plan and inventory etc of species used to produce the current shipment, for wood derivatives including wood charcoal: includes the names of species, their scientific and local names, description etc",
    },
    d: {
      title: "(d) Third Parties Rights",
      description: "Agreements, sublease etc",
    },
    e: {
      title: "(e) Labour Rights",
      description: "Workers rights & safety, payment of workers etc",
    },
    f: {
      title: "(f) Human Rights",
      description: "Human rights compliance under international law",
    },
    g: {
      title: "(g) FPIC (Free, Prior, Informed Consent)",
      description:
        "Including as set out in the UN Declaration on the Rights of Indigenous Peoples",
    },
    h: {
      title: "(h) Tax, Anti-corruption, Trade & Customs",
      description:
        "Tax, anti-corruption, trade and customs compliance documentation",
    },
  };

  const toggleForest = (forestId) => {
    setSelectedForests((prev) => {
      if (prev.includes(forestId)) {
        const newData = { ...shipmentData };
        delete newData[forestId];
        setShipmentData(newData);

        setSelectedForestPlots((prevPlots) => {
          const newPlots = { ...prevPlots };
          delete newPlots[forestId];
          return newPlots;
        });

        setNewlyCreatedPlots((prevPlots) => {
          const newPlots = { ...prevPlots };
          delete newPlots[forestId];
          return newPlots;
        });

        setForestHSSelections((prev) => {
          const newSelections = { ...prev };
          delete newSelections[forestId];
          return newSelections;
        });

        // Remove forest quantity
        const newQuantities = { ...shippingInfo.forestQuantities };
        delete newQuantities[forestId];
        setShippingInfo((prev) => ({
          ...prev,
          forestQuantities: newQuantities,
        }));

        return prev.filter((id) => id !== forestId);
      } else {
        return [...prev, forestId];
      }
    });
  };

  const addDocument = (forestId, sectionKey, document) => {
    setShipmentData((prev) => {
      const forestData = prev[forestId] || { documents: {} };
      const sectionDocuments = forestData.documents[sectionKey] || [];

      return {
        ...prev,
        [forestId]: {
          ...forestData,
          documents: {
            ...forestData.documents,
            [sectionKey]: [...sectionDocuments, document],
          },
        },
      };
    });
  };

  const removeDocument = (forestId, sectionKey, documentId) => {
    setShipmentData((prev) => {
      const forestData = prev[forestId];
      if (!forestData) return prev;

      const updatedDocuments = {
        ...forestData.documents,
        [sectionKey]: forestData.documents[sectionKey].filter(
          (doc) => doc.id !== documentId,
        ),
      };

      return {
        ...prev,
        [forestId]: {
          ...forestData,
          documents: updatedDocuments,
        },
      };
    });
  };

  const addContainer = (container) => {
    setContainers((prev) => [...prev, container]);
  };

  const updateContainer = (updatedContainer) => {
    setContainers((prev) =>
      prev.map((container) =>
        container.id === updatedContainer.id ? updatedContainer : container,
      ),
    );
  };

  const removeContainer = (containerId) => {
    setContainers((prev) =>
      prev.filter((container) => container.id !== containerId),
    );
  };

  const handlePlotToggle = (forestId, plotId) => {
    setSelectedForestPlots((prev) => {
      const currentPlots = prev[forestId] || [];
      const newPlots = currentPlots.includes(plotId)
        ? currentPlots.filter((id) => id !== plotId)
        : [...currentPlots, plotId];

      return {
        ...prev,
        [forestId]: newPlots,
      };
    });
  };

  const handleNewPlotAdded = (forestId, newPlot) => {
    console.log(
      "handleNewPlotAdded: Adding plot for forest",
      forestId,
      newPlot,
    );

    // Ensure coordinates are properly formatted
    const formattedPlot = {
      ...newPlot,
      coordinates: newPlot.coordinates.map((coord) => ({
        lat: typeof coord.lat === "function" ? coord.lat() : coord.lat,
        lng: typeof coord.lng === "function" ? coord.lng() : coord.lng,
      })),
    };

    setNewlyCreatedPlots((prev) => ({
      ...prev,
      [forestId]: [...(prev[forestId] || []), formattedPlot],
    }));

    // Auto-select the new plot
    handlePlotToggle(forestId, formattedPlot.id);
    toast.success(
      `Added "${formattedPlot.name}" - ${formattedPlot.hectares} hectares`,
    );
  };

  const handlePlotDeleted = (forestId, plotId) => {
    // Remove from newly created plots
    setNewlyCreatedPlots((prev) => ({
      ...prev,
      [forestId]: (prev[forestId] || []).filter((plot) => plot.id !== plotId),
    }));

    // Remove from selected plots if selected
    setSelectedForestPlots((prev) => ({
      ...prev,
      [forestId]: (prev[forestId] || []).filter((id) => id !== plotId),
    }));

    toast.success("Harvest zone deleted successfully!");
  };

  const handleForestHSSelect = (forestId, selectedHS) => {
    setForestHSSelections((prev) => ({
      ...prev,
      [forestId]: selectedHS,
    }));
  };

  const getForestPlots = (forestId) => {
    const forest = exporterData?.facilities?.find((f) => f.id === forestId);

    // Convert existing plots to proper format
    const existingPlots = (forest?.areas || []).map((area, index) => {
      // Convert coordinate format from [lat, lng] to {lat, lng}
      const coordinates = (area.coordinates || []).map((coord) => {
        if (Array.isArray(coord)) {
          return { lat: coord[0], lng: coord[1] };
        }
        return coord; // Already in object format
      });

      return {
        id: area.id || `predefined-${forestId}-${index}`,
        name: area.name || `Pre-defined Area ${index + 1}`,
        coordinates: coordinates,
        hectares: area.hectares || 0,
        locationName: forest?.name || "Forest Area",
        isPredefined: true,
        isCustom: false,
      };
    });

    const newPlots = newlyCreatedPlots[forestId] || [];

    // FILTER OUT ANY NEW PLOTS THAT MIGHT ALREADY BE IN EXISTING PLOTS
    const uniqueNewPlots = newPlots.filter(
      (newPlot) =>
        !existingPlots.some((existing) => existing.id === newPlot.id),
    );

    return [...existingPlots, ...uniqueNewPlots];
  };

  const getForestHarvestArea = (forestId) => {
    const allPlots = getForestPlots(forestId);
    const selectedPlotIds = selectedForestPlots[forestId] || [];

    return allPlots
      .filter((plot) => selectedPlotIds.includes(plot.id))
      .reduce((total, plot) => total + (plot.hectares || 0), 0);
  };

  const getTotalHarvestArea = () => {
    return selectedForests.reduce((total, forestId) => {
      return total + getForestHarvestArea(forestId);
    }, 0);
  };

  const validateShippingInfo = () => {
    const requiredFields = [
      "productionDate",
      "processingDate",
      "importer",
      "processingSite",
      "shippingLine",
      "portOfShipment",
      "portOfDestination",
    ];

    for (const field of requiredFields) {
      if (!shippingInfo[field]?.toString().trim()) {
        const fieldName = field.replace(/([A-Z])/g, " $1").toLowerCase();
        toast.error(`Please fill in ${fieldName}`);
        return false;
      }
    }

    // Check if at least one forest is selected
    if (selectedForests.length === 0) {
      toast.error("Please select at least one forest");
      return false;
    }

    const productionDate = new Date(shippingInfo.productionDate);
    const processingDate = new Date(shippingInfo.processingDate);

    if (processingDate < productionDate) {
      toast.error("Processing date cannot be before production date");
      return false;
    }

    return true;
  };

  const validateProductInfo = () => {
    if (!shippingInfo.productDescription?.trim()) {
      toast.error("Please fill in product description");
      return false;
    }

    // Check if each forest has at least one HS code selected
    for (const forestId of selectedForests) {
      if (!forestHSSelections[forestId]?.length) {
        const facility = exporterData?.facilities?.find(
          (f) => f.id === forestId,
        );
        toast.error(
          `Please select at least one HS code for ${facility?.name || "this facility"}`,
        );
        return false;
      }

      // Check if quantity is provided for each forest
      if (
        !shippingInfo.forestQuantities?.[forestId] ||
        shippingInfo.forestQuantities[forestId] <= 0
      ) {
        const facility = exporterData?.facilities?.find(
          (f) => f.id === forestId,
        );
        toast.error(
          `Please enter quantity for ${facility?.name || "this facility"}`,
        );
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
      toast.error("Please add at least one container");
      setStep(4); // Go to containers step
      return;
    }

    // Check if container quantities match total forest quantity
    const allocatedQuantity = containers.reduce(
      (sum, container) => sum + (container.kilograms || 0),
      0,
    );
    const remainingQuantity = totalForestQuantity - allocatedQuantity;

    if (Math.abs(remainingQuantity) > 0.01) {
      // Allow small rounding differences
      toast.error(
        `Container quantities (${allocatedQuantity.toLocaleString()} kg) must equal total forest quantity (${totalForestQuantity.toLocaleString()} kg). Remaining: ${remainingQuantity.toLocaleString()} kg`,
      );
      setStep(4);
      return;
    }

    // Check payment if not already completed
    const paymentAmount = calculatePayment(containers.length);

    if (paymentAmount > 0 && !paymentCompleted) {
      // Show payment step
      setStep(6);
      return;
    }

    setIsCreating(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const selectedImporter = demoData.users[shippingInfo.importer];
    const selectedProcessingSite = exporterData?.facilities?.find(
      (f) => f.id === shippingInfo.processingSite,
    );

    // Prepare harvest areas
    const harvestAreasByForest = {};

    selectedForests.forEach((forestId) => {
      const plotIds = selectedForestPlots[forestId] || [];
      if (plotIds.length > 0) {
        const allPlots = getForestPlots(forestId);
        harvestAreasByForest[forestId] = allPlots
          .filter((plot) => plotIds.includes(plot.id))
          .map((plot, index) => ({
            id: `harvest-area-${index + 1}`,
            name: plot.name,
            hectares: plot.hectares,
            // FIX: Convert coordinates from {lat, lng} to [lat, lng] array format
            coordinates: plot.coordinates.map((coord) => [
              coord.lat,
              coord.lng,
            ]),
          }));
      }
    });

    // Calculate total hectares
    const totalHectares = Object.values(harvestAreasByForest).reduce(
      (total, areas) => {
        return (
          total +
          areas.reduce((areaSum, area) => areaSum + (area.hectares || 0), 0)
        );
      },
      0,
    );

    // Generate batch number
    const batchNumber = generateBatchNumber();
    const shipmentId = `shipment-${Date.now()}`;

    // Prepare forests data for shipment
    const shipmentForests = selectedForests.map((forestId) => {
      const facility = exporterData?.facilities?.find((f) => f.id === forestId);
      const selectedHS = forestHSSelections[forestId] || [];

      return {
        forestId: forestId,
        selectedProducts: selectedHS.map((hs) => ({
          commodity: hs.commodity,
          code: hs.code,
          name: hs.name,
        })),
        harvestAreas: harvestAreasByForest[forestId] || [],
        quantity: shippingInfo.forestQuantities?.[forestId] || 0,
      };
    });

    // Prepare documents structure
    const shipmentDocuments = {};
    Object.entries(sectionConfig).forEach(([key]) => {
      shipmentDocuments[key] = [];
    });

    // Prepare shipment media
    const formattedMedia = shipmentMedia.map((media) => ({
      name:
        media.description ||
        (media.type === "photo" ? "Shipment Photo" : "Shipment Video"),
      url: media.type === "photo" ? media.src : media.url,
    }));

    // Create new shipment object
    const newShipment = {
      id: shipmentId,
      batchNumber: batchNumber,
      exporterId: exporterData.id,
      importerId: shippingInfo.importer,
      forests: shipmentForests,
      productionDate: shippingInfo.productionDate,
      processingLoadingDate: shippingInfo.processingDate,
      importerConsignee: selectedImporter?.basicInfo?.companyName || "Unknown",
      portOfDestination: shippingInfo.portOfDestination,
      portOfShipment: shippingInfo.portOfShipment,
      shippingLine: shippingInfo.shippingLine,
      processingLoadingSite: selectedProcessingSite?.name || "Unknown",
      productDescription: shippingInfo.productDescription,
      totalShippingFee: paymentAmount,
      totalHectares: totalHectares,
      totalKilograms: totalForestQuantity,
      containers: containers.map((container) => ({
        containerNumber: container.containerNumber,
        packingList: container.packingList,
        kilograms: container.kilograms,
      })),
      status: "pending",
      createdOn: new Date().toISOString().split("T")[0],
      images: formattedMedia.filter((m) => m.name.includes("Photo")),
      videos: formattedMedia.filter((m) => m.name.includes("Video")),
      documents: shipmentDocuments,
    };

    console.log("Creating new shipment:", newShipment);
    console.log("Shipment ID:", shipmentId);

    // REPLACE YOUR ENTIRE try/catch BLOCK (around line 1990-2080) WITH THIS:

    try {
      // Get current state from userStore
      const currentState = useUserStore.getState();
      const currentDemoData = currentState.demoData;

      // Create deep copies to avoid mutation
      const updatedDemoData = JSON.parse(JSON.stringify(currentDemoData));

      // CRITICAL: Ensure shipments object exists
      if (!updatedDemoData.shipments) {
        updatedDemoData.shipments = {};
      }

      // 1. Add shipment to shipments object
      updatedDemoData.shipments[shipmentId] = newShipment;
      console.log("Added shipment to shipments:", shipmentId);

      // 2. Update exporter with new shipment ID (still just push the ID)
      if (updatedDemoData.users[exporterData.id]) {
        if (!updatedDemoData.users[exporterData.id].shipments) {
          updatedDemoData.users[exporterData.id].shipments = [];
        }
        updatedDemoData.users[exporterData.id].shipments.push(shipmentId);
        console.log(
          "Updated exporter shipments:",
          updatedDemoData.users[exporterData.id].shipments,
        );
      }

      // 3. Update importer with new shipment object containing id and status (UPDATED)
      if (selectedImporter && updatedDemoData.users[shippingInfo.importer]) {
        if (!updatedDemoData.users[shippingInfo.importer].shipments) {
          updatedDemoData.users[shippingInfo.importer].shipments = [];
        }

        // Push an object with shipment id and default status "unapproved"
        updatedDemoData.users[shippingInfo.importer].shipments.push({
          id: shipmentId,
          status: "unapproved",
        });

        console.log(
          "Updated importer shipments (with status):",
          updatedDemoData.users[shippingInfo.importer].shipments,
        );
      }

      // 4. Update the store
      useUserStore.getState().updateDemoData(updatedDemoData);
      console.log("Store updated with new shipment");

      // 5. Update local exporterData state
      setExporterData(updatedDemoData.users[exporterData.id]);

      // 6. VERIFICATION: Check if update worked
      setTimeout(() => {
        const verifyState = useUserStore.getState();
        const verifyDemoData = verifyState.demoData;

        console.log("=== VERIFICATION ===");
        console.log(
          "Shipment exists in shipments:",
          !!verifyDemoData.shipments?.[shipmentId],
        );
        console.log(
          "Exporter shipments (IDs only):",
          verifyDemoData.users[exporterData.id]?.shipments,
        );
        console.log(
          "Importer shipments (objects with status):",
          verifyDemoData.users[shippingInfo.importer]?.shipments,
        );
        console.log("===================");

        if (!verifyDemoData.shipments?.[shipmentId]) {
          console.error("ERROR: Shipment not found in shipments object!");
          toast.error(
            "Shipment created but not saved properly. Please check console.",
          );
        }
      }, 100);

      // Reset form and show success
      setSelectedForests([]);
      setShipmentData({});
      setShippingInfo({
        productionDate: "",
        processingDate: "",
        importer: "",
        processingSite: "",
        shippingLine: "",
        portOfShipment: "",
        portOfDestination: "",
        productDescription: "",
        hsCodes: "",
        productNames: "",
        speciesInfo: "",
        quantity: 0,
        unit: "kilograms",
        paymentAmount: 0,
        forestQuantities: {},
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
          <p className="text-sm">Batch Number: {batchNumber}</p>
          <p className="text-sm">
            Total weight: {totalForestQuantity.toLocaleString()} kg
          </p>
          <p className="text-sm">
            Total harvest area: {totalHectares.toFixed(2)} hectares
          </p>
          <p className="text-sm">Forests: {selectedForests.length}</p>
          <p className="text-sm">Containers: {containers.length}</p>
          <p className="text-sm">Payment: ${paymentAmount}</p>
          {paymentCompleted && <p className="text-sm">✓ Payment processed</p>}
        </div>,
        { duration: 4000 },
      );
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Failed to create shipment. Please try again.");
      setIsCreating(false);
    }
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
        toast.error("Please add at least one container");
        return;
      }

      const allocatedQuantity = containers.reduce(
        (sum, container) => sum + (container.kilograms || 0),
        0,
      );
      const remainingQuantity = totalForestQuantity - allocatedQuantity;

      if (Math.abs(remainingQuantity) > 0.01) {
        toast.error(
          `Container quantities (${allocatedQuantity.toLocaleString()} kg) must equal total forest quantity (${totalForestQuantity.toLocaleString()} kg). Remaining: ${remainingQuantity.toLocaleString()} kg`,
        );
        return;
      }

      setStep(5);
    } else if (step === 5) {
      // Documents & Media step - no validation needed
      // Check if payment is needed
      const paymentAmount = calculatePayment(containers.length);

      if (paymentAmount > 0) {
        setStep(6); // Go to payment step
      } else {
        handleCreateShipment(); // No payment needed
      }
    }
  };

  // Calculate allocated container quantity
  const allocatedQuantity = containers.reduce(
    (sum, container) => sum + (container.kilograms || 0),
    0,
  );
  const remainingQuantity = totalForestQuantity - allocatedQuantity;

  // If no exporter data, show loading
  if (!exporterData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exporter data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            background: "#10b981",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981",
            },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-6">
          New Shipment - {exporterData.basicInfo?.companyName}
        </h1>

        {step > 0 && (
          <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
            <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap min-w-max sm:min-w-0">
              {[
                "Shipping Info",
                "Product Info",
                "Plot Selection",
                "Containers",
                "Documents & Media",
                "Payment",
              ].map((label, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step >= index + 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-xs sm:text-sm font-medium ${step >= index + 1 ? "text-green-600" : "text-gray-500"}`}
                  >
                    {label}
                  </span>
                  {index < 5 && (
                    <div
                      className={`hidden sm:block w-8 sm:w-12 h-1 mx-2 ${step > index + 1 ? "bg-green-600" : "bg-gray-200"}`}
                    />
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Create New Shipment
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Start a new shipment by entering shipping details, selecting
                  forests, and managing containers and documents.
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 1: Shipping Information
              </h2>
              <p className="text-gray-600">
                Enter the shipping information including dates, company details,
                and select forests involved in this shipment.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <ShippingInfoForm
                formData={shippingInfo}
                onChange={setShippingInfo}
                selectedForests={selectedForests}
                onForestToggle={toggleForest}
                exporterData={exporterData}
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
                Continue to Product Information ({selectedForests.length}{" "}
                forests selected)
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 2: Product Information per Forest
              </h2>
              <p className="text-gray-600">
                Select HS codes and specify quantities for each forest in this
                shipment.
              </p>
              {selectedForests.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  <span className="font-medium">Selected Forests:</span>{" "}
                  {selectedForests.length} forest
                  {selectedForests.length !== 1 ? "s" : ""}
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
                exporterData={exporterData}
              />
            </div>

            {/* Total Forest Quantity Summary */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-green-600" />
                  <h3 className="font-medium text-green-800">
                    Total Forest Quantity
                  </h3>
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 3: Plot Selection for Each Forest
              </h2>
              <p className="text-gray-600 mb-4">
                Select harvest plots for each forest in this shipment.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {selectedForests.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Processing Site:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {shippingInfo.processingSite
                      ? exporterData?.facilities?.find(
                          (s) => s.id === shippingInfo.processingSite,
                        )?.name || "None"
                      : "None"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Forest Quantity:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {totalForestQuantity.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Plot Selection for Each Forest */}
            {selectedForests.map((forestId, index) => {
              const facility = exporterData?.facilities?.find(
                (f) => f.id === forestId,
              );
              if (!facility) return null;

              // Use the getForestPlots function instead
              const facilityPlots = getForestPlots(forestId);
              return (
                <div key={forestId} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 p-3 bg-green-50 rounded-lg">
                    <Trees size={18} className="text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {facility.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {facility.address} • {facility.totalHectares || 0}{" "}
                        hectares
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Quantity:{" "}
                        {shippingInfo.forestQuantities?.[
                          forestId
                        ]?.toLocaleString() || 0}{" "}
                        kg
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
                    <EnhancedForestPlotSelection
                      forest={{ ...facility, plots: facilityPlots }}
                      selectedPlots={selectedForestPlots[forestId] || []}
                      onPlotToggle={handlePlotToggle}
                      onNewPlotAdded={handleNewPlotAdded}
                      onPlotDeleted={handlePlotDeleted}
                      isLoaded={isLoaded}
                      newlyCreatedPlots={[]}
                      forestIndex={index}
                    />
                  </div>

                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers
                          size={18}
                          className="text-green-600 flex-shrink-0"
                        />
                        <span className="font-medium text-green-800 truncate">
                          Selected Harvest Area for {facility.name}:
                        </span>
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
                    <Layers
                      size={24}
                      className="text-green-600 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-green-800 truncate">
                        Total Harvest Area Summary
                      </h3>
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
                      {selectedForests.length} forest
                      {selectedForests.length !== 1 ? "s" : ""}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 4: Container Information
              </h2>
              <p className="text-gray-600 mb-4">
                Add containers for this shipment. Container quantities must
                match the total forest quantity of{" "}
                {totalForestQuantity.toLocaleString()} kg.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {selectedForests.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Processing Site:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {shippingInfo.processingSite
                      ? exporterData?.facilities?.find(
                          (s) => s.id === shippingInfo.processingSite,
                        )?.name || "None"
                      : "None"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Forest Quantity:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {totalForestQuantity.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Harvest Area:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {getTotalHarvestArea().toFixed(2)} hectares
                  </span>
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 5: Manage Documents & Media
              </h2>
              <p className="text-gray-600 mb-4">
                Upload documents and capture media for this shipment.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Forests:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {selectedForests.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Containers:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {containers.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Weight:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {totalForestQuantity.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Harvest Area:</span>
                  <span className="text-green-600 font-semibold ml-2">
                    {getTotalHarvestArea().toFixed(2)} hectares
                  </span>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs ${Math.abs(remainingQuantity) <= 0.01 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {Math.abs(remainingQuantity) <= 0.01
                    ? "✓ Quantities Match"
                    : "✗ Quantities Mismatch"}
                </div>
              </div>
            </div>

            {/* Shipment Media Section */}
            <div className="mb-6 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
              <ShipmentMediaSection
                shipmentMedia={shipmentMedia}
                onAddMedia={(media) =>
                  setShipmentMedia([...shipmentMedia, ...media])
                }
                onRemoveMedia={(id) =>
                  setShipmentMedia(
                    shipmentMedia.filter((item) => item.id !== id),
                  )
                }
              />
            </div>

            {/* Documents for Each Forest - UPDATED: Only show existing documents */}
            {selectedForests.map((forestId) => {
              const facility = exporterData?.facilities?.find(
                (f) => f.id === forestId,
              );
              if (!facility) return null;

              return (
                <div key={forestId} className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                    <Trees size={18} className="text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {facility.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Harvest area:{" "}
                        {getForestHarvestArea(forestId).toFixed(2)} hectares •{" "}
                        {facility.address}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Quantity:{" "}
                        {shippingInfo.forestQuantities?.[
                          forestId
                        ]?.toLocaleString() || 0}{" "}
                        kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(sectionConfig).map(([key, config]) => {
                      // Map section keys to facility document keys
                      const documentKey =
                        key === "a"
                          ? "landUseRights"
                          : key === "b"
                            ? "environmentalProtection"
                            : key === "c"
                              ? "forestRelatedRules"
                              : key === "d"
                                ? "thirdPartiesRights"
                                : key === "e"
                                  ? "labourRights"
                                  : key === "f"
                                    ? "humanRights"
                                    : key === "g"
                                      ? "fpic"
                                      : "taxAntiCorruptionTradeCustoms";

                      const documents = facility.documents?.[documentKey] || [];

                      return (
                        <DocumentSection
                          key={`${forestId}-${key}`}
                          sectionKey={key}
                          title={config.title}
                          description={config.description}
                          documents={documents}
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
                    <h3 className="text-lg font-semibold text-green-800">
                      Shipment Summary
                    </h3>
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
              {containers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-green-700">Containers</p>
                      <p className="text-lg font-semibold text-green-800">
                        {containers.length} containers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">Payment Due</p>
                      <div className="flex items-center gap-2 justify-end">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">
                          ${calculatePayment(containers.length)}
                        </p>
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Step 6: Payment
              </h2>
              <p className="text-gray-600">
                Complete payment for your shipment. Rate: $100 per container.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
              <PaymentInformation
                containerCount={containers.length}
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
                onClick={handlePaymentComplete}
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
                    <CreditCard size={18} />
                    Pay ${calculatePayment(containers.length)}
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

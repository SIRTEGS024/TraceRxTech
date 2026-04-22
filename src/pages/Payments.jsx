import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  Home,
  Truck,
  Flame,
  MapPin,
  Camera,
  X,
  CreditCard,
  Ship,
  Package,
  Info,
  CheckCircle,
  Square,
  Circle,
  Maximize2,
  Calendar,
  Navigation,
  Trash2,
  Eye,
} from "lucide-react";
import Webcam from "react-webcam";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

// ---------- Helper: Reverse geocoding ----------
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
    );
    const data = await res.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
};

// ---------- Map Location Picker (same as before) ----------
const MapLocationPicker = ({
  onLocationChange,
  initialLat = 6.5244,
  initialLng = 3.3792,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const [map, setMap] = useState(null);
  const [markerPos, setMarkerPos] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState("");
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (markerPos) {
      getAddressFromCoords(markerPos.lat, markerPos.lng).then(setAddress);
      onLocationChange?.({ lat: markerPos.lat, lng: markerPos.lng, address });
    }
  }, [markerPos, onLocationChange]);

  const onMapClick = useCallback((e) => {
    if (e.latLng) {
      setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPos({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(16);
      }
    }
  };

  if (!isLoaded)
    return (
      <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        Loading Map...
      </div>
    );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            className="flex-1 p-2 border rounded-lg focus:ring-green-500"
          />
        </Autocomplete>
      </div>
      <div className="h-64 rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={markerPos}
          zoom={14}
          onLoad={setMap}
          onClick={onMapClick}
          options={{ mapTypeId: "satellite", mapTypeControl: false }}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={(e) =>
              e.latLng &&
              setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />
        </GoogleMap>
      </div>
      <p className="text-xs text-gray-500 truncate">
        📍 {address || "Click on map to select location"}
      </p>
    </div>
  );
};

// ---------- FIXED MEDIA CAPTURE COMPONENT ----------
const MediaCapture = ({ onMediaCaptured, existingMedia = [] }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [captureMode, setCaptureMode] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewingMedia, setViewingMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const timeIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Get GPS location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      const addr = await getAddressFromCoords(coords.lat, coords.lng);
      setAddress(addr);
    }, () => toast.error('GPS location denied'));
  }, []);

  // Update time every second when camera is open
  useEffect(() => {
    if (showCamera) {
      timeIntervalRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    } else {
      clearInterval(timeIntervalRef.current);
    }
    return () => clearInterval(timeIntervalRef.current);
  }, [showCamera]);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imgSrc = webcamRef.current.getScreenshot();
      if (imgSrc) {
        const mediaObj = {
          id: Date.now(),
          type: 'image',
          data: imgSrc,
          location,
          address,
          timestamp: new Date().toISOString(),
        };
        onMediaCaptured(mediaObj);
        toast.success('Photo captured');
        setShowCamera(false);
      }
    }
  };

  const startRecording = () => {
    if (webcamRef.current?.stream) {
      const recorder = new MediaRecorder(webcamRef.current.stream);
      mediaRecorderRef.current = recorder;
      setRecordedChunks([]);
      recorder.ondataavailable = (e) => e.data.size && setRecordedChunks(prev => [...prev, e.data]);
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const mediaObj = {
          id: Date.now(),
          type: 'video',
          data: url,
          blob,
          location,
          address,
          timestamp: new Date().toISOString(),
        };
        onMediaCaptured(mediaObj);
        toast.success('Video recorded');
        setShowCamera(false);
      };
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const deleteMedia = (id) => {
    const updated = existingMedia.filter(m => m.id !== id);
    onMediaCaptured(updated, true);
    if (viewingMedia?.id === id) setIsModalOpen(false);
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setShowCamera(true)} className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition">
        <Camera size={16} /> Add Media
      </button>

      {/* Gallery Grid */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingMedia.map((med) => (
            <div key={med.id} className="relative group">
              {med.type === 'image' ? (
                <img 
                  src={med.data} 
                  className="h-20 w-full object-cover rounded-lg cursor-pointer border border-gray-200" 
                  onClick={() => { setViewingMedia(med); setIsModalOpen(true); }} 
                  alt="thumb" 
                />
              ) : (
                <div 
                  className="relative h-20 w-full bg-gray-800 rounded-lg cursor-pointer flex items-center justify-center border border-gray-200"
                  onClick={() => { setViewingMedia(med); setIsModalOpen(true); }}
                >
                  <video 
                    ref={videoRef}
                    src={med.data} 
                    className="h-full w-full object-cover rounded-lg"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="bg-white/80 rounded-full p-1">
                      <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => deleteMedia(med.id)}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate rounded-b-lg">
                {med.address?.substring(0, 30)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera Modal - smaller and smoother */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCamera(false)}>
          <div className="relative max-w-md w-full bg-black rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setShowCamera(false)} className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full">
              <X size={18} />
            </button>

            {/* Live Overlay (top left) */}
            {location && (
              <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-xs p-2 rounded-lg backdrop-blur-sm space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1">
                  <Navigation size={10} />
                  <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={10} />
                  <span className="truncate">{address.substring(0, 40)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-2 right-12 z-20 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                REC
              </div>
            )}

            {/* Mode switcher */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-black/50 rounded-full p-1">
              <button onClick={() => setCaptureMode('photo')} className={`px-3 py-1 rounded-full text-xs ${captureMode === 'photo' ? 'bg-green-600 text-white' : 'text-white'}`}>Photo</button>
              <button onClick={() => setCaptureMode('video')} className={`px-3 py-1 rounded-full text-xs ${captureMode === 'video' ? 'bg-green-600 text-white' : 'text-white'}`}>Video</button>
            </div>

            {/* Webcam feed */}
            <Webcam
              ref={webcamRef}
              audio={true}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              className="w-full h-auto"
            />

            {/* Capture button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              {captureMode === 'photo' ? (
                <button onClick={capturePhoto} className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition">
                  <Camera size={24} className="text-gray-800" />
                </button>
              ) : (
                <button onClick={isRecording ? stopRecording : startRecording} className={`rounded-full p-3 shadow-lg transition ${isRecording ? 'bg-red-600' : 'bg-white'}`}>
                  {isRecording ? <Square size={24} className="text-white" /> : <Circle size={24} className="text-gray-800" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Media Modal - with working video player */}
      {isModalOpen && viewingMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-3xl w-full bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full">
              <X size={20} />
            </button>
            <div className="max-h-[70vh] overflow-auto">
              {viewingMedia.type === 'image' ? (
                <img src={viewingMedia.data} className="w-full h-auto" alt="full" />
              ) : (
                <video 
                  src={viewingMedia.data} 
                  controls 
                  autoPlay 
                  className="w-full"
                  controlsList="nodownload"
                />
              )}
            </div>
            <div className="bg-gray-900 text-white p-3 text-xs space-y-1">
              <div className="flex items-center gap-2"><Navigation size={12} /> Coordinates: {viewingMedia.location?.lat.toFixed(6)}, {viewingMedia.location?.lng.toFixed(6)}</div>
              <div className="flex items-center gap-2"><MapPin size={12} /> Address: {viewingMedia.address}</div>
              <div className="flex items-center gap-2"><Calendar size={12} /> Captured: {formatDateTime(viewingMedia.timestamp)}</div>
              <button onClick={() => { deleteMedia(viewingMedia.id); setIsModalOpen(false); }} className="mt-2 flex items-center gap-1 bg-red-600 px-3 py-1 rounded text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Main Landing Page (same as before, but with improved MediaCapture) ----------
const Payments = () => {
  const [selectedLevy, setSelectedLevy] = useState("corporate");
  const [formData, setFormData] = useState({});
  const [coordinates, setCoordinates] = useState(null);
  const [media, setMedia] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const updateForm = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const calculatePayment = () => {
    switch (selectedLevy) {
      case "corporate":
        return Math.max(
          100,
          Math.ceil((formData.annualWoodKg || 0) / 1000) * 20,
        );
      case "residential":
        return Math.max(50, (formData.woodenAreaSqm || 0) * 2);
      case "vehicular":
        return Math.max(
          30,
          Math.ceil((formData.transportedWeightKg || 0) / 500) * 10,
        );
      case "use":
        return Math.max(10, (formData.quantityKg || 0) * 0.05);
      default:
        return 100;
    }
  };

  const handlePayment = async () => {
    if (
      selectedLevy === "corporate" &&
      (!formData.businessName || !formData.businessType)
    ) {
      toast.error("Please fill business name and type");
      return;
    }
    if (
      selectedLevy === "residential" &&
      (!formData.propertyAddress || !formData.woodenAreaSqm)
    ) {
      toast.error("Please fill property address and wooden area");
      return;
    }
    if (
      selectedLevy === "vehicular" &&
      (!formData.vehicleCat || !formData.transportedWeightKg)
    ) {
      toast.error("Please fill vehicle type and transported weight");
      return;
    }
    if (
      selectedLevy === "use" &&
      (!formData.productType || !formData.quantityKg)
    ) {
      toast.error("Please fill product type and quantity");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const amount = calculatePayment();
    setPaymentResult({ amount, success: true });
    toast.success(`Payment of $${amount} processed successfully!`);
    setIsProcessing(false);
  };

  const levies = [
    {
      id: "corporate",
      label: "Corporate / Commercial",
      icon: Building2,
      color: "bg-emerald-100",
      textColor: "text-emerald-800",
      description: "Hotels, banks, schools, malls, factories, etc.",
    },
    {
      id: "residential",
      label: "Residential + Construction",
      icon: Home,
      color: "bg-teal-100",
      textColor: "text-teal-800",
      description: "Homes, building sites, housing projects",
    },
    {
      id: "vehicular",
      label: "Vehicular Levy",
      icon: Truck,
      color: "bg-cyan-100",
      textColor: "text-cyan-800",
      description: "Cars, trucks, ships, aircraft, tractors transporting wood",
    },
    {
      id: "use",
      label: "Use / Consumption",
      icon: Flame,
      color: "bg-orange-100",
      textColor: "text-orange-800",
      description: "Firewood, charcoal, forest product usage",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section */}
      <section className="relative bg-green-800 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Forest Product Levy Platform
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto"
          >
            Compliance for trade, use & consumption of forest products —
            domestic, import & export
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center gap-4 flex-wrap"
          >
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">
              🌍 EUDR Compliant
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">
              📸 GPS-tagged Media
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">
              🗺️ Geo-boundary mapping
            </div>
          </motion.div>
        </div>
      </section>

      {/* Carousel */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-8">
          Select Levy Category
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
            {levies.map((levy) => (
              <motion.button
                key={levy.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedLevy(levy.id);
                  setFormData({});
                  setMedia([]);
                  setPaymentResult(null);
                }}
                className={`snap-start min-w-[280px] p-6 rounded-2xl shadow-lg transition-all ${selectedLevy === levy.id ? "ring-4 ring-green-500 bg-white" : "bg-white hover:shadow-xl"}`}
              >
                <div
                  className={`w-16 h-16 ${levy.color} rounded-2xl flex items-center justify-center mb-4`}
                >
                  <levy.icon className={`w-8 h-8 ${levy.textColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {levy.label}
                </h3>
                <p className="text-gray-500 text-sm mt-2">{levy.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Form */}
      <section className="py-8 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2">
              {React.createElement(
                levies.find((l) => l.id === selectedLevy).icon,
                { className: "w-6 h-6" },
              )}
              {levies.find((l) => l.id === selectedLevy).label} Payment
            </h3>
          </div>
          <div className="p-6 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLevy}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* ========== CORPORATE ========== */}
                {selectedLevy === "corporate" && (
                  <>
                    <div>
                      <label className="block font-medium">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formData.businessName || ""}
                        onChange={(e) =>
                          updateForm("businessName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Business Type *
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.businessType || ""}
                        onChange={(e) =>
                          updateForm("businessType", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option>Hotel</option>
                        <option>Bank</option>
                        <option>School</option>
                        <option>Shopping Mall</option>
                        <option>Factory</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium">
                        Estimated Annual Wood Consumption (kg)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.annualWoodKg || ""}
                        onChange={(e) =>
                          updateForm(
                            "annualWoodKg",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Address of Premises
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formData.address || ""}
                        onChange={(e) => updateForm("address", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* ========== RESIDENTIAL ========== */}
                {selectedLevy === "residential" && (
                  <>
                    <div>
                      <label className="block font-medium">
                        Property Address *
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={formData.propertyAddress || ""}
                        onChange={(e) =>
                          updateForm("propertyAddress", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Type of Residence
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.residenceType || ""}
                        onChange={(e) =>
                          updateForm("residenceType", e.target.value)
                        }
                      >
                        <option>House</option>
                        <option>Apartment</option>
                        <option>Duplex</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium">
                        Wooden Construction Area (sq meters) *
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.woodenAreaSqm || ""}
                        onChange={(e) =>
                          updateForm(
                            "woodenAreaSqm",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Construction Type
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.constructionType || ""}
                        onChange={(e) =>
                          updateForm("constructionType", e.target.value)
                        }
                      >
                        <option>New Build</option>
                        <option>Renovation</option>
                        <option>Demolition</option>
                      </select>
                    </div>
                  </>
                )}

                {/* ========== VEHICULAR ========== */}
                {selectedLevy === "vehicular" && (
                  <>
                    <div>
                      <label className="block font-medium">
                        Vehicle Category *
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.vehicleCat || ""}
                        onChange={(e) =>
                          updateForm("vehicleCat", e.target.value)
                        }
                      >
                        <option>Land Motorized (truck, lorry)</option>
                        <option>Land Non-motorized (bicycle cart)</option>
                        <option>Water Vehicle (ship, boat)</option>
                        <option>Air Vehicle (airplane, helicopter)</option>
                        <option>
                          Construction/Agricultural (tractor, bulldozer)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium">
                        Registration / Identification Number
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.regNo || ""}
                        onChange={(e) => updateForm("regNo", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Weight of Wood Transported (kg) *
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.transportedWeightKg || ""}
                        onChange={(e) =>
                          updateForm(
                            "transportedWeightKg",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Container Numbers (for ships/trucks)
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.containerNos || ""}
                        onChange={(e) =>
                          updateForm("containerNos", e.target.value)
                        }
                        placeholder="e.g., ABCU1234567"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium">
                          Origin (pickup location)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg"
                          value={formData.origin || ""}
                          onChange={(e) => updateForm("origin", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-medium">
                          Destination (delivery location)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg"
                          value={formData.destination || ""}
                          onChange={(e) =>
                            updateForm("destination", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium">
                        Buyer (consignee)
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.buyer || ""}
                        onChange={(e) => updateForm("buyer", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Seller (exporter)
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.seller || ""}
                        onChange={(e) => updateForm("seller", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* ========== USE / CONSUMPTION ========== */}
                {selectedLevy === "use" && (
                  <>
                    <div>
                      <label className="block font-medium">
                        Product Type *
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.productType || ""}
                        onChange={(e) =>
                          updateForm("productType", e.target.value)
                        }
                        placeholder="Firewood, Charcoal, Timber"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Quantity (kg) *
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.quantityKg || ""}
                        onChange={(e) =>
                          updateForm(
                            "quantityKg",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Purpose of Use
                      </label>
                      <textarea
                        className="w-full p-2 border rounded-lg"
                        rows="2"
                        value={formData.purpose || ""}
                        onChange={(e) => updateForm("purpose", e.target.value)}
                        placeholder="e.g., cooking, heating, construction"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Location of Use
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.locationUse || ""}
                        onChange={(e) =>
                          updateForm("locationUse", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {/* Map Picker */}
                <div className="border-t pt-4">
                  <label className="block font-medium mb-2 flex items-center gap-2">
                    <MapPin size={18} /> GPS Location (Drag marker or click map)
                  </label>
                  <MapLocationPicker onLocationChange={setCoordinates} />
                </div>

                {/* Media Capture - IMPROVED VERSION */}
                <div className="border-t pt-4">
                  <label className="block font-medium mb-2 flex items-center gap-2">
                    <Camera size={18} /> Upload Evidence (Photos/Videos with GPS
                    & timestamp)
                  </label>
                  <MediaCapture
                    onMediaCaptured={(newMedia, replaceAll) => {
                      if (replaceAll) setMedia(newMedia);
                      else setMedia((prev) => [...prev, newMedia]);
                    }}
                    existingMedia={media}
                  />
                </div>

                {/* Payment Preview */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Estimated Levy Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-700">
                      ${calculatePayment()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on provided details. Final amount may adjust after
                    verification.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  {isProcessing ? "Processing..." : "Pay Now"}
                </button>

                {paymentResult?.success && (
                  <div className="bg-green-50 p-4 rounded-lg text-center text-green-800 flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Payment of ${paymentResult.amount}{" "}
                    completed! Receipt sent.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Payments;

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
  Square,
  Circle,
  Calendar,
  Navigation,
  Plus,
  Trash2,
  CheckCircle,
  Search,
  ChevronDown,
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

// ---------- Helper: Get currency symbol from currency code ----------
const getCurrencySymbolFromCode = (currencyCode) => {
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    CAD: "C$",
    AUD: "A$",
    INR: "₹",
    CNY: "¥",
    JPY: "¥",
    KRW: "₩",
    RUB: "₽",
    BRL: "R$",
    ZAR: "R",
    CHF: "CHF",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    MXN: "$",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
  };
  return symbols[currencyCode] || currencyCode;
};

// Simplified CountrySelector with minimal styling
const CountrySelector = ({ selectedCountry, onSelectCountry }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,currencies")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((country) => {
          const currencyCode = country.currencies
            ? Object.keys(country.currencies)[0]
            : "USD";
          return {
            code: country.cca2,
            name: country.name.common,
            currencyCode: currencyCode,
            symbol: getCurrencySymbolFromCode(currencyCode),
          };
        });
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
        setLoading(false);
      })
      .catch(() => {
        // Fallback list
        const fallback = [
          { code: "US", name: "United States", currencyCode: "USD", symbol: "$" },
          { code: "GB", name: "United Kingdom", currencyCode: "GBP", symbol: "£" },
          { code: "NG", name: "Nigeria", currencyCode: "NGN", symbol: "₦" },
        ];
        setCountries(fallback);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country) => {
    onSelectCountry(country);
    setSearchTerm(country.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type country name..."
        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-sm max-h-48 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-xs text-gray-500">Loading...</div>
          ) : filteredCountries.length === 0 ? (
            <div className="p-2 text-xs text-gray-500">No countries</div>
          ) : (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelect(country)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{country.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {country.symbol} {country.currencyCode}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ---------- Map Picker for Origin & Destination (same map) ----------
const OriginDestinationMapPicker = ({
  onOriginChange,
  onDestinationChange,
  initialCenter = { lat: 6.5244, lng: 3.3792 },
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [mode, setMode] = useState("origin");
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (origin) {
      getAddressFromCoords(origin.lat, origin.lng).then(setOriginAddress);
      onOriginChange?.({ ...origin, address: originAddress });
    }
  }, [origin]);
  useEffect(() => {
    if (destination) {
      getAddressFromCoords(destination.lat, destination.lng).then(
        setDestinationAddress,
      );
      onDestinationChange?.({ ...destination, address: destinationAddress });
    }
  }, [destination]);

  const onMapClick = useCallback(
    (e) => {
      if (!e.latLng) return;
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      if (mode === "origin") {
        setOrigin(pos);
      } else {
        setDestination(pos);
      }
    },
    [mode],
  );

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (mode === "origin") {
          setOrigin(pos);
        } else {
          setDestination(pos);
        }
        map?.panTo(pos);
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
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("origin")}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              mode === "origin" ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            <MapPin size={14} /> Set Origin
          </button>
          <button
            type="button"
            onClick={() => setMode("destination")}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              mode === "destination" ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
          >
            <MapPin size={14} /> Set Destination
          </button>
        </div>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            className="flex-1 p-2 border rounded-lg text-sm"
          />
        </Autocomplete>
      </div>
      <div className="h-64 rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={initialCenter}
          zoom={12}
          onLoad={setMap}
          onClick={onMapClick}
          options={{ mapTypeId: "satellite", mapTypeControl: false }}
        >
          {origin && (
            <Marker
              position={origin}
              label={{ text: "O", color: "white" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          )}
          {destination && (
            <Marker
              position={destination}
              label={{ text: "D", color: "white" }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
            />
          )}
        </GoogleMap>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="truncate">📍 Origin: {originAddress || "Not set"}</div>
        <div className="truncate">📍 Destination: {destinationAddress || "Not set"}</div>
      </div>
    </div>
  );
};

// ---------- Media Capture Component (unchanged) ----------
const MediaCapture = ({
  onMediaCaptured,
  existingMedia = [],
  label = "Add Media",
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [captureMode, setCaptureMode] = useState("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewingMedia, setViewingMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const timeIntervalRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        const addr = await getAddressFromCoords(coords.lat, coords.lng);
        setAddress(addr);
      },
      () => toast.error("GPS location denied"),
    );
  }, []);

  useEffect(() => {
    if (showCamera) {
      timeIntervalRef.current = setInterval(
        () => setCurrentTime(new Date()),
        1000,
      );
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
          type: "image",
          data: imgSrc,
          location,
          address,
          timestamp: new Date().toISOString(),
        };
        onMediaCaptured(mediaObj);
        toast.success("Photo captured");
        setShowCamera(false);
      }
    }
  };

  const startRecording = () => {
    if (webcamRef.current?.stream) {
      const recorder = new MediaRecorder(webcamRef.current.stream);
      mediaRecorderRef.current = recorder;
      setRecordedChunks([]);
      recorder.ondataavailable = (e) =>
        e.data.size && setRecordedChunks((prev) => [...prev, e.data]);
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const mediaObj = {
          id: Date.now(),
          type: "video",
          data: url,
          blob,
          location,
          address,
          timestamp: new Date().toISOString(),
        };
        onMediaCaptured(mediaObj);
        toast.success("Video recorded");
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
    const updated = existingMedia.filter((m) => m.id !== id);
    onMediaCaptured(updated, true);
    if (viewingMedia?.id === id) setIsModalOpen(false);
  };

  const formatDateTime = (isoString) => new Date(isoString).toLocaleString();

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowCamera(true)}
        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
      >
        <Camera size={16} /> {label}
      </button>
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingMedia.map((med) => (
            <div key={med.id} className="relative group">
              {med.type === "image" ? (
                <img
                  src={med.data}
                  className="h-20 w-full object-cover rounded-lg cursor-pointer border"
                  onClick={() => {
                    setViewingMedia(med);
                    setIsModalOpen(true);
                  }}
                  alt="thumb"
                />
              ) : (
                <div
                  className="relative h-20 w-full bg-gray-800 rounded-lg cursor-pointer flex items-center justify-center border"
                  onClick={() => {
                    setViewingMedia(med);
                    setIsModalOpen(true);
                  }}
                >
                  <video
                    ref={videoRef}
                    src={med.data}
                    className="h-full w-full object-cover rounded-lg"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="bg-white/80 rounded-full p-1">
                      <svg
                        className="w-6 h-6 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
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
      {showCamera && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCamera(false)}
        >
          <div
            className="relative max-w-md w-full bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCamera(false)}
              className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full"
            >
              <X size={18} />
            </button>
            {location && (
              <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-xs p-2 rounded-lg backdrop-blur-sm space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1">
                  <Navigation size={10} />
                  <span>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
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
            {isRecording && (
              <div className="absolute top-2 right-12 z-20 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                REC
              </div>
            )}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-black/50 rounded-full p-1">
              <button
                onClick={() => setCaptureMode("photo")}
                className={`px-3 py-1 rounded-full text-xs ${
                  captureMode === "photo" ? "bg-green-600 text-white" : "text-white"
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setCaptureMode("video")}
                className={`px-3 py-1 rounded-full text-xs ${
                  captureMode === "video" ? "bg-green-600 text-white" : "text-white"
                }`}
              >
                Video
              </button>
            </div>
            <Webcam
              ref={webcamRef}
              audio={true}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              className="w-full h-auto"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              {captureMode === "photo" ? (
                <button
                  onClick={capturePhoto}
                  className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition"
                >
                  <Camera size={24} className="text-gray-800" />
                </button>
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`rounded-full p-3 shadow-lg transition ${
                    isRecording ? "bg-red-600" : "bg-white"
                  }`}
                >
                  {isRecording ? (
                    <Square size={24} className="text-white" />
                  ) : (
                    <Circle size={24} className="text-gray-800" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {isModalOpen && viewingMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="max-h-[70vh] overflow-auto">
              {viewingMedia.type === "image" ? (
                <img
                  src={viewingMedia.data}
                  className="w-full h-auto"
                  alt="full"
                />
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
              <div>
                <Navigation size={12} /> Coordinates:{" "}
                {viewingMedia.location?.lat.toFixed(6)},{" "}
                {viewingMedia.location?.lng.toFixed(6)}
              </div>
              <div>
                <MapPin size={12} /> Address: {viewingMedia.address}
              </div>
              <div>
                <Calendar size={12} /> Captured:{" "}
                {formatDateTime(viewingMedia.timestamp)}
              </div>
              <button
                onClick={() => {
                  deleteMedia(viewingMedia.id);
                  setIsModalOpen(false);
                }}
                className="mt-2 flex items-center gap-1 bg-red-600 px-3 py-1 rounded text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Tags Input Component ----------
const TagsInput = ({
  tags = [],
  onTagsChange,
  placeholder = "Type and press Enter...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim()))
        onTagsChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };
  const removeTag = (tagToRemove) =>
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  return (
    <div className="border rounded-lg p-2 focus-within:ring-2 focus-within:ring-green-500">
      <div className="flex flex-wrap gap-2 mb-1">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items gap-1 bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs"
          >
            {tag}{" "}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-600"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full outline-none text-sm"
      />
    </div>
  );
};

// ---------- Container List Component ----------
const ContainerList = ({ containers = [], onContainersChange }) => {
  const addContainer = () =>
    onContainersChange([...containers, { containerNo: "", weightKg: 0 }]);
  const updateContainer = (index, field, value) => {
    const updated = [...containers];
    updated[index][field] = field === "weightKg" ? parseInt(value) || 0 : value;
    onContainersChange(updated);
  };
  const removeContainer = (index) =>
    onContainersChange(containers.filter((_, i) => i !== index));
  return (
    <div className="space-y-2">
      {containers.map((c, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Container number"
            value={c.containerNo}
            onChange={(e) =>
              updateContainer(idx, "containerNo", e.target.value)
            }
            className="flex-1 p-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={c.weightKg}
            onChange={(e) => updateContainer(idx, "weightKg", e.target.value)}
            className="w-28 p-2 border rounded-lg"
          />
          <button
            type="button"
            onClick={() => removeContainer(idx)}
            className="text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addContainer}
        className="text-sm text-green-600 flex items-center gap-1"
      >
        <Plus size={14} /> Add container
      </button>
    </div>
  );
};

// ---------- Main Traceability Platform ----------
const TraceabilityPlatform = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLevy, setSelectedLevy] = useState("corporate");
  const [formData, setFormData] = useState({});
  const [coordinates, setCoordinates] = useState(null);
  const [media, setMedia] = useState([]);
  const [originMedia, setOriginMedia] = useState([]);
  const [destinationMedia, setDestinationMedia] = useState([]);
  const [generalMediaVehicular, setGeneralMediaVehicular] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);

  const updateForm = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // Search logic: container numbers, vehicle registration, receipt number
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const matches = [];

    const includesQuery = (val) =>
      val && val.toString().toLowerCase().includes(query);

    // Always check receipt number
    if (receiptNumber && includesQuery(receiptNumber)) {
      matches.push(`Receipt Number: ${receiptNumber}`);
    }

    // For vehicular levy, also check registration and container numbers
    if (selectedLevy === "vehicular") {
      if (includesQuery(formData.regNo)) {
        matches.push(`Vehicle Registration: ${formData.regNo}`);
      }
      if (formData.containers) {
        formData.containers.forEach((c, idx) => {
          if (includesQuery(c.containerNo)) {
            matches.push(`Container #${idx + 1}: ${c.containerNo}`);
          }
        });
      }
    }

    setSearchMatches(matches);
  }, [searchQuery, formData, selectedLevy, receiptNumber]);

  const calculatePayment = () => {
    switch (selectedLevy) {
      case "corporate":
        return Math.max(
          100,
          Math.ceil((formData.annualForestProductKg || 0) / 1000) * 20,
        );
      case "residential":
        return Math.max(50, (formData.woodenAreaSqm || 0) * 2);
      case "vehicular":
        const productCount = formData.forestProducts?.length || 0;
        return Math.max(30, productCount * 15);
      case "use":
        return Math.max(10, (formData.quantityKg || 0) * 0.05);
      default:
        return 100;
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  };

  const handlePayment = async () => {
    if (!selectedCountry) {
      toast.error("Please select your country first");
      return;
    }
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
      (!formData.vehicleCat || !formData.forestProducts?.length)
    ) {
      toast.error("Please fill vehicle type and at least one forest product");
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
    const newReceipt = generateReceiptNumber();
    setReceiptNumber(newReceipt);
    setPaymentResult({ amount, success: true, currency: selectedCountry.symbol, receipt: newReceipt });
    toast.success(`Payment of ${selectedCountry.symbol}${amount} processed successfully! Receipt: ${newReceipt}`);
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
      description:
        "Cars, trucks, ships, aircraft, tractors transporting forest products",
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

  const getCurrencySymbol = () => selectedCountry?.symbol || "$";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ToastContainer position="top-right" autoClose={3000} />
      <section className="relative bg-green-800 text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Traceability Platform
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

      {/* Global Search Bar - Prominent and always visible */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-md py-3 px-6 border-b border-green-100">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center bg-white border-2 border-green-200 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
            <div className="pl-5 text-green-600">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by container number, vehicle registration number, or receipt number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 outline-none text-gray-700 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="pr-5 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchMatches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Search size={14} /> Match(es) found:
              </p>
              <ul className="space-y-1">
                {searchMatches.map((match, idx) => (
                  <li key={idx} className="text-gray-600 flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-600" />
                    {match}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Country Selection Section - Simplified dropdown */}
      <section className="py-8 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span> Step 1: Select Your Country
          </h2>
          <CountrySelector
            selectedCountry={selectedCountry}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              setPaymentResult(null);
              setReceiptNumber(null);
              toast.info(`Currency set to ${country.symbol} (${country.currencyCode})`);
            }}
          />
          {!selectedCountry && (
            <p className="text-amber-600 text-sm mt-3 flex items-center gap-1">
              ⚠️ Please select a country – this determines your payment currency.
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-8">
          Regulatory Compliance
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
            {levies.map((levy) => (
              <motion.button
                key={levy.id}
                whileHover={{ scale: selectedCountry ? 1.02 : 1 }}
                onClick={() => {
                  if (!selectedCountry) {
                    toast.error("Please select your country first");
                    return;
                  }
                  setSelectedLevy(levy.id);
                  setFormData({});
                  setMedia([]);
                  setOriginMedia([]);
                  setDestinationMedia([]);
                  setGeneralMediaVehicular([]);
                  setPaymentResult(null);
                  setSearchQuery("");
                }}
                className={`snap-start min-w-[280px] p-6 rounded-2xl shadow-lg transition-all ${
                  selectedLevy === levy.id ? "ring-4 ring-green-500 bg-white" : "bg-white hover:shadow-xl"
                } ${!selectedCountry ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={!selectedCountry}
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

      <section className="py-8 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2">
              {React.createElement(
                levies.find((l) => l.id === selectedLevy).icon,
                { className: "w-6 h-6" },
              )}
              {levies.find((l) => l.id === selectedLevy).label}
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
                {/* CORPORATE */}
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
                        Estimated Annual Forest Product Consumption (kg)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.annualForestProductKg || ""}
                        onChange={(e) =>
                          updateForm(
                            "annualForestProductKg",
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
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} /> GPS Location
                      </label>
                      <MapLocationPicker onLocationChange={setCoordinates} />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> Upload Evidence
                      </label>
                      <MediaCapture
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setMedia(newMedia)
                            : setMedia((prev) => [...prev, newMedia])
                        }
                        existingMedia={media}
                      />
                    </div>
                  </>
                )}

                {/* RESIDENTIAL */}
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
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} /> GPS Location
                      </label>
                      <MapLocationPicker onLocationChange={setCoordinates} />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> Upload Evidence
                      </label>
                      <MediaCapture
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setMedia(newMedia)
                            : setMedia((prev) => [...prev, newMedia])
                        }
                        existingMedia={media}
                      />
                    </div>
                  </>
                )}

                {/* VEHICULAR */}
                {selectedLevy === "vehicular" && (
                  <>
                    <div className="border-b pb-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} /> Origin & Destination (click on map
                        to set)
                      </label>
                      <OriginDestinationMapPicker
                        onOriginChange={(loc) => {
                          updateForm("origin", loc.address);
                          updateForm("originCoords", loc);
                        }}
                        onDestinationChange={(loc) => {
                          updateForm("destination", loc.address);
                          updateForm("destinationCoords", loc);
                        }}
                      />
                    </div>
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
                        Vehicle Registration Number
                      </label>
                      <input
                        className="w-full p-2 border rounded-lg"
                        value={formData.regNo || ""}
                        onChange={(e) => updateForm("regNo", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Forest Product Utilized (type names) *
                      </label>
                      <TagsInput
                        tags={formData.forestProducts || []}
                        onTagsChange={(tags) =>
                          updateForm("forestProducts", tags)
                        }
                        placeholder="Type product name and press Enter (e.g., Teak logs)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        List all forest products being transported.
                      </p>
                    </div>
                    <div>
                      <label className="block font-medium">
                        Container Numbers & Weight per Container
                      </label>
                      <ContainerList
                        containers={formData.containers || []}
                        onContainersChange={(containers) =>
                          updateForm("containers", containers)
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-medium">
                        Type of Goods/Products Conveyed
                      </label>
                      <TagsInput
                        tags={formData.goodsTypes || []}
                        onTagsChange={(tags) => updateForm("goodsTypes", tags)}
                        placeholder="Type product and press Enter..."
                      />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> Origin Location Media
                      </label>
                      <MediaCapture
                        label="Add Origin Media"
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setOriginMedia(newMedia)
                            : setOriginMedia((prev) => [...prev, newMedia])
                        }
                        existingMedia={originMedia}
                      />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> Destination Location Media
                      </label>
                      <MediaCapture
                        label="Add Destination Media"
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setDestinationMedia(newMedia)
                            : setDestinationMedia((prev) => [...prev, newMedia])
                        }
                        existingMedia={destinationMedia}
                      />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> General Media
                      </label>
                      <MediaCapture
                        label="Add General Media"
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setGeneralMediaVehicular(newMedia)
                            : setGeneralMediaVehicular((prev) => [
                                ...prev,
                                newMedia,
                              ])
                        }
                        existingMedia={generalMediaVehicular}
                      />
                    </div>
                  </>
                )}

                {/* USE */}
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
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <MapPin size={18} /> GPS Location
                      </label>
                      <MapLocationPicker onLocationChange={setCoordinates} />
                    </div>
                    <div className="border-t pt-4">
                      <label className="block font-medium mb-2 flex items-center gap-2">
                        <Camera size={18} /> Upload Evidence
                      </label>
                      <MediaCapture
                        onMediaCaptured={(newMedia, replaceAll) =>
                          replaceAll
                            ? setMedia(newMedia)
                            : setMedia((prev) => [...prev, newMedia])
                        }
                        existingMedia={media}
                      />
                    </div>
                  </>
                )}

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Estimated Levy Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-700">
                      {selectedCountry ? getCurrencySymbol() : "$"}
                      {calculatePayment()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLevy === "vehicular"
                      ? "Based on number of forest product types entered."
                      : "Based on provided details. Final amount may adjust after verification."}
                    {selectedCountry && (
                      <span className="block mt-1">
                        💱 Currency: {selectedCountry.currencyCode} ({selectedCountry.symbol})
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedCountry}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CreditCard size={20} />
                  )}
                  {isProcessing ? "Processing..." : `Pay ${selectedCountry ? getCurrencySymbol() : "$"}${calculatePayment()}`}
                </button>
                {paymentResult?.success && (
                  <div className="bg-green-50 p-4 rounded-lg text-green-800 space-y-2">
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <CheckCircle size={20} /> Payment of {paymentResult.currency}{paymentResult.amount} completed!
                    </div>
                    <div className="text-sm text-center bg-white rounded p-2 border border-green-200">
                      Receipt Number: <span className="font-mono font-bold">{paymentResult.receipt}</span>
                    </div>
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

// Simple map picker for single location (unchanged)
const MapLocationPicker = ({
  onLocationChange,
  initialLat = 6.5244,
  initialLng = 3.3792,
  placeholder = "Search location...",
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
  }, [markerPos]);
  const onMapClick = useCallback(
    (e) =>
      e.latLng && setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() }),
    [],
  );
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
            placeholder={placeholder}
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

export default TraceabilityPlatform;
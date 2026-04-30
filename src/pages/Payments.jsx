import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
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
} from "lucide-react";
import Webcam from "react-webcam";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

// ---------- Helper functions ----------
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
    );
    const data = await res.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
};

const getCurrencySymbolFromCode = (currencyCode) => {
  const symbols = {
    USD: "$", EUR: "€", GBP: "£", NGN: "₦", CAD: "C$", AUD: "A$",
    INR: "₹", CNY: "¥", JPY: "¥", KRW: "₩", RUB: "₽", BRL: "R$",
    ZAR: "R", CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr",
    MXN: "$", SGD: "S$", HKD: "HK$", NZD: "NZ$",
  };
  return symbols[currencyCode] || currencyCode;
};

// ---------- CountrySelector (unchanged) ----------
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
          const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : "USD";
          return {
            code: country.cca2,
            name: country.name.common,
            currencyCode,
            symbol: getCurrencySymbolFromCode(currencyCode),
          };
        });
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(mapped);
        setLoading(false);
      })
      .catch(() => {
        setCountries([
          { code: "US", name: "United States", currencyCode: "USD", symbol: "$" },
          { code: "GB", name: "United Kingdom", currencyCode: "GBP", symbol: "£" },
          { code: "NG", name: "Nigeria", currencyCode: "NGN", symbol: "₦" },
        ]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const clickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filtered = countries.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type country name..."
        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-sm max-h-48 overflow-y-auto">
          {loading ? <div className="p-2 text-xs text-gray-500">Loading...</div>
            : filtered.length === 0 ? <div className="p-2 text-xs text-gray-500">No countries</div>
            : filtered.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelect(country)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{country.name}</span>
                <span className="text-xs text-gray-400 ml-2">{country.symbol} {country.currencyCode}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

// ---------- Map modal for manual upload (with map + datetime) ----------
const MediaLocationMapModal = ({ fileItem, onConfirm, onCancel }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState("");
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const [map, setMap] = useState(null);
  const autocompleteRef = useRef(null);
  const [markerPos, setMarkerPos] = useState({ lat: 6.5244, lng: 3.3792 });

  useEffect(() => {
    if (coordinates) {
      getAddressFromCoords(coordinates.lat, coordinates.lng).then(setAddress);
      setMarkerPos(coordinates);
      map?.panTo(coordinates);
      map?.setZoom(16);
    }
  }, [coordinates, map]);

  const onMapClick = (e) => {
    if (e.latLng) setCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        setCoordinates(pos);
      }
    }
  };

  const handleConfirm = () => {
    if (!coordinates) {
      toast.warning("Please select a location on the map");
      return;
    }
    onConfirm({
      location: coordinates,
      address: address,
      timestamp: new Date(dateTime).toISOString(),
    });
  };

  if (!isLoaded) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="relative max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold">Set Media Location & Time</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-4">
          {fileItem.type === "image" ? (
            <img src={fileItem.previewUrl} alt="Preview" className="max-h-48 w-auto mx-auto rounded border" />
          ) : (
            <video src={fileItem.previewUrl} controls className="max-h-48 w-auto mx-auto rounded border" />
          )}
          <div>
            <label className="block font-medium mb-1">Date & Time of Capture *</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Location (click on map) *</label>
            <div className="mb-2 flex gap-2">
              <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                <input type="text" placeholder="Search location..." className="flex-1 p-2 border rounded-lg text-sm" />
              </Autocomplete>
            </div>
            <div className="h-64 rounded-lg overflow-hidden border">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={markerPos}
                zoom={14}
                onLoad={setMap}
                onClick={onMapClick}
                options={{ mapTypeId: "satellite", mapTypeControl: false }}  // ← removed control
              >
                {coordinates && <Marker position={coordinates} draggable onDragEnd={(e) => e.latLng && setCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
              </GoogleMap>
            </div>
            {address && <p className="text-xs text-gray-500 mt-1 truncate">📍 {address}</p>}
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Skip</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Media</button>
        </div>
      </div>
    </div>
  );
};

// ---------- MediaCapture with fixed camera accuracy + labels on display ----------
const MediaCapture = ({ onMediaCaptured, existingMedia = [], label = "Add Media" }) => {
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

  const [uploadQueue, setUploadQueue] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentFileForLocation, setCurrentFileForLocation] = useState(null);

  // Camera GPS with high accuracy and refresh when camera opens
  const updateLocation = useCallback(async () => {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      const addr = await getAddressFromCoords(coords.lat, coords.lng);
      setAddress(addr);
    } catch {
      toast.error("GPS location denied or unavailable");
    }
  }, []);

  useEffect(() => {
    if (showCamera) {
      updateLocation();
      timeIntervalRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    } else {
      clearInterval(timeIntervalRef.current);
    }
    return () => clearInterval(timeIntervalRef.current);
  }, [showCamera, updateLocation]);

  useEffect(() => {
    return () => { if (webcamRef.current?.stream) webcamRef.current.stream.getTracks().forEach(track => track.stop()); };
  }, []);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imgSrc = webcamRef.current.getScreenshot();
      if (imgSrc) {
        onMediaCaptured({
          id: Date.now(),
          type: "image",
          data: imgSrc,
          location,
          address,
          timestamp: new Date().toISOString(),
        });
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
      recorder.ondataavailable = (e) => e.data.size && setRecordedChunks(prev => [...prev, e.data]);
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        onMediaCaptured({
          id: Date.now(),
          type: "video",
          data: url,
          blob,
          location,
          address,
          timestamp: new Date().toISOString(),
        });
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
    const updated = existingMedia.filter(m => m.id !== id);
    onMediaCaptured(updated, true);
    if (viewingMedia?.id === id) setIsModalOpen(false);
  };

  const formatDateTime = (isoString) => new Date(isoString).toLocaleString();

  // Manual upload with map modal – fixed queue processing
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newQueueItems = files.map((file) => ({
      file,
      type: file.type.startsWith("image/") ? "image" : "video",
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));
    setUploadQueue(newQueueItems);
    e.target.value = "";
  };

  useEffect(() => {
    if (uploadQueue.length > 0 && !showLocationModal && !currentFileForLocation) {
      const nextFile = uploadQueue[0];
      setCurrentFileForLocation(nextFile);
      setShowLocationModal(true);
    } else if (uploadQueue.length === 0) {
      setShowLocationModal(false);
      setCurrentFileForLocation(null);
    }
  }, [uploadQueue, showLocationModal, currentFileForLocation]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleLocationConfirmed = async ({ location, address, timestamp }) => {
    const item = currentFileForLocation;
    if (!item) return;

    let mediaData;
    if (item.type === "image") {
      const base64 = await fileToBase64(item.file);
      mediaData = {
        id: item.id,
        type: "image",
        data: base64,
        location,
        address,
        timestamp,
      };
    } else {
      mediaData = {
        id: item.id,
        type: "video",
        data: item.previewUrl,
        blob: item.file,
        location,
        address,
        timestamp,
      };
    }
    onMediaCaptured(mediaData);
    toast.success(`${item.type === "image" ? "Image" : "Video"} uploaded with location & time`);

    // remove current file and trigger next
    setUploadQueue(prev => prev.slice(1));
    URL.revokeObjectURL(item.previewUrl);
    setShowLocationModal(false);
    setCurrentFileForLocation(null);
  };

  const handleLocationCancel = () => {
    const item = currentFileForLocation;
    if (item) URL.revokeObjectURL(item.previewUrl);
    setUploadQueue(prev => prev.slice(1));
    setShowLocationModal(false);
    setCurrentFileForLocation(null);
  };

  useEffect(() => {
    return () => {
      existingMedia.forEach(media => {
        if (media.type === "video" && media.data?.startsWith("blob:")) URL.revokeObjectURL(media.data);
      });
    };
  }, [existingMedia]);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button onClick={() => setShowCamera(true)} className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition">
          <Camera size={16} /> {label} (Camera)
        </button>
        <button onClick={() => document.getElementById("file-upload-input").click()} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 3l0 7 6 0-8 7-8-7 6 0 0-7z"/><path d="M4 17v3h16v-3"/></svg>
          Upload File(s)
        </button>
        <input id="file-upload-input" type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
      </div>

      {existingMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingMedia.map((med) => (
            <div key={med.id} className="relative group">
              {med.type === "image" ? (
                <img src={med.data} className="h-20 w-full object-cover rounded-lg cursor-pointer border" onClick={() => { setViewingMedia(med); setIsModalOpen(true); }} alt="thumb" />
              ) : (
                <div className="relative h-20 w-full bg-gray-800 rounded-lg cursor-pointer flex items-center justify-center border" onClick={() => { setViewingMedia(med); setIsModalOpen(true); }}>
                  <video src={med.data} className="h-full w-full object-cover rounded-lg" preload="metadata" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="bg-white/80 rounded-full p-1"><svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                  </div>
                </div>
              )}
              <button onClick={() => deleteMedia(med.id)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate rounded-b-lg">
                📍 {med.address?.substring(0, 40) || "No address"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCamera(false)}>
          <div className="relative max-w-md w-full bg-black rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCamera(false)} className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full"><X size={18} /></button>
            {location && (
              <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-xs p-2 rounded-lg backdrop-blur-sm space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1"><Navigation size={10} />{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
                <div className="flex items-center gap-1"><MapPin size={10} />{address.substring(0, 40)}</div>
                <div className="flex items-center gap-1"><Calendar size={10} />{currentTime.toLocaleTimeString()}</div>
              </div>
            )}
            {isRecording && <div className="absolute top-2 right-12 z-20 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>REC</div>}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-black/50 rounded-full p-1">
              <button onClick={() => setCaptureMode("photo")} className={`px-3 py-1 rounded-full text-xs ${captureMode === "photo" ? "bg-green-600 text-white" : "text-white"}`}>Photo</button>
              <button onClick={() => setCaptureMode("video")} className={`px-3 py-1 rounded-full text-xs ${captureMode === "video" ? "bg-green-600 text-white" : "text-white"}`}>Video</button>
            </div>
            <Webcam ref={webcamRef} audio screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="w-full h-auto" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              {captureMode === "photo" ? (
                <button onClick={capturePhoto} className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition"><Camera size={24} className="text-gray-800" /></button>
              ) : (
                <button onClick={isRecording ? stopRecording : startRecording} className={`rounded-full p-3 shadow-lg transition ${isRecording ? "bg-red-600" : "bg-white"}`}>
                  {isRecording ? <Square size={24} className="text-white" /> : <Circle size={24} className="text-gray-800" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen media view with updated labels */}
      {isModalOpen && viewingMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-3xl w-full bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full"><X size={20} /></button>
            <div className="max-h-[70vh] overflow-auto">
              {viewingMedia.type === "image" ? <img src={viewingMedia.data} className="w-full h-auto" alt="full" /> : <video src={viewingMedia.data} controls autoPlay className="w-full" controlsList="nodownload" />}
            </div>
            <div className="bg-gray-900 text-white p-3 text-xs space-y-1">
              {viewingMedia.location && (
                <div><Navigation size={12} /> Coordinates as set by owner: {viewingMedia.location.lat.toFixed(6)}, {viewingMedia.location.lng.toFixed(6)}</div>
              )}
              <div><MapPin size={12} /> Address as set by owner: {viewingMedia.address}</div>
              <div><Calendar size={12} /> Timestamp as set by owner: {formatDateTime(viewingMedia.timestamp)}</div>
              <button onClick={() => { deleteMedia(viewingMedia.id); setIsModalOpen(false); }} className="mt-2 flex items-center gap-1 bg-red-600 px-3 py-1 rounded text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Map Location Modal for manual upload */}
      {showLocationModal && currentFileForLocation && (
        <MediaLocationMapModal
          fileItem={currentFileForLocation}
          onConfirm={handleLocationConfirmed}
          onCancel={handleLocationCancel}
        />
      )}
    </div>
  );
};

// ---------- Document Upload (unchanged) ----------
const DocumentUpload = ({ documents = [], onDocumentsChange }) => {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({ id: Date.now() + Math.random(), name: file.name }));
    onDocumentsChange([...documents, ...newDocs]);
    e.target.value = "";
  };
  const removeDoc = (id) => onDocumentsChange(documents.filter(d => d.id !== id));
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <label className="block font-medium text-sm">Customs, Agencies & Permits (upload files – only names stored)</label>
      <input type="file" multiple onChange={handleFileSelect} className="text-sm" />
      {documents.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center">
              <span className="truncate">{doc.name}</span>
              <button onClick={() => removeDoc(doc.id)} className="text-red-500"><X size={12} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ---------- TagsInput (unchanged) ----------
const TagsInput = ({ tags = [], onTagsChange, placeholder = "Type and press Enter..." }) => {
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) onTagsChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };
  const removeTag = (tagToRemove) => onTagsChange(tags.filter(t => t !== tagToRemove));
  return (
    <div className="border rounded-lg p-2 focus-within:ring-2 focus-within:ring-green-500">
      <div className="flex flex-wrap gap-2 mb-1">
        {tags.map((tag, idx) => (
          <span key={idx} className="inline-flex items gap-1 bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs">
            {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600"><X size={12} /></button>
          </span>
        ))}
      </div>
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-full outline-none text-sm" />
    </div>
  );
};

// ---------- ContainerList (unchanged) ----------
const ContainerList = ({ containers = [], onContainersChange }) => {
  const addContainer = () => onContainersChange([...containers, { containerNo: "", weightKg: 0 }]);
  const updateContainer = (index, field, value) => {
    const updated = [...containers];
    updated[index][field] = field === "weightKg" ? parseInt(value) || 0 : value;
    onContainersChange(updated);
  };
  const removeContainer = (index) => onContainersChange(containers.filter((_, i) => i !== index));
  return (
    <div className="space-y-2">
      {containers.map((c, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input type="text" placeholder="Container number" value={c.containerNo} onChange={(e) => updateContainer(idx, "containerNo", e.target.value)} className="flex-1 p-2 border rounded-lg" />
          <input type="number" placeholder="Weight (kg)" value={c.weightKg} onChange={(e) => updateContainer(idx, "weightKg", e.target.value)} className="w-28 p-2 border rounded-lg" />
          <button type="button" onClick={() => removeContainer(idx)} className="text-red-500"><Trash2 size={18} /></button>
        </div>
      ))}
      <button type="button" onClick={addContainer} className="text-sm text-green-600 flex items-center gap-1"><Plus size={14} /> Add container</button>
    </div>
  );
};

// ---------- Single Map Location Picker (satellite, no control, + current location) ----------
const MapLocationPicker = ({ onLocationChange, initialLat = 6.5244, initialLng = 3.3792, placeholder = "Search location..." }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries: ["places"] });
  const [map, setMap] = useState(null);
  const [markerPos, setMarkerPos] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState("");
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (markerPos) {
      getAddressFromCoords(markerPos.lat, markerPos.lng).then(setAddress);
      onLocationChange?.({ lat: markerPos.lat, lng: markerPos.lng, address });
    }
  }, [markerPos]);

  const onMapClick = useCallback((e) => e.latLng && setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() }), []);
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        setMarkerPos(pos);
        map?.panTo(pos);
        map?.setZoom(16);
      }
    }
  };

  const setCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarkerPos(coords);
        map?.panTo(coords);
        map?.setZoom(14);
        toast.success("Location set to your current position");
      },
      () => toast.error("Unable to get current location"),
      { enableHighAccuracy: true }
    );
  };

  if (!isLoaded) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
          <input type="text" placeholder={placeholder} className="flex-1 p-2 border rounded-lg focus:ring-green-500" />
        </Autocomplete>
        <button onClick={setCurrentLocation} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-200"><Navigation size={16} /> My Location</button>
      </div>
      <div className="h-64 rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={markerPos}
          zoom={14}
          onLoad={setMap}
          onClick={onMapClick}
          options={{ mapTypeId: "satellite", mapTypeControl: false }}  // ← removed control
        >
          <Marker position={markerPos} draggable onDragEnd={(e) => e.latLng && setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />
        </GoogleMap>
      </div>
      <p className="text-xs text-gray-500 truncate">📍 {address || "Click on map to select location"}</p>
    </div>
  );
};

// ---------- Origin/Destination Map Picker (satellite, no control, + set origin as current location) ----------
const OriginDestinationMapPicker = ({ onOriginChange, onDestinationChange, initialCenter = { lat: 6.5244, lng: 3.3792 } }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries: ["places"] });
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(initialCenter);
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
      if (map) { map.panTo(origin); setCenter(origin); }
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      getAddressFromCoords(destination.lat, destination.lng).then(setDestinationAddress);
      onDestinationChange?.({ ...destination, address: destinationAddress });
      if (map) { map.panTo(destination); setCenter(destination); }
    }
  }, [destination]);

  const onMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (mode === "origin") setOrigin(pos);
    else setDestination(pos);
  }, [mode]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        if (mode === "origin") setOrigin(pos);
        else setDestination(pos);
        if (map) { map.panTo(pos); map.setZoom(16); setCenter(pos); }
      }
    }
  };

  const fitBounds = useCallback(() => {
    if (map && origin && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds);
      setCenter(map.getCenter().toJSON());
    }
  }, [map, origin, destination]);

  const setOriginToCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(coords);
        toast.success("Origin set to your current location");
      },
      () => toast.error("Unable to get current location"),
      { enableHighAccuracy: true }
    );
  };

  if (!isLoaded) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setMode("origin")} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${mode === "origin" ? "bg-green-600 text-white" : "bg-gray-200"}`}><MapPin size={14} /> Set Origin</button>
          <button onClick={() => setMode("destination")} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${mode === "destination" ? "bg-red-600 text-white" : "bg-gray-200"}`}><MapPin size={14} /> Set Destination</button>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
            <input type="text" placeholder={`Search ${mode === "origin" ? "origin" : "destination"} location...`} className="w-full p-2 border rounded-lg text-sm" />
          </Autocomplete>
        </div>
        <button onClick={setOriginToCurrentLocation} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"><Navigation size={14} /> Use My Location as Origin</button>
        {origin && destination && <button onClick={fitBounds} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"><Navigation size={14} /> Fit Both</button>}
      </div>
      <div className="h-64 rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={12}
          onLoad={setMap}
          onClick={onMapClick}
          options={{ mapTypeId: "satellite", mapTypeControl: false }}  // ← removed control
        >
          {origin && <Marker position={origin} label={{ text: "O", color: "white" }} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }} draggable onDragEnd={(e) => e.latLng && setOrigin({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
          {destination && <Marker position={destination} label={{ text: "D", color: "white" }} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }} draggable onDragEnd={(e) => e.latLng && setDestination({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
        </GoogleMap>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="truncate">📍 Origin: {originAddress || "Not set"}</div>
        <div className="truncate">📍 Destination: {destinationAddress || "Not set"}</div>
      </div>
    </div>
  );
};

// ---------- Payment Simulation Modal (unchanged) ----------
const PaymentSimulationModal = ({ amount, currency, onPay, onCancel }) => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = () => {
    if (!companyName.trim() || !email.trim()) {
      toast.error("Please enter both company name and email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    onPay({ companyName, email });
  };
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="relative max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold">Payment Simulation</h3>
          <button onClick={onCancel} className="text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-lg">Amount: <span className="font-bold">{currency}{amount}</span></p>
          <input type="text" placeholder="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2 border rounded-lg" />
          <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" />
          <p className="text-xs text-gray-500">This information will appear on the final record.</p>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirm Payment</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Record Modal (with updated labels) ----------
const RecordModal = ({ data, onClose }) => {
  if (!data) return null;
  const { levyType, country, formFields, media, documents, payment, payer, receipt } = data;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow"><X size={20} /></button>
          <div className="bg-green-700 text-white p-6">
            <h2 className="text-3xl font-bold">Traceability Record</h2>
            <p className="text-green-100">Generated on {new Date().toLocaleString()}</p>
            <p className="font-mono text-sm mt-1">Receipt: {receipt}</p>
          </div>
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Payer info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard size={18} /> Payment & Payer</h3>
              <p>Amount: {payment.currency}{payment.amount}</p>
              <p>Company: {payer.companyName}</p>
              <p>Email: {payer.email}</p>
            </div>
            {/* Levy & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Levy Type:</strong> {levyType}</div>
              <div><strong>Country:</strong> {country?.name} ({country?.code})</div>
            </div>
            {/* Form Fields */}
            <div>
              <h3 className="font-bold text-lg border-b pb-1">Submission Details</h3>
              <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-3 rounded mt-2">{JSON.stringify(formFields, null, 2)}</pre>
            </div>
            {/* Media */}
            {media && media.length > 0 && (
              <div>
                <h3 className="font-bold text-lg border-b pb-1">Media Evidence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {media.map((med, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      {med.type === "image" ? (
                        <img src={med.data} className="h-32 w-full object-cover" alt="media" />
                      ) : (
                        <video src={med.data} className="h-32 w-full object-cover" controls />
                      )}
                      <div className="p-1 text-xs bg-gray-100">
                        <p><MapPin size={10} /> Address as set by owner: {med.address?.substring(0, 60)}</p>
                        <p><Navigation size={10} /> Coordinates as set by owner: {med.location?.lat?.toFixed(5)}, {med.location?.lng?.toFixed(5)}</p>
                        <p><Calendar size={10} /> Timestamp as set by owner: {new Date(med.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Documents */}
            {documents && documents.length > 0 && (
              <div>
                <h3 className="font-bold text-lg border-b pb-1">Customs, Agencies & Permits</h3>
                <ul className="list-disc pl-5 mt-1">
                  {documents.map((doc, idx) => <li key={idx}>{doc.name}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main TraceabilityPlatform Component (unchanged except updated callbacks) ----------
const TraceabilityPlatform = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLevy, setSelectedLevy] = useState("corporate");
  const [formData, setFormData] = useState({});
  const [coordinates, setCoordinates] = useState(null);
  const [media, setMedia] = useState([]);
  const [originMedia, setOriginMedia] = useState([]);
  const [destinationMedia, setDestinationMedia] = useState([]);
  const [generalMediaVehicular, setGeneralMediaVehicular] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recordData, setRecordData] = useState(null);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  // Search logic (unchanged)
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchMatches([]); return; }
    const query = searchQuery.toLowerCase().trim();
    const matches = [];
    const includesQuery = (val) => val && val.toString().toLowerCase().includes(query);
    if (receiptNumber && includesQuery(receiptNumber)) matches.push(`Receipt Number: ${receiptNumber}`);
    if (selectedLevy === "vehicular") {
      if (includesQuery(formData.regNo)) matches.push(`Vehicle Registration: ${formData.regNo}`);
      if (formData.containers) formData.containers.forEach((c, idx) => { if (includesQuery(c.containerNo)) matches.push(`Container #${idx + 1}: ${c.containerNo}`); });
    }
    setSearchMatches(matches);
  }, [searchQuery, formData, selectedLevy, receiptNumber]);

  const calculatePayment = () => {
    switch (selectedLevy) {
      case "corporate": return Math.max(100, Math.ceil((formData.annualForestProductKg || 0) / 1000) * 20);
      case "residential": return Math.max(50, (formData.woodenAreaSqm || 0) * 2);
      case "vehicular": return Math.max(30, (formData.forestProducts?.length || 0) * 15);
      case "use": return Math.max(10, (formData.quantityKg || 0) * 0.05);
      default: return 100;
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  };

  const buildRecordData = (payerInfo) => {
    let allMedia = [];
    if (selectedLevy === "vehicular") {
      allMedia = [...originMedia, ...destinationMedia, ...generalMediaVehicular];
    } else {
      allMedia = media;
    }
    return {
      levyType: selectedLevy,
      country: selectedCountry,
      formFields: formData,
      media: allMedia,
      documents: documents,
      payment: { amount: calculatePayment(), currency: selectedCountry?.symbol || "$" },
      payer: payerInfo,
      receipt: receiptNumber,
    };
  };

  const handlePaymentClick = () => {
    if (!selectedCountry) { toast.error("Please select your country first"); return; }
    if (selectedLevy === "corporate" && (!formData.businessName || !formData.businessType)) { toast.error("Please fill business name and type"); return; }
    if (selectedLevy === "residential" && (!formData.propertyAddress || !formData.woodenAreaSqm)) { toast.error("Please fill property address and wooden area"); return; }
    if (selectedLevy === "vehicular" && (!formData.vehicleCat || !formData.forestProducts?.length)) { toast.error("Please fill vehicle type and at least one forest product"); return; }
    if (selectedLevy === "use" && (!formData.productType || !formData.quantityKg)) { toast.error("Please fill product type and quantity"); return; }
    setShowPaymentModal(true);
  };

  const onPaymentConfirmed = (payerInfo) => {
    setIsProcessing(true);
    setTimeout(() => {
      const amount = calculatePayment();
      const newReceipt = generateReceiptNumber();
      setReceiptNumber(newReceipt);
      setPaymentResult({ amount, success: true, currency: selectedCountry?.symbol, receipt: newReceipt });
      toast.success(`Payment simulated. Receipt: ${newReceipt}`);
      const record = buildRecordData(payerInfo);
      setRecordData(record);
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 800);
  };

  const levies = [
    { id: "corporate", label: "Corporate / Commercial", icon: Building2, color: "bg-emerald-100", textColor: "text-emerald-800", description: "Hotels, banks, schools, malls, factories, etc." },
    { id: "residential", label: "Residential + Construction", icon: Home, color: "bg-teal-100", textColor: "text-teal-800", description: "Homes, building sites, housing projects" },
    { id: "vehicular", label: "Vehicular Levy", icon: Truck, color: "bg-cyan-100", textColor: "text-cyan-800", description: "Cars, trucks, ships, aircraft, tractors transporting forest products" },
    { id: "use", label: "Use / Consumption", icon: Flame, color: "bg-orange-100", textColor: "text-orange-800", description: "Firewood, charcoal, forest product usage" },
  ];
  const currentLevy = levies.find(l => l.id === selectedLevy) || levies[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero section (unchanged) */}
      <section className="relative bg-green-800 text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-6xl font-bold mb-4">Traceability Platform</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">Compliance for trade, use & consumption of forest products — domestic, import & export</motion.p>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex justify-center gap-4 flex-wrap">
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">🌍 EUDR Compliant</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">📸 GPS-tagged Media</div>
            <div className="bg-white/20 backdrop-blur rounded-full px-6 py-2">🗺️ Geo-boundary mapping</div>
          </motion.div>
        </div>
      </section>

      {/* Global Search (unchanged) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-md py-3 px-6 border-b border-green-100">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center bg-white border-2 border-green-200 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-green-500">
            <div className="pl-5 text-green-600"><Search size={20} /></div>
            <input type="text" placeholder="Search by container number, vehicle registration number, or receipt number" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 outline-none text-gray-700 placeholder-gray-400" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="pr-5 text-gray-400 hover:text-gray-600"><X size={18} /></button>}
          </div>
          {searchMatches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1"><Search size={14} /> Match(es) found:</p>
              <ul className="space-y-1">{searchMatches.map((match, idx) => <li key={idx} className="text-gray-600 flex items-center gap-2"><CheckCircle size={12} className="text-green-600" />{match}</li>)}</ul>
            </div>
          )}
        </div>
      </div>

      {/* Country Selection (unchanged) */}
      <section className="py-8 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><span className="text-2xl">🌍</span> Step 1: Select Your Country</h2>
          <CountrySelector selectedCountry={selectedCountry} onSelectCountry={(country) => { setSelectedCountry(country); setPaymentResult(null); setReceiptNumber(null); toast.info(`Currency set to ${country.symbol} (${country.currencyCode})`); }} />
          {!selectedCountry && <p className="text-amber-600 text-sm mt-3 flex items-center gap-1">⚠️ Please select a country – this determines your payment currency.</p>}
        </div>
      </section>

      {/* Levy Selection (unchanged) */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-8">Regulatory Compliance</h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
            {levies.map((levy) => (
              <motion.button
                key={levy.id}
                whileHover={{ scale: selectedCountry ? 1.02 : 1 }}
                onClick={() => { if (!selectedCountry) { toast.error("Please select your country first"); return; } setSelectedLevy(levy.id); setFormData({}); setMedia([]); setOriginMedia([]); setDestinationMedia([]); setGeneralMediaVehicular([]); setDocuments([]); setPaymentResult(null); setSearchQuery(""); }}
                className={`snap-start min-w-[280px] p-6 rounded-2xl shadow-lg transition-all ${selectedLevy === levy.id ? "ring-4 ring-green-500 bg-white" : "bg-white hover:shadow-xl"} ${!selectedCountry ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={!selectedCountry}
              >
                <div className={`w-16 h-16 ${levy.color} rounded-2xl flex items-center justify-center mb-4`}><levy.icon className={`w-8 h-8 ${levy.textColor}`} /></div>
                <h3 className="text-xl font-bold text-gray-800">{levy.label}</h3>
                <p className="text-gray-500 text-sm mt-2">{levy.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Form (unchanged except prop passing) */}
      <section className="py-8 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2">{currentLevy.icon && <currentLevy.icon className="w-6 h-6" />}{currentLevy.label}</h3>
          </div>
          <div className="p-6 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div key={selectedLevy} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Corporate */}
                {selectedLevy === "corporate" && (
                  <>
                    <div><label className="block font-medium">Business Name *</label><input type="text" className="w-full p-2 border rounded-lg" value={formData.businessName || ""} onChange={(e) => updateForm("businessName", e.target.value)} /></div>
                    <div><label className="block font-medium">Business Type *</label><select className="w-full p-2 border rounded-lg" value={formData.businessType || ""} onChange={(e) => updateForm("businessType", e.target.value)}><option value="">Select</option><option>Hotel</option><option>Bank</option><option>School</option><option>Shopping Mall</option><option>Factory</option><option>Other</option></select></div>
                    <div><label className="block font-medium">Estimated Annual Forest Product Consumption (kg)</label><input type="number" className="w-full p-2 border rounded-lg" value={formData.annualForestProductKg || ""} onChange={(e) => updateForm("annualForestProductKg", parseInt(e.target.value) || 0)} /></div>
                    <div><label className="block font-medium">Address of Premises</label><input type="text" className="w-full p-2 border rounded-lg" value={formData.address || ""} onChange={(e) => updateForm("address", e.target.value)} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><MapPin size={18} /> GPS Location</label><MapLocationPicker onLocationChange={setCoordinates} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> Upload Evidence</label><MediaCapture onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setMedia(newMedia) : setMedia(prev => [...prev, newMedia])} existingMedia={media} /></div>
                    <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />
                  </>
                )}
                {/* Residential */}
                {selectedLevy === "residential" && (
                  <>
                    <div><label className="block font-medium">Property Address *</label><input type="text" className="w-full p-2 border rounded-lg" value={formData.propertyAddress || ""} onChange={(e) => updateForm("propertyAddress", e.target.value)} /></div>
                    <div><label className="block font-medium">Type of Residence</label><select className="w-full p-2 border rounded-lg" value={formData.residenceType || ""} onChange={(e) => updateForm("residenceType", e.target.value)}><option>House</option><option>Apartment</option><option>Duplex</option><option>Other</option></select></div>
                    <div><label className="block font-medium">Wooden Construction Area (sq meters) *</label><input type="number" className="w-full p-2 border rounded-lg" value={formData.woodenAreaSqm || ""} onChange={(e) => updateForm("woodenAreaSqm", parseInt(e.target.value) || 0)} /></div>
                    <div><label className="block font-medium">Construction Type</label><select className="w-full p-2 border rounded-lg" value={formData.constructionType || ""} onChange={(e) => updateForm("constructionType", e.target.value)}><option>New Build</option><option>Renovation</option><option>Demolition</option></select></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><MapPin size={18} /> GPS Location</label><MapLocationPicker onLocationChange={setCoordinates} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> Upload Evidence</label><MediaCapture onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setMedia(newMedia) : setMedia(prev => [...prev, newMedia])} existingMedia={media} /></div>
                    <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />
                  </>
                )}
                {/* Vehicular */}
                {selectedLevy === "vehicular" && (
                  <>
                    <div className="border-b pb-4"><label className="block font-medium mb-2 flex items-center gap-2"><MapPin size={18} /> Origin & Destination (click on map to set)</label><OriginDestinationMapPicker onOriginChange={(loc) => { updateForm("origin", loc.address); updateForm("originCoords", loc); }} onDestinationChange={(loc) => { updateForm("destination", loc.address); updateForm("destinationCoords", loc); }} /></div>
                    <div><label className="block font-medium">Vehicle Category *</label><select className="w-full p-2 border rounded-lg" value={formData.vehicleCat || ""} onChange={(e) => updateForm("vehicleCat", e.target.value)}><option>Land Motorized (truck, lorry)</option><option>Land Non-motorized (bicycle cart)</option><option>Water Vehicle (ship, boat)</option><option>Air Vehicle (airplane, helicopter)</option><option>Construction/Agricultural (tractor, bulldozer)</option></select></div>
                    <div><label className="block font-medium">Vehicle Registration Number</label><input className="w-full p-2 border rounded-lg" value={formData.regNo || ""} onChange={(e) => updateForm("regNo", e.target.value)} /></div>
                    <div><label className="block font-medium">Forest Product Utilized (type names) *</label><TagsInput tags={formData.forestProducts || []} onTagsChange={(tags) => updateForm("forestProducts", tags)} placeholder="Type product name and press Enter (e.g., Teak logs)" /><p className="text-xs text-gray-500 mt-1">List all forest products being transported.</p></div>
                    <div><label className="block font-medium">Container Numbers & Weight per Container</label><ContainerList containers={formData.containers || []} onContainersChange={(containers) => updateForm("containers", containers)} /></div>
                    <div><label className="block font-medium">Type of Goods/Products Conveyed</label><TagsInput tags={formData.goodsTypes || []} onTagsChange={(tags) => updateForm("goodsTypes", tags)} placeholder="Type product and press Enter..." /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> Origin Location Media</label><MediaCapture label="Add Origin Media" onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setOriginMedia(newMedia) : setOriginMedia(prev => [...prev, newMedia])} existingMedia={originMedia} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> Destination Location Media</label><MediaCapture label="Add Destination Media" onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setDestinationMedia(newMedia) : setDestinationMedia(prev => [...prev, newMedia])} existingMedia={destinationMedia} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> General Media</label><MediaCapture label="Add General Media" onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setGeneralMediaVehicular(newMedia) : setGeneralMediaVehicular(prev => [...prev, newMedia])} existingMedia={generalMediaVehicular} /></div>
                    <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />
                  </>
                )}
                {/* Use */}
                {selectedLevy === "use" && (
                  <>
                    <div><label className="block font-medium">Product Type *</label><input className="w-full p-2 border rounded-lg" value={formData.productType || ""} onChange={(e) => updateForm("productType", e.target.value)} placeholder="Firewood, Charcoal, Timber" /></div>
                    <div><label className="block font-medium">Quantity (kg) *</label><input type="number" className="w-full p-2 border rounded-lg" value={formData.quantityKg || ""} onChange={(e) => updateForm("quantityKg", parseInt(e.target.value) || 0)} /></div>
                    <div><label className="block font-medium">Purpose of Use</label><textarea className="w-full p-2 border rounded-lg" rows="2" value={formData.purpose || ""} onChange={(e) => updateForm("purpose", e.target.value)} placeholder="e.g., cooking, heating, construction" /></div>
                    <div><label className="block font-medium">Location of Use</label><input className="w-full p-2 border rounded-lg" value={formData.locationUse || ""} onChange={(e) => updateForm("locationUse", e.target.value)} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><MapPin size={18} /> GPS Location</label><MapLocationPicker onLocationChange={setCoordinates} /></div>
                    <div className="border-t pt-4"><label className="block font-medium mb-2 flex items-center gap-2"><Camera size={18} /> Upload Evidence</label><MediaCapture onMediaCaptured={(newMedia, replaceAll) => replaceAll ? setMedia(newMedia) : setMedia(prev => [...prev, newMedia])} existingMedia={media} /></div>
                    <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />
                  </>
                )}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center"><span className="font-semibold">Estimated Levy Amount:</span><span className="text-2xl font-bold text-green-700">{selectedCountry ? selectedCountry.symbol : "$"}{calculatePayment()}</span></div>
                  <p className="text-xs text-gray-500 mt-1">{selectedLevy === "vehicular" ? "Based on number of forest product types entered." : "Based on provided details. Final amount may adjust after verification."}{selectedCountry && <span className="block mt-1">💱 Currency: {selectedCountry.currencyCode} ({selectedCountry.symbol})</span>}</p>
                </div>
                <button onClick={handlePaymentClick} disabled={isProcessing || !selectedCountry} className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CreditCard size={20} />}
                  {isProcessing ? "Processing..." : `Pay ${selectedCountry ? selectedCountry.symbol : "$"}${calculatePayment()}`}
                </button>
                {paymentResult?.success && (
                  <div className="bg-green-50 p-4 rounded-lg text-green-800 space-y-2">
                    <div className="flex items-center justify-center gap-2 font-semibold"><CheckCircle size={20} /> Payment of {paymentResult.currency}{paymentResult.amount} completed!</div>
                    <div className="text-sm text-center bg-white rounded p-2 border border-green-200">Receipt Number: <span className="font-mono font-bold">{paymentResult.receipt}</span></div>
                    <button onClick={() => setRecordData(buildRecordData({ companyName: "Third Party Payer", email: "payer@example.com" }))} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm">View Full Record</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      {showPaymentModal && (
        <PaymentSimulationModal amount={calculatePayment()} currency={selectedCountry?.symbol || "$"} onPay={onPaymentConfirmed} onCancel={() => setShowPaymentModal(false)} />
      )}
      {recordData && <RecordModal data={recordData} onClose={() => setRecordData(null)} />}
    </div>
  );
};

export default TraceabilityPlatform;
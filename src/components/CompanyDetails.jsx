import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Webcam from "react-webcam";
import {
  Plus,
  Upload,
  X,
  FileText,
  User,
  Building,
  Download,
  Edit,
  Trash2,
  Users,
  Search,
  ExternalLink,
  AlertCircle,
  Eye,
  CheckCircle,
  Mail,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  Video,
  Calendar,
  Maximize2,
  Save,
  RotateCw,
  Square,
  Circle,
  Image as ImageIcon,
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";

// Custom hook to fetch countries with new API
const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flags",
        );
        if (!res.ok) throw new Error("Failed to fetch countries");

        const data = await res.json();

        // Format and sort countries using new API structure
        const formatted = data
          .filter((c) => c.cca2 && c.name?.common)
          .map((c) => ({
            name: c.name.common,
            code: c.cca2.toLowerCase(),
            flag:
              c.flags?.png ||
              `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching countries:", err);

        // Fallback to basic country list if API fails
        const fallbackCountries = [
          {
            name: "United States",
            code: "us",
            flag: "https://flagcdn.com/w320/us.png",
          },
          {
            name: "Canada",
            code: "ca",
            flag: "https://flagcdn.com/w320/ca.png",
          },
          {
            name: "United Kingdom",
            code: "gb",
            flag: "https://flagcdn.com/w320/gb.png",
          },
          {
            name: "Germany",
            code: "de",
            flag: "https://flagcdn.com/w320/de.png",
          },
          {
            name: "France",
            code: "fr",
            flag: "https://flagcdn.com/w320/fr.png",
          },
          {
            name: "Japan",
            code: "jp",
            flag: "https://flagcdn.com/w320/jp.png",
          },
          {
            name: "Australia",
            code: "au",
            flag: "https://flagcdn.com/w320/au.png",
          },
          {
            name: "China",
            code: "cn",
            flag: "https://flagcdn.com/w320/cn.png",
          },
          {
            name: "India",
            code: "in",
            flag: "https://flagcdn.com/w320/in.png",
          },
          {
            name: "Brazil",
            code: "br",
            flag: "https://flagcdn.com/w320/br.png",
          },
        ];
        setCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// GPS Media Capture Modal Component
const GPSMediaCaptureModal = ({ isOpen, onClose, facility, onSaveMedia }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [captureMode, setCaptureMode] = useState("photo");
  const [tags, setTags] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStartTime = useRef(null);

  // Check if device is mobile
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

  // Reverse geocoding function to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

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

        return addressParts.join(", ");
      }

      return `${lat}, ${lng}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat}, ${lng}`;
    }
  };

  // In GPSMediaCaptureModal component, replace the useEffect for location:
  useEffect(() => {
    let timeInterval;
    let geoWatchId;

    timeInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Get location once on mount, not continuously
    if (navigator.geolocation && isOpen) {
      const locationTimeout = setTimeout(() => {
        toast.error("GPS location request timed out");
      }, 10000);

      geoWatchId = navigator.geolocation.watchPosition(
        async (position) => {
          clearTimeout(locationTimeout);
          const coords = {
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          };
          setCurrentLocation(coords);

          const locationAddress = await getAddressFromCoords(
            position.coords.latitude,
            position.coords.longitude,
          );
          setAddress(locationAddress);
        },
        (error) => {
          clearTimeout(locationTimeout);
          console.error("Error getting location:", error);
          if (error.code !== error.PERMISSION_DENIED) {
            toast.error("Could not retrieve GPS location");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    }

    return () => {
      clearInterval(timeInterval);
      if (geoWatchId) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [isOpen]); // Add isOpen as dependency

  // Toggle between front and back camera
  const toggleCameraFacingMode = () => {
    setCameraFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment",
    );
    toast.info(
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
          facilityName: facility.name,
          facilityType: getFacilityType(facility.type),
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          cameraMode: cameraFacingMode,
          duration: (Date.now() - recordingStartTime.current) / 1000,
        };

        setCapturedVideos([...capturedVideos, newVideo]);
        setIsRecording(false);
        toast.success("Video recorded successfully!");
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
    }
  };

  // Get facility type string
  const getFacilityType = (type) => {
    switch (type) {
      case "corporate":
        return "Corporate Facility";
      case "production":
        return "Production/Forest Site";
      case "processing":
        return "Processing/Loading Site";
      default:
        return "Other";
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
        facilityName: facility.name,
        facilityType: getFacilityType(facility.type),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        cameraMode: cameraFacingMode,
      };

      setCapturedImages([...capturedImages, newImage]);
      toast.success("Image captured successfully!");
    }
  };

  // Handle capture based on mode
  const handleCapture = () => {
    if (captureMode === "photo") {
      captureImage();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  // Remove an image
  const removeImage = (id) => {
    setCapturedImages(capturedImages.filter((img) => img.id !== id));
    toast.info("Image removed");
  };

  // Remove a video
  const removeVideo = (id) => {
    const video = capturedVideos.find((v) => v.id === id);
    if (video && video.url) {
      URL.revokeObjectURL(video.url);
    }
    setCapturedVideos(capturedVideos.filter((vid) => vid.id !== id));
    toast.info("Video removed");
  };

  // Save all media to the facility
  const saveMediaToFacility = () => {
    if (capturedImages.length === 0 && capturedVideos.length === 0) {
      toast.warning("No media to save");
      return;
    }

    // Prepare media data for saving
    const mediaData = {
      id: Date.now(),
      images: capturedImages.map((img) => ({
        ...img,
        src: img.src,
        location: img.location,
        address: img.address,
        timestamp: img.timestamp,
      })),
      videos: capturedVideos.map((vid) => ({
        ...vid,
        url: vid.url,
        location: vid.location,
        address: vid.address,
        timestamp: vid.timestamp,
      })),
      timestamp: new Date().toISOString(),
      facilityId: facility.id,
      facilityName: facility.name,
      totalItems: capturedImages.length + capturedVideos.length,
    };

    // Pass to parent component
    onSaveMedia(mediaData);

    // Clean up video URLs
    capturedVideos.forEach((video) => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });

    // Show success message
    toast.success(
      `✅ ${capturedImages.length} images and ${capturedVideos.length} videos saved to ${facility.name}`,
    );

    // Close modal
    onClose();
  };

  // Format date and time for display
  const formatDateTime = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Video constraints
  const videoConstraints = {
    facingMode: cameraFacingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-green-800 break-words">
              Capture Media for {facility.name}
            </h3>
            <p className="text-gray-600 mt-1 break-words">
              {getFacilityType(facility.type)} • {facility.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Camera Controls */}
            <div className="space-y-6">
              {/* Camera Control */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Camera Control
                  </h2>
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

                {/* Capture Mode Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capture Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCaptureMode("photo")}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        captureMode === "photo"
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Camera size={16} />
                      <span>Photo</span>
                    </button>
                    <button
                      onClick={() => setCaptureMode("video")}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        captureMode === "video"
                          ? "bg-red-100 border-red-500 text-red-800"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Video size={16} />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                {/* Tags Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., maintenance, inspection, safety, equipment"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Live Camera Feed */}
                {isCameraActive && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium text-gray-700 mb-3">
                      Live Camera Feed
                    </h3>

                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                      {/* Live GPS/Time Overlay */}
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
                              {formatDateTime(currentDateTime)}
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
                        audio={true}
                        screenshotFormat="image/png"
                        videoConstraints={videoConstraints}
                        className="w-full h-auto"
                        mirrored={cameraFacingMode === "user"}
                      />

                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        {/* Camera flip button */}
                        <button
                          onClick={toggleCameraFacingMode}
                          className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-full font-medium shadow-lg transition-all hover:scale-105"
                        >
                          <RotateCw size={14} />
                          {cameraFacingMode === "environment"
                            ? "Front"
                            : "Back"}
                        </button>

                        <button
                          onClick={handleCapture}
                          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105 ${
                            captureMode === "video" && isRecording
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-white/90 hover:bg-white text-gray-800"
                          }`}
                        >
                          {captureMode === "photo" ? (
                            <>
                              <Camera size={20} />
                              <span>Capture</span>
                            </>
                          ) : isRecording ? (
                            <>
                              <Square size={20} />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Circle size={20} className="text-red-500" />
                              <span>Record</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-3 text-center">
                      {captureMode === "photo"
                        ? "Photos will include GPS location, timestamp, and facility information"
                        : "Videos will include GPS location, timestamp, and facility information"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Captured Media Preview */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Captured Media
                  </h2>
                  <div className="text-sm text-gray-500">
                    <span>{capturedImages.length} photo(s)</span>
                    <span className="mx-2">•</span>
                    <span>{capturedVideos.length} video(s)</span>
                  </div>
                </div>

                {capturedImages.length === 0 && capturedVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Camera className="mx-auto mb-2" size={48} />
                    <p>No media captured yet</p>
                    <p className="text-sm">
                      Activate the camera and capture photos or videos
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                    {/* Display Images */}
                    {capturedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedImage(image)}
                        >
                          <img
                            src={image.src}
                            alt={`Capture ${image.id}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                          />
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                            PHOTO
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
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
                          onClick={() => setExpandedVideo(video)}
                        >
                          <div className="w-full h-32 bg-gray-800 rounded-lg border border-gray-200 hover:border-red-500 transition-colors overflow-hidden relative">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover opacity-70"
                              preload="metadata"
                            />
                            <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">
                              VIDEO
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                              {formatTime(video.duration || 0)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVideo(video.id);
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

        <div className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveMediaToFacility}
              disabled={
                capturedImages.length === 0 && capturedVideos.length === 0
              }
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save {capturedImages.length + capturedVideos.length} Media to{" "}
              {facility.name}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/80 text-white rounded-full p-2 z-10 backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={expandedImage.src}
                alt="Expanded view"
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              <div className="bg-gray-800 text-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Image Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">
                          {expandedImage.facilityName}
                        </p>
                        <p className="text-gray-400">
                          {expandedImage.facilityType}
                        </p>
                      </div>
                      <p>
                        <span className="text-gray-400">Captured:</span>{" "}
                        {new Date(expandedImage.timestamp).toLocaleString()}
                      </p>
                      {expandedImage.tags.length > 0 && (
                        <div>
                          <p className="text-gray-400 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {expandedImage.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Location Data
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>
                          {expandedImage.address || "No address data"}
                        </span>
                      </p>
                      {expandedImage.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span>{" "}
                          {expandedImage.location.lat},{" "}
                          {expandedImage.location.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Video Modal */}
      {expandedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setExpandedVideo(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/80 text-white rounded-full p-2 z-10 backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            <div className="bg-white rounded-lg overflow-hidden">
              <video
                src={expandedVideo.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[70vh] bg-black"
              />

              <div className="bg-gray-800 text-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Video Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">
                          {expandedVideo.facilityName}
                        </p>
                        <p className="text-gray-400">
                          {expandedVideo.facilityType}
                        </p>
                      </div>
                      <p>
                        <span className="text-gray-400">Recorded:</span>{" "}
                        {new Date(expandedVideo.timestamp).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Duration:</span>{" "}
                        {formatTime(expandedVideo.duration || 0)}
                      </p>
                      {expandedVideo.tags.length > 0 && (
                        <div>
                          <p className="text-gray-400 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {expandedVideo.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Location Data
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>
                          {expandedVideo.address || "No address data"}
                        </span>
                      </p>
                      {expandedVideo.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span>{" "}
                          {expandedVideo.location.lat},{" "}
                          {expandedVideo.location.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// StaffMember Component - SIMPLIFIED VERSION
const StaffMember = ({ staff, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50">
      <div
        className="flex flex-col sm:flex-row justify-between items-start gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-green-100 p-2 rounded-lg">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 break-words">
              {staff.fullName || staff.name || "Unnamed Staff"}
            </h4>
            <p className="text-sm text-gray-600 break-words mt-1">
              {staff.jobDescription || staff.jobTitle || "No job title"}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {staff.idCard ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  ID Uploaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  ID Missing
                </span>
              )}
              {staff.employmentContract || staff.contract ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  <FileText className="w-3 h-3" />
                  Contract Uploaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Contract Missing
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff.id);
            }}
            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg"
            title="Edit Staff"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(staff.id);
            }}
            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
            title="Delete Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="break-words">
              <span className="text-gray-500 font-medium">Name:</span>{" "}
              {staff.fullName || staff.name || "Not provided"}
            </div>
            <div className="break-words">
              <span className="text-gray-500 font-medium">Age:</span>{" "}
              {staff.age || "Not provided"}
            </div>
            <div className="break-words">
              <span className="text-gray-500 font-medium">Job Title:</span>{" "}
              {staff.jobDescription || staff.jobTitle || "Not provided"}
            </div>
            <div className="break-words">
              <span className="text-gray-500 font-medium">Staff ID:</span>{" "}
              {staff.id || "N/A"}
            </div>
          </div>

          {/* Documents Section - SIMPLIFIED */}
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Documents</h5>

            {/* ID Card */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${staff.idCard ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${staff.idCard ? "bg-green-100" : "bg-gray-100"}`}
                >
                  {staff.idCard ? (
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">Staff ID Card</p>
                  <p className="text-sm text-gray-500">
                    {staff.idCard
                      ? `Uploaded: ${staff.idCard.name || "ID Card"}`
                      : "No ID card uploaded"}
                  </p>
                </div>
              </div>
              {staff.idCard && (
                <button
                  className="text-green-600 hover:text-green-800 p-1"
                  onClick={() => {
                    // Simulate download
                    alert(
                      `Downloading ID card: ${staff.idCard.name || "ID Card"}`,
                    );
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Employment Contract */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg ${staff.employmentContract || staff.contract ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${staff.employmentContract || staff.contract ? "bg-blue-100" : "bg-gray-100"}`}
                >
                  {staff.employmentContract || staff.contract ? (
                    <FileText className="w-4 h-4 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Employment Contract
                  </p>
                  <p className="text-sm text-gray-500">
                    {staff.employmentContract || staff.contract
                      ? `Uploaded: ${staff.employmentContract?.name || staff.contract?.name || "Contract"}`
                      : "No contract uploaded"}
                  </p>
                </div>
              </div>
              {(staff.employmentContract || staff.contract) && (
                <button
                  className="text-blue-600 hover:text-blue-800 p-1"
                  onClick={() => {
                    // Simulate download
                    alert(
                      `Downloading contract: ${staff.employmentContract?.name || staff.contract?.name || "Contract"}`,
                    );
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// AddStaffModal - FIXED VERSION with proper file name persistence
const AddStaffModal = ({ isOpen, onClose, onSave, editingStaff }) => {
  const [staff, setStaff] = useState({
    name: "",
    fullName: "",
    age: "",
    jobTitle: "",
    jobDescription: "",
    idCard: null,
    employmentContract: null,
  });

  const [idCardFile, setIdCardFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);

  // Initialize with editing data if provided
  useEffect(() => {
    if (editingStaff) {
      setStaff({
        name: editingStaff.name || editingStaff.fullName || "",
        fullName: editingStaff.fullName || editingStaff.name || "",
        age: editingStaff.age || "",
        jobTitle: editingStaff.jobTitle || editingStaff.jobDescription || "",
        jobDescription:
          editingStaff.jobDescription || editingStaff.jobTitle || "",
        idCard: editingStaff.idCard || null,
        employmentContract:
          editingStaff.employmentContract || editingStaff.contract || null,
      });
      setIdCardFile(null);
      setContractFile(null);
    } else {
      // Reset form for new staff
      setStaff({
        name: "",
        fullName: "",
        age: "",
        jobTitle: "",
        jobDescription: "",
        idCard: null,
        employmentContract: null,
      });
      setIdCardFile(null);
      setContractFile(null);
    }
  }, [editingStaff, isOpen]);

  // Handle file change - EXTRACT filename and update document object
  const handleFileChange = (field, file) => {
    if (!file) return;

    // Extract the filename without extension
    const fileName = file.name;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    const displayName = nameWithoutExt || fileName;

    // Create the document object with the extracted filename
    const documentObj = {
      name: displayName,
      fileName: fileName,
      file: file,
      date: new Date().toLocaleDateString(),
      size: file.size,
      url: "", // Empty URL for simulation
    };

    if (field === "idCard") {
      setIdCardFile(file);
      setStaff({ ...staff, idCard: documentObj });
    } else if (field === "employmentContract") {
      setContractFile(file);
      setStaff({ ...staff, employmentContract: documentObj });
    }
  };

  const handleSubmit = () => {
    // Prepare final staff data
    const staffData = {
      id: editingStaff ? editingStaff.id : Date.now(),
      name: staff.name || staff.fullName,
      fullName: staff.fullName || staff.name,
      age: staff.age,
      jobTitle: staff.jobTitle || staff.jobDescription,
      jobDescription: staff.jobDescription || staff.jobTitle,
    };

    // Handle ID Card - Use new file OR existing
    if (idCardFile) {
      // New file uploaded - extract name properly
      const idCardName = idCardFile.name.replace(/\.[^/.]+$/, "") || "ID Card";
      staffData.idCard = {
        name: idCardName,
        fileName: idCardFile.name,
        url: "", // Empty URL for simulation
      };
    } else if (editingStaff?.idCard) {
      // Keep existing ID card
      staffData.idCard = editingStaff.idCard;
    }

    // Handle Employment Contract - Use new file OR existing
    if (contractFile) {
      // New file uploaded - extract name properly
      const contractName =
        contractFile.name.replace(/\.[^/.]+$/, "") || "Employment Contract";
      staffData.employmentContract = {
        name: contractName,
        fileName: contractFile.name,
        url: "", // Empty URL for simulation
      };
    } else if (editingStaff?.employmentContract || editingStaff?.contract) {
      // Keep existing contract
      staffData.employmentContract =
        editingStaff.employmentContract || editingStaff.contract;
    }

    onSave(staffData);
    onClose();
  };

  const getFileName = (doc) => {
    if (!doc) return null;
    if (typeof doc === "object" && doc.name) return doc.name;
    return "Document uploaded";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-800 break-words">
            {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={staff.fullName || staff.name}
              onChange={(e) =>
                setStaff({
                  ...staff,
                  fullName: e.target.value,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter staff name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Age *
            </label>
            <input
              type="number"
              value={staff.age}
              onChange={(e) => setStaff({ ...staff, age: e.target.value })}
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter age"
              min="18"
              max="100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-1">
              Job Description *
            </label>
            <textarea
              value={staff.jobDescription || staff.jobTitle}
              onChange={(e) =>
                setStaff({
                  ...staff,
                  jobDescription: e.target.value,
                  jobTitle: e.target.value,
                })
              }
              rows="2"
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter job description"
            />
          </div>

          {/* ID Card Upload - FIXED */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Staff ID Card {!editingStaff?.idCard && "*"}
            </label>
            <div className="border-2 border-dashed border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {staff.idCard ? "Current ID Card:" : "Upload ID Card:"}
                </span>
                {staff.idCard && (
                  <button
                    type="button"
                    onClick={() => {
                      // Simulate download/view
                      alert(`Viewing: ${getFileName(staff.idCard)}`);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Current
                  </button>
                )}
              </div>

              {staff.idCard && !idCardFile && (
                <div className="mb-3 p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {getFileName(staff.idCard)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingStaff?.idCard
                      ? "Existing file"
                      : "Currently selected"}{" "}
                    • Upload a new file to replace
                  </p>
                </div>
              )}

              <div className="mb-2">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("idCard", e.target.files[0])
                  }
                  className="w-full"
                  accept=".pdf,.jpg,.jpeg,.png"
                  id="idCardInput"
                />
              </div>

              {idCardFile && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-800">
                    New file selected:
                  </p>
                  <p className="text-sm text-gray-700">{idCardFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be saved as:{" "}
                    <span className="font-medium">
                      {idCardFile.name.replace(/\.[^/.]+$/, "")}
                    </span>
                  </p>
                </div>
              )}

              {/* Clear button for new file */}
              {idCardFile && (
                <button
                  type="button"
                  onClick={() => {
                    setIdCardFile(null);
                    if (editingStaff?.idCard) {
                      setStaff({ ...staff, idCard: editingStaff.idCard });
                    } else {
                      setStaff({ ...staff, idCard: null });
                    }
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Remove new file selection
                </button>
              )}
            </div>
          </div>

          {/* Employment Contract Upload - FIXED */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Employment Contract {!editingStaff?.employmentContract && "*"}
            </label>
            <div className="border-2 border-dashed border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {staff.employmentContract
                    ? "Current Contract:"
                    : "Upload Contract:"}
                </span>
                {staff.employmentContract && (
                  <button
                    type="button"
                    onClick={() => {
                      // Simulate download/view
                      alert(
                        `Viewing: ${getFileName(staff.employmentContract)}`,
                      );
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Current
                  </button>
                )}
              </div>

              {staff.employmentContract && !contractFile && (
                <div className="mb-3 p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {getFileName(staff.employmentContract)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingStaff?.employmentContract || editingStaff?.contract
                      ? "Existing file"
                      : "Currently selected"}{" "}
                    • Upload a new file to replace
                  </p>
                </div>
              )}

              <div className="mb-2">
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("employmentContract", e.target.files[0])
                  }
                  className="w-full"
                  accept=".pdf,.doc,.docx"
                  id="contractInput"
                />
              </div>

              {contractFile && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-800">
                    New file selected:
                  </p>
                  <p className="text-sm text-gray-700">{contractFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be saved as:{" "}
                    <span className="font-medium">
                      {contractFile.name.replace(/\.[^/.]+$/, "")}
                    </span>
                  </p>
                </div>
              )}

              {/* Clear button for new file */}
              {contractFile && (
                <button
                  type="button"
                  onClick={() => {
                    setContractFile(null);
                    if (
                      editingStaff?.employmentContract ||
                      editingStaff?.contract
                    ) {
                      setStaff({
                        ...staff,
                        employmentContract:
                          editingStaff.employmentContract ||
                          editingStaff.contract,
                      });
                    } else {
                      setStaff({ ...staff, employmentContract: null });
                    }
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Remove new file selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                How file names work:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>
                  File name is automatically extracted from the uploaded file
                </li>
                <li>Example: "tega.pdf" → Saved as "tega"</li>
                <li>When replacing: New file name replaces old file name</li>
                <li>File names are stored in the database for reference</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!staff.fullName || !staff.age || !staff.jobDescription}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingStaff ? "Update Staff" : "Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated Facility/Location Component with Media Capture
const FacilityLocation = ({
  facility,
  type,
  onAddStaff,
  onEditFacility,
  onDeleteFacility,
  onEditStaff,
  onDeleteStaff,
  onSaveMedia,
  facilities,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [viewingMedia, setViewingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Handle saving media
  const handleSaveMedia = (mediaData) => {
    onSaveMedia(facility.id, mediaData);
  };

  // In FacilityLocation component:
  const handleEditStaff = (staffId) => {
    // Find the staff member to edit
    const staffToEdit = facility.staff.find((staff) => staff.id === staffId);
    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setShowAddStaff(true);
    }
  };

  // In FacilityLocation component, simpler approach:
  const handleSaveStaff = (staffData) => {
    if (editingStaff) {
      // Call parent handler for editing - make sure onEditStaff is passed as prop
      onEditStaff(facility.id, staffData);
    } else {
      // Call parent handler for adding
      onAddStaff(facility.id, staffData);
    }

    setShowAddStaff(false);
    setEditingStaff(null);
    toast.success(editingStaff ? "Staff updated!" : "Staff added!");
  };

  // Get media count
  const mediaCount = facility.media
    ? facility.media.reduce(
        (total, mediaItem) => total + (mediaItem.totalItems || 0),
        0,
      )
    : 0;

  return (
    <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-green-800 break-words">
            {facility.name}
          </h4>
          <p className="text-sm text-gray-600 break-words mt-1">
            {facility.address}
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-green-600 hover:text-green-800 text-sm whitespace-nowrap px-2 py-1"
          >
            {expanded ? "Hide" : "Show"} Details
          </button>
          <button
            onClick={() => onEditFacility(facility.id)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit Facility"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteFacility(facility.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Facility"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
          {type} • {facility.staff?.length || 0} staff • {mediaCount} media
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMediaCapture(true)}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap px-2 py-1"
          >
            <Camera className="w-4 h-4" />
            Capture Media
          </button>
          <button
            onClick={() => setShowAddStaff(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap px-2 py-1"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-green-200">
          {/* Media Gallery Preview */}
          {facility.media && facility.media.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-green-700">Facility Media</h5>
                <button
                  onClick={() => setViewingMedia(true)}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {facility.media.slice(0, 3).map((mediaItem, idx) => (
                  <div key={mediaItem.id || idx} className="space-y-1">
                    {mediaItem.images?.slice(0, 1).map((img, imgIdx) => (
                      <div key={imgIdx} className="relative">
                        <img
                          src={img.src}
                          alt={`Facility media ${idx}`}
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] p-1">
                          <div className="flex items-center gap-1">
                            <Camera className="w-2 h-2" />
                            <span>Photo</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {mediaItem.videos?.slice(0, 1).map((vid, vidIdx) => (
                      <div key={vidIdx} className="relative">
                        <div className="w-full h-20 bg-gray-800 rounded border border-gray-200 flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] p-1">
                          <div className="flex items-center gap-1">
                            <Video className="w-2 h-2" />
                            <span>Video</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff List */}
          {facility.staff && facility.staff.length > 0 && (
            <div className="mb-3">
              <h5 className="font-semibold text-green-700 mb-2">
                Staff Members
              </h5>
              {facility.staff.map((staff) => (
                <StaffMember
                  key={staff.id}
                  staff={staff}
                  onEdit={handleEditStaff} // This should pass staffId, not facilityId and staffData
                  onDelete={(staffId) => onDeleteStaff(facility.id, staffId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media Capture Modal */}
      <GPSMediaCaptureModal
        isOpen={showMediaCapture}
        onClose={() => setShowMediaCapture(false)}
        facility={facility}
        onSaveMedia={handleSaveMedia}
      />

      {/* Add Staff Modal */}
      {showAddStaff && (
        <AddStaffModal
          isOpen={showAddStaff}
          onClose={() => {
            setShowAddStaff(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          editingStaff={editingStaff}
        />
      )}

      {/* Media Gallery Modal */}
      {viewingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-green-800 break-words">
                  Media Gallery - {facility.name}
                </h3>
                <p className="text-gray-600 mt-1 break-words">
                  {type} • {mediaCount} photos & videos
                </p>
              </div>
              <button
                onClick={() => setViewingMedia(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!facility.media || facility.media.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No media captured yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click "Capture Media" to add photos or videos
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facility.media.map((mediaItem, idx) => (
                    <div key={mediaItem.id || idx} className="space-y-2">
                      <div className="text-sm text-gray-500">
                        {new Date(mediaItem.timestamp).toLocaleString()}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {mediaItem.images?.slice(0, 2).map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative cursor-pointer"
                            onClick={() =>
                              setSelectedMedia({ type: "image", data: img })
                            }
                          >
                            <img
                              src={img.src}
                              alt={`Facility image ${imgIdx}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                              PHOTO
                            </div>
                          </div>
                        ))}
                        {mediaItem.videos?.slice(0, 2).map((vid, vidIdx) => (
                          <div
                            key={vidIdx}
                            className="relative cursor-pointer"
                            onClick={() =>
                              setSelectedMedia({ type: "video", data: vid })
                            }
                          >
                            <div className="w-full h-32 bg-gray-800 rounded-lg border border-gray-200 flex items-center justify-center">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">
                              VIDEO
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-green-800 break-words">
                  {selectedMedia.type === "image"
                    ? "Photo Details"
                    : "Video Details"}
                </h3>
                <p className="text-gray-600 mt-1 break-words">
                  {facility.name} •{" "}
                  {new Date(selectedMedia.data.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {selectedMedia.type === "image" ? (
                    <img
                      src={selectedMedia.data.src}
                      alt="Expanded view"
                      className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                    />
                  ) : (
                    <video
                      src={selectedMedia.data.url}
                      controls
                      className="w-full h-auto max-h-[400px] rounded-lg bg-black"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      Facility Information
                    </h4>
                    <p className="text-gray-800 font-medium">{facility.name}</p>
                    <p className="text-sm text-gray-600">{facility.address}</p>
                    <p className="text-sm text-gray-600 mt-1">{type}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      Media Details
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-600">Type:</span>{" "}
                        <span className="font-medium">
                          {selectedMedia.type === "image" ? "Photo" : "Video"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Captured:</span>{" "}
                        {new Date(
                          selectedMedia.data.timestamp,
                        ).toLocaleString()}
                      </p>
                      {selectedMedia.type === "video" &&
                        selectedMedia.data.duration && (
                          <p className="text-sm">
                            <span className="text-gray-600">Duration:</span>{" "}
                            {formatTime(selectedMedia.data.duration)}
                          </p>
                        )}
                      {selectedMedia.data.tags &&
                        selectedMedia.data.tags.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedMedia.data.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">
                      Location Data
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {selectedMedia.data.address || "No address data"}
                        </span>
                      </p>
                      {selectedMedia.data.location && (
                        <p className="text-sm">
                          <span className="text-gray-600">Coordinates:</span>{" "}
                          {selectedMedia.data.location.lat},{" "}
                          {selectedMedia.data.location.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section 1: Company Information Form (Now Editable) - Updated flag display
const Section1 = ({ companyData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    country: "",
    countryCode: "us",
    address: "",
    registrationNumber: "",
    taxId: "",
    exportLicense: "",
    licenseNumber: "",
  });

  const { countries, loading } = useCountries();

  useEffect(() => {
    if (companyData?.basicInfo) {
      setCompanyInfo({
        companyName: companyData.basicInfo.companyName || "",
        country: companyData.basicInfo.country || "",
        countryCode: getCountryCode(companyData.basicInfo.country) || "us",
        address: getCorporateOfficeAddress() || "",
        registrationNumber: companyData.basicInfo.rcNumber || "",
        taxId: companyData.basicInfo.tinNumber || "",
        exportLicense: companyData.basicInfo.licenseNumber || "",
        licenseNumber: companyData.basicInfo.licenseNumber || "",
      });
    }
  }, [companyData]);

  // Get corporate office address from facilities
  const getCorporateOfficeAddress = () => {
    if (!companyData?.facilities) return "";

    const corporateFacilities = companyData.facilities.filter(
      (facility) =>
        facility.type === "Corporate facility" || facility.type === "corporate",
    );

    if (corporateFacilities.length > 0) {
      return corporateFacilities[0].address || "";
    }

    return "";
  };

  // Helper function to get country code
  const getCountryCode = (countryName) => {
    if (!countryName) return "us";

    const countryCodeMap = {
      "United States": "us",
      Canada: "ca",
      "United Kingdom": "gb",
      Germany: "de",
      France: "fr",
      Brazil: "br",
      Australia: "au",
      Japan: "jp",
      China: "cn",
      India: "in",
      // Add more as needed
    };
    return countryCodeMap[countryName] || "us";
  };

  const handleSave = () => {
    // Update company data in store
    const updatedCompanyData = {
      ...companyData,
      basicInfo: {
        ...companyData.basicInfo,
        companyName: companyInfo.companyName,
        country: companyInfo.country,
        rcNumber: companyInfo.registrationNumber,
        tinNumber: companyInfo.taxId,
        licenseNumber: companyInfo.licenseNumber,
      },
    };

    onUpdate(updatedCompanyData);
    setIsEditing(false);
    toast.success("Company information updated successfully!", {
      toastId: "company-info-update",
    });
  };

  const handleChange = (field, value) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Handle country selection
  const handleCountrySelect = (e) => {
    const selectedCountry = countries.find((c) => c.name === e.target.value);
    if (selectedCountry) {
      setCompanyInfo((prev) => ({
        ...prev,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
      }));
    }
  };

  // Get license label based on role
  const getLicenseLabel = () => {
    if (!companyData) return "License";

    if (companyData.role === "exporter") {
      return "Export License";
    } else if (companyData.role === "importer") {
      return "Import License";
    }
    return "License";
  };

  if (!companyData) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
        <div className="text-center py-8">
          <p className="text-gray-600">No company data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <Building className="w-5 h-5" />
          1. Company Information
        </h2>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
        >
          {isEditing ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Information
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">
                {companyInfo.companyName}
              </p>
            </div>
          )}
        </div>

        {/* Country of Operation */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Country of Operation
          </label>
          {isEditing ? (
            loading ? (
              <div className="w-full px-4 py-3 border border-green-300 rounded-lg bg-gray-50">
                <p className="text-gray-500">Loading countries...</p>
              </div>
            ) : (
              <select
                value={companyInfo.country}
                onChange={handleCountrySelect}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2 break-words">
              <img
                src={`https://flagcdn.com/w20/${companyInfo.countryCode}.png`}
                alt={`${companyInfo.country} flag`}
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <p className="text-gray-800 font-medium">{companyInfo.country}</p>
            </div>
          )}
        </div>

        {/* Corporate Office Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Corporate Office Address
          </label>
          {isEditing ? (
            <textarea
              value={companyInfo.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 whitespace-pre-line">
                {companyInfo.address}
              </p>
            </div>
          )}
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Registration Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.registrationNumber}
              onChange={(e) =>
                handleChange("registrationNumber", e.target.value)
              }
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">
                {companyInfo.registrationNumber}
              </p>
            </div>
          )}
        </div>

        {/* Tax ID Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Tax ID Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">{companyInfo.taxId}</p>
            </div>
          )}
        </div>

        {/* Export/Import Certificate Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            {getLicenseLabel()}
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">
                {companyInfo.licenseNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

// Document Upload Component (Updated with "Others" category)
const DocumentUpload = ({ title, documents, onAdd, onRemove, type }) => {
  const [showModal, setShowModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (docName && file) {
      // Simulate the upload flow - just update the UI without actual URL
      const newDoc = {
        id: Date.now(),
        name: docName,
        fileName: file.name,
        type: type,
        date: new Date().toLocaleDateString(),
        size: file.size,
        // Add empty URL for simulation
        url: "",
      };

      onAdd(newDoc);
      setDocName("");
      setFile(null);
      setShowModal(false);

      // Show success with simulation message
      toast.success(
        <div>
          <div>✅ {docName} uploaded successfully!</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            (Simulation: In production, file would be uploaded to storage)
          </div>
        </div>,
      );
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "registration":
        return "text-blue-600";
      case "license&permits":
        return "text-green-600";
      case "others":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <h3 className="font-semibold text-green-700 break-words">{title}</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Uploaded Documents Display */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Document" to upload
            </p>
          </div>
        ) : (
          documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-3 md:px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText
                  className={`w-5 h-5 ${getIconColor()} flex-shrink-0`}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-800 break-words block">
                    {doc.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mt-1">
                    <span className="truncate max-w-[150px] sm:max-w-none">
                      {doc.fileName}
                    </span>
                    <span>•</span>
                    <span>{doc.date}</span>
                    {doc.size && (
                      <>
                        <span>•</span>
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(doc.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">
                Upload {title}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Business License 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-green-200 rounded-lg p-4 md:p-6 text-center hover:border-green-300 transition-colors">
                  <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id={`file-${type}`}
                  />
                  <label
                    htmlFor={`file-${type}`}
                    className="cursor-pointer block"
                  >
                    <span className="text-green-600 font-medium">
                      Click to upload
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, JPG, PNG, DOC up to 10MB
                    </p>
                  </label>
                  {file && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800 truncate">
                          {file.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!docName || !file}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section 2: Document Upload (Updated with "Others" category)
const Section2 = ({ documents, onUpdate }) => {
  const registrationDocs = documents?.registration || [];
  const licenseDocs = documents?.licensesPermits || [];
  const otherDocs = documents?.others || [];

  const handleAdd = (doc, type) => {
    const updatedDocuments = { ...documents };

    if (!updatedDocuments[type]) {
      updatedDocuments[type] = [];
    }

    updatedDocuments[type] = [...updatedDocuments[type], doc];
    onUpdate(updatedDocuments);
  };

  const handleRemove = (id, type) => {
    const updatedDocuments = { ...documents };

    if (updatedDocuments[type]) {
      updatedDocuments[type] = updatedDocuments[type].filter(
        (d) => d.id !== id,
      );
      onUpdate(updatedDocuments);
      toast.info("Document removed");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        2. Document Upload
      </h2>

      <div className="space-y-6">
        <DocumentUpload
          title="Registration Documents"
          documents={registrationDocs}
          onAdd={(doc) => handleAdd(doc, "registration")}
          onRemove={(id) => handleRemove(id, "registration")}
          type="registration"
        />

        <DocumentUpload
          title="Licenses & Permits"
          documents={licenseDocs}
          onAdd={(doc) => handleAdd(doc, "licensesPermits")}
          onRemove={(id) => handleRemove(id, "licensesPermits")}
          type="license&permits"
        />

        <DocumentUpload
          title="Other Relevant Documents"
          documents={otherDocs}
          onAdd={(doc) => handleAdd(doc, "others")}
          onRemove={(id) => handleRemove(id, "others")}
          type="others"
        />
      </div>
    </div>
  );
};

// Contact Person Card Component
const ContactPersonCard = ({ contact, onView, onEdit, onDelete }) => {
  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50 hover:bg-green-50 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-green-800 break-words">
              {contact.fullName || contact.name}
            </h4>
            <p className="text-sm text-gray-600 break-words mt-1">
              {contact.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                {contact.idCards?.length || 0} ID card(s)
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Added: {contact.addedDate || "Recent"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={() => onView(contact.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(contact.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Contact"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ID Card Upload Modal Component
const IdCardUploadModal = ({ isOpen, onClose, onUpload, contactName }) => {
  const [idCards, setIdCards] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (field, file) => {
    if (!file) return;

    // Extract the filename without extension
    const fileName = file.name;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    const displayName = nameWithoutExt || fileName;

    // Create the document object with the extracted filename
    const documentObj = {
      name: displayName,
      fileName: fileName,
      file: file,
      date: new Date().toLocaleDateString(),
      size: file.size,
      url: "", // Empty URL for simulation
    };

    if (field === "idCard") {
      setIdCardFile(file);
      setStaff({ ...staff, idCard: documentObj });
    } else if (field === "employmentContract") {
      setContractFile(file);
      setStaff({ ...staff, employmentContract: documentObj });
    }
  };

  const handleRemoveIdCard = (id) => {
    setIdCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleNameChange = (id, name) => {
    setIdCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, name } : card)),
    );
  };

  const handleSubmit = () => {
    // Prepare final staff data
    const staffData = {
      id: editingStaff ? editingStaff.id : Date.now(),
      name: staff.name || staff.fullName,
      fullName: staff.fullName || staff.name,
      age: staff.age,
      jobTitle: staff.jobTitle || staff.jobDescription,
      jobDescription: staff.jobDescription || staff.jobTitle,
    };

    // Handle ID Card - Use new file OR existing
    if (staff.idCard) {
      // Keep the entire document object
      staffData.idCard = staff.idCard;
    }

    // Handle Employment Contract - Use new file OR existing
    if (staff.employmentContract) {
      // Keep the entire document object
      staffData.employmentContract = staff.employmentContract;
    }

    onSave(staffData);
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-green-800 break-words">
              Upload ID Cards
            </h3>
            <p className="text-gray-600 mt-1 break-words">
              Add ID cards for {contactName}
            </p>
            <p className="text-sm text-gray-500 mt-1 break-words">
              Upload multiple ID cards and specify the type/name for each (e.g.,
              "National ID", "Passport", "Driver's License")
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Upload ID Card Files *
              </label>
              <div className="border-2 border-dashed border-green-200 rounded-lg p-4 md:p-6 text-center hover:border-green-300 transition-colors">
                <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="idCardFileUpload"
                />
                <label
                  htmlFor="idCardFileUpload"
                  className="cursor-pointer block"
                >
                  <span className="text-green-600 font-medium">
                    Click to upload
                  </span>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, JPG, PNG, DOC up to 10MB each
                  </p>
                </label>
              </div>
            </div>

            {/* Uploaded ID Cards List */}
            {idCards.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-3">
                  ID Cards to Upload ({idCards.length})
                </h4>
                <div className="space-y-3">
                  {idCards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-green-200 rounded-lg p-4 bg-green-50/50"
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-green-700 mb-1">
                              ID Card Name/Type *
                            </label>
                            <input
                              type="text"
                              value={card.name}
                              onChange={(e) =>
                                handleNameChange(card.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g., National ID, Passport, Driver's License"
                            />
                            <p className="text-xs text-gray-500 mt-1 break-words">
                              Specify the type of ID for easy identification
                            </p>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 break-words">
                                {card.fileName}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mt-1">
                                <span>
                                  {(card.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <span>•</span>
                                <span>Added: {card.date}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveIdCard(card.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                              title="Remove this ID card"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-blue-800 font-medium break-words">
                    Examples of ID Card Names:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      "National ID Card",
                      "Passport",
                      "Driver's License",
                      "Work Permit",
                      "Residence Card",
                      "Company ID",
                    ].map((example, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || idCards.length === 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {idCards.length} ID Card
                  {idCards.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Person Modal Component
const ContactPersonModal = ({ isOpen, onClose, onSave, contact = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [idCards, setIdCards] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  // Initialize form with contact data if editing
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.fullName || contact.name || "",
        phone: contact.telephone || contact.phone || "",
        address: contact.address || "",
        email: contact.email || "",
      });
      setIdCards(contact.idCards || []);
    } else {
      setFormData({
        name: "",
        phone: "",
        address: "",
        email: "",
      });
      setIdCards([]);
    }
  }, [contact, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIdCardUpload = (uploadedCards) => {
    setIdCards((prev) => [...prev, ...uploadedCards]);
    toast.success(`${uploadedCards.length} ID card(s) added successfully!`);
  };

  const handleRemoveIdCard = (id) => {
    setIdCards((prev) => prev.filter((card) => card.id !== id));
    toast.info("ID card removed");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const contactData = {
      id: contact ? contact.id : Date.now(),
      fullName: formData.name,
      telephone: formData.phone,
      address: formData.address,
      email: formData.email,
      idCards,
      addedDate: contact ? contact.addedDate : new Date().toLocaleDateString(),
    };

    onSave(contactData);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-green-800 break-words">
              {contact ? "Edit Contact Person" : "Add Contact Person"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6">
              {/* Contact Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Telephone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows="2"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter contact address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* ID Cards Upload Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-green-700 break-words">
                      ID Cards
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 break-words">
                      Upload identification documents and specify their
                      type/name for easy reference
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIdCardModal(true)}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 cursor-pointer bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add ID Cards
                  </button>
                </div>

                {/* Uploaded ID Cards */}
                <div className="space-y-2">
                  {idCards.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No ID cards uploaded yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click "Add ID Cards" to upload
                      </p>
                    </div>
                  ) : (
                    idCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between bg-green-50 px-3 md:px-4 py-3 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                              <p className="font-medium text-green-800 break-words">
                                {card.name}
                              </p>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                                {(card.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                              <span className="truncate max-w-[150px] sm:max-w-none">
                                {card.fileName}
                              </span>
                              <span>•</span>
                              <span>Uploaded: {card.date}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveIdCard(card.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                          title="Remove this ID card"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isUploading ||
                  !formData.name ||
                  !formData.email ||
                  !formData.phone
                }
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {contact ? "Update Contact" : "Save Contact"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Upload Modal */}
      <IdCardUploadModal
        isOpen={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        onUpload={handleIdCardUpload}
        contactName={formData.name || "this contact"}
      />
    </>
  );
};

// Section 3: Contact Persons
const Section3 = ({ contacts, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);

  const handleSaveContact = (contactData) => {
    const updatedContacts = [...(contacts || [])];

    if (editingContact) {
      // Update existing contact
      const index = updatedContacts.findIndex(
        (contact) => contact.id === contactData.id,
      );
      if (index !== -1) {
        updatedContacts[index] = contactData;
      }
      toast.success("Contact updated successfully!");
    } else {
      // Add new contact
      updatedContacts.push(contactData);
      toast.success("Contact added successfully!");
    }

    onUpdate(updatedContacts);
    setEditingContact(null);
  };

  const handleEditContact = (contactId) => {
    const contact = (contacts || []).find((c) => c.id === contactId);
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDeleteContact = (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const updatedContacts = (contacts || []).filter(
        (contact) => contact.id !== contactId,
      );
      onUpdate(updatedContacts);
      toast.success("Contact deleted successfully!");
    }
  };

  const handleViewContact = (contactId) => {
    const contact = (contacts || []).find((c) => c.id === contactId);
    setViewingContact(contact);
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        3. Contact Persons
      </h2>

      {/* Add Contact Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Contact Person
        </button>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {!contacts || contacts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Contact Persons Added
            </h3>
            <p className="text-gray-500">
              Click "Add Contact Person" to create your first contact
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactPersonCard
              key={contact.id}
              contact={contact}
              onView={handleViewContact}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          ))
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      <ContactPersonModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
      />

      {/* View Contact Details Modal */}
      {viewingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-green-800 break-words">
                    {viewingContact.fullName || viewingContact.name}
                  </h3>
                  <p className="text-green-700 break-words mt-1">
                    {viewingContact.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingContact(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-6">
                {/* Contact Details */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">
                    Contact Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-800 break-words">
                        {viewingContact.telephone || viewingContact.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Address
                      </label>
                      <p className="text-gray-800 whitespace-pre-line break-words">
                        {viewingContact.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Added On
                      </label>
                      <p className="text-gray-800">
                        {viewingContact.addedDate || "Recent"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Cards */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">
                    ID Cards ({viewingContact.idCards?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(viewingContact.idCards || []).map((card, index) => (
                      <div
                        key={card.id || index}
                        className="flex items-center justify-between bg-gray-50 px-3 md:px-4 py-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 break-words">
                              {card.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mt-1">
                              <span className="truncate max-w-[150px] sm:max-w-none">
                                {card.fileName}
                              </span>
                              <span>•</span>
                              <span>{card.date}</span>
                              {card.size && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {(card.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Simulate download
                            alert(`Downloading ${card.name}`);
                          }}
                          className="text-green-600 hover:text-green-800 flex-shrink-0 ml-2"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingContact(null)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section 4: Facilities & Staff
const Section4 = ({ facilities, onUpdate }) => {
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [selectedType, setSelectedType] = useState("corporate");
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({ name: "", address: "" });

  const handleAddFacility = () => {
    if (facilityForm.name && facilityForm.address) {
      const newFacility = {
        id: Date.now(),
        type: selectedType,
        name: facilityForm.name,
        address: facilityForm.address,
        staff: [],
        media: [],
      };

      const updatedFacilities = [...(facilities || []), newFacility];
      onUpdate(updatedFacilities);
      setFacilityForm({ name: "", address: "" });
      setShowAddFacility(false);
    }
  };

  const handleEditFacility = (facilityId, updates) => {
    const updatedFacilities = (facilities || []).map((facility) =>
      facility.id === facilityId ? { ...facility, ...updates } : facility,
    );
    onUpdate(updatedFacilities);
  };

  const handleDeleteFacility = (facilityId) => {
    const updatedFacilities = (facilities || []).filter(
      (facility) => facility.id !== facilityId,
    );
    onUpdate(updatedFacilities);
  };

  const handleAddStaff = (facilityId, staffData) => {
    const updatedFacilities = (facilities || []).map((facility) =>
      facility.id === facilityId
        ? {
            ...facility,
            staff: [
              ...(facility.staff || []),
              { ...staffData, id: Date.now() },
            ],
          }
        : facility,
    );
    onUpdate(updatedFacilities);
  };

  // Add this function in Section4 component:
  const handleEditStaff = (facilityId, staffData) => {
    const updatedFacilities = (facilities || []).map((facility) =>
      facility.id === facilityId
        ? {
            ...facility,
            staff: (facility.staff || []).map((staff) =>
              staff.id === staffData.id ? staffData : staff,
            ),
          }
        : facility,
    );
    onUpdate(updatedFacilities);
    toast.success("Staff updated successfully!");
  };

  const handleDeleteStaff = (facilityId, staffId) => {
    const updatedFacilities = (facilities || []).map((facility) =>
      facility.id === facilityId
        ? {
            ...facility,
            staff: (facility.staff || []).filter(
              (staff) => staff.id !== staffId,
            ),
          }
        : facility,
    );
    onUpdate(updatedFacilities);
  };

  const handleSaveMedia = (facilityId, mediaData) => {
    const updatedFacilities = (facilities || []).map((facility) =>
      facility.id === facilityId
        ? {
            ...facility,
            media: [...(facility.media || []), mediaData],
          }
        : facility,
    );
    onUpdate(updatedFacilities);
  };

  const corporateFacilities = (facilities || []).filter(
    (f) => f.type === "Corporate facility" || f.type === "corporate",
  );
  const productionSites = (facilities || []).filter(
    (f) => f.type === "production/forest site" || f.type === "production",
  );
  const processingSites = (facilities || []).filter(
    (f) => f.type === "Processing/Loading Site" || f.type === "processing",
  );

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        4. Facilities & Staff
      </h2>

      {/* Add Facility Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingFacility(null);
            setFacilityForm({ name: "", address: "" });
            setShowAddFacility(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Facility
        </button>
      </div>

      {/* Facility Lists */}
      <div className="space-y-6">
        {/* Corporate Facilities */}
        {corporateFacilities.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Corporate Facilities ({corporateFacilities.length})
            </h3>
            {corporateFacilities.map((facility) => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Corporate Facility"
                onAddStaff={(staffData) =>
                  handleAddStaff(facility.id, staffData)
                }
                onEditFacility={(id, updates) =>
                  handleEditFacility(id, updates)
                }
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
                onSaveMedia={handleSaveMedia}
                facilities={facilities} // Add this line
              />
            ))}
          </div>
        )}

        {/* Production Sites */}
        {productionSites.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3">
              Production/Forest Sites ({productionSites.length})
            </h3>
            {productionSites.map((facility) => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Production/Forest Site"
                onAddStaff={handleAddStaff}
                onEditFacility={(id, updates) =>
                  handleEditFacility(id, updates)
                }
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
                onSaveMedia={handleSaveMedia}
              />
            ))}
          </div>
        )}

        {/* Processing Sites */}
        {processingSites.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3">
              Processing/Loading Sites ({processingSites.length})
            </h3>
            {processingSites.map((facility) => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Processing/Loading Site"
                onAddStaff={handleAddStaff}
                onEditFacility={(id, updates) =>
                  handleEditFacility(id, updates)
                }
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
                onSaveMedia={handleSaveMedia}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Facility Modal */}
      {showAddFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">
                {editingFacility ? "Edit Facility" : "Add New Facility"}
              </h3>
              <button onClick={() => setShowAddFacility(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Type *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                >
                  <option value="corporate">Corporate Facility</option>
                  <option value="production">Production/Forest Site</option>
                  <option value="processing">Processing/Loading Site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityForm.name}
                  onChange={(e) =>
                    setFacilityForm({ ...facilityForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Address *
                </label>
                <textarea
                  value={facilityForm.address}
                  onChange={(e) =>
                    setFacilityForm({
                      ...facilityForm,
                      address: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                  placeholder="Enter full address"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowAddFacility(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    editingFacility
                      ? () => {
                          handleEditFacility(editingFacility.id, {
                            ...facilityForm,
                            type: selectedType,
                          });
                          setShowAddFacility(false);
                        }
                      : handleAddFacility
                  }
                  disabled={!facilityForm.name || !facilityForm.address}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingFacility ? "Update" : "Add"} Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Country Group Component
const CountryGroup = ({
  country,
  countryCode,
  companies,
  onAddCompanyToCountry,
  onViewCompany,
  onRemoveCompany,
  onSendInvitation,
  currentUserRole,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div
        className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={`https://flagcdn.com/w20/${countryCode}.png`}
            alt={`${country} flag`}
            className="w-5 h-5 rounded flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-800 break-words">{country}</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                {
                  companies.filter(
                    (c) => c.verifications && c.verifications.length > 0,
                  ).length
                }{" "}
                Verified
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Shield className="w-3 h-3 text-blue-600 flex-shrink-0" />
                {companies.filter((c) => c.isRegistered).length} Registered
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <ShieldAlert className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                {companies.filter((c) => !c.isRegistered).length} Not on Portal
              </span>
              <span className="whitespace-nowrap">
                Total: {companies.length}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddCompanyToCountry(country, countryCode);
            }}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white">
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                  company.verifications && company.verifications.length > 0
                    ? "border-green-200 bg-green-50/50"
                    : company.isRegistered
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-yellow-200 bg-yellow-50/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <h5 className="font-medium text-gray-800 break-words">
                        {company.name}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {company.verifications &&
                          company.verifications.length > 0 && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                              Verified ({company.verifications.length})
                            </div>
                          )}
                        {company.isRegistered && (
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            Registered on Portal
                          </div>
                        )}
                        {!company.isRegistered && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            Not on Portal
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1 break-words">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        {company.registrationNumber || "Not provided"}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <User className="w-3 h-3 flex-shrink-0" />
                        Added: {company.addedDate}
                      </span>
                    </div>

                    {/* Display verification badges */}
                    {company.verifications &&
                      company.verifications.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {company.verifications.map((verification, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs min-w-0"
                              >
                                <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                                <span className="text-green-700 break-words">
                                  Verified by {verification.verifier}
                                </span>
                                <span className="text-green-600 text-xs whitespace-nowrap">
                                  ({verification.date})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {!company.isRegistered && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-sm text-yellow-800 font-medium break-words">
                              This company is not on the system
                            </span>
                          </div>
                          <button
                            onClick={() => onSendInvitation(company)}
                            className="flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-900 whitespace-nowrap flex-shrink-0 mt-2 sm:mt-0"
                          >
                            <Mail className="w-4 h-4" />
                            Send Invitation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4 mt-3 sm:mt-0">
                    {company.isRegistered ||
                    company.verifications?.length > 0 ? (
                      <button
                        onClick={() => onViewCompany(company)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    ) : null}
                    <button
                      onClick={() => onRemoveCompany(company.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Remove Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Invitation Modal Component
const InvitationModal = ({ isOpen, onClose, company, onSendInvitation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (company) {
      setEmail(company.email || "");
      setMessage(`Dear ${company.name},

We noticed that you are not yet registered on our Timber Export Platform. We invite you to join our network of verified timber exporters and importers.

Benefits of registering:
• Access to verified business partners
• Streamlined document management
• Enhanced credibility through verification
• Direct communication channels

Click the link below to register:
https://timber-export-platform.com/register

Best regards,
The Timber Export Platform Team`);
    }
  }, [company]);

  const handleSend = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSending(true);
    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onSendInvitation(company.id, email);
    setIsSending(false);
    onClose();
    toast.success(`Invitation sent to ${email}`);
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-green-800 break-words">
              Send Invitation
            </h3>
            <p className="text-gray-600 mt-1 break-words">
              Invite {company.name} to register on the platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Company Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter official company email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Invitation Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="8"
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-blue-800 font-medium break-words">
                    About Invitations:
                  </p>
                  <ul className="text-blue-700 mt-1 space-y-1 list-disc list-inside">
                    <li className="break-words">
                      The company will receive an email with registration
                      instructions
                    </li>
                    <li className="break-words">
                      Once registered, they'll appear as "Registered" in your
                      list
                    </li>
                    <li className="break-words">
                      They can later apply for third-party verification
                    </li>
                    <li className="break-words">
                      Verified companies show verification badges
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !email}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invitation Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 5: Linked Companies (Importers/Exporters) - UPDATED to fix demoData.filter error
const Section5 = ({ linkedCompanies, onUpdate, demoData, currentUserRole }) => {
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { countries, loading } = useCountries();

  // Helper function to get country code
  const getCountryCode = (countryName) => {
    if (!countryName) return "us";

    const countryCodeMap = {
      "United States": "us",
      Canada: "ca",
      "United Kingdom": "gb",
      Germany: "de",
      France: "fr",
      Brazil: "br",
      Australia: "au",
      Japan: "jp",
      China: "cn",
      India: "in",
      // Add more as needed
    };
    return countryCodeMap[countryName] || "us";
  };

  // Helper function to get verifiers for a company
  const getCompanyVerifications = (company) => {
    if (!company.linkedVerifiers || company.linkedVerifiers.length === 0)
      return [];

    const verifications = [];

    company.linkedVerifiers.forEach((linkedVerifier) => {
      const verifier = demoData.users[linkedVerifier.id];
      if (verifier && verifier.verificationReports) {
        // Check if this verifier has a verification report for this company with status true
        const verificationReport = verifier.verificationReports.find(
          (report) => report.companyId === company.id && report.status === true,
        );

        if (verificationReport) {
          verifications.push({
            verifier:
              verifier.basicInfo?.firstName +
                " " +
                verifier.basicInfo?.lastName || "Unknown Verifier",
            date: verificationReport.date || "Unknown Date",
            status: true,
          });
        }
      }
    });

    return verifications;
  };

  // Group linked companies by country
  const linkedCompaniesByCountry = (linkedCompanies || []).reduce(
    (acc, companyId) => {
      const company = demoData.users[companyId];
      if (!company) return acc;

      const country = company.basicInfo?.country || "Unknown";
      if (!acc[country]) {
        acc[country] = [];
      }

      const verifications = getCompanyVerifications(company);

      acc[country].push({
        id: company.id,
        name: company.basicInfo?.companyName || "Unknown Company",
        country: country,
        countryCode: getCountryCode(country),
        email: company.basicInfo?.email || "",
        registrationNumber: company.basicInfo?.rcNumber || "Not provided",
        isRegistered: company.isRegistered || false,
        verifications: verifications,
        addedDate: new Date().toLocaleDateString(),
      });

      return acc;
    },
    {},
  );

  // Get unique countries
  const linkedCountries = Object.keys(linkedCompaniesByCountry).sort();

  // Filtered countries based on search
  const filteredCountries = linkedCountries.filter((country) => {
    const companies = linkedCompaniesByCountry[country];
    const matchesSearch = companies.some(
      (company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.registrationNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

    if (selectedStatus === "all") return matchesSearch;
    if (selectedStatus === "verified")
      return (
        matchesSearch &&
        companies.some((company) => company.verifications?.length > 0)
      );
    if (selectedStatus === "registered")
      return matchesSearch && companies.some((company) => company.isRegistered);
    if (selectedStatus === "unregistered")
      return (
        matchesSearch && companies.some((company) => !company.isRegistered)
      );

    return matchesSearch;
  });

  const handleAddCompany = (companyId) => {
    if (!linkedCompanies.includes(companyId)) {
      const updatedLinkedCompanies = [...(linkedCompanies || []), companyId];
      onUpdate(updatedLinkedCompanies);
      toast.success("Company added successfully!");
    }
  };

  const handleRemoveCompany = (companyId) => {
    if (window.confirm("Are you sure you want to remove this company?")) {
      const updatedLinkedCompanies = (linkedCompanies || []).filter(
        (id) => id !== companyId,
      );
      onUpdate(updatedLinkedCompanies);
      toast.info("Company removed from list");
    }
  };

  const handleViewCompany = (company) => {
    if (company.isRegistered || company.verifications?.length > 0) {
      const companyDetails = demoData.users[company.id];
      if (companyDetails) {
        setViewingCompany({ ...companyDetails, ...company });
      }
    }
  };

  const handleSendInvitation = (company) => {
    setSelectedCompany(company);
    setShowInvitationModal(true);
  };

  // Get the correct label for the linked companies section
  const getLinkedCompaniesLabel = () => {
    if (currentUserRole === "exporter") {
      return "Importer/Consignee Companies";
    } else if (currentUserRole === "importer") {
      return "Exporter Companies";
    }
    return "Linked Companies";
  };

  // Get all companies from demoData that could be linked
  const getAllPotentialCompanies = () => {
    const users = demoData.users || {};
    return Object.values(users).filter(
      (user) =>
        (currentUserRole === "exporter" && user.role === "importer") ||
        (currentUserRole === "importer" && user.role === "exporter"),
    );
  };

  // Stats calculation
  const allCompanies = Object.values(linkedCompaniesByCountry).flat();
  const stats = {
    total: allCompanies.length,
    verified: allCompanies.filter((c) => c.verifications?.length > 0).length,
    registered: allCompanies.filter((c) => c.isRegistered).length,
    unregistered: allCompanies.filter((c) => !c.isRegistered).length,
    countries: linkedCountries.length,
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        5. {getLinkedCompaniesLabel()}
      </h2>

      <p className="text-gray-600 mb-6 break-words">
        Manage{" "}
        {currentUserRole === "exporter" ? "importer/consignee" : "exporter"}{" "}
        companies you work with. Companies are categorized by registration
        status and third-party verification.
      </p>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.countries}
              </p>
              <p className="text-sm text-gray-600">Countries</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">
                {stats.verified}
              </p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">
                {stats.registered}
              </p>
              <p className="text-sm text-gray-600">Registered on Portal</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-800">
                {stats.unregistered}
              </p>
              <p className="text-sm text-gray-600">Not on Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search companies by name or registration number..."
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="registered">Registered Only</option>
            <option value="unregistered">Not on Portal Only</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setShowAddCompany(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add{" "}
            {currentUserRole === "exporter" ? "Importer/Consignee" : "Exporter"}
          </button>
        </div>
      </div>

      {/* Country Groups */}
      <div className="space-y-4">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No companies found</p>
            <p className="text-sm text-gray-400 mt-2 break-words">
              {searchQuery
                ? "Try a different search term"
                : `Click "Add ${currentUserRole === "exporter" ? "Importer/Consignee" : "Exporter"}" to start`}
            </p>
          </div>
        ) : (
          filteredCountries.map((country) => (
            <CountryGroup
              key={country}
              country={country}
              countryCode={getCountryCode(country)}
              companies={linkedCompaniesByCountry[country]}
              onAddCompanyToCountry={() => setShowAddCompany(true)}
              onViewCompany={handleViewCompany}
              onRemoveCompany={handleRemoveCompany}
              onSendInvitation={handleSendInvitation}
              currentUserRole={currentUserRole}
            />
          ))
        )}
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">
                Add{" "}
                {currentUserRole === "exporter"
                  ? "Importer/Consignee"
                  : "Exporter"}{" "}
                Company
              </h3>
              <button onClick={() => setShowAddCompany(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Search Companies
                </label>
                <input
                  type="text"
                  placeholder={`Search for ${currentUserRole === "exporter" ? "importer" : "exporter"} companies by name or TraceRx ID`}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  id="companySearchInput"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {getAllPotentialCompanies()
                    .filter((company) => !linkedCompanies?.includes(company.id))
                    .filter(
                      (company) =>
                        company.basicInfo?.companyName
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        company.traceRxId
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    )
                    .map((company) => {
                      const verifications = getCompanyVerifications(company);

                      return (
                        <div
                          key={company.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-800 break-words">
                                {company.basicInfo?.companyName}
                              </h5>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3 flex-shrink-0" />
                                  {company.basicInfo?.country || "Unknown"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 flex-shrink-0" />
                                  {company.isRegistered
                                    ? "Registered on Portal"
                                    : "Not on Portal"}
                                </span>
                                {verifications.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    Verified ({verifications.length})
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 text-xs text-gray-500">
                                TraceRx ID: {company.traceRxId}
                              </div>

                              {/* Display verification badges */}
                              {verifications.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {verifications.map((verification, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs"
                                      >
                                        <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                                        <span className="text-green-700">
                                          Verified by {verification.verifier}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {company.isRegistered ||
                              verifications.length > 0 ? (
                                <button
                                  onClick={() => {
                                    const companyData = {
                                      id: company.id,
                                      name: company.basicInfo?.companyName,
                                      country:
                                        company.basicInfo?.country || "Unknown",
                                      countryCode: getCountryCode(
                                        company.basicInfo?.country || "",
                                      ),
                                      email: company.basicInfo?.email,
                                      registrationNumber:
                                        company.basicInfo?.rcNumber,
                                      isRegistered: company.isRegistered,
                                      verifications: verifications,
                                    };
                                    setViewingCompany({
                                      ...company,
                                      ...companyData,
                                    });
                                    setShowAddCompany(false);
                                  }}
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleAddCompany(company.id)}
                                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-800 font-medium break-words">
                      How it works:
                    </p>
                    <ul className="text-blue-700 mt-1 space-y-1 list-disc list-inside">
                      <li className="break-words">
                        Search for companies by name or TraceRx ID
                      </li>
                      <li className="break-words">
                        Registered companies show their registration status
                      </li>
                      <li className="break-words">
                        Verified companies show verification badges from
                        third-party verifiers
                      </li>
                      <li className="break-words">
                        You can invite companies not on the portal to join
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowAddCompany(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSendInvitation={(companyId, email) => {
          // Handle invitation sending
          toast.success(`Invitation sent to ${email}`);
          setShowInvitationModal(false);
        }}
      />

      {/* Company Details Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-green-800 break-words">
                    {viewingCompany.basicInfo?.companyName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {viewingCompany.verifications &&
                    viewingCompany.verifications.length > 0 ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" />
                        Verified ({viewingCompany.verifications.length}{" "}
                        verifications)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap">
                        <Shield className="w-3 h-3" />
                        Registered on Portal
                      </span>
                    )}
                    <span className="text-sm text-gray-600 break-words">
                      {viewingCompany.basicInfo?.country} • Registration:{" "}
                      {viewingCompany.basicInfo?.rcNumber}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCompany(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Company Information */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Company Name
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium break-words">
                          {viewingCompany.basicInfo?.companyName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Country
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w20/${getCountryCode(viewingCompany.basicInfo?.country)}.png`}
                          alt={`${viewingCompany.basicInfo?.country} flag`}
                          className="w-5 h-5 rounded flex-shrink-0"
                        />
                        <p className="text-gray-800 font-medium break-words">
                          {viewingCompany.basicInfo?.country}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Registration Number
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium break-words">
                          {viewingCompany.basicInfo?.rcNumber}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Status
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium flex items-center gap-2">
                          {viewingCompany.isRegistered ? (
                            <>
                              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="break-words">
                                Registered on Portal
                              </span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                              <span className="break-words">Not on Portal</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                      Corporate Office Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-line break-words">
                        {(() => {
                          const corporateFacilities =
                            viewingCompany.facilities?.filter(
                              (facility) =>
                                facility.type === "Corporate facility" ||
                                facility.type === "corporate",
                            );
                          return corporateFacilities?.length > 0
                            ? corporateFacilities[0].address
                            : "Not specified";
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              {viewingCompany.verifications &&
                viewingCompany.verifications.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Third-Party Verifications
                    </h4>
                    <div className="space-y-4">
                      {viewingCompany.verifications.map((verification, idx) => (
                        <div
                          key={idx}
                          className="bg-green-50 border border-green-200 rounded-lg p-5"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                              <ShieldCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-green-800 break-words">
                                {verification.verifier}
                              </h5>
                              <p className="text-sm text-green-700">
                                Verified on: {verification.date}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 break-words">
                            This verification indicates that{" "}
                            {viewingCompany.basicInfo?.companyName} has been
                            vetted and approved by {verification.verifier} for
                            compliance with industry standards and regulations.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Documents Section */}
              {viewingCompany.documents && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewingCompany.documents.registration &&
                      viewingCompany.documents.registration.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h5 className="font-semibold text-green-700 mb-3 break-words">
                            Registration Documents
                          </h5>
                          <div className="space-y-2">
                            {viewingCompany.documents.registration.map(
                              (doc, docIndex) => (
                                <div
                                  key={docIndex}
                                  className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-medium break-words">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                    {doc.date}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {viewingCompany.documents.licensesPermits &&
                      viewingCompany.documents.licensesPermits.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h5 className="font-semibold text-green-700 mb-3 break-words">
                            Licenses & Permits
                          </h5>
                          <div className="space-y-2">
                            {viewingCompany.documents.licensesPermits.map(
                              (doc, docIndex) => (
                                <div
                                  key={docIndex}
                                  className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-medium break-words">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                    {doc.date}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingCompany(null)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component - UPDATED to fix demoData.filter error
const CompanyDetails = () => {
  const { user, demoData, setUser, updateUser } = useUserStore();
  const [companyData, setCompanyData] = useState(null);

  // Load company data based on user
  useEffect(() => {
    if (!user || !demoData) return;

    let currentCompany = null;

    // Check if user is logged in as a company (agent scenario)
    if (user.loggedInAs?.companyId) {
      // Get the company data from demoData.users
      currentCompany = demoData.users[user.loggedInAs.companyId];
    } else if (user.role === "exporter" || user.role === "importer") {
      // User is an exporter or importer logged in directly
      currentCompany = demoData.users[user.id] || user;
    }

    setCompanyData(currentCompany);
  }, [user, demoData]);

  // In CompanyDetails component, replace the updateCompanyData function:
  const updateCompanyData = (updatedData) => {
    if (!companyData) return;

    // Update in the store using updateUser method
    const result = updateUser(companyData.id, updatedData);

    if (result && result.success) {
      // Update local state
      setCompanyData(updatedData);

      // If this is the current user, update the user state
      if (user && user.id === companyData.id) {
        setUser(updatedData);
      }

      // Use toastId to prevent duplicate toasts
      toast.success("Company details updated successfully!", {
        toastId: "company-update-success",
      });
    } else {
      toast.error("Failed to update company details", {
        toastId: "company-update-error",
      });
    }
  };

  // Update specific section of company data
  const updateSection = (section, data) => {
    if (!companyData) return;

    const updatedData = {
      ...companyData,
      [section]: data,
    };

    updateCompanyData(updatedData);
  };

  if (!user || !companyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-2 lg:p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0 break-words">
          Company Details
        </h1>
        <div className="text-center py-8">
          <p className="text-gray-600">No company data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 lg:p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0 break-words">
        Company Details
      </h1>

      <div className="space-y-6">
        <Section1 companyData={companyData} onUpdate={updateCompanyData} />

        <Section2
          documents={companyData.documents || {}}
          onUpdate={(documents) => updateSection("documents", documents)}
        />

        <Section3
          contacts={companyData.contactPersons || []}
          onUpdate={(contacts) => updateSection("contactPersons", contacts)}
        />

        <Section4
          facilities={companyData.facilities || []}
          onUpdate={(facilities) => updateSection("facilities", facilities)}
        />

        <Section5
          linkedCompanies={
            companyData.role === "exporter"
              ? companyData.importers || []
              : companyData.exporters || []
          }
          onUpdate={(linkedCompanies) => {
            const section =
              companyData.role === "exporter" ? "importers" : "exporters";
            updateSection(section, linkedCompanies);
          }}
          demoData={demoData}
          currentUserRole={companyData.role}
        />
      </div>
    </motion.div>
  );
};

export default CompanyDetails;

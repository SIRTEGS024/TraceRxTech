import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Plus, Save, MapPin, Calendar, Maximize2, Tag, Building, Trees, Truck, RotateCw, Video, Square, Circle, Package, Ship } from 'lucide-react';
import Webcam from 'react-webcam';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Only 4 categories as requested
const SITE_CATEGORIES = {
  FACILITY: 'Corporate Facility',
  PRODUCTION: 'Production/Forest Site',
  PROCESSING: 'Processing/Loading Site',
  SHIPMENT: 'Shipment'  // New category
};

// Dummy sites for each category
const dummySites = {
  [SITE_CATEGORIES.FACILITY]: [
    { id: 'FAC-001', name: 'Main Headquarters', location: 'Rotterdam, NL' },
    { id: 'FAC-002', name: 'Regional Office', location: 'Hamburg, DE' },
    { id: 'FAC-003', name: 'Central Warehouse', location: 'Antwerp, BE' },
  ],
  [SITE_CATEGORIES.PRODUCTION]: [
    { id: 'PROD-001', name: 'Nordic Forest Site', location: 'Stockholm, SE' },
    { id: 'PROD-002', name: 'Alpine Timberland', location: 'Innsbruck, AT' },
    { id: 'PROD-003', name: 'Baltic Woodlands', location: 'Riga, LV' },
  ],
  [SITE_CATEGORIES.PROCESSING]: [
    { id: 'PROC-001', name: 'Rotterdam Processing Plant', location: 'Rotterdam Port' },
    { id: 'PROC-002', name: 'Hamburg Loading Terminal', location: 'Hamburg Port' },
    { id: 'PROC-003', name: 'Antwerp Sawmill', location: 'Antwerp Industrial Zone' },
  ],
  [SITE_CATEGORIES.SHIPMENT]: [
    { id: 'TRX-88383', name: 'TRX-88383 - Oak Timber to Japan', location: 'Rotterdam Port → Tokyo', status: 'In Transit' },
    { id: 'TRX-99234', name: 'TRX-99234 - Pine Wood to USA', location: 'Hamburg → New York', status: 'Loading' },
    { id: 'TRX-55671', name: 'TRX-55671 - Birch Logs to China', location: 'Stockholm → Shanghai', status: 'Preparing' },
    { id: 'TRX-77892', name: 'TRX-77892 - Teak to UAE', location: 'Antwerp → Dubai', status: 'Delivered' },
    { id: 'TRX-44563', name: 'TRX-44563 - Maple to UK', location: 'Hamburg → London', status: 'In Transit' },
  ]
};

const GPSCamera = () => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedShipment, setSelectedShipment] = useState('');
  const [customSiteName, setCustomSiteName] = useState('');
  const [tags, setTags] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [isMobile, setIsMobile] = useState(false);
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [captureMode, setCaptureMode] = useState('photo'); // 'photo' or 'video'

  // Refs
  const webcamRef = useRef(null);
  const containerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Check if device is mobile
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

  // Reverse geocoding function to get address from coordinates
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
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

        return addressParts.join(', ');
      }

      return `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case SITE_CATEGORIES.FACILITY:
        return <Building size={16} />;
      case SITE_CATEGORIES.PRODUCTION:
        return <Trees size={16} />;
      case SITE_CATEGORIES.PROCESSING:
        return <Truck size={16} />;
      case SITE_CATEGORIES.SHIPMENT:
        return <Ship size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

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

          const locationAddress = await getAddressFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          setAddress(locationAddress);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not retrieve GPS location');
        }
      );
    }

    return () => clearInterval(timeInterval);
  }, []);

  // Toggle between front and back camera
  const toggleCameraFacingMode = () => {
    setCameraFacingMode(prevMode => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
    toast.info(`Switched to ${cameraFacingMode === 'environment' ? 'front' : 'back'} camera`);
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

        let siteInfo;
        if (selectedCategory === SITE_CATEGORIES.SHIPMENT && selectedShipment) {
          const shipment = dummySites[SITE_CATEGORIES.SHIPMENT].find(s => s.id === selectedShipment);
          siteInfo = {
            name: shipment.name,
            category: SITE_CATEGORIES.SHIPMENT,
            location: shipment.location
          };
        } else if (selectedSite) {
          const site = dummySites[selectedCategory]?.find(s => s.id === selectedSite);
          siteInfo = {
            name: site?.name || 'Unknown Site',
            category: selectedCategory,
            location: site?.location || 'Unknown Location'
          };
        } else {
          siteInfo = { 
            name: customSiteName || 'Unnamed Site', 
            category: selectedCategory || SITE_CATEGORIES.FACILITY,
            location: address
          };
        }

        const newVideo = {
          id: Date.now(),
          url: videoUrl,
          blob: blob,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          address: address,
          siteName: siteInfo.name,
          category: siteInfo.category,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          customData: {
            category: selectedCategory,
            siteId: selectedSite,
            shipmentId: selectedShipment,
            customName: customSiteName,
          },
          cameraMode: cameraFacingMode,
          duration: (Date.now() - recordingStartTime.current) / 1000
        };

        setCapturedVideos([...capturedVideos, newVideo]);
        setRecordedChunks([]);
        toast.success('Video recorded successfully!');
      };

      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    }
  };

  const recordingStartTime = useRef(null);

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

      let siteInfo;
      if (selectedCategory === SITE_CATEGORIES.SHIPMENT && selectedShipment) {
        const shipment = dummySites[SITE_CATEGORIES.SHIPMENT].find(s => s.id === selectedShipment);
        siteInfo = {
          name: shipment.name,
          category: SITE_CATEGORIES.SHIPMENT,
          location: shipment.location
        };
      } else if (selectedSite) {
        const site = dummySites[selectedCategory]?.find(s => s.id === selectedSite);
        siteInfo = {
          name: site?.name || 'Unknown Site',
          category: selectedCategory,
          location: site?.location || 'Unknown Location'
        };
      } else {
        siteInfo = { 
          name: customSiteName || 'Unnamed Site', 
          category: selectedCategory || SITE_CATEGORIES.FACILITY,
          location: address
        };
      }

      const newImage = {
        id: Date.now(),
        src: imageSrc,
        timestamp: new Date().toISOString(),
        location: currentLocation,
        address: address,
        siteName: siteInfo.name,
        category: siteInfo.category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        customData: {
          category: selectedCategory,
          siteId: selectedSite,
          shipmentId: selectedShipment,
          customName: customSiteName,
        },
        cameraMode: cameraFacingMode
      };

      setCapturedImages([...capturedImages, newImage]);
      toast.success('Image captured successfully!');
    }
  };

  // Handle capture based on mode
  const handleCapture = () => {
    if (captureMode === 'photo') {
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
    setCapturedImages(capturedImages.filter(img => img.id !== id));
    toast.info('Image removed');
  };

  // Remove a video
  const removeVideo = (id) => {
    const video = capturedVideos.find(v => v.id === id);
    if (video && video.url) {
      URL.revokeObjectURL(video.url);
    }
    setCapturedVideos(capturedVideos.filter(vid => vid.id !== id));
    toast.info('Video removed');
  };

  // Save all media
  const saveMedia = () => {
    if (capturedImages.length === 0 && capturedVideos.length === 0) {
      toast.warning('No media to save');
      return;
    }

    // In a real app, you would send this to your API
    console.log('Saving media:', {
      images: capturedImages,
      videos: capturedVideos,
      timestamp: new Date().toISOString()
    });

    // Show success message
    toast.success(`✅ ${capturedImages.length} images and ${capturedVideos.length} videos saved to database`);

    // Clean up video URLs
    capturedVideos.forEach(video => {
      if (video.url) {
        URL.revokeObjectURL(video.url);
      }
    });

    // Reset form
    setCapturedImages([]);
    setCapturedVideos([]);
    setSelectedCategory('');
    setSelectedSite('');
    setSelectedShipment('');
    setCustomSiteName('');
    setTags('');
    setIsCameraActive(false);
    setExpandedImage(null);
    setExpandedVideo(null);
    setIsRecording(false);
  };

  // Format date and time for display
  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  // Get site name for display
  const getSelectedSiteName = () => {
    if (selectedCategory === SITE_CATEGORIES.SHIPMENT && selectedShipment) {
      return dummySites[SITE_CATEGORIES.SHIPMENT].find(s => s.id === selectedShipment)?.name || '';
    } else if (selectedSite) {
      return dummySites[selectedCategory]?.find(s => s.id === selectedSite)?.name || '';
    }
    return customSiteName;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6 max-w-6xl mx-auto"
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6 lg:mb-8 flex items-center gap-2">
        <Camera className="text-green-600" />
        Corporate GPS Camera
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Panel: Controls */}
        <div className="space-y-6">
          {/* Site Selection */}
          <div className="bg-white rounded-xl p-5 shadow-lg border border-green-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Site Information</h2>
            
            {/* Step 1: Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Select Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SITE_CATEGORIES).map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSite('');
                      setSelectedShipment('');
                      setCustomSiteName('');
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${selectedCategory === category
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {getCategoryIcon(category)}
                    <span className="text-sm">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Site/Shipment Selection */}
            {selectedCategory && selectedCategory !== SITE_CATEGORIES.SHIPMENT && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Select Site
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => {
                    setSelectedSite(e.target.value);
                    setCustomSiteName('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a {selectedCategory === SITE_CATEGORIES.FACILITY ? 'facility' : 
                    selectedCategory === SITE_CATEGORIES.PRODUCTION ? 'production site' : 'processing site'}...</option>
                  {dummySites[selectedCategory]?.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name} • {site.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 2: Shipment Selection */}
            {selectedCategory === SITE_CATEGORIES.SHIPMENT && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Select Shipment
                </label>
                <select
                  value={selectedShipment}
                  onChange={(e) => setSelectedShipment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a shipment...</option>
                  {dummySites[SITE_CATEGORIES.SHIPMENT]?.map(shipment => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.id} • {shipment.name} • {shipment.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Or Enter Custom Site */}
            {selectedCategory && !selectedSite && !selectedShipment && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Or Enter Custom Site Details
                  </label>
                  <input
                    type="text"
                    value={customSiteName}
                    onChange={(e) => setCustomSiteName(e.target.value)}
                    placeholder={`Enter ${selectedCategory === SITE_CATEGORIES.SHIPMENT ? 'shipment' : 'site'} name`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
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
              </div>
            )}

            {/* Tags for selected site/shipment */}
            {selectedCategory && (selectedSite || selectedShipment) && (
              <div className="mt-4">
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
            )}

            {/* Selected Info Display */}
            {(selectedCategory || selectedSite || selectedShipment) && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(selectedCategory)}
                  <h3 className="font-medium text-green-800">{selectedCategory}</h3>
                </div>
                <p className="font-semibold text-gray-800 mb-1">
                  {getSelectedSiteName() || customSiteName}
                </p>
                {selectedShipment && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={12} />
                    <span className="font-mono">{selectedShipment}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategory === SITE_CATEGORIES.SHIPMENT && selectedShipment 
                    ? dummySites[SITE_CATEGORIES.SHIPMENT].find(s => s.id === selectedShipment)?.location
                    : selectedSite
                    ? dummySites[selectedCategory]?.find(s => s.id === selectedSite)?.location
                    : address || 'Current location'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Camera Control */}
          <div className="bg-white rounded-xl p-5 shadow-lg border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Camera Control</h2>
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

            {/* Capture Mode Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capture Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCaptureMode('photo')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${captureMode === 'photo'
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Camera size={16} />
                  <span>Photo</span>
                </button>
                <button
                  onClick={() => setCaptureMode('video')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${captureMode === 'video'
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Video size={16} />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* Camera Controls Bar - Only show on mobile */}
            {isCameraActive && isMobile && (
              <div className="mb-4 flex justify-center gap-2">
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

            {/* Live Camera Feed */}
            {isCameraActive && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Live Camera Feed</h3>

                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  {/* Live GPS/Time Overlay - Compact Design */}
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
                          {formatDateTime(currentDateTime)}
                        </p>
                      </div>
                      {(selectedCategory || customSiteName) && (
                        <div className="flex items-center gap-1">
                          <Tag size={12} className="flex-shrink-0" />
                          <p className="text-xs truncate">
                            {selectedCategory} • {getSelectedSiteName() || customSiteName}
                            {selectedShipment && ` • ${selectedShipment}`}
                          </p>
                        </div>
                      )}
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
                    audio={true}
                    screenshotFormat="image/png"
                    videoConstraints={videoConstraints}
                    className="w-full h-auto"
                    mirrored={cameraFacingMode === 'user'}
                  />

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    {/* Camera flip button only on mobile */}
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
                        captureMode === 'video' && isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/90 hover:bg-white text-gray-800'
                      }`}
                    >
                      {captureMode === 'photo' ? (
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
                  {captureMode === 'photo' 
                    ? 'Photos will include GPS location, timestamp, and site information'
                    : 'Videos will include GPS location, timestamp, and site information'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveMedia}
            disabled={capturedImages.length === 0 && capturedVideos.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${capturedImages.length === 0 && capturedVideos.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
          >
            <Save size={20} />
            Save {capturedImages.length} Photo(s) and {capturedVideos.length} Video(s) to Database
          </button>
        </div>

        {/* Right Panel: Captured Media */}
        <div className="space-y-6">
          {/* Captured Images Grid */}
          <div className="bg-white rounded-xl p-5 shadow-lg border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Captured Media</h2>
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
                <p className="text-sm">Activate the camera and capture photos or videos</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3" ref={containerRef}>
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
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 size={24} className="text-white" />
                      </div>
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1 rounded">
                        PHOTO
                      </div>
                      {image.customData?.shipmentId && (
                        <div className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] px-1 rounded">
                          SHIPMENT
                        </div>
                      )}
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
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(image.category)}
                        <p className="truncate">{image.siteName}</p>
                      </div>
                      {image.customData?.shipmentId && (
                        <p className="text-[10px] truncate">{image.customData.shipmentId}</p>
                      )}
                    </div>
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
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-2">
                            <Video size={24} className="text-white" />
                          </div>
                        </div>
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">
                          VIDEO
                        </div>
                        {video.customData?.shipmentId && (
                          <div className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] px-1 rounded">
                            SHIPMENT
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                          {formatTime(video.duration || 0)}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 size={24} className="text-white" />
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
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(video.category)}
                        <p className="truncate">{video.siteName}</p>
                      </div>
                      {video.customData?.shipmentId && (
                        <p className="text-[10px] truncate">{video.customData.shipmentId}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                {isCameraActive && (
                  <button
                    onClick={captureMode === 'photo' ? captureImage : (isRecording ? stopRecording : startRecording)}
                    className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Plus className="text-gray-400" size={24} />
                    <span className="text-sm text-gray-500 mt-1">Add More</span>
                  </button>
                )}
              </div>
            )}
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
                    <h3 className="font-semibold text-lg mb-2">Image Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(expandedImage.category)}
                        <div>
                          <p className="font-medium">{expandedImage.siteName}</p>
                          <p className="text-gray-400">{expandedImage.category}</p>
                          {expandedImage.customData?.shipmentId && (
                            <p className="text-purple-300 font-mono text-sm">
                              {expandedImage.customData.shipmentId}
                            </p>
                          )}
                        </div>
                      </div>
                      <p><span className="text-gray-400">Captured:</span> {new Date(expandedImage.timestamp).toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        {expandedImage.cameraMode === 'user' && (
                          <span className="bg-blue-500 px-2 py-1 rounded text-xs">
                            Front Camera
                          </span>
                        )}
                        {expandedImage.cameraMode === 'environment' && (
                          <span className="bg-green-500 px-2 py-1 rounded text-xs">
                            Back Camera
                          </span>
                        )}
                      </div>
                      {expandedImage.tags.length > 0 && (
                        <div>
                          <p className="text-gray-400 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {expandedImage.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Location Data</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{expandedImage.address || (expandedImage.location ? `${expandedImage.location.lat}, ${expandedImage.location.lng}` : 'No location data')}</span>
                      </p>
                      {expandedImage.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span> {expandedImage.location.lat}, {expandedImage.location.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(expandedImage.id);
                      setExpandedImage(null);
                    }}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    <X size={16} />
                    Delete Image
                  </button>

                  <a
                    href={expandedImage.src}
                    download={`${expandedImage.siteName}-${expandedImage.id}.png`}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Save size={16} />
                    Download Image
                  </a>
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
                    <h3 className="font-semibold text-lg mb-2">Video Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(expandedVideo.category)}
                        <div>
                          <p className="font-medium">{expandedVideo.siteName}</p>
                          <p className="text-gray-400">{expandedVideo.category}</p>
                          {expandedVideo.customData?.shipmentId && (
                            <p className="text-purple-300 font-mono text-sm">
                              {expandedVideo.customData.shipmentId}
                            </p>
                          )}
                        </div>
                      </div>
                      <p><span className="text-gray-400">Recorded:</span> {new Date(expandedVideo.timestamp).toLocaleString()}</p>
                      <p><span className="text-gray-400">Duration:</span> {formatTime(expandedVideo.duration || 0)}</p>
                      <div className="flex items-center gap-2">
                        {expandedVideo.cameraMode === 'user' && (
                          <span className="bg-blue-500 px-2 py-1 rounded text-xs">
                            Front Camera
                          </span>
                        )}
                        {expandedVideo.cameraMode === 'environment' && (
                          <span className="bg-green-500 px-2 py-1 rounded text-xs">
                            Back Camera
                          </span>
                        )}
                      </div>
                      {expandedVideo.tags.length > 0 && (
                        <div>
                          <p className="text-gray-400 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {expandedVideo.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Location Data</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{expandedVideo.address || (expandedVideo.location ? `${expandedVideo.location.lat}, ${expandedVideo.location.lng}` : 'No location data')}</span>
                      </p>
                      {expandedVideo.location && (
                        <p>
                          <span className="text-gray-400">Coordinates:</span> {expandedVideo.location.lat}, {expandedVideo.location.lng}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo(expandedVideo.id);
                      setExpandedVideo(null);
                    }}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    <X size={16} />
                    Delete Video
                  </button>

                  <a
                    href={expandedVideo.url}
                    download={`${expandedVideo.siteName}-${expandedVideo.id}.webm`}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Save size={16} />
                    Download Video
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GPSCamera;
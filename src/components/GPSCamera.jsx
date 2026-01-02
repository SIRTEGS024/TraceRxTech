import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Plus, Save, MapPin, Calendar, Maximize2, Tag, Building, Trees, Truck } from 'lucide-react';
import Webcam from 'react-webcam';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Site categories for organization
const SITE_CATEGORIES = {
  FACILITY: 'Corporate Facility',
  PRODUCTION: 'Production/Forest Site',
  PROCESSING: 'Processing/Loading Site',
  OTHER: 'Other'
};

// Dummy site locations for quick selection
const dummySites = [
  { id: 'FAC-001', name: 'Main Headquarters', category: SITE_CATEGORIES.FACILITY, location: 'Rotterdam, NL' },
  { id: 'FAC-002', name: 'Regional Office', category: SITE_CATEGORIES.FACILITY, location: 'Hamburg, DE' },
  { id: 'PROD-001', name: 'Nordic Forest Site', category: SITE_CATEGORIES.PRODUCTION, location: 'Stockholm, SE' },
  { id: 'PROD-002', name: 'Alpine Timberland', category: SITE_CATEGORIES.PRODUCTION, location: 'Innsbruck, AT' },
  { id: 'PROC-001', name: 'Rotterdam Processing Plant', category: SITE_CATEGORIES.PROCESSING, location: 'Rotterdam Port' },
  { id: 'PROC-002', name: 'Hamburg Loading Terminal', category: SITE_CATEGORIES.PROCESSING, location: 'Hamburg Port' },
];

const GPSCamera = () => {
  // State management
  const [selectedSite, setSelectedSite] = useState('');
  const [customSiteName, setCustomSiteName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [expandedImage, setExpandedImage] = useState(null);

  // Refs
  const webcamRef = useRef(null);
  const containerRef = useRef(null);

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

  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      const siteInfo = selectedSite 
        ? dummySites.find(s => s.id === selectedSite)
        : { 
            name: customSiteName || 'Unnamed Site', 
            category: selectedCategory || SITE_CATEGORIES.OTHER,
            location: address
          };

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
          siteId: selectedSite,
          customName: customSiteName,
          category: selectedCategory
        }
      };

      setCapturedImages([...capturedImages, newImage]);
      toast.success('Image captured successfully!');
    }
  };

  // Remove an image
  const removeImage = (id) => {
    setCapturedImages(capturedImages.filter(img => img.id !== id));
    toast.info('Image removed');
  };

  // Save all images
  const saveImages = () => {
    if (capturedImages.length === 0) {
      toast.warning('No images to save');
      return;
    }

    // In a real app, you would send this to your API
    console.log('Saving images:', {
      images: capturedImages,
      timestamp: new Date().toISOString()
    });

    // Show success message
    toast.success(`✅ ${capturedImages.length} images saved to database`);

    // Reset form
    setCapturedImages([]);
    setSelectedSite('');
    setCustomSiteName('');
    setSelectedCategory('');
    setTags('');
    setIsCameraActive(false);
    setExpandedImage(null);
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
            
            {/* Quick Site Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from Known Sites (Optional)
              </label>
              <select
                value={selectedSite}
                onChange={(e) => {
                  setSelectedSite(e.target.value);
                  if (e.target.value) {
                    const site = dummySites.find(s => s.id === e.target.value);
                    setSelectedCategory(site.category);
                    setCustomSiteName('');
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose a site...</option>
                {Object.values(SITE_CATEGORIES).map(category => (
                  <optgroup key={category} label={category}>
                    {dummySites
                      .filter(site => site.category === category)
                      .map(site => (
                        <option key={site.id} value={site.id}>
                          {site.name} • {site.location}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Or Enter Custom Site */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Enter Custom Site Details
                </label>
                <input
                  type="text"
                  value={customSiteName}
                  onChange={(e) => {
                    setCustomSiteName(e.target.value);
                    if (e.target.value) setSelectedSite('');
                  }}
                  placeholder="Enter site name (e.g., Alpine Forest Area)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(SITE_CATEGORIES).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
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

            {selectedCategory && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(selectedCategory)}
                  <h3 className="font-medium text-green-800">{selectedCategory}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedSite 
                    ? dummySites.find(s => s.id === selectedSite)?.name
                    : customSiteName || 'Custom Site'
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

            {/* Live Camera Feed */}
            {isCameraActive && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Live Camera Feed</h3>

                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  {/* Live GPS/Time Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="flex flex-col gap-1 bg-black/70 text-white p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="text-sm font-medium">
                          {address || (currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Getting location...')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="text-sm">
                          {formatDateTime(currentDateTime)}
                        </span>
                      </div>
                      {(selectedCategory || customSiteName) && (
                        <div className="flex items-center gap-2">
                          <Tag size={16} />
                          <span className="text-sm">
                            {selectedCategory} • {selectedSite ? dummySites.find(s => s.id === selectedSite)?.name : customSiteName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/png"
                    videoConstraints={{
                      facingMode: "environment",
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                    className="w-full h-auto"
                  />

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={captureImage}
                      className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg transition-all hover:scale-105"
                    >
                      <Camera size={20} />
                      Capture Photo
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-3 text-center">
                  Photos will include GPS location, timestamp, and site information
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveImages}
            disabled={capturedImages.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${capturedImages.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
          >
            <Save size={20} />
            Save {capturedImages.length} Image(s) to Database
          </button>
        </div>

        {/* Right Panel: Captured Images */}
        <div className="space-y-6">
          {/* Captured Images Grid */}
          <div className="bg-white rounded-xl p-5 shadow-lg border border-green-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Captured Images</h2>
              <span className="text-sm text-gray-500">
                {capturedImages.length} image(s)
              </span>
            </div>

            {capturedImages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Camera className="mx-auto mb-2" size={48} />
                <p>No images captured yet</p>
                <p className="text-sm">Activate the camera and capture photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3" ref={containerRef}>
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
                    </div>
                  </div>
                ))}

                {/* Add More Button */}
                {isCameraActive && (
                  <button
                    onClick={captureImage}
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
                        </div>
                      </div>
                      <p><span className="text-gray-400">Captured:</span> {new Date(expandedImage.timestamp).toLocaleString()}</p>
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
    </motion.div>
  );
};

export default GPSCamera;
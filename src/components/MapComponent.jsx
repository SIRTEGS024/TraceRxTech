import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from "@react-google-maps/api";
import { FaSearch } from "react-icons/fa"; // Import from react-icons

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [markerPosition, setMarkerPosition] = useState(null);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onPlaceChanged = () => {
    if (!map) return;

    const autocomplete = autocompleteRef.current;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setCenter(location);
        setZoom(10);
        map.panTo(location);
        setMarkerPosition(location);
      }
    }
  };

  const autocompleteRef = useRef(null);

  return isLoaded ? (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: "satellite",
          tilt: 0,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
        onZoomChanged={() => {
          if (map) setZoom(map.getZoom());
        }}
      >
        {/* Marker component for precise placement */}
        {markerPosition && <Marker position={markerPosition} />}

        {/* Overlay search form with Autocomplete and icon */}
        <div className="absolute top-4 left-4 z-10">
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceChanged}
            options={{
              fields: ["geometry", "name"],
              strictBounds: false,
            }}
          >
            <div className="flex items-center bg-green-100 bg-opacity-90 rounded shadow-lg">
              <input
                type="text"
                placeholder="Enter location or coordinates (lat, lng)"
                className="p-2 h-10 w-80 border-none rounded-l focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:ring-inset"
              />
              <button
                type="button"
                className="p-2 h-10 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none flex items-center justify-center"
                onClick={() => autocompleteRef.current && onPlaceChanged()}
              >
                <FaSearch className="h-5 w-5" />
              </button>
            </div>
          </Autocomplete>
        </div>
      </GoogleMap>
    </div>
  ) : (
    <div className="p-4">Loading map...</div>
  );
};

export default MapComponent;
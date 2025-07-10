import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%", // Full screen width
  height: "500px", // Increased height
};

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Vite env variable
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2); // World view by default

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle location or coordinate search
  const handleSearch = (e) => {
    e.preventDefault();
    const input = document.getElementById("locationInput").value;
    let geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: input }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setCenter({ lat: location.lat(), lng: location.lng() });
        setZoom(10); // Zoom in for land view
        if (map) map.panTo(center);
      } else {
        // Try parsing as coordinates
        const coords = input.split(",").map((c) => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          setCenter({ lat: coords[0], lng: coords[1] });
          setZoom(10);
          if (map) map.panTo(center);
        } else {
          alert("Location or coordinates not found. Try 'New York' or '40.7128, -74.0060'");
        }
      }
    });
  };

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
        {/* Overlay search form on the map with green theme */}
        <div className="absolute top-4 left-4 z-10">
          <form onSubmit={handleSearch} className="flex items-center bg-green-100 bg-opacity-90 p-2 rounded shadow-lg">
            <input
              id="locationInput"
              type="text"
              placeholder="Enter location or coordinates (lat, lng)"
              className="p-2 w-64 mr-2 border rounded focus:outline-green-500 focus:ring-green-500 focus:ring-opacity-50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Search
            </button>
          </form>
        </div>
      </GoogleMap>
    </div>
  ) : (
    <div className="p-4">Loading map...</div>
  );
};

export default MapComponent;
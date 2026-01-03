// components/GoogleMapsProvider.js
import { LoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';

const GoogleMapsProvider = ({ children }) => {
  // For Vite, use import.meta.env
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is not set in environment variables');
    console.log('Make sure you have VITE_GOOGLE_MAPS_API_KEY in your .env file');
    return <div>Error: Google Maps API key is missing. Please check your environment variables.</div>;
  }

  // Memoize libraries array to prevent re-renders
  const libraries = useMemo(() => ['places', 'drawing'], []);

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={<div>Loading Google Maps...</div>}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
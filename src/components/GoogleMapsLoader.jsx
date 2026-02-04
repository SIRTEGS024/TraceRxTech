import { useState, useEffect } from 'react';

let googleMapsLoaded = false;
let googleMapsLoadPromise = null;

export const useGoogleMaps = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is missing'));
      return;
    }

    if (googleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    if (googleMapsLoadPromise) {
      googleMapsLoadPromise.then(() => {
        setIsLoaded(true);
      }).catch((error) => {
        setLoadError(error);
      });
      return;
    }

    // Create a promise to load Google Maps
    googleMapsLoadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        googleMapsLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        googleMapsLoaded = true;
        setIsLoaded(true);
        resolve();
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Google Maps');
        setLoadError(error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });

    googleMapsLoadPromise.then(() => {
      setIsLoaded(true);
    }).catch((error) => {
      setLoadError(error);
    });

    return () => {
      // Cleanup if needed
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

// Component wrapper
export const GoogleMapsLoader = ({ children, apiKey }) => {
  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Google Maps</h2>
          <p>{loadError.message}</p>
          <p className="text-sm mt-2">Please check your API key and try again.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return children;
};
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dummy data for shipment batches
const shipmentBatches = [
  { id: 'TRX-000001', name: 'TRX-000001', status: 'completed' },
  { id: 'TRX-000002', name: 'TRX-000002', status: 'active' },
  { id: 'TRX-000003', name: 'TRX-000003', status: 'active' },
  { id: 'TRX-000004', name: 'TRX-000004', status: 'pending' },
];

// Create colored icons for different stages
const createColoredIcon = (color) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'custom-marker'
  });
};

// Color scheme for different stages
const stageColors = {
  Production: '#10B981', // Green
  'Processing/Loading': '#3B82F6', // Blue (combined)
  'Active Shipment': '#F59E0B', // Amber
  Shipment: '#F59E0B', // Amber (same as Active Shipment)
  Delivery: '#EF4444',  // Red
  Destination: '#EF4444' // Red (same as Delivery)
};

// Dummy supply chain data with Nigerian locations
const supplyChainData = {
  'TRX-000001': {
    shipmentId: 'TRX-000001',
    status: 'completed',
    quantity: '10,000 kg',
    timeline: [
      {
        stage: 'Production',
        location: { lat: 7.1600, lng: 3.3500 }, // Ibadan, Oyo State
        name: 'Oyo Farm',
        address: 'Ibadan, Oyo State, Nigeria',
        date: '2024-01-10',
        completed: true
      },
      {
        stage: 'Processing/Loading',
        location: { lat: 6.4297, lng: 3.4223 }, // Apapa Port, Lagos
        name: 'Apapa Port Terminal',
        address: 'Apapa, Lagos, Nigeria',
        date: '2024-01-25',
        completed: true
      },
      {
        stage: 'Shipment',
        location: { lat: 38.7223, lng: -9.1393 }, // Lisbon, Portugal
        name: 'Port of Lisbon',
        address: 'Lisbon, Portugal',
        date: '2024-02-05',
        completed: true
      },
      {
        stage: 'Delivery',
        location: { lat: 52.5200, lng: 13.4050 }, // Berlin, Germany
        name: 'Berlin Distribution Center',
        address: 'Berlin, Germany',
        date: '2024-02-15',
        completed: true
      }
    ]
  },
  'TRX-000002': {
    shipmentId: 'TRX-000002',
    status: 'active',
    quantity: '8,500 kg',
    timeline: [
      {
        stage: 'Production',
        location: { lat: 9.0765, lng: 7.3986 }, // Abuja
        name: 'Abuja Plantation',
        address: 'Abuja FCT, Nigeria',
        date: '2024-02-01',
        completed: true
      },
      {
        stage: 'Processing/Loading',
        location: { lat: 6.4297, lng: 3.4223 }, // Apapa Port, Lagos
        name: 'Apapa Port Terminal',
        address: 'Apapa, Lagos, Nigeria',
        date: '2024-02-15',
        completed: true
      },
      {
        stage: 'Active Shipment',
        location: { lat: 20.0000, lng: -20.0000 }, // Atlantic Ocean
        name: 'MV Atlantic Carrier',
        address: 'Atlantic Ocean',
        date: '2024-02-25',
        completed: true // Changed to true since shipment is active
      },
      {
        stage: 'Destination',
        location: { lat: 40.7128, lng: -74.0060 }, // New York, USA
        name: 'New York Port Authority',
        address: 'New York, USA',
        date: '2024-03-10',
        completed: false
      }
    ]
  },
  'TRX-000003': {
    shipmentId: 'TRX-000003',
    status: 'active',
    quantity: '12,000 kg',
    timeline: [
      {
        stage: 'Production',
        location: { lat: 11.8469, lng: 13.1571 }, // Maiduguri, Borno State
        name: 'Borno Farms',
        address: 'Maiduguri, Borno State, Nigeria',
        date: '2024-02-05',
        completed: true
      },
      {
        stage: 'Processing/Loading',
        location: { lat: 4.8156, lng: 7.0498 }, // Port Harcourt, Rivers State
        name: 'Port Harcourt Port',
        address: 'Port Harcourt, Rivers State, Nigeria',
        date: '2024-02-18',
        completed: true
      },
      {
        stage: 'Active Shipment',
        location: { lat: 15.0000, lng: -25.0000 }, // Atlantic Ocean near Africa
        name: 'MV African Star',
        address: 'Atlantic Ocean',
        date: '2024-02-22',
        completed: true // Changed to true since shipment is active
      },
      {
        stage: 'Destination',
        location: { lat: 51.5074, lng: -0.1278 }, // London, UK
        name: 'Port of London',
        address: 'London, United Kingdom',
        date: '2024-03-08',
        completed: false
      }
    ]
  },
  'TRX-000004': {
    shipmentId: 'TRX-000004',
    status: 'pending',
    quantity: '6,500 kg',
    timeline: [
      {
        stage: 'Production',
        location: { lat: 11.1861, lng: 7.7244 }, // Kaduna, Kaduna State
        name: 'Kaduna Farms',
        address: 'Kaduna, Kaduna State, Nigeria',
        date: '2024-03-01',
        completed: true
      },
      {
        stage: 'Processing/Loading',
        location: { lat: 6.4297, lng: 3.4223 }, // Apapa Port, Lagos
        name: 'Apapa Port Terminal',
        address: 'Apapa, Lagos, Nigeria',
        date: '2024-03-10',
        completed: false
      },
      {
        stage: 'Shipment',
        location: { lat: 48.8566, lng: 2.3522 }, // Paris, France
        name: 'Port of Le Havre',
        address: 'Le Havre, France',
        date: '2024-03-20',
        completed: false
      },
      {
        stage: 'Destination',
        location: { lat: 52.3676, lng: 4.9041 }, // Amsterdam, Netherlands
        name: 'Amsterdam Port',
        address: 'Amsterdam, Netherlands',
        date: '2024-03-25',
        completed: false
      }
    ]
  }
};

const SupplyChain = () => {
  const [selectedShipment, setSelectedShipment] = useState('TRX-000003');
  const [mapCenter, setMapCenter] = useState({ lat: 10, lng: 5 });
  const [mapZoom, setMapZoom] = useState(5);

  const currentShipment = supplyChainData[selectedShipment];

  // Update map center when shipment changes
  useEffect(() => {
    if (currentShipment && currentShipment.timeline.length > 0) {
      const firstLocation = currentShipment.timeline[0].location;
      setMapCenter(firstLocation);
      setMapZoom(6);
    }
  }, [selectedShipment, currentShipment]);

  // Prepare coordinates for the polyline
  const routeCoordinates = currentShipment?.timeline.map(point => [point.location.lat, point.location.lng]) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageIcon = (stage) => {
    return createColoredIcon(stageColors[stage] || '#6B7280');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6">Supply Chain Management</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Shipment Tracking</h2>
                <p className="text-gray-600">Track your shipment from production to delivery</p>
              </div>

              <div className="mt-4 lg:mt-0">
                <label htmlFor="shipment-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Shipment Batch
                </label>
                <div className="flex gap-2">
                  <select
                    id="shipment-select"
                    value={selectedShipment}
                    onChange={(e) => setSelectedShipment(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {shipmentBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {currentShipment && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Shipment ID</span>
                    <p className="font-semibold">{currentShipment.shipmentId}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Quantity</span>
                    <p className="font-semibold">{currentShipment.quantity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentShipment.status)}`}>
                      {currentShipment.status.charAt(0).toUpperCase() + currentShipment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Visualization */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supply Chain Map</h3>
              <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {currentShipment && currentShipment.timeline.map((stage, index) => (
                    <Marker
                      key={index}
                      position={[stage.location.lat, stage.location.lng]}
                      icon={getStageIcon(stage.stage)}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: stageColors[stage.stage] || '#6B7280' }}
                            ></div>
                            <h4 className="font-bold text-gray-800">{stage.stage}</h4>
                          </div>
                          <p className="font-medium">{stage.name}</p>
                          <p className="text-gray-600">{stage.address}</p>
                          <p className="text-sm text-gray-500 mt-1">Date: {stage.date}</p>
                          <p className={`text-sm mt-1 ${stage.completed ? 'text-green-600' : 'text-blue-600'}`}>
                            {stage.completed ? '✓ Completed' : '● In Progress'}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Draw route line */}
                  {routeCoordinates.length > 1 && (
                    <Polyline
                      positions={routeCoordinates}
                      pathOptions={{
                        color: currentShipment.status === 'active' ? '#F59E0B' :
                          currentShipment.status === 'completed' ? '#10B981' : '#9CA3AF',
                        weight: 3,
                        dashArray: currentShipment.status === 'active' ? '10, 10' : '',
                        opacity: 0.8
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Side Legend Panel */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Supply Chain Legend</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-gray-800">Production</p>
                  <p className="text-sm text-gray-600">Farm/Plantation sites</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium text-gray-800">Processing/Loading</p>
                  <p className="text-sm text-gray-600">Processing & port facilities</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500"></div>
                <div>
                  <p className="font-medium text-gray-800">Active Shipment</p>
                  <p className="text-sm text-gray-600">Currently in transit</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
                <div>
                  <p className="font-medium text-gray-800">Destination</p>
                  <p className="text-sm text-gray-600">Final delivery points</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Route Lines</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Completed Shipment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-amber-500 border-dashed border-2 border-amber-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Active Shipment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-gray-400"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Pending Shipment</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Shipment Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Timeline */}
      {currentShipment && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Supply Chain Timeline</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-200"></div>

            <div className="space-y-6 pl-10">
              {currentShipment.timeline.map((stage, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute left-[-34px] top-0 w-6 h-6 rounded-full border-2 ${stage.completed ? 'border-green-600' : 'border-green-300'}`}
                    style={{ backgroundColor: stage.completed ? stageColors[stage.stage] : 'white' }}
                  >
                    {stage.completed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stageColors[stage.stage] }}
                        ></div>
                        <h4 className="font-semibold text-gray-800">{stage.stage}</h4>
                      </div>
                      <span className="text-sm text-gray-500">{stage.date}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{stage.name}</p>
                    <p className="text-gray-600">{stage.address}</p>
                    {stage.stage === 'Active Shipment' && currentShipment.status === 'active' && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-sm">
                        <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Currently En Route
                      </div>
                    )}
                    {!stage.completed && currentShipment.status === 'pending' && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Scheduled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SupplyChain;
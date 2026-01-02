import { motion } from 'framer-motion';
import { useState } from 'react';

const Overview = () => {
  const [currentPage, setCurrentPage] = useState(0);

  // Sample data for verified importers/consignees
  const verifiedImporters = 156;

  // Sample data for importers grouped by country
  const importersByCountry = [
    {
      country: "United States",
      countryCode: "US",
      importers: ["GreenWood Inc.", "American Timber Co.", "Pacific Northwest Lumber"]
    },
    {
      country: "Canada",
      countryCode: "CA",
      importers: ["Canadian Lumber Co.", "Maple Timber Ltd.", "Northern Woods"]
    },
    {
      country: "Sweden",
      countryCode: "SE",
      importers: ["Nordic Timber", "Scandinavian Forests", "Swedish Woodworks"]
    },
    {
      country: "Germany",
      countryCode: "DE",
      importers: ["German Oak Corp.", "Bavarian Timber", "European Hardwoods"]
    },
    {
      country: "Brazil",
      countryCode: "BR",
      importers: ["Brazilian Hardwoods", "Amazon Timber", "Tropical Woods Ltd."]
    },
    {
      country: "Australia",
      countryCode: "AU",
      importers: ["Australian Forest", "Outback Timber", "Eucalyptus Wood Co."]
    },
    {
      country: "France",
      countryCode: "FR",
      importers: ["French Forests", "Provence Timber", "European Oak Corp."]
    },
    {
      country: "United Kingdom",
      countryCode: "GB",
      importers: ["UK Timber Ltd.", "British Woods", "Scottish Lumber"]
    },
    {
      country: "Japan",
      countryCode: "JP",
      importers: ["Japan Woodworks", "Sakura Timber", "Traditional Wood Co."]
    },
    {
      country: "Chile",
      countryCode: "CL",
      importers: ["Chilean Pines", "Andean Timber", "Southern Woods"]
    }
  ];

  // Pagination settings
  const itemsPerPage = 3; // Fewer items per page since each country has multiple importers
  const totalPages = Math.ceil(importersByCountry.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentCountries = importersByCountry.slice(startIndex, startIndex + itemsPerPage);

  // Country code to flag URL mapping
  const getCountryFlag = (countryCode) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 lg:p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-3 lg:mb-4 pl-11 lg:pl-0">
        Dashboard Overview
      </h1>

      {/* Stats Cards - 4 columns with smaller padding */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Sustainable Volume</h3>
          <p className="text-base font-bold text-green-600">1,250 MT</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Active Shipments</h3>
          <p className="text-base font-bold text-green-600">42</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Compliance Score</h3>
          <p className="text-base font-bold text-green-600">98%</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Verified Importers</h3>
          <p className="text-base font-bold text-green-600">{verifiedImporters}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Company Information Card */}
        <div className="bg-white rounded-lg shadow border border-green-100 p-3 lg:p-4">
          <h2 className="text-base lg:text-lg font-bold text-green-800 mb-3">Company Information</h2>

          <div className="space-y-2 lg:space-y-3">
            <div>
              <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Company Name</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">American Timber Exports Inc.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Country</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">United States</p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Company Email</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title="BUS-2024-TIM-001">
                  Contact@ecocomply.com
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Tax ID Number</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title="TIN-US-789012">
                  TIN-US-789012
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Registration Number</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title="US-EXPORT-2024-345678">
                  US-EXPORT-2024-345678
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Export Certificate</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title="EXP-CERT-2024-001">
                  EXP-CERT-2024-001
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Corporate Office</label>
              <p className="text-xs text-gray-700 mt-0.5 leading-tight">
                123 Business District<br />
                Portland, Oregon 97204<br />
                USA
              </p>
            </div>
          </div>
        </div>

        {/* Importers/Consignees Card with Grouping by Country */}
        <div className="bg-white rounded-lg shadow border border-green-100 p-3 lg:p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base lg:text-lg font-bold text-green-800">Importers/Consignees</h2>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              {currentPage + 1}/{totalPages}
            </span>
          </div>

          {/* Importers Grouped by Country */}
          <div className="space-y-3 mb-3">
            {currentCountries.map((countryGroup, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-green-50 transition-colors">
                {/* Country Header with Flag */}
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 w-8 h-6 mr-2">
                    <img
                      src={getCountryFlag(countryGroup.countryCode)}
                      alt={`${countryGroup.country} flag`}
                      className="w-full h-full object-cover rounded-sm"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold text-gray-800">{countryGroup.country}</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      {countryGroup.importers.length} companies
                    </span>
                  </div>
                </div>

                {/* Importers List for this Country */}
                <div className="space-y-1.5 pl-10">
                  {countryGroup.importers.map((importer, importerIndex) => (
                    <div key={importerIndex} className="flex items-center">
                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <p className="text-xs font-medium text-gray-700 truncate" title={importer}>
                        {importer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`text-xs font-medium px-3 py-1 rounded ${currentPage === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
                }`}
            >
              ← Previous
            </button>

            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-2 h-2 rounded-full ${currentPage === index ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className={`text-xs font-medium px-3 py-1 rounded ${currentPage === totalPages - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
                }`}
            >
              Next →
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs font-medium text-green-600">Total Importers</p>
                <p className="text-sm font-bold text-gray-800">{verifiedImporters}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-green-600">Active Now</p>
                <p className="text-sm font-bold text-gray-800">42</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-green-600">Countries</p>
                <p className="text-sm font-bold text-gray-800">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';

const Overview = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [linkedCompanies, setLinkedCompanies] = useState([]);
  const [stats, setStats] = useState({
    shipments: 0,
    linkedCompaniesCount: 0,
    freightAgents: 0,
    verifiers: 0
  });

  const { user, demoData } = useUserStore();

  useEffect(() => {
    if (!user) return;

    let currentCompany = null;
    
    // Check if user is logged in as a company (agent scenario)
    if (user.loggedInAs?.companyId) {
      // Get the company data from demoData
      currentCompany = demoData.users[user.loggedInAs.companyId];
    } else if (user.role === 'exporter' || user.role === 'importer') {
      // User is an exporter or importer logged in directly
      currentCompany = user;
    }

    if (!currentCompany) return;

    setUserData(user);
    setCompanyData(currentCompany);

    // Calculate stats
    const shipmentsCount = currentCompany.shipments?.length || 0;
    
    // Get linked companies based on role
    let linkedCompaniesList = [];
    if (currentCompany.role === 'exporter') {
      linkedCompaniesList = currentCompany.importers || [];
    } else if (currentCompany.role === 'importer') {
      linkedCompaniesList = currentCompany.exporters || [];
    }
    const linkedCompaniesCount = linkedCompaniesList.length;

    // Get linked agents
    const freightAgentsCount = currentCompany.linkedFreightAgents?.length || 0;
    const verifiersCount = currentCompany.linkedVerifiers?.length || 0;

    setStats({
      shipments: shipmentsCount,
      linkedCompaniesCount: linkedCompaniesCount,
      freightAgents: freightAgentsCount,
      verifiers: verifiersCount
    });

    // Get linked companies data for grouping by country
    const linkedCompaniesData = linkedCompaniesList.map(companyId => {
      const company = demoData.users[companyId];
      if (!company) return null;
      
      return {
        id: company.id,
        country: company.basicInfo?.country || 'Unknown',
        countryCode: getCountryCode(company.basicInfo?.country || ''),
        name: company.basicInfo?.companyName || 'Unknown Company',
        email: company.basicInfo?.email || ''
      };
    }).filter(Boolean);

    // Group companies by country
    const groupedByCountry = {};
    linkedCompaniesData.forEach(company => {
      if (!groupedByCountry[company.country]) {
        groupedByCountry[company.country] = [];
      }
      groupedByCountry[company.country].push(company.name);
    });

    // Convert to array format for pagination
    const groupedArray = Object.keys(groupedByCountry).map(country => ({
      country,
      countryCode: getCountryCode(country),
      importers: groupedByCountry[country]
    }));

    setLinkedCompanies(groupedArray);
  }, [user, demoData]);

  // Helper function to get country code from country name (simplified)
  const getCountryCode = (countryName) => {
    const countryCodeMap = {
      'United States': 'US',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Brazil': 'BR',
      'Australia': 'AU',
      'Japan': 'JP',
      'China': 'CN',
      'India': 'IN',
      // Add more as needed
    };
    return countryCodeMap[countryName] || 'US';
  };

  // Get first corporate office address
  const getCorporateOfficeAddress = () => {
    if (!companyData?.facilities) return '';
    
    const corporateFacilities = companyData.facilities.filter(
      facility => facility.type === 'Corporate facility'
    );
    
    if (corporateFacilities.length > 0) {
      return corporateFacilities[0].address || '';
    }
    
    return companyData.basicInfo?.country || '';
  };

  // Pagination settings
  const itemsPerPage = 3;
  const totalPages = Math.ceil(linkedCompanies.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentCountries = linkedCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Country code to flag URL mapping
  const getCountryFlag = (countryCode) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  // Get the correct label for the linked companies section
  const getLinkedCompaniesLabel = () => {
    if (!companyData) return 'Importers/Consignees';
    
    if (companyData.role === 'exporter') {
      return 'Importers/Consignees';
    } else if (companyData.role === 'importer') {
      return 'Exporters';
    }
    return 'Linked Companies';
  };

  // Get the correct label for the license
  const getLicenseLabel = () => {
    if (!companyData) return 'Export License';
    
    if (companyData.role === 'exporter') {
      return 'Export License';
    } else if (companyData.role === 'importer') {
      return 'Import License';
    }
    return 'License';
  };

  // Get the license number
  const getLicenseNumber = () => {
    if (!companyData) return 'LIC-2024-001';
    
    if (companyData.role === 'exporter') {
      return companyData.basicInfo?.exportLicenseNumber || companyData.basicInfo?.licenseNumber || 'EXPORT-LIC-2024-001';
    } else if (companyData.role === 'importer') {
      return companyData.basicInfo?.importLicenseNumber || companyData.basicInfo?.licenseNumber || 'IMPORT-LIC-2024-001';
    }
    return companyData.basicInfo?.licenseNumber || 'LIC-2024-001';
  };

  // Don't render if user is not logged in or not an exporter/importer
  if (!user || !companyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-2 lg:p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-3 lg:mb-4 pl-11 lg:pl-0">
          Dashboard Overview
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
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-3 lg:mb-4 pl-11 lg:pl-0">
        Dashboard Overview
      </h1>

      {/* Stats Cards - 4 columns with smaller padding */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Freight Agents</h3>
          <p className="text-base font-bold text-green-600">{stats.freightAgents}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Shipments</h3>
          <p className="text-base font-bold text-green-600">{stats.shipments}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">Verifiers</h3>
          <p className="text-base font-bold text-green-600">{stats.verifiers}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow border border-green-100">
          <h3 className="text-xs font-semibold text-green-700 mb-1">
            {companyData.role === 'exporter' ? 'Importers' : 'Exporters'}
          </h3>
          <p className="text-base font-bold text-green-600">{stats.linkedCompaniesCount}</p>
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
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {companyData.basicInfo?.companyName || 'Company Name Not Available'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Country</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {companyData.basicInfo?.country || 'Country Not Available'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Company Email</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title={companyData.basicInfo?.email}>
                  {companyData.basicInfo?.email || 'Email Not Available'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Tax ID Number</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title={companyData.basicInfo?.tinNumber}>
                  {companyData.basicInfo?.tinNumber || 'TIN Not Available'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Registration Number</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title={companyData.basicInfo?.rcNumber}>
                  {companyData.basicInfo?.rcNumber || 'RC Not Available'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-green-600 uppercase tracking-wide">TraceRx ID</label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title={companyData.traceRxId}>
                  {companyData.traceRxId || 'TRACERX-ID-NOT-AVAILABLE'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-green-600 uppercase tracking-wide">{getLicenseLabel()}</label>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate" title={getLicenseNumber()}>
                {getLicenseNumber()}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-green-600 uppercase tracking-wide">Corporate Office</label>
              <p className="text-xs text-gray-700 mt-0.5 leading-tight">
                {getCorporateOfficeAddress() || 'Address Not Available'}
              </p>
            </div>
          </div>
        </div>

        {/* Importers/Exporters Card with Grouping by Country */}
        <div className="bg-white rounded-lg shadow border border-green-100 p-3 lg:p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base lg:text-lg font-bold text-green-800">{getLinkedCompaniesLabel()}</h2>
            {linkedCompanies.length > 0 && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {currentPage + 1}/{totalPages}
              </span>
            )}
          </div>

          {/* Importers/Exporters Grouped by Country */}
          {linkedCompanies.length > 0 ? (
            <>
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

                    {/* Importers/Exporters List for this Country */}
                    <div className="space-y-1.5 pl-10">
                      {countryGroup.importers.map((companyName, companyIndex) => (
                        <div key={companyIndex} className="flex items-center">
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                          <p className="text-xs font-medium text-gray-700 truncate" title={companyName}>
                            {companyName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {linkedCompanies.length > itemsPerPage && (
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
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No {companyData.role === 'exporter' ? 'importers' : 'exporters'} linked yet
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
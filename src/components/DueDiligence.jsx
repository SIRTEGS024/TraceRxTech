import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaChevronDown, FaChevronUp, FaBox } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useUserStore } from '../store/useUserStore'

const DueDiligence = () => {
  const { user, demoData } = useUserStore()
  const [years] = useState(['2021', '2022', '2023', '2024', '2025'])
  const [expandedYears, setExpandedYears] = useState({})
  const [editingRecord, setEditingRecord] = useState(null)
  const [newRecord, setNewRecord] = useState({
    year: '',
    description: '',
    tradeName: '',
    commonName: '',
    scientificName: '',
    hsCodes: [],
    netMassKg: '',
    customerName: '',
    customerAddress: '',
    customerEmail: ''
  })
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingYear, setAddingYear] = useState('')
  
  // Get all commodities from demo data
  const allCommodities = demoData.commodities || []
  
  // Get current company's data
  const getCompanyData = () => {
    if (!user) return null
    
    // If logged in directly as company
    if (user.role === 'importer' && !user.loggedInAs) {
      return demoData.users[user.id] || null
    }
    
    // If logged in as agent for a company
    if (user.loggedInAs?.companyId) {
      return demoData.users[user.loggedInAs.companyId] || null
    }
    
    return null
  }
  
  const [company, setCompany] = useState(getCompanyData())
  const [supplierRecords, setSupplierRecords] = useState(company?.supplierRecords || {})
  
  useEffect(() => {
    const companyData = getCompanyData()
    setCompany(companyData)
    setSupplierRecords(companyData?.supplierRecords || {})
  }, [user, demoData])
  
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }))
  }
  
  const handleEditRecord = (record, year, index) => {
    setEditingRecord({ ...record, year, index })
    setNewRecord({
      year,
      description: record.description,
      tradeName: record.tradeName || '',
      commonName: record.commonName || '',
      scientificName: record.scientificName || '',
      hsCodes: record.hsCodes || [],
      netMassKg: record.netMassKg || '',
      customerName: record.customerName || '',
      customerAddress: record.customerAddress || '',
      customerEmail: record.customerEmail || ''
    })
    setShowAddForm(true)
  }
  
  const handleDeleteRecord = (year, index) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    
    if (!company) return
    
    // Create updated records
    const updatedRecords = { ...supplierRecords }
    if (updatedRecords[year]) {
      updatedRecords[year] = updatedRecords[year].filter((_, i) => i !== index)
      
      // If no records left for this year, remove the year
      if (updatedRecords[year].length === 0) {
        delete updatedRecords[year]
      }
    }
    
    // Update company in demo data
    const updatedCompany = {
      ...company,
      supplierRecords: updatedRecords
    }
    
    // Get current state
    const currentState = useUserStore.getState()
    const updatedUsers = {
      ...currentState.demoData.users,
      [company.id]: updatedCompany
    }
    
    // Update the store
    useUserStore.setState({
      demoData: {
        ...currentState.demoData,
        users: updatedUsers
      }
    })
    
    // Update local state
    setCompany(updatedCompany)
    setSupplierRecords(updatedRecords)
    toast.success('Record deleted successfully')
  }
  
  const handleCommodityChange = (e) => {
    const commodity = e.target.value
    setSelectedCommodity(commodity)
    setSelectedProduct('')
  }
  
  const handleProductSelect = (e) => {
    const productCode = e.target.value
    setSelectedProduct(productCode)
    
    // Add product to hsCodes if not already added
    if (productCode && !newRecord.hsCodes.some(hs => hs.code === productCode)) {
      const selectedCommodityObj = allCommodities.find(c => c.commodity === selectedCommodity)
      const productObj = selectedCommodityObj?.products.find(p => p.code === productCode)
      
      if (productObj) {
        const newHsCode = {
          commodity: selectedCommodity,
          code: productObj.code,
          name: productObj.name
        }
        
        setNewRecord(prev => ({
          ...prev,
          hsCodes: [...prev.hsCodes, newHsCode]
        }))
      }
    }
  }
  
  const removeHsCode = (index) => {
    setNewRecord(prev => ({
      ...prev,
      hsCodes: prev.hsCodes.filter((_, i) => i !== index)
    }))
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSaveRecord = () => {
    // Validate required fields
    if (!newRecord.year) {
      toast.error('Please select a year')
      return
    }
    
    if (!newRecord.description || !newRecord.commonName || !newRecord.scientificName || 
        !newRecord.netMassKg || !newRecord.customerName || !newRecord.customerAddress || 
        !newRecord.customerEmail) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (newRecord.hsCodes.length === 0) {
      toast.error('Please select at least one HS code')
      return
    }
    
    if (!company) {
      toast.error('Company data not found')
      return
    }
    
    // Get current state
    const currentState = useUserStore.getState()
    const updatedRecords = { ...supplierRecords }
    
    if (!updatedRecords[newRecord.year]) {
      updatedRecords[newRecord.year] = []
    }
    
    const recordToSave = {
      supplierId: newRecord.supplierId || '',
      supplierName: newRecord.supplierName || '',
      supplierAddress: newRecord.supplierAddress || '',
      supplierEmail: newRecord.supplierEmail || '',
      description: newRecord.description,
      tradeName: newRecord.tradeName,
      commonName: newRecord.commonName,
      scientificName: newRecord.scientificName,
      hsCodes: newRecord.hsCodes,
      netMassKg: parseFloat(newRecord.netMassKg),
      customerName: newRecord.customerName,
      customerAddress: newRecord.customerAddress,
      customerEmail: newRecord.customerEmail
    }
    
    if (editingRecord) {
      // Update existing record
      updatedRecords[newRecord.year][editingRecord.index] = recordToSave
    } else {
      // Add new record
      updatedRecords[newRecord.year].push(recordToSave)
    }
    
    // Update company in demo data
    const updatedCompany = {
      ...company,
      supplierRecords: updatedRecords
    }
    
    const updatedUsers = {
      ...currentState.demoData.users,
      [company.id]: updatedCompany
    }
    
    // Update the store
    useUserStore.setState({
      demoData: {
        ...currentState.demoData,
        users: updatedUsers
      }
    })
    
    // Update local state
    setCompany(updatedCompany)
    setSupplierRecords(updatedRecords)
    
    // Reset form
    setNewRecord({
      year: '',
      description: '',
      tradeName: '',
      commonName: '',
      scientificName: '',
      hsCodes: [],
      netMassKg: '',
      customerName: '',
      customerAddress: '',
      customerEmail: ''
    })
    setSelectedCommodity('')
    setSelectedProduct('')
    setEditingRecord(null)
    setShowAddForm(false)
    setAddingYear('')
    
    toast.success(editingRecord ? 'Record updated successfully' : 'Record added successfully')
  }
  
  const handleCancelEdit = () => {
    setNewRecord({
      year: '',
      description: '',
      tradeName: '',
      commonName: '',
      scientificName: '',
      hsCodes: [],
      netMassKg: '',
      customerName: '',
      customerAddress: '',
      customerEmail: ''
    })
    setSelectedCommodity('')
    setSelectedProduct('')
    setEditingRecord(null)
    setShowAddForm(false)
    setAddingYear('')
  }
  
  const startAddRecord = (year) => {
    setAddingYear(year)
    setNewRecord(prev => ({ ...prev, year }))
    setShowAddForm(true)
  }

  // If no company data, show loading
  if (!company) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">
          Supplier Records & Due Diligence
        </h1>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <p className="text-gray-700">Loading supplier records...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0">
        Supplier Records & Due Diligence - {company.basicInfo?.companyName || 'Company'}
      </h1>
      
      <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 mb-6">
        <p className="text-gray-700 mb-4">
          Manage your supplier trade records for EUDR compliance. Add, edit, or delete trade records by year.
          Each record should include all required information for due diligence reporting.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-800">Total Records</div>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(supplierRecords).flat().length}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-800">Years with Data</div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(supplierRecords).length}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-semibold text-purple-800">Supplier Companies</div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(Object.values(supplierRecords).flat().map(r => r.supplierId)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Records by Year */}
      <div className="space-y-6">
        {years.map(year => {
          const yearRecords = supplierRecords[year] || []
          const isExpanded = expandedYears[year]
          
          return (
            <div key={year} className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
              {/* Year Header */}
              <div 
                className="flex items-center justify-between p-4 bg-green-50 border-b border-green-100 cursor-pointer hover:bg-green-100"
                onClick={() => toggleYear(year)}
              >
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-green-800">
                    {year} Supplier Records
                  </h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {yearRecords.length} record{yearRecords.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startAddRecord(year)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPlus />
                    <span>Add Record</span>
                  </button>
                  {isExpanded ? <FaChevronUp className="text-green-600" /> : <FaChevronDown className="text-green-600" />}
                </div>
              </div>
              
              {/* Records List (when expanded) */}
              {isExpanded && (
                <div className="p-6">
                  {yearRecords.length > 0 ? (
                    <div className="space-y-6">
                      {yearRecords.map((record, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {record.description}
                              </h3>
                              {record.supplierName && (
                                <p className="text-gray-600 mb-2">
                                  <span className="font-medium">Supplier:</span> {record.supplierName}
                                  {record.supplierEmail && (
                                    <span className="text-gray-500 ml-2">({record.supplierEmail})</span>
                                  )}
                                </p>
                              )}
                              {record.tradeName && (
                                <p className="text-gray-600 mb-1">
                                  <span className="font-medium">Trade Name:</span> {record.tradeName}
                                </p>
                              )}
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">Species:</span> {record.commonName} ({record.scientificName})
                              </p>
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">Net Mass:</span> {record.netMassKg.toLocaleString()} kg
                              </p>
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">Customer:</span> {record.customerName}
                              </p>
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">Email:</span> {record.customerEmail}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEditRecord(record, year, index)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit record"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(year, index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete record"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          
                          {/* HS Codes */}
                          {record.hsCodes && record.hsCodes.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">HS Codes:</h4>
                              <div className="flex flex-wrap gap-2">
                                {record.hsCodes.map((hs, hsIndex) => (
                                  <div key={hsIndex} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
                                    <FaBox className="mr-2 text-xs" />
                                    {hs.commodity}: {hs.code} - {hs.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Customer Details */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Details:</h4>
                            <p className="text-gray-600 text-sm">{record.customerAddress}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No supplier records for {year}</p>
                      <button
                        onClick={() => startAddRecord(year)}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                      >
                        <FaPlus className="mr-2" />
                        Add First Record
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingRecord) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-800">
                  {editingRecord ? 'Edit Supplier Record' : 'Add New Supplier Record'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Year (Readonly for editing) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={newRecord.year}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Trade *
                  </label>
                  <textarea
                    name="description"
                    value={newRecord.description}
                    onChange={handleInputChange}
                    placeholder="Describe the trade, including relevant products, commodities, etc."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Trade Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade Name
                  </label>
                  <input
                    type="text"
                    name="tradeName"
                    value={newRecord.tradeName}
                    onChange={handleInputChange}
                    placeholder="Enter trade name of products"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Common Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Common Name of Species *
                    </label>
                    <input
                      type="text"
                      name="commonName"
                      value={newRecord.commonName}
                      onChange={handleInputChange}
                      placeholder="e.g., Mahogany, Coffee, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Scientific Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scientific Name *
                    </label>
                    <input
                      type="text"
                      name="scientificName"
                      value={newRecord.scientificName}
                      onChange={handleInputChange}
                      placeholder="e.g., Swietenia macrophylla, Coffea arabica, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                {/* HS Codes Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HS Codes (EUDR Products) *
                  </label>
                  
                  {/* Commodity Selection */}
                  <div className="mb-4">
                    <select
                      value={selectedCommodity}
                      onChange={handleCommodityChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a commodity</option>
                      {allCommodities.map((commodity, index) => (
                        <option key={index} value={commodity.commodity}>
                          {commodity.commodity}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Product Selection (if commodity selected) */}
                  {selectedCommodity && (
                    <div className="mb-4">
                      <select
                        value={selectedProduct}
                        onChange={handleProductSelect}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select a product</option>
                        {allCommodities
                          .find(c => c.commodity === selectedCommodity)
                          ?.products.map((product, index) => (
                            <option key={index} value={product.code}>
                              {product.code} - {product.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Selected HS Codes */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected HS Codes:</h4>
                    {newRecord.hsCodes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {newRecord.hsCodes.map((hs, index) => (
                          <div 
                            key={index} 
                            className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg flex items-center group"
                          >
                            <FaBox className="mr-2 text-xs" />
                            <div>
                              <div className="font-medium">{hs.commodity}</div>
                              <div className="text-xs">{hs.code} - {hs.name}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeHsCode(index)}
                              className="ml-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No HS codes selected yet</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Net Mass */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Net Mass (kg) *
                    </label>
                    <input
                      type="number"
                      name="netMassKg"
                      value={newRecord.netMassKg}
                      onChange={handleInputChange}
                      placeholder="Enter net mass in kilograms"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={newRecord.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter customer/company name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                {/* Customer Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Postal Address *
                  </label>
                  <textarea
                    name="customerAddress"
                    value={newRecord.customerAddress}
                    onChange={handleInputChange}
                    placeholder="Full postal address of customer"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Customer Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={newRecord.customerEmail}
                    onChange={handleInputChange}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Optional Supplier Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Information (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        value={newRecord.supplierName || ''}
                        onChange={handleInputChange}
                        placeholder="Supplier company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Email
                      </label>
                      <input
                        type="email"
                        name="supplierEmail"
                        value={newRecord.supplierEmail || ''}
                        onChange={handleInputChange}
                        placeholder="supplier@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Address
                    </label>
                    <textarea
                      name="supplierAddress"
                      value={newRecord.supplierAddress || ''}
                      onChange={handleInputChange}
                      placeholder="Supplier company address"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRecord}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaSave className="mr-2" />
                    {editingRecord ? 'Update Record' : 'Save Record'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default DueDiligence
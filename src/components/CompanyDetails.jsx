import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Plus,
  Upload,
  X,
  FileText,
  User,
  Building,
  Download,
  Edit,
  Trash2,
  Users,
  Search,
  ExternalLink,
  AlertCircle,
  Eye,
  CheckCircle,
  Mail,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

// Custom hook to fetch countries with new API
const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags");
        if (!res.ok) throw new Error("Failed to fetch countries");

        const data = await res.json();

        // Format and sort countries using new API structure
        const formatted = data
          .filter((c) => c.cca2 && c.name?.common)
          .map((c) => ({
            name: c.name.common,
            code: c.cca2.toLowerCase(),
            flag: c.flags?.png || `https://flagcdn.com/w320/${c.cca2.toLowerCase()}.png`
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching countries:", err);
        
        // Fallback to basic country list if API fails
        const fallbackCountries = [
          { name: "United States", code: "us", flag: "https://flagcdn.com/w320/us.png" },
          { name: "Canada", code: "ca", flag: "https://flagcdn.com/w320/ca.png" },
          { name: "United Kingdom", code: "gb", flag: "https://flagcdn.com/w320/gb.png" },
          { name: "Germany", code: "de", flag: "https://flagcdn.com/w320/de.png" },
          { name: "France", code: "fr", flag: "https://flagcdn.com/w320/fr.png" },
          { name: "Japan", code: "jp", flag: "https://flagcdn.com/w320/jp.png" },
          { name: "Australia", code: "au", flag: "https://flagcdn.com/w320/au.png" },
          { name: "China", code: "cn", flag: "https://flagcdn.com/w320/cn.png" },
          { name: "India", code: "in", flag: "https://flagcdn.com/w320/in.png" },
          { name: "Brazil", code: "br", flag: "https://flagcdn.com/w320/br.png" },
        ];
        setCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

// Section 1: Company Information Form (Now Editable) - Updated flag display
const Section1 = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "American Timber Exports Inc.",
    country: "United States",
    countryCode: "us",
    address: "123 Business District\nPortland, Oregon 97204\nUSA",
    registrationNumber: "BUS-2024-TIM-001",
    taxId: "TIN-US-789012",
    exportCertificate: "US-EXPORT-2024-345678"
  });

  const { countries, loading } = useCountries();

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Company information updated successfully!');
  };

  const handleChange = (field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle country selection
  const handleCountrySelect = (e) => {
    const selectedCountry = countries.find(c => c.name === e.target.value);
    if (selectedCountry) {
      setCompanyInfo(prev => ({
        ...prev,
        country: selectedCountry.name,
        countryCode: selectedCountry.code
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <Building className="w-5 h-5" />
          1. Company Information
        </h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
        >
          {isEditing ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Information
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">{companyInfo.companyName}</p>
            </div>
          )}
        </div>

        {/* Country of Operation */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Country of Operation
          </label>
          {isEditing ? (
            loading ? (
              <div className="w-full px-4 py-3 border border-green-300 rounded-lg bg-gray-50">
                <p className="text-gray-500">Loading countries...</p>
              </div>
            ) : (
              <select
                value={companyInfo.country}
                onChange={handleCountrySelect}
                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2 break-words">
              <img
                src={`https://flagcdn.com/w20/${companyInfo.countryCode}.png`}
                alt={`${companyInfo.country} flag`}
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <p className="text-gray-800 font-medium">{companyInfo.country}</p>
            </div>
          )}
        </div>

        {/* Corporate Office Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Corporate Office Address
          </label>
          {isEditing ? (
            <textarea
              value={companyInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 whitespace-pre-line">{companyInfo.address}</p>
            </div>
          )}
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Registration Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">{companyInfo.registrationNumber}</p>
            </div>
          )}
        </div>

        {/* Tax ID Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Tax ID Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">{companyInfo.taxId}</p>
            </div>
          )}
        </div>

        {/* Export Certificate Number */}
        <div>
          <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
            Export Certificate Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={companyInfo.exportCertificate}
              onChange={(e) => handleChange('exportCertificate', e.target.value)}
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg break-words">
              <p className="text-gray-800 font-medium">{companyInfo.exportCertificate}</p>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

// Document Upload Component (Updated with "Others" category)
const DocumentUpload = ({
  title,
  documents,
  onAdd,
  onRemove,
  type
}) => {
  const [showModal, setShowModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (docName && file) {
      onAdd({
        id: Date.now(),
        name: docName,
        fileName: file.name,
        type: type,
        date: new Date().toLocaleDateString(),
        size: file.size
      });
      setDocName('');
      setFile(null);
      setShowModal(false);
      toast.success(`${docName} uploaded successfully!`);
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'registration': return 'text-blue-600';
      case 'license&permits': return 'text-green-600';
      case 'others': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <h3 className="font-semibold text-green-700 break-words">{title}</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Uploaded Documents Display */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Document" to upload</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between bg-gray-50 px-3 md:px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className={`w-5 h-5 ${getIconColor()} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-800 break-words block">{doc.name}</span>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mt-1">
                    <span className="truncate max-w-[150px] sm:max-w-none">{doc.fileName}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                    {doc.size && (
                      <>
                        <span>•</span>
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(doc.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">Upload {title}</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Business License 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-green-200 rounded-lg p-4 md:p-6 text-center hover:border-green-300 transition-colors">
                  <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id={`file-${type}`}
                  />
                  <label htmlFor={`file-${type}`} className="cursor-pointer block">
                    <span className="text-green-600 font-medium">Click to upload</span>
                    <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                  </label>
                  {file && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800 truncate">{file.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!docName || !file}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section 2: Document Upload (Updated with "Others" category)
const Section2 = ({ documents, setDocuments }) => {
  const registrationDocs = documents.filter(d => d.type === 'registration');
  const licenseDocs = documents.filter(d => d.type === 'license&permits');
  const otherDocs = documents.filter(d => d.type === 'others');

  const handleAdd = (doc) => {
    setDocuments([...documents, doc]);
  };

  const handleRemove = (id) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.info('Document removed');
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        2. Document Upload
      </h2>

      <div className="space-y-6">
        <DocumentUpload
          title="Registration Documents"
          documents={registrationDocs}
          onAdd={(doc) => handleAdd({ ...doc, type: 'registration' })}
          onRemove={handleRemove}
          type="registration"
        />

        <DocumentUpload
          title="Licenses & Permits"
          documents={licenseDocs}
          onAdd={(doc) => handleAdd({ ...doc, type: 'license&permits' })}
          onRemove={handleRemove}
          type="license&permits"
        />

        <DocumentUpload
          title="Other Relevant Documents"
          documents={otherDocs}
          onAdd={(doc) => handleAdd({ ...doc, type: 'others' })}
          onRemove={handleRemove}
          type="others"
        />
      </div>
    </div>
  );
};

// Contact Person Card Component (FIXED FOR RESPONSIVE)
const ContactPersonCard = ({ contact, onView, onEdit, onDelete }) => {
  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50 hover:bg-green-50 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-green-800 break-words">{contact.name}</h4>
            <p className="text-sm text-gray-600 break-words mt-1">{contact.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                {contact.idCards.length} ID card(s)
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Added: {contact.addedDate}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={() => onView(contact.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(contact.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Contact"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Contact Person Modal Component
const ContactPersonModal = ({
  isOpen,
  onClose,
  onSave,
  contact = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [idCards, setIdCards] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with contact data if editing
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        address: contact.address || '',
        email: contact.email || ''
      });
      setIdCards(contact.idCards || []);
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        email: ''
      });
      setIdCards([]);
    }
  }, [contact, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIdCard = (files) => {
    const newIdCards = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      date: new Date().toLocaleDateString()
    }));
    setIdCards(prev => [...prev, ...newIdCards]);
  };

  const handleRemoveIdCard = (id) => {
    setIdCards(prev => prev.filter(card => card.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const contactData = {
      id: contact ? contact.id : Date.now(),
      ...formData,
      idCards,
      addedDate: contact ? contact.addedDate : new Date().toLocaleDateString()
    };

    onSave(contactData);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-green-800 break-words">
            {contact ? 'Edit Contact Person' : 'Add Contact Person'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Contact Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Telephone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter contact address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* ID Cards Upload Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h4 className="font-semibold text-green-700 break-words">ID Cards</h4>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleAddIdCard(e.target.files)}
                    className="hidden"
                    id="idCardUpload"
                  />
                  <label
                    htmlFor="idCardUpload"
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 cursor-pointer bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Upload ID Cards
                  </label>
                </div>
              </div>

              {/* Uploaded ID Cards */}
              <div className="space-y-2">
                {idCards.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No ID cards uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Upload ID Cards" to add</p>
                  </div>
                ) : (
                  idCards.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between bg-green-50 px-3 md:px-4 py-3 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-green-800 break-words">{card.name}</p>
                          <p className="text-xs text-gray-500">Uploaded: {card.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveIdCard(card.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || !formData.name || !formData.email || !formData.phone}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {contact ? 'Update Contact' : 'Save Contact'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 3: Contact Persons
const Section3 = ({ contacts, setContacts }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);

  const handleSaveContact = (contactData) => {
    if (editingContact) {
      // Update existing contact
      setContacts(prev => prev.map(contact =>
        contact.id === contactData.id ? contactData : contact
      ));
      toast.success('Contact updated successfully!');
    } else {
      // Add new contact
      setContacts(prev => [...prev, contactData]);
      toast.success('Contact added successfully!');
    }
    setEditingContact(null);
  };

  const handleEditContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDeleteContact = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast.success('Contact deleted successfully!');
    }
  };

  const handleViewContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setViewingContact(contact);
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        3. Contact Persons
      </h2>

      {/* Add Contact Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Contact Person
        </button>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Contact Persons Added</h3>
            <p className="text-gray-500">Click "Add Contact Person" to create your first contact</p>
          </div>
        ) : (
          contacts.map(contact => (
            <ContactPersonCard
              key={contact.id}
              contact={contact}
              onView={handleViewContact}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          ))
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      <ContactPersonModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
      />

      {/* View Contact Details Modal */}
      {viewingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-green-800 break-words">
                    {viewingContact.name}
                  </h3>
                  <p className="text-green-700 break-words mt-1">{viewingContact.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingContact(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-6">
                {/* Contact Details */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-800 break-words">{viewingContact.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Address
                      </label>
                      <p className="text-gray-800 whitespace-pre-line break-words">{viewingContact.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Added On
                      </label>
                      <p className="text-gray-800">{viewingContact.addedDate}</p>
                    </div>
                  </div>
                </div>

                {/* ID Cards */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-3">
                    ID Cards ({viewingContact.idCards.length})
                  </h4>
                  <div className="space-y-2">
                    {viewingContact.idCards.map((card, index) => (
                      <div
                        key={card.id || index}
                        className="flex items-center justify-between bg-gray-50 px-3 md:px-4 py-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 break-words">{card.name}</p>
                            <p className="text-xs text-gray-500">Uploaded: {card.date}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Simulate download
                            alert(`Downloading ${card.name}`);
                          }}
                          className="text-green-600 hover:text-green-800 flex-shrink-0 ml-2"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingContact(null)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Staff Member Component (FIXED FOR RESPONSIVE)
const StaffMember = ({ staff, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-2">
      <div
        className="flex flex-col sm:flex-row justify-between items-start gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 break-words">{staff.name}</h4>
            <p className="text-sm text-gray-500 break-words mt-1">{staff.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff.id);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit Staff"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(staff.id);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="break-words">
              <span className="text-gray-500">Age:</span> {staff.age}
            </div>
            <div className="break-words">
              <span className="text-gray-500">ID Card:</span>
              {staff.idCard ? '✅ Uploaded' : '❌ Not uploaded'}
            </div>
            <div className="break-words">
              <span className="text-gray-500">Contract:</span>
              {staff.contract ? '✅ Uploaded' : '❌ Not uploaded'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Staff Modal
const AddStaffModal = ({ isOpen, onClose, onSave, editingStaff }) => {
  const [staff, setStaff] = useState(editingStaff || {
    name: '',
    age: '',
    jobTitle: '',
    idCard: null,
    contract: null
  });

  const handleFileChange = (field, file) => {
    setStaff({ ...staff, [field]: file });
  };

  const handleSubmit = () => {
    onSave(staff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-800 break-words">
            {editingStaff ? 'Edit Staff' : 'Add Staff Member'}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={staff.name}
              onChange={(e) => setStaff({ ...staff, name: e.target.value })}
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter staff name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Age *
            </label>
            <input
              type="number"
              value={staff.age}
              onChange={(e) => setStaff({ ...staff, age: e.target.value })}
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter age"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-1">
              Job Description *
            </label>
            <textarea
              value={staff.jobTitle}
              onChange={(e) => setStaff({ ...staff, jobTitle: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border border-green-200 rounded-lg"
              placeholder="Enter job description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Staff ID Card *
            </label>
            <div className="border-2 border-dashed border-green-200 rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => handleFileChange('idCard', e.target.files[0])}
                className="w-full"
              />
              {staff.idCard && (
                <p className="text-sm text-gray-700 mt-2 break-words">
                  Selected: {staff.idCard.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Employment Contract *
            </label>
            <div className="border-2 border-dashed border-green-200 rounded-lg p-4">
              <input
                type="file"
                onChange={(e) => handleFileChange('contract', e.target.files[0])}
                className="w-full"
              />
              {staff.contract && (
                <p className="text-sm text-gray-700 mt-2 break-words">
                  Selected: {staff.contract.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!staff.name || !staff.age || !staff.jobTitle}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {editingStaff ? 'Update' : 'Add'} Staff
          </button>
        </div>
      </div>
    </div>
  );
};

// Facility/Location Component (FIXED FOR RESPONSIVE)
const FacilityLocation = ({
  facility,
  type,
  onAddStaff,
  onEditFacility,
  onDeleteFacility,
  onEditStaff,
  onDeleteStaff
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleEditStaff = (staffId) => {
    const staff = facility.staff.find(s => s.id === staffId);
    setEditingStaff(staff);
    setShowAddStaff(true);
  };

  const handleSaveStaff = (staffData) => {
    if (editingStaff) {
      onEditStaff(facility.id, staffData);
    } else {
      onAddStaff(facility.id, staffData);
    }
    setShowAddStaff(false);
    setEditingStaff(null);
  };

  return (
    <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-green-800 break-words">{facility.name}</h4>
          <p className="text-sm text-gray-600 break-words mt-1">{facility.address}</p>
        </div>
        <div className="flex gap-2 self-end sm:self-start mt-2 sm:mt-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-green-600 hover:text-green-800 text-sm whitespace-nowrap px-2 py-1"
          >
            {expanded ? 'Hide' : 'Show'} Staff
          </button>
          <button
            onClick={() => onEditFacility(facility.id)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit Facility"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteFacility(facility.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Facility"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
          {type} • {facility.staff.length} staff
        </span>
        <button
          onClick={() => setShowAddStaff(true)}
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap px-2 py-1"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {expanded && facility.staff.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200">
          {facility.staff.map(staff => (
            <StaffMember
              key={staff.id}
              staff={staff}
              onEdit={handleEditStaff}
              onDelete={(staffId) => onDeleteStaff(facility.id, staffId)}
            />
          ))}
        </div>
      )}

      {showAddStaff && (
        <AddStaffModal
          isOpen={showAddStaff}
          onClose={() => {
            setShowAddStaff(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          editingStaff={editingStaff}
        />
      )}
    </div>
  );
};

// Section 4: Facilities & Staff
const Section4 = ({ facilities, setFacilities }) => {
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [selectedType, setSelectedType] = useState('corporate');
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({ name: '', address: '' });

  const handleAddFacility = () => {
    if (facilityForm.name && facilityForm.address) {
      const newFacility = {
        id: Date.now(),
        type: selectedType,
        name: facilityForm.name,
        address: facilityForm.address,
        staff: []
      };
      setFacilities([...facilities, newFacility]);
      setFacilityForm({ name: '', address: '' });
      setShowAddFacility(false);
    }
  };

  const handleEditFacility = (facilityId, updates) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId ? { ...facility, ...updates } : facility
    ));
  };

  const handleDeleteFacility = (facilityId) => {
    setFacilities(facilities.filter(facility => facility.id !== facilityId));
  };

  const handleAddStaff = (facilityId, staffData) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId
        ? { ...facility, staff: [...facility.staff, { ...staffData, id: Date.now() }] }
        : facility
    ));
  };

  const handleEditStaff = (facilityId, staffData) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId
        ? {
          ...facility,
          staff: facility.staff.map(staff =>
            staff.id === staffData.id ? staffData : staff
          )
        }
        : facility
    ));
  };

  const handleDeleteStaff = (facilityId, staffId) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId
        ? { ...facility, staff: facility.staff.filter(staff => staff.id !== staffId) }
        : facility
    ));
  };

  const corporateFacilities = facilities.filter(f => f.type === 'corporate');
  const productionSites = facilities.filter(f => f.type === 'production');
  const processingSites = facilities.filter(f => f.type === 'processing');

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        4. Facilities & Staff
      </h2>

      {/* Add Facility Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingFacility(null);
            setFacilityForm({ name: '', address: '' });
            setShowAddFacility(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Facility
        </button>
      </div>

      {/* Facility Lists */}
      <div className="space-y-6">
        {/* Corporate Facilities */}
        {corporateFacilities.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Corporate Facilities ({corporateFacilities.length})
            </h3>
            {corporateFacilities.map(facility => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Corporate Facility"
                onAddStaff={handleAddStaff}
                onEditFacility={(id) => {
                  const facilityToEdit = facilities.find(f => f.id === id);
                  setEditingFacility(facilityToEdit);
                  setFacilityForm({
                    name: facilityToEdit.name,
                    address: facilityToEdit.address
                  });
                  setSelectedType('corporate');
                  setShowAddFacility(true);
                }}
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            ))}
          </div>
        )}

        {/* Production Sites */}
        {productionSites.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3">Production/Forest Sites ({productionSites.length})</h3>
            {productionSites.map(facility => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Production/Forest Site"
                onAddStaff={handleAddStaff}
                onEditFacility={(id) => {
                  const facilityToEdit = facilities.find(f => f.id === id);
                  setEditingFacility(facilityToEdit);
                  setFacilityForm({
                    name: facilityToEdit.name,
                    address: facilityToEdit.address
                  });
                  setSelectedType('production');
                  setShowAddFacility(true);
                }}
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            ))}
          </div>
        )}

        {/* Processing Sites */}
        {processingSites.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700 mb-3">Processing/Loading Sites ({processingSites.length})</h3>
            {processingSites.map(facility => (
              <FacilityLocation
                key={facility.id}
                facility={facility}
                type="Processing/Loading Site"
                onAddStaff={handleAddStaff}
                onEditFacility={(id) => {
                  const facilityToEdit = facilities.find(f => f.id === id);
                  setEditingFacility(facilityToEdit);
                  setFacilityForm({
                    name: facilityToEdit.name,
                    address: facilityToEdit.address
                  });
                  setSelectedType('processing');
                  setShowAddFacility(true);
                }}
                onDeleteFacility={handleDeleteFacility}
                onEditStaff={handleEditStaff}
                onDeleteStaff={handleDeleteStaff}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Facility Modal */}
      {showAddFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">
                {editingFacility ? 'Edit Facility' : 'Add New Facility'}
              </h3>
              <button onClick={() => setShowAddFacility(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Type *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                >
                  <option value="corporate">Corporate Facility</option>
                  <option value="production">Production/Forest Site</option>
                  <option value="processing">Processing/Loading Site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Facility Address *
                </label>
                <textarea
                  value={facilityForm.address}
                  onChange={(e) => setFacilityForm({ ...facilityForm, address: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-green-200 rounded-lg"
                  placeholder="Enter full address"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowAddFacility(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFacility ?
                    () => {
                      handleEditFacility(editingFacility.id, {
                        ...facilityForm,
                        type: selectedType
                      });
                      setShowAddFacility(false);
                    } :
                    handleAddFacility
                  }
                  disabled={!facilityForm.name || !facilityForm.address}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingFacility ? 'Update' : 'Add'} Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Country Group Component
const CountryGroup = ({
  country,
  countryCode,
  companies,
  onAddCompanyToCountry,
  onViewCompany,
  onRemoveCompany,
  onSendInvitation
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div
        className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={`https://flagcdn.com/w20/${countryCode}.png`}
            alt={`${country} flag`}
            className="w-5 h-5 rounded flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-gray-800 break-words">{country}</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                {companies.filter(c => c.verifications && c.verifications.length > 0).length} Verified
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Shield className="w-3 h-3 text-blue-600 flex-shrink-0" />
                {companies.filter(c => c.isRegistered).length} Registered
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <ShieldAlert className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                {companies.filter(c => !c.isRegistered).length} Unregistered
              </span>
              <span className="whitespace-nowrap">
                Total: {companies.length}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddCompanyToCountry(country, countryCode);
            }}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white">
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all ${company.verifications && company.verifications.length > 0
                  ? 'border-green-200 bg-green-50/50'
                  : company.isRegistered
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-yellow-200 bg-yellow-50/50'
                  }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <h5 className="font-medium text-gray-800 break-words">{company.name}</h5>
                      <div className="flex flex-wrap gap-2">
                        {company.verifications && company.verifications.length > 0 && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                            Verified ({company.verifications.length})
                          </div>
                        )}
                        {company.isRegistered && (
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            <Shield className="w-3 h-3 flex-shrink-0" />
                            Registered
                          </div>
                        )}
                        {!company.isRegistered && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            Unregistered
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1 break-words">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        {company.registrationNumber || 'Not provided'}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <User className="w-3 h-3 flex-shrink-0" />
                        Added: {company.addedDate}
                      </span>
                    </div>

                    {/* Display verification badges */}
                    {company.verifications && company.verifications.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {company.verifications.map((verification, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs min-w-0"
                            >
                              <ShieldCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span className="text-green-700 break-words">Verified by {verification.verifier}</span>
                              <span className="text-green-600 text-xs whitespace-nowrap">({verification.date})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!company.isRegistered && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-sm text-yellow-800 font-medium break-words">
                              This company is not registered on the system
                            </span>
                          </div>
                          <button
                            onClick={() => onSendInvitation(company)}
                            className="flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-900 whitespace-nowrap flex-shrink-0 mt-2 sm:mt-0"
                          >
                            <Mail className="w-4 h-4" />
                            Send Invitation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4 mt-3 sm:mt-0">
                    {(company.isRegistered || company.verifications?.length > 0) ? (
                      <button
                        onClick={() => onViewCompany(company)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    ) : null}
                    <button
                      onClick={() => onRemoveCompany(company.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Remove Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Invitation Modal Component - Made scrollable
const InvitationModal = ({ isOpen, onClose, company, onSendInvitation }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (company) {
      setEmail(company.email || '');
      setMessage(`Dear ${company.name},

We noticed that you are not yet registered on our Timber Export Platform. We invite you to join our network of verified timber exporters and importers.

Benefits of registering:
• Access to verified business partners
• Streamlined document management
• Enhanced credibility through verification
• Direct communication channels

Click the link below to register:
https://timber-export-platform.com/register

Best regards,
The Timber Export Platform Team`);
    }
  }, [company]);

  const handleSend = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));

    onSendInvitation(company.id, email);
    setIsSending(false);
    onClose();
    toast.success(`Invitation sent to ${email}`);
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-green-800 break-words">Send Invitation</h3>
            <p className="text-gray-600 mt-1 break-words">Invite {company.name} to register on the platform</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Company Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter official company email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Invitation Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="8"
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-blue-800 font-medium break-words">About Invitations:</p>
                  <ul className="text-blue-700 mt-1 space-y-1 list-disc list-inside">
                    <li className="break-words">The company will receive an email with registration instructions</li>
                    <li className="break-words">Once registered, they'll appear as "Registered" in your list</li>
                    <li className="break-words">They can later apply for third-party verification</li>
                    <li className="break-words">Verified companies show verification badges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !email}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Invitation Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 5: Importer/Consignee Companies (Updated)
const Section5 = ({ exporters, setExporters, allCompanies }) => {
  const [showAddExporter, setShowAddExporter] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { countries, loading } = useCountries();

  // Available verification companies
  const verificationCompanies = [
    "Global Verification Services",
    "Timber Industry Verifiers Ltd",
    "International Trade Assurance",
    "Quality Certification Group",
    "Sustainable Trade Partners",
    "Export Compliance International"
  ];

  // Group exporters by country
  const exportersByCountry = exporters.reduce((acc, exporter) => {
    if (!acc[exporter.country]) {
      acc[exporter.country] = [];
    }
    acc[exporter.country].push(exporter);
    return acc;
  }, {});

  // Get unique countries
  const exportCountries = Object.keys(exportersByCountry).sort();

  // Filtered countries based on search
  const filteredCountries = exportCountries.filter(country => {
    const companies = exportersByCountry[country];
    const matchesSearch = companies.some(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedStatus === 'all') return matchesSearch;
    if (selectedStatus === 'verified') return matchesSearch && companies.some(company => company.verifications?.length > 0);
    if (selectedStatus === 'registered') return matchesSearch && companies.some(company => company.isRegistered);
    if (selectedStatus === 'unregistered') return matchesSearch && companies.some(company => !company.isRegistered);
    
    return matchesSearch;
  });

  const handleAddExporter = (exporterData) => {
    // Find if company exists in system
    const existingCompany = allCompanies.find(company =>
      company.name.toLowerCase() === exporterData.name.toLowerCase() &&
      company.country === exporterData.country
    );

    let isRegistered = false;
    let verifications = [];
    let registrationNumber = '';
    let email = '';
    let companyId = null;

    if (existingCompany) {
      isRegistered = true;
      registrationNumber = existingCompany.registrationNumber || 'Not provided';
      email = existingCompany.email || '';
      companyId = existingCompany.id;
      
      // Randomly add some verifications (simulating some companies being verified)
      if (Math.random() > 0.5) {
        // Add 1-3 verifications
        const numVerifications = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numVerifications; i++) {
          const verifier = verificationCompanies[Math.floor(Math.random() * verificationCompanies.length)];
          verifications.push({
            verifier,
            date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            id: Date.now() + i
          });
        }
      }
    }

    const newExporter = {
      id: Date.now(),
      name: exporterData.name,
      country: exporterData.country,
      countryCode: exporterData.countryCode,
      email,
      registrationNumber,
      isRegistered,
      verifications,
      addedDate: new Date().toLocaleDateString(),
      companyId
    };

    setExporters([...exporters, newExporter]);

    if (verifications.length > 0) {
      toast.success(`${exporterData.name} added - Verified by ${verifications.length} verifier(s)`);
    } else if (isRegistered) {
      toast.success(`${exporterData.name} added - Registered on platform`);
    } else {
      toast.info(`${exporterData.name} added - Company not registered`);
    }

    setShowAddExporter(false);
  };

  const handleAddToCountry = (country, countryCode) => {
    setSelectedCountry(country);
    setSelectedCountryCode(countryCode);
    setShowAddExporter(true);
  };

  const handleRemoveExporter = (id) => {
    if (window.confirm('Are you sure you want to remove this company?')) {
      setExporters(exporters.filter(exporter => exporter.id !== id));
      toast.info('Company removed from list');
    }
  };

  const handleViewCompany = (company) => {
    if (company.isRegistered || company.verifications?.length > 0) {
      const companyDetails = allCompanies.find(c => c.id === company.companyId);
      if (companyDetails) {
        setViewingCompany({ ...companyDetails, ...company });
      }
    }
  };

  const handleSendInvitation = (company) => {
    setSelectedCompany(company);
    setShowInvitationModal(true);
  };

  const handleCompleteInvitation = (companyId, email) => {
    // Update company with invitation sent
    setExporters(exporters.map(exporter =>
      exporter.id === companyId
        ? { ...exporter, invitationSent: true, invitationDate: new Date().toLocaleDateString(), email }
        : exporter
    ));
  };

  // Stats calculation
  const stats = {
    total: exporters.length,
    verified: exporters.filter(e => e.verifications?.length > 0).length,
    registered: exporters.filter(e => e.isRegistered).length,
    unregistered: exporters.filter(e => !e.isRegistered).length,
    countries: exportCountries.length
  };

  // Helper function to get country code for a country name
  const getCountryCodeForName = (countryName) => {
    const country = countries.find(c => c.name === countryName);
    return country ? country.code : 'us'; // default to US if not found
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-green-100">
      <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        5. Importer/Consignee Companies
      </h2>

      <p className="text-gray-600 mb-6 break-words">
        Manage importer/consignee companies you work with. Companies are categorized by registration status and third-party verification.
      </p>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.countries}</p>
              <p className="text-sm text-gray-600">Countries</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">{stats.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">{stats.registered}</p>
              <p className="text-sm text-gray-600">Registered</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-800">{stats.unregistered}</p>
              <p className="text-sm text-gray-600">Unregistered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search companies by name or registration number..."
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="registered">Registered Only</option>
            <option value="unregistered">Unregistered Only</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => {
              setSelectedCountry('');
              setSelectedCountryCode('');
              setShowAddExporter(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Importer/Consignee
          </button>
        </div>
      </div>

      {/* Country Groups */}
      <div className="space-y-4">
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No companies found</p>
            <p className="text-sm text-gray-400 mt-2 break-words">
              {searchQuery ? 'Try a different search term' : 'Click "Add Importer/Consignee" to start'}
            </p>
          </div>
        ) : (
          filteredCountries.map(country => (
            <CountryGroup
              key={country}
              country={country}
              countryCode={getCountryCodeForName(country)}
              companies={exportersByCountry[country]}
              onAddCompanyToCountry={handleAddToCountry}
              onViewCompany={handleViewCompany}
              onRemoveCompany={handleRemoveExporter}
              onSendInvitation={handleSendInvitation}
            />
          ))
        )}
      </div>

      {/* Add Exporter Modal - Simplified to only name and country */}
      {showAddExporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-800 break-words">Add Importer/Consignee</h3>
              <button onClick={() => setShowAddExporter(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!selectedCountry && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Country *
                  </label>
                  {loading ? (
                    <div className="w-full px-4 py-3 border border-green-300 rounded-lg bg-gray-50">
                      <p className="text-gray-500">Loading countries...</p>
                    </div>
                  ) : (
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        const selected = countries.find(c => c.name === e.target.value);
                        if (selected) {
                          setSelectedCountry(selected.name);
                          setSelectedCountryCode(selected.code);
                        }
                      }}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {selectedCountry && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={`https://flagcdn.com/w20/${selectedCountryCode}.png`}
                      alt={`${selectedCountry} flag`}
                      className="w-4 h-4 rounded flex-shrink-0"
                    />
                    <span className="text-sm text-blue-800 font-medium break-words">
                      Adding to: {selectedCountry}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCountry('');
                      setSelectedCountryCode('');
                    }}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    Change
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter company name as registered"
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  id="companyNameInput"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-800 font-medium break-words">How it works:</p>
                    <ul className="text-blue-700 mt-1 space-y-1 list-disc list-inside">
                      <li className="break-words">Enter company name and country</li>
                      <li className="break-words">System will check if company exists in our database</li>
                      <li className="break-words">If registered, details will be automatically populated</li>
                      <li className="break-words">If unregistered, you can invite them to join</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowAddExporter(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const nameInput = document.getElementById('companyNameInput');

                    if (!nameInput.value.trim()) {
                      toast.error('Please enter company name');
                      return;
                    }

                    if (!selectedCountry && countries.length > 0) {
                      // If no country selected, use first available
                      const firstCountry = countries[0];
                      setSelectedCountry(firstCountry.name);
                      setSelectedCountryCode(firstCountry.code);
                    }

                    handleAddExporter({
                      name: nameInput.value.trim(),
                      country: selectedCountry || (countries[0]?.name || 'United States'),
                      countryCode: selectedCountryCode || (countries[0]?.code || 'us')
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Company
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={showInvitationModal}
        onClose={() => {
          setShowInvitationModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSendInvitation={handleCompleteInvitation}
      />

      {/* Company Details Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-green-800 break-words">
                    {viewingCompany.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {viewingCompany.verifications && viewingCompany.verifications.length > 0 ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" />
                        Verified ({viewingCompany.verifications.length} verifications)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm whitespace-nowrap">
                        <Shield className="w-3 h-3" />
                        Registered
                      </span>
                    )}
                    <span className="text-sm text-gray-600 break-words">
                      {viewingCompany.country} • Registration: {viewingCompany.registrationNumber}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCompany(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Company Information */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Company Name
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium break-words">{viewingCompany.name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Country
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/w20/${viewingCompany.countryCode || 'us'}.png`}
                          alt={`${viewingCompany.country} flag`}
                          className="w-5 h-5 rounded flex-shrink-0"
                        />
                        <p className="text-gray-800 font-medium break-words">{viewingCompany.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Registration Number
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium break-words">{viewingCompany.registrationNumber}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                        Status
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 font-medium flex items-center gap-2">
                          {viewingCompany.isRegistered ? (
                            <>
                              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="break-words">Registered on Platform</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                              <span className="break-words">Not Registered</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
                      Corporate Office Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-line break-words">{viewingCompany.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              {viewingCompany.verifications && viewingCompany.verifications.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Third-Party Verifications
                  </h4>
                  <div className="space-y-4">
                    {viewingCompany.verifications.map((verification, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-green-800 break-words">{verification.verifier}</h5>
                            <p className="text-sm text-green-700">Verified on: {verification.date}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          This verification indicates that {viewingCompany.name} has been vetted and approved by {verification.verifier} for compliance with industry standards and regulations.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {viewingCompany.documents && viewingCompany.documents.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewingCompany.documents.map((docGroup, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <h5 className="font-semibold text-green-700 mb-3 break-words">{docGroup.category}</h5>
                        <div className="space-y-2">
                          {docGroup.files.map((doc, docIndex) => (
                            <div
                              key={docIndex}
                              className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-medium break-words">{doc.name}</span>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{doc.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities & Staff */}
              {viewingCompany.facilities && viewingCompany.facilities.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Facilities & Staff
                  </h4>
                  <div className="space-y-6">
                    {viewingCompany.facilities.map((facility) => (
                      <div key={facility.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-green-800 text-lg break-words">{facility.name}</h5>
                            <p className="text-sm text-gray-600 mt-1 break-words">{facility.address}</p>
                            <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full whitespace-nowrap">
                              {facility.type === 'corporate' ? 'Corporate Facility' :
                                facility.type === 'production' ? 'Production/Forest Site' :
                                  'Processing/Loading Site'} • {facility.staff?.length || 0} staff
                            </span>
                          </div>
                        </div>

                        {facility.staff && facility.staff.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-medium text-gray-700 mb-3">Staff Members</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {facility.staff.map((staff) => (
                                <div
                                  key={staff.id}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-800 break-words">{staff.name}</p>
                                    <p className="text-sm text-gray-600 break-words">{staff.jobTitle}</p>
                                    <p className="text-xs text-gray-500 mt-1">Age: {staff.age}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200">
              <button
                onClick={() => setViewingCompany(null)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const CompanyDetails = () => {
  const mockAllCompanies = [
    {
      id: 1,
      name: "Timber Export Co.",
      country: "Canada",
      countryCode: "ca",
      address: "456 Timber Lane\nVancouver, BC V6B 1A1\nCanada",
      registrationNumber: "CAN-TIM-2024-001",
      taxId: "TIN-CA-123456",
      exportCertificate: "CA-EXPORT-2024-789",
      documents: [
        {
          category: "Registration Documents",
          files: [
            { name: "Business License 2024", date: "2024-01-15" },
            { name: "Articles of Incorporation", date: "2024-01-10" }
          ]
        },
        {
          category: "Licenses & Permits",
          files: [
            { name: "Export License", date: "2024-02-01" },
            { name: "Forestry Permit", date: "2024-01-20" }
          ]
        }
      ],
      facilities: [
        {
          id: 101,
          type: "corporate",
          name: "Head Office",
          address: "456 Timber Lane, Vancouver",
          staff: [
            { id: 1001, name: "John Smith", jobTitle: "CEO", age: 45 },
            { id: 1002, name: "Sarah Johnson", jobTitle: "Export Manager", age: 38 }
          ]
        },
        {
          id: 102,
          type: "production",
          name: "Sawmill Facility",
          address: "789 Forest Road, Whistler",
          staff: [
            { id: 1003, name: "Mike Wilson", jobTitle: "Production Manager", age: 42 },
            { id: 1004, name: "Lisa Chen", jobTitle: "Quality Control", age: 35 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Global Wood Products",
      country: "Sweden",
      countryCode: "se",
      address: "789 Pine Street\nStockholm, 111 29\nSweden",
      registrationNumber: "SWE-WOOD-2024-002",
      taxId: "TIN-SE-654321",
      exportCertificate: "SE-EXPORT-2024-456",
      documents: [
        {
          category: "Registration Documents",
          files: [
            { name: "Swedish Business Registration", date: "2024-02-10" },
            { name: "EU Export Certificate", date: "2024-02-15" }
          ]
        }
      ],
      facilities: [
        {
          id: 201,
          type: "corporate",
          name: "Stockholm HQ",
          address: "789 Pine Street, Stockholm",
          staff: [
            { id: 2001, name: "Anders Larsson", jobTitle: "Managing Director", age: 50 },
            { id: 2002, name: "Eva Nilsson", jobTitle: "International Sales", age: 41 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Pacific Lumber Inc.",
      country: "United States",
      countryCode: "us",
      address: "321 Redwood Ave\nSeattle, WA 98101\nUSA",
      registrationNumber: "US-PAC-2024-003",
      taxId: "TIN-US-987654",
      exportCertificate: "US-EXPORT-2024-123",
      documents: [
        {
          category: "Registration Documents",
          files: [
            { name: "Washington State Business License", date: "2024-01-05" },
            { name: "Federal EIN Certificate", date: "2024-01-10" }
          ]
        },
        {
          category: "Licenses & Permits",
          files: [
            { name: "Sustainable Forestry Certificate", date: "2024-02-20" },
            { name: "USDA Export License", date: "2024-02-15" }
          ]
        }
      ],
      facilities: [
        {
          id: 301,
          type: "corporate",
          name: "Seattle Headquarters",
          address: "321 Redwood Ave, Seattle",
          staff: [
            { id: 3001, name: "Robert Brown", jobTitle: "President", age: 52 },
            { id: 3002, name: "Maria Garcia", jobTitle: "Export Director", age: 44 }
          ]
        },
        {
          id: 302,
          type: "production",
          name: "Portland Mill",
          address: "555 Oak Street, Portland",
          staff: [
            { id: 3003, name: "David Wilson", jobTitle: "Plant Manager", age: 48 }
          ]
        },
        {
          id: 303,
          type: "processing",
          name: "Tacoma Loading Facility",
          address: "777 Harbor Drive, Tacoma",
          staff: [
            { id: 3004, name: "James Taylor", jobTitle: "Operations Manager", age: 39 }
          ]
        }
      ]
    }
  ];
  const [documents, setDocuments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [exporters, setExporters] = useState([]);

  // Load exporters from localStorage on mount
  useEffect(() => {
    const savedExporters = localStorage.getItem('companyExporters');
    if (savedExporters) {
      setExporters(JSON.parse(savedExporters));
    }
  }, []);

  // Save exporters to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('companyExporters', JSON.stringify(exporters));
  }, [exporters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 lg:p-6"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-4 lg:mb-6 pl-11 lg:pl-0 break-words">
        Company Details
      </h1>

      <div className="space-y-6">
        <Section1 />
        <Section2 documents={documents} setDocuments={setDocuments} />
        <Section3 contacts={contacts} setContacts={setContacts} />
        <Section4 facilities={facilities} setFacilities={setFacilities} />
        <Section5
          exporters={exporters}
          setExporters={setExporters}
          allCompanies={mockAllCompanies}
        />
      </div>
    </motion.div>
  );
};

export default CompanyDetails;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaFlag, FaFilePdf, FaUpload, FaTrash, FaEye } from "react-icons/fa";
import { useUserStore } from "../store/useUserStore";

const BioData = () => {
  const { user, demoData } = useUserStore();
  const [activeSection, setActiveSection] = useState("personal-info");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  if (!user) return null;

  // Get user data
  const userData = demoData.users[user.id];
  const isAgent = user.role === 'verifier' || user.role === 'freight agent';
  
  if (!isAgent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="text-center py-12">
          <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Bio Data Unavailable</h3>
          <p className="text-gray-500">
            Bio Data is only available for Verifiers and Freight Agents.
          </p>
        </div>
      </motion.div>
    );
  }

  // Initialize form data
  const personalInfo = userData?.bioData?.personalInfo || {};
  const documents = userData?.bioData?.documents || {};

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, you would update the user data in the store
    setIsEditing(false);
    // TODO: Implement update functionality
  };

  const handleUpload = (documentType, file) => {
    // In a real app, you would upload the file and update the user data
    console.log(`Uploading ${file.name} to ${documentType}`);
    // TODO: Implement upload functionality
  };

  const handleDelete = (documentType, index) => {
    // In a real app, you would delete the document from the user data
    console.log(`Deleting document ${index} from ${documentType}`);
    // TODO: Implement delete functionality
  };

  const renderPersonalInfo = () => {
    const data = isEditing ? formData.personalInfo || personalInfo : personalInfo;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={data.firstName || userData.basicInfo?.firstName || ""}
              onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={data.lastName || userData.basicInfo?.lastName || ""}
              onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center space-x-2">
              <FaEnvelope className="text-gray-400" />
              <span className="text-gray-700">{userData.basicInfo?.email}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="+1234567890"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <div className="flex items-center space-x-2">
              <FaBirthdayCake className="text-gray-400" />
              <input
                type="date"
                value={data.dateOfBirth || ""}
                onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <div className="flex items-center space-x-2">
              <FaFlag className="text-gray-400" />
              <input
                type="text"
                value={data.nationality || ""}
                onChange={(e) => handleInputChange("personalInfo", "nationality", e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter nationality"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <div className="flex items-start space-x-2">
            <FaMapMarkerAlt className="text-gray-400 mt-2" />
            <textarea
              value={data.address || ""}
              onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter full address"
            />
          </div>
        </div>
        
        {user.role === 'verifier' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Agency/Department ID</label>
            <input
              type="text"
              value={userData.basicInfo?.agencyDepartmentId || ""}
              onChange={(e) => handleInputChange("personalInfo", "agencyDepartmentId", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter agency/department ID"
            />
          </div>
        )}
        
        {user.role === 'freight agent' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Freight License Number</label>
            <input
              type="text"
              value={userData.basicInfo?.freightLicenseNumber || ""}
              onChange={(e) => handleInputChange("personalInfo", "freightLicenseNumber", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter freight license number"
            />
          </div>
        )}
      </div>
    );
  };

  const renderDocuments = () => {
    const documentTypes = {
      identification: "Identification Documents",
      professionalCertificates: "Professional Certificates",
      agencyAffiliation: "Agency Affiliation",
      freightLicense: "Freight License",
      insurance: "Insurance Documents",
      certifications: "Certifications",
      academicQualifications: "Academic Qualifications"
    };

    return (
      <div className="space-y-6">
        {Object.entries(documentTypes).map(([type, label]) => {
          if (!documents[type] && !isEditing) return null;
          
          const docList = documents[type] || [];
          
          return (
            <div key={type} className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">{label}</h4>
                {isEditing && (
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                      input.onchange = (e) => {
                        if (e.target.files[0]) {
                          handleUpload(type, e.target.files[0]);
                        }
                      };
                      input.click();
                    }}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FaUpload className="inline mr-2" />
                    Upload
                  </button>
                )}
              </div>
              
              {docList.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {docList.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaFilePdf className="text-red-500" />
                        <div>
                          <p className="font-medium text-gray-700">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <FaEye />
                        </a>
                        {isEditing && (
                          <button
                            onClick={() => handleDelete(type, index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bio Data</h2>
          <p className="text-gray-600">Manage your personal information and documents</p>
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Information
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveSection("personal-info")}
          className={`px-4 py-2 font-medium ${activeSection === "personal-info" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveSection("documents")}
          className={`px-4 py-2 font-medium ${activeSection === "documents" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-600 hover:text-gray-900"}`}
        >
          Documents
        </button>
      </div>
      
      {/* Content */}
      <div className="mt-6">
        {activeSection === "personal-info" && renderPersonalInfo()}
        {activeSection === "documents" && renderDocuments()}
      </div>
    </motion.div>
  );
};

export default BioData;
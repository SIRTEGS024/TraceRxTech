import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";
import {
  FaHistory,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDownload,
  FaEye,
  FaEdit,
  FaLock,
  FaLockOpen,
  FaClipboardCheck,
  FaShieldAlt,
  FaUpload,
  FaSave,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaIdCard,
  FaEnvelope,
  FaGlobe,
  FaBoxes,
  FaWeight,
  FaUser,
  FaBuilding,
  FaMapMarkerAlt,
  FaTree,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileAlt as FaFileGeneric,
  FaComment,
  FaCheckDouble,
  FaShippingFast,
  FaHourglassHalf,
  FaTrashAlt,
} from "react-icons/fa";

// Map imports
import { GoogleMap, Polygon, InfoWindow } from "@react-google-maps/api";
import { Layers, Info, X, MapPin } from "lucide-react";

// Helper to convert [lat, lng] array to {lat, lng} object
const convertToLatLng = (coord) => {
  if (Array.isArray(coord)) {
    return { lat: coord[0], lng: coord[1] };
  }
  return coord;
};

// Custom hook to check if Google Maps is loaded
const useGoogleMapsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };
    if (checkGoogleMaps()) return;
    const interval = setInterval(() => {
      if (checkGoogleMaps()) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return isLoaded;
};

// Map Component (view‑only)
const MapViewOnly = ({ coordinates = [], facilityAreas = [], facilityName = "", facilityAddress = "" }) => {
  const isLoaded = useGoogleMapsLoaded();
  const [selectedArea, setSelectedArea] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [map, setMap] = useState(null);

  const calculateCenter = () => {
    if (facilityAreas.length > 0 && facilityAreas[0].coordinates && facilityAreas[0].coordinates.length > 0) {
      const coord = convertToLatLng(facilityAreas[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    if (coordinates.length > 0 && coordinates[0].coordinates && coordinates[0].coordinates.length > 0) {
      const coord = convertToLatLng(coordinates[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    return { lat: 0, lng: 0 };
  };

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const getPolygonPaths = (coords) => coords.map(coord => convertToLatLng(coord));

  const handleAreaClick = (area, event) => {
    event.stop();
    setSelectedArea(area);
    setInfoWindowPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    setShowInfoWindow(true);
  };

  useEffect(() => {
    if (map && (facilityAreas.length > 0 || coordinates.length > 0)) {
      const bounds = new window.google.maps.LatLngBounds();
      facilityAreas.forEach(area => {
        area.coordinates?.forEach(coord => bounds.extend(convertToLatLng(coord)));
      });
      coordinates.forEach(plot => {
        plot.coordinates?.forEach(coord => bounds.extend(convertToLatLng(coord)));
      });
      map.fitBounds(bounds);
    }
  }, [map, facilityAreas, coordinates]);

  if (!isLoaded) {
    return (
      <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-30 border-2 border-blue-600 rounded"></div>
          <span className="text-sm text-gray-700">Facility Main Harvest Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 opacity-40 border-2 border-green-600 rounded"></div>
          <span className="text-sm text-gray-700">Harvest Areas</span>
        </div>
      </div>

      <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-300">
        {facilityAddress && (
          <div className="absolute top-4 right-4 z-20 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">{facilityName}</span>
              <span className="text-xs text-gray-500">| {facilityAddress}</span>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={calculateCenter()}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'satellite',
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Facility areas (blue) */}
          {facilityAreas.map((area, index) => (
            area.coordinates && area.coordinates.length >= 3 && (
              <Polygon
                key={`facility-${index}`}
                paths={getPolygonPaths(area.coordinates)}
                options={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  strokeColor: '#2563eb',
                  strokeWeight: 2,
                  strokeOpacity: 0.8,
                  zIndex: 1,
                  clickable: true
                }}
                onClick={(e) => handleAreaClick({
                  type: 'facility',
                  name: area.name || facilityName || 'Production Site',
                  hectares: area.hectares || 0,
                  points: area.coordinates.length
                }, e)}
              />
            )
          ))}

          {/* Harvest areas (green) */}
          {coordinates.map((plot) => (
            plot.coordinates && plot.coordinates.length >= 3 && (
              <Polygon
                key={plot.id || `plot-${Math.random()}`}
                paths={getPolygonPaths(plot.coordinates)}
                options={{
                  fillColor: '#22c55e',
                  fillOpacity: 0.4,
                  strokeColor: '#16a34a',
                  strokeWeight: 2,
                  zIndex: 2,
                  clickable: true
                }}
                onClick={(e) => handleAreaClick({
                  type: 'planting',
                  name: plot.name,
                  hectares: plot.hectares,
                  points: plot.coordinates.length,
                  coordinates: plot.coordinates
                }, e)}
              />
            )
          ))}

          {showInfoWindow && selectedArea && infoWindowPosition && (
            <InfoWindow
              position={infoWindowPosition}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedArea.name}</h4>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span> {selectedArea.type === 'facility' ? 'Production Site' : 'Harvest Area'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Area:</span> {selectedArea.hectares} hectares
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Points:</span> {selectedArea.points}
                  </p>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

const CurrentDueDiligence = () => {
  const { user, demoData, updateUser } = useUserStore();

  // Determine role
  const isVerifier = user?.role === "verifier" && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;
  const targetImporter = isVerifier
    ? demoData.users[companyId] // The importer the verifier is reviewing
    : user; // The importer themselves (if logged in as importer)

  // Build list of shipments from shipmentId array
  const [shipments, setShipments] = useState([]);
  const [currentRecords, setCurrentRecords] = useState({}); // map shipmentId -> due diligence data

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("start"); // 'start', 'payment', 'details', 'risk-assessment', 'risk-mitigation'
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewTab, setViewTab] = useState("importer-info");
  const [exporterRecordData, setExporterRecordData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Diligence statement form state
  const [diligenceForm, setDiligenceForm] = useState({
    name: "",
    function: "",
    eoriNumber: "",
    signature: null,
    url: null,
  });
  const [submittingDiligence, setSubmittingDiligence] = useState(false);

  // Form data for starting due diligence
  const [formData, setFormData] = useState({
    description: "",
    commonName: "",
    scientificName: "",
    hsCodes: [],
    containers: [], // array of { containerNumber, kilograms }
    customerName: "",
    customerAddress: "",
    customerEmail: "",
  });
  const [selectedHsCodes, setSelectedHsCodes] = useState([]);
  const [showHsCodeSelector, setShowHsCodeSelector] = useState(false);
  const [hsCodeSearch, setHsCodeSearch] = useState("");

  // Container management
  const [newContainer, setNewContainer] = useState({
    containerNumber: "",
    kilograms: "",
  });

  // Risk assessment state (only used by verifier)
  const [riskLevel, setRiskLevel] = useState("");
  const [assessmentDocs, setAssessmentDocs] = useState([]);
  const [showAssessmentDocModal, setShowAssessmentDocModal] = useState(false);
  const [assessmentDocDesc, setAssessmentDocDesc] = useState("");

  // Risk mitigation state (used by importer)
  const [riskMitigation, setRiskMitigation] = useState({
    highRiskSection: {
      additionalInfo: [],
      independentSurveys: [],
      otherMeasures: [],
      capacityBuilding: [],
    },
    policiesControls: {
      modelPractices: [],
      independentAudit: [],
    },
    decisionsReview: [],
  });
  const [showDocModal, setShowDocModal] = useState(false);
  const [docModalData, setDocModalData] = useState({
    section: "",
    subsection: "",
    description: "",
  });

  // Officer details (filled by verifier)
  const [officerName, setOfficerName] = useState("");
  const [officerIdCard, setOfficerIdCard] = useState(null);
  const [appointmentLetter, setAppointmentLetter] = useState(null);

  // Verifier‑only state – per‑article notes
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationNotesByArticle, setVerificationNotesByArticle] = useState({
    article7: [],
    article8: [],
    article9: [],
    article10: [],
    article11: [],
  });
  const [
    initialVerificationNotesByArticle,
    setInitialVerificationNotesByArticle,
  ] = useState({
    article7: [],
    article8: [],
    article9: [],
    article10: [],
    article11: [],
  });
  const [newNoteByArticle, setNewNoteByArticle] = useState({
    article7: "",
    article8: "",
    article9: "",
    article10: "",
    article11: "",
  });
  const [initialVerificationStatus, setInitialVerificationStatus] =
    useState(null);

  // ---------- Verification history for importer ----------
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Article titles for display
  const articleTitles = {
    "article-7": "Article 7 – Placing on the market by operators established in third countries",
    "article-8": "Article 8 – Due Diligence",
    "article-9": "Article 9 – Information Requirements",
    "article-10": "Article 10 – Risk Assessment",
    "article-11": "Article 11 – Risk Mitigation",
  };

  // Load shipments and current records
  useEffect(() => {
    if (targetImporter && targetImporter.id && targetImporter.shipmentId) {
      const shipmentList = targetImporter.shipmentId
        .map((ship) => {
          const shipmentData = demoData.shipments[ship.id];
          if (!shipmentData) return null;
          return {
            id: shipmentData.id,
            batchNumber: shipmentData.batchNumber,
            exporterId: shipmentData.exporterId,
            importerId: shipmentData.importerId,
            status: ship.status,
            productDescription: shipmentData.productDescription,
            totalKilograms: shipmentData.totalKilograms,
            containers: shipmentData.containers,
            forests: shipmentData.forests,
          };
        })
        .filter((s) => s !== null);

      const recordsMap = {};
      if (targetImporter.currentSupplierRecords) {
        targetImporter.currentSupplierRecords.forEach((record) => {
          recordsMap[record.batchNumber] = record;
        });
      }

      setShipments(shipmentList);
      setCurrentRecords(recordsMap);
    }
  }, [targetImporter, demoData]);

  // Load verifier's existing verification for this tab
  useEffect(() => {
    if (isVerifier && targetImporter && user) {
      const reports = user.verificationReports || [];
      const report = reports.find((r) => r.companyId === targetImporter.id);
      if (report) {
        const artFindings = report.findings?.find(
          (f) => f.tab === "current-due-diligence",
        );
        if (artFindings) {
          setVerificationStatus(artFindings.status || null);
          setInitialVerificationStatus(artFindings.status || null);
          const articles = artFindings.articles || [];
          const notesMap = {
            article7: [],
            article8: [],
            article9: [],
            article10: [],
            article11: [],
          };
          articles.forEach((art) => {
            const mappedKey = art.article.replace("-", "");
            if (notesMap[mappedKey]) {
              notesMap[mappedKey] = art.notes || [];
            }
          });
          setVerificationNotesByArticle(notesMap);
          setInitialVerificationNotesByArticle(
            JSON.parse(JSON.stringify(notesMap)),
          );
        }
      }
    }
  }, [isVerifier, targetImporter, user]);

  // ---------- Load verification history for importer (grouped by verifier) ----------
  useEffect(() => {
    if (!isVerifier && targetImporter) {
      const linkedVerifiers = targetImporter.linkedVerifiers || [];
      const grouped = {};

      linkedVerifiers.forEach((verifierLink) => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier || !verifier.verificationReports) return;

        const report = verifier.verificationReports.find(
          (r) => r.companyId === targetImporter.id,
        );
        if (report) {
          const artFindings = report.findings?.find(
            (f) => f.tab === "current-due-diligence",
          );
          if (artFindings && artFindings.articles && artFindings.articles.length > 0) {
            const verifierName = verifier.basicInfo?.firstName
              ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}`
              : verifier.basicInfo?.email || verifier.id;

            if (!grouped[verifier.id]) {
              grouped[verifier.id] = {
                verifierName,
                status: artFindings.status,
                articles: [],
                date: report.date,
              };
            }

            // Add articles
            artFindings.articles.forEach((article) => {
              if (article.notes && article.notes.length > 0) {
                grouped[verifier.id].articles.push({
                  article: article.article,
                  title: articleTitles[article.article] || article.article,
                  notes: article.notes,
                });
              }
            });
          }
        }
      });

      // Convert grouped object to array
      const historyArray = Object.values(grouped);
      setVerificationHistory(historyArray);
    }
  }, [isVerifier, targetImporter, demoData]);

  // Helper to check if all records are ready for verification
  const areAllRecordsReady = () => {
    if (shipments.length === 0) return true;
    return shipments.every((ship) => {
      const record = currentRecords[ship.batchNumber];
      if (!record) return false; // not started
      if (!record.risks?.riskAssessment) return false;
      if (
        record.risks.riskAssessment.riskLevel === "high risk" &&
        !record.risks?.riskMitigation
      )
        return false;
      return true;
    });
  };

  const hasVerificationChanges = () => {
    return (
      verificationStatus !== initialVerificationStatus ||
      JSON.stringify(verificationNotesByArticle) !==
        JSON.stringify(initialVerificationNotesByArticle)
    );
  };

  // Container management functions
  const handleAddContainer = () => {
    if (!newContainer.containerNumber.trim()) {
      toast.error("Please enter container number");
      return;
    }
    const kg = parseFloat(newContainer.kilograms);
    if (isNaN(kg) || kg <= 0) {
      toast.error("Please enter valid kilograms (positive number)");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      containers: [
        ...prev.containers,
        { containerNumber: newContainer.containerNumber.trim(), kilograms: kg },
      ],
    }));
    setNewContainer({ containerNumber: "", kilograms: "" });
  };

  const handleRemoveContainer = (index) => {
    setFormData((prev) => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index),
    }));
  };

  // Calculate total net mass from containers
  const calculateTotalNetMass = () => {
    return formData.containers.reduce((sum, c) => sum + (c.kilograms || 0), 0);
  };

  // Importer: start due diligence
  const handleStartDueDiligence = (shipment) => {
    setSelectedShipment(shipment);
    setModalMode("start");
    setCurrentStep(1);
    setFormData({
      description: shipment.productDescription || "",
      commonName: "",
      scientificName: "",
      hsCodes: [],
      containers: [],
      customerName: "",
      customerAddress: "",
      customerEmail: "",
    });
    setSelectedHsCodes([]);
    setShowModal(true);
  };

  const handleSaveImporterInfo = () => {
    if (
      !formData.description ||
      !formData.commonName ||
      !formData.scientificName ||
      !formData.hsCodes.length ||
      !formData.containers.length ||
      !formData.customerName ||
      !formData.customerAddress ||
      !formData.customerEmail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setModalMode("payment");
  };

  const calculateAmount = (netMassKg) =>
    Math.ceil((parseFloat(netMassKg) / 20000) * 10);

  const handlePayment = () => {
    const totalNetMass = calculateTotalNetMass();
    if (totalNetMass <= 0) {
      toast.error("Total net mass must be greater than 0");
      return;
    }
    setPaymentLoading(true);
    setTimeout(() => {
      const amount = calculateAmount(totalNetMass);
      const newRecord = {
        batchNumber: selectedShipment.batchNumber,
        supplierId: selectedShipment.exporterId,
        supplierName:
          demoData.users[selectedShipment.exporterId]?.basicInfo?.companyName ||
          "Unknown",
        supplierAddress:
          demoData.users[selectedShipment.exporterId]?.facilities?.find(
            (f) => f.type === "Corporate facility",
          )?.address || "",
        supplierEmail:
          demoData.users[selectedShipment.exporterId]?.basicInfo?.email || "",
        description: formData.description,
        commonName: formData.commonName,
        scientificName: formData.scientificName,
        hsCodes: formData.hsCodes,
        containers: formData.containers,
        netMassKg: totalNetMass,
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        customerEmail: formData.customerEmail,
        amount: amount,
        paymentStatus: true,
        status: "in-progress",
        risks: null,
        diligenceStatement: null,
      };

      const updatedImporter = { ...targetImporter };
      if (!updatedImporter.currentSupplierRecords)
        updatedImporter.currentSupplierRecords = [];
      const existingIndex = updatedImporter.currentSupplierRecords.findIndex(
        (r) => r.batchNumber === selectedShipment.batchNumber,
      );
      if (existingIndex >= 0) {
        updatedImporter.currentSupplierRecords[existingIndex] = newRecord;
      } else {
        updatedImporter.currentSupplierRecords.push(newRecord);
      }
      updateUser(targetImporter.id, updatedImporter);

      setCurrentRecords((prev) => ({
        ...prev,
        [selectedShipment.batchNumber]: newRecord,
      }));
      setPaymentLoading(false);
      setShowModal(false);
      setSelectedShipment(null);
      toast.success("Payment successful! Waiting for verifier to assess risk.");
    }, 2000);
  };

  // Importer: risk mitigation
  const handlePerformMitigation = (shipment, record) => {
    setSelectedShipment(shipment);
    setSelectedRecord(record);
    const existing = record.risks?.riskMitigation;
    if (existing) {
      setRiskMitigation(existing);
    } else {
      setRiskMitigation({
        highRiskSection: {
          additionalInfo: [],
          independentSurveys: [],
          otherMeasures: [],
          capacityBuilding: [],
        },
        policiesControls: {
          modelPractices: [],
          independentAudit: [],
        },
        decisionsReview: [],
      });
    }
    const officer = record.risks;
    if (officer) {
      setOfficerName(officer.officerName || "");
      setOfficerIdCard(officer.officerIdCard || null);
      setAppointmentLetter(officer.appointmentLetter || null);
    } else {
      setOfficerName("");
      setOfficerIdCard(null);
      setAppointmentLetter(null);
    }
    setModalMode("risk-mitigation");
    setShowModal(true);
  };

  const handleAddDoc = () => {
    if (!docModalData.description.trim()) {
      toast.error("Please enter a document description");
      return;
    }
    const newDoc = {
      name: docModalData.description,
      url: "dummy-document-url.pdf",
    };
    setRiskMitigation((prev) => {
      const updated = { ...prev };
      if (docModalData.section === "highRiskSection") {
        if (!updated.highRiskSection[docModalData.subsection])
          updated.highRiskSection[docModalData.subsection] = [];
        updated.highRiskSection[docModalData.subsection].push(newDoc);
      } else if (docModalData.section === "policiesControls") {
        if (docModalData.subsection === "modelPractices")
          updated.policiesControls.modelPractices.push(newDoc);
        else if (docModalData.subsection === "independentAudit")
          updated.policiesControls.independentAudit.push(newDoc);
      } else if (docModalData.section === "decisionsReview") {
        updated.decisionsReview.push(newDoc);
      }
      return updated;
    });
    setDocModalData({ section: "", subsection: "", description: "" });
    setShowDocModal(false);
    toast.success("Document added");
  };

  const removeMitigationDoc = (section, subsection, index) => {
    setRiskMitigation((prev) => {
      const updated = { ...prev };
      if (section === "highRiskSection") {
        updated.highRiskSection[subsection] = updated.highRiskSection[
          subsection
        ].filter((_, i) => i !== index);
      } else if (section === "policiesControls") {
        updated.policiesControls[subsection] = updated.policiesControls[
          subsection
        ].filter((_, i) => i !== index);
      } else if (section === "decisionsReview") {
        updated.decisionsReview = updated.decisionsReview.filter(
          (_, i) => i !== index,
        );
      }
      return updated;
    });
  };

  const handleSaveRiskMitigation = () => {
    if (!officerName.trim() || !officerIdCard || !appointmentLetter) {
      toast.error(
        "Officer details are missing. Please contact the verifier to complete risk assessment first.",
      );
      return;
    }

    const updatedImporter = { ...targetImporter };
    const recordIndex = updatedImporter.currentSupplierRecords.findIndex(
      (r) => r.batchNumber === selectedRecord.batchNumber,
    );
    if (recordIndex >= 0) {
      const record = updatedImporter.currentSupplierRecords[recordIndex];
      if (!record.risks) record.risks = {};
      record.risks.riskMitigation = riskMitigation;
      if (!record.risks.officerName) {
        record.risks.officerName = officerName;
        record.risks.officerIdCard = officerIdCard;
        record.risks.appointmentLetter = appointmentLetter;
      }
      record.status = "approved";
      updateUser(targetImporter.id, updatedImporter);

      const updatedShipmentIds = targetImporter.shipmentId.map((s) =>
        s.id === selectedShipment.id ? { ...s, status: "approved" } : s,
      );
      const finalImporter = {
        ...updatedImporter,
        shipmentId: updatedShipmentIds,
      };
      updateUser(targetImporter.id, finalImporter);

      const updatedRecord = {
        ...selectedRecord,
        risks: record.risks,
        status: "approved",
      };
      setCurrentRecords((prev) => ({
        ...prev,
        [selectedRecord.batchNumber]: updatedRecord,
      }));
      setShipments((prev) =>
        prev.map((s) =>
          s.id === selectedShipment.id ? { ...s, status: "approved" } : s,
        ),
      );
      toast.success("Risk mitigation complete. Due diligence finalized!");
      setShowModal(false);
      setSelectedShipment(null);
      setSelectedRecord(null);
    }
  };

  // Verifier: risk assessment
  const handleRiskAssessment = (shipment, record) => {
    setSelectedShipment(shipment);
    setSelectedRecord(record);
    const existing = record?.risks?.riskAssessment;
    if (existing) {
      setRiskLevel(existing.riskLevel || "");
      setAssessmentDocs(existing.assessmentDocs || []);
    } else {
      setRiskLevel("");
      setAssessmentDocs([]);
    }
    const officer = record?.risks;
    if (officer) {
      setOfficerName(officer.officerName || "");
      setOfficerIdCard(officer.officerIdCard || null);
      setAppointmentLetter(officer.appointmentLetter || null);
    } else {
      setOfficerName("");
      setOfficerIdCard(null);
      setAppointmentLetter(null);
    }
    setModalMode("risk-assessment");
    setShowModal(true);
  };

  const handleSaveRiskAssessmentForVerifier = () => {
    if (!riskLevel) {
      toast.error("Please select a risk level");
      return;
    }
    if (assessmentDocs.length === 0) {
      toast.error(
        "Please upload at least one document to support your risk assessment",
      );
      return;
    }
    if (!officerName.trim()) {
      toast.error("Please enter responsible officer name");
      return;
    }
    if (!officerIdCard) {
      toast.error("Please upload officer ID card");
      return;
    }
    if (!appointmentLetter) {
      toast.error("Please upload appointment letter");
      return;
    }

    const updatedImporter = { ...targetImporter };
    const recordIndex = updatedImporter.currentSupplierRecords.findIndex(
      (r) => r.batchNumber === selectedRecord.batchNumber,
    );
    if (recordIndex >= 0) {
      const record = updatedImporter.currentSupplierRecords[recordIndex];
      if (!record.risks) record.risks = {};
      record.risks.riskAssessment = { riskLevel, assessmentDocs };
      record.risks.officerName = officerName;
      record.risks.officerIdCard = officerIdCard;
      record.risks.appointmentLetter = appointmentLetter;

      let newStatus = "approved";
      if (riskLevel === "high risk") {
        newStatus = "awaiting-mitigation";
      }
      record.status = newStatus;

      updateUser(targetImporter.id, updatedImporter);

      const updatedRecord = {
        ...selectedRecord,
        risks: record.risks,
        status: newStatus,
        riskAssessmentDone: true,
        riskLevel,
      };
      setCurrentRecords((prev) => ({
        ...prev,
        [selectedRecord.batchNumber]: updatedRecord,
      }));
      toast.success("Risk assessment saved successfully");
      setShowModal(false);
      setSelectedShipment(null);
      setSelectedRecord(null);
    }
  };

  const handleViewDetails = (shipment, record) => {
    setSelectedShipment(shipment);
    setViewingRecord(record);
    setModalMode("details");
    setViewTab("importer-info");
    setShowModal(true);
    if (record.diligenceStatement) {
      setDiligenceForm({
        name: record.diligenceStatement.name || "",
        function: record.diligenceStatement.function || "",
        eoriNumber: record.diligenceStatement.eoriNumber || "",
        signature: record.diligenceStatement.signature || null,
        url: record.diligenceStatement.url || null,
      });
    } else {
      setDiligenceForm({
        name: "",
        function: "",
        eoriNumber: "",
        signature: null,
        url: null,
      });
    }
  };

  // Helper: render document box
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FaFilePdf className="text-red-500 flex-shrink-0" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-500 flex-shrink-0" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-500 flex-shrink-0" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaFileImage className="text-purple-500 flex-shrink-0" />;
      default:
        return <FaFileGeneric className="text-gray-500 flex-shrink-0" />;
    }
  };

  const renderDocumentBox = (doc, index) => (
    <div
      key={index}
      className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center space-x-3 min-w-0">
        {getFileIcon(doc.url)}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {doc.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{doc.url}</p>
        </div>
      </div>
      <div className="flex space-x-2 sm:ml-auto">
        <button
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          onClick={() =>
            toast.info(
              "Document viewing will be available in the final implementation",
            )
          }
          title="View document"
        >
          <FaEye size={14} />
        </button>
        <button
          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
          onClick={() =>
            toast.info(
              "Document download will be available in the final implementation",
            )
          }
          title="Download document"
        >
          <FaDownload size={14} />
        </button>
      </div>
    </div>
  );

  const renderImporterInfo = (record) => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
          <FaInfoCircle className="mr-2 flex-shrink-0" /> Trade Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0 col-span-1 sm:col-span-2">
            <p className="text-xs sm:text-sm text-gray-600">Description</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {record.description}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Common Name</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {record.commonName}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Scientific Name</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {record.scientificName}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
          <FaBoxes className="mr-2 flex-shrink-0" /> HS Codes
        </h3>
        <div className="space-y-2">
          {record.hsCodes.map((code, idx) => (
            <div
              key={idx}
              className="bg-white p-2 sm:p-3 rounded border border-blue-200"
            >
              <p className="text-xs sm:text-sm font-medium break-words">
                {code.code} - {code.name}
              </p>
              <p className="text-xs text-gray-600 break-words">
                Commodity: {code.commodity}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-sm sm:text-base">
          <FaShippingFast className="mr-2 flex-shrink-0" /> Container
          Information
        </h3>
        <div className="space-y-2">
          {record.containers?.map((container, idx) => (
            <div
              key={idx}
              className="bg-white p-2 sm:p-3 rounded border border-amber-200"
            >
              <p className="font-medium text-sm">
                Container: {container.containerNumber}
              </p>
              <p className="text-xs text-gray-600">
                Net Mass: {container.kilograms} kg
              </p>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-amber-200">
            <p className="font-medium text-sm">
              Total Net Mass: {record.netMassKg.toLocaleString()} kg
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base">
          <FaUser className="mr-2 flex-shrink-0" /> Customer Information
        </h3>
        <div className="space-y-2">
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Name:</span>{" "}
            {record.customerName}
          </p>
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Address:</span>{" "}
            {record.customerAddress}
          </p>
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Email:</span>{" "}
            {record.customerEmail}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-sm sm:text-base">
          <FaMoneyBillWave className="mr-2 flex-shrink-0" /> Payment Information
        </h3>
        <div className="space-y-2">
          <p className="text-sm sm:text-base">
            <span className="text-xs sm:text-sm text-gray-600">
              Amount Paid:
            </span>{" "}
            ${record.amount}
          </p>
          <div className="flex flex-col xs:flex-row xs:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Payment Status:
            </span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold w-fit ${record.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {record.paymentStatus ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div className="flex flex-col xs:flex-row xs:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Due Diligence Status:
            </span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                record.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : record.status === "awaiting-mitigation"
                    ? "bg-yellow-100 text-yellow-800"
                    : record.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {record.status === "approved"
                ? "Approved"
                : record.status === "awaiting-mitigation"
                  ? "Awaiting Mitigation"
                  : record.status === "in-progress"
                    ? "Waiting for Assessment"
                    : "Not Started"}
            </span>
          </div>
        </div>
      </div>

      {record.risks?.officerName && (
        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-sm sm:text-base">
            <FaIdCard className="mr-2 flex-shrink-0" /> Responsible Officer
          </h3>
          <div className="space-y-2">
            <p className="text-sm sm:text-base break-words">
              <span className="text-xs sm:text-sm text-gray-600">Name:</span>{" "}
              {record.risks.officerName}
            </p>
            {record.risks.officerIdCard && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  ID Card:
                </p>
                {renderDocumentBox(record.risks.officerIdCard, "officer-id")}
              </div>
            )}
            {record.risks.appointmentLetter && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Appointment Letter:
                </p>
                {renderDocumentBox(
                  record.risks.appointmentLetter,
                  "appointment",
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderExporterInfo = (record, shipment) => {
    const exporter = demoData.users[shipment.exporterId];
    if (!exporter)
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p>No exporter information available</p>
        </div>
      );

    // Extract facility areas from exporter's facilities (production/forest sites)
    const facilities = exporter.facilities?.filter(f => f.type === 'production/forest site') || [];
    const facilityAreas = facilities.flatMap(f => f.areas || []); // assuming each facility has areas

    // Extract harvest areas from shipment forests
    const harvestAreas = [];
    if (shipment.forests) {
      shipment.forests.forEach(forest => {
        if (forest.harvestAreas) {
          forest.harvestAreas.forEach(area => {
            harvestAreas.push({
              id: `${forest.forestId}-${area.name}`,
              name: area.name,
              hectares: area.hectares,
              coordinates: area.coordinates,
            });
          });
        }
      });
    }

    // Use the first facility for map display (or all)
    const primaryFacility = facilities[0];
    const facilityName = primaryFacility?.name || "";
    const facilityAddress = primaryFacility?.address || "";

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
            <FaInfoCircle className="mr-2 flex-shrink-0" /> Exporter Basic
            Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Company Name</p>
              <p className="font-medium">{exporter.basicInfo.companyName}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Country</p>
              <p className="font-medium">{exporter.basicInfo.country}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Email</p>
              <p className="font-medium">{exporter.basicInfo.email}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Registration No.
              </p>
              <p className="font-medium">{exporter.basicInfo.rcNumber}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-sm sm:text-base">
            <FaShippingFast className="mr-2 flex-shrink-0" /> Shipment Details
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Batch Number:</span>{" "}
              {shipment.batchNumber}
            </p>
            <p>
              <span className="font-medium">Product Description:</span>{" "}
              {shipment.productDescription}
            </p>
            {shipment.containers && shipment.containers.length > 0 && (
              <>
                <p>
                  <span className="font-medium">Containers:</span>{" "}
                  {shipment.containers.length}
                </p>
                {shipment.containers.map((c, idx) => (
                  <div
                    key={idx}
                    className="ml-4 p-2 bg-white rounded border border-amber-200"
                  >
                    <p>
                      <span className="font-medium">Container:</span>{" "}
                      {c.containerNumber}
                    </p>
                    <p>
                      <span className="font-medium">Kilograms:</span>{" "}
                      {c.kilograms}
                    </p>
                    {c.packingList && (
                      <div>
                        <span className="font-medium">Packing List:</span>{" "}
                        {renderDocumentBox(c.packingList, `packing-${idx}`)}
                      </div>
                    )}
                  </div>
                ))}
                <p>
                  <span className="font-medium">Total Kilograms:</span>{" "}
                  {shipment.totalKilograms} kg
                </p>
              </>
            )}
          </div>
        </div>

        {shipment.forests && shipment.forests.length > 0 && (
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
              <FaTree className="mr-2 flex-shrink-0" /> Forest Information
            </h3>
            {shipment.forests.map((forest, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <p>
                  <span className="font-medium">Forest ID:</span>{" "}
                  {forest.forestId}
                </p>
                <p>
                  <span className="font-medium">Selected Products:</span>{" "}
                  {forest.selectedProducts
                    ?.map((p) => `${p.name} (${p.code})`)
                    .join(", ") || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Quantity:</span> {forest.quantity}
                </p>

                {forest.harvestAreas && forest.harvestAreas.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium">Harvest Areas:</p>
                    {forest.harvestAreas.map((area, areaIdx) => (
                      <div
                        key={areaIdx}
                        className="ml-4 mt-2 p-2 bg-white rounded border border-green-200"
                      >
                        <p>
                          <span className="font-medium">Name:</span> {area.name}
                        </p>
                        <p>
                          <span className="font-medium">Hectares:</span>{" "}
                          {area.hectares}
                        </p>
                        {area.coordinates && area.coordinates.length > 0 && (
                          <div className="mt-1">
                            <p className="font-medium text-xs">Coordinates:</p>
                            <div className="text-xs font-mono text-gray-600 max-h-32 overflow-y-auto">
                              {area.coordinates.map((coord, coordIdx) => (
                                <div key={coordIdx}>
                                  {coordIdx + 1}.{" "}
                                  {Array.isArray(coord)
                                    ? `${coord[0]}, ${coord[1]}`
                                    : `${coord.lat}, ${coord.lng}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Map View - added here */}
        {(facilityAreas.length > 0 || harvestAreas.length > 0) && (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
              <FaMapMarkerAlt className="mr-2 flex-shrink-0" /> Geographic View
            </h3>
            <MapViewOnly
              coordinates={harvestAreas}
              facilityAreas={facilityAreas}
              facilityName={facilityName}
              facilityAddress={facilityAddress}
            />
          </div>
        )}
      </div>
    );
  };

  const renderRiskAssessment = (risks) => {
    if (!risks?.riskAssessment) return null;
    return (
      <div className="space-y-4 sm:space-y-6">
        <div
          className={`p-3 sm:p-4 rounded-lg ${
            risks.riskAssessment.riskLevel === "high risk"
              ? "bg-red-50"
              : risks.riskAssessment.riskLevel === "low risk"
                ? "bg-green-50"
                : "bg-yellow-50"
          }`}
        >
          <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
            <FaExclamationTriangle className="mr-2 flex-shrink-0" /> Risk Level
          </h3>
          <p
            className={`text-base sm:text-lg font-bold break-words ${
              risks.riskAssessment.riskLevel === "high risk"
                ? "text-red-800"
                : risks.riskAssessment.riskLevel === "low risk"
                  ? "text-green-800"
                  : "text-yellow-800"
            }`}
          >
            {risks.riskAssessment.riskLevel.charAt(0).toUpperCase() +
              risks.riskAssessment.riskLevel.slice(1)}
          </p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
            <FaFileAlt className="mr-2 flex-shrink-0" /> Supporting Documents
          </h3>
          <div className="space-y-2">
            {risks.riskAssessment.assessmentDocs?.map((doc, idx) =>
              renderDocumentBox(doc, idx),
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRiskMitigation = (risks) => {
    if (!risks?.riskMitigation) return null;
    const mitigation = risks.riskMitigation;
    return (
      <div className="space-y-4 sm:space-y-6">
        {mitigation.highRiskSection && (
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3 text-sm sm:text-base">
              High Risk Section
            </h3>
            {mitigation.highRiskSection.additionalInfo?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Additional Information
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.additionalInfo.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
            {mitigation.highRiskSection.independentSurveys?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Independent Surveys/Audits
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.independentSurveys.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
            {mitigation.highRiskSection.otherMeasures?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Other Measures
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.otherMeasures.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
            {mitigation.highRiskSection.capacityBuilding?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Capacity Building & Investments
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.capacityBuilding.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {mitigation.policiesControls && (
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">
              Policies, Controls & Procedures
            </h3>
            {mitigation.policiesControls.modelPractices?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Model Risk Management Practices
                </p>
                <div className="space-y-2">
                  {mitigation.policiesControls.modelPractices.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
            {mitigation.policiesControls.independentAudit?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">
                  Independent Audit Function
                </p>
                <div className="space-y-2">
                  {mitigation.policiesControls.independentAudit.map((d, i) =>
                    renderDocumentBox(d, i),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {mitigation.decisionsReview?.length > 0 && (
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              Decisions on Risk Mitigation Procedures
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Reviewed at least on an annual basis
            </p>
            <div className="space-y-2">
              {mitigation.decisionsReview.map((d, i) =>
                renderDocumentBox(d, i),
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== DUE DILIGENCE STATEMENT RENDERER (with coordinates) ==========
  const renderDiligenceStatement = (record, shipment, diligenceData) => {
    const importer = targetImporter;
    const importerName = importer?.basicInfo?.companyName || "Importer Name";
    const importerAddress =
      importer?.facilities?.find((f) => f.type === "Corporate facility")
        ?.address || "Importer Address";
    const eoriNumber = diligenceData?.eoriNumber || "Not provided";
    const signeeName = diligenceData?.name || "";
    const signeeFunction = diligenceData?.function || "";
    const signatureUrl = diligenceData?.signature || "";

    const hsCodesList =
      record.hsCodes?.map((h) => `${h.code} (${h.name})`).join(", ") ||
      "Not specified";
    const products =
      record.scientificName && record.commonName
        ? `${record.commonName} (${record.scientificName})`
        : "Various commodities";
    const netMass = record.netMassKg?.toLocaleString() || "N/A";
    const productionLocation = record.supplierAddress || "Unknown";
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build geolocation string from harvest areas
    let geolocation = "Not available";
    if (shipment?.forests && shipment.forests.length > 0) {
      const harvestAreas = shipment.forests.flatMap((f) => f.harvestAreas || []);
      if (harvestAreas.length > 0) {
        const areasList = harvestAreas
          .map((area) => {
            const coordsList = (area.coordinates || [])
              .map((coord) =>
                Array.isArray(coord)
                  ? `${coord[0]},${coord[1]}`
                  : `${coord.lat},${coord.lng}`
              )
              .join("; ");
            return `${area.name} (${area.hectares} ha) - Coordinates: ${coordsList}`;
          })
          .join(" | ");
        geolocation = areasList;
      }
    }

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-800">
            DUE DILIGENCE STATEMENT
          </h2>
          <div className="h-1 w-32 bg-green-600 mx-auto mt-2"></div>
        </div>

        <div className="space-y-6 text-sm">
          <p>
            <strong>1.</strong> <strong>{importerName}</strong>, of{" "}
            <strong>{importerAddress}</strong> and, in the event of our relevant
            commodities and relevant products entering or leaving the EU market,
            the Economic Operators Registration and Identification (EORI) number
            of <strong>{importerName}</strong> is <strong>{eoriNumber}</strong>{" "}
            in accordance with Article 9 of Regulation (EU) No 952/2013.
          </p>

          <p>
            <strong>2.</strong> Harmonised System code, free-text description,
            including the trade name as well as, where applicable, the full
            scientific name, and quantity of the relevant product that the
            operator intends to place on the market or export:
            <br />
            <strong>HS Codes:</strong> {hsCodesList}
            <br />
            <strong>Trade Name/Description:</strong> {record.description}
            <br />
            <strong>Scientific Name:</strong> {record.scientificName}
            <br />
            <strong>Common Name:</strong> {record.commonName}
            <br />
            <strong>Net Mass:</strong> {netMass} kg
          </p>

          <p>
            <strong>3.</strong> Country of production:{" "}
            <strong>{productionLocation}</strong>
            <br />
            Geolocation of all plots of land where the relevant commodities were
            produced: <strong>{geolocation}</strong>
          </p>

          <p>
            <strong>4.</strong> Reference number of this due diligence
            statement (if applicable): <strong>{record.batchNumber}</strong>
          </p>

          <p>
            <strong>5.</strong> By submitting this due diligence statement the
            operator confirms that due diligence in accordance with Regulation
            (EU) 2023/1115 was carried out and that no or only a negligible risk
            was found that the relevant products do not comply with Article 3,
            point (a) or (b), of that Regulation.
          </p>

          <div className="mt-8 pt-4">
            <p>
              <strong>6. Signature</strong>
            </p>
            <p className="mt-2">
              Signed for and on behalf of: <strong>{importerName}</strong>
              <br />
              Date: <strong>{currentDate}</strong>
              <br />
              Name and function: <strong>{signeeName}</strong>{" "}
              {signeeFunction && `- ${signeeFunction}`}
              <br />
              Signature:{" "}
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="h-12 mt-1 border rounded p-1"
                />
              ) : (
                <span className="text-gray-500">Not provided</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Handler to save diligence statement
  const handleSaveDiligenceStatement = () => {
    if (!viewingRecord) return;
    if (
      !diligenceForm.name.trim() ||
      !diligenceForm.function.trim() ||
      !diligenceForm.eoriNumber.trim()
    ) {
      toast.error("Please fill in all fields (Name, Function, EORI Number)");
      return;
    }
    if (!diligenceForm.signature) {
      setDiligenceForm((prev) => ({
        ...prev,
        signature: "https://cloud-storage.com/demo/signature.png",
        url: "https://cloud-storage.com/demo/signature.png",
      }));
    }

    const statementData = {
      name: diligenceForm.name,
      function: diligenceForm.function,
      eoriNumber: diligenceForm.eoriNumber,
      signature:
        diligenceForm.signature ||
        "https://cloud-storage.com/demo/signature.png",
      url:
        diligenceForm.url || "https://cloud-storage.com/demo/signature.png",
    };

    const updatedImporter = { ...targetImporter };
    const recordIndex = updatedImporter.currentSupplierRecords.findIndex(
      (r) => r.batchNumber === viewingRecord.batchNumber,
    );
    if (recordIndex >= 0) {
      updatedImporter.currentSupplierRecords[recordIndex].diligenceStatement =
        statementData;
      updateUser(targetImporter.id, updatedImporter);

      const updatedRecords = { ...currentRecords };
      updatedRecords[viewingRecord.batchNumber] = {
        ...viewingRecord,
        diligenceStatement: statementData,
      };
      setCurrentRecords(updatedRecords);
      setViewingRecord({ ...viewingRecord, diligenceStatement: statementData });
      toast.success("Due Diligence Statement saved successfully");
    }
  };

  const VerifierRiskAssessmentModal = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 flex items-start">
          <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
          <span>
            Please assess the risk level of this trade and provide supporting
            documentation. Officer details are required.
          </span>
        </p>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Risk Level *
        </label>
        <div className="space-y-2">
          {["low risk", "negligible risk", "high risk"].map((level) => (
            <label
              key={level}
              className="flex items-start space-x-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="riskLevel"
                value={level}
                checked={riskLevel === level}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {level
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Responsible Officer Information *
        </label>
        <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
          <input
            type="text"
            placeholder="Full Name of Responsible Officer"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                setOfficerIdCard({
                  name: "Officer ID Card",
                  url: "dummy-id-card.pdf",
                });
                toast.info("Officer ID card added (dummy)");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
            >
              <FaUpload className="mr-2" size={12} /> Upload ID Card
            </button>
            <button
              onClick={() => {
                setAppointmentLetter({
                  name: "Appointment Letter",
                  url: "dummy-appointment.pdf",
                });
                toast.info("Appointment letter added (dummy)");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
            >
              <FaUpload className="mr-2" size={12} /> Upload Appointment Letter
            </button>
          </div>
          {officerIdCard && appointmentLetter && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Officer information saved successfully
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            Supporting Documents *
          </label>
          <button
            onClick={() => setShowAssessmentDocModal(true)}
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <FaUpload className="mr-2" size={12} /> Add Document
          </button>
        </div>
        <div className="space-y-2">
          {assessmentDocs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {getFileIcon(doc.url)}
                <span className="text-xs sm:text-sm font-medium break-words">
                  {doc.name}
                </span>
              </div>
              <button
                onClick={() =>
                  setAssessmentDocs(assessmentDocs.filter((_, i) => i !== idx))
                }
                className="text-red-600 hover:text-red-800 self-end sm:self-center"
              >
                <FaTimes />
              </button>
            </div>
          ))}
          {assessmentDocs.length === 0 && (
            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
              No documents added yet
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRiskAssessmentForVerifier}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          Save Risk Assessment
        </button>
      </div>
    </div>
  );

  const ImporterRiskMitigationModal = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-red-800 flex items-start">
          <FaExclamationTriangle className="inline mr-2 flex-shrink-0 mt-0.5" />
          <span>
            High risk trade detected. Please complete all required risk
            mitigation steps.
          </span>
        </p>
      </div>
      <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-3">
          Responsible Officer
        </h3>
        <p className="text-sm mb-2">
          <span className="font-medium">Name:</span> {officerName}
        </p>
        {officerIdCard && (
          <div className="mb-2">
            <p className="text-sm font-medium mb-1">ID Card:</p>
            {renderDocumentBox(officerIdCard, "officer-id")}
          </div>
        )}
        {appointmentLetter && (
          <div>
            <p className="text-sm font-medium mb-1">Appointment Letter:</p>
            {renderDocumentBox(appointmentLetter, "appointment")}
          </div>
        )}
      </div>
      <div className="border border-red-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-3 sm:mb-4">
          High Risk Section
        </h3>
        <div className="space-y-4">
          {[
            "additionalInfo",
            "independentSurveys",
            "otherMeasures",
            "capacityBuilding",
          ].map((sub) => (
            <div key={sub}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {sub === "additionalInfo" &&
                    "(a) Requiring additional information, data or documents"}
                  {sub === "independentSurveys" &&
                    "(b) Carrying out independent surveys or audits"}
                  {sub === "otherMeasures" &&
                    "(c) Taking other measures pertaining to information requirements"}
                  {sub === "capacityBuilding" &&
                    "(d) Capacity building and investments"}
                </label>
                <button
                  onClick={() => {
                    setDocModalData({
                      section: "highRiskSection",
                      subsection: sub,
                      description: "",
                    });
                    setShowDocModal(true);
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700"
                >
                  Add Document
                </button>
              </div>
              <div className="space-y-2">
                {riskMitigation.highRiskSection[sub]?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(doc.url)}
                      <span className="text-xs sm:text-sm font-medium break-words">
                        {doc.name}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        removeMitigationDoc("highRiskSection", sub, idx)
                      }
                      className="text-red-600 hover:text-red-800 self-end sm:self-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4">
          Policies, Controls and Procedures
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                (a) Model risk management practices, reporting, record-keeping
              </label>
              <button
                onClick={() => {
                  setDocModalData({
                    section: "policiesControls",
                    subsection: "modelPractices",
                    description: "",
                  });
                  setShowDocModal(true);
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700"
              >
                Add Document
              </button>
            </div>
            <div className="space-y-2">
              {riskMitigation.policiesControls.modelPractices.map(
                (doc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(doc.url)}
                      <span className="text-xs sm:text-sm font-medium break-words">
                        {doc.name}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        removeMitigationDoc(
                          "policiesControls",
                          "modelPractices",
                          idx,
                        )
                      }
                      className="text-red-600 hover:text-red-800 self-end sm:self-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                (b) Independent audit function
              </label>
              <button
                onClick={() => {
                  setDocModalData({
                    section: "policiesControls",
                    subsection: "independentAudit",
                    description: "",
                  });
                  setShowDocModal(true);
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700"
              >
                Add Document
              </button>
            </div>
            <div className="space-y-2">
              {riskMitigation.policiesControls.independentAudit?.map(
                (doc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(doc.url)}
                      <span className="text-xs sm:text-sm font-medium break-words">
                        {doc.name}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        removeMitigationDoc(
                          "policiesControls",
                          "independentAudit",
                          idx,
                        )
                      }
                      className="text-red-600 hover:text-red-800 self-end sm:self-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border border-green-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-green-800">
            Decisions on Risk Mitigation Procedures
          </h3>
          <button
            onClick={() => {
              setDocModalData({
                section: "decisionsReview",
                subsection: "",
                description: "",
              });
              setShowDocModal(true);
            }}
            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700"
          >
            Add Document
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          Reviewed at least on an annual basis
        </p>
        <div className="space-y-2">
          {riskMitigation.decisionsReview?.map((doc, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {getFileIcon(doc.url)}
                <span className="text-xs sm:text-sm font-medium break-words">
                  {doc.name}
                </span>
              </div>
              <button
                onClick={() => removeMitigationDoc("decisionsReview", null, idx)}
                className="text-red-600 hover:text-red-800 self-end sm:self-center"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRiskMitigation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
        >
          <FaSave className="mr-2 flex-shrink-0" /> Complete Mitigation
        </button>
      </div>
    </div>
  );

  // Verifier notes handlers
  const handleAddNote = (article) => {
    const note = newNoteByArticle[article];
    if (note && note.trim()) {
      setVerificationNotesByArticle((prev) => ({
        ...prev,
        [article]: [...(prev[article] || []), note.trim()],
      }));
      setNewNoteByArticle((prev) => ({ ...prev, [article]: "" }));
    }
  };
  const handleRemoveNote = (article, index) => {
    setVerificationNotesByArticle((prev) => ({
      ...prev,
      [article]: prev[article].filter((_, i) => i !== index),
    }));
  };
  const handleSaveVerification = () => {
    if (!targetImporter || !user) return;
    const verifierId = user.id;
    const baseVerifier = demoData.users[verifierId];
    if (!baseVerifier) return;
    let reports = [...(baseVerifier.verificationReports || [])];
    let reportIndex = reports.findIndex(
      (r) => r.companyId === targetImporter.id,
    );
    const articles = [];
    for (const [articleKey, notes] of Object.entries(
      verificationNotesByArticle,
    )) {
      if (notes && notes.length > 0) {
        const storeKey = articleKey.replace("article", "article-");
        articles.push({ article: storeKey, notes });
      }
    }
    const artFindings = {
      tab: "current-due-diligence",
      status: verificationStatus || "non-compliant",
      articles,
    };
    if (reportIndex >= 0) {
      const report = reports[reportIndex];
      let findings = report.findings || [];
      const existingIdx = findings.findIndex(
        (f) => f.tab === "current-due-diligence",
      );
      if (existingIdx >= 0) findings[existingIdx] = artFindings;
      else findings.push(artFindings);
      reports[reportIndex] = { ...report, findings };
    } else {
      const newReport = {
        id: `ver-report-${Date.now()}`,
        companyId: targetImporter.id,
        companyType: targetImporter.role,
        date: new Date().toISOString().split("T")[0],
        type: "compliance audit",
        status: "pending",
        findings: [artFindings],
      };
      reports.push(newReport);
    }
    const updatedVerifier = {
      ...baseVerifier,
      verificationReports: reports,
      loggedInAs: user.loggedInAs,
    };
    updateUser(verifierId, updatedVerifier);
    setInitialVerificationStatus(verificationStatus);
    setInitialVerificationNotesByArticle(
      JSON.parse(JSON.stringify(verificationNotesByArticle)),
    );
    toast.success("Verification saved successfully!");
  };

  const articles = [
    {
      id: "article7",
      title:
        "Article 7 – Placing on the market by operators established in third countries",
    },
    { id: "article8", title: "Article 8 – Due Diligence" },
    { id: "article9", title: "Article 9 – Information Requirements" },
    { id: "article10", title: "Article 10 – Risk Assessment" },
    { id: "article11", title: "Article 11 – Risk Mitigation" },
  ];

  const handleHsCodeSelect = (commodity, product) => {
    const existing = selectedHsCodes.find(
      (h) => h.commodity === commodity && h.code === product.code,
    );
    if (existing) {
      setSelectedHsCodes(
        selectedHsCodes.filter(
          (h) => !(h.commodity === commodity && h.code === product.code),
        ),
      );
    } else {
      setSelectedHsCodes([
        ...selectedHsCodes,
        { commodity, code: product.code, name: product.name },
      ]);
    }
  };
  const handleAddHsCodes = () => {
    setFormData({ ...formData, hsCodes: selectedHsCodes });
    setShowHsCodeSelector(false);
  };

  const handleAddOfficerInfo = () => {
    if (!officerName.trim()) {
      toast.error("Please enter officer name");
      return;
    }
    setOfficerIdCard({ name: "Officer ID Card", url: "dummy-id-card.pdf" });
    setAppointmentLetter({
      name: "Appointment Letter",
      url: "dummy-appointment.pdf",
    });
    toast.success("Officer information saved");
  };
  const handleRemoveAssessmentDoc = (index) => {
    setAssessmentDocs(assessmentDocs.filter((_, i) => i !== index));
  };

  if (!targetImporter) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading company data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">
          Current Due Diligence (Articles 7,8,9,10,11)
        </h1>
        {!isVerifier && verificationHistory.length > 0 && (
          <button
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors"
          >
            <FaComment className="w-4 h-4" />
            <span className="text-sm font-medium">
              {verificationHistory.length} Verifier
              {verificationHistory.length > 1 ? "s" : ""} left notes
            </span>
          </button>
        )}
      </div>

      {isVerifier && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Verification – Current Due Diligence (Articles 7‑11)
            </h2>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                verificationStatus === "compliant"
                  ? "bg-green-100 text-green-800"
                  : verificationStatus === "non-compliant"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {verificationStatus
                ? verificationStatus.replace("-", " ")
                : "Not set"}
            </span>
          </div>
          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="compliant"
                checked={verificationStatus === "compliant"}
                onChange={() => setVerificationStatus("compliant")}
                className="text-green-600"
              />
              <span>Compliant</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="non-compliant"
                checked={verificationStatus === "non-compliant"}
                onChange={() => setVerificationStatus("non-compliant")}
                className="text-red-600"
              />
              <span>Non‑compliant</span>
            </label>
          </div>
          {articles.map((article) => (
            <div
              key={article.id}
              className="mb-6 border-t pt-4 first:border-t-0 first:pt-0"
            >
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                {article.title}
              </h3>
              {verificationNotesByArticle[article.id]?.length > 0 && (
                <div className="mb-3 space-y-2">
                  {verificationNotesByArticle[article.id].map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <FaComment className="text-gray-400 mt-0.5" size={14} />
                      <span className="flex-1 text-gray-700">{note}</span>
                      <button
                        onClick={() => handleRemoveNote(article.id, idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteByArticle[article.id]}
                  onChange={(e) =>
                    setNewNoteByArticle((prev) => ({
                      ...prev,
                      [article.id]: e.target.value,
                    }))
                  }
                  placeholder={`Add a note for ${article.title}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => handleAddNote(article.id)}
                  disabled={!newNoteByArticle[article.id]?.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveVerification}
              disabled={!areAllRecordsReady() || !hasVerificationChanges()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!areAllRecordsReady() || !hasVerificationChanges() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              <FaSave size={16} /> Save Verification
            </button>
          </div>
          {!areAllRecordsReady() && shipments.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Verification can only be saved after all shipments have completed
              due diligence.
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            Current Shipments
          </h2>
          <p className="text-sm text-gray-500">
            These are the active shipments that require due diligence.
          </p>
        </div>
        {shipments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FaShippingFast className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No current shipments found.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {shipments.map((shipment) => {
              const record = currentRecords[shipment.batchNumber];
              const recordExists = !!record;
              const paymentStatus = record?.paymentStatus || false;
              const status =
                record?.status ||
                (shipment.status === "approved" ? "approved" : "not-started");
              const riskAssessmentDone = record?.risks?.riskAssessment
                ? true
                : false;
              const riskMitigationDone = record?.risks?.riskMitigation
                ? true
                : false;
              const riskLevel =
                record?.risks?.riskAssessment?.riskLevel || null;

              let button = null;
              if (!isVerifier) {
                // Importer view
                if (!recordExists) {
                  button = (
                    <button
                      onClick={() => handleStartDueDiligence(shipment)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaPlus className="mr-2" size={14} /> Start
                    </button>
                  );
                } else if (paymentStatus && status === "in-progress") {
                  button = (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                      <FaHourglassHalf className="w-4 h-4" />
                      <span className="text-sm">Waiting for Assessment</span>
                    </div>
                  );
                } else if (status === "awaiting-mitigation") {
                  button = (
                    <button
                      onClick={() => handlePerformMitigation(shipment, record)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaShieldAlt className="mr-2" size={14} /> Perform
                      Mitigation
                    </button>
                  );
                } else if (status === "approved") {
                  button = (
                    <button
                      onClick={() => handleViewDetails(shipment, record)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaEye className="mr-2" size={14} /> View Details
                    </button>
                  );
                }
              } else {
                // Verifier view
                if (!recordExists) {
                  button = (
                    <span className="text-gray-400 text-sm">
                      Awaiting Importer
                    </span>
                  );
                } else if (!riskAssessmentDone) {
                  button = (
                    <button
                      onClick={() => handleRiskAssessment(shipment, record)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaShieldAlt className="mr-2" size={14} /> Assess Risk
                    </button>
                  );
                } else {
                  button = (
                    <button
                      onClick={() => handleViewDetails(shipment, record)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaEye className="mr-2" size={14} /> View Details
                    </button>
                  );
                }
              }

              return (
                <motion.div
                  key={shipment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 break-words">
                        Batch: {shipment.batchNumber}
                      </p>
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                        {demoData.users[shipment.exporterId]?.basicInfo
                          ?.companyName || "Unknown"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                        {shipment.productDescription}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status === "awaiting-mitigation"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status === "approved"
                            ? "Approved"
                            : status === "awaiting-mitigation"
                              ? "Awaiting Mitigation"
                              : status === "in-progress"
                                ? "Waiting for Assessment"
                                : "Not Started"}
                        </span>
                        {paymentStatus && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Paid
                          </span>
                        )}
                        {riskAssessmentDone && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            Risk: {riskLevel}
                          </span>
                        )}
                        {riskMitigationDone && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            Mitigated
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                      {button}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Start, Payment, Details, Risk Assessment, Risk Mitigation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words pr-4">
                  {modalMode === "start" && "Start Due Diligence"}
                  {modalMode === "payment" && "Complete Payment"}
                  {modalMode === "details" && "Due Diligence Details"}
                  {modalMode === "risk-assessment" &&
                    (isVerifier
                      ? "Risk Assessment (Verifier)"
                      : "Risk Assessment")}
                  {modalMode === "risk-mitigation" && "Risk Mitigation"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {modalMode === "start" && !isVerifier && (
                  <div className="space-y-4 sm:space-y-6">
                    {currentStep === 1 && (
                      <>
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4">
                          <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                            <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              Please provide information about this shipment
                            </span>
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Description (include trade name and type of
                              products) *
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              rows="3"
                              placeholder="e.g., Import of certified mahogany logs for furniture manufacturing"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Common Name of Species *
                            </label>
                            <input
                              type="text"
                              value={formData.commonName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  commonName: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., Mahogany"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Scientific Name *
                            </label>
                            <input
                              type="text"
                              value={formData.scientificName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  scientificName: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., Swietenia macrophylla"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              HS Codes (EUDR supported products) *
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowHsCodeSelector(true)}
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 text-sm"
                            >
                              <span className="truncate">
                                {formData.hsCodes.length > 0
                                  ? `${formData.hsCodes.length} product(s) selected`
                                  : "Select HS Codes"}
                              </span>
                              <FaChevronDown className="flex-shrink-0" />
                            </button>
                            {formData.hsCodes.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {formData.hsCodes.map((code, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-green-50 p-2 rounded border border-green-200"
                                  >
                                    <p className="text-xs sm:text-sm font-medium break-words">
                                      {code.code} - {code.name}
                                    </p>
                                    <p className="text-xs text-gray-600 break-words">
                                      Commodity: {code.commodity}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Container Management */}
                          <div className="border border-gray-200 rounded-lg p-3">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                              Container Details *
                            </label>
                            <div className="space-y-2 mb-3">
                              {formData.containers.map((container, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={container.containerNumber}
                                      disabled
                                      className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                                      placeholder="Container number"
                                    />
                                    <input
                                      type="number"
                                      value={container.kilograms}
                                      disabled
                                      className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                                      placeholder="Kilograms"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleRemoveContainer(idx)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTrashAlt size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Container Number"
                                value={newContainer.containerNumber}
                                onChange={(e) =>
                                  setNewContainer({
                                    ...newContainer,
                                    containerNumber: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Kilograms"
                                value={newContainer.kilograms}
                                onChange={(e) =>
                                  setNewContainer({
                                    ...newContainer,
                                    kilograms: e.target.value,
                                  })
                                }
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <button
                                onClick={handleAddContainer}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                              >
                                Add Container
                              </button>
                            </div>
                            {formData.containers.length > 0 && (
                              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium">
                                  Total Net Mass:{" "}
                                  <span className="font-bold">
                                    {calculateTotalNetMass().toLocaleString()}{" "}
                                    kg
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Customer Name *
                            </label>
                            <input
                              type="text"
                              value={formData.customerName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customerName: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., Adroitsoft Nigeria Limited"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Customer Postal Address *
                            </label>
                            <input
                              type="text"
                              value={formData.customerAddress}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customerAddress: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., Lagos, Nigeria"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Customer Email Address *
                            </label>
                            <input
                              type="email"
                              value={formData.customerEmail}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customerEmail: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., customer@company.com"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3">
                          <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveImporterInfo}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {modalMode === "payment" && !isVerifier && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg text-center">
                      <FaMoneyBillWave className="text-3xl sm:text-5xl text-yellow-600 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        Payment Required
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                        Amount to pay:{" "}
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          ${calculateAmount(calculateTotalNetMass())}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        (Calculated as $10 per 20,000kg)
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                        <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          This is a dummy payment system for demonstration
                          purposes. Click "Pay Now" to simulate payment.
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3">
                      <button
                        onClick={() => setModalMode("start")}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          "Pay Now"
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {modalMode === "details" &&
                  viewingRecord &&
                  selectedShipment && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-nowrap gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1 -mx-4 sm:-mx-6 px-4 sm:px-6">
                        <button
                          onClick={() => setViewTab("importer-info")}
                          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${viewTab === "importer-info" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Importer Info
                        </button>
                        <button
                          onClick={() => setViewTab("exporter-info")}
                          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${viewTab === "exporter-info" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Exporter Info
                        </button>
                        {viewingRecord.risks?.riskAssessment && (
                          <button
                            onClick={() => setViewTab("risk-assessment")}
                            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${viewTab === "risk-assessment" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            Risk Assessment
                          </button>
                        )}
                        {viewingRecord.risks?.riskMitigation && (
                          <button
                            onClick={() => setViewTab("risk-mitigation")}
                            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${viewTab === "risk-mitigation" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            Risk Mitigation
                          </button>
                        )}
                        <button
                          onClick={() => setViewTab("diligence-statement")}
                          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${viewTab === "diligence-statement" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Due Diligence Statement
                        </button>
                      </div>
                      <div className="mt-4">
                        {viewTab === "importer-info" &&
                          renderImporterInfo(viewingRecord)}
                        {viewTab === "exporter-info" &&
                          renderExporterInfo(viewingRecord, selectedShipment)}
                        {viewTab === "risk-assessment" &&
                          renderRiskAssessment(viewingRecord.risks)}
                        {viewTab === "risk-mitigation" &&
                          renderRiskMitigation(viewingRecord.risks)}
                        {viewTab === "diligence-statement" && (
                          <div className="space-y-6">
                            {!viewingRecord.diligenceStatement ? (
                              // Form to fill diligence statement
                              <div className="space-y-4 bg-white rounded-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                  Due Diligence Statement Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Signatory Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={diligenceForm.name}
                                      onChange={(e) =>
                                        setDiligenceForm((prev) => ({
                                          ...prev,
                                          name: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      placeholder="Enter full name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Function *
                                    </label>
                                    <input
                                      type="text"
                                      value={diligenceForm.function}
                                      onChange={(e) =>
                                        setDiligenceForm((prev) => ({
                                          ...prev,
                                          function: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      placeholder="e.g., Managing Director"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      EORI Number *
                                    </label>
                                    <input
                                      type="text"
                                      value={diligenceForm.eoriNumber}
                                      onChange={(e) =>
                                        setDiligenceForm((prev) => ({
                                          ...prev,
                                          eoriNumber: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      placeholder="e.g., GB123456789000"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Signature (upload dummy)
                                    </label>
                                    <button
                                      onClick={() => {
                                        setDiligenceForm((prev) => ({
                                          ...prev,
                                          signature:
                                            "https://cloud-storage.com/demo/signature.png",
                                          url: "https://cloud-storage.com/demo/signature.png",
                                        }));
                                        toast.info("Dummy signature added");
                                      }}
                                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                      Add Dummy Signature
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <button
                                    onClick={handleSaveDiligenceStatement}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                  >
                                    Save Statement
                                  </button>
                                </div>
                              </div>
                            ) : (
                              renderDiligenceStatement(
                                viewingRecord,
                                selectedShipment,
                                viewingRecord.diligenceStatement,
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                {modalMode === "risk-assessment" &&
                  (isVerifier ? <VerifierRiskAssessmentModal /> : null)}
                {modalMode === "risk-mitigation" && !isVerifier && (
                  <ImporterRiskMitigationModal />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HS Code Selector Modal */}
      <AnimatePresence>
        {showHsCodeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowHsCodeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  Select HS Codes
                </h3>
                <button
                  onClick={() => setShowHsCodeSelector(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search HS codes..."
                    value={hsCodeSearch}
                    onChange={(e) => setHsCodeSearch(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-4">
                  {demoData.commodities.map((commodity, idx) => {
                    const filtered = commodity.products.filter(
                      (p) =>
                        p.code.includes(hsCodeSearch) ||
                        p.name
                          .toLowerCase()
                          .includes(hsCodeSearch.toLowerCase()),
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-t-lg font-semibold text-gray-700 text-sm sm:text-base">
                          {commodity.commodity}
                        </div>
                        <div className="p-3 sm:p-4 space-y-2">
                          {filtered.map((product, pidx) => (
                            <label
                              key={pidx}
                              className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedHsCodes.some(
                                  (h) =>
                                    h.commodity === commodity.commodity &&
                                    h.code === product.code,
                                )}
                                onChange={() =>
                                  handleHsCodeSelect(
                                    commodity.commodity,
                                    product,
                                  )
                                }
                                className="mt-1 h-4 w-4 text-green-600 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-800 break-words">
                                  {product.code}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                  {product.name}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3">
                  <button
                    onClick={() => setShowHsCodeSelector(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHsCodes}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Add Selected ({selectedHsCodes.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assessment Document Modal */}
      <AnimatePresence>
        {showAssessmentDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowAssessmentDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                  Add Supporting Document
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Document Description *
                    </label>
                    <input
                      type="text"
                      value={assessmentDocDesc}
                      onChange={(e) => setAssessmentDocDesc(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Risk Assessment Report"
                      autoFocus
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                      <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        In this demo, a dummy document will be created with the
                        description above.
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3 mt-6">
                  <button
                    onClick={() => setShowAssessmentDocModal(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (assessmentDocDesc.trim()) {
                        setAssessmentDocs([
                          ...assessmentDocs,
                          {
                            name: assessmentDocDesc,
                            url: "dummy-document-url.pdf",
                          },
                        ]);
                        setAssessmentDocDesc("");
                        setShowAssessmentDocModal(false);
                      } else toast.error("Please enter a document description");
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Mitigation Document Modal */}
      <AnimatePresence>
        {showDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                  Add Document
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Document Description *
                    </label>
                    <input
                      type="text"
                      value={docModalData.description}
                      onChange={(e) =>
                        setDocModalData({
                          ...docModalData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="e.g., Audit Report"
                      autoFocus
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                      <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        In this demo, a dummy document will be created with the
                        description above.
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3 mt-6">
                  <button
                    onClick={() => setShowDocModal(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDoc}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification History Modal */}
      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNotesModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-green-800">
                  Verification Notes
                </h2>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="space-y-6">
                {verificationHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FaUser size={16} className="text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {item.verifierName}
                        </span>
                        {item.date && (
                          <span className="text-xs text-gray-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "compliant"
                            ? "bg-green-100 text-green-800"
                            : item.status === "non-compliant"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status ? item.status.replace("-", " ") : "Not set"}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {item.articles.map((article, artIdx) => (
                        <div key={artIdx}>
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            {article.title}
                          </h4>
                          <div className="space-y-1">
                            {article.notes.map((note, noteIdx) => (
                              <div
                                key={noteIdx}
                                className="text-sm text-gray-600 pl-6 border-l-2 border-green-200 ml-2"
                              >
                                • {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CurrentDueDiligence;
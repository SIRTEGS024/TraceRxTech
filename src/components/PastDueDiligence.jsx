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
          <span className="text-sm text-gray-700">Planting Areas</span>
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

          {/* Planting areas (green) */}
          {coordinates.map((plot) => (
            plot.coordinates && plot.coordinates.length >= 3 && (
              <Polygon
                key={plot.id}
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
                    <span className="font-medium">Type:</span> {selectedArea.type === 'facility' ? 'Production Site' : 'Planting Area'}
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

// ========== PastDueDiligence Component ==========
const PastDueDiligence = () => {
  const { user, demoData, updateUser } = useUserStore();

  // Determine role
  const isVerifier = user?.role === "verifier" && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;
  const targetImporter = isVerifier
    ? demoData.users[companyId] // The importer the verifier is reviewing
    : user; // The importer themselves (if logged in as importer)

  const [selectedYear, setSelectedYear] = useState("2025");
  const [expandedYears, setExpandedYears] = useState({});
  const [records, setRecords] = useState([]);
  const [exporters, setExporters] = useState({});
  const [yearRecordCounts, setYearRecordCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("start"); // 'start', 'payment', 'details', 'risk-assessment', 'risk-mitigation'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    description: "",
    commonName: "",
    scientificName: "",
    hsCodes: [],
    netMassKg: "",
    customerName: "",
    customerAddress: "",
    customerEmail: "",
  });
  const [selectedHsCodes, setSelectedHsCodes] = useState([]);
  const [showHsCodeSelector, setShowHsCodeSelector] = useState(false);
  const [hsCodeSearch, setHsCodeSearch] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState("");
  const [assessmentDocs, setAssessmentDocs] = useState([]);
  const [showAssessmentDocModal, setShowAssessmentDocModal] = useState(false);
  const [assessmentDocDesc, setAssessmentDocDesc] = useState("");

  // Risk mitigation state (for importer)
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

  // Officer details
  const [officerName, setOfficerName] = useState("");
  const [officerIdCard, setOfficerIdCard] = useState(null);
  const [appointmentLetter, setAppointmentLetter] = useState(null);

  const [saving, setSaving] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewTab, setViewTab] = useState("importer-info"); // 'importer-info', 'exporter-info', 'risk-assessment', 'risk-mitigation', 'diligence-statement'
  const [exporterRecordData, setExporterRecordData] = useState(null);

  // Diligence statement form state
  const [diligenceForm, setDiligenceForm] = useState({
    name: "",
    function: "",
    eoriNumber: "",
    signature: null,
    url: null,
  });
  const [submittingDiligence, setSubmittingDiligence] = useState(false);

  // Verifier‑only state – now per article
  const [verificationStatus, setVerificationStatus] = useState(null); // 'compliant' | 'non-compliant'
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

  const years = ["2021", "2022", "2023", "2024", "2025"];

  // Article titles for display
  const articleTitles = {
    "article-7": "Article 7 – Placing on the market by operators established in third countries",
    "article-8": "Article 8 – Due Diligence",
    "article-9": "Article 9 – Information Requirements",
    "article-10": "Article 10 – Risk Assessment",
    "article-11": "Article 11 – Risk Mitigation",
  };

  // Load data for importer (or target importer for verifier)
  useEffect(() => {
    if (targetImporter && targetImporter.id) {
      // Get all exporters
      const exportersMap = {};
      Object.values(demoData.users).forEach((u) => {
        if (u.role === "exporter") {
          exportersMap[u.id] = u;
        }
      });
      setExporters(exportersMap);

      // Get connected past records
      if (targetImporter.connectedPastRecords) {
        const enrichedRecords = targetImporter.connectedPastRecords.map(
          (record) => {
            const exporter = exportersMap[record.exporterId];
            const pastSupplierRecord = targetImporter.pastSupplierRecords?.[
              record.year
            ]?.find((r) => r.recordId === record.recordId);

            let exporterFacility = null;
            let exporterPastRecord = null;

            if (exporter && record.facilityId) {
              exporterFacility = exporter.facilities?.find(
                (f) => f.id === record.facilityId,
              );
              if (exporterFacility && exporterFacility.pastRecords) {
                exporterPastRecord = exporterFacility.pastRecords[
                  record.year
                ]?.find((r) => r.id === record.recordId);
              }
            }

            return {
              ...record,
              exporterName:
                exporter?.basicInfo?.companyName || "Unknown Exporter",
              exporterEmail: exporter?.basicInfo?.email || "",
              exporterAddress:
                exporter?.facilities?.find(
                  (f) => f.type === "Corporate facility",
                )?.address || "",
              exporterFacility,
              exporterPastRecord,
              status: pastSupplierRecord
                ? pastSupplierRecord.paymentStatus
                  ? "completed"
                  : "in-progress"
                : "not-started",
              paymentStatus: pastSupplierRecord?.paymentStatus || false,
              hasDueDiligence: !!pastSupplierRecord,
              dueDiligenceData: pastSupplierRecord || null,
              // For risk assessment tracking
              riskAssessmentDone: pastSupplierRecord?.risks?.riskAssessment
                ? true
                : false,
              riskMitigationDone: pastSupplierRecord?.risks?.riskMitigation
                ? true
                : false,
              riskLevel:
                pastSupplierRecord?.risks?.riskAssessment?.riskLevel || null,
              diligenceStatement:
                pastSupplierRecord?.diligenceStatement || null,
            };
          },
        );

        setRecords(enrichedRecords);

        // Calculate record counts per year
        const counts = {};
        years.forEach((year) => {
          counts[year] = enrichedRecords.filter(
            (r) => r.year.toString() === year,
          ).length;
        });
        setYearRecordCounts(counts);

        // Expand years that have records by default
        const initialExpanded = {};
        years.forEach((year) => {
          if (counts[year] > 0) {
            initialExpanded[year] = true;
          }
        });
        setExpandedYears(initialExpanded);
      }
    }
  }, [targetImporter, demoData]);

  // Load verifier's existing verification for this tab
  useEffect(() => {
    if (isVerifier && targetImporter && user) {
      const reports = user.verificationReports || [];
      const report = reports.find((r) => r.companyId === targetImporter.id);
      if (report) {
        const artFindings = report.findings?.find(
          (f) => f.tab === "past-due-diligence",
        );
        if (artFindings) {
          setVerificationStatus(artFindings.status || null);
          setInitialVerificationStatus(artFindings.status || null);

          // Load notes per article – map store article keys to our keys
          const articles = artFindings.articles || [];
          const notesMap = {
            article7: [],
            article8: [],
            article9: [],
            article10: [],
            article11: [],
          };
          articles.forEach((art) => {
            // Convert store key "article-7" -> "article7"
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

  // ---------- Load verification history for importer (per article) ----------
  useEffect(() => {
    if (!isVerifier && targetImporter) {
      const linkedVerifiers = targetImporter.linkedVerifiers || [];
      const history = [];

      linkedVerifiers.forEach((verifierLink) => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier || !verifier.verificationReports) return;

        const report = verifier.verificationReports.find(
          (r) => r.companyId === targetImporter.id,
        );
        if (report) {
          const artFindings = report.findings?.find(
            (f) => f.tab === "past-due-diligence",
          );
          if (artFindings && artFindings.articles && artFindings.articles.length > 0) {
            // Create an entry per article
            artFindings.articles.forEach((article) => {
              if (article.notes && article.notes.length > 0) {
                history.push({
                  verifierName: verifier.basicInfo?.firstName
                    ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}`
                    : verifier.basicInfo?.email || verifier.id,
                  status: artFindings.status,
                  article: article.article,
                  articleTitle: articleTitles[article.article] || article.article,
                  notes: article.notes,
                  date: report.date,
                });
              }
            });
          }
        }
      });

      setVerificationHistory(history);
    }
  }, [isVerifier, targetImporter, demoData]);

  // Helper to check if all records are ready for verification
  const areAllRecordsReady = () => {
    if (records.length === 0) return true; // nothing to verify
    return records.every((record) => {
      if (!record.riskAssessmentDone) return false;
      if (record.riskLevel === "high risk" && !record.riskMitigationDone)
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

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const getRecordsByYear = (year) => {
    return records.filter((record) => record.year.toString() === year);
  };

  const handleStartDueDiligence = (record) => {
    setSelectedRecord(record);
    setModalMode("start");
    setCurrentStep(1);
    setFormData({
      description: "",
      commonName: "",
      scientificName: "",
      hsCodes: [],
      netMassKg: "",
      customerName: "",
      customerAddress: "",
      customerEmail: "",
    });
    setSelectedHsCodes([]);
    setShowModal(true);
  };

  const handleContinuePayment = (record) => {
    setSelectedRecord(record);
    setModalMode("payment");
    setShowModal(true);
  };

  const handleViewDetails = (record) => {
    setViewingRecord(record);
    setModalMode("details");
    setViewTab("importer-info");
    setShowModal(true);

    if (record.exporterPastRecord) {
      setExporterRecordData(record.exporterPastRecord);
    }
    // Pre-fill diligence form if already exists
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

  // Verifier risk assessment
  const handleRiskAssessment = (record) => {
    setSelectedRecord(record);
    // Pre-fill if already exists
    const existing = record.dueDiligenceData?.risks?.riskAssessment;
    if (existing) {
      setRiskLevel(existing.riskLevel || "");
      setAssessmentDocs(existing.assessmentDocs || []);
    } else {
      setRiskLevel("");
      setAssessmentDocs([]);
    }
    // Load officer details if any
    const officer = record.dueDiligenceData?.risks;
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

    // Update the importer's pastSupplierRecords with risk assessment
    const updatedImporter = { ...targetImporter };
    const recordIndex = updatedImporter.pastSupplierRecords[
      selectedRecord.year
    ].findIndex((r) => r.recordId === selectedRecord.recordId);

    if (recordIndex >= 0) {
      const record =
        updatedImporter.pastSupplierRecords[selectedRecord.year][recordIndex];
      if (!record.risks) {
        record.risks = {};
      }
      record.risks.riskAssessment = {
        riskLevel,
        assessmentDocs,
      };
      record.risks.officerName = officerName;
      record.risks.officerIdCard = officerIdCard;
      record.risks.appointmentLetter = appointmentLetter;

      updateUser(updatedImporter.id, updatedImporter);

      // Update local records
      const updatedRecords = records.map((r) => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            riskAssessmentDone: true,
            riskLevel,
            dueDiligenceData: {
              ...r.dueDiligenceData,
              risks: {
                ...r.dueDiligenceData?.risks,
                riskAssessment: { riskLevel, assessmentDocs },
                officerName,
                officerIdCard,
                appointmentLetter,
              },
            },
          };
        }
        return r;
      });
      setRecords(updatedRecords);

      toast.success("Risk assessment saved successfully");
      setShowModal(false);
      setSelectedRecord(null);
    }
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

    // Build articles array from per-article notes – store keys with hyphen
    const articles = [];
    for (const [articleKey, notes] of Object.entries(
      verificationNotesByArticle,
    )) {
      if (notes && notes.length > 0) {
        // Convert "article7" -> "article-7"
        const storeKey = articleKey.replace("article", "article-");
        articles.push({ article: storeKey, notes });
      }
    }

    const artFindings = {
      tab: "past-due-diligence",
      status: verificationStatus || "non-compliant",
      articles: articles,
    };

    if (reportIndex >= 0) {
      const report = reports[reportIndex];
      let findings = report.findings || [];
      const existingIdx = findings.findIndex(
        (f) => f.tab === "past-due-diligence",
      );
      if (existingIdx >= 0) {
        findings[existingIdx] = artFindings;
      } else {
        findings.push(artFindings);
      }
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

  // Helper: render document box (shared)
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

  // Helper: render exporter info (used in details modal)
  const renderExporterInfo = (record) => {
  if (!record || !record.exporterPastRecord) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">
          No exporter information available for this record
        </p>
      </div>
    );
  }

  const pastRecord = record.exporterPastRecord;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
          <FaInfoCircle className="mr-2 flex-shrink-0" /> Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Description</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {pastRecord.description}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Common Name</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {pastRecord.commonName}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">
              Scientific Name
            </p>
            <p className="font-medium text-sm sm:text-base break-words">
              {pastRecord.scientificName}
            </p>
          </div>
          <div className="min-w-0 col-span-1 sm:col-span-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Production Location
            </p>
            <p className="font-medium text-sm sm:text-base break-words">
              {pastRecord.productionLocation}
            </p>
          </div>
          <div className="min-w-0 col-span-1 sm:col-span-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Production Date Range
            </p>
            <p className="font-medium text-sm sm:text-base break-words">
              {pastRecord.productionDateRange?.from || "N/A"} to{" "}
              {pastRecord.productionDateRange?.to || "N/A"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Net Mass (kg)</p>
            <p className="font-medium text-sm sm:text-base">
              {pastRecord.netMassKg?.toLocaleString() || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
          <FaBoxes className="mr-2 flex-shrink-0" /> HS Codes
        </h3>
        <div className="space-y-2">
          {pastRecord.hsCodes?.map((code, idx) => (
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

      <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base">
          <FaTree className="mr-2 flex-shrink-0" /> Planting Areas
        </h3>
        
        {/* Map Component */}
        <div className="space-y-4">
          <MapViewOnly
            coordinates={pastRecord.plantingAreas || []}
            facilityAreas={record.exporterFacility?.areas || []}
            facilityName={record.exporterFacility?.name || ""}
            facilityAddress={record.exporterFacility?.address || ""}
          />
        </div>

        {/* Detailed coordinates in text (restored from original) */}
        {pastRecord.plantingAreas && pastRecord.plantingAreas.length > 0 && (
          <div className="mt-4 space-y-4">
            <h4 className="font-medium text-gray-700">Coordinates Details</h4>
            {pastRecord.plantingAreas.map((area, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                <p className="font-medium text-sm text-gray-800 mb-2">
                  {area.name} – {area.hectares} hectares
                </p>
                {area.coordinates && area.coordinates.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Coordinates (lat, lng):</p>
                    <div className="max-h-48 overflow-y-auto bg-gray-50 rounded p-2 text-xs font-mono">
                      {area.coordinates.map((coord, coordIdx) => {
                        const latLng = convertToLatLng(coord);
                        return (
                          <div key={coordIdx} className="py-0.5">
                            {coordIdx + 1}. {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total points: {area.coordinates.length}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {pastRecord.totalHectares && (
              <div className="bg-purple-100 p-2 rounded">
                <p className="font-medium text-sm">Total area: {pastRecord.totalHectares} hectares</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-sm sm:text-base">
          <FaFileAlt className="mr-2 flex-shrink-0" /> Documents
        </h3>
        <div className="space-y-3">
          {pastRecord.deforestationFreeDocs?.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Deforestation-Free Documentation
              </p>
              <div className="space-y-2">
                {pastRecord.deforestationFreeDocs.map((doc, idx) =>
                  renderDocumentBox(doc, idx),
                )}
              </div>
            </div>
          )}
          {pastRecord.legalComplianceDocs?.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Legal Compliance Documentation
              </p>
              <div className="space-y-2">
                {pastRecord.legalComplianceDocs.map((doc, idx) =>
                  renderDocumentBox(doc, idx),
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
          <FaBuilding className="mr-2 flex-shrink-0" /> Facility Information
        </h3>
        {record.exporterFacility && (
          <div className="space-y-1">
            <p className="text-sm sm:text-base break-words">
              <span className="text-xs sm:text-sm text-gray-600">
                Facility Name:
              </span>{" "}
              {record.exporterFacility.name}
            </p>
            <p className="text-sm sm:text-base break-words">
              <span className="text-xs sm:text-sm text-gray-600">
                Facility Type:
              </span>{" "}
              {record.exporterFacility.type}
            </p>
            <p className="text-sm sm:text-base break-words">
              <span className="text-xs sm:text-sm text-gray-600">
                Facility Address:
              </span>{" "}
              {record.exporterFacility.address}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

  const renderImporterInfo = (data) => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
          <FaInfoCircle className="mr-2 flex-shrink-0" /> Trade Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0 col-span-1 sm:col-span-2">
            <p className="text-xs sm:text-sm text-gray-600">Description</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {data.description}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Common Name</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {data.commonName}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Scientific Name</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {data.scientificName}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600">Net Mass (kg)</p>
            <p className="font-medium text-sm sm:text-base">
              {data.netMassKg.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
          <FaBoxes className="mr-2 flex-shrink-0" /> HS Codes
        </h3>
        <div className="space-y-2">
          {data.hsCodes.map((code, idx) => (
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

      <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base">
          <FaUser className="mr-2 flex-shrink-0" /> Customer Information
        </h3>
        <div className="space-y-2">
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Name:</span>{" "}
            {data.customerName}
          </p>
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Address:</span>{" "}
            {data.customerAddress}
          </p>
          <p className="text-sm sm:text-base break-words">
            <span className="text-xs sm:text-sm text-gray-600">Email:</span>{" "}
            {data.customerEmail}
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
            ${data.amount}
          </p>
          <div className="flex flex-col xs:flex-row xs:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Payment Status:
            </span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold w-fit ${data.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {data.paymentStatus ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div className="flex flex-col xs:flex-row xs:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Due Diligence Status:
            </span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold w-fit ${data.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {data.status === "approved" ? "Approved" : "In Progress"}
            </span>
          </div>
        </div>
      </div>

      {data.risks?.officerName && (
        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-sm sm:text-base">
            <FaIdCard className="mr-2 flex-shrink-0" /> Responsible Officer
          </h3>
          <div className="space-y-2">
            <p className="text-sm sm:text-base break-words">
              <span className="text-xs sm:text-sm text-gray-600">Name:</span>{" "}
              {data.risks.officerName}
            </p>
            {data.risks.officerIdCard && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  ID Card:
                </p>
                {renderDocumentBox(data.risks.officerIdCard, "officer-id")}
              </div>
            )}
            {data.risks.appointmentLetter && (
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Appointment Letter:
                </p>
                {renderDocumentBox(data.risks.appointmentLetter, "appointment")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderRiskAssessment = (risks) => {
    if (!risks || !risks.riskAssessment) return null;

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
    if (!risks || !risks.riskMitigation) return null;

    const mitigation = risks.riskMitigation;

    return (
      <div className="space-y-4 sm:space-y-6">
        {mitigation.highRiskSection && (
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3 text-sm sm:text-base">
              High Risk Section
            </h3>

            {mitigation.highRiskSection.additionalInfo?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.additionalInfo.map((doc, idx) =>
                    renderDocumentBox(doc, idx),
                  )}
                </div>
              </div>
            )}

            {mitigation.highRiskSection.independentSurveys?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Independent Surveys/Audits
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.independentSurveys.map(
                    (doc, idx) => renderDocumentBox(doc, idx),
                  )}
                </div>
              </div>
            )}

            {mitigation.highRiskSection.otherMeasures?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Other Measures
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.otherMeasures.map((doc, idx) =>
                    renderDocumentBox(doc, idx),
                  )}
                </div>
              </div>
            )}

            {mitigation.highRiskSection.capacityBuilding?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Capacity Building & Investments
                </p>
                <div className="space-y-2">
                  {mitigation.highRiskSection.capacityBuilding.map((doc, idx) =>
                    renderDocumentBox(doc, idx),
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
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Model Risk Management Practices
                </p>
                <div className="space-y-2">
                  {mitigation.policiesControls.modelPractices.map((doc, idx) =>
                    renderDocumentBox(doc, idx),
                  )}
                </div>
              </div>
            )}

            {mitigation.policiesControls.independentAudit?.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Independent Audit Function
                </p>
                <div className="space-y-2">
                  {mitigation.policiesControls.independentAudit.map(
                    (doc, idx) => renderDocumentBox(doc, idx),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mitigation.decisionsReview?.length > 0 && (
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
              Decisions on Risk Mitigation Procedures
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Reviewed at least on an annual basis
            </p>
            <div className="space-y-2">
              {mitigation.decisionsReview.map((doc, idx) =>
                renderDocumentBox(doc, idx),
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== NEW: Due Diligence Statement Renderer ==========
  const renderDiligenceStatement = (record, diligenceData) => {
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
      record.dueDiligenceData?.hsCodes
        ?.map((h) => `${h.code} (${h.name})`)
        .join(", ") || "Not specified";
    const products =
      record.exporterPastRecord?.supportedProducts
        ?.flatMap((sp) => sp.products.map((p) => p.name))
        .join(", ") || "Various commodities";
    const scientificNames =
      record.dueDiligenceData?.scientificName || "Not specified";
    const commonName = record.dueDiligenceData?.commonName || "Not specified";
    const netMass =
      record.dueDiligenceData?.netMassKg?.toLocaleString() || "N/A";
    const productionLocation =
      record.exporterPastRecord?.productionLocation || "Unknown";

    // Inside renderDiligenceStatement, replace the geolocation block with:
    let geolocation = "Not available";
    const plantingAreas = record.exporterPastRecord?.plantingAreas;
    if (
      plantingAreas &&
      plantingAreas.length > 0 &&
      plantingAreas[0].coordinates
    ) {
      const coords = plantingAreas[0].coordinates
        .map((c) => {
          // Handle both array and object formats
          if (Array.isArray(c)) {
            return `${c[0]},${c[1]}`;
          } else if (c.lat && c.lng) {
            return `${c.lat},${c.lng}`;
          }
          return "invalid";
        })
        .join("; ");
      geolocation = `${plantingAreas[0].name} (${plantingAreas[0].hectares} ha) - Coordinates: ${coords}`;
    }

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
            <strong>Trade Name/Description:</strong>{" "}
            {record.dueDiligenceData?.description || "Not specified"}
            <br />
            <strong>Scientific Name:</strong> {scientificNames}
            <br />
            <strong>Common Name:</strong> {commonName}
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
            <strong>4.</strong> Reference number of this due diligence statement
            (if applicable): <strong>{record.recordId}</strong>
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
      // For demo, we'll set a dummy signature URL
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
      url: diligenceForm.url || "https://cloud-storage.com/demo/signature.png",
    };

    // Update the importer's pastSupplierRecords
    const updatedImporter = { ...targetImporter };
    const recordIndex = updatedImporter.pastSupplierRecords[
      viewingRecord.year
    ].findIndex((r) => r.recordId === viewingRecord.recordId);
    if (recordIndex >= 0) {
      updatedImporter.pastSupplierRecords[viewingRecord.year][
        recordIndex
      ].diligenceStatement = statementData;
      updateUser(targetImporter.id, updatedImporter);

      // Update local records
      const updatedRecords = records.map((r) => {
        if (r.recordId === viewingRecord.recordId) {
          return { ...r, diligenceStatement: statementData };
        }
        return r;
      });
      setRecords(updatedRecords);
      setViewingRecord({ ...viewingRecord, diligenceStatement: statementData });
      toast.success("Due Diligence Statement saved successfully");
    }
  };

  // Modal content for verifier's risk assessment
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
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
                // Simulate officer ID card upload
                setOfficerIdCard({
                  name: "Officer ID Card",
                  url: "dummy-id-card.pdf",
                });
                toast.info("Officer ID card added (dummy)");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
            >
              <FaUpload className="mr-2" size={12} />
              Upload ID Card
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
              <FaUpload className="mr-2" size={12} />
              Upload Appointment Letter
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
            <FaUpload className="mr-2" size={12} />
            Add Document
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

  // Helper: payment calculation (unchanged)
  const calculateAmount = (netMassKg) =>
    Math.ceil((parseFloat(netMassKg) / 20000) * 10);

  // Importer-specific handlers (unchanged but kept)
  const handleSaveImporterInfo = () => {
    if (
      !formData.description ||
      !formData.commonName ||
      !formData.scientificName ||
      !formData.hsCodes.length ||
      !formData.netMassKg ||
      !formData.customerName ||
      !formData.customerAddress ||
      !formData.customerEmail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setModalMode("payment");
  };

  const handlePayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      const amount = calculateAmount(formData.netMassKg);
      const newRecord = {
        recordId: selectedRecord.recordId,
        supplierId: selectedRecord.exporterId,
        supplierName: selectedRecord.exporterName,
        supplierAddress: selectedRecord.exporterAddress,
        supplierEmail: selectedRecord.exporterEmail,
        description: formData.description,
        commonName: formData.commonName,
        scientificName: formData.scientificName,
        hsCodes: formData.hsCodes,
        netMassKg: parseFloat(formData.netMassKg),
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        customerEmail: formData.customerEmail,
        amount: amount,
        paymentStatus: true,
        status: "in-progress",
        risks: {
          riskAssessment: null,
          riskMitigation: null,
          officerName: "",
          officerIdCard: null,
          appointmentLetter: null,
        },
        diligenceStatement: null,
      };

      const updatedUser = { ...targetImporter };
      if (!updatedUser.pastSupplierRecords)
        updatedUser.pastSupplierRecords = {
          2021: [],
          2022: [],
          2023: [],
          2024: [],
          2025: [],
        };
      if (!updatedUser.pastSupplierRecords[selectedRecord.year])
        updatedUser.pastSupplierRecords[selectedRecord.year] = [];

      const existingIndex = updatedUser.pastSupplierRecords[
        selectedRecord.year
      ].findIndex((r) => r.recordId === selectedRecord.recordId);
      if (existingIndex >= 0) {
        updatedUser.pastSupplierRecords[selectedRecord.year][existingIndex] =
          newRecord;
      } else {
        updatedUser.pastSupplierRecords[selectedRecord.year].push(newRecord);
      }
      updateUser(targetImporter.id, updatedUser);

      const updatedRecords = records.map((r) => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            status: "in-progress",
            paymentStatus: true,
            dueDiligenceData: newRecord,
          };
        }
        return r;
      });
      setRecords(updatedRecords);
      setPaymentLoading(false);
      setModalMode("risk-assessment");
      toast.success(
        "Payment successful! You can now proceed with risk assessment.",
      );
    }, 2000);
  };

  const handleAddAssessmentDoc = () => {
    if (!assessmentDocDesc.trim()) {
      toast.error("Please enter a document description");
      return;
    }
    setAssessmentDocs([
      ...assessmentDocs,
      { name: assessmentDocDesc, url: "dummy-document-url.pdf" },
    ]);
    setAssessmentDocDesc("");
    setShowAssessmentDocModal(false);
  };

  const handleRemoveAssessmentDoc = (index) => {
    setAssessmentDocs(assessmentDocs.filter((_, i) => i !== index));
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

  const handleSaveRiskAssessment = () => {
    if (!riskLevel) {
      toast.error("Please select a risk level");
      return;
    }
    if (assessmentDocs.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }
    if (!officerName.trim() || !officerIdCard || !appointmentLetter) {
      toast.error(
        "Please provide officer details (required for all due diligence)",
      );
      return;
    }

    const updatedUser = { ...targetImporter };
    const recordIndex = updatedUser.pastSupplierRecords[
      selectedRecord.year
    ].findIndex((r) => r.recordId === selectedRecord.recordId);
    if (recordIndex >= 0) {
      const record =
        updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex];
      if (!record.risks) record.risks = {};
      record.risks.riskAssessment = { riskLevel, assessmentDocs };
      record.risks.officerName = officerName;
      record.risks.officerIdCard = officerIdCard;
      record.risks.appointmentLetter = appointmentLetter;
      updateUser(targetImporter.id, updatedUser);

      const updatedRecords = records.map((r) => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            dueDiligenceData: {
              ...r.dueDiligenceData,
              risks: {
                ...r.dueDiligenceData?.risks,
                riskAssessment: { riskLevel, assessmentDocs },
                officerName,
                officerIdCard,
                appointmentLetter,
              },
            },
            riskAssessmentDone: true,
            riskLevel,
          };
        }
        return r;
      });
      setRecords(updatedRecords);

      if (riskLevel === "high risk") {
        setModalMode("risk-mitigation");
        setCurrentStep(1);
        toast.info("High risk detected. Please complete risk mitigation.");
      } else {
        // Low risk – mark as completed
        updatedUser.pastSupplierRecords[selectedRecord.year][
          recordIndex
        ].status = "approved";
        updateUser(targetImporter.id, updatedUser);
        toast.success("Risk assessment complete. Due diligence finalized!");
        setShowModal(false);
        setSelectedRecord(null);
      }
    }
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

  const handleSaveRiskMitigation = () => {
    if (!officerName.trim() || !officerIdCard || !appointmentLetter) {
      toast.error(
        "Officer details are missing. Please go back to risk assessment and complete them.",
      );
      return;
    }

    const updatedUser = { ...targetImporter };
    const recordIndex = updatedUser.pastSupplierRecords[
      selectedRecord.year
    ].findIndex((r) => r.recordId === selectedRecord.recordId);
    if (recordIndex >= 0) {
      const record =
        updatedUser.pastSupplierRecords[selectedRecord.year][recordIndex];
      if (!record.risks) record.risks = {};
      record.risks.riskMitigation = riskMitigation;
      if (!record.risks.officerName) {
        record.risks.officerName = officerName;
        record.risks.officerIdCard = officerIdCard;
        record.risks.appointmentLetter = appointmentLetter;
      }
      record.status = "approved";
      updateUser(targetImporter.id, updatedUser);

      const updatedRecords = records.map((r) => {
        if (r.recordId === selectedRecord.recordId) {
          return {
            ...r,
            riskMitigationDone: true,
            dueDiligenceData: {
              ...r.dueDiligenceData,
              risks: { ...r.dueDiligenceData?.risks, riskMitigation },
            },
          };
        }
        return r;
      });
      setRecords(updatedRecords);
      toast.success("Risk mitigation complete. Due diligence finalized!");
      setShowModal(false);
      setSelectedRecord(null);
    }
  };

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

  // ========== RENDER ==========
  if (!targetImporter) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading company data...</p>
      </div>
    );
  }

  // Define the article list (for verifier notes)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">
          Past Due Diligence (Articles 7,8,9,10,11)
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

      {/* Verifier Tab‑Level Verification Panel */}
      {isVerifier && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Verification – Past Due Diligence (Articles 7‑11)
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

          {/* Per‑article notes sections */}
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
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                !areAllRecordsReady() || !hasVerificationChanges()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FaSave size={16} /> Save Verification
            </button>
          </div>
          {!areAllRecordsReady() && records.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Verification can only be saved after all records have completed
              the required steps (risk assessment for low risk, risk assessment
              + mitigation for high risk).
            </p>
          )}
        </div>
      )}

      {/* Year Selection and Records */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-green-100">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Select Year
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {years.map((year) => {
              const recordCount = yearRecordCounts[year] || 0;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-green-600 text-white"
                      : recordCount > 0
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {year}
                  {recordCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {recordCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {yearRecordCounts[selectedYear] === 0 && (
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              No records found for {selectedYear}
            </p>
          )}
        </div>

        {yearRecordCounts[selectedYear] > 0 && (
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <button
              onClick={() => toggleYear(selectedYear)}
              className="flex items-center justify-between w-full text-left mb-3 sm:mb-4"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Records for {selectedYear} ({yearRecordCounts[selectedYear]})
              </h3>
              {expandedYears[selectedYear] ? (
                <FaChevronUp className="flex-shrink-0" />
              ) : (
                <FaChevronDown className="flex-shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {expandedYears[selectedYear] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {getRecordsByYear(selectedYear).map((record) => (
                    <motion.div
                      key={record.recordId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-500 break-words">
                            Record ID: {record.recordId}
                          </p>
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                            {record.exporterName}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                            {record.dueDiligenceData?.description ||
                              record.exporterPastRecord?.description ||
                              "No description yet"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                record.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "in-progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {record.status === "completed"
                                ? "Completed"
                                : record.status === "in-progress"
                                  ? "In Progress"
                                  : "Not Started"}
                            </span>
                            {record.paymentStatus && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                Paid
                              </span>
                            )}
                            {record.riskAssessmentDone && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                Risk: {record.riskLevel}
                              </span>
                            )}
                            {record.riskMitigationDone && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                Mitigated
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                          {!isVerifier ? (
                            // Importer buttons
                            <>
                              {record.status === "not-started" && (
                                <button
                                  onClick={() =>
                                    handleStartDueDiligence(record)
                                  }
                                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                >
                                  <FaPlus
                                    className="mr-2 flex-shrink-0"
                                    size={14}
                                  />
                                  Start
                                </button>
                              )}
                              {record.status === "in-progress" &&
                                !record.paymentStatus && (
                                  <button
                                    onClick={() =>
                                      handleContinuePayment(record)
                                    }
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                  >
                                    <FaMoneyBillWave
                                      className="mr-2 flex-shrink-0"
                                      size={14}
                                    />
                                    Pay
                                  </button>
                                )}
                              {record.status === "in-progress" &&
                                record.paymentStatus && (
                                  <button
                                    onClick={() => handleViewDetails(record)}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                  >
                                    <FaEye
                                      className="mr-2 flex-shrink-0"
                                      size={14}
                                    />
                                    View
                                  </button>
                                )}
                              {record.status === "completed" && (
                                <button
                                  onClick={() => handleViewDetails(record)}
                                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                >
                                  <FaEye
                                    className="mr-2 flex-shrink-0"
                                    size={14}
                                  />
                                  View
                                </button>
                              )}
                            </>
                          ) : (
                            // Verifier buttons
                            <>
                              {!record.riskAssessmentDone && (
                                <button
                                  onClick={() => handleRiskAssessment(record)}
                                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                                >
                                  <FaShieldAlt
                                    className="mr-2 flex-shrink-0"
                                    size={14}
                                  />
                                  Assess Risk
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                              >
                                <FaEye
                                  className="mr-2 flex-shrink-0"
                                  size={14}
                                />
                                View
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
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
              {/* Modal Header */}
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

              {/* Modal Body */}
              <div className="p-4 sm:p-6">
                {modalMode === "start" && !isVerifier && (
                  <div className="space-y-4 sm:space-y-6">
                    {currentStep === 1 && (
                      <>
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4">
                          <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                            <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                            <span>
                              Please provide information about this past trade
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

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                              Net Mass (kg) *
                            </label>
                            <input
                              type="number"
                              value={formData.netMassKg}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  netMassKg: e.target.value,
                                })
                              }
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              placeholder="e.g., 50000"
                            />
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

                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Auto-filled supplier information:
                          </p>
                          <p className="text-sm break-words">
                            <span className="font-medium">Supplier Name:</span>{" "}
                            {selectedRecord?.exporterName}
                          </p>
                          <p className="text-sm break-words">
                            <span className="font-medium">Supplier Email:</span>{" "}
                            {selectedRecord?.exporterEmail}
                          </p>
                          <p className="text-sm break-words">
                            <span className="font-medium">
                              Supplier Address:
                            </span>{" "}
                            {selectedRecord?.exporterAddress || "Not available"}
                          </p>
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
                          $
                          {calculateAmount(
                            formData.netMassKg ||
                              selectedRecord?.dueDiligenceData?.netMassKg ||
                              0,
                          )}
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
                            <span>Processing...</span>
                          </>
                        ) : (
                          "Pay Now"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === "details" && viewingRecord && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex flex-nowrap gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-1 -mx-4 sm:-mx-6 px-4 sm:px-6">
                      <button
                        onClick={() => setViewTab("importer-info")}
                        className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                          viewTab === "importer-info"
                            ? "border-b-2 border-green-600 text-green-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Importer Info
                      </button>
                      {viewingRecord.paymentStatus && (
                        <>
                          <button
                            onClick={() => setViewTab("exporter-info")}
                            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                              viewTab === "exporter-info"
                                ? "border-b-2 border-green-600 text-green-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Exporter Info
                          </button>
                          {viewingRecord.dueDiligenceData?.risks
                            ?.riskAssessment && (
                            <button
                              onClick={() => setViewTab("risk-assessment")}
                              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                                viewTab === "risk-assessment"
                                  ? "border-b-2 border-green-600 text-green-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              Risk Assessment
                            </button>
                          )}
                          {viewingRecord.dueDiligenceData?.risks
                            ?.riskMitigation && (
                            <button
                              onClick={() => setViewTab("risk-mitigation")}
                              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                                viewTab === "risk-mitigation"
                                  ? "border-b-2 border-green-600 text-green-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              Risk Mitigation
                            </button>
                          )}
                          {/* Always show the due diligence statement tab after payment (or after all steps) */}
                          <button
                            onClick={() => setViewTab("diligence-statement")}
                            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                              viewTab === "diligence-statement"
                                ? "border-b-2 border-green-600 text-green-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Due Diligence Statement
                          </button>
                        </>
                      )}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                      {viewTab === "importer-info" &&
                        renderImporterInfo(viewingRecord.dueDiligenceData)}

                      {viewTab === "exporter-info" &&
                        viewingRecord.paymentStatus &&
                        renderExporterInfo(viewingRecord)}

                      {viewTab === "risk-assessment" &&
                        viewingRecord.dueDiligenceData?.risks?.riskAssessment &&
                        renderRiskAssessment(
                          viewingRecord.dueDiligenceData.risks,
                        )}

                      {viewTab === "risk-mitigation" &&
                        viewingRecord.dueDiligenceData?.risks?.riskMitigation &&
                        renderRiskMitigation(
                          viewingRecord.dueDiligenceData.risks,
                        )}

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
                            // Display the generated statement
                            renderDiligenceStatement(
                              viewingRecord,
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
                  (isVerifier ? (
                    <VerifierRiskAssessmentModal />
                  ) : (
                    // Importer's risk assessment (original)
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                          <FaInfoCircle className="inline mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            Please assess the risk level of this trade and
                            provide supporting documentation. Officer details
                            are now required for all due diligence.
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                          Risk Level *
                        </label>
                        <div className="space-y-2">
                          {["low risk", "negligible risk", "high risk"].map(
                            (level) => (
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
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                    )
                                    .join(" ")}
                                </span>
                              </label>
                            ),
                          )}
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
                              onClick={handleAddOfficerInfo}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Save Officer Information
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
                            <FaUpload className="mr-2" size={12} />
                            Add Document
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
                                onClick={() => handleRemoveAssessmentDoc(idx)}
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
                          onClick={handleSaveRiskAssessment}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Save & Continue
                        </button>
                      </div>
                    </div>
                  ))}

                {modalMode === "risk-mitigation" && !isVerifier && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-red-800 flex items-start">
                        <FaExclamationTriangle className="inline mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          High risk trade detected. Please complete all required
                          risk mitigation steps.
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
                          <p className="text-sm font-medium mb-1">
                            Appointment Letter:
                          </p>
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
                        ].map((sub, idx) => (
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
                              {riskMitigation.highRiskSection[sub]?.map(
                                (doc, idx) => renderDocumentBox(doc, idx),
                              )}
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
                              (a) Model risk management practices, reporting,
                              record-keeping
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
                              (doc, idx) => renderDocumentBox(doc, idx),
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
                              (doc, idx) => renderDocumentBox(doc, idx),
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
                        {riskMitigation.decisionsReview?.map((doc, idx) =>
                          renderDocumentBox(doc, idx),
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
                        onClick={handleSaveRiskMitigation}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
                      >
                        <FaSave className="mr-2 flex-shrink-0" />
                        Complete Due Diligence
                      </button>
                    </div>
                  </div>
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
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
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
                    const filteredProducts = commodity.products.filter(
                      (product) =>
                        product.code.includes(hsCodeSearch) ||
                        product.name
                          .toLowerCase()
                          .includes(hsCodeSearch.toLowerCase()),
                    );

                    if (filteredProducts.length === 0) return null;

                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-t-lg font-semibold text-gray-700 text-sm sm:text-base">
                          {commodity.commodity}
                        </div>
                        <div className="p-3 sm:p-4 space-y-2">
                          {filteredProducts.map((product, pidx) => (
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
                    onClick={handleAddAssessmentDoc}
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
                    <div className="flex items-start justify-between mb-2">
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
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        {item.articleTitle}
                      </h4>
                      <div className="space-y-1">
                        {item.notes.map((note, noteIdx) => (
                          <div
                            key={noteIdx}
                            className="text-sm text-gray-600 pl-6 border-l-2 border-green-200 ml-2"
                          >
                            • {note}
                          </div>
                        ))}
                      </div>
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

export default PastDueDiligence;
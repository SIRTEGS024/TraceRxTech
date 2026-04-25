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
import { GoogleMap, Polygon, InfoWindow } from "@react-google-maps/api";
import { Layers, Info, X, MapPin } from "lucide-react";

// Helper to convert [lat, lng] array to {lat, lng} object
const convertToLatLng = (coord) => {
  if (Array.isArray(coord)) return { lat: coord[0], lng: coord[1] };
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

// Map Component (view‑only) – unchanged
const MapViewOnly = ({
  coordinates = [],
  facilityAreas = [],
  facilityName = "",
  facilityAddress = "",
}) => {
  const isLoaded = useGoogleMapsLoaded();
  const [selectedArea, setSelectedArea] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [map, setMap] = useState(null);

  const calculateCenter = () => {
    if (facilityAreas.length > 0 && facilityAreas[0].coordinates?.length) {
      const coord = convertToLatLng(facilityAreas[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    if (coordinates.length > 0 && coordinates[0].coordinates?.length) {
      const coord = convertToLatLng(coordinates[0].coordinates[0]);
      return { lat: coord.lat, lng: coord.lng };
    }
    return { lat: 0, lng: 0 };
  };

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);
  const getPolygonPaths = (coords) =>
    coords.map((coord) => convertToLatLng(coord));

  const handleAreaClick = (area, event) => {
    event.stop();
    setSelectedArea(area);
    setInfoWindowPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    setShowInfoWindow(true);
  };

  useEffect(() => {
    if (map && (facilityAreas.length || coordinates.length)) {
      const bounds = new window.google.maps.LatLngBounds();
      facilityAreas.forEach((area) =>
        area.coordinates?.forEach((coord) =>
          bounds.extend(convertToLatLng(coord)),
        ),
      );
      coordinates.forEach((plot) =>
        plot.coordinates?.forEach((coord) =>
          bounds.extend(convertToLatLng(coord)),
        ),
      );
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
          <span className="text-sm text-gray-700">
            Facility Main Harvest Zone
          </span>
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
              <span className="text-sm font-medium text-gray-700">
                {facilityName}
              </span>
              <span className="text-xs text-gray-500">| {facilityAddress}</span>
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={calculateCenter()}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: "satellite",
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            fullscreenControl: true,
          }}
        >
          {facilityAreas.map(
            (area, index) =>
              area.coordinates?.length >= 3 && (
                <Polygon
                  key={`facility-${index}`}
                  paths={getPolygonPaths(area.coordinates)}
                  options={{
                    fillColor: "#3b82f6",
                    fillOpacity: 0.2,
                    strokeColor: "#2563eb",
                    strokeWeight: 2,
                    strokeOpacity: 0.8,
                    zIndex: 1,
                    clickable: true,
                  }}
                  onClick={(e) =>
                    handleAreaClick(
                      {
                        type: "facility",
                        name: area.name || facilityName || "Production Site",
                        hectares: area.hectares || 0,
                        points: area.coordinates.length,
                      },
                      e,
                    )
                  }
                />
              ),
          )}
          {coordinates.map(
            (plot) =>
              plot.coordinates?.length >= 3 && (
                <Polygon
                  key={plot.id || `plot-${Math.random()}`}
                  paths={getPolygonPaths(plot.coordinates)}
                  options={{
                    fillColor: "#22c55e",
                    fillOpacity: 0.4,
                    strokeColor: "#16a34a",
                    strokeWeight: 2,
                    zIndex: 2,
                    clickable: true,
                  }}
                  onClick={(e) =>
                    handleAreaClick(
                      {
                        type: "planting",
                        name: plot.name,
                        hectares: plot.hectares,
                        points: plot.coordinates.length,
                        coordinates: plot.coordinates,
                      },
                      e,
                    )
                  }
                />
              ),
          )}
          {showInfoWindow && selectedArea && infoWindowPosition && (
            <InfoWindow
              position={infoWindowPosition}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {selectedArea.name}
                </h4>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span>{" "}
                    {selectedArea.type === "facility"
                      ? "Production Site"
                      : "Harvest Area"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Area:</span>{" "}
                    {selectedArea.hectares} hectares
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Points:</span>{" "}
                    {selectedArea.points}
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

  const isVerifier = user?.role === "verifier" && user.loggedInAs;
  const companyId = isVerifier ? user.loggedInAs.companyId : null;
  const targetImporter = isVerifier ? demoData.users[companyId] : user;

  const [shipments, setShipments] = useState([]);
  const [currentRecords, setCurrentRecords] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("start");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewTab, setViewTab] = useState("importer-info");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [diligenceForm, setDiligenceForm] = useState({
    name: "",
    function: "",
    eoriNumber: "",
    signature: null,
    url: null,
  });

  const [formData, setFormData] = useState({
    description: "",
    hsCodes: [],
    containers: [],
    customerName: "",
    customerAddress: "",
    customerEmail: "",
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductsKg, setSelectedProductsKg] = useState({});
  const [newContainer, setNewContainer] = useState({
    containerNumber: "",
    kilograms: "",
  });

  const [riskLevel, setRiskLevel] = useState("");
  const [assessmentDocs, setAssessmentDocs] = useState([]);
  const [showAssessmentDocModal, setShowAssessmentDocModal] = useState(false);
  const [assessmentDocDesc, setAssessmentDocDesc] = useState("");

  const [riskMitigation, setRiskMitigation] = useState({
    highRiskSection: {
      additionalInfo: [],
      independentSurveys: [],
      otherMeasures: [],
      capacityBuilding: [],
    },
    policiesControls: { modelPractices: [], independentAudit: [] },
    decisionsReview: [],
  });
  const [showDocModal, setShowDocModal] = useState(false);
  const [docModalData, setDocModalData] = useState({
    section: "",
    subsection: "",
    description: "",
  });

  const [officerName, setOfficerName] = useState("");
  const [officerIdCard, setOfficerIdCard] = useState(null);
  const [appointmentLetter, setAppointmentLetter] = useState(null);

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

  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const articleTitles = {
    "article-7":
      "Article 7 – Placing on the market by operators established in third countries",
    "article-8": "Article 8 – Due Diligence",
    "article-9": "Article 9 – Information Requirements",
    "article-10": "Article 10 – Risk Assessment",
    "article-11": "Article 11 – Risk Mitigation",
  };

  useEffect(() => {
    if (targetImporter?.id && targetImporter.shipmentId) {
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
        .filter((s) => s);
      const recordsMap = {};
      if (targetImporter.currentSupplierRecords)
        targetImporter.currentSupplierRecords.forEach((record) => {
          recordsMap[record.batchNumber] = record;
        });
      setShipments(shipmentList);
      setCurrentRecords(recordsMap);
    }
  }, [targetImporter, demoData]);

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
            if (notesMap[mappedKey]) notesMap[mappedKey] = art.notes || [];
          });
          setVerificationNotesByArticle(notesMap);
          setInitialVerificationNotesByArticle(
            JSON.parse(JSON.stringify(notesMap)),
          );
        }
      }
    }
  }, [isVerifier, targetImporter, user]);

  useEffect(() => {
    if (!isVerifier && targetImporter) {
      const linkedVerifiers = targetImporter.linkedVerifiers || [];
      const grouped = {};
      linkedVerifiers.forEach((verifierLink) => {
        const verifier = demoData.users[verifierLink.id];
        if (!verifier?.verificationReports) return;
        const report = verifier.verificationReports.find(
          (r) => r.companyId === targetImporter.id,
        );
        if (report) {
          const artFindings = report.findings?.find(
            (f) => f.tab === "current-due-diligence",
          );
          if (artFindings?.articles?.length) {
            const verifierName = verifier.basicInfo?.firstName
              ? `${verifier.basicInfo.firstName} ${verifier.basicInfo.lastName}`
              : verifier.basicInfo?.email || verifier.id;
            if (!grouped[verifier.id])
              grouped[verifier.id] = {
                verifierName,
                status: artFindings.status,
                articles: [],
                date: report.date,
              };
            artFindings.articles.forEach((article) => {
              if (article.notes?.length)
                grouped[verifier.id].articles.push({
                  article: article.article,
                  title: articleTitles[article.article] || article.article,
                  notes: article.notes,
                });
            });
          }
        }
      });
      setVerificationHistory(Object.values(grouped));
    }
  }, [isVerifier, targetImporter, demoData]);

  const areAllRecordsReady = () =>
    shipments.length === 0 ||
    shipments.every((ship) => {
      const record = currentRecords[ship.batchNumber];
      if (!record) return false;
      if (!record.risks?.riskAssessment) return false;
      if (
        record.risks.riskAssessment.riskLevel === "high risk" &&
        !record.risks?.riskMitigation
      )
        return false;
      return true;
    });
  const hasVerificationChanges = () =>
    verificationStatus !== initialVerificationStatus ||
    JSON.stringify(verificationNotesByArticle) !==
      JSON.stringify(initialVerificationNotesByArticle);

  const handleAddContainer = () => {
    if (!newContainer.containerNumber.trim()) {
      toast.error("Please enter container number");
      return;
    }
    const kg = parseFloat(newContainer.kilograms);
    if (isNaN(kg) || kg <= 0) {
      toast.error(
        "Please enter valid kilograms (positive number) for this container",
      );
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

  const calculateTotalNetMassFromHsCodes = (hsCodesArray) =>
    hsCodesArray.reduce((sum, item) => sum + (item.kilograms || 0), 0);

  const handleStartDueDiligence = (shipment) => {
    const prefillDescription = shipment.productDescription || "";
    const prefillContainers = shipment.containers
      ? shipment.containers.map((c) => ({
          containerNumber: c.containerNumber,
          kilograms: "",
        }))
      : [];
    const exporterId = shipment.exporterId;
    let products = [];
    if (targetImporter.supportedCommodities) {
      for (const commodityGroup of targetImporter.supportedCommodities) {
        for (const prod of commodityGroup.products) {
          if (prod.supplier === exporterId) {
            products.push({
              commodity: commodityGroup.commodity,
              code: prod.code,
              name: prod.name,
              supplier: exporterId,
            });
          }
        }
      }
    }
    setAvailableProducts(products);
    setSelectedProductsKg({});
    setSelectedShipment(shipment);
    setModalMode("start");
    setCurrentStep(1);
    setFormData({
      description: prefillDescription,
      hsCodes: [],
      containers: prefillContainers,
      customerName: "",
      customerAddress: "",
      customerEmail: "",
    });
    setShowModal(true);
  };

  const handleProductSelection = (productCode, isChecked) => {
    if (isChecked)
      setSelectedProductsKg((prev) => ({ ...prev, [productCode]: 0 }));
    else
      setSelectedProductsKg((prev) => {
        const newState = { ...prev };
        delete newState[productCode];
        return newState;
      });
  };

  const handleProductKgChange = (productCode, kgValue) => {
    const kg = kgValue === "" ? "" : parseFloat(kgValue);
    setSelectedProductsKg((prev) => ({ ...prev, [productCode]: kg }));
  };

  const handleSaveImporterInfo = () => {
    const selectedHs = [];
    for (const prod of availableProducts) {
      const kg = selectedProductsKg[prod.code];
      if (kg !== undefined && kg !== "" && kg > 0)
        selectedHs.push({
          commodity: prod.commodity,
          code: prod.code,
          name: prod.name,
          kilograms: kg,
        });
    }
    if (!selectedHs.length) {
      toast.error("Please select at least one HS code and specify kilograms");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.containers.length) {
      toast.error("Please add at least one container");
      return;
    }
    // Check that all containers have kilograms entered
    const invalidContainer = formData.containers.find(
      (c) => !c.kilograms || c.kilograms <= 0,
    );
    if (invalidContainer) {
      toast.error("Please enter valid kilograms for all containers");
      return;
    }
    if (
      !formData.customerName ||
      !formData.customerAddress ||
      !formData.customerEmail
    ) {
      toast.error("Please select a customer");
      return;
    }
    setFormData((prev) => ({ ...prev, hsCodes: selectedHs }));
    setModalMode("payment");
  };

  const calculateAmount = (netMassKg) =>
    Math.ceil((parseFloat(netMassKg) / 20000) * 10);
  const handlePayment = () => {
    const totalNetMass = calculateTotalNetMassFromHsCodes(formData.hsCodes);
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
      if (existingIndex >= 0)
        updatedImporter.currentSupplierRecords[existingIndex] = newRecord;
      else updatedImporter.currentSupplierRecords.push(newRecord);
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

  const handlePerformMitigation = (shipment, record) => {
    setSelectedShipment(shipment);
    setSelectedRecord(record);
    const existing = record.risks?.riskMitigation;
    if (existing) setRiskMitigation(existing);
    else
      setRiskMitigation({
        highRiskSection: {
          additionalInfo: [],
          independentSurveys: [],
          otherMeasures: [],
          capacityBuilding: [],
        },
        policiesControls: { modelPractices: [], independentAudit: [] },
        decisionsReview: [],
      });
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
      } else if (docModalData.section === "decisionsReview")
        updated.decisionsReview.push(newDoc);
      return updated;
    });
    setDocModalData({ section: "", subsection: "", description: "" });
    setShowDocModal(false);
    toast.success("Document added");
  };

  const removeMitigationDoc = (section, subsection, index) => {
    setRiskMitigation((prev) => {
      const updated = { ...prev };
      if (section === "highRiskSection")
        updated.highRiskSection[subsection] = updated.highRiskSection[
          subsection
        ].filter((_, i) => i !== index);
      else if (section === "policiesControls")
        updated.policiesControls[subsection] = updated.policiesControls[
          subsection
        ].filter((_, i) => i !== index);
      else if (section === "decisionsReview")
        updated.decisionsReview = updated.decisionsReview.filter(
          (_, i) => i !== index,
        );
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
      if (riskLevel === "high risk") newStatus = "awaiting-mitigation";
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
    if (record.diligenceStatement)
      setDiligenceForm({
        name: record.diligenceStatement.name || "",
        function: record.diligenceStatement.function || "",
        eoriNumber: record.diligenceStatement.eoriNumber || "",
        signature: record.diligenceStatement.signature || null,
        url: record.diligenceStatement.url || null,
      });
    else
      setDiligenceForm({
        name: "",
        function: "",
        eoriNumber: "",
        signature: null,
        url: null,
      });
  };

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
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Description</p>
            <p className="font-medium text-sm sm:text-base break-words">
              {record.description}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
          <FaBoxes className="mr-2 flex-shrink-0" /> HS Codes & Supplied
          Quantities
        </h3>
        <div className="space-y-2">
          {record.hsCodes.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-2 sm:p-3 rounded border border-blue-200"
            >
              <p className="text-xs sm:text-sm font-medium break-words">
                {item.code} - {item.name}
              </p>
              <p className="text-xs text-gray-600">
                Commodity: {item.commodity}
              </p>
              <p className="text-xs text-gray-600 font-semibold">
                Kilograms: {item.kilograms?.toLocaleString()} kg
              </p>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="font-medium text-sm">
              Total Net Mass: {record.netMassKg.toLocaleString()} kg
            </p>
          </div>
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
                Weight received: {container.kilograms?.toLocaleString()} kg
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
          <p>
            <span className="text-xs text-gray-600">Name:</span>{" "}
            {record.customerName}
          </p>
          <p>
            <span className="text-xs text-gray-600">Address:</span>{" "}
            {record.customerAddress}
          </p>
          <p>
            <span className="text-xs text-gray-600">Email:</span>{" "}
            {record.customerEmail}
          </p>
        </div>
      </div>
      <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center text-sm sm:text-base">
          <FaMoneyBillWave className="mr-2 flex-shrink-0" /> Payment Information
        </h3>
        <div className="space-y-2">
          <p>Amount Paid: ${record.amount}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Payment Status:</span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${record.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {record.paymentStatus ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Due Diligence Status:</span>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${record.status === "approved" ? "bg-green-100 text-green-800" : record.status === "awaiting-mitigation" ? "bg-yellow-100 text-yellow-800" : record.status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
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
            <p>Name: {record.risks.officerName}</p>
            {record.risks.officerIdCard && (
              <div>
                <p className="text-xs text-gray-600 mb-1">ID Card:</p>
                {renderDocumentBox(record.risks.officerIdCard, "officer-id")}
              </div>
            )}
            {record.risks.appointmentLetter && (
              <div>
                <p className="text-xs text-gray-600 mb-1">
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
    const facilities =
      exporter.facilities?.filter((f) => f.type === "production/forest site") ||
      [];
    const facilityAreas = facilities.flatMap((f) => f.areas || []);
    const harvestAreas = [];
    if (shipment.forests)
      shipment.forests.forEach((forest) => {
        if (forest.harvestAreas)
          forest.harvestAreas.forEach((area) => {
            harvestAreas.push({
              id: `${forest.forestId}-${area.name}`,
              name: area.name,
              hectares: area.hectares,
              coordinates: area.coordinates,
            });
          });
      });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Company Name</p>
              <p className="font-medium">{exporter.basicInfo.companyName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Country</p>
              <p className="font-medium">{exporter.basicInfo.country}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-medium">{exporter.basicInfo.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Registration No.</p>
              <p className="font-medium">{exporter.basicInfo.rcNumber}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
            <FaBoxes className="mr-2 flex-shrink-0" /> Supplied Products &
            Quantities (from Due Diligence)
          </h3>
          <div className="space-y-2">
            {record.hsCodes.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-2 sm:p-3 rounded border border-blue-200"
              >
                <p className="text-xs sm:text-sm font-medium break-words">
                  {item.code} - {item.name}
                </p>
                <p className="text-xs text-gray-600">
                  Commodity: {item.commodity}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Kilograms supplied: {item.kilograms?.toLocaleString()} kg
                </p>
              </div>
            ))}
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
            {shipment.containers?.length > 0 && (
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
                      <span className="font-medium">Weight received:</span>{" "}
                      {c.kilograms ? `${c.kilograms} kg` : "Not specified"}{" "}
                    </p>
                    {c.packingList && (
                      <div>
                        <span className="font-medium">Packing List:</span>{" "}
                        {renderDocumentBox(c.packingList, `packing-${idx}`)}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {shipment.forests?.length > 0 && (
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
                  <span className="font-medium">
                    Quantity (for this forest):
                  </span>{" "}
                  {forest.quantity
                    ? `${forest.quantity} kg`
                    : forest.selectedProducts?.reduce(
                        (sum, p) => sum + (p.quantity || 0),
                        0,
                      ) || "N/A"}{" "}
                  kg
                </p>
                {forest.harvestAreas?.length > 0 && (
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
                        {area.coordinates?.length > 0 && (
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
        {(facilityAreas.length || harvestAreas.length) && (
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
      <div className="space-y-4">
        <div
          className={`p-4 rounded-lg ${risks.riskAssessment.riskLevel === "high risk" ? "bg-red-50" : risks.riskAssessment.riskLevel === "low risk" ? "bg-green-50" : "bg-yellow-50"}`}
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FaExclamationTriangle /> Risk Level
          </h3>
          <p
            className={`text-lg font-bold ${risks.riskAssessment.riskLevel === "high risk" ? "text-red-800" : risks.riskAssessment.riskLevel === "low risk" ? "text-green-800" : "text-yellow-800"}`}
          >
            {risks.riskAssessment.riskLevel}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaFileAlt /> Supporting Documents
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
      <div className="space-y-4">
        {mitigation.highRiskSection && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">
              High Risk Section
            </h3>
            {mitigation.highRiskSection.additionalInfo?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Additional Information
                </p>
                {mitigation.highRiskSection.additionalInfo.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
            {mitigation.highRiskSection.independentSurveys?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Independent Surveys/Audits
                </p>
                {mitigation.highRiskSection.independentSurveys.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
            {mitigation.highRiskSection.otherMeasures?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Other Measures</p>
                {mitigation.highRiskSection.otherMeasures.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
            {mitigation.highRiskSection.capacityBuilding?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Capacity Building & Investments
                </p>
                {mitigation.highRiskSection.capacityBuilding.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
          </div>
        )}
        {mitigation.policiesControls && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">
              Policies, Controls & Procedures
            </h3>
            {mitigation.policiesControls.modelPractices?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Model Risk Management Practices
                </p>
                {mitigation.policiesControls.modelPractices.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
            {mitigation.policiesControls.independentAudit?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Independent Audit Function
                </p>
                {mitigation.policiesControls.independentAudit.map((d, i) =>
                  renderDocumentBox(d, i),
                )}
              </div>
            )}
          </div>
        )}
        {mitigation.decisionsReview?.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              Decisions on Risk Mitigation Procedures
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Reviewed at least on an annual basis
            </p>
            {mitigation.decisionsReview.map((d, i) => renderDocumentBox(d, i))}
          </div>
        )}
      </div>
    );
  };

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
      record.hsCodes
        ?.map((h) => `${h.code} (${h.name}): ${h.kilograms} kg`)
        .join(", ") || "Not specified";
    const netMass = record.netMassKg?.toLocaleString() || "N/A";
    const productionLocation = record.supplierAddress || "Unknown";
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    let geolocation = "Not available";
    if (shipment?.forests?.length) {
      const harvestAreas = shipment.forests.flatMap(
        (f) => f.harvestAreas || [],
      );
      if (harvestAreas.length)
        geolocation = harvestAreas
          .map(
            (area) =>
              `${area.name} (${area.hectares} ha) - Coordinates: ${area.coordinates?.map((c) => (Array.isArray(c) ? `${c[0]},${c[1]}` : `${c.lat},${c.lng}`)).join("; ")}`,
          )
          .join(" | ");
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
            <strong>HS Codes & Quantities:</strong> {hsCodesList}
            <br />
            <strong>Trade Name/Description:</strong> {record.description}
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
            (if applicable): <strong>{record.batchNumber}</strong>
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
    if (!diligenceForm.signature)
      setDiligenceForm((prev) => ({
        ...prev,
        signature: "https://cloud-storage.com/demo/signature.png",
        url: "https://cloud-storage.com/demo/signature.png",
      }));
    const statementData = {
      name: diligenceForm.name,
      function: diligenceForm.function,
      eoriNumber: diligenceForm.eoriNumber,
      signature: diligenceForm.signature,
      url: diligenceForm.url,
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
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          Please assess the risk level and provide supporting documentation.
          Officer details are required.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Risk Level *</label>
        <div className="space-y-2">
          {["low risk", "negligible risk", "high risk"].map((level) => (
            <label
              key={level}
              className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="riskLevel"
                value={level}
                checked={riskLevel === level}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="h-4 w-4 text-green-600"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Responsible Officer *
        </label>
        <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
          <input
            type="text"
            placeholder="Full Name"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOfficerIdCard({
                  name: "Officer ID Card",
                  url: "dummy-id-card.pdf",
                });
                toast.info("ID card added");
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              <FaUpload size={12} /> Upload ID Card
            </button>
            <button
              onClick={() => {
                setAppointmentLetter({
                  name: "Appointment Letter",
                  url: "dummy-appointment.pdf",
                });
                toast.info("Appointment letter added");
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              <FaUpload size={12} /> Upload Appointment Letter
            </button>
          </div>
          {officerIdCard && appointmentLetter && (
            <div className="text-green-700 text-sm">
              ✓ Officer information saved
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            Supporting Documents *
          </label>
          <button
            onClick={() => setShowAssessmentDocModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
          >
            <FaUpload size={12} /> Add Document
          </button>
        </div>
        <div className="space-y-2">
          {assessmentDocs.map((doc, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-2 rounded border"
            >
              <span>{doc.name}</span>
              <button
                onClick={() =>
                  setAssessmentDocs(
                    assessmentDocs.filter((_, idx) => idx !== i),
                  )
                }
              >
                <FaTimes className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRiskAssessmentForVerifier}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
        >
          <FaSave size={14} /> Save Risk Assessment
        </button>
      </div>
    </div>
  );

  const ImporterRiskMitigationModal = () => (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800 flex items-center gap-2">
          <FaExclamationTriangle /> High risk trade detected. Complete all
          required mitigation steps.
        </p>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-800 mb-2">
          Responsible Officer
        </h3>
        <p>Name: {officerName}</p>
        {officerIdCard && (
          <div>ID Card: {renderDocumentBox(officerIdCard, "officer-id")}</div>
        )}
        {appointmentLetter && (
          <div>
            Appointment Letter:{" "}
            {renderDocumentBox(appointmentLetter, "appointment")}
          </div>
        )}
      </div>
      <div className="border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-3">High Risk Section</h3>
        {[
          "additionalInfo",
          "independentSurveys",
          "otherMeasures",
          "capacityBuilding",
        ].map((sub) => (
          <div key={sub} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                {sub === "additionalInfo" && "(a) Additional information"}
                {sub === "independentSurveys" && "(b) Independent surveys"}
                {sub === "otherMeasures" && "(c) Other measures"}
                {sub === "capacityBuilding" && "(d) Capacity building"}
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
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
              >
                <FaUpload size={12} /> Add Document
              </button>
            </div>
            <div className="space-y-2">
              {riskMitigation.highRiskSection[sub]?.map((d, i) =>
                renderDocumentBox(d, i),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-3">
          Policies, Controls & Procedures
        </h3>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">
              (a) Model risk management practices
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
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              <FaUpload size={12} /> Add Document
            </button>
          </div>
          <div className="space-y-2">
            {riskMitigation.policiesControls.modelPractices.map((d, i) =>
              renderDocumentBox(d, i),
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">
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
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              <FaUpload size={12} /> Add Document
            </button>
          </div>
          <div className="space-y-2">
            {riskMitigation.policiesControls.independentAudit?.map((d, i) =>
              renderDocumentBox(d, i),
            )}
          </div>
        </div>
      </div>
      <div className="border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-green-800">
            Decisions on Risk Mitigation
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
          >
            <FaUpload size={12} /> Add Document
          </button>
        </div>
        <div className="space-y-2">
          {riskMitigation.decisionsReview.map((d, i) =>
            renderDocumentBox(d, i),
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveRiskMitigation}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
        >
          <FaSave size={14} /> Complete Mitigation
        </button>
      </div>
    </div>
  );

  const handleAddNote = (article) => {
    const note = newNoteByArticle[article];
    if (note?.trim()) {
      setVerificationNotesByArticle((prev) => ({
        ...prev,
        [article]: [...(prev[article] || []), note.trim()],
      }));
      setNewNoteByArticle((prev) => ({ ...prev, [article]: "" }));
    }
  };
  const handleRemoveNote = (article, index) =>
    setVerificationNotesByArticle((prev) => ({
      ...prev,
      [article]: prev[article].filter((_, i) => i !== index),
    }));
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
    ))
      if (notes?.length)
        articles.push({
          article: articleKey.replace("article", "article-"),
          notes,
        });
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
    } else
      reports.push({
        id: `ver-report-${Date.now()}`,
        companyId: targetImporter.id,
        companyType: targetImporter.role,
        date: new Date().toISOString().split("T")[0],
        type: "compliance audit",
        status: "pending",
        findings: [artFindings],
      });
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
  const handleCustomerSelect = (customer) =>
    setFormData((prev) => ({
      ...prev,
      customerName: customer.name,
      customerAddress: customer.address,
      customerEmail: customer.email,
    }));

  if (!targetImporter)
    return (
      <div className="p-6 text-center">
        <p>Loading company data...</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">
          Current Due Diligence (Articles 7‑11)
        </h1>
        {!isVerifier && verificationHistory.length > 0 && (
          <button
            onClick={() => setShowNotesModal(true)}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
          >
            <FaComment />
            <span>
              {verificationHistory.length} Verifier
              {verificationHistory.length > 1 ? "s" : ""} left notes
            </span>
          </button>
        )}
      </div>
      {isVerifier && (
        <div className="bg-white rounded-xl p-6 shadow-lg border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardCheck className="text-green-600" />
            <h2 className="text-xl font-semibold">
              Verification – Current Due Diligence
            </h2>
            <span
              className={`px-2 py-1 text-xs rounded-full ${verificationStatus === "compliant" ? "bg-green-100 text-green-800" : verificationStatus === "non-compliant" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}
            >
              {verificationStatus
                ? verificationStatus.replace("-", " ")
                : "Not set"}
            </span>
          </div>
          <div className="flex gap-4 mb-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="compliant"
                checked={verificationStatus === "compliant"}
                onChange={() => setVerificationStatus("compliant")}
              />{" "}
              Compliant
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="non-compliant"
                checked={verificationStatus === "non-compliant"}
                onChange={() => setVerificationStatus("non-compliant")}
              />{" "}
              Non‑compliant
            </label>
          </div>
          {articles.map((article) => (
            <div key={article.id} className="mb-6 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                {article.title}
              </h3>
              {verificationNotesByArticle[article.id]?.length > 0 && (
                <div className="mb-3 space-y-2">
                  {verificationNotesByArticle[article.id].map((note, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-3 rounded-lg flex justify-between"
                    >
                      <span>{note}</span>
                      <button
                        onClick={() => handleRemoveNote(article.id, i)}
                        className="text-red-500"
                      >
                        <FaTimes />
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
                  placeholder={`Add a note...`}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={() => handleAddNote(article.id)}
                  disabled={!newNoteByArticle[article.id]?.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={handleSaveVerification}
              disabled={!areAllRecordsReady() || !hasVerificationChanges()}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm ${!areAllRecordsReady() || !hasVerificationChanges() ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white"}`}
            >
              <FaSave size={14} /> Save Verification
            </button>
          </div>
          {!areAllRecordsReady() && shipments.length > 0 && (
            <p className="text-amber-600 text-sm mt-2">
              Verification can only be saved after all shipments have completed
              due diligence.
            </p>
          )}
        </div>
      )}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Current Shipments</h2>
          <p className="text-sm text-gray-500">
            Active shipments requiring due diligence.
          </p>
        </div>
        {shipments.length === 0 ? (
          <div className="text-center py-8">
            <FaShippingFast className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No current shipments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment) => {
              const record = currentRecords[shipment.batchNumber];
              const recordExists = !!record;
              const paymentStatus = record?.paymentStatus;
              const status =
                record?.status ||
                (shipment.status === "approved" ? "approved" : "not-started");
              const riskAssessmentDone = !!record?.risks?.riskAssessment;
              const riskMitigationDone = !!record?.risks?.riskMitigation;
              const riskLevel = record?.risks?.riskAssessment?.riskLevel;
              let button = null;
              if (!isVerifier) {
                if (!recordExists)
                  button = (
                    <button
                      onClick={() => handleStartDueDiligence(shipment)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                    >
                      <FaPlus size={14} /> Start
                    </button>
                  );
                else if (paymentStatus && status === "in-progress")
                  button = (
                    <div className="inline-flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg text-sm">
                      <FaHourglassHalf /> Waiting for Assessment
                    </div>
                  );
                else if (status === "awaiting-mitigation")
                  button = (
                    <button
                      onClick={() => handlePerformMitigation(shipment, record)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm"
                    >
                      <FaShieldAlt size={14} /> Perform Mitigation
                    </button>
                  );
                else if (status === "approved")
                  button = (
                    <button
                      onClick={() => handleViewDetails(shipment, record)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      <FaEye size={14} /> View Details
                    </button>
                  );
              } else {
                if (!recordExists)
                  button = (
                    <span className="text-gray-400 text-sm">
                      Awaiting Importer
                    </span>
                  );
                else if (!riskAssessmentDone)
                  button = (
                    <button
                      onClick={() => handleRiskAssessment(shipment, record)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                    >
                      <FaShieldAlt size={14} /> Assess Risk
                    </button>
                  );
                else
                  button = (
                    <button
                      onClick={() => handleViewDetails(shipment, record)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      <FaEye size={14} /> View Details
                    </button>
                  );
              }
              return (
                <div
                  key={shipment.id}
                  className="bg-gray-50 p-4 rounded-lg border hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Batch: {shipment.batchNumber}
                      </p>
                      <h4 className="font-semibold">
                        {demoData.users[shipment.exporterId]?.basicInfo
                          ?.companyName || "Unknown"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {shipment.productDescription}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${status === "approved" ? "bg-green-100 text-green-800" : status === "awaiting-mitigation" ? "bg-yellow-100 text-yellow-800" : status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
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
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Paid
                          </span>
                        )}
                        {riskAssessmentDone && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Risk: {riskLevel}
                          </span>
                        )}
                        {riskMitigationDone && (
                          <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                            Mitigated
                          </span>
                        )}
                      </div>
                    </div>
                    <div>{button}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
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
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                {modalMode === "start" && !isVerifier && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 flex items-start gap-2">
                        <FaInfoCircle className="mt-0.5" /> Please confirm
                        shipment information and provide additional details.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        HS Codes supplied by exporter *
                      </label>
                      {availableProducts.length === 0 ? (
                        <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm">
                          No pre‑defined products found for this exporter.
                          Please contact support.
                        </div>
                      ) : (
                        <div className="space-y-3 border rounded-lg p-3">
                          {availableProducts.map((prod) => (
                            <div
                              key={prod.code}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-start gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedProductsKg[prod.code] !==
                                      undefined &&
                                    selectedProductsKg[prod.code] !== ""
                                  }
                                  onChange={(e) =>
                                    handleProductSelection(
                                      prod.code,
                                      e.target.checked,
                                    )
                                  }
                                  className="mt-1 h-4 w-4 text-green-600"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {prod.code} - {prod.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Commodity: {prod.commodity}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={
                                    selectedProductsKg[prod.code] !==
                                      undefined &&
                                    selectedProductsKg[prod.code] !== ""
                                      ? selectedProductsKg[prod.code]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleProductKgChange(
                                      prod.code,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Kg supplied"
                                  className="w-32 px-2 py-1 border rounded text-sm"
                                  disabled={
                                    selectedProductsKg[prod.code] ===
                                      undefined ||
                                    selectedProductsKg[prod.code] === ""
                                  }
                                />
                                <span className="text-xs">kg</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border rounded-lg p-3">
                      <label className="block text-sm font-medium mb-2">
                        Container Details *
                      </label>
                      <div className="space-y-2 mb-3">
                        {formData.containers.map((c, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-2 rounded"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                value={c.containerNumber}
                                disabled
                                className="w-full px-2 py-1 border rounded bg-gray-100 text-sm"
                              />
                            </div>
                            <div className="w-32">
                              <input
                                type="number"
                                value={c.kilograms}
                                onChange={(e) => {
                                  const newContainers = [
                                    ...formData.containers,
                                  ];
                                  newContainers[i].kilograms =
                                    parseFloat(e.target.value) || "";
                                  setFormData({
                                    ...formData,
                                    containers: newContainers,
                                  });
                                }}
                                placeholder="Kg received"
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveContainer(i)}
                              className="text-red-500"
                            >
                              <FaTrashAlt />
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
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Kilograms received"
                          value={newContainer.kilograms}
                          onChange={(e) =>
                            setNewContainer({
                              ...newContainer,
                              kilograms: e.target.value,
                            })
                          }
                          className="w-40 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                          onClick={handleAddContainer}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm whitespace-nowrap"
                        >
                          Add Container
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Customer *
                      </label>
                      <select
                        onChange={(e) => {
                          const cust =
                            targetImporter.euCustomers?.[e.target.value];
                          if (cust) handleCustomerSelect(cust);
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select a customer</option>
                        {targetImporter.euCustomers?.map((cust, idx) => (
                          <option key={idx} value={idx}>
                            {cust.name} - {cust.email}
                          </option>
                        ))}
                      </select>
                      {formData.customerName && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {formData.customerName} -{" "}
                          {formData.customerEmail}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveImporterInfo}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                      >
                        <FaSave size={14} /> Continue to Payment
                      </button>
                    </div>
                  </div>
                )}
                {modalMode === "payment" && !isVerifier && (
                  <div className="space-y-6 text-center">
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <FaMoneyBillWave className="text-5xl text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        Payment Required
                      </h3>
                      <p className="text-lg">
                        Amount to pay:{" "}
                        <span className="text-2xl font-bold text-green-600">
                          $
                          {calculateAmount(
                            calculateTotalNetMassFromHsCodes(formData.hsCodes),
                          )}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        ($10 per 20,000kg)
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">
                        <FaInfoCircle className="inline mr-2" /> Dummy payment
                        demonstration.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setModalMode("start")}
                        className="px-4 py-2 border rounded-lg text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 text-sm"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{" "}
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
                    <div className="space-y-4">
                      <div className="flex flex-nowrap gap-2 border-b overflow-x-auto pb-1">
                        <button
                          onClick={() => setViewTab("importer-info")}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewTab === "importer-info" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                        >
                          Importer Info
                        </button>
                        <button
                          onClick={() => setViewTab("exporter-info")}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewTab === "exporter-info" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                        >
                          Exporter Info
                        </button>
                        {viewingRecord.risks?.riskAssessment && (
                          <button
                            onClick={() => setViewTab("risk-assessment")}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewTab === "risk-assessment" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                          >
                            Risk Assessment
                          </button>
                        )}
                        {viewingRecord.risks?.riskMitigation && (
                          <button
                            onClick={() => setViewTab("risk-mitigation")}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewTab === "risk-mitigation" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                          >
                            Risk Mitigation
                          </button>
                        )}
                        <button
                          onClick={() => setViewTab("diligence-statement")}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${viewTab === "diligence-statement" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
                        >
                          Due Diligence Statement
                        </button>
                      </div>
                      <div>
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
                              <div className="bg-white rounded-lg p-6 border">
                                <h3 className="text-lg font-semibold mb-4">
                                  Due Diligence Statement Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
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
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
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
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
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
                                      className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                  </div>
                                  <div>
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
                                      className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                      <FaUpload size={12} /> Add Dummy Signature
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <button
                                    onClick={handleSaveDiligenceStatement}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                                  >
                                    <FaSave size={14} /> Save Statement
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
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
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

      <AnimatePresence>
        {showAssessmentDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowAssessmentDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">
                Add Supporting Document
              </h3>
              <input
                type="text"
                placeholder="Document description"
                value={assessmentDocDesc}
                onChange={(e) => setAssessmentDocDesc(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                autoFocus
              />
              <div className="bg-blue-50 p-3 rounded-lg text-sm mb-4">
                <FaInfoCircle className="inline mr-2" /> A dummy document will
                be created.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAssessmentDocModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
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
                    } else toast.error("Enter a description");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  <FaSave size={14} /> Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDocModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Add Document</h3>
              <input
                type="text"
                placeholder="Document description"
                value={docModalData.description}
                onChange={(e) =>
                  setDocModalData({
                    ...docModalData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                autoFocus
              />
              <div className="bg-blue-50 p-3 rounded-lg text-sm mb-4">
                <FaInfoCircle className="inline mr-2" /> A dummy document will
                be created.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDoc}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  <FaSave size={14} /> Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNotesModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
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
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <FaUser className="inline mr-2" />
                      <span className="font-medium">{item.verifierName}</span>
                      {item.date && (
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${item.status === "compliant" ? "bg-green-100 text-green-800" : item.status === "non-compliant" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}
                    >
                      {item.status ? item.status.replace("-", " ") : "Not set"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {item.articles.map((art, i2) => (
                      <div key={i2}>
                        <h4 className="text-sm font-semibold mb-2">
                          {art.title}
                        </h4>
                        <div className="space-y-1">
                          {art.notes.map((note, i3) => (
                            <div
                              key={i3}
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
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CurrentDueDiligence;

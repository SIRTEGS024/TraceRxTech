import { toast } from "react-toastify";
import { create } from "zustand";

// Helper function to generate TraceRx ID
const generateTraceRxId = (role) => {
  const prefix = role === "exporter" ? "EX" : role === "importer" ? "IM" : "UN";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

// Helper function to generate verification code (4-digit)
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Helper function to generate OTP (4-digit)
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Demo data schema with CORRECTED access tabs for exporters and importers
const demoData = {
  users: {
    "exporter-1": {
      id: "exporter-1",
      role: "exporter",
      password: "exporter123",
      isVerified: true,
      currentOtpKey: null,
      traceRxId: "EX123456",
      isRegistered: true,
      undertaken: {
        name: "John Adeyemi",
        function: "Managing Director",
        signature: "https://cloud-storage.com/docs/john-adeyemi.pdf",
        url: "https://cloud-storage.com/docs/john-adeyemi.pdf",
      },
      basicInfo: {
        companyName: "Green Timber Exports Ltd",
        email: "contact@greentimber.com",
        country: "Brazil",
        tinNumber: "BR-123456789",
        rcNumber: "RC-987654",
        licenseNumber: "EX-2023-0456",
      },
      documents: {
        registration: [
          {
            name: "Business License",
            url: "https://cloud-storage.com/docs/reg-1.pdf",
          },
          {
            name: "Tax Certificate",
            url: "https://cloud-storage.com/docs/reg-2.pdf",
          },
        ],
        licensesPermits: [
          {
            name: "Export Permit 2023",
            url: "https://cloud-storage.com/docs/lic-1.pdf",
          },
          {
            name: "Forestry License",
            url: "https://cloud-storage.com/docs/lic-2.pdf",
          },
        ],
        others: [
          {
            name: "ISO Certification",
            url: "https://cloud-storage.com/docs/other-1.pdf",
          },
        ],
      },
      contactPersons: [
        {
          id: "cp-1",
          fullName: "Maria Silva",
          telephone: "+55-11-98765-4321",
          address: "Av. Paulista 1000, São Paulo",
          email: "maria@greentimber.com",
          idCards: [
            {
              name: "National ID",
              url: "https://cloud-storage.com/ids/id-1.jpg",
            },
            {
              name: "Passport",
              url: "https://cloud-storage.com/ids/id-2.jpg",
            },
          ],
        },
      ],
      facilities: [
        {
          id: "fac-1",
          type: "Corporate facility",
          name: "Headquarters Office",
          address: "São Paulo, Brazil",
          photos: [
            {
              name: "Office Front",
              url: "https://cloud-storage.com/photos/office-1.jpg",
            },
          ],
          videos: [],
          staff: [
            {
              id: "staff-1",
              fullName: "Carlos Mendez",
              age: 42,
              jobDescription: "Operations Manager",
              idCard: {
                name: "staff id card",
                url: "https://cloud-storage.com/staff/id-1.pdf",
              },
              employmentContract: {
                name: "employment contract",
                url: "https://cloud-storage.com/staff/contract-1.pdf",
              },
            },
          ],
        },
        {
          id: "fac-2",
          type: "production/forest site",
          name: "Amazon Forest Plot A",
          address: "Amazonas, Brazil",
          documents: {
            landUseRights: [
              {
                name: "Land Title Deed",
                url: "https://cloud-storage.com/forest/land-1.pdf",
              },
            ],
            environmentalProtection: [
              {
                name: "Environmental Impact Assessment",
                url: "https://cloud-storage.com/docs/forest/env-1.pdf",
              },
            ],
            forestRelatedRules: [
              {
                name: "Forest Management Plan",
                url: "https://cloud-storage.com/docs/forest/forest-1.pdf",
              },
            ],
            thirdPartiesRights: [
              {
                name: "Community Agreement",
                url: "https://cloud-storage.com/docs/forest/community-1.pdf",
              },
            ],
            labourRights: [
              {
                name: "Labor Compliance Certificate",
                url: "https://cloud-storage.com/docs/forest/labor-1.pdf",
              },
            ],
            humanRights: [
              {
                name: "Human Rights Assessment",
                url: "https://cloud-storage.com/docs/forest/hr-1.pdf",
              },
            ],
            fpic: [
              {
                name: "FPIC Documentation",
                url: "https://cloud-storage.com/docs/forest/fpic-1.pdf",
              },
            ],
            taxAntiCorruptionTradeCustoms: [
              {
                name: "Tax Compliance Certificate",
                url: "https://cloud-storage.com/docs/forest/tax-1.pdf",
              },
              {
                name: "Anti-corruption Policy",
                url: "https://cloud-storage.com/docs/forest/anti-corrupt-1.pdf",
              },
            ],
          },
          areas: [
            {
              id: "area-1",
              name: "Main Harvest Zone",
              coordinates: [
                [-3.456, -61.7464],
                [-3.457, -61.7475],
                [-3.455, -61.748],
              ],
              hectares: 500,
            },
          ],
          pastRecords: {
            2021: [
              {
                id: "record-2021-1",
                license: "EX-2021-1234",
                description: "Export of certified mahogany logs",
                tradeName: "Amazon Mahogany",
                commonName: "Mahogany",
                scientificName: "Swietenia macrophylla",
                hsCodes: [
                  {
                    commodity: "Wood",
                    code: "4403",
                    name: "Wood in the rough",
                  },
                ],
                netMassKg: 50000,
                countryOfProduction: "Brazil",
                productionLocation: "Amazonas",
                productionDateRange: {
                  from: "2021-03-01",
                  to: "2021-08-31",
                },
                customerName: "European Timber Importers GmbH",
                customerAddress: "Hamburg, Germany",
                customerEmail: "orders@eti-gmbh.de",
                deforestationFreeDocs: [
                  {
                    name: "Deforestation-Free Certification",
                    url: "https://cloud-storage.com/docs/2021/defree-1.pdf",
                  },
                ],
                legalComplianceDocs: [
                  {
                    name: "Legal Compliance Certificate",
                    url: "https://cloud-storage.com/docs/2021/legal-1.pdf",
                  },
                ],
                plantingAreas: [
                  {
                    id: "planting-area-1-2021",
                    name: "2021 Planting Zone A",
                    coordinates: [
                      [-3.458, -61.749],
                      [-3.459, -61.75],
                      [-3.46, -61.751],
                    ],
                    hectares: 25,
                  },
                  {
                    id: "planting-area-2-2021",
                    name: "2021 Planting Zone B",
                    coordinates: [
                      [-3.462, -61.752],
                      [-3.463, -61.753],
                    ],
                    hectares: 25,
                  },
                ],
                totalHectares: 50,
              },
            ],
            2022: [],
            2023: [],
            2024: [],
            2025: [],
          },
          supportedProducts: [
            {
              commodity: "Wood",
              products: [
                {
                  code: "4403",
                  name: "Wood in the rough",
                },
                {
                  code: "4407",
                  name: "Wood sawn or chipped lengthwise",
                },
              ],
            },
          ],
          totalHectares: 5000,
        },
      ],
      supportedCommodities: [
        {
          commodity: "Wood",
          products: [
            {
              code: "4403",
              name: "Wood in the rough",
            },
            {
              code: "4407",
              name: "Wood sawn or chipped lengthwise",
            },
          ],
        },
      ],
      logo: {
        name: "company-logo",
        url: "https://cloud-storage.com/logo/exporter-logo.png",
      },
      importers: ["importer-1", "importer-2"],
      shipments: ["shipment-1", "shipment-2"],
      report: {
        name: "Annual Compliance Report 2023",
        url: "https://cloud-storage.com/docs/reports/report-1.pdf",
      },
      linkedVerifiers: [
        {
          id: "verifier-1",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: true,
            subjectMatterScope: true,
            eudrDefinitions: true,
            informationRequirements: true,
            newShipmentOrigin: true,
            shipments: true,
            reports: true,
            gpsCamera: false,
            supplyChain: true,
          },
        },
        {
          id: "verifier-2",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: false,
            subjectMatterScope: true,
            eudrDefinitions: true,
            informationRequirements: false,
            newShipmentOrigin: false,
            shipments: true,
            reports: false,
            gpsCamera: false,
            supplyChain: true,
          },
        },
      ],
      linkedFreightAgents: [
        {
          id: "freight-agent-1",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: true,
            subjectMatterScope: false,
            eudrDefinitions: false,
            informationRequirements: false,
            newShipmentOrigin: true,
            shipments: true,
            reports: false,
            gpsCamera: true,
            supplyChain: true,
          },
        },
      ],
      pendingVerifiers: [],
      pendingFreightAgents: [],
    },

    "exporter-2": {
      id: "exporter-2",
      role: "exporter",
      password: "coffeeExport456",
      isVerified: true,
      currentOtpKey: null,
      isRegistered: true,
      undertaken: {
        name: "Sarah Okonkwo",
        function: "Operations Manager",
        signature: "https://cloud-storage.com/docs/sarah-okonkwo.pdf",
        url: "https://cloud-storage.com/docs/sarah-okonkwo.pdf",
      },
      traceRxId: "EX654321",
      basicInfo: {
        companyName: "Brazilian Coffee Exporters",
        email: "export@brazilcoffee.com",
        country: "Brazil",
        tinNumber: "BR-987654321",
        rcNumber: "RC-112233",
        licenseNumber: "EX-2023-0789",
      },
      documents: {
        registration: [
          {
            name: "Coffee Export License",
            url: "https://cloud-storage.com/docs/exporter2/reg-1.pdf",
          },
        ],
        licensesPermits: [],
        others: [],
      },
      contactPersons: [],
      facilities: [],
      pastRecords: {
        2021: [],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      supportedCommodities: [
        {
          commodity: "Coffee",
          products: [
            {
              code: "ex 0901 11 00",
              name: "Coffee, not roasted, not decaffeinated",
            },
          ],
        },
      ],
      logo: {
        name: "coffee-exporter-logo",
        url: "https://cloud-storage.com/logo/coffee-logo.png",
      },
      importers: ["importer-1"],
      shipments: ["shipment-3"],
      report: {
        name: "Coffee Export Report 2023",
        url: "https://cloud-storage.com/docs/reports/coffee-report.pdf",
      },
      linkedVerifiers: [
        {
          id: "verifier-1",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: true,
            subjectMatterScope: true,
            eudrDefinitions: true,
            informationRequirements: true,
            newShipmentOrigin: false,
            shipments: true,
            reports: true,
            gpsCamera: false,
            supplyChain: true,
          },
        },
      ],
      linkedFreightAgents: [],
      pendingVerifiers: [],
      pendingFreightAgents: [],
    },

    "importer-1": {
      id: "importer-1",
      role: "importer",
      password: "germanyImport789",
      isVerified: true,
      currentOtpKey: null,
      isRegistered: true,
      undertaken: {
        name: "Michael Johnson",
        function: "Finance Manager",
        signature: "https://cloud-storage.com/docs/michael-johnson.pdf",
        url: "https://cloud-storage.com/docs/michael-johnson.pdf",
      },
      traceRxId: "IM123456",
      basicInfo: {
        companyName: "European Timber Importers GmbH",
        email: "info@eti-gmbh.de",
        country: "Germany",
        tinNumber: "DE-987654321",
        rcNumber: "HRB-123456",
        licenseNumber: "IM-2023-0789",
      },
      documents: {
        registration: [
          {
            name: "German Business License",
            url: "https://cloud-storage.com/docs/importer/reg-1.pdf",
          },
        ],
        licensesPermits: [
          {
            name: "Import License 2023",
            url: "https://cloud-storage.com/docs/importer/lic-1.pdf",
          },
        ],
        others: [],
      },
      contactPersons: [
        {
          id: "imp-cp-1",
          fullName: "Hans Schmidt",
          telephone: "+49-40-12345678",
          address: "Hamburg, Germany",
          email: "hans@eti-gmbh.de",
          idCards: [
            {
              name: "EU Passport",
              url: "https://cloud-storage.com/ids/imp-id-1.jpg",
            },
          ],
        },
      ],
      facilities: [
        {
          id: "imp-fac-1",
          type: "Corporate facility",
          name: "Hamburg Warehouse",
          address: "Hamburg Port, Germany",
          photos: [],
          videos: [],
          staff: [],
        },
      ],
      supportedCommodities: [
        {
          commodity: "Wood",
          products: [
            {
              code: "4403",
              name: "Wood in the rough",
            },
            {
              code: "4407",
              name: "Wood sawn or chipped lengthwise",
            },
          ],
        },
        {
          commodity: "Coffee",
          products: [
            {
              code: "ex 0901 11 00",
              name: "Coffee, not roasted, not decaffeinated",
            },
          ],
        },
      ],
      logo: {
        name: "importer-logo",
        url: "https://cloud-storage.com/logo/importer-logo.png",
      },
      exporters: ["exporter-1", "exporter-2"],
      supplierRecords: {
        2021: [
          {
            supplierId: "exporter-1",
            supplierName: "Green Timber Exports Ltd",
            supplierAddress: "São Paulo, Brazil",
            supplierEmail: "contact@greentimber.com",
            description: "Import of mahogany logs",
            tradeName: "Amazon Mahogany",
            commonName: "Mahogany",
            scientificName: "Swietenia macrophylla",
            hsCodes: [
              {
                commodity: "Wood",
                code: "4403",
                name: "Wood in the rough",
              },
            ],
            netMassKg: 50000,
            customerName: "European Timber Importers GmbH",
            customerAddress: "Hamburg, Germany",
            customerEmail: "orders@eti-gmbh.de",
          },
          {
            supplierId: "exporter-2",
            supplierName: "Brazilian Coffee Exporters",
            supplierAddress: "Brazil",
            supplierEmail: "export@brazilcoffee.com",
            description: "Import of Brazilian coffee beans",
            tradeName: "Arabica Premium",
            commonName: "Coffee",
            scientificName: "Coffea arabica",
            hsCodes: [
              {
                commodity: "Coffee",
                code: "ex 0901 11 00",
                name: "Coffee, not roasted, not decaffeinated",
              },
            ],
            netMassKg: 10000,
            customerName: "European Timber Importers GmbH",
            customerAddress: "Hamburg, Germany",
            customerEmail: "orders@eti-gmbh.de",
          },
        ],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      riskAssessment: {
        2021: [
          {
            supplierId: "exporter-1",
            riskLevel: "negligible risk",
            assessmentDocs: [
              {
                name: "Risk Assessment Report 2021 - Exporter 1",
                url: "https://cloud-storage.com/docs/risk/2021-exporter1.pdf",
              },
            ],
          },
          {
            supplierId: "exporter-2",
            riskLevel: "high risk",
            assessmentDocs: [
              {
                name: "Risk Assessment Report 2021 - Exporter 2",
                url: "https://cloud-storage.com/docs/risk/2021-exporter2.pdf",
              },
            ],
          },
        ],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      riskMitigation: {
        2021: [
          {
            supplierId: "exporter-2",
            highRiskSection: {
              additionalInfo: [
                {
                  name: "Additional Supplier Info - Exporter 2",
                  url: "https://cloud-storage.com/docs/mitigation/add-info-ex2.pdf",
                },
              ],
              independentSurveys: [
                {
                  name: "Third-Party Audit Report - Exporter 2",
                  url: "https://cloud-storage.com/docs/mitigation/audit-ex2.pdf",
                },
              ],
              otherMeasures: [],
              capacityBuilding: [
                {
                  name: "Supplier Training Program - Exporter 2",
                  url: "https://cloud-storage.com/docs/mitigation/training-ex2.pdf",
                },
              ],
            },
            policiesControls: {
              modelPractices: {
                isSme: false,
                officerName: "Anna Weber",
                officerIdCard: {
                  name: "officer id card",
                  url: "https://cloud-storage.com/docs/mitigation/officer-id.pdf",
                },
                appointmentLetter: {
                  name: "appointment letter",
                  url: "https://cloud-storage.com/docs/mitigation/appointment.pdf",
                },
                Docs: [
                  {
                    name: "Risk Management Policy - Exporter 2",
                    url: "https://cloud-storage.com/docs/mitigation/policy-ex2.pdf",
                  },
                ],
              },
              independentAudit: [
                {
                  name: "Annual Internal Audit - Exporter 2",
                  url: "https://cloud-storage.com/docs/mitigation/internal-audit-ex2.pdf",
                },
              ],
            },
            decisionsReview: [
              {
                name: "Annual Risk Mitigation Review - Exporter 2",
                url: "https://cloud-storage.com/docs/mitigation/review-2023-ex2.pdf",
              },
            ],
          },
        ],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      shipments: ["shipment-1", "shipment-3"],
      linkedVerifiers: [
        {
          id: "verifier-1",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: false,
            subjectMatterScope: true,
            dueDiligence: true,
            riskAssessment: true,
            riskMitigation: true,
            shipments: true,
            reports: true,
            gpsCamera: false,
            supplyChain: true,
          },
        },
      ],
      linkedFreightAgents: [
        {
          id: "freight-agent-1",
          accessStatus: true,
          accessTabs: {
            overview: true,
            companyDetails: false,
            subjectMatterScope: false,
            dueDiligence: false,
            riskAssessment: false,
            riskMitigation: false,
            shipments: true,
            reports: false,
            gpsCamera: true,
            supplyChain: true,
          },
        },
      ],
      pendingVerifiers: [],
      pendingFreightAgents: [],
    },

    "importer-2": {
      id: "importer-2",
      role: "importer",
      password: "ukFurniture321",
      isVerified: true,
      currentOtpKey: null,
      isRegistered: false,
      undertaken: {
        name: "Amina Bello",
        function: "Human Resources Manager",
        signature: "https://cloud-storage.com/docs/amina-bello.pdf",
        url: "https://cloud-storage.com/docs/amina-bello.pdf",
      },
      traceRxId: "IM654321",
      basicInfo: {
        companyName: "UK Furniture Manufacturers Ltd",
        email: "imports@ukfurniture.com",
        country: "United Kingdom",
        tinNumber: "GB-112233445",
        rcNumber: "RC-998877",
        licenseNumber: "IM-2023-0567",
      },
      documents: {
        registration: [],
        licensesPermits: [],
        others: [],
      },
      contactPersons: [],
      facilities: [],
      supportedCommodities: [
        {
          commodity: "Wood",
          products: [
            {
              code: "4407",
              name: "Wood sawn or chipped lengthwise",
            },
          ],
        },
      ],
      logo: {
        name: "uk-importer-logo",
        url: "https://cloud-storage.com/logo/uk-logo.png",
      },
      exporters: ["exporter-1"],
      supplierRecords: {
        2021: [],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      riskAssessment: {
        2021: [],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      riskMitigation: {
        2021: [],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      },
      shipments: ["shipment-2"],
      linkedVerifiers: [],
      linkedFreightAgents: [],
      pendingVerifiers: ["verifier-1"],
      pendingFreightAgents: [],
    },

    "freight-agent-1": {
      id: "freight-agent-1",
      role: "freight agent",
      password: "freightLogistics654",
      isVerified: true,
      currentOtpKey: null,
      basicInfo: {
        firstName: "Thomas",
        lastName: "Anderson",
        email: "thomas@freight-logistics.com",
        freightLicenseNumber: "FL-2023-8899",
      },
      bioData: {
        personalInfo: {
          dateOfBirth: "1985-05-15",
          nationality: "German",
          address: "Berlin, Germany",
          phone: "+49-30-12345678",
        },
        documents: {
          freightLicense: [
            {
              name: "Freight Forwarding License",
              url: "https://cloud-storage.com/docs/freight/license.pdf",
            },
          ],
          insurance: [
            {
              name: "Cargo Insurance Certificate",
              url: "https://cloud-storage.com/docs/freight/insurance.pdf",
            },
          ],
          identification: [
            {
              name: "Passport",
              url: "https://cloud-storage.com/docs/freight/passport.pdf",
            },
          ],
          certifications: [
            {
              name: "ISO Certification",
              url: "https://cloud-storage.com/docs/freight/iso-cert.pdf",
            },
          ],
        },
      },
      linkedCompanies: [
        {
          companyId: "exporter-1",
          companyType: "exporter",
          companyName: "Green Timber Exports Ltd",
          traceRxId: "EX123456",
          status: "active",
        },
        {
          companyId: "importer-1",
          companyType: "importer",
          companyName: "European Timber Importers GmbH",
          traceRxId: "IM123456",
          status: "active",
        },
      ],
      pendingCompanyRequests: [
        {
          companyId: "exporter-2",
          companyType: "exporter",
          companyName: "Brazilian Coffee Exporters",
          traceRxId: "EX654321",
          requestedAt: "2023-12-01T10:30:00Z",
          status: "pending",
        },
      ],
    },

    "verifier-1": {
      id: "verifier-1",
      role: "verifier",
      password: "auditSecure987",
      isVerified: true,
      currentOtpKey: null,
      basicInfo: {
        firstName: "Dr. Michael",
        lastName: "Chen",
        email: "michael.chen@audit-consulting.com",
        agencyDepartmentId: "EUDR-VER-2023-001",
      },
      bioData: {
        personalInfo: {
          dateOfBirth: "1978-08-22",
          nationality: "French",
          address: "Paris, France",
          phone: "+33-1-23456789",
        },
        documents: {
          professionalCertificates: [
            {
              name: "EUDR Auditor Certification",
              url: "https://cloud-storage.com/docs/verifier/cert-1.pdf",
            },
          ],
          agencyAffiliation: [
            {
              name: "Agency Authorization Letter",
              url: "https://cloud-storage.com/docs/verifier/agency-auth.pdf",
            },
          ],
          identification: [
            {
              name: "National ID",
              url: "https://cloud-storage.com/docs/verifier/id.pdf",
            },
          ],
          academicQualifications: [
            {
              name: "Master's Degree in Environmental Science",
              url: "https://cloud-storage.com/docs/verifier/degree.pdf",
            },
          ],
        },
      },
      linkedCompanies: [
        {
          companyId: "exporter-1",
          companyType: "exporter",
          companyName: "Green Timber Exports Ltd",
          traceRxId: "EX123456",
          status: "true",
        },
        {
          companyId: "importer-1",
          companyType: "importer",
          companyName: "European Timber Importers GmbH",
          traceRxId: "IM123456",
          status: "true",
        },
        {
          companyId: "exporter-2",
          companyType: "exporter",
          companyName: "Brazilian Coffee Exporters",
          traceRxId: "EX654321",
          status: "true",
        },
      ],
      verificationReports: [
        {
          id: "ver-report-1",
          companyId: "exporter-1",
          companyType: "exporter",
          date: "2023-11-15",
          type: "compliance_audit",
          status: "",
          reportUrl:
            "https://cloud-storage.com/docs/verification/ver-report-1.pdf",
          findings: [
            {
              tab: "forest_management",
              status: "compliant",
              notes:
                "All forest management plans are up to date and compliant with EUDR regulations.",
            },
            {
              tab: "due_diligence",
              status: "compliant",
              notes:
                "Due diligence process properly documented and implemented.",
            },
          ],
        },
        {
          id: "ver-report-3",
          companyId: "exporter-2",
          companyType: "exporter",
          date: "2023-09-20",
          type: "compliance_audit",
          status: "",
          reportUrl:
            "https://cloud-storage.com/docs/verification/ver-report-3.pdf",
          findings: [
            {
              tab: "company_details",
              status: "compliant",
              notes: "Company registration and licenses are valid.",
            },
          ],
        },
      ],
      pendingCompanyRequests: [
        {
          companyId: "importer-2",
          companyType: "importer",
          companyName: "UK Furniture Manufacturers Ltd",
          traceRxId: "IM654321",
          requestedAt: "2023-12-05T14:20:00Z",
          status: "pending",
        },
      ],
    },

    "verifier-2": {
      id: "verifier-2",
      role: "verifier",
      password: "environmentAudit246",
      isVerified: true,
      currentOtpKey: null,
      basicInfo: {
        firstName: "Sophie",
        lastName: "Martinez",
        email: "sophie@independent-auditor.eu",
        agencyDepartmentId: "IND-VER-2023-045",
      },
      bioData: {
        personalInfo: {
          dateOfBirth: "1982-03-10",
          nationality: "Spanish",
          address: "Madrid, Spain",
          phone: "+34-91-2345678",
        },
        documents: {
          professionalCertificates: [
            {
              name: "Environmental Auditor License",
              url: "https://cloud-storage.com/docs/verifier2/cert-1.pdf",
            },
          ],
          identification: [
            {
              name: "Passport",
              url: "https://cloud-storage.com/docs/verifier2/passport.pdf",
            },
          ],
        },
      },
      linkedCompanies: [
        {
          companyId: "exporter-1",
          companyType: "exporter",
          companyName: "Green Timber Exports Ltd",
          traceRxId: "EX123456",
          status: "true",
        },
      ],
      verificationReports: [
        {
          id: "ver-report-2",
          companyId: "exporter-1",
          companyType: "exporter",
          date: "2023-10-10",
          type: "shipment_verification",
          status: "",
          reportUrl:
            "https://cloud-storage.com/docs/verification/ver-report-2.pdf",
          findings: [
            {
              tab: "shipments",
              status: "compliant",
              notes: "Shipment documentation complete and accurate.",
            },
          ],
        },
      ],
      pendingCompanyRequests: [],
    },
  },

  shipments: {
    "shipment-1": {
      id: "shipment-1",
      batchNumber: "TRX-7890",
      exporterId: "exporter-1",
      importerId: "importer-1",
      forests: [
        {
          forestId: "fac-2",
          selectedProducts: [
            {
              commodity: "Wood",
              code: "4403",
              name: "Wood in the rough",
              quantity: 25000,
            },
          ],
          harvestAreas: [
            {
              id: "harvest-area-1",
              name: "Section A Harvest",
              hectares: 1231,
              coordinates: [
                [-3.456, -61.7464],
                [-3.4565, -61.747],
                [-3.4568, -61.7468],
                [-3.4571, -61.7462],
                [-3.4563, -61.7459],
                [-3.456, -61.7464],
              ],
            },
          ],
        },
      ],
      productionDate: "2023-10-01",
      processingLoadingDate: "2023-10-15",
      importerConsignee: "European Timber Importers GmbH",
      portOfDestination: "Hamburg Port, Germany",
      portOfShipment: "Santos Port, Brazil",
      shippingLine: "Maersk Line",
      processingLoadingSite: "Santos Port Warehouse",
      productDescription:
        "Certified sustainable mahogany logs for furniture manufacturing",
      totalShippingFee: 100,
      totalHectares: 1231,
      totalKilograms: 20000,
      containers: [
        {
          containerNumber: "MAEU-1234567",
          packingList: {
            name: "packing list",
            url: "https://cloud-storage.com/docs/shipment/packing-1.pdf",
          },
          kilograms: 20000,
        },
      ],
      status: "active",
      createdOn: "2023-09-15",
      images: [
        {
          name: "Loading Process",
          url: "https://cloud-storage.com/docs/shipment/loading-vid.mp4",
        },
      ],
      videos: [
        {
          name: "Loading Process",
          url: "https://cloud-storage.com/docs/shipment/loading-vid.mp4",
        },
      ],
      documents: {
        "Land Use Rights": [
          {
            name: "Land Lease Agreement",
            url: "https://cloud-storage.com/docs/shipment-1/land-lease.pdf",
          },
          {
            name: "Land Title Certificate",
            url: "https://cloud-storage.com/docs/shipment-1/land-title.pdf",
          },
        ],
        "Environmental Protection": [
          {
            name: "Environmental Impact Assessment",
            url: "https://cloud-storage.com/docs/shipment-1/eia-report.pdf",
          },
          {
            name: "Water Quality Report",
            url: "https://cloud-storage.com/docs/shipment-1/water-quality.pdf",
          },
        ],
        "Forest-related Rules": [
          {
            name: "Forest Management Plan",
            url: "https://cloud-storage.com/docs/shipment-1/forest-plan.pdf",
          },
          {
            name: "Harvesting Permit",
            url: "https://cloud-storage.com/docs/shipment-1/harvest-permit.pdf",
          },
        ],
        "Third Parties Rights": [
          {
            name: "Community Agreement",
            url: "https://cloud-storage.com/docs/shipment-1/community-agreement.pdf",
          },
        ],
        "Labour Rights": [
          {
            name: "Employee Contracts",
            url: "https://cloud-storage.com/docs/shipment-1/employee-contracts.pdf",
          },
          {
            name: "Safety Training Certificates",
            url: "https://cloud-storage.com/docs/shipment-1/safety-training.pdf",
          },
        ],
        "Human Rights": [
          {
            name: "Human Rights Assessment",
            url: "https://cloud-storage.com/docs/shipment-1/human-rights-assessment.pdf",
          },
        ],
        "FPIC (Free, Prior, Informed Consent)": [
          {
            name: "FPIC Documentation",
            url: "https://cloud-storage.com/docs/shipment-1/fpic-documentation.pdf",
          },
          {
            name: "Community Meeting Minutes",
            url: "https://cloud-storage.com/docs/shipment-1/community-minutes.pdf",
          },
        ],
        "Tax, Anti-corruption, Trade & Customs": [
          {
            name: "Tax Compliance Certificate",
            url: "https://cloud-storage.com/docs/shipment-1/tax-compliance.pdf",
          },
          {
            name: "Export Declaration",
            url: "https://cloud-storage.com/docs/shipment-1/export-declaration.pdf",
          },
          {
            name: "Anti-corruption Policy",
            url: "https://cloud-storage.com/docs/shipment-1/anti-corruption-policy.pdf",
          },
        ],
      },
    },
    "shipment-2": {
      id: "shipment-2",
      batchNumber: "TRX-7891",
      exporterId: "exporter-1",
      importerId: "importer-2",
      forests: [
        {
          forestId: "fac-2",
          selectedProducts: [
            {
              commodity: "Wood",
              code: "4403",
              name: "Wood in the rough",
              quantity: 25000,
            },
          ],
          harvestAreas: [
            {
              id: "harvest-area-1",
              name: "Section A Harvest",
              hectares: 1231,
              coordinates: [
                [-3.456, -61.7464],
                [-3.4565, -61.747],
                [-3.457, -61.7475],
                [-3.4575, -61.747],
                [-3.4568, -61.7463],
                [-3.456, -61.7464],
              ],
            },
          ],
        },
      ],
      productionDate: "2023-11-01",
      processingLoadingDate: "2023-11-10",
      importerConsignee: "UK Furniture Manufacturers Ltd",
      portOfDestination: "Liverpool Port, UK",
      portOfShipment: "Santos Port, Brazil",
      shippingLine: "MSC",
      processingLoadingSite: "Santos Port Warehouse",
      productDescription: "Processed wood planks",
      totalShippingFee: 1800,
      totalHectares: 1123,
      totalKilograms: 20000,
      containers: [
        {
          containerNumber: "MAEU-1234578",
          packingList: {
            name: "packing list",
            url: "https://cloud-storage.com/docs/shipment/packing-1.pdf",
          },
          kilograms: 20000,
        },
      ],
      status: "pending",
      createdOn: "2023-10-20",
      images: [
        {
          name: "Loading Process",
          url: "https://cloud-storage.com/docs/shipment/loading-vid.mp4",
        },
      ],
      videos: [
        {
          name: "Loading Process",
          url: "https://cloud-storage.com/docs/shipment/loading-vid.mp4",
        },
      ],
      documents: {
        "Land Use Rights": [
          {
            name: "Land Use Certificate",
            url: "https://cloud-storage.com/docs/shipment-2/land-use-certificate.pdf",
          },
        ],
        "Environmental Protection": [
          {
            name: "Environmental Compliance Report",
            url: "https://cloud-storage.com/docs/shipment-2/env-compliance.pdf",
          },
          {
            name: "Waste Management Plan",
            url: "https://cloud-storage.com/docs/shipment-2/waste-management.pdf",
          },
        ],
        "Forest-related Rules": [
          {
            name: "Timber Legality Verification",
            url: "https://cloud-storage.com/docs/shipment-2/timber-legality.pdf",
          },
        ],
        "Third Parties Rights": [
          {
            name: "Neighbor Agreements",
            url: "https://cloud-storage.com/docs/shipment-2/neighbor-agreements.pdf",
          },
        ],
        "Labour Rights": [
          {
            name: "Fair Wage Certification",
            url: "https://cloud-storage.com/docs/shipment-2/fair-wage.pdf",
          },
        ],
        "Human Rights": [
          {
            name: "Non-Discrimination Policy",
            url: "https://cloud-storage.com/docs/shipment-2/non-discrimination.pdf",
          },
        ],
        "FPIC (Free, Prior, Informed Consent)": [
          {
            name: "Consent Records",
            url: "https://cloud-storage.com/docs/shipment-2/consent-records.pdf",
          },
        ],
        "Tax, Anti-corruption, Trade & Customs": [
          {
            name: "Customs Documentation",
            url: "https://cloud-storage.com/docs/shipment-2/customs-docs.pdf",
          },
          {
            name: "Trade License",
            url: "https://cloud-storage.com/docs/shipment-2/trade-license.pdf",
          },
        ],
      },
    },
    "shipment-3": {
      id: "shipment-3",
      batchNumber: "TRX-7892",
      exporterId: "exporter-2",
      importerId: "importer-1",
      forests: [
        {
          forestId: "fac-2",
          selectedProducts: [
            {
              commodity: "Wood",
              code: "4403",
              name: "Wood in the rough",
              quantity: 25000,
            },
          ],
          harvestAreas: [
            {
              id: "harvest-area-1",
              name: "Section A Harvest",
              hectares: 1231,
              coordinates: [
                [-3.456, -61.7464],
                [-3.4565, -61.747],
                [-3.4572, -61.7461],
                [-3.4559, -61.7456],
                [-3.4555, -61.7469],
                [-3.456, -61.7464],
              ],
            },
          ],
        },
      ],
      productionDate: "2023-09-15",
      processingLoadingDate: "2023-09-25",
      importerConsignee: "European Timber Importers GmbH",
      portOfDestination: "Hamburg Port, Germany",
      portOfShipment: "Rio de Janeiro Port, Brazil",
      shippingLine: "Hapag-Lloyd",
      processingLoadingSite: "Rio Warehouse",
      productDescription: "Premium Brazilian coffee beans",
      totalShippingFee: 100,
      totalHectares: 1234,
      totalKilograms: 20000,
      containers: [
        {
          containerNumber: "MAEU-1234568",
          packingList: {
            name: "packing list",
            url: "https://cloud-storage.com/docs/shipment/packing-1.pdf",
          },
          kilograms: 20000,
        },
      ],
      status: "completed",
      createdOn: "2023-08-15",
      images: [],
      videos: [],
      documents: {
        "Land Use Rights": [
          {
            name: "Property Deed",
            url: "https://cloud-storage.com/docs/shipment-3/property-deed.pdf",
          },
        ],
        "Environmental Protection": [
          {
            name: "Soil Conservation Report",
            url: "https://cloud-storage.com/docs/shipment-3/soil-conservation.pdf",
          },
        ],
        "Forest-related Rules": [
          {
            name: "Sustainable Harvesting Certificate",
            url: "https://cloud-storage.com/docs/shipment-3/sustainable-harvest.pdf",
          },
        ],
        "Third Parties Rights": [
          {
            name: "Right-of-Way Agreement",
            url: "https://cloud-storage.com/docs/shipment-3/right-of-way.pdf",
          },
        ],
        "Labour Rights": [
          {
            name: "Workplace Safety Report",
            url: "https://cloud-storage.com/docs/shipment-3/workplace-safety.pdf",
          },
        ],
        "Human Rights": [
          {
            name: "Grievance Mechanism Report",
            url: "https://cloud-storage.com/docs/shipment-3/grievance-report.pdf",
          },
        ],
        "FPIC (Free, Prior, Informed Consent)": [
          {
            name: "Indigenous Community Consent",
            url: "https://cloud-storage.com/docs/shipment-3/indigenous-consent.pdf",
          },
        ],
        "Tax, Anti-corruption, Trade & Customs": [
          {
            name: "Tax Receipts",
            url: "https://cloud-storage.com/docs/shipment-3/tax-receipts.pdf",
          },
          {
            name: "Export Permit",
            url: "https://cloud-storage.com/docs/shipment-3/export-permit.pdf",
          },
        ],
      },
    },
  },

  commodities: [
    {
      commodity: "Cattle",
      products: [
        {
          code: "0102 21 00",
          name: "Live bovine animals (breeding)",
        },
        {
          code: "0102 29 05",
          name: "Live bovine animals (other, <80 kg)",
        },
        {
          code: "0102 29 95",
          name: "Live bovine animals (other)",
        },
        {
          code: "0201",
          name: "Meat of bovine animals, fresh or chilled",
        },
        {
          code: "0202",
          name: "Meat of bovine animals, frozen",
        },
        {
          code: "0206 10 95",
          name: "Edible offal of bovine animals, fresh or chilled",
        },
        {
          code: "0206 22 00",
          name: "Bovine livers, frozen",
        },
        {
          code: "0206 29 91",
          name: "Bovine offal, frozen (excluding tongues and livers)",
        },
        {
          code: "0210 20",
          name: "Meat of bovine animals, salted, in brine, dried or smoked",
        },
        {
          code: "4101",
          name: "Raw hides and skins of bovine animals",
        },
        {
          code: "4102",
          name: "Raw skins of sheep or lambs",
        },
        {
          code: "4103",
          name: "Other raw hides and skins",
        },
        {
          code: "4301",
          name: "Raw furskins",
        },
      ],
    },
    {
      commodity: "Cocoa",
      products: [
        {
          code: "1801 00 00",
          name: "Cocoa beans, whole or broken, raw or roasted",
        },
        {
          code: "1802 00 00",
          name: "Cocoa shells, husks, skins and other cocoa waste",
        },
        {
          code: "1803",
          name: "Cocoa paste, whether or not defatted",
        },
        {
          code: "1804 00 00",
          name: "Cocoa butter, fat and oil",
        },
        {
          code: "1805 00 00",
          name: "Cocoa powder, not containing added sugar",
        },
        {
          code: "1806",
          name: "Chocolate and other food preparations containing cocoa",
        },
      ],
    },
    {
      commodity: "Coffee",
      products: [
        {
          code: "ex 0901 11 00",
          name: "Coffee, not roasted, not decaffeinated",
        },
        {
          code: "ex 0901 12 00",
          name: "Coffee, not roasted, decaffeinated",
        },
        {
          code: "ex 0901 21 00",
          name: "Roasted coffee, not decaffeinated",
        },
        {
          code: "ex 0901 22 00",
          name: "Roasted coffee, decaffeinated",
        },
        {
          code: "ex 0901 90 90",
          name: "Coffee husks and skins; coffee substitutes containing coffee",
        },
      ],
    },
    {
      commodity: "Oil palm",
      products: [
        {
          code: "1207 10 00",
          name: "Palm nuts and kernels",
        },
        {
          code: "1511",
          name: "Palm oil and its fractions",
        },
        {
          code: "1513 21",
          name: "Palm kernel oil, crude",
        },
        {
          code: "1513 29",
          name: "Palm kernel oil and its fractions, refined",
        },
        {
          code: "1516 20 96",
          name: "Palm oil derivatives (vegetable fats and oils)",
        },
        {
          code: "2306 60 00",
          name: "Oil-cake and other solid residues from palm oil extraction",
        },
      ],
    },
    {
      commodity: "Rubber",
      products: [
        {
          code: "4001",
          name: "Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums",
        },
        {
          code: "4002",
          name: "Synthetic rubber and factice derived from oils",
        },
        {
          code: "4005",
          name: "Compounded rubber, unvulcanised",
        },
        {
          code: "4006",
          name: "Unvulcanised rubber in other forms",
        },
        {
          code: "4007",
          name: "Vulcanised rubber thread and cord",
        },
        {
          code: "4008",
          name: "Plates, sheets, strip, rods and profile shapes of vulcanised rubber",
        },
        {
          code: "4009",
          name: "Tubes, pipes and hoses of vulcanised rubber",
        },
        {
          code: "4010",
          name: "Conveyor or transmission belts of vulcanised rubber",
        },
        {
          code: "4011",
          name: "New pneumatic tyres, of rubber",
        },
        {
          code: "4012",
          name: "Retreaded or used pneumatic tyres; solid or cushion tyres",
        },
        {
          code: "4013",
          name: "Inner tubes, of rubber",
        },
        {
          code: "4014",
          name: "Hygienic or pharmaceutical articles of vulcanised rubber",
        },
        {
          code: "4015",
          name: "Articles of apparel and clothing accessories of vulcanised rubber",
        },
        {
          code: "4016",
          name: "Other articles of vulcanised rubber (excluding hard rubber)",
        },
        {
          code: "4017",
          name: "Hard rubber in all forms",
        },
      ],
    },
    {
      commodity: "Soya",
      products: [
        {
          code: "1201 90 00",
          name: "Soya beans, whether or not broken",
        },
        {
          code: "1208 10 00",
          name: "Flours and meals of soya beans",
        },
        {
          code: "1507",
          name: "Soya-bean oil and its fractions",
        },
        {
          code: "2304 00 00",
          name: "Oil-cake and other solid residues from soya-bean oil extraction",
        },
      ],
    },
    {
      commodity: "Wood",
      products: [
        {
          code: "4401",
          name: "Fuel wood",
        },
        {
          code: "4402",
          name: "Wood charcoal",
        },
        {
          code: "4403",
          name: "Wood in the rough",
        },
        {
          code: "4404",
          name: "Hoopwood; split poles; piles, pickets and stakes",
        },
        {
          code: "4405",
          name: "Wood wool; wood flour",
        },
        {
          code: "4406",
          name: "Railway or tramway sleepers of wood",
        },
        {
          code: "4407",
          name: "Wood sawn or chipped lengthwise",
        },
        {
          code: "4408",
          name: "Sheets for veneering",
        },
        {
          code: "4409",
          name: "Wood continuously shaped along any edges",
        },
        {
          code: "4410",
          name: "Particle board, OSB and similar board",
        },
        {
          code: "4411",
          name: "Fibreboard of wood",
        },
        {
          code: "4412",
          name: "Plywood, veneered panels and similar laminated wood",
        },
        {
          code: "4413",
          name: "Densified wood",
        },
        {
          code: "4414",
          name: "Wooden frames for paintings, photographs, etc.",
        },
        {
          code: "4415",
          name: "Packing cases, boxes, crates, drums and pallets",
        },
        {
          code: "4416",
          name: "Casks, barrels, vats, tubs and other coopers' products",
        },
        {
          code: "4417",
          name: "Tools, tool bodies, tool handles, broom or brush bodies",
        },
        {
          code: "4418",
          name: "Builders' joinery and carpentry of wood",
        },
        {
          code: "4419",
          name: "Tableware and kitchenware, of wood",
        },
        {
          code: "4420",
          name: "Wood marquetry and inlaid wood; caskets and cases",
        },
        {
          code: "4421",
          name: "Other articles of wood",
        },
      ],
    },
  ],

  systemState: {
    currentUser: null,
    notifications: [],
    uiPreferences: {},
  },
};

export const useUserStore = create((set, get) => ({
  demoData: demoData,
  user: null,
  loginData: null,

  // Login method - checks email, password, and role
  login: (email, password, role) => {
    const { demoData } = get();

    // Find user by email and role
    const users = demoData.users;
    const user = Object.values(users).find((user) => {
      const userEmail = user.basicInfo?.email || user.email;
      return (
        userEmail === email && user.role === role && user.password === password
      );
    });

    return user;
  },

  // Check if user exists by email
  checkUserExists: (email) => {
    const { demoData } = get();
    const users = demoData.users;

    const user = Object.values(users).find((user) => {
      const userEmail = user.basicInfo?.email || user.email;
      return userEmail === email;
    });

    return user;
  },

  // Sign up user
  signUp: (userData) => {
    const { demoData } = get();

    // Check if user already exists
    const existingUser = get().checkUserExists(userData.email);
    if (existingUser) {
      return {
        success: false,
        message: existingUser.isVerified
          ? "Account already exists. Please login instead."
          : "Account already exists but not verified. Please verify your account.",
      };
    }

    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create user structure based on role
    let newUser;

    if (userData.role === "importer" || userData.role === "exporter") {
      // Generate TraceRx ID
      const traceRxId = generateTraceRxId(userData.role);

      newUser = {
        id: userId,
        role: userData.role,
        password: userData.password,
        isVerified: false,
        currentOtpKey: null,
        traceRxId: traceRxId,
        isRegistered: false,
        undertaken: {
          name: "",
          function: "",
          signature: "",
          url: "",
        },
        basicInfo: {
          companyName: userData.companyName || "",
          email: userData.email,
          country: userData.country || "",
          tinNumber: userData.tinNumber || "",
          rcNumber: userData.Number || "",
          licenseNumber: "", // Will be filled later
        },
        documents: {
          registration: [],
          licensesPermits: [],
          others: [],
        },
        contactPersons: [],
        facilities: [],
        pastRecords: {
          2021: [],
          2022: [],
          2023: [],
          2024: [],
          2025: [],
        },
        supportedCommodities: [],
        logo: null,
        importers: [],
        exporters: [],
        shipments: [],
        report: null,
        linkedVerifiers: [],
        linkedFreightAgents: [],
        pendingVerifiers: [],
        pendingFreightAgents: [],
      };

      // Add specific fields based on role
      if (userData.role === "exporter") {
        newUser.importers = [];
      } else {
        newUser.exporters = [];
        newUser.supplierRecords = {
          2021: [],
          2022: [],
          2023: [],
          2024: [],
          2025: [],
        };
        newUser.riskAssessment = {
          2021: [],
          2022: [],
          2023: [],
          2024: [],
          2025: [],
        };
        newUser.riskMitigation = {
          2021: [],
          2022: [],
          2023: [],
          2024: [],
          2025: [],
        };
      }
    } else if (
      userData.role === "freight agent" ||
      userData.role === "verifier"
    ) {
      newUser = {
        id: userId,
        role: userData.role,
        password: userData.password,
        isVerified: false,
        currentOtpKey: null,
        basicInfo: {
          firstName: "",
          lastName: "",
          email: userData.email,
          freightLicenseNumber:
            userData.role === "freight agent" ? "" : undefined,
          agencyDepartmentId: userData.role === "verifier" ? "" : undefined,
        },
        bioData: {
          personalInfo: {
            dateOfBirth: "",
            nationality: "",
            address: "",
            phone: "",
          },
          documents: {
            freightLicense: userData.role === "freight agent" ? [] : undefined,
            insurance: userData.role === "freight agent" ? [] : undefined,
            professionalCertificates:
              userData.role === "verifier" ? [] : undefined,
            agencyAffiliation: userData.role === "verifier" ? [] : undefined,
            identification: [],
            certifications: userData.role === "freight agent" ? [] : undefined,
            academicQualifications:
              userData.role === "verifier" ? [] : undefined,
          },
        },
        linkedCompanies: [],
        pendingCompanyRequests: [],
      };

      if (userData.role === "verifier") {
        newUser.verificationReports = [];
      }
    }

    // Add user to demoData
    const updatedDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [userId]: newUser,
      },
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: "User created successfully.",
      user: newUser,
    };
  },

  // Generate verification OTP for account verification
  generateVerificationOTP: (userId) => {
    const { demoData } = get();
    const users = demoData.users;

    if (!users[userId]) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const otp = generateVerificationCode();

    // Store OTP in user's currentOtpKey
    const updatedUsers = {
      ...users,
      [userId]: {
        ...users[userId],
        currentOtpKey: otp,
      },
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      otp,
    };
  },

  // Verify account with OTP
  verifyAccount: (userId, otp) => {
    const { demoData } = get();
    const users = demoData.users;

    if (!users[userId]) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = users[userId];

    if (user.currentOtpKey !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    // Mark user as verified and clear OTP
    const updatedUsers = {
      ...users,
      [userId]: {
        ...user,
        isVerified: true,
        currentOtpKey: null,
      },
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    // Set as current user
    set({
      user: updatedUsers[userId],
    });

    // Update system state
    const finalDemoData = {
      ...updatedDemoData,
      systemState: {
        ...updatedDemoData.systemState,
        currentUser: updatedUsers[userId],
      },
    };

    set({
      demoData: finalDemoData,
    });

    return {
      success: true,
      message: "Account verified successfully",
      user: updatedUsers[userId],
    };
  },

  // Generate login OTP
  generateLoginOTP: (userId) => {
    const { demoData } = get();
    const users = demoData.users;

    if (!users[userId]) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const otp = generateOTP();

    // Store OTP in user's currentOtpKey
    const updatedUsers = {
      ...users,
      [userId]: {
        ...users[userId],
        currentOtpKey: otp,
      },
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      otp,
    };
  },

  // Verify login OTP
  verifyLoginOTP: (userId, otp) => {
    const { demoData } = get();
    const users = demoData.users;

    if (!users[userId]) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = users[userId];

    if (user.currentOtpKey !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    // Clear OTP
    const updatedUsers = {
      ...users,
      [userId]: {
        ...user,
        currentOtpKey: null,
      },
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: "OTP verified successfully",
      user: updatedUsers[userId],
    };
  },

  // Request company access for verifier/freight agent - FIXED
  requestCompanyAccess: (agentId, companyRole, traceRxId) => {
    const { demoData } = get();
    const users = demoData.users;

    // Find company by traceRxId and role
    const company = Object.values(users).find(
      (user) => user.role === companyRole && user.traceRxId === traceRxId,
    );

    if (!company) {
      return {
        success: false,
        message: "Company not found with the provided TraceRx ID",
      };
    }

    // Get agent
    const agent = users[agentId];
    if (!agent) {
      return {
        success: false,
        message: "Agent not found",
      };
    }

    // Check if already linked
    const existingLink =
      company.linkedVerifiers?.find((v) => v.id === agentId) ||
      company.linkedFreightAgents?.find((f) => f.id === agentId);

    if (existingLink) {
      return {
        success: false,
        message: "You are already linked to this company",
      };
    }

    // Check if already in pending list
    const existingPending =
      (company.pendingVerifiers || []).includes(agentId) ||
      (company.pendingFreightAgents || []).includes(agentId);

    if (existingPending) {
      return {
        success: false,
        message: "Your request is already pending approval",
      };
    }

    // Check if agent already has a pending request for this company
    const existingAgentRequest = (agent.pendingCompanyRequests || []).find(
      (req) => req.companyId === company.id,
    );

    if (existingAgentRequest) {
      return {
        success: false,
        message: "You already have a pending request for this company",
      };
    }

    // Add agent to company's pending list
    const updatedCompany = {
      ...company,
      pendingVerifiers:
        agent.role === "verifier"
          ? [...(company.pendingVerifiers || []), agentId]
          : company.pendingVerifiers,
      pendingFreightAgents:
        agent.role === "freight agent"
          ? [...(company.pendingFreightAgents || []), agentId]
          : company.pendingFreightAgents,
    };

    // Add to agent's pending requests
    const requestData = {
      companyId: company.id,
      companyType: company.role,
      companyName: company.basicInfo.companyName,
      traceRxId: company.traceRxId,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    const updatedAgent = {
      ...agent,
      pendingCompanyRequests: [
        ...(agent.pendingCompanyRequests || []),
        requestData,
      ],
    };

    // Update the store
    const updatedUsers = {
      ...users,
      [company.id]: updatedCompany,
      [agentId]: updatedAgent,
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: `Request sent to ${company.basicInfo.companyName}. Once approved, you'll be able to access their dashboard.`,
      company: company,
    };
  },

  // Get company by traceRxId
  getCompanyByTraceRxId: (traceRxId) => {
    const { demoData } = get();
    const users = demoData.users;

    const company = Object.values(users).find(
      (user) =>
        (user.role === "exporter" || user.role === "importer") &&
        user.traceRxId === traceRxId,
    );

    return company;
  },

  // Approve or reject agent access - FIXED to properly update state
  updateAgentAccess: (companyId, agentId, agentRole, approve) => {
    const { demoData } = get();
    const users = demoData.users;

    const company = users[companyId];
    if (!company)
      return {
        success: false,
        message: "Company not found",
      };

    const agent = users[agentId];
    if (!agent)
      return {
        success: false,
        message: "Agent not found",
      };

    // Create deep copies to avoid mutation issues
    const updatedCompany = JSON.parse(JSON.stringify(company));
    const updatedAgent = JSON.parse(JSON.stringify(agent));

    // Remove from pending list
    if (agentRole === "verifier") {
      updatedCompany.pendingVerifiers = (
        updatedCompany.pendingVerifiers || []
      ).filter((id) => id !== agentId);
    } else if (agentRole === "freight agent") {
      updatedCompany.pendingFreightAgents = (
        updatedCompany.pendingFreightAgents || []
      ).filter((id) => id !== agentId);
    }

    if (approve) {
      // Default access tabs (all false by default for new agents)
      const defaultAccessTabs =
        company.role === "exporter"
          ? {
              overview: false,
              companyDetails: false,
              subjectMatterScope: false,
              eudrDefinitions: false,
              informationRequirements: false,
              newShipmentOrigin: false,
              shipments: false,
              reports: false,
              gpsCamera: false,
              supplyChain: false,
            }
          : {
              overview: false,
              companyDetails: false,
              subjectMatterScope: false,
              dueDiligence: false,
              riskAssessment: false,
              riskMitigation: false,
              shipments: false,
              reports: false,
              gpsCamera: false,
              supplyChain: false,
            };

      // Add to linked list with correct structure
      if (agentRole === "verifier") {
        updatedCompany.linkedVerifiers = [
          ...(updatedCompany.linkedVerifiers || []),
          {
            id: agentId,
            accessStatus: true,
            accessTabs: defaultAccessTabs,
          },
        ];
      } else if (agentRole === "freight agent") {
        updatedCompany.linkedFreightAgents = [
          ...(updatedCompany.linkedFreightAgents || []),
          {
            id: agentId,
            accessStatus: true,
            accessTabs: defaultAccessTabs,
          },
        ];
      }

      // Add company to agent's linkedCompanies WITHOUT accessTabs
      const companyLink = {
        companyId: company.id,
        companyType: company.role,
        companyName: company.basicInfo.companyName,
        traceRxId: company.traceRxId,
        status: "active",
      };

      // Check if already in linked companies
      const alreadyLinked = (updatedAgent.linkedCompanies || []).find(
        (link) => link.companyId === company.id,
      );

      if (!alreadyLinked) {
        updatedAgent.linkedCompanies = [
          ...(updatedAgent.linkedCompanies || []),
          companyLink,
        ];
      }

      // Remove from pending requests
      updatedAgent.pendingCompanyRequests = (
        updatedAgent.pendingCompanyRequests || []
      ).filter((req) => req.companyId !== companyId);
    } else {
      // Reject request - update agent's request status
      updatedAgent.pendingCompanyRequests = (
        updatedAgent.pendingCompanyRequests || []
      )
        .map((req) => {
          if (req.companyId === companyId) {
            return {
              ...req,
              status: "rejected",
            };
          }
          return req;
        })
        .filter((req) => req.companyId !== companyId); // Remove from pending list
    }

    // Update both users
    const updatedUsers = {
      ...users,
      [company.id]: updatedCompany,
      [agentId]: updatedAgent,
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: approve
        ? `${agentRole === "verifier" ? "Verifier" : "Freight agent"} approved successfully`
        : "Request rejected",
    };
  },

  // Update agent's tab access - FIXED to properly update state
  updateAgentTabAccess: (companyId, agentId, agentRole, tab, access) => {
    const { demoData } = get();
    const users = demoData.users;

    const company = users[companyId];
    if (!company)
      return {
        success: false,
        message: "Company not found",
      };

    // Create a deep copy to avoid mutation issues
    const updatedCompany = JSON.parse(JSON.stringify(company));

    let found = false;

    if (agentRole === "verifier") {
      const verifiers = updatedCompany.linkedVerifiers || [];
      for (let i = 0; i < verifiers.length; i++) {
        if (verifiers[i].id === agentId) {
          verifiers[i].accessTabs = {
            ...verifiers[i].accessTabs,
            [tab]: access,
          };
          found = true;
          break;
        }
      }
    } else if (agentRole === "freight agent") {
      const agents = updatedCompany.linkedFreightAgents || [];
      for (let i = 0; i < agents.length; i++) {
        if (agents[i].id === agentId) {
          agents[i].accessTabs = {
            ...agents[i].accessTabs,
            [tab]: access,
          };
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return {
        success: false,
        message: "Agent not found in linked list",
      };
    }

    // Update ONLY the company
    const updatedUsers = {
      ...users,
      [company.id]: updatedCompany,
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: "Access updated successfully",
    };
  },

  // Update agent's access status - FIXED to properly update state
  updateAgentAccessStatus: (companyId, agentId, agentRole, status) => {
    const { demoData } = get();
    const users = demoData.users;

    const company = users[companyId];
    if (!company)
      return {
        success: false,
        message: "Company not found",
      };

    // Create a deep copy to avoid mutation issues
    const updatedCompany = JSON.parse(JSON.stringify(company));

    let found = false;

    if (agentRole === "verifier") {
      const verifiers = updatedCompany.linkedVerifiers || [];
      for (let i = 0; i < verifiers.length; i++) {
        if (verifiers[i].id === agentId) {
          verifiers[i].accessStatus = status;
          found = true;
          break;
        }
      }
    } else if (agentRole === "freight agent") {
      const agents = updatedCompany.linkedFreightAgents || [];
      for (let i = 0; i < agents.length; i++) {
        if (agents[i].id === agentId) {
          agents[i].accessStatus = status;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return {
        success: false,
        message: "Agent not found in linked list",
      };
    }

    const updatedUsers = {
      ...users,
      [company.id]: updatedCompany,
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({
      demoData: updatedDemoData,
    });

    return {
      success: true,
      message: "Access status updated successfully",
    };
  },

  // Login on behalf of a company - FIXED to use ONLY company's access tabs
  loginForCompany: (agentId, companyRole, traceRxId) => {
    const { demoData } = get();
    const users = demoData.users;

    // Find company by traceRxId and role
    const company = Object.values(users).find(
      (user) => user.role === companyRole && user.traceRxId === traceRxId,
    );

    if (!company) {
      return {
        success: false,
        message: "Company not found with the provided TraceRx ID",
      };
    }

    // Get agent
    const agent = users[agentId];
    if (!agent) {
      return {
        success: false,
        message: "Agent not found",
      };
    }

    // Check if agent is linked to this company and get access info
    let isLinked = false;
    let accessStatus = false;
    let accessTabs = {};

    if (agent.role === "verifier") {
      const linkedVerifier = (company.linkedVerifiers || []).find(
        (v) => v.id === agentId,
      );
      if (linkedVerifier) {
        isLinked = true;
        accessStatus = linkedVerifier.accessStatus;
        accessTabs = linkedVerifier.accessTabs || {};
      }
    } else if (agent.role === "freight agent") {
      const linkedAgent = (company.linkedFreightAgents || []).find(
        (f) => f.id === agentId,
      );
      if (linkedAgent) {
        isLinked = true;
        accessStatus = linkedAgent.accessStatus;
        accessTabs = linkedAgent.accessTabs || {};
      }
    }

    if (!isLinked) {
      return {
        success: false,
        message:
          "You are not authorized to access this company. Please request access first.",
      };
    }

    if (!accessStatus) {
      return {
        success: false,
        message:
          "Your access to this company is currently inactive. Please contact the company administrator.",
      };
    }

    return {
      success: true,
      company: company,
      accessTabs: accessTabs, // This is the SINGLE source of truth for access tabs
    };
  },

  // Set current user
  setUser: (user, company = null, accessTabs = null) => {
    let userToStore = user;

    if (company) {
      userToStore = {
        ...user,
        loggedInAs: {
          companyId: company.id,
          companyType: company.role,
          companyName: company.basicInfo?.companyName,
          traceRxId: company.traceRxId,
          accessTabs: accessTabs || {},
        },
      };
    }

    set({
      user: userToStore,
    });

    const { demoData } = get();
    const updatedDemoData = {
      ...demoData,
      systemState: {
        ...demoData.systemState,
        currentUser: userToStore,
      },
    };

    set({
      demoData: updatedDemoData,
    });
  },

  // Set login data for continuation
  setLoginData: (data) => {
    set({
      loginData: data,
    });
  },

  // Clear login data
  clearLoginData: () => {
    set({
      loginData: null,
    });
  },

  // Logout method
  logout: () => {
    set({
      user: null,
      loginData: null,
    });

    const { demoData } = get();
    const updatedDemoData = {
      ...demoData,
      systemState: {
        ...demoData.systemState,
        currentUser: null,
      },
    };

    set({
      demoData: updatedDemoData,
    });

    toast.success("Logged out successfully");
  },

  // Get user by ID
  getUserById: (userId) => {
    const { demoData } = get();
    return demoData.users[userId];
  },

  // Get agent's linked companies (simplified - no access tabs)
  getAgentLinkedCompanies: (agentId) => {
    const { demoData } = get();
    const agent = demoData.users[agentId];

    if (!agent) return [];

    return agent.linkedCompanies || [];
  },

  // Get agent's pending requests
  getAgentPendingRequests: (agentId) => {
    const { demoData } = get();
    const agent = demoData.users[agentId];

    if (!agent) return [];

    return agent.pendingCompanyRequests || [];
  },

  // Get company's pending agents - FIXED to use actual state data
  getCompanyPendingAgents: (companyId) => {
    const { demoData } = get();
    const company = demoData.users[companyId];

    if (!company)
      return {
        verifiers: [],
        freightAgents: [],
      };

    const pendingVerifiers = (company.pendingVerifiers || []).map((id) => {
      const agent = demoData.users[id];
      return {
        id,
        basicInfo: agent?.basicInfo || {},
        role: agent?.role || "verifier",
      };
    });

    const pendingFreightAgents = (company.pendingFreightAgents || []).map(
      (id) => {
        const agent = demoData.users[id];
        return {
          id,
          basicInfo: agent?.basicInfo || {},
          role: agent?.role || "freight agent",
        };
      },
    );

    return {
      verifiers: pendingVerifiers,
      freightAgents: pendingFreightAgents,
    };
  },

  // Get company's linked agents with their access info - FIXED to use actual state data
  getCompanyLinkedAgents: (companyId) => {
    const { demoData } = get();
    const company = demoData.users[companyId];

    if (!company)
      return {
        verifiers: [],
        freightAgents: [],
      };

    const linkedVerifiers = (company.linkedVerifiers || []).map((verifier) => {
      const agent = demoData.users[verifier.id];
      return {
        ...verifier,
        basicInfo: agent?.basicInfo || {},
        role: agent?.role || "verifier",
      };
    });

    const linkedFreightAgents = (company.linkedFreightAgents || []).map(
      (agentData) => {
        const agent = demoData.users[agentData.id];
        return {
          ...agentData,
          basicInfo: agent?.basicInfo || {},
          role: agent?.role || "freight agent",
        };
      },
    );

    return {
      verifiers: linkedVerifiers,
      freightAgents: linkedFreightAgents,
    };
  },
  // In your useUserStore.js, add these methods:

  // Add this method to update demo data
  updateDemoData: (updatedData) => {
    set({ demoData: updatedData });
  },

  updateUser: (userId, updatedUserData) => {
    const { demoData } = get();
    const updatedUsers = {
      ...demoData.users,
      [userId]: updatedUserData,
    };

    const updatedDemoData = {
      ...demoData,
      users: updatedUsers,
    };

    set({ demoData: updatedDemoData });

    // Also update current user if it's the same user
    const currentState = get();
    if (currentState.user && currentState.user.id === userId) {
      set({ user: updatedUserData });
    }

    return { success: true };
  },
}));

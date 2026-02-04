javascript
import { toast } from "react-toastify";
import { create } from "zustand";

// Helper function to generate TraceRx ID
const generateTraceRxId = (role) => {
  const prefix = role === 'exporter' ? 'EX' : role === 'importer' ? 'IM' : 'UN';
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

// Demo data schema
const demoData = {
  "users": {
    "exporter-1": {
      "id": "exporter-1",
      "role": "exporter",
      "password": "exporter123",
      "isVerified": true,
      "currentOtpKey": null,
      "traceRxId": "EX123456",
      "basicInfo": {
        "companyName": "Green Timber Exports Ltd",
        "email": "contact@greentimber.com",
        "country": "Brazil",
        "tinNumber": "BR-123456789",
        "rcNumber": "RC-987654",
        "licenseNumber": "EX-2023-0456"
      },
      "documents": {
        "registration": [
          { "name": "Business License", "url": "https://cloud-storage.com/docs/reg-1.pdf" },
          { "name": "Tax Certificate", "url": "https://cloud-storage.com/docs/reg-2.pdf" }
        ],
        "licensesPermits": [
          { "name": "Export Permit 2023", "url": "https://cloud-storage.com/docs/lic-1.pdf" },
          { "name": "Forestry License", "url": "https://cloud-storage.com/docs/lic-2.pdf" }
        ],
        "others": [
          { "name": "ISO Certification", "url": "https://cloud-storage.com/docs/other-1.pdf" }
        ]
      },
      "contactPersons": [
        {
          "id": "cp-1",
          "fullName": "Maria Silva",
          "telephone": "+55-11-98765-4321",
          "address": "Av. Paulista 1000, São Paulo",
          "email": "maria@greentimber.com",
          "idCards": [
            { "name": "National ID", "url": "https://cloud-storage.com/ids/id-1.jpg" },
            { "name": "Passport", "url": "https://cloud-storage.com/ids/id-2.jpg" }
          ]
        }
      ],
      "facilities": [
        {
          "id": "fac-1",
          "type": "Corporate facility",
          "name": "Headquarters Office",
          "address": "São Paulo, Brazil",
          "photos": [
            { "name": "Office Front", "url": "https://cloud-storage.com/photos/office-1.jpg" }
          ],
          "videos": [],
          "staff": [
            {
              "id": "staff-1",
              "fullName": "Carlos Mendez",
              "age": 42,
              "jobDescription": "Operations Manager",
              "idCard": { "name": "staff id card", "url": "https://cloud-storage.com/staff/id-1.pdf" },
              "employmentContract": { "name": "employment contract", "url": "https://cloud-storage.com/staff/contract-1.pdf" }
            }
          ]
        },
        {
          "id": "fac-2",
          "type": "production/forest site",
          "name": "Amazon Forest Plot A",
          "address": "Amazonas, Brazil",
          "documents": {
            "landUseRights": [
              { "name": "Land Title Deed", "url": "https://cloud-storage.com/forest/land-1.pdf" }
            ],
            "environmentalProtection": [
              { "name": "Environmental Impact Assessment", "url": "https://cloud-storage.com/docs/forest/env-1.pdf" }
            ],
            "forestRelatedRules": [
              { "name": "Forest Management Plan", "url": "https://cloud-storage.com/docs/forest/forest-1.pdf" }
            ],
            "thirdPartiesRights": [
              { "name": "Community Agreement", "url": "https://cloud-storage.com/docs/forest/community-1.pdf" }
            ],
            "labourRights": [
              { "name": "Labor Compliance Certificate", "url": "https://cloud-storage.com/docs/forest/labor-1.pdf" }
            ],
            "humanRights": [
              { "name": "Human Rights Assessment", "url": "https://cloud-storage.com/docs/forest/hr-1.pdf" }
            ],
            "fpic": [
              { "name": "FPIC Documentation", "url": "https://cloud-storage.com/docs/forest/fpic-1.pdf" }
            ],
            "taxAntiCorruptionTradeCustoms": [
              { "name": "Tax Compliance Certificate", "url": "https://cloud-storage.com/docs/forest/tax-1.pdf" },
              { "name": "Anti-corruption Policy", "url": "https://cloud-storage.com/docs/forest/anti-corrupt-1.pdf" }
            ]
          },
          "areas": [
            {
              "id": "area-1",
              "name": "Main Harvest Zone",
              "coordinates": [[-3.456, -61.7464], [-3.457, -61.7475], [-3.455, -61.7480]],
              "hectares": 500
            }
          ],
          "pastRecords": {
            "2021": [
              {
                "id": "record-2021-1",
                "license": "EX-2021-1234",
                "description": "Export of certified mahogany logs",
                "tradeName": "Amazon Mahogany",
                "commonName": "Mahogany",
                "scientificName": "Swietenia macrophylla",
                "hsCodes": [
                  { "commodity": "Wood", "code": "4403", "name": "Wood in the rough" }
                ],
                "netMassKg": 50000,
                "countryOfProduction": "Brazil",
                "productionLocation": "Amazonas",
                "productionDateRange": {
                  "from": "2021-03-01",
                  "to": "2021-08-31"
                },
                "customerName": "European Timber Importers GmbH",
                "customerAddress": "Hamburg, Germany",
                "customerEmail": "orders@eti-gmbh.de",
                "deforestationFreeDocs": [
                  { "name": "Deforestation-Free Certification", "url": "https://cloud-storage.com/docs/2021/defree-1.pdf" }
                ],
                "legalComplianceDocs": [
                  { "name": "Legal Compliance Certificate", "url": "https://cloud-storage.com/docs/2021/legal-1.pdf" }
                ],
                "plantingAreas": [
                  {
                    "id": "planting-area-1-2021",
                    "name": "2021 Planting Zone A",
                    "coordinates": [[-3.458, -61.7490], [-3.459, -61.7500], [-3.460, -61.7510]],
                    "hectares": 25
                  },
                  {
                    "id": "planting-area-2-2021",
                    "name": "2021 Planting Zone B",
                    "coordinates": [[-3.462, -61.7520], [-3.463, -61.7530]],
                    "hectares": 25
                  }
                ],
                "totalHectares": 50
              }
            ],
            "2022": [],
            "2023": [],
            "2024": [],
            "2025": []
          },
          "supportedProducts": [
            {
              "commodity": "Wood",
              "products": [
                { "code": "4403", "name": "Wood in the rough" },
                { "code": "4407", "name": "Wood sawn or chipped lengthwise" }
              ]
            }
          ],
          "totalHectares": 5000
        }
      ],
      "supportedCommodities": [
        {
          "commodity": "Wood",
          "products": [
            { "code": "4403", "name": "Wood in the rough" },
            { "code": "4407", "name": "Wood sawn or chipped lengthwise" }
          ]
        }
      ],
      "logo": { "name": "company-logo", "url": "https://cloud-storage.com/logo/exporter-logo.png" },
      "importers": ["importer-1", "importer-2"],
      "shipments": ["shipment-1", "shipment-2"],
      "report": { "name": "Annual Compliance Report 2023", "url": "https://cloud-storage.com/docs/reports/report-1.pdf" },
      "linkedVerifiers": [
        {
          "id": "verifier-1",
          "accessStatus": true,
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": true,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        },
        {
          "id": "verifier-2",
          "accessStatus": true,
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": false,
            "riskMitigation": false,
            "shipments": true,
            "reports": false,
            "gpsCamera": false,
            "supplyChain": true
          }
        }
      ],
      "linkedFreightAgents": [
        {
          "id": "freight-agent-1",
          "accessStatus": true,
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": false,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": false,
            "shipments": true,
            "reports": false,
            "gpsCamera": true,
            "supplyChain": true
          }
        }
      ],
      "pendingVerifiers": [],
      "pendingFreightAgents": []
    },

    "exporter-2": {
      "id": "exporter-2",
      "role": "exporter",
      "password": "coffeeExport456",
      "isVerified": true,
      "currentOtpKey": null,
      "traceRxId": "EX654321",
      "basicInfo": {
        "companyName": "Brazilian Coffee Exporters",
        "email": "export@brazilcoffee.com",
        "country": "Brazil",
        "tinNumber": "BR-987654321",
        "rcNumber": "RC-112233",
        "licenseNumber": "EX-2023-0789"
      },
      "documents": {
        "registration": [
          { "name": "Coffee Export License", "url": "https://cloud-storage.com/docs/exporter2/reg-1.pdf" }
        ],
        "licensesPermits": [],
        "others": []
      },
      "contactPersons": [],
      "facilities": [],
      "pastRecords": {
        "2021": [],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "supportedCommodities": [
        {
          "commodity": "Coffee",
          "products": [
            { "code": "ex 0901 11 00", "name": "Coffee, not roasted, not decaffeinated" }
          ]
        }
      ],
      "logo": { "name": "coffee-exporter-logo", "url": "https://cloud-storage.com/logo/coffee-logo.png" },
      "importers": ["importer-1"],
      "shipments": ["shipment-3"],
      "report": { "name": "Coffee Export Report 2023", "url": "https://cloud-storage.com/docs/reports/coffee-report.pdf" },
      "linkedVerifiers": [
        {
          "id": "verifier-1",
          "accessStatus": true,
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": false,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        }
      ],
      "linkedFreightAgents": [],
      "pendingVerifiers": [],
      "pendingFreightAgents": []
    },

    "importer-1": {
      "id": "importer-1",
      "role": "importer",
      "password": "germanyImport789",
      "isVerified": true,
      "currentOtpKey": null,
      "traceRxId": "IM123456",
      "basicInfo": {
        "companyName": "European Timber Importers GmbH",
        "email": "info@eti-gmbh.de",
        "country": "Germany",
        "tinNumber": "DE-987654321",
        "rcNumber": "HRB-123456",
        "licenseNumber": "IM-2023-0789"
      },
      "documents": {
        "registration": [
          { "name": "German Business License", "url": "https://cloud-storage.com/docs/importer/reg-1.pdf" }
        ],
        "licensesPermits": [
          { "name": "Import License 2023", "url": "https://cloud-storage.com/docs/importer/lic-1.pdf" }
        ],
        "others": []
      },
      "contactPersons": [
        {
          "id": "imp-cp-1",
          "fullName": "Hans Schmidt",
          "telephone": "+49-40-12345678",
          "address": "Hamburg, Germany",
          "email": "hans@eti-gmbh.de",
          "idCards": [
            { "name": "EU Passport", "url": "https://cloud-storage.com/ids/imp-id-1.jpg" }
          ]
        }
      ],
      "facilities": [
        {
          "id": "imp-fac-1",
          "type": "Corporate facility",
          "name": "Hamburg Warehouse",
          "address": "Hamburg Port, Germany",
          "photos": [],
          "videos": [],
          "staff": []
        }
      ],
      "supportedCommodities": [
        {
          "commodity": "Wood",
          "products": [
            { "code": "4403", "name": "Wood in the rough" },
            { "code": "4407", "name": "Wood sawn or chipped lengthwise" }
          ]
        },
        {
          "commodity": "Coffee",
          "products": [
            { "code": "ex 0901 11 00", "name": "Coffee, not roasted, not decaffeinated" }
          ]
        }
      ],
      "logo": { "name": "importer-logo", "url": "https://cloud-storage.com/logo/importer-logo.png" },
      "exporters": ["exporter-1", "exporter-2"],
      "supplierRecords": {
        "2021": [
          {
            "supplierId": "exporter-1",
            "supplierName": "Green Timber Exports Ltd",
            "supplierAddress": "São Paulo, Brazil",
            "supplierEmail": "contact@greentimber.com",
            "description": "Import of mahogany logs",
            "tradeName": "Amazon Mahogany",
            "commonName": "Mahogany",
            "scientificName": "Swietenia macrophylla",
            "hsCodes": [
              { "commodity": "Wood", "code": "4403", "name": "Wood in the rough" }
            ],
            "netMassKg": 50000,
            "customerName": "European Timber Importers GmbH",
            "customerAddress": "Hamburg, Germany",
            "customerEmail": "orders@eti-gmbh.de"
          },
          {
            "supplierId": "exporter-2",
            "supplierName": "Brazilian Coffee Exporters",
            "supplierAddress": "Brazil",
            "supplierEmail": "export@brazilcoffee.com",
            "description": "Import of Brazilian coffee beans",
            "tradeName": "Arabica Premium",
            "commonName": "Coffee",
            "scientificName": "Coffea arabica",
            "hsCodes": [
              { "commodity": "Coffee", "code": "ex 0901 11 00", "name": "Coffee, not roasted, not decaffeinated" }
            ],
            "netMassKg": 10000,
            "customerName": "European Timber Importers GmbH",
            "customerAddress": "Hamburg, Germany",
            "customerEmail": "orders@eti-gmbh.de"
          }
        ],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "riskAssessment": {
        "2021": [
          {
            "supplierId": "exporter-1",
            "riskLevel": "negligible risk",
            "assessmentDocs": [
              { "name": "Risk Assessment Report 2021 - Exporter 1", "url": "https://cloud-storage.com/docs/risk/2021-exporter1.pdf" }
            ]
          },
          {
            "supplierId": "exporter-2",
            "riskLevel": "high risk",
            "assessmentDocs": [
              { "name": "Risk Assessment Report 2021 - Exporter 2", "url": "https://cloud-storage.com/docs/risk/2021-exporter2.pdf" }
            ]
          }
        ],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "riskMitigation": {
        "2021": [
          {
            "supplierId": "exporter-2",
            "highRiskSection": {
              "additionalInfo": [
                { "name": "Additional Supplier Info - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/add-info-ex2.pdf" }
              ],
              "independentSurveys": [
                { "name": "Third-Party Audit Report - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/audit-ex2.pdf" }
              ],
              "otherMeasures": [],
              "capacityBuilding": [
                { "name": "Supplier Training Program - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/training-ex2.pdf" }
              ]
            },
            "policiesControls": {
              "modelPractices": {
                "isSme": false,
                "officerName": "Anna Weber",
                "officerIdCard": { "name": "officer id card", "url": "https://cloud-storage.com/docs/mitigation/officer-id.pdf" },
                "appointmentLetter": { "name": "appointment letter", "url": "https://cloud-storage.com/docs/mitigation/appointment.pdf" },
                "additionalDocs": [
                  { "name": "Risk Management Policy - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/policy-ex2.pdf" }
                ]
              },
              "independentAudit": [
                { "name": "Annual Internal Audit - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/internal-audit-ex2.pdf" }
              ]
            },
            "decisionsReview": [
              { "name": "Annual Risk Mitigation Review - Exporter 2", "url": "https://cloud-storage.com/docs/mitigation/review-2023-ex2.pdf" }
            ]
          }
        ],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "shipments": ["shipment-1", "shipment-3"],
      "linkedVerifiers": [
        {
          "id": "verifier-1",
          "accessStatus": false,
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": true,
            "informationRequirements": true,
            "newShipmentOrigin": false,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        }
      ],
      "linkedFreightAgents": [
        {
          "id": "freight-agent-1",
          "accessStatus": false,
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": false,
            "informationRequirements": false,
            "newShipmentOrigin": true,
            "shipments": true,
            "reports": false,
            "gpsCamera": true,
            "supplyChain": true
          }
        }
      ],
      "pendingVerifiers": [],
      "pendingFreightAgents": []
    },

    "importer-2": {
      "id": "importer-2",
      "role": "importer",
      "password": "ukFurniture321",
      "isVerified": true,
      "currentOtpKey": null,
      "traceRxId": "IM654321",
      "basicInfo": {
        "companyName": "UK Furniture Manufacturers Ltd",
        "email": "imports@ukfurniture.com",
        "country": "United Kingdom",
        "tinNumber": "GB-112233445",
        "rcNumber": "RC-998877",
        "licenseNumber": "IM-2023-0567"
      },
      "documents": {
        "registration": [],
        "licensesPermits": [],
        "others": []
      },
      "contactPersons": [],
      "facilities": [],
      "supportedCommodities": [
        {
          "commodity": "Wood",
          "products": [
            { "code": "4407", "name": "Wood sawn or chipped lengthwise" }
          ]
        }
      ],
      "logo": { "name": "uk-importer-logo", "url": "https://cloud-storage.com/logo/uk-logo.png" },
      "exporters": ["exporter-1"],
      "supplierRecords": {
        "2021": [],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "riskAssessment": {
        "2021": [],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "riskMitigation": {
        "2021": [],
        "2022": [],
        "2023": [],
        "2024": [],
        "2025": []
      },
      "shipments": ["shipment-2"],
      "linkedVerifiers": [],
      "linkedFreightAgents": [],
      "pendingVerifiers": [],
      "pendingFreightAgents": []
    },

    "freight-agent-1": {
      "id": "freight-agent-1",
      "role": "freight agent",
      "password": "freightLogistics654",
      "isVerified": true,
      "currentOtpKey": null,
      "basicInfo": {
        "firstName": "Thomas",
        "lastName": "Anderson",
        "email": "thomas@freight-logistics.com",
        "freightLicenseNumber": "FL-2023-8899"
      },
      "bioData": {
        "personalInfo": {
          "dateOfBirth": "1985-05-15",
          "nationality": "German",
          "address": "Berlin, Germany",
          "phone": "+49-30-12345678"
        },
        "documents": {
          "freightLicense": [
            { "name": "Freight Forwarding License", "url": "https://cloud-storage.com/docs/freight/license.pdf" }
          ],
          "insurance": [
            { "name": "Cargo Insurance Certificate", "url": "https://cloud-storage.com/docs/freight/insurance.pdf" }
          ],
          "identification": [
            { "name": "Passport", "url": "https://cloud-storage.com/docs/freight/passport.pdf" }
          ],
          "certifications": [
            { "name": "ISO Certification", "url": "https://cloud-storage.com/docs/freight/iso-cert.pdf" }
          ]
        }
      },
      "linkedCompanies": [
        {
          "companyId": "exporter-1",
          "companyType": "exporter",
          "companyName": "Green Timber Exports Ltd",
          "traceRxId": "EX123456",
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": false,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": false,
            "shipments": true,
            "reports": false,
            "gpsCamera": true,
            "supplyChain": true
          },
          "status": "active"
        },
        {
          "companyId": "importer-1",
          "companyType": "importer",
          "companyName": "European Timber Importers GmbH",
          "traceRxId": "IM123456",
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": false,
            "informationRequirements": false,
            "newShipmentOrigin": true,
            "shipments": true,
            "reports": false,
            "gpsCamera": true,
            "supplyChain": true
          },
          "status": "pending_approval"
        }
      ],
      "pendingCompanyRequests": []
    },

    "verifier-1": {
      "id": "verifier-1",
      "role": "verifier",
      "password": "auditSecure987",
      "isVerified": true,
      "currentOtpKey": null,
      "basicInfo": {
        "firstName": "Dr. Michael",
        "lastName": "Chen",
        "email": "michael.chen@audit-consulting.com",
        "agencyDepartmentId": "EUDR-VER-2023-001"
      },
      "bioData": {
        "personalInfo": {
          "dateOfBirth": "1978-08-22",
          "nationality": "French",
          "address": "Paris, France",
          "phone": "+33-1-23456789"
        },
        "documents": {
          "professionalCertificates": [
            { "name": "EUDR Auditor Certification", "url": "https://cloud-storage.com/docs/verifier/cert-1.pdf" }
          ],
          "agencyAffiliation": [
            { "name": "Agency Authorization Letter", "url": "https://cloud-storage.com/docs/verifier/agency-auth.pdf" }
          ],
          "identification": [
            { "name": "National ID", "url": "https://cloud-storage.com/docs/verifier/id.pdf" }
          ],
          "academicQualifications": [
            { "name": "Master's Degree in Environmental Science", "url": "https://cloud-storage.com/docs/verifier/degree.pdf" }
          ]
        }
      },
      "linkedCompanies": [
        {
          "companyId": "exporter-1",
          "companyType": "exporter",
          "companyName": "Green Timber Exports Ltd",
          "traceRxId": "EX123456",
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": true,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        },
        {
          "companyId": "importer-1",
          "companyType": "importer",
          "companyName": "European Timber Importers GmbH",
          "traceRxId": "IM123456",
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": true,
            "informationRequirements": true,
            "newShipmentOrigin": false,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        },
        {
          "companyId": "exporter-2",
          "companyType": "exporter",
          "companyName": "Brazilian Coffee Exporters",
          "traceRxId": "EX654321",
          "accessTabs": {
            "overview": true,
            "companyDetails": true,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": true,
            "riskMitigation": false,
            "shipments": true,
            "reports": true,
            "gpsCamera": false,
            "supplyChain": true
          }
        }
      ],
      "verificationReports": [
        {
          "id": "ver-report-1",
          "companyId": "exporter-1",
          "companyType": "exporter",
          "date": "2023-11-15",
          "type": "compliance_audit",
          "status": "approved",
          "reportUrl": "https://cloud-storage.com/docs/verification/ver-report-1.pdf",
          "findings": [
            {
              "tab": "forest_management",
              "status": "compliant",
              "notes": "All forest management plans are up to date and compliant with EUDR regulations."
            },
            {
              "tab": "due_diligence",
              "status": "compliant",
              "notes": "Due diligence process properly documented and implemented."
            }
          ]
        },
        {
          "id": "ver-report-3",
          "companyId": "exporter-2",
          "companyType": "exporter",
          "date": "2023-09-20",
          "type": "compliance_audit",
          "status": "approved",
          "reportUrl": "https://cloud-storage.com/docs/verification/ver-report-3.pdf",
          "findings": [
            {
              "tab": "company_details",
              "status": "compliant",
              "notes": "Company registration and licenses are valid."
            }
          ]
        }
      ],
      "pendingCompanyRequests": []
    },

    "verifier-2": {
      "id": "verifier-2",
      "role": "verifier",
      "password": "environmentAudit246",
      "isVerified": true,
      "currentOtpKey": null,
      "basicInfo": {
        "firstName": "Sophie",
        "lastName": "Martinez",
        "email": "sophie@independent-auditor.eu",
        "agencyDepartmentId": "IND-VER-2023-045"
      },
      "bioData": {
        "personalInfo": {
          "dateOfBirth": "1982-03-10",
          "nationality": "Spanish",
          "address": "Madrid, Spain",
          "phone": "+34-91-2345678"
        },
        "documents": {
          "professionalCertificates": [
            { "name": "Environmental Auditor License", "url": "https://cloud-storage.com/docs/verifier2/cert-1.pdf" }
          ],
          "identification": [
            { "name": "Passport", "url": "https://cloud-storage.com/docs/verifier2/passport.pdf" }
          ]
        }
      },
      "linkedCompanies": [
        {
          "companyId": "exporter-1",
          "companyType": "exporter",
          "companyName": "Green Timber Exports Ltd",
          "traceRxId": "EX123456",
          "accessTabs": {
            "overview": true,
            "companyDetails": false,
            "subjectMatterScope": true,
            "dueDiligence": true,
            "riskAssessment": false,
            "riskMitigation": false,
            "shipments": true,
            "reports": false,
            "gpsCamera": false,
            "supplyChain": true
          }
        }
      ],
      "verificationReports": [
        {
          "id": "ver-report-2",
          "companyId": "exporter-1",
          "companyType": "exporter",
          "date": "2023-10-10",
          "type": "shipment_verification",
          "status": "approved",
          "reportUrl": "https://cloud-storage.com/docs/verification/ver-report-2.pdf",
          "findings": [
            {
              "tab": "shipments",
              "status": "compliant",
              "notes": "Shipment documentation complete and accurate."
            }
          ]
        }
      ],
      "pendingCompanyRequests": []
    }
  },

  "shipments": {
    "shipment-1": {
      "id": "shipment-1",
      "batchNumber": "TRX-7890",
      "exporterId": "exporter-1",
      "importerId": "importer-1",
      "forests": [
        {
          "forestId": "fac-2",
          "selectedProducts": [
            { "commodity": "Wood", "code": "4403", "name": "Wood in the rough", "quantity": 25000 }
          ],
          "harvestAreas": [
            {
              "id": "harvest-area-1",
              "name": "Section A Harvest",
              "coordinates": [[-3.456, -61.7464], [-3.4565, -61.7470]]
            }
          ]
        }
      ],
      "productionDate": "2023-10-01",
      "processingLoadingDate": "2023-10-15",
      "importerConsignee": "European Timber Importers GmbH",
      "portOfDestination": "Hamburg Port, Germany",
      "portOfShipment": "Santos Port, Brazil",
      "shippingLine": "Maersk Line",
      "processingLoadingSite": "Santos Port Warehouse",
      "productDescription": "Certified sustainable mahogany logs for furniture manufacturing",
      "totalShippingFee": 1250,
      "totalHectares": 5,
      "containers": [
        {
          "containerNumber": "MAEU-1234567",
          "packingList": { "name": "packing list", "url": "https://cloud-storage.com/docs/shipment/packing-1.pdf" },
          "kilograms": 20000,
          "images": [
            { "name": "Container Loading", "url": "https://cloud-storage.com/docs/shipment/container-1.jpg" }
          ]
        }
      ],
      "status": "active",
      "shipmentDate": "2023-10-20",
      "createdOn": "2023-09-15",
      "imagesVideos": [
        { "name": "Loading Process", "url": "https://cloud-storage.com/docs/shipment/loading-vid.mp4" }
      ],
      "verificationStatus": "under_review"
    },
    "shipment-2": {
      "id": "shipment-2",
      "batchNumber": "TRX-7891",
      "exporterId": "exporter-1",
      "importerId": "importer-2",
      "forests": [],
      "productionDate": "2023-11-01",
      "processingLoadingDate": "2023-11-10",
      "importerConsignee": "UK Furniture Manufacturers Ltd",
      "portOfDestination": "Liverpool Port, UK",
      "portOfShipment": "Santos Port, Brazil",
      "shippingLine": "MSC",
      "processingLoadingSite": "Santos Port Warehouse",
      "productDescription": "Processed wood planks",
      "totalShippingFee": 1800,
      "totalHectares": 8,
      "containers": [],
      "status": "pending",
      "shipmentDate": "2023-11-15",
      "createdOn": "2023-10-20",
      "imagesVideos": [],
      "verificationStatus": "not_started"
    },
    "shipment-3": {
      "id": "shipment-3",
      "batchNumber": "TRX-7892",
      "exporterId": "exporter-2",
      "importerId": "importer-1",
      "forests": [],
      "productionDate": "2023-09-15",
      "processingLoadingDate": "2023-09-25",
      "importerConsignee": "European Timber Importers GmbH",
      "portOfDestination": "Hamburg Port, Germany",
      "portOfShipment": "Rio de Janeiro Port, Brazil",
      "shippingLine": "Hapag-Lloyd",
      "processingLoadingSite": "Rio Warehouse",
      "productDescription": "Premium Brazilian coffee beans",
      "totalShippingFee": 800,
      "totalHectares": 0,
      "containers": [],
      "status": "completed",
      "shipmentDate": "2023-09-30",
      "createdOn": "2023-08-15",
      "imagesVideos": [],
      "verificationStatus": "approved"
    }
  },

  "commodities": [
    {
      "commodity": "Cattle",
      "products": [
        { "code": "0102 21 00", "name": "Live bovine animals (breeding)" },
        { "code": "0102 29 05", "name": "Live bovine animals (other, <80 kg)" },
        { "code": "0102 29 95", "name": "Live bovine animals (other)" },
        { "code": "0201", "name": "Meat of bovine animals, fresh or chilled" },
        { "code": "0202", "name": "Meat of bovine animals, frozen" },
        { "code": "0206 10 95", "name": "Edible offal of bovine animals, fresh or chilled" },
        { "code": "0206 22 00", "name": "Bovine livers, frozen" },
        { "code": "0206 29 91", "name": "Bovine offal, frozen (excluding tongues and livers)" },
        { "code": "0210 20", "name": "Meat of bovine animals, salted, in brine, dried or smoked" },
        { "code": "4101", "name": "Raw hides and skins of bovine animals" },
        { "code": "4102", "name": "Raw skins of sheep or lambs" },
        { "code": "4103", "name": "Other raw hides and skins" },
        { "code": "4301", "name": "Raw furskins" }
      ]
    },
    {
      "commodity": "Cocoa",
      "products": [
        { "code": "1801 00 00", "name": "Cocoa beans, whole or broken, raw or roasted" },
        { "code": "1802 00 00", "name": "Cocoa shells, husks, skins and other cocoa waste" },
        { "code": "1803", "name": "Cocoa paste, whether or not defatted" },
        { "code": "1804 00 00", "name": "Cocoa butter, fat and oil" },
        { "code": "1805 00 00", "name": "Cocoa powder, not containing added sugar" },
        { "code": "1806", "name": "Chocolate and other food preparations containing cocoa" }
      ]
    },
    {
      "commodity": "Coffee",
      "products": [
        { "code": "ex 0901 11 00", "name": "Coffee, not roasted, not decaffeinated" },
        { "code": "ex 0901 12 00", "name": "Coffee, not roasted, decaffeinated" },
        { "code": "ex 0901 21 00", "name": "Roasted coffee, not decaffeinated" },
        { "code": "ex 0901 22 00", "name": "Roasted coffee, decaffeinated" },
        { "code": "ex 0901 90 90", "name": "Coffee husks and skins; coffee substitutes containing coffee" }
      ]
    },
    {
      "commodity": "Oil palm",
      "products": [
        { "code": "1207 10 00", "name": "Palm nuts and kernels" },
        { "code": "1511", "name": "Palm oil and its fractions" },
        { "code": "1513 21", "name": "Palm kernel oil, crude" },
        { "code": "1513 29", "name": "Palm kernel oil and its fractions, refined" },
        { "code": "1516 20 96", "name": "Palm oil derivatives (vegetable fats and oils)" },
        { "code": "2306 60 00", "name": "Oil-cake and other solid residues from palm oil extraction" }
      ]
    },
    {
      "commodity": "Rubber",
      "products": [
        { "code": "4001", "name": "Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums" },
        { "code": "4002", "name": "Synthetic rubber and factice derived from oils" },
        { "code": "4005", "name": "Compounded rubber, unvulcanised" },
        { "code": "4006", "name": "Unvulcanised rubber in other forms" },
        { "code": "4007", "name": "Vulcanised rubber thread and cord" },
        { "code": "4008", "name": "Plates, sheets, strip, rods and profile shapes of vulcanised rubber" },
        { "code": "4009", "name": "Tubes, pipes and hoses of vulcanised rubber" },
        { "code": "4010", "name": "Conveyor or transmission belts of vulcanised rubber" },
        { "code": "4011", "name": "New pneumatic tyres, of rubber" },
        { "code": "4012", "name": "Retreaded or used pneumatic tyres; solid or cushion tyres" },
        { "code": "4013", "name": "Inner tubes, of rubber" },
        { "code": "4014", "name": "Hygienic or pharmaceutical articles of vulcanised rubber" },
        { "code": "4015", "name": "Articles of apparel and clothing accessories of vulcanised rubber" },
        { "code": "4016", "name": "Other articles of vulcanised rubber (excluding hard rubber)" },
        { "code": "4017", "name": "Hard rubber in all forms" }
      ]
    },
    {
      "commodity": "Soya",
      "products": [
        { "code": "1201 90 00", "name": "Soya beans, whether or not broken" },
        { "code": "1208 10 00", "name": "Flours and meals of soya beans" },
        { "code": "1507", "name": "Soya-bean oil and its fractions" },
        { "code": "2304 00 00", "name": "Oil-cake and other solid residues from soya-bean oil extraction" }
      ]
    },
    {
      "commodity": "Wood",
      "products": [
        { "code": "4401", "name": "Fuel wood" },
        { "code": "4402", "name": "Wood charcoal" },
        { "code": "4403", "name": "Wood in the rough" },
        { "code": "4404", "name": "Hoopwood; split poles; piles, pickets and stakes" },
        { "code": "4405", "name": "Wood wool; wood flour" },
        { "code": "4406", "name": "Railway or tramway sleepers of wood" },
        { "code": "4407", "name": "Wood sawn or chipped lengthwise" },
        { "code": "4408", "name": "Sheets for veneering" },
        { "code": "4409", "name": "Wood continuously shaped along any edges" },
        { "code": "4410", "name": "Particle board, OSB and similar board" },
        { "code": "4411", "name": "Fibreboard of wood" },
        { "code": "4412", "name": "Plywood, veneered panels and similar laminated wood" },
        { "code": "4413", "name": "Densified wood" },
        { "code": "4414", "name": "Wooden frames for paintings, photographs, etc." },
        { "code": "4415", "name": "Packing cases, boxes, crates, drums and pallets" },
        { "code": "4416", "name": "Casks, barrels, vats, tubs and other coopers' products" },
        { "code": "4417", "name": "Tools, tool bodies, tool handles, broom or brush bodies" },
        { "code": "4418", "name": "Builders' joinery and carpentry of wood" },
        { "code": "4419", "name": "Tableware and kitchenware, of wood" },
        { "code": "4420", "name": "Wood marquetry and inlaid wood; caskets and cases" },
        { "code": "4421", "name": "Other articles of wood" }
      ]
    }
  ],

  "systemState": {
    "currentUser": null,
    "notifications": [],
    "uiPreferences": {}
  }
};


export const useUserStore = create((set, get) => ({
  demoData: demoData,
  user: null,
  loginData: null, // Stores data for login flow continuation
  
  // Login method - checks email, password, and role
  login: (email, password, role) => {
    const { demoData } = get();

    // Find user by email and role
    const users = demoData.users;
    const user = Object.values(users).find(user => {
      const userEmail = user.basicInfo?.email || user.email;
      return userEmail === email &&
        user.role === role &&
        user.password === password;
    });

    return user;
  },

  // Check if user exists by email
  checkUserExists: (email) => {
    const { demoData } = get();
    const users = demoData.users;
    
    const user = Object.values(users).find(user => {
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
          : "Account already exists but not verified. Please verify your account."
      };
    }
    
    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user structure based on role
    let newUser;
    
    if (userData.role === 'importer' || userData.role === 'exporter') {
      // Generate TraceRx ID
      const traceRxId = generateTraceRxId(userData.role);
      
      newUser = {
        id: userId,
        role: userData.role,
        password: userData.password,
        isVerified: false,
        currentOtpKey: null,
        traceRxId: traceRxId,
        basicInfo: {
          companyName: userData.companyName || "",
          email: userData.email,
          country: userData.country || "",
          tinNumber: userData.tinNumber || "",
          rcNumber: userData.Number || "",
          licenseNumber: "" // Will be filled later
        },
        documents: {
          registration: [],
          licensesPermits: [],
          others: []
        },
        contactPersons: [],
        facilities: [],
        pastRecords: {
          "2021": [],
          "2022": [],
          "2023": [],
          "2024": [],
          "2025": []
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
        pendingFreightAgents: []
      };
      
      // Add specific fields based on role
      if (userData.role === 'exporter') {
        newUser.importers = [];
      } else {
        newUser.exporters = [];
        newUser.supplierRecords = {
          "2021": [],
          "2022": [],
          "2023": [],
          "2024": [],
          "2025": []
        };
        newUser.riskAssessment = {
          "2021": [],
          "2022": [],
          "2023": [],
          "2024": [],
          "2025": []
        };
        newUser.riskMitigation = {
          "2021": [],
          "2022": [],
          "2023": [],
          "2024": [],
          "2025": []
        };
      }
    } else if (userData.role === 'freight agent' || userData.role === 'verifier') {
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
          freightLicenseNumber: userData.role === 'freight agent' ? "" : undefined,
          agencyDepartmentId: userData.role === 'verifier' ? "" : undefined
        },
        bioData: {
          personalInfo: {
            dateOfBirth: "",
            nationality: "",
            address: "",
            phone: ""
          },
          documents: {
            freightLicense: userData.role === 'freight agent' ? [] : undefined,
            insurance: userData.role === 'freight agent' ? [] : undefined,
            professionalCertificates: userData.role === 'verifier' ? [] : undefined,
            agencyAffiliation: userData.role === 'verifier' ? [] : undefined,
            identification: [],
            certifications: userData.role === 'freight agent' ? [] : undefined,
            academicQualifications: userData.role === 'verifier' ? [] : undefined
          }
        },
        linkedCompanies: [],
        verificationReports: userData.role === 'verifier' ? [] : undefined,
        pendingCompanyRequests: []
      };
    }
    
    // Add user to demoData
    const updatedDemoData = {
      ...demoData,
      users: {
        ...demoData.users,
        [userId]: newUser
      }
    };
    
    set({ demoData: updatedDemoData });
    
    return { 
      success: true, 
      message: "User created successfully.",
      user: newUser
    };
  },

  // Generate verification OTP for account verification
  generateVerificationOTP: (userId) => {
    const { demoData } = get();
    const users = demoData.users;
    
    if (!users[userId]) {
      return { success: false, message: "User not found" };
    }
    
    const otp = generateVerificationCode();
    
    // Store OTP in user's currentOtpKey
    const updatedUsers = {
      ...users,
      [userId]: {
        ...users[userId],
        currentOtpKey: otp
      }
    };
    
    const updatedDemoData = {
      ...demoData,
      users: updatedUsers
    };
    
    set({ demoData: updatedDemoData });
    
    // Show toast with OTP - DON'T show toast here, let the component handle it
    return { success: true, otp };
  },

  // Verify account with OTP
  verifyAccount: (userId, otp) => {
    const { demoData } = get();
    const users = demoData.users;
    
    if (!users[userId]) {
      return { success: false, message: "User not found" };
    }
    
    const user = users[userId];
    
    if (user.currentOtpKey !== otp) {
      return { success: false, message: "Invalid OTP" };
    }
    
    // Mark user as verified and clear OTP
    const updatedUsers = {
      ...users,
      [userId]: {
        ...user,
        isVerified: true,
        currentOtpKey: null
      }
    };
    
    const updatedDemoData = {
      ...demoData,
      users: updatedUsers
    };
    
    set({ demoData: updatedDemoData });
    
    // Set as current user
    set({ user: updatedUsers[userId] });
    
    // Update system state
    const finalDemoData = {
      ...updatedDemoData,
      systemState: {
        ...updatedDemoData.systemState,
        currentUser: updatedUsers[userId]
      }
    };
    
    set({ demoData: finalDemoData });
    
    return { 
      success: true, 
      message: "Account verified successfully",
      user: updatedUsers[userId]
    };
  },

  // Generate login OTP - MODIFIED: Don't show toast here
  generateLoginOTP: (userId) => {
    const { demoData } = get();
    const users = demoData.users;
    
    if (!users[userId]) {
      return { success: false, message: "User not found" };
    }
    
    const otp = generateOTP();
    
    // Store OTP in user's currentOtpKey
    const updatedUsers = {
      ...users,
      [userId]: {
        ...users[userId],
        currentOtpKey: otp
      }
    };
    
    const updatedDemoData = {
      ...demoData,
      users: updatedUsers
    };
    
    set({ demoData: updatedDemoData });
    
    // DON'T show toast here - let the component handle it
    return { success: true, otp };
  },

  // Verify login OTP
  verifyLoginOTP: (userId, otp) => {
    const { demoData } = get();
    const users = demoData.users;
    
    if (!users[userId]) {
      return { success: false, message: "User not found" };
    }
    
    const user = users[userId];
    
    if (user.currentOtpKey !== otp) {
      return { success: false, message: "Invalid OTP" };
    }
    
    // Clear OTP
    const updatedUsers = {
      ...users,
      [userId]: {
        ...user,
        currentOtpKey: null
      }
    };
    
    const updatedDemoData = {
      ...demoData,
      users: updatedUsers
    };
    
    set({ demoData: updatedDemoData });
    
    return { 
      success: true, 
      message: "OTP verified successfully",
      user: updatedUsers[userId]
    };
  },

  // Request company access for verifier/freight agent
  requestCompanyAccess: (agentId, companyRole, companyName, traceRxId) => {
    const { demoData } = get();
    const users = demoData.users;
    
    // Find company by traceRxId and role
    const company = Object.values(users).find(user => 
      user.role === companyRole && 
      user.traceRxId === traceRxId
    );
    
    if (!company) {
      return { success: false, message: "Company not found with the provided TraceRx ID" };
    }
    
    // Check if company name is similar (case-insensitive partial match)
    const companyNameLower = companyName.toLowerCase();
    const actualCompanyNameLower = company.basicInfo.companyName.toLowerCase();
    
    if (!actualCompanyNameLower.includes(companyNameLower) && 
        !companyNameLower.includes(actualCompanyNameLower)) {
      return { 
        success: false, 
        message: "Company name does not match. Please check the company name." 
      };
    }
    
    // Get agent
    const agent = users[agentId];
    if (!agent) {
      return { success: false, message: "Agent not found" };
    }
    
    // Check if already linked or pending
    const existingLink = company.linkedVerifiers?.find(v => v.id === agentId) || 
                        company.linkedFreightAgents?.find(f => f.id === agentId);
    
    if (existingLink) {
      return { 
        success: false, 
        message: "You are already linked to this company" 
      };
    }
    
    // Check if already in pending list
    const existingPending = company.pendingVerifiers?.includes(agentId) || 
                          company.pendingFreightAgents?.includes(agentId);
    
    if (existingPending) {
      return { 
        success: false, 
        message: "Your request is already pending approval" 
      };
    }
    
    // Add agent to pending list
    const updatedCompany = {
      ...company,
      pendingVerifiers: agent.role === 'verifier' 
        ? [...(company.pendingVerifiers || []), agentId]
        : company.pendingVerifiers,
      pendingFreightAgents: agent.role === 'freight agent'
        ? [...(company.pendingFreightAgents || []), agentId]
        : company.pendingFreightAgents
    };
    
    // Add to agent's pending requests
    const requestData = {
      companyId: company.id,
      companyType: company.role,
      companyName: company.basicInfo.companyName,
      traceRxId: company.traceRxId,
      requestedAt: new Date().toISOString()
    };
    
    const updatedAgent = {
      ...agent,
      pendingCompanyRequests: [
        ...(agent.pendingCompanyRequests || []),
        requestData
      ]
    };
    
    const updatedUsers = {
      ...users,
      [company.id]: updatedCompany,
      [agentId]: updatedAgent
    };
    
    const updatedDemoData = {
      ...demoData,
      users: updatedUsers
    };
    
    set({ demoData: updatedDemoData });
    
    return { 
      success: true, 
      message: `Request sent to ${company.basicInfo.companyName}. Once approved, you'll be able to access their dashboard.`,
      company: company
    };
  },

  // Approve or reject agent access
  updateAgentAccess: (companyId, agentId, agentRole, approve) => {
    const { demoData } = get();
    const users = demoData.users;
    
    const company = users[companyId];
    if (!company) return { success: false, message: "Company not found" };
    
    const agent = users[agentId];
    if (!agent) return { success: false, message: "Agent not found" };
    
    let updatedCompany = { ...company };
    
    // Remove from pending list
    if (agentRole === 'verifier') {
      updatedCompany.pendingVerifiers = (company.pendingVerifiers || []).filter(id => id !== agentId);
    } else if (agentRole === 'freight agent') {
      updatedCompany.pendingFreightAgents = (company.pendingFreightAgents || []).filter(id => id !== agentId);
    }
    
    if (approve) {
      // Default access tabs based on role
      const defaultAccessTabs = company.role === 'exporter' ? {
        overview: true,
        companyDetails: false,
        subjectMatterScope: false,
        dueDiligence: false,
        riskAssessment: false,
        riskMitigation: false,
        shipments: true,
        reports: false,
        gpsCamera: false,
        supplyChain: true
      } : {
        overview: true,
        companyDetails: false,
        subjectMatterScope: false,
        informationRequirements: false,
        newShipmentOrigin: false,
        shipments: true,
        reports: false,
        gpsCamera: false,
        supplyChain: true
      };
      
      // Add to linked list
      if (agentRole === 'verifier') {
        updatedCompany.linkedVerifiers = [
          ...(company.linkedVerifiers || []),
          {
            id: agentId,
            accessStatus: true,
            accessTabs: defaultAccessTabs
          }
        ];
      } else if (agentRole === 'freight agent') {
        updatedCompany.linkedFreightAgents = [
          ...(company.linkedFreightAgents || []),
          {
            id: agentId,
            accessStatus: true,
            accessTabs: defaultAccessTabs
          }
        ];
      }
      
      // Add company to agent's linkedCompanies
      const agentAccessTabs = company.role === 'exporter' ? {
        overview: true,
        companyDetails: false,
        subjectMatterScope: false,
        dueDiligence: false,
        riskAssessment: false,
        riskMitigation: false,
        shipments: true,
        reports: false,
        gpsCamera: false,
        supplyChain: true
      } : {
        overview: true,
        companyDetails: false,
        subjectMatterScope: false,
        informationRequirements: false,
        newShipmentOrigin: false,
        shipments: true,
        reports: false,
        gpsCamera: false,
        supplyChain: true
      };
      
      const updatedAgent = {
        ...agent,
        linkedCompanies: [
          ...(agent.linkedCompanies || []),
          {
            companyId: company.id,
            companyType: company.role,
            companyName: company.basicInfo.companyName,
            traceRxId: company.traceRxId,
            accessTabs: agentAccessTabs,
            status: "active"
          }
        ],
        pendingCompanyRequests: (agent.pendingCompanyRequests || []).filter(
          req => req.companyId !== companyId
        )
      };
      
      // Update both users
      const updatedUsers = {
        ...users,
        [company.id]: updatedCompany,
        [agentId]: updatedAgent
      };
      
      const updatedDemoData = {
        ...demoData,
        users: updatedUsers
      };
      
      set({ demoData: updatedDemoData });
      
      return { 
        success: true, 
        message: `${agentRole === 'verifier' ? 'Verifier' : 'Freight agent'} approved successfully` 
      };
    } else {
      // Just remove from pending (reject)
      const updatedAgent = {
        ...agent,
        pendingCompanyRequests: (agent.pendingCompanyRequests || []).filter(
          req => req.companyId !== companyId
        )
      };
      
      const updatedUsers = {
        ...users,
        [company.id]: updatedCompany,
        [agentId]: updatedAgent
      };
      
      const updatedDemoData = {
        ...demoData,
        users: updatedUsers
      };
      
      set({ demoData: updatedDemoData });
      
      return { 
        success: true, 
        message: "Request rejected" 
      };
    }
  },

  // Update agent's tab access
  updateAgentTabAccess: (companyId, agentId, agentRole, tab, access) => {
    const { demoData } = get();
    const users = demoData.users;
    
    const company = users[companyId];
    if (!company) return { success: false, message: "Company not found" };
    
    let updatedCompany = { ...company };
    
    if (agentRole === 'verifier') {
      const verifierIndex = (company.linkedVerifiers || []).findIndex(v => v.id === agentId);
      if (verifierIndex >= 0) {
        updatedCompany.linkedVerifiers = [...(company.linkedVerifiers || [])];
        updatedCompany.linkedVerifiers[verifierIndex] = {
          ...updatedCompany.linkedVerifiers[verifierIndex],
          accessTabs: {
            ...updatedCompany.linkedVerifiers[verifierIndex].accessTabs,
            [tab]: access
          }
        };
      }
    } else if (agentRole === 'freight agent') {
      const agentIndex = (company.linkedFreightAgents || []).findIndex(f => f.id === agentId);
      if (agentIndex >= 0) {
        updatedCompany.linkedFreightAgents = [...(company.linkedFreightAgents || [])];
        updatedCompany.linkedFreightAgents[agentIndex] = {
          ...updatedCompany.linkedFreightAgents[agentIndex],
          accessTabs: {
            ...updatedCompany.linkedFreightAgents[agentIndex].accessTabs,
            [tab]: access
          }
        };
      }
    }
    
    // Also update agent's linkedCompanies
    const agent = users[agentId];
    if (agent && agent.linkedCompanies) {
      const updatedAgent = {
        ...agent,
        linkedCompanies: agent.linkedCompanies.map(linked => {
          if (linked.companyId === companyId) {
            return {
              ...linked,
              accessTabs: {
                ...linked.accessTabs,
                [tab]: access
              }
            };
          }
          return linked;
        })
      };
      
      const updatedUsers = {
        ...users,
        [company.id]: updatedCompany,
        [agentId]: updatedAgent
      };
      
      const updatedDemoData = {
        ...demoData,
        users: updatedUsers
      };
      
      set({ demoData: updatedDemoData });
    } else {
      const updatedUsers = {
        ...users,
        [company.id]: updatedCompany
      };
      
      const updatedDemoData = {
        ...demoData,
        users: updatedUsers
      };
      
      set({ demoData: updatedDemoData });
    }
    
    return { success: true, message: "Access updated successfully" };
  },

  // Login on behalf of a company
  loginForCompany: (agentId, companyRole, traceRxId) => {
    const { demoData } = get();
    const users = demoData.users;
    
    // Find company by traceRxId and role
    const company = Object.values(users).find(user => 
      user.role === companyRole && 
      user.traceRxId === traceRxId
    );
    
    if (!company) {
      return { success: false, message: "Company not found" };
    }
    
    // Get agent
    const agent = users[agentId];
    if (!agent) {
      return { success: false, message: "Agent not found" };
    }
    
    // Check if agent is linked to this company
    let isLinked = false;
    let accessStatus = false;
    let accessTabs = {};
    
    if (agent.role === 'verifier') {
      const linkedVerifier = (company.linkedVerifiers || []).find(v => v.id === agentId);
      if (linkedVerifier) {
        isLinked = true;
        accessStatus = linkedVerifier.accessStatus;
        accessTabs = linkedVerifier.accessTabs || {};
      }
    } else if (agent.role === 'freight agent') {
      const linkedAgent = (company.linkedFreightAgents || []).find(f => f.id === agentId);
      if (linkedAgent) {
        isLinked = true;
        accessStatus = linkedAgent.accessStatus;
        accessTabs = linkedAgent.accessTabs || {};
      }
    }
    
    if (!isLinked) {
      return { 
        success: false, 
        message: "You are not authorized to access this company. Please request access first." 
      };
    }
    
    if (!accessStatus) {
      return { 
        success: false, 
        message: "Your access to this company is currently inactive. Please contact the company administrator." 
      };
    }
    
    return { 
      success: true, 
      company: company,
      accessTabs: accessTabs
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
          accessTabs: accessTabs || {}
        }
      };
    }
    
    set({ user: userToStore });

    const { demoData } = get();
    const updatedDemoData = {
      ...demoData,
      systemState: {
        ...demoData.systemState,
        currentUser: userToStore
      }
    };

    set({ demoData: updatedDemoData });
  },

  // Set login data for continuation
  setLoginData: (data) => {
    set({ loginData: data });
  },

  // Clear login data
  clearLoginData: () => {
    set({ loginData: null });
  },

  // Logout method
  logout: () => {
    set({ user: null, loginData: null });

    const { demoData } = get();
    const updatedDemoData = {
      ...demoData,
      systemState: {
        ...demoData.systemState,
        currentUser: null
      }
    };

    set({ demoData: updatedDemoData });

    toast.success("Logged out successfully");
  },

  // Get user by ID
  getUserById: (userId) => {
    const { demoData } = get();
    return demoData.users[userId];
  },
  
  // Get agent's linked companies
  getAgentLinkedCompanies: (agentId) => {
    const { demoData } = get();
    const agent = demoData.users[agentId];
    
    if (!agent) return [];
    
    return agent.linkedCompanies || [];
  },

  // Get company's pending agents
  getCompanyPendingAgents: (companyId) => {
    const { demoData } = get();
    const company = demoData.users[companyId];
    
    if (!company) return { verifiers: [], freightAgents: [] };
    
    const pendingVerifiers = (company.pendingVerifiers || []).map(id => ({
      id,
      ...demoData.users[id]
    }));
    
    const pendingFreightAgents = (company.pendingFreightAgents || []).map(id => ({
      id,
      ...demoData.users[id]
    }));
    
    return {
      verifiers: pendingVerifiers,
      freightAgents: pendingFreightAgents
    };
  },

  // Get company's linked agents
  getCompanyLinkedAgents: (companyId) => {
    const { demoData } = get();
    const company = demoData.users[companyId];
    
    if (!company) return { verifiers: [], freightAgents: [] };
    
    const linkedVerifiers = (company.linkedVerifiers || []).map(verifier => ({
      ...verifier,
      ...demoData.users[verifier.id]
    }));
    
    const linkedFreightAgents = (company.linkedFreightAgents || []).map(agent => ({
      ...agent,
      ...demoData.users[agent.id]
    }));
    
    return {
      verifiers: linkedVerifiers,
      freightAgents: linkedFreightAgents
    };
  }
}));
2. Update App.js to fix Google Maps loading issue:
javascript
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadScript } from '@react-google-maps/api';
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AccountVerificationPage from "./pages/AccountVerificationPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BlogPage from "./pages/BlogPage";
import ScrollToTop from "./components/ScrollToTop";
import MediaPage from "./pages/MediaPage";
import AboutUs from "./pages/AboutUs";
import PartnerDirectory from "./pages/PartnerDirectory";
import ChatWidget from "./components/ChatWidget";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserStore } from "./store/useUserStore";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useUserStore();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  const location = useLocation();
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [mapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const hideLayout = ["/login", "/signup", "/dashboard", "/verify-account", "/verify-otp"].includes(location.pathname);

  // Only load Google Maps script for dashboard
  const shouldLoadMaps = location.pathname.startsWith('/dashboard');

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />

        {!hideLayout && <Navbar />}

        <main className={`flex-grow ${!hideLayout ? "pt-20" : ""}`}>
          {!apiKey && shouldLoadMaps ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg max-w-md">
                <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
                <p>Google Maps API key is missing. Please check your .env file.</p>
                <p className="text-sm mt-2">Make sure you have VITE_GOOGLE_MAPS_API_KEY set</p>
              </div>
            </div>
          ) : (
            <>
              {/* Only load Google Maps script when needed */}
              {shouldLoadMaps ? (
                <LoadScript
                  googleMapsApiKey={apiKey}
                  libraries={['places', 'drawing', 'geometry']}
                  onLoad={() => {
                    console.log('Google Maps script loaded successfully');
                    setIsMapsLoaded(true);
                    setMapsScriptLoaded(true);
                  }}
                  onError={(error) => {
                    console.error('Google Maps failed to load:', error);
                    setIsMapsLoaded(true); // Set to true anyway to render dashboard
                    setMapsScriptLoaded(true);
                  }}
                  loadingElement={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading Google Maps...</p>
                      </div>
                    </div>
                  }
                >
                  <RoutesContent hideLayout={hideLayout} isMapsLoaded={isMapsLoaded} mapsScriptLoaded={mapsScriptLoaded} />
                </LoadScript>
              ) : (
                <RoutesContent hideLayout={hideLayout} isMapsLoaded={true} mapsScriptLoaded={false} />
              )}
            </>
          )}
        </main>

        {!hideLayout && <Footer />}
        {!hideLayout && <ChatWidget />}
      </div>
    </>
  );
}

function RoutesContent({ hideLayout, isMapsLoaded, mapsScriptLoaded }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/media" element={<MediaPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/partners" element={<PartnerDirectory />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Auth routes */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-account" element={<AccountVerificationPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />

      {/* Dashboard route - Protected */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard isMapsLoaded={isMapsLoaded && mapsScriptLoaded} />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
3. Update OtpVerificationPage.js:
javascript
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";
import { FaArrowLeft, FaEnvelope, FaShieldAlt } from "react-icons/fa";

// Add background images constant
const OTP_BG_IMAGES = [
  { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Secure verification background" },
  { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Digital security background" },
  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Technology security background" }
];

function OtpVerificationPage() {
  const [current, setCurrent] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputs = useRef([]);

  const { verifyLoginOTP, generateLoginOTP, setUser, loginData, clearLoginData } = useUserStore();
  const userId = location.state?.userId || loginData?.userId;
  const userEmail = location.state?.email || loginData?.email;
  const companyData = location.state?.companyData || loginData?.companyData;

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (OTP_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % OTP_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate OTP on component mount - Show toast here only
    if (userId) {
      const result = generateLoginOTP(userId);
      if (result.success) {
        toast.success(`OTP sent to your email: ${result.otp}`);
      }
    } else {
      toast.error("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, navigate, generateLoginOTP]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      
      otpInputs.current[3]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join("");
    
    if (otpString.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      setLoading(false);
      return;
    }

    const result = verifyLoginOTP(userId, otpString);
    
    if (result.success) {
      toast.success("OTP verified successfully!");
      
      // Set user and optionally company data
      if (companyData) {
        setUser(result.user, companyData.company, companyData.accessTabs);
      } else {
        setUser(result.user);
      }
      
      clearLoginData();
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      toast.error(result.message || "Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    const result = generateLoginOTP(userId);
    if (result.success) {
      setCountdown(60);
      setCanResend(false);
      toast.success(`New OTP sent: ${result.otp}`);
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      {OTP_BG_IMAGES.map(({ src, alt }, i) => (
        <div
          key={i}
          aria-label={alt}
          role="img"
          className={`
            absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out
            ${i === current ? "opacity-100" : "opacity-0"}
          `}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Semi-transparent green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/50 to-green-600/50" />

      {/* Glass-effect form container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 z-10
                      bg-white/20 backdrop-blur-sm
                      rounded-2xl shadow-lg"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-green-100 hover:text-white mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify Your Identity
          </h1>
          <p className="text-green-100">
            We've sent a 4-digit OTP to
          </p>
          <div className="flex items-center justify-center mt-2">
            <FaEnvelope className="text-green-300 mr-2" />
            <span className="font-semibold text-white">{userEmail}</span>
          </div>
          {companyData && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg border border-green-300">
              <p className="text-sm text-white">
                Logging in as agent for: <span className="font-semibold">{companyData.company?.basicInfo?.companyName}</span>
              </p>
            </div>
          )}
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Enter OTP code
            </label>
            
            <div 
              className="flex justify-center gap-3"
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 text-center text-2xl font-bold bg-white/30 border-2 border-green-300 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50"
                  autoFocus={index === 0}
                  placeholder="0"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-green-100 text-sm">
                Didn't receive OTP?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`font-medium ${
                    canResend
                      ? "text-white hover:text-green-300"
                      : "text-green-300/70 cursor-not-allowed"
                  }`}
                >
                  {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
                </button>
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 4}
            className="w-full py-3 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-green-100">
            For security reasons, this OTP will expire in 10 minutes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default OtpVerificationPage;
4. Update AccountVerificationPage.js:
javascript
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../store/useUserStore";
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from "react-icons/fa";

// Add background images constant
const VERIFICATION_BG_IMAGES = [
  { src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Verification background 1" },
  { src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Verification background 2" },
  { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", alt: "Verification background 3" }
];

function AccountVerificationPage() {
  const [current, setCurrent] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputs = useRef([]);

  const { verifyAccount, generateVerificationOTP, setUser, loginData } = useUserStore();
  const userId = location.state?.userId || loginData?.userId;
  const userEmail = location.state?.email || loginData?.email;
  const fromLogin = location.state?.fromLogin || loginData?.fromLogin;

  // Cycle through background images every 5 seconds
  useEffect(() => {
    if (VERIFICATION_BG_IMAGES.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((i) => (i + 1) % VERIFICATION_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate OTP on component mount
    if (userId) {
      const result = generateVerificationOTP(userId);
      if (result.success) {
        toast.success(`Verification code sent: ${result.otp}`);
      }
    } else {
      toast.error("No user ID found. Please try signing up again.");
      setTimeout(() => navigate("/signup"), 2000);
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, navigate, generateVerificationOTP]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      
      otpInputs.current[3]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join("");
    
    if (otpString.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      setLoading(false);
      return;
    }

    const result = verifyAccount(userId, otpString);
    
    if (result.success) {
      toast.success("Account verified successfully!");
      setUser(result.user);
      
      // Redirect based on user role and source
      setTimeout(() => {
        if (fromLogin) {
          navigate("/dashboard");
        } else {
          // New signup
          if (result.user.role === 'importer' || result.user.role === 'exporter') {
            navigate("/dashboard");
          } else if (result.user.role === 'verifier' || result.user.role === 'freight agent') {
            navigate("/dashboard");
          }
        }
      }, 1500);
    } else {
      toast.error(result.message || "Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    const result = generateVerificationOTP(userId);
    if (result.success) {
      setCountdown(60);
      setCanResend(false);
      toast.success(`New verification code sent: ${result.otp}`);
    }
  };

  const handleBack = () => {
    if (fromLogin) {
      navigate("/login");
    } else {
      navigate("/signup");
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      {VERIFICATION_BG_IMAGES.map(({ src, alt }, i) => (
        <div
          key={i}
          aria-label={alt}
          role="img"
          className={`
            absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out
            ${i === current ? "opacity-100" : "opacity-0"}
          `}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Semi-transparent green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/50 to-green-600/50" />

      {/* Glass-effect form container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 z-10
                      bg-white/20 backdrop-blur-sm
                      rounded-2xl shadow-lg"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-green-100 hover:text-white mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verify Your Account
          </h1>
          <p className="text-green-100">
            We've sent a 4-digit verification code to
          </p>
          <div className="flex items-center justify-center mt-2">
            <FaEnvelope className="text-green-300 mr-2" />
            <span className="font-semibold text-white">{userEmail}</span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white">
              Enter verification code
            </label>
            
            <div 
              className="flex justify-center gap-3"
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 text-center text-2xl font-bold bg-white/30 border-2 border-green-300 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50"
                  autoFocus={index === 0}
                  placeholder="0"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-green-100 text-sm">
                Didn't receive code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`font-medium ${
                    canResend
                      ? "text-white hover:text-green-300"
                      : "text-green-300/70 cursor-not-allowed"
                  }`}
                >
                  {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
                </button>
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 4}
            className="w-full py-3 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/50"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          {/* Alternative */}
          <div className="text-center">
            <p className="text-green-100 text-sm">
              Having trouble?{" "}
              <Link to="/contact" className="text-white hover:text-green-300 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-green-100">
          © {new Date().getFullYear()} TraceRx. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AccountVerificationPage;
5. Update Dashboard.js with correct tab ordering:
javascript
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import CompanyDetails from "../components/CompanyDetails";
import EUDRDefinitions from "../components/EudrDefinitions";
import GPSCamera from "../components/GPSCamera";
import InformationRequirements from "../components/InformationRequirements";
import NewShipmentOrigin from "../components/NewShipmentOrigin";
import Overview from "../components/Overview";
import Reports from "../components/Reports";
import Shipments from "../components/Shipments";
import SubjectMatterScope from "../components/SubjectMatterScope";
import SupplyChain from "../components/SupplyChain";
import Sidebar from "../components/SideBar";
import Regulations from "../components/Regulations";
import RegulationsBadge from "../components/RegulationsBadge";
import TargetedRegulations from "../components/TargetedRegulations";
import DashboardNavbar from "../components/DashboardNavbar";
import BioData from "../components/BioData";
import AgentManagement from "../components/AgentManagement";
import DueDiligence from "../components/DueDiligence";
import RiskAssessment from "../components/RiskAssessment";
import RiskMitigation from "../components/RiskMitigation";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

// Map tabs to their corresponding article types
const tabToArticleMap = {
  'subject-matter': 'subject-matter',
  'eudr-definitions': 'eudr-definitions',
  'information-requirements': 'information-requirements',
  'new-shipment': 'new-shipment'
};

// Tabs that should show regulations on first visit
const tabsWithRegulations = ['subject-matter', 'eudr-definitions', 'information-requirements', 'new-shipment'];

// Main Dashboard Component
const Dashboard = ({ isMapsLoaded }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showRegulations, setShowRegulations] = useState(false);
  const [showTargetedRegulations, setShowTargetedRegulations] = useState(false);
  const [hasVisitedTab, setHasVisitedTab] = useState({});
  const [mapsReady, setMapsReady] = useState(false);
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  
  const { user, logout } = useUserStore();

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Detect screen size and handle sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        setNavbarHeight(height);
      }
      
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    const observer = new MutationObserver(checkScreenSize);
    if (navbarRef.current) {
      observer.observe(navbarRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      observer.disconnect();
    };
  }, []);

  // Update navbar height after mount
  useEffect(() => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavbarHeight(height);
    }
  }, []);

  // Check if Google Maps is ready to use
  useEffect(() => {
    if (isMapsLoaded) {
      const checkMaps = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps verified as ready');
          setMapsReady(true);
          return true;
        }
        return false;
      };

      // Check immediately
      if (checkMaps()) return;

      // Poll until maps are available
      const intervalId = setInterval(() => {
        if (checkMaps()) {
          clearInterval(intervalId);
        }
      }, 100);

      // Timeout after 3 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        console.warn('Google Maps not available after timeout');
        setMapsReady(true); // Set to true anyway to render dashboard
      }, 3000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [isMapsLoaded]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Show targeted regulations for specific tabs on first visit
    if (tabsWithRegulations.includes(tabId) && !hasVisitedTab[tabId]) {
      // Mark as visited after showing regulations
      setTimeout(() => {
        setHasVisitedTab(prev => ({ ...prev, [tabId]: true }));
      }, 100);
      
      // Show the targeted regulations modal
      setShowTargetedRegulations(true);
    }
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Add a loading placeholder component for map-dependent components
  const MapLoadingPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-xl min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600">Loading map component...</p>
      <p className="text-sm text-gray-500 mt-2">Please wait while we initialize the map</p>
    </div>
  );

  // Helper function to get tabs in correct order
  const getOrderedTabs = (tabs, userRole, isLoggedInAsCompany, companyType, accessTabs = {}) => {
    // Define the correct order for each user type
    const orderMap = {
      // For agents logged in as importer company
      'agent-importer': [
        'bio-data',
        'overview',
        'company-details',
        'subject-matter',
        'due-diligence',
        'risk-assessment',
        'risk-mitigation',
        'shipments',
        'reports',
        'gps-camera',
        'supply-chain'
      ],
      // For agents logged in as exporter company
      'agent-exporter': [
        'bio-data',
        'overview',
        'company-details',
        'subject-matter',
        'information-requirements',
        'new-shipment',
        'shipments',
        'reports',
        'gps-camera',
        'supply-chain'
      ],
      // For importers logged in as themselves
      'importer': [
        'overview',
        'company-details',
        'subject-matter',
        'due-diligence',
        'risk-assessment',
        'risk-mitigation',
        'shipments',
        'reports',
        'gps-camera',
        'supply-chain',
        'agent-management',
        'bio-data'
      ],
      // For exporters logged in as themselves
      'exporter': [
        'overview',
        'company-details',
        'subject-matter',
        'information-requirements',
        'new-shipment',
        'shipments',
        'reports',
        'gps-camera',
        'supply-chain',
        'agent-management',
        'bio-data'
      ],
      // For agents logged in as themselves (not for a company)
      'agent-self': [
        'bio-data'
      ]
    };

    // Determine which order to use
    let orderKey = '';
    
    if (isLoggedInAsCompany) {
      if (companyType === 'importer') {
        orderKey = 'agent-importer';
      } else if (companyType === 'exporter') {
        orderKey = 'agent-exporter';
      }
    } else {
      if (userRole === 'importer') {
        orderKey = 'importer';
      } else if (userRole === 'exporter') {
        orderKey = 'exporter';
      } else if (userRole === 'verifier' || userRole === 'freight agent') {
        orderKey = 'agent-self';
      }
    }

    const order = orderMap[orderKey] || [];
    
    // Filter and sort tabs based on order
    return tabs
      .filter(tab => {
        // For agents logged in as company, check access permissions
        if (isLoggedInAsCompany) {
          const tabKey = tab.id.replace('-', '');
          return accessTabs[tabKey] !== false;
        }
        return true;
      })
      .sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
      });
  };

  // Get available tabs based on user role and company access
  const getAvailableTabs = () => {
    const allTabs = {
      // Common tabs
      'overview': { id: 'overview', name: 'Overview', icon: 'FiHome' },
      'bio-data': { id: 'bio-data', name: 'Bio Data', icon: 'FiUser' },
      'company-details': { id: 'company-details', name: 'Company Details', icon: 'FiBuilding' },
      'subject-matter': { id: 'subject-matter', name: 'Subject matter & scope', icon: 'FiTarget' },
      'shipments': { id: 'shipments', name: 'Shipments', icon: 'FiPackage' },
      'reports': { id: 'reports', name: 'Reports', icon: 'FiBarChart2' },
      'gps-camera': { id: 'gps-camera', name: 'GPS Camera', icon: 'FiCamera' },
      'supply-chain': { id: 'supply-chain', name: 'Supply Chain', icon: 'FiLink' },
      'agent-management': { id: 'agent-management', name: 'Agent Management', icon: 'FiUsers' },
      
      // Exporter-specific tabs
      'eudr-definitions': { id: 'eudr-definitions', name: 'EUDR Definition of terms', icon: 'FiBook' },
      'information-requirements': { id: 'information-requirements', name: 'Information requirements', icon: 'FiInfo' },
      'new-shipment': { id: 'new-shipment', name: 'New Shipment Origin', icon: 'FiTruck' },
      
      // Importer-specific tabs
      'due-diligence': { id: 'due-diligence', name: 'Due Diligence', icon: 'FiShield' },
      'risk-assessment': { id: 'risk-assessment', name: 'Risk Assessment', icon: 'FiAlertTriangle' },
      'risk-mitigation': { id: 'risk-mitigation', name: 'Risk Mitigation', icon: 'FiTool' }
    };

    if (!user) return [];

    const isLoggedInAsCompany = user.loggedInAs?.companyId;
    const userRole = user.role;
    const companyType = user.loggedInAs?.companyType;
    const accessTabs = user.loggedInAs?.accessTabs || {};

    // Determine which tabs are available based on user role and login status
    let availableTabKeys = [];

    if (isLoggedInAsCompany) {
      // Agent logged in for a company
      if (companyType === 'exporter') {
        availableTabKeys = [
          'bio-data',
          'overview',
          'company-details',
          'subject-matter',
          'eudr-definitions',
          'information-requirements',
          'new-shipment',
          'shipments',
          'reports',
          'gps-camera',
          'supply-chain'
        ];
      } else if (companyType === 'importer') {
        availableTabKeys = [
          'bio-data',
          'overview',
          'company-details',
          'subject-matter',
          'due-diligence',
          'risk-assessment',
          'risk-mitigation',
          'shipments',
          'reports',
          'gps-camera',
          'supply-chain'
        ];
      }
    } else {
      // User logged in as themselves
      if (userRole === 'exporter') {
        availableTabKeys = [
          'overview',
          'company-details',
          'subject-matter',
          'eudr-definitions',
          'information-requirements',
          'new-shipment',
          'shipments',
          'reports',
          'gps-camera',
          'supply-chain',
          'agent-management',
          'bio-data'
        ];
      } else if (userRole === 'importer') {
        availableTabKeys = [
          'overview',
          'company-details',
          'subject-matter',
          'due-diligence',
          'risk-assessment',
          'risk-mitigation',
          'shipments',
          'reports',
          'gps-camera',
          'supply-chain',
          'agent-management',
          'bio-data'
        ];
      } else if (userRole === 'verifier' || userRole === 'freight agent') {
        // Agents only see bio data when logged in as themselves
        availableTabKeys = ['bio-data'];
      }
    }

    // Convert keys to tab objects
    const tabs = availableTabKeys
      .filter(key => allTabs[key])
      .map(key => allTabs[key]);

    // Return ordered tabs
    return getOrderedTabs(tabs, userRole, isLoggedInAsCompany, companyType, accessTabs);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'bio-data':
        return <BioData />;
      case 'company-details':
        return <CompanyDetails />;
      case 'subject-matter':
        return <SubjectMatterScope />;
      case 'eudr-definitions':
        return <EUDRDefinitions />;
      case 'information-requirements':
        return <InformationRequirements />;
      case 'new-shipment':
        // This component uses Google Maps
        return mapsReady ? <NewShipmentOrigin /> : <MapLoadingPlaceholder />;
      case 'shipments':
        return <Shipments />;
      case 'reports':
        return <Reports />;
      case 'gps-camera':
        // This component uses Google Maps
        return mapsReady ? <GPSCamera /> : <MapLoadingPlaceholder />;
      case 'supply-chain':
        return <SupplyChain />;
      case 'due-diligence':
        return <DueDiligence />;
      case 'risk-assessment':
        return <RiskAssessment />;
      case 'risk-mitigation':
        return <RiskMitigation />;
      case 'agent-management':
        return <AgentManagement />;
      default:
        return <Overview />;
    }
  };

  // If maps aren't loaded at all, show a full-screen loading
  if (!isMapsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Warning for slow map loading */}
      {isMapsLoaded && !mapsReady && (
        <div className="fixed top-20 right-4 z-50 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded shadow-lg max-w-xs">
          <p className="text-sm font-medium">Initializing Maps...</p>
          <p className="text-xs">Map features will be available shortly</p>
        </div>
      )}

      {/* Fixed Navbar with ref for height measurement */}
      <div ref={navbarRef} className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavbar />
      </div>

      {/* Mobile Menu Button */}
      {isMobile && navbarHeight > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed z-40 bg-green-600 text-white p-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          style={{ 
            top: `${navbarHeight + 16}px`,
            left: '1rem'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
        navbarHeight={navbarHeight}
        availableTabs={getAvailableTabs()}
        onLogout={logout}
      />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? 'lg:ml-72' : ''}`}
        style={{ 
          paddingTop: `${navbarHeight}px`,
          minHeight: `calc(100vh - ${navbarHeight}px)`
        }}
      >
        <div className={`p-2 lg:p-6`}>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* Regulations Badge */}
      <RegulationsBadge onClick={() => setShowRegulations(!showRegulations)} />

      {/* Full Regulations Panel */}
      <Regulations 
        isOpen={showRegulations} 
        onClose={() => setShowRegulations(false)} 
      />

      {/* Targeted Regulations Modal */}
      <TargetedRegulations 
        isOpen={showTargetedRegulations}
        onClose={() => setShowTargetedRegulations(false)}
        articleType={tabToArticleMap[activeTab]}
      />
    </div>
  );
};

export default Dashboard;
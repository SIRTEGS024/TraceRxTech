import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";

// Demo data schema
const demoData = {
	"users": {
		"exporter-1": {
			"id": "exporter-1",
			"role": "exporter",
			"password": "exporter123",
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
							{ "name": "Environmental Impact Assessment", "url": "https://cloud-storage.com/forest/env-1.pdf" }
						],
						"forestRelatedRules": [
							{ "name": "Forest Management Plan", "url": "https://cloud-storage.com/forest/forest-1.pdf" }
						],
						"thirdPartiesRights": [
							{ "name": "Community Agreement", "url": "https://cloud-storage.com/forest/community-1.pdf" }
						],
						"labourRights": [
							{ "name": "Labor Compliance Certificate", "url": "https://cloud-storage.com/forest/labor-1.pdf" }
						],
						"humanRights": [
							{ "name": "Human Rights Assessment", "url": "https://cloud-storage.com/forest/hr-1.pdf" }
						],
						"fpic": [
							{ "name": "FPIC Documentation", "url": "https://cloud-storage.com/forest/fpic-1.pdf" }
						],
						"taxAntiCorruptionTradeCustoms": [
							{ "name": "Tax Compliance Certificate", "url": "https://cloud-storage.com/forest/tax-1.pdf" },
							{ "name": "Anti-corruption Policy", "url": "https://cloud-storage.com/forest/anti-corrupt-1.pdf" }
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
									{ "name": "Deforestation-Free Certification", "url": "https://cloud-storage.com/2021/defree-1.pdf" }
								],
								"legalComplianceDocs": [
									{ "name": "Legal Compliance Certificate", "url": "https://cloud-storage.com/2021/legal-1.pdf" }
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
			"report": { "name": "Annual Compliance Report 2023", "url": "https://cloud-storage.com/reports/report-1.pdf" },
			"linkedVerifiers": ["verifier-1", "verifier-2"],
			"linkedFreightAgents": ["freight-agent-1"],
			"verificationReports": {
				"verifier-1": {
					"verificationStatus": "approved",
					"reports": ["ver-report-1"]
				},
				"verifier-2": {
					"verificationStatus": "approved",
					"reports": ["ver-report-2"]
				}
			}
		},

		"exporter-2": {
			"id": "exporter-2",
			"role": "exporter",
			"password": "coffeeExport456",
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
					{ "name": "Coffee Export License", "url": "https://cloud-storage.com/exporter2/reg-1.pdf" }
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
			"report": { "name": "Coffee Export Report 2023", "url": "https://cloud-storage.com/reports/coffee-report.pdf" },
			"linkedVerifiers": ["verifier-1"],
			"linkedFreightAgents": [],
			"verificationReports": {
				"verifier-1": {
					"verificationStatus": "approved",
					"reports": ["ver-report-3"]
				}
			}
		},

		"importer-1": {
			"id": "importer-1",
			"role": "importer",
			"password": "germanyImport789",
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
							{ "name": "Risk Assessment Report 2021 - Exporter 1", "url": "https://cloud-storage.com/risk/2021-exporter1.pdf" }
						]
					},
					{
						"supplierId": "exporter-2",
						"riskLevel": "high risk",
						"assessmentDocs": [
							{ "name": "Risk Assessment Report 2021 - Exporter 2", "url": "https://cloud-storage.com/risk/2021-exporter2.pdf" }
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
								{ "name": "Additional Supplier Info - Exporter 2", "url": "https://cloud-storage.com/mitigation/add-info-ex2.pdf" }
							],
							"independentSurveys": [
								{ "name": "Third-Party Audit Report - Exporter 2", "url": "https://cloud-storage.com/mitigation/audit-ex2.pdf" }
							],
							"otherMeasures": [],
							"capacityBuilding": [
								{ "name": "Supplier Training Program - Exporter 2", "url": "https://cloud-storage.com/mitigation/training-ex2.pdf" }
							]
						},
						"policiesControls": {
							"modelPractices": {
								"isSme": false,
								"officerName": "Anna Weber",
								"officerIdCard": { "name": "officer id card", "url": "https://cloud-storage.com/mitigation/officer-id.pdf" },
								"appointmentLetter": { "name": "appointment letter", "url": "https://cloud-storage.com/mitigation/appointment.pdf" },
								"additionalDocs": [
									{ "name": "Risk Management Policy - Exporter 2", "url": "https://cloud-storage.com/mitigation/policy-ex2.pdf" }
								]
							},
							"independentAudit": [
								{ "name": "Annual Internal Audit - Exporter 2", "url": "https://cloud-storage.com/mitigation/internal-audit-ex2.pdf" }
							]
						},
						"decisionsReview": [
							{ "name": "Annual Risk Mitigation Review - Exporter 2", "url": "https://cloud-storage.com/mitigation/review-2023-ex2.pdf" }
						]
					}
				],
				"2022": [],
				"2023": [],
				"2024": [],
				"2025": []
			},
			"shipments": ["shipment-1", "shipment-3"],
			"linkedVerifiers": ["verifier-1"],
			"linkedFreightAgents": ["freight-agent-1"],
			"verificationReports": {
				"verifier-1": {
					"verificationStatus": "pending_approval",
					"reports": ["ver-report-1", "ver-report-3"]
				}
			}
		},

		"importer-2": {
			"id": "importer-2",
			"role": "importer",
			"password": "ukFurniture321",
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
			"verificationReports": {}
		},

		"freight-agent-1": {
			"id": "freight-agent-1",
			"role": "freight agent",
			"password": "freightLogistics654",
			"basicInfo": {
				"firstName": "Thomas",
				"lastName": "Anderson",
				"email": "thomas@freight-logistics.com",
				"freightLicenseNumber": "FL-2023-8899"
			},
			"linkedCompanies": [
				{
					"companyId": "exporter-1",
					"companyType": "exporter",
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
			"documents": {
				"freightLicense": [
					{ "name": "Freight Forwarding License", "url": "https://cloud-storage.com/freight/license.pdf" }
				],
				"insurance": [
					{ "name": "Cargo Insurance Certificate", "url": "https://cloud-storage.com/freight/insurance.pdf" }
				]
			}
		},

		"verifier-1": {
			"id": "verifier-1",
			"role": "verifier",
			"password": "auditSecure987",
			"basicInfo": {
				"firstName": "Dr. Michael",
				"lastName": "Chen",
				"email": "michael.chen@audit-consulting.com",
				"agencyDepartmentId": "EUDR-VER-2023-001"
			},
			"linkedCompanies": [
				{
					"companyId": "exporter-1",
					"companyType": "exporter",
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
					},
					"verificationStatus": "active"
				},
				{
					"companyId": "importer-1",
					"companyType": "importer",
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
					},
					"verificationStatus": "pending_approval"
				},
				{
					"companyId": "exporter-2",
					"companyType": "exporter",
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
					},
					"verificationStatus": "active"
				}
			],
			"documents": {
				"professionalCertificates": [
					{ "name": "EUDR Auditor Certification", "url": "https://cloud-storage.com/verifier/cert-1.pdf" }
				],
				"agencyAffiliation": [
					{ "name": "Agency Authorization Letter", "url": "https://cloud-storage.com/verifier/agency-auth.pdf" }
				]
			},
			"verificationReports": [
				{
					"id": "ver-report-1",
					"companyId": "exporter-1",
					"companyType": "exporter",
					"date": "2023-11-15",
					"type": "compliance_audit",
					"status": "approved",
					"reportUrl": "https://cloud-storage.com/verification/ver-report-1.pdf",
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
					"reportUrl": "https://cloud-storage.com/verification/ver-report-3.pdf",
					"findings": [
						{
							"tab": "company_details",
							"status": "compliant",
							"notes": "Company registration and licenses are valid."
						}
					]
				}
			]
		},

		"verifier-2": {
			"id": "verifier-2",
			"role": "verifier",
			"password": "environmentAudit246",
			"basicInfo": {
				"firstName": "Sophie",
				"lastName": "Martinez",
				"email": "sophie@independent-auditor.eu",
				"agencyDepartmentId": "IND-VER-2023-045"
			},
			"linkedCompanies": [
				{
					"companyId": "exporter-1",
					"companyType": "exporter",
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
					},
					"verificationStatus": "inactive"
				}
			],
			"documents": {
				"professionalCertificates": [
					{ "name": "Environmental Auditor License", "url": "https://cloud-storage.com/verifier2/cert-1.pdf" }
				]
			},
			"verificationReports": [
				{
					"id": "ver-report-2",
					"companyId": "exporter-1",
					"companyType": "exporter",
					"date": "2023-10-10",
					"type": "shipment_verification",
					"status": "approved",
					"reportUrl": "https://cloud-storage.com/verification/ver-report-2.pdf",
					"findings": [
						{
							"tab": "shipments",
							"status": "compliant",
							"notes": "Shipment documentation complete and accurate."
						}
					]
				}
			]
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
					"packingList": { "name": "packing list", "url": "https://cloud-storage.com/shipment/packing-1.pdf" },
					"kilograms": 20000,
					"images": [
						{ "name": "Container Loading", "url": "https://cloud-storage.com/shipment/container-1.jpg" }
					]
				}
			],
			"status": "active",
			"shipmentDate": "2023-10-20",
			"createdOn": "2023-09-15",
			"imagesVideos": [
				{ "name": "Loading Process", "url": "https://cloud-storage.com/shipment/loading-vid.mp4" }
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
}));
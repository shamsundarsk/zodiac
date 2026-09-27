import { CaseConfig, CaseFolder, EvidenceFile } from './types';

// Helper to construct evidence files cleanly
function createTextFile(id: string, folder_id: string, filename: string, file_type: "PDF" | "TXT", size: string, date: string, evId: string, content: string): EvidenceFile {
  return {
    id,
    folder_id,
    filename,
    file_type,
    file_size: size,
    date,
    evidence_id: evId,
    content_type: file_type === "PDF" ? "pdf" : "text",
    content
  };
}

function createTableFile(id: string, folder_id: string, filename: string, file_type: "XLSX" | "CSV", size: string, date: string, evId: string, headers: string[], rows: (string | number)[][]): EvidenceFile {
  return {
    id,
    folder_id,
    filename,
    file_type,
    file_size: size,
    date,
    evidence_id: evId,
    content_type: "table",
    data_json: { headers, rows }
  };
}

function createImageFile(id: string, folder_id: string, filename: string, file_type: "PNG" | "JPG", size: string, date: string, evId: string, description: string): EvidenceFile {
  return {
    id,
    folder_id,
    filename,
    file_type,
    file_size: size,
    date,
    evidence_id: evId,
    content_type: "image",
    image_url: "/placeholder-evidence.svg",
    content: description
  };
}

// ============================================================================
// 5 ROUND 01 CASE CONFIGURATIONS & 2 ROUND 02 CASES
// ============================================================================
export const INITIAL_CASES_EXPANDED: CaseConfig[] = [
  {
    id: "case-01",
    round_number: 1,
    title: "Project Cipher Alpha: Cryptic Enterprise 01",
    description: "Deconstruct ASCII & Hexadecimal encoded logs to identify an industrial robotics entity.",
    correct_company: "Aura Robotics",
    correct_industry: "Industrial Automation",
    correct_hq: "Bengaluru",
    correct_primary_product: "Autonomous Mobile Robots",
    correct_additional_fact: "Founded by former ISRO engineers",
    accepted_company_variants: ["Aura Robotics", "Aura Robotics Pvt Ltd", "Aura", "41 75 72 61", "65 117 114 97"],
    accepted_industry_variants: ["Industrial Automation", "Robotics", "Warehouse Automation", "49 6e 64 75 73 74 72 69 61 6c"],
    accepted_hq_variants: ["Bengaluru", "Bangalore", "Whitefield", "42 65 6e 67 61 6c 75 72 75"],
    accepted_product_variants: ["Autonomous Mobile Robots", "AMR", "AMR-1000", "Warehouse Mobile Robots"],
    accepted_fact_variants: ["ISRO", "Former ISRO engineers", "ISRO Satellite Centre", "Dr. Vikram Ray", "73 83 82 79"],
    hint_text: "Cipher Hint for Case 01:\n1. Convert Hex sequence '41 75 72 61' in invoice_register_q2.xlsx to ASCII text to find the Brand Name.\n2. Convert Hex byte string '42 65 6e 67 61 6c 75 72 75' in tax_filing_extract.txt to discover Headquarters.\n3. Decode ASCII decimal array [73, 83, 82, 79] in executive_leadership_dossier.pdf to uncover the founder origin.",
    active: true
  },
  {
    id: "case-02",
    round_number: 1,
    title: "Project Cipher Beta: Cryptic Enterprise 02",
    description: "Analyze encoded automotive telemetry and cell procurement ciphers to deduce a clean-energy EV pioneer.",
    correct_company: "Ather Energy",
    correct_industry: "Electric Vehicles",
    correct_hq: "Bengaluru",
    correct_primary_product: "Electric Scooters",
    correct_additional_fact: "Founded by IIT Madras alumni",
    accepted_company_variants: ["Ather Energy", "Ather Energy Pvt Ltd", "Ather", "65 116 104 101 114", "41 74 68 65 72"],
    accepted_industry_variants: ["Electric Vehicles", "EV Mobility", "EV", "Clean Tech", "45 56 20 4d 6f 62 69 6c 69 74 79"],
    accepted_hq_variants: ["Bengaluru", "Bangalore", "Indiranagar", "42 65 6e 67 61 6c 75 72 75"],
    accepted_product_variants: ["Electric Scooters", "450X", "Ather 450", "EV Scooters", "45 56 20 53 63 6f 6f 74 65 72 73"],
    accepted_fact_variants: ["IIT Madras", "IIT Madras alumni", "Tarun Mehta", "Swapnil Jain", "73 73 84 32 77 97 100 114 97 115"],
    hint_text: "Cipher Hint for Case 02:\n1. Decode ASCII decimal sequence '65 116 104 101 114 32 69 110 101 114 103 121' in cell_procurement_ledger.xlsx to find the Company Name.\n2. Hex string '42 65 6e 67 61 6c 75 72 75' in fame2_subsidy_audit.pdf reveals Headquarters.\n3. ASCII array '73 73 84 32 77 97 100 114 97 115' in founder_biography_dossier.pdf discloses founder background.",
    active: true
  },
  {
    id: "case-03",
    round_number: 1,
    title: "Project Cipher Gamma: Cryptic Enterprise 03",
    description: "Decipher packaging batch matrices and beverage pulp ciphers of an Indian FMCG brand.",
    correct_company: "Paper Boat",
    correct_industry: "FMCG",
    correct_hq: "Gurugram",
    correct_primary_product: "Ethnic Fruit Beverages",
    correct_additional_fact: "Founded by former Coca-Cola executives",
    accepted_company_variants: ["Paper Boat", "Hector Beverages", "Paperboat", "50 61 70 65 72 20 42 6f 61 74", "80 97 112 101 114 32 66 111 97 116"],
    accepted_industry_variants: ["FMCG", "Beverages", "Consumer Goods", "46 4d 43 47"],
    accepted_hq_variants: ["Gurugram", "Gurgaon", "Haryana", "47 75 72 75 67 72 61 6d"],
    accepted_product_variants: ["Ethnic Fruit Beverages", "Traditional Drinks", "Aamras", "Jaljeera", "45 74 68 6e 69 63 20 42 65 76 65 72 61 67 65 73"],
    accepted_fact_variants: ["Coca-Cola", "Ex-Coca Cola executives", "Neeraj Kakkar", "Neeraj Biyani", "67 111 99 97 45 67 111 108 97"],
    hint_text: "Cipher Hint for Case 03:\n1. Convert Hex byte string '50 61 70 65 72 20 42 6f 61 74' in brand_philosophy_dossier.pdf to uncover the Brand Name.\n2. Convert Hex string '47 75 72 75 67 72 61 6d' in fssai_compliance_audit.pdf to find Headquarters.\n3. Decode ASCII decimal array [67, 111, 99, 97, 45, 67, 111, 108, 97] in founding_team_dossier.pdf to identify the executive heritage.",
    active: true
  },
  {
    id: "case-04",
    round_number: 1,
    title: "Project Cipher Delta: Cryptic Enterprise 04",
    description: "Decode optical frame lens edger matrices to reveal an omnichannel eyewear retail giant.",
    correct_company: "Lenskart",
    correct_industry: "Eyewear Retail",
    correct_hq: "Gurugram",
    correct_primary_product: "Prescription Eyeglasses",
    correct_additional_fact: "Founded by former Microsoft engineer Peyush Bansal",
    accepted_company_variants: ["Lenskart", "Lenskart Solutions", "4c 65 6e 73 6b 61 72 74", "76 101 110 115 107 97 114 116"],
    accepted_industry_variants: ["Eyewear Retail", "Opticals", "45 79 65 77 97 114 20 52 65 74 97 105 10c"],
    accepted_hq_variants: ["Gurugram", "Gurgaon", "Delhi NCR", "Faridabad", "47 75 72 75 67 72 61 6d"],
    accepted_product_variants: ["Prescription Eyeglasses", "Eyeglasses", "Vincent Chase", "50 72 65 73 63 72 69 70 74 69 6f 6e"],
    accepted_fact_variants: ["Microsoft", "Peyush Bansal", "Ex-Microsoft engineer", "77 105 99 114 111 115 111 102 116"],
    hint_text: "Cipher Hint for Case 04:\n1. Convert Hex sequence '4c 65 6e 73 6b 61 72 74' in bhiwadi_mega_factory_audit.pdf to reveal the Brand Name.\n2. Convert Hex string '47 75 72 75 67 72 61 6d' in store_expansion_capex.csv for Headquarters.\n3. Convert ASCII code array [77, 105, 99, 114, 111, 115, 111, 102, 116] in founder_leadership_dossier.pdf to uncover the founder engineering background.",
    active: true
  },
  {
    id: "case-05",
    round_number: 1,
    title: "Project Cipher Epsilon: Cryptic Enterprise 05",
    description: "Parse automated warehouse robotics ciphers to uncover a high-growth logistics hardware enterprise.",
    correct_company: "Addverb Technologies",
    correct_industry: "Robotics & Automation",
    correct_hq: "Noida",
    correct_primary_product: "Warehouse Mobile Sorting Robots",
    correct_additional_fact: "Founded by former Asian Paints supply chain executives",
    accepted_company_variants: ["Addverb Technologies", "Addverb", "41 64 64 76 65 72 62", "65 100 100 118 101 114 98"],
    accepted_industry_variants: ["Robotics & Automation", "Robotics", "Warehouse Automation", "52 6f 62 6f 74 69 63 73"],
    accepted_hq_variants: ["Noida", "Gautam Buddha Nagar", "Uttar Pradesh", "4e 6f 69 64 61"],
    accepted_product_variants: ["Warehouse Mobile Sorting Robots", "Dynamo AMR", "ASRS Systems", "57 61 72 65 68 6f 75 73 65 20 52 6f 62 6f 74 73"],
    accepted_fact_variants: ["Asian Paints", "Ex-Asian Paints executives", "Sangeet Kumar", "Prateek Jain", "65 120 45 61 115 105 97 110 32 80 97 105 110 116 115"],
    hint_text: "Cipher Hint for Case 05:\n1. Convert Hex sequence '41 64 64 76 65 72 62' in factory_capex_noida.pdf to find the Company Name.\n2. Hex string '4e 6f 69 64 61' in gst_filing_noida.txt reveals Headquarters.\n3. Decode ASCII decimal string '65 120 45 61 115 105 97 110 32 80 97 105 110 116 115' in founders_profile.pdf to uncover executive heritage.",
    active: true
  },

  // ROUND 02 INCIDENT CASES
  {
    id: "case-r2-01",
    round_number: 2,
    title: "Operation Broken Chain: The Batch B-8802 Disruption",
    description: "Investigate systemic battery overheating shutdowns resulting in a ₹2.4M financial loss.",
    r2_what_happened: "Uncertified microcontrollers lacking surge capacitors leaked voltage under sustained 48V motor loads",
    r2_responsible_party: "Apex Electronics",
    r2_financial_impact: "₹2,400,000",
    r2_key_evidence: "supplier_audit.pdf, q3_warranty_claims.xlsx, batch_yield_report.pdf, cfo_internal_log.txt",
    active: true
  },
  {
    id: "case-r2-02",
    round_number: 2,
    title: "Operation Thermal Drift: The Batch C-409 Spoilage",
    description: "Investigate temperature regulation failures in cold-chain logistics causing ₹1.85M cargo spoilage.",
    r2_what_happened: "Uncalibrated IoT temperature telemetry sensors delivered false normal readings during transport",
    r2_responsible_party: "FrostTech Logistics",
    r2_financial_impact: "₹1,850,000",
    r2_key_evidence: "cold_chain_telemetry.xlsx, spoilage_claim_audit.pdf, vendor_penalty_notice.pdf",
    active: true
  }
];

// ============================================================================
// FOLDER GENERATORS FOR EACH OF THE 5 CASES
// ============================================================================

export function generateFoldersForCase01(): CaseFolder[] {
  // CASE 01: Aura Robotics (CIPHER ENCODED)
  return [
    {
      id: "c1-fld-01", case_id: "case-01", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 5, last_modified: "14 SEP 2026", description: "Audit ledgers, capex breakdowns, and client registers",
      files: [
        createTableFile("c1-101", "c1-fld-01", "annual_summary_2025.xlsx", "XLSX", "142 KB", "12 SEP 2026", "E-101",
          ["Fiscal Year", "Gross Revenue (₹ Cr)", "OpEx (₹ Cr)", "Hardware R&D (₹ Cr)", "EBITDA Margin"],
          [["FY 2022-23", "12.4", "8.2", "3.1", "18.5%"], ["FY 2023-24", "38.6", "21.4", "7.8", "24.2%"], ["FY 2024-25", "94.2", "49.1", "18.5", "29.8%"], ["Q1 FY 2025-26", "31.8", "16.2", "5.4", "31.0%"]]
        ),
        createTextFile("c1-102", "c1-fld-01", "quarterly_audit_memo.pdf", "PDF", "1.4 MB", "28 AUG 2026", "E-102",
          `CONFIDENTIAL AUDIT MEMORANDUM — Q4\nFacility: Whitefield Industrial Zone\nLine: Mobile Hardware Assembly Line #2\nYoY Expansion: 140% growth in AMR rovers.\nKey Client Accounts: Reliance Retail Logistics Hub, TVS Supply Chain, Delhivery Sorting Center.\nNote: Series B capital (₹120 Cr led by Accel India) deployed for dual LiDAR R&D.`
        ),
        createTableFile("c1-103", "c1-fld-01", "invoice_register_q2.xlsx", "XLSX", "88 KB", "15 AUG 2026", "E-103",
          ["Invoice Ref", "Target Entity (HEX ENCODED)", "Dispatched Hub", "Line Item Code", "Amount (₹)"],
          [["INV-8821", "41 75 72 61 20 52 6f 62 6f 74 69 63 73", "Bengaluru Hub", "AMR-1000 Frame Chassis", "1,44,00,000"],
           ["INV-8822", "41 75 72 61 20 52 6f 62 6f 74 69 63 73", "Pune Hub", "AMR-500 Rover Assembly", "64,00,000"],
           ["INV-8823", "Velodyne Lidar Inc", "Bengaluru Lab", "3D Flash LiDAR Sensor Pack", "18,50,000"],
           ["INV-8824", "Delhivery Sortation", "Bhiwandi Hub", "AuraFleetOS SW License v4", "32,00,000"]]
        ),
        createTableFile("c1-104", "c1-fld-01", "capex_depreciation.csv", "CSV", "45 KB", "02 AUG 2026", "E-104",
          ["Asset ID", "Category", "Acquisition Cost", "Depreciation Rate", "Location"],
          [["AST-901", "Robotic Arm Cell", "₹45,00,000", "12%", "Whitefield Plant B"],
           ["AST-902", "Surface Mount SMT Line", "₹1,20,00,000", "15%", "EPIP Zone Bengaluru"],
           ["AST-903", "CNC Machining Center", "₹65,00,000", "10%", "Bengaluru R&D Hub"]]
        ),
        createTextFile("c1-105", "c1-fld-01", "tax_filing_extract.txt", "TXT", "18 KB", "10 JUL 2026", "E-105",
          `GSTIN Filing Extract — Form GSTR-3B\nEntity GSTIN: 29AABCA9081K1Z5\nState Code: 29 (Karnataka)\nHeadquarters Location (HEX ENCODED): 42 65 6e 67 61 6c 75 72 75\nRegistered Address: EPIP Zone, Whitefield, KA 560066\nPrincipal Business: Hardware R&D & Industrial Robotics Manufacturing.`
        )
      ]
    },
    {
      id: "c1-fld-02", case_id: "case-01", name: "SALES", folder_type: "OPERATIONS", item_count: 4, last_modified: "10 SEP 2026", description: "Regional fleet dispatch manifests and distribution logs",
      files: [
        createTableFile("c1-201", "c1-fld-02", "regional_fleet_log.xlsx", "XLSX", "94 KB", "08 SEP 2026", "E-201",
          ["Region", "Primary Hub City", "AMR-1000 Units", "AMR-500 Units", "Active Fleet Size"],
          [["South Zone 1", "Bengaluru HQ Hub", "240", "180", "420 Units"],
           ["West Zone 2", "Pune Industrial Belt", "110", "95", "205 Units"],
           ["North Zone 1", "NCR Fulfillment Zone", "150", "120", "270 Units"],
           ["East Zone", "Kolkata Port Logistics", "45", "30", "75 Units"]]
        ),
        createTableFile("c1-202", "c1-fld-02", "b2b_contract_pricing.csv", "CSV", "52 KB", "25 AUG 2026", "E-202",
          ["Client Code", "Contract Type", "Fleet Count", "Annual Maintenance", "SLA Standard"],
          [["CL-701", "Enterprise Lease", "50 AMR-1000", "₹12,00,000/yr", "99.5% Uptime"],
           ["CL-702", "Direct Purchase", "20 AMR-500", "₹5,50,000/yr", "99.0% Uptime"]]
        ),
        createTextFile("c1-203", "c1-fld-02", "dispatch_manifest_po7829.pdf", "PDF", "880 KB", "18 AUG 2026", "E-203",
          `SHIPMENT MANIFEST — PO-78291\nOrigin Warehouse: EPIP Industrial Zone, Whitefield, Bengaluru\nDestination: FlipKart Mega Sortation Hub, Bhiwandi\nFreight Contents: 12 Units AMR-1000 Heavy Lift Rovers`
        ),
        createImageFile("c1-204", "c1-fld-02", "dispatch_quay_photo.png", "PNG", "1.8 MB", "12 AUG 2026", "E-204",
          "High resolution photograph showing row of black and amber AMR autonomous rovers lined up for dispatch inside a staging hangar."
        )
      ]
    },
    {
      id: "c1-fld-03", case_id: "case-01", name: "MARKETING", folder_type: "MARKETING", item_count: 3, last_modified: "05 SEP 2026", description: "Press briefings and brand collateral",
      files: [
        createTextFile("c1-301", "c1-fld-03", "brand_positioning_dossier.pdf", "PDF", "820 KB", "25 AUG 2026", "E-301",
          `MARKETING DOSSIER 2025\nBrand Slogan: "Autonomous Precision for Next-Gen Supply Chains"\nDomain: Deep-Tech Hardware & Warehouse Automation\nExhibition: India Warehousing Show (Yashobhoomi, New Delhi).\nDemo Highlights: Dynamic SLAM navigation algorithms developed in Bengaluru R&D labs.`
        ),
        createImageFile("c1-302", "c1-fld-03", "exhibition_banner_preview.jpg", "JPG", "2.1 MB", "12 AUG 2026", "E-302",
          "Exhibition booth banner showing heavy-duty industrial mobile rovers moving palleted inventory."
        ),
        createTextFile("c1-305", "c1-fld-03", "media_clipping_techinasia.txt", "TXT", "15 KB", "10 JUL 2026", "E-305",
          `TechInAsia News Feature:\n"From Space Probes to Warehouse Floor: How Two Ex-ISRO Engineers Are Building India's Most Advanced Autonomous Mobile Robots in Bengaluru."`
        )
      ]
    },
    {
      id: "c1-fld-04", case_id: "case-01", name: "PRODUCTS", folder_type: "PRODUCTS", item_count: 3, last_modified: "01 SEP 2026", description: "Product blueprints and sensor datasheets",
      files: [
        createTextFile("c1-401", "c1-fld-04", "product_line_catalog.pdf", "PDF", "3.2 MB", "29 AUG 2026", "E-401",
          `PRODUCT LINE CATALOG 2025/26\n1. AMR-1000 Autonomous Rover: Heavy-lift payload capacity up to 1,000kg.\n2. AMR-500 Parcel Sortation Bot: Top conveyor integration.\n3. AuraFleetOS: Cloud telemetry control dashboard.\nManufacturing Base: Plot 44-B, EPIP Zone, Whitefield, Bengaluru, KA.`
        ),
        createTableFile("c1-402", "c1-fld-04", "tech_specifications_table.xlsx", "XLSX", "110 KB", "14 AUG 2026", "E-402",
          ["Subsystem", "Component Vendor", "Spec Grade", "Assembly Origin"],
          [["LiDAR Sensor Suite", "Velodyne / Ouster", "3D Flash 64-Beam", "USA"],
           ["Lithium LFP Pack", "Aura Custom Pack", "48V 100Ah LFP", "Bengaluru, India"],
           ["Chassis Frame", "Whitefield Precision", "Aircraft Grade Aluminium", "Bengaluru, India"]]
        ),
        createImageFile("c1-404", "c1-fld-04", "cad_chassis_diagram.png", "PNG", "2.4 MB", "20 JUL 2026", "E-404",
          "CAD engineering blueprint diagram showing structural aluminum frame for 1000kg payload rover."
        )
      ]
    },
    {
      id: "c1-fld-05", case_id: "case-01", name: "PEOPLE", folder_type: "PEOPLE", item_count: 3, last_modified: "02 SEP 2026", description: "Executive dossiers and founder history",
      files: [
        createTextFile("c1-501", "c1-fld-05", "executive_leadership_dossier.pdf", "PDF", "950 KB", "02 SEP 2026", "E-501",
          `EXECUTIVE LEADERSHIP DOSSIER\nFounding Story:\nFounded in 2021 by Dr. Vikram Ray and Ananya Deshmukh.\nFounding Agency Origin (ASCII DECIMAL ARRAY): [73, 83, 82, 79] Satellite Centre, Bengaluru.\nExecutives:\n- Dr. Vikram Ray (CEO): 14 years ISRO Satellite Centre.\n- Ananya Deshmukh (CTO): Ex-ISRO rover mechanics, PhD IISc Bengaluru.`
        ),
        createTableFile("c1-502", "c1-fld-05", "headcount_department_breakdown.xlsx", "XLSX", "74 KB", "22 AUG 2026", "E-502",
          ["Department", "Headcount", "Primary Location", "Key Specialization"],
          [["Robotics R&D", "62", "Bengaluru R&D Lab", "Embedded SLAM & AI Vision"],
           ["Hardware Assembly", "48", "Whitefield Factory", "Robotic Chassis & Motor Integration"]]
        ),
        createTextFile("c1-505", "c1-fld-05", "patent_filing_notice.txt", "TXT", "14 KB", "20 JUL 2026", "E-505",
          `Indian Patent Office Filing #20244109823\nApplicants: Dr. Vikram Ray, Ananya Deshmukh\nTitle: Multi-Robot Fleet Collision Avoidance in High-Density Warehouse Grids.`
        )
      ]
    }
  ];
}

export function generateFoldersForCase02(): CaseFolder[] {
  // CASE 02: Ather Energy (CIPHER ENCODED)
  return [
    {
      id: "c2-fld-01", case_id: "case-02", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 4, last_modified: "11 SEP 2026", description: "Audit summaries and EV cell procurement ciphers",
      files: [
        createTableFile("c2-101", "c2-fld-01", "financial_statement_fy25.xlsx", "XLSX", "155 KB", "10 SEP 2026", "E-201-1",
          ["Fiscal Quarter", "Gross EV Revenue (₹ Cr)", "Battery R&D (₹ Cr)", "EBITDA Margin"],
          [["Q1 FY25", "410.2", "45.8", "-8.2%"],
           ["Q2 FY25", "485.6", "52.1", "-4.1%"],
           ["Q3 FY25", "540.1", "58.4", "1.2%"]]
        ),
        createTextFile("c2-102", "c2-fld-01", "fame2_subsidy_audit.pdf", "PDF", "1.2 MB", "28 AUG 2026", "E-201-2",
          `MINISTRY OF HEAVY INDUSTRIES — EV SUBSIDY DISBURSEMENT AUDIT\nRecipient: EV Manufacturer\nCorporate HQ Location (HEX ENCODED): 42 65 6e 67 61 6c 75 72 75\nAddress: IBC Knowledge Park, Bannerghatta Road, Bengaluru, KA.\nPlant Base: Hosur Industrial Complex.\nCertified Lines: 450X Gen 3 & Apex scooter lines.`
        ),
        createTableFile("c2-103", "c2-fld-01", "cell_procurement_ledger.xlsx", "XLSX", "92 KB", "14 AUG 2026", "E-201-3",
          ["Invoice #", "Target Brand (ASCII DECIMAL STRING)", "Component", "Quantity", "Total Amount (₹)"],
          [["INV-ATH-901", "65 116 104 101 114 32 69 110 101 114 103 121", "BMS Logic Chip", "25,000", "3,75,00,000"],
           ["INV-ATH-902", "65 116 104 101 114 32 69 110 101 114 103 121", "21700 Battery Cells", "500,000", "28,40,00,000"]]
        ),
        createTextFile("c2-105", "c2-fld-01", "investor_update_hero.txt", "TXT", "16 KB", "12 JUL 2026", "E-201-5",
          `Investor Briefing Notes:\nKey Shareholders: Hero MotoCorp (38% equity stake), Caladium Investment Pte.\nFocus area: Expanding Ather Grid fast-charging network.`
        )
      ]
    },
    {
      id: "c2-fld-02", case_id: "case-02", name: "SALES", folder_type: "OPERATIONS", item_count: 3, last_modified: "08 SEP 2026", description: "City EV delivery logs",
      files: [
        createTableFile("c2-201", "c2-fld-02", "city_retail_deliveries.xlsx", "XLSX", "110 KB", "05 SEP 2026", "E-202-1",
          ["Metropolitan Zone", "Outlets", "450X Units Delivered", "450S Units Delivered"],
          [["Bengaluru Urban", "14 Outlets", "4,200", "2,800"],
           ["Chennai Metro", "9 Outlets", "2,400", "1,800"],
           ["Hyderabad Metro", "8 Outlets", "2,100", "1,500"]]
        ),
        createTextFile("c2-203", "c2-fld-02", "dispatch_hosur_to_bengaluru.pdf", "PDF", "750 KB", "15 AUG 2026", "E-202-3",
          `FACTORY DISPATCH MANIFEST\nOrigin: Plant 2, Hosur Industrial Estate, TN.\nDestination: Ather Space Experience Center, Indiranagar, Bengaluru.\nPayload: 40 Units 450X Space Grey Edition.`
        ),
        createImageFile("c2-204", "c2-fld-02", "showroom_launch_photo.png", "PNG", "2.1 MB", "10 AUG 2026", "E-204",
          "Minimalist retail experience showroom photo showing matte white smart electric scooters."
        )
      ]
    },
    {
      id: "c2-fld-04", case_id: "case-02", name: "PRODUCTS", folder_type: "PRODUCTS", item_count: 3, last_modified: "01 SEP 2026", description: "Vehicle datasheets",
      files: [
        createTextFile("c2-401", "c2-fld-04", "vehicle_spec_datasheet.pdf", "PDF", "2.8 MB", "28 AUG 2026", "E-204-1",
          `MODEL 450X GEN 3 TECHNICAL DATA\nMotor: 6.2 kW PMSM Mid-Drive Motor\nBattery: 3.7 kWh Lithium-ion Pack\nChassis: Hybrid Aluminium Cast Frame\nDashboard: 7-inch Touchscreen running Atherstack OS\nOrigin: Indiranagar R&D Center, Bengaluru.`
        ),
        createTableFile("c2-402", "c2-fld-04", "bms_component_breakdown.xlsx", "XLSX", "98 KB", "15 AUG 2026", "E-204-2",
          ["Component", "Manufacturer", "Specification"],
          [["PMSM Motor", "Ather Custom Design", "6.2 kW Peak"],
           ["Battery Cells", "LG Energy / SK On", "NCM 21700"]]
        ),
        createImageFile("c2-404", "c2-fld-04", "chassis_exploded_view.png", "PNG", "2.6 MB", "25 JUL 2026", "E-204-4",
          "Exploded 3D rendering showing lightweight aluminum chassis frame and floorboard battery enclosure."
        )
      ]
    },
    {
      id: "c2-fld-05", case_id: "case-02", name: "PEOPLE", folder_type: "PEOPLE", item_count: 3, last_modified: "04 SEP 2026", description: "Founding leadership profiles",
      files: [
        createTextFile("c2-501", "c2-fld-05", "founder_biography_dossier.pdf", "PDF", "880 KB", "02 SEP 2026", "E-205-1",
          `FOUNDER BIOGRAPHY & ORIGIN STORY\nFounders: Tarun Mehta (CEO) & Swapnil Jain (CTO).\nOrigin Department (ASCII CODE STRING): 73 73 84 32 77 97 100 114 97 115\nIncubation: Incubated at Engineering Design Dept, IIT Madras, before establishing HQ in Indiranagar, Bengaluru.`
        ),
        createTableFile("c2-502", "c2-fld-05", "rd_headcount_location.xlsx", "XLSX", "82 KB", "20 AUG 2026", "E-205-2",
          ["Department", "Staff Count", "Location"],
          [["Vehicle Dynamics", "85", "Bengaluru R&D Center"],
           ["Battery Tech & BMS", "110", "Bengaluru Battery Lab"]]
        ),
        createTextFile("c2-505", "c2-fld-05", "patent_fast_charging.txt", "TXT", "15 KB", "18 JUL 2026", "E-205-5",
          `Patent Grant #IN389012\nAssignee: Ather Energy Pvt Ltd, Bengaluru\nTitle: Universal Fast Charging Connector Protocol.`
        )
      ]
    }
  ];
}

export function generateFoldersForCase03(): CaseFolder[] {
  // CASE 03: Paper Boat / Hector Beverages (CIPHER ENCODED)
  return [
    {
      id: "c3-fld-01", case_id: "case-03", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 4, last_modified: "12 SEP 2026", description: "Pouch packaging invoices and FMCG revenue logs",
      files: [
        createTableFile("c3-101", "c3-fld-01", "revenue_breakdown_by_category.xlsx", "XLSX", "138 KB", "10 SEP 2026", "E-301-1",
          ["Beverage Flavor Variant", "Gross Revenue (₹ Cr)", "Pulp Sourcing Cost", "Gross Margin %"],
          [["Aamras (Mango Pulp)", "180.4", "62.1", "49.8%"],
           ["Jaljeera (Spiced Cumin)", "94.2", "18.5", "63.1%"],
           ["Anardana & Pomegranate", "76.8", "31.2", "41.0%"]]
        ),
        createTextFile("c3-102", "c3-fld-01", "fssai_compliance_audit.pdf", "PDF", "1.1 MB", "25 AUG 2026", "E-301-2",
          `FOOD SAFETY & STANDARDS AUTHORITY OF INDIA (FSSAI)\nLicensee: Hector Beverages Private Limited\nHeadquarters Location (HEX ENCODED): 47 75 72 75 67 72 61 6d\nAddress: Sector 44, Gurugram, Haryana.\nManufacturing Facilities: Mysore (Karnataka) & Manesar (Haryana).`
        ),
        createTableFile("c3-103", "c3-fld-01", "packaging_supplier_register.xlsx", "XLSX", "85 KB", "14 AUG 2026", "E-301-3",
          ["Invoice #", "Supplier Name", "Pouch Material Code", "Quantity", "Total Amount (₹)"],
          [["INV-PB-4401", "Tetra Pak India", "DOY-PACK Doypack 250ml", "4,000,000", "1,80,00,000"],
           ["INV-PB-4403", "Jain Irrigation Systems", "Alphonso Mango Concentrate", "250 Tons", "3,25,00,000"]]
        ),
        createTextFile("c3-105", "c3-fld-01", "investor_stake_catamaran.txt", "TXT", "15 KB", "10 JUL 2026", "E-301-5",
          `Shareholder Register Summary:\nInvestors: Catamaran Ventures (N.R. Narayana Murthy family office), Sequoia Capital.\nCorporate HQ: Sector 44, Gurugram.`
        )
      ]
    },
    {
      id: "c3-fld-03", case_id: "case-03", name: "MARKETING", folder_type: "MARKETING", item_count: 3, last_modified: "01 SEP 2026", description: "Nostalgic advertising copy and brand collateral",
      files: [
        createTextFile("c3-301", "c3-fld-03", "brand_philosophy_dossier.pdf", "PDF", "920 KB", "25 AUG 2026", "E-303-1",
          `BRAND POSITIONING DOSSIER\nTarget Brand Name (HEX ENCODED): 50 61 70 65 72 20 42 6f 61 74\nParent Entity: Hector Beverages Private Limited, Gurugram, Haryana.\nSlogan: "Drinks & Memories"\nCore Identity: Traditional Indian ethnic beverage recipes (Aamras, Jaljeera, Anardana) in flexible squeeze pouches.`
        ),
        createImageFile("c3-302", "c3-fld-03", "pouch_artwork_preview.jpg", "JPG", "1.8 MB", "14 AUG 2026", "E-303-2",
          "Flexible stand-up pouch artwork featuring paper boat drawing and nostalgic poem."
        ),
        createTextFile("c3-305", "c3-fld-03", "customer_story_letters.txt", "TXT", "17 KB", "15 JUL 2026", "E-303-5",
          `Consumer Mail Extract:\n"Opening an Aamras pouch in my office takes me straight back to childhood summers."`
        )
      ]
    },
    {
      id: "c3-fld-05", case_id: "case-03", name: "PEOPLE", folder_type: "PEOPLE", item_count: 3, last_modified: "03 SEP 2026", description: "Founding team dossiers",
      files: [
        createTextFile("c3-501", "c3-fld-05", "founding_team_dossier.pdf", "PDF", "910 KB", "01 SEP 2026", "E-305-1",
          `EXECUTIVE LEADERSHIP DOSSIER\nFounders: Neeraj Kakkar, Neeraj Biyani, Suhas Misra.\nExecutive Origin Heritage (ASCII DECIMAL ARRAY): [67, 111, 99, 97, 45, 67, 111, 108, 97] India.\nEntity: Hector Beverages Private Limited, Gurugram.`
        ),
        createTableFile("c3-502", "c3-fld-05", "staff_department_headcount.xlsx", "XLSX", "78 KB", "18 AUG 2026", "E-305-2",
          ["Department", "Count", "Primary Hub"],
          [["R&D & Food Tech", "42", "Gurugram Innovation Lab"],
           ["Supply Chain", "110", "Gurugram & Mysore"]]
        ),
        createTextFile("c3-505", "c3-fld-05", "ex_cocacola_network_brief.txt", "TXT", "16 KB", "14 JUL 2026", "E-305-5",
          `Corporate Heritage Note:\nLeveraging 35+ years of Coca-Cola India beverage distribution experience to build India's premier ethnic beverage brand from Gurugram.`
        )
      ]
    }
  ];
}

export function generateFoldersForCase04(): CaseFolder[] {
  // CASE 04: Lenskart (CIPHER ENCODED)
  return [
    {
      id: "c4-fld-01", case_id: "case-04", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 4, last_modified: "13 SEP 2026", description: "Optical frame ledgers and automated lens lab capex",
      files: [
        createTableFile("c4-101", "c4-fld-01", "retail_revenue_summary.xlsx", "XLSX", "148 KB", "11 SEP 2026", "E-401-1",
          ["Sales Channel", "Store Count", "Eyeglasses Sold (Pairs)", "Gross Revenue (₹ Cr)"],
          [["Omnichannel Stores", "2,200 Stores", "4,800,000", "1,420.0"],
           ["Mobile App & Online", "D2C App", "2,600,000", "680.0"]]
        ),
        createTextFile("c4-102", "c4-fld-01", "bhiwadi_mega_factory_audit.pdf", "PDF", "1.3 MB", "26 AUG 2026", "E-402-2",
          `AUTOMATED OPTICAL FACTORY AUDIT — BHIWADI / DELHI NCR\nEntity (HEX ENCODED): 4c 65 6e 73 6b 61 72 74\nCorporate HQ: Vatika Mindscapes, Mathura Road, Faridabad / Sector 44, Gurugram, HR.\nMega Plant: Bhiwadi Optical Automated Lab (50,000 pairs/day using German robotic edgers).\nPrimary Brands: Vincent Chase, John Jacobs, Air Flex.`
        ),
        createTableFile("c4-103", "c4-fld-01", "lens_cut_procurement.xlsx", "XLSX", "88 KB", "15 AUG 2026", "E-403-3",
          ["Invoice #", "Supplier", "Component", "Quantity", "Total Amount (₹)"],
          [["INV-LK-8801", "EssilorLuxottica India", "1.67 High Index Lenses", "100,000 pairs", "4,50,00,000"],
           ["INV-LK-8802", "Schneider Optical Germany", "Robotic Cutters", "4 Machines", "6,20,00,000"]]
        ),
        createTextFile("c4-105", "c4-fld-01", "softbank_funding_extract.txt", "TXT", "17 KB", "14 JUL 2026", "E-401-5",
          `Cap Table Summary:\nKey Investors: SoftBank Vision Fund, Temasek Holdings, PremjiInvest.\nHeadquarters: Gurugram / Delhi NCR.`
        )
      ]
    },
    {
      id: "c4-fld-02", case_id: "case-04", name: "SALES", folder_type: "OPERATIONS", item_count: 3, last_modified: "09 SEP 2026", description: "Eye-test appointment logs and store manifests",
      files: [
        createTableFile("c4-201", "c4-fld-02", "home_eye_test_metrics.xlsx", "XLSX", "108 KB", "06 SEP 2026", "E-402-1",
          ["City Zone", "Optometrists", "Monthly Home Visits", "Conversion %"],
          [["Delhi NCR Zone", "320 Optometrists", "45,000 Visits", "78.4%"],
           ["Mumbai Metro", "280 Optometrists", "38,000 Visits", "76.2%"]]
        ),
        createTextFile("c4-203", "c4-fld-02", "dispatch_bhiwadi_to_stores.pdf", "PDF", "760 KB", "14 AUG 2026", "E-402-3",
          `DAILY DISPATCH MANIFEST — BHIWADI AUTOMATED LAB\nOrigin: Bhiwadi Automated Optical Plant, NCR.\nDestination: 450 Retail Stores across North India.\nContents: 14,200 Custom Prescription Glasses fitted in hard cases.`
        ),
        createImageFile("c4-204", "c4-fld-02", "store_interior_photo.png", "PNG", "2.2 MB", "08 AUG 2026", "E-402-4",
          "Futuristic retail store interior photo showing illuminated frame display racks and digital 3D try-on kiosks."
        )
      ]
    },
    {
      id: "c4-fld-05", case_id: "case-04", name: "PEOPLE", folder_type: "PEOPLE", item_count: 3, last_modified: "04 SEP 2026", description: "Founder dossier and leadership bio",
      files: [
        createTextFile("c4-501", "c4-fld-05", "founder_leadership_dossier.pdf", "PDF", "920 KB", "02 SEP 2026", "E-405-1",
          `EXECUTIVE LEADERSHIP DOSSIER\nFounder & CEO: Peyush Bansal\nCo-Founders: Amit Chaudhary & Sumeet Kapahi.\nFounder Engineering Background (ASCII DECIMAL ARRAY): [77, 105, 99, 114, 111, 115, 111, 102, 116] Seattle.\nBackground: Founded in 2010 by Peyush Bansal, former Microsoft software engineer (Redmond, USA) who studied at McGill & IIM Bangalore.`
        ),
        createTableFile("c4-502", "c4-fld-05", "optometrist_network_headcount.xlsx", "XLSX", "80 KB", "22 AUG 2026", "E-405-2",
          ["Department", "Headcount", "Primary Location"],
          [["Certified Optometrists", "2,400", "Store & Home Units"],
           ["Automated Lab Engineers", "650", "Bhiwadi Mega Plant"]]
        ),
        createTextFile("c4-503", "c4-fld-05", "shark_tank_media_profile.pdf", "PDF", "450 KB", "12 AUG 2026", "E-405-3",
          `MEDIA FEATURE ARTICLE\n"From Coding at Microsoft in Seattle to Transforming India's Vision Care: Peyush Bansal's Journey in Building Lenskart from Gurugram."`
        )
      ]
    }
  ];
}

export function generateFoldersForCase05(): CaseFolder[] {
  // CASE 05: Addverb Technologies (CIPHER ENCODED)
  return [
    {
      id: "c5-fld-01", case_id: "case-05", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 4, last_modified: "14 SEP 2026", description: "Robotics capex and factory ledgers",
      files: [
        createTableFile("c5-101", "c5-fld-01", "annual_revenue_robotics.xlsx", "XLSX", "145 KB", "12 SEP 2026", "E-501-1",
          ["Fiscal Year", "Gross Revenue (₹ Cr)", "R&D Spend (₹ Cr)", "EBITDA Margin"],
          [["FY 2022-23", "215.0", "38.0", "14.2%"],
           ["FY 2023-24", "450.0", "65.0", "18.5%"],
           ["FY 2024-25", "820.0", "110.0", "22.4%"]]
        ),
        createTextFile("c5-102", "c5-fld-01", "factory_capex_noida.pdf", "PDF", "1.4 MB", "26 AUG 2026", "E-502-2",
          `BOT-VALLEY MANUFACTURING COMPLEX AUDIT\nTarget Entity (HEX ENCODED): 41 64 64 76 65 72 62\nPlant Facility: Bot-Valley Mega Factory, Sector 156, Noida, Uttar Pradesh.\nKey Strategic Investor: Reliance Industries Limited (54% equity stake acquired for $132M).\nCore Offerings: Dynamo AMR, Zippy Sortation Bot, Quadron AS/RS.`
        ),
        createTableFile("c5-103", "c5-fld-01", "robot_assembly_invoices.xlsx", "XLSX", "90 KB", "15 AUG 2026", "E-503-3",
          ["Invoice #", "Supplier Name", "Component", "Quantity", "Total Amount (₹)"],
          [["INV-ADV-9901", "KUKA Systems India", "6-Axis Heavy Welding Arms", "12 Units", "4,80,00,000"],
           ["INV-ADV-9902", "Keyence Optical India", "Laser Scanner Guidance", "200 Units", "1,65,00,000"]]
        ),
        createTextFile("c5-105", "c5-fld-01", "gst_filing_noida.txt", "TXT", "17 KB", "10 JUL 2026", "E-501-5",
          `GSTIN Filing Extract — Form GSTR-3B\nEntity GSTIN: 09AAACA8801M1Z4\nState Code: 09 (Uttar Pradesh)\nHeadquarters Location (HEX ENCODED): 4e 6f 69 64 61\nAddress: Sector 156, Noida, UP 201301.`
        )
      ]
    },
    {
      id: "c5-fld-02", case_id: "case-05", name: "OPERATIONS", folder_type: "OPERATIONS", item_count: 3, last_modified: "08 SEP 2026", description: "Bot-Valley plant dispatch metrics",
      files: [
        createTableFile("c5-201", "c5-fld-05", "bot_valley_production.xlsx", "XLSX", "105 KB", "05 SEP 2026", "E-502-1",
          ["Bot Model", "Monthly Production", "Primary Deployment Hub"],
          [["Dynamo 500kg AMR", "350 Units", "Reliance Retail Hubs"],
           ["Zippy Sortation Rover", "600 Units", "JioMart Sorting Hubs"],
           ["Quadron AS/RS", "40 Systems", "HUL Warehouses"]]
        ),
        createTextFile("c5-203", "c5-fld-05", "dispatch_noida_to_mumbai.pdf", "PDF", "780 KB", "15 AUG 2026", "E-502-3",
          `FACTORY DISPATCH MANIFEST\nOrigin: Bot-Valley Mega Plant, Sector 156, Noida, UP.\nDestination: Reliance Mega Distribution Center, Bhiwandi, Mumbai.\nPayload: 50 Units Dynamo Autonomous Rovers.`
        ),
        createImageFile("c5-204", "c5-fld-05", "noida_plant_photo.png", "PNG", "2.3 MB", "10 AUG 2026", "E-504",
          "High-tech manufacturing floor photo showing automated SMT lines and yellow sorting rovers in Noida Bot-Valley factory."
        )
      ]
    },
    {
      id: "c5-fld-05", case_id: "case-05", name: "PEOPLE", folder_type: "PEOPLE", item_count: 3, last_modified: "04 SEP 2026", description: "Founders profile and ex-Asian Paints history",
      files: [
        createTextFile("c5-501", "c5-fld-05", "founders_profile.pdf", "PDF", "890 KB", "02 SEP 2026", "E-505-1",
          `EXECUTIVE LEADERSHIP DOSSIER\nFounders: Sangeet Kumar (CEO), Prateek Jain, Bir Singh, Satish Kumar Shukla.\nExecutive Origin Heritage (ASCII STRING): 65 120 45 61 115 105 97 110 32 80 97 105 110 116 115\nBackground: Founded in 2016 by former Asian Paints supply chain and automation leaders who set up India's largest robotics plant in Noida.`
        ),
        createTableFile("c5-502", "c5-fld-05", "rd_headcount_noida.xlsx", "XLSX", "82 KB", "20 AUG 2026", "E-505-2",
          ["Department", "Headcount", "Location"],
          [["Robotics & AI Lab", "140 Engineers", "Noida Innovation Center"],
           ["Bot-Valley Factory Ops", "520 Personnel", "Noida Sector 156"]]
        ),
        createTextFile("c5-505", "c5-fld-05", "reliance_investment_brief.txt", "TXT", "16 KB", "18 JUL 2026", "E-505-5",
          `Strategic Partnership Note:\nReliance Industries acquired controlling stake in Addverb Technologies to automate JioMart fulfillment centers pan-India.`
        )
      ]
    }
  ];
}

export function generateFoldersForCaseR2_01(): CaseFolder[] {
  // CASE R2-01: Operation Broken Chain
  return [
    {
      id: "r2-fld-01", case_id: "case-r2-01", name: "FINANCIAL", folder_type: "FINANCIAL", item_count: 4, last_modified: "15 SEP 2026", description: "Warranty loss audit and unbudgeted replacement claims",
      files: [
        createTableFile("r2-101", "r2-fld-01", "q3_warranty_claims.xlsx", "XLSX", "155 KB", "15 SEP 2026", "E-R2-01",
          ["Incident ID", "Affected Customer", "Failed Unit Serial", "Failure Mode", "Refund / Replacement Cost (₹)"],
          [["INC-4011", "Amazon Hub Bhiwandi", "AMR-1000 #B8802-04", "Battery Thermal Overheating Shutdown", "4,00,000"],
           ["INC-4012", "Flipkart Fulfillment Pune", "AMR-1000 #B8802-11", "Battery Thermal Overheating Shutdown", "4,00,000"],
           ["INC-4013", "Reliance Logistics BGL", "AMR-1000 #B8802-18", "Battery Thermal Overheating Shutdown", "4,00,000"],
           ["INC-4014", "Delhivery Sortation NCR", "AMR-1000 #B8802-22", "Battery Thermal Overheating Shutdown", "4,00,000"],
           ["TOTAL LOSS", "4 Logistics Accounts", "35 Units Impacted", "Batch #B-8802 Systemic Failure", "₹24,00,000"]]
        ),
        createTextFile("r2-102", "r2-fld-01", "financial_reserve_drain.pdf", "PDF", "820 KB", "14 SEP 2026", "E-R2-02",
          `SPECIAL AUDIT REPORT — WARRANTY DECAY\nDirect loss of ₹2,400,000 allocated from emergency reserves to cover client replacement units under SLA penalties.`
        ),
        createTextFile("r2-104", "r2-fld-01", "legal_notice_apex.pdf", "PDF", "640 KB", "08 SEP 2026", "E-R2-04",
          `LEGAL DEMAND NOTICE FOR INDEMNITY\nSent To: Apex Electronics (Supplier ID: VEND-992)\nDemand Amount: ₹2,400,000 for supply of counterfeit microcontrollers.`
        ),
        createTextFile("r2-105", "r2-fld-01", "bank_wire_reversal.txt", "TXT", "14 KB", "05 SEP 2026", "E-R2-05",
          `Wire Transfer Reversal Notice: ₹2.4 Million disbursed for emergency air-freight replacement parts.`
        )
      ]
    },
    {
      id: "r2-fld-02", case_id: "case-r2-01", name: "OPERATIONS", folder_type: "OPERATIONS", item_count: 3, last_modified: "14 SEP 2026", description: "Plant defect metrics and production batch telemetry",
      files: [
        createTextFile("r2-201", "r2-fld-02", "batch_yield_report.pdf", "PDF", "1.1 MB", "12 SEP 2026", "E-R2-06",
          `PLANT FORENSIC AUDIT — WHITEFIELD FACILITY\nAudit Lead: Quality & Safety Inspection Team\nSubject: Failure Rate Spike in Production Batch #B-8802\nFindings: Out of 84 AMR-1000 units manufactured in August 2026 under Batch #B-8802, exactly 35 units (41.6% failure rate) suffered emergency thermal shutdowns within 72 hours of customer deployment.\nThermal telemetry revealed motor controller logic boards suffered voltage overload, triggering emergency battery cutoffs.`
        ),
        createTextFile("r2-203", "r2-fld-02", "temperature_sensor_log.txt", "TXT", "22 KB", "10 SEP 2026", "E-R2-08",
          `Thermal Sensor Event Log:\nUnit #B8802-04: Voltage spike on MCU bus at 14:22:01 -> MCU board temperature hit 114°C -> Emergency Battery Cutoff Triggered.`
        ),
        createImageFile("r2-204", "r2-fld-02", "scorched_mcu_photo.png", "PNG", "1.9 MB", "08 SEP 2026", "E-R2-09",
          "Close-up forensic laboratory photo showing charred C-402 MCU board with blown voltage regulation capacitors."
        )
      ]
    },
    {
      id: "r2-fld-03", case_id: "case-r2-01", name: "SUPPLIER", folder_type: "ARCHIVE", item_count: 3, last_modified: "12 SEP 2026", description: "Component procurement logs and vendor compliance audits",
      files: [
        createTextFile("r2-301", "r2-fld-03", "supplier_audit.pdf", "PDF", "1.6 MB", "10 SEP 2026", "E-R2-11",
          `CONFIDENTIAL SUPPLIER INVESTIGATION REPORT\nTarget Vendor: Apex Electronics (Supplier ID: VEND-992)\nComponent Supplied: C-402 Microcontroller Unit (MCU Board)\nAudit Discovery: Due to a global semiconductor shortage in July 2026, procurement authorized an uncertified shipment of 200 C-402 MCU boards from vendor Apex Electronics.\nLab examination confirmed Apex Electronics delivered counterfeit / non-automotive grade microcontrollers that lacked surge protection capacitors. Under sustained 48V motor loads, the chips leaked voltage into the thermal management bus, causing severe battery overheating shutdowns.\nVendor Liability: Apex Electronics knowingly substituted sub-spec microcontrollers without engineering change notices (ECN). Total direct financial damage: ₹2.4 Million (₹24,00,000).`
        ),
        createTableFile("r2-302", "r2-fld-03", "po_apex_electronics.xlsx", "XLSX", "88 KB", "08 SEP 2026", "E-R2-12",
          ["PO #", "Vendor Name", "Part Code", "Unit Price (₹)", "Quantity", "Total (₹)"],
          [["PO-APX-9901", "Apex Electronics", "C-402 MCU Board", "4,200", "200", "8,40,00"]]
        ),
        createTextFile("r2-303", "r2-fld-03", "lab_analysis_report_mcu.pdf", "PDF", "920 KB", "06 SEP 2026", "E-R2-13",
          `DEKRA INDEPENDENT SEMICONDUCTOR LAB AUDIT\nSubject: Microcontroller Batch C-402 from Apex Electronics\nConclusion: Sub-standard consumer grade silicon repackaged with forged automotive grade laser markings.`
        )
      ]
    },
    {
      id: "r2-fld-04", case_id: "case-r2-01", name: "COMMUNICATIONS", folder_type: "MISC", item_count: 2, last_modified: "10 SEP 2026", description: "Internal email transcripts between procurement and CFO office",
      files: [
        createTextFile("r2-401", "r2-fld-04", "cfo_internal_log.txt", "TXT", "22 KB", "08 SEP 2026", "E-R2-16",
          `--- EMAIL TRANSCRIPT ---\nDate: August 04, 2026\nFrom: procurement@aurarobotics.in\nTo: cfo@aurarobotics.in\nSubject: Urgent MCU Component Authorization for Batch B-8802\n\nCFO,\nOur primary supplier Infineon has a 6-week delivery delay on MCU logic chips. Vendor Apex Electronics offered immediate delivery of 200 units of "equivalent" C-402 microcontrollers at a 15% discount. We waived the 14-day lab burn-in test to meet Amazon's delivery deadline.\n\nReply from CFO:\nApproved on emergency basis, but ensure vendor Apex Electronics warrants full indemnity for defect losses.`
        ),
        createTextFile("r2-402", "r2-fld-04", "slack_transcript_quality.txt", "TXT", "18 KB", "06 SEP 2026", "E-R2-17",
          `Slack Transcript #quality-emergency:\n[Aug 05 10:14] QualityTech: "Hey team, the Apex MCU boards don't have the secondary capacitor footprint on C4."\n[Aug 05 10:16] ProcurementLead: "Ship them anyway, CFO signed the emergency waiver for Batch B-8802."`
        )
      ]
    }
  ];
}

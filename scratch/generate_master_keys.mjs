import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const r1Keys = [
  {
    fileName: 'Hyundai_Deep_Investigation_MASTER_KEY.xlsx',
    rows: [
      { QID: 'Q1', Question: 'What is the full name of the mystery company?', Answer: 'Hyundai Motor Company', 'Evidence Path (Organizer)': '01/Sheets/vehicle_badge.xlsx', Difficulty: 'Easy' },
      { QID: 'Q2', Question: 'Who was the founder?', Answer: 'Chung Ju-yung', 'Evidence Path (Organizer)': '04/Sheets/employee_directory.xlsx', Difficulty: 'Easy' },
      { QID: 'Q3', Question: 'Employee ID of founder', Answer: 'EMP-001', 'Evidence Path (Organizer)': '04/Sheets/employee_directory.xlsx', Difficulty: 'Medium' },
      { QID: 'Q4', Question: 'Headquarters location', Answer: 'Seoul, South Korea', 'Evidence Path (Organizer)': '06/Images/address_card.png', Difficulty: 'Easy' },
      { QID: 'Q5', Question: 'Subsidiary location', Answer: 'Seoul, South Korea', 'Evidence Path (Organizer)': '02/Sheets/transaction_history.xlsx', Difficulty: 'Medium' },
      { QID: 'Q6', Question: 'Transaction value', Answer: 'KRW 8,240,000,000', 'Evidence Path (Organizer)': '08/Documents/bank_transfer_note.pdf', Difficulty: 'Hard' },
      { QID: 'Q7', Question: 'Key asset acquired', Answer: 'Engine + transmission tooling', 'Evidence Path (Organizer)': '05/Documents/engine_transmission_report.pdf', Difficulty: 'Medium' },
      { QID: 'Q8', Question: 'Purchase order reference', Answer: 'PO-ENG-482', 'Evidence Path (Organizer)': '09/Documents/purchase_order_note.pdf', Difficulty: 'Medium' },
      { QID: 'Q9', Question: 'Factory site location', Answer: 'Chennai, Tamil Nadu', 'Evidence Path (Organizer)': '07/Documents/chennai_factory_log.pdf', Difficulty: 'Medium' },
      { QID: 'Q10', Question: 'First mass-market car model', Answer: 'Pony (1976)', 'Evidence Path (Organizer)': '05/Documents/pony_program.pdf', Difficulty: 'Easy' },
      { QID: 'Q11', Question: 'Year established', Answer: '1967', 'Evidence Path (Organizer)': '06/Sheets/corporate_extract.xlsx', Difficulty: 'Easy' },
      { QID: 'Q12', Question: 'First India model and year', Answer: 'Santro, 1998', 'Evidence Path (Organizer)': '08/Sheets/first_models.xlsx', Difficulty: 'Medium' }
    ]
  },
  {
    fileName: 'Eternal_Deep_Investigation_MASTER_KEY.xlsx',
    rows: [
      { QID: 'Q1', Question: 'Full legal name', Answer: 'Eternal Limited', 'Evidence Path (Organizer)': '01/Sheets/corporate_extract.xlsx', Difficulty: 'Easy' },
      { QID: 'Q2', Question: 'Primary brand name', Answer: 'Zomato', 'Evidence Path (Organizer)': '02/Documents/brand_dossier.pdf', Difficulty: 'Easy' },
      { QID: 'Q3', Question: 'Founder name', Answer: 'Deepinder Goyal', 'Evidence Path (Organizer)': '03/Sheets/founder_records.xlsx', Difficulty: 'Easy' },
      { QID: 'Q4', Question: 'Establishment year', Answer: '2008', 'Evidence Path (Organizer)': '03/Sheets/founder_records.xlsx', Difficulty: 'Easy' },
      { QID: 'Q5', Question: 'Headquarters city', Answer: 'Gurugram, Haryana', 'Evidence Path (Organizer)': '04/Documents/hq_lease.pdf', Difficulty: 'Easy' },
      { QID: 'Q6', Question: 'Key acquisition', Answer: 'Blinkit (Grofers)', 'Evidence Path (Organizer)': '05/Sheets/acquisitions.xlsx', Difficulty: 'Medium' },
      { QID: 'Q7', Question: 'Blinkit deal value', Answer: 'USD 570 Million', 'Evidence Path (Organizer)': '05/Sheets/acquisitions.xlsx', Difficulty: 'Hard' },
      { QID: 'Q8', Question: 'Ticker symbol', Answer: 'ZOMATO', 'Evidence Path (Organizer)': '06/Documents/stock_filings.pdf', Difficulty: 'Easy' },
      { QID: 'Q9', Question: 'Core revenue stream', Answer: 'Food ordering and delivery commissions', 'Evidence Path (Organizer)': '07/Sheets/revenue_breakdown.xlsx', Difficulty: 'Medium' },
      { QID: 'Q10', Question: 'B2B supply arm', Answer: 'Hyperpure', 'Evidence Path (Organizer)': '08/Documents/supply_arm.pdf', Difficulty: 'Medium' },
      { QID: 'Q11', Question: 'Loyalty program name', Answer: 'Zomato Gold', 'Evidence Path (Organizer)': '09/Sheets/membership_data.xlsx', Difficulty: 'Easy' },
      { QID: 'Q12', Question: 'IPO Year', Answer: '2021', 'Evidence Path (Organizer)': '10/Documents/prospectus.pdf', Difficulty: 'Easy' }
    ]
  },
  {
    fileName: 'Dior_Deep_Investigation_MASTER_KEY.xlsx',
    rows: [
      { QID: 'Q1', Question: 'Full name of fashion house', Answer: 'Christian Dior SE', 'Evidence Path (Organizer)': '01/Sheets/brand_extract.xlsx', Difficulty: 'Easy' },
      { QID: 'Q2', Question: 'Founder name', Answer: 'Christian Dior', 'Evidence Path (Organizer)': '02/Documents/history.pdf', Difficulty: 'Easy' },
      { QID: 'Q3', Question: 'Establishment year', Answer: '1946', 'Evidence Path (Organizer)': '02/Documents/history.pdf', Difficulty: 'Easy' },
      { QID: 'Q4', Question: 'Headquarters address', Answer: '30 Avenue Montaigne, Paris', 'Evidence Path (Organizer)': '03/Documents/paris_hq.pdf', Difficulty: 'Medium' },
      { QID: 'Q5', Question: 'Parent luxury conglomerate', Answer: 'LVMH Moët Hennessy Louis Vuitton', 'Evidence Path (Organizer)': '04/Sheets/corporate_group.xlsx', Difficulty: 'Easy' },
      { QID: 'Q6', Question: 'Famous debut collection', Answer: 'The New Look (1947)', 'Evidence Path (Organizer)': '05/Documents/fashion_archive.pdf', Difficulty: 'Medium' },
      { QID: 'Q7', Question: 'Iconic fragrance line', Answer: 'Miss Dior', 'Evidence Path (Organizer)': '06/Sheets/perfume_sales.xlsx', Difficulty: 'Easy' },
      { QID: 'Q8', Question: 'Key controlling family', Answer: 'Arnault Family', 'Evidence Path (Organizer)': '07/Sheets/shareholding.xlsx', Difficulty: 'Medium' },
      { QID: 'Q9', Question: 'Famous handbag model', Answer: 'Lady Dior', 'Evidence Path (Organizer)': '08/Documents/handbag_line.pdf', Difficulty: 'Easy' },
      { QID: 'Q10', Question: 'Current creative director', Answer: 'Maria Grazia Chiuri', 'Evidence Path (Organizer)': '09/Documents/artistic_board.pdf', Difficulty: 'Medium' },
      { QID: 'Q11', Question: 'First perfume launch year', Answer: '1947', 'Evidence Path (Organizer)': '06/Sheets/perfume_sales.xlsx', Difficulty: 'Easy' },
      { QID: 'Q12', Question: 'Main competitor group', Answer: 'Kering Group', 'Evidence Path (Organizer)': '10/Sheets/market_peers.xlsx', Difficulty: 'Medium' }
    ]
  },
  {
    fileName: 'CF_Internet_Company_MASTER_KEY.xlsx',
    rows: [
      { QID: 'Q1', Question: 'Full legal name', Answer: 'Cloudflare Inc', 'Evidence Path (Organizer)': '01/Sheets/company_info.xlsx', Difficulty: 'Easy' },
      { QID: 'Q2', Question: 'Co-founders', Answer: 'Matthew Prince, Michelle Zatlyn, Lee Holloway', 'Evidence Path (Organizer)': '02/Documents/founders.pdf', Difficulty: 'Medium' },
      { QID: 'Q3', Question: 'Establishment year', Answer: '2009', 'Evidence Path (Organizer)': '02/Documents/founders.pdf', Difficulty: 'Easy' },
      { QID: 'Q4', Question: 'Headquarters city', Answer: 'San Francisco, California', 'Evidence Path (Organizer)': '03/Documents/hq_record.pdf', Difficulty: 'Easy' },
      { QID: 'Q5', Question: 'Stock ticker symbol', Answer: 'NET', 'Evidence Path (Organizer)': '04/Sheets/nyse_filings.xlsx', Difficulty: 'Easy' },
      { QID: 'Q6', Question: 'Core service product', Answer: 'Content Delivery Network (CDN) & DDoS Protection', 'Evidence Path (Organizer)': '05/Sheets/services.xlsx', Difficulty: 'Easy' },
      { QID: 'Q7', Question: 'Public DNS service address', Answer: '1.1.1.1', 'Evidence Path (Organizer)': '06/Documents/dns_tech.pdf', Difficulty: 'Easy' },
      { QID: 'Q8', Question: 'Serverless platform product', Answer: 'Cloudflare Workers', 'Evidence Path (Organizer)': '07/Sheets/developer_platform.xlsx', Difficulty: 'Medium' },
      { QID: 'Q9', Question: 'Zero Trust platform name', Answer: 'Cloudflare One', 'Evidence Path (Organizer)': '08/Documents/enterprise_security.pdf', Difficulty: 'Medium' },
      { QID: 'Q10', Question: 'IPO Year', Answer: '2019', 'Evidence Path (Organizer)': '04/Sheets/nyse_filings.xlsx', Difficulty: 'Easy' },
      { QID: 'Q11', Question: 'Object storage service name', Answer: 'Cloudflare R2', 'Evidence Path (Organizer)': '09/Sheets/storage_products.xlsx', Difficulty: 'Medium' },
      { QID: 'Q12', Question: 'San Francisco HQ address', Answer: '101 Townsend St, San Francisco, CA 94107', 'Evidence Path (Organizer)': '03/Documents/hq_record.pdf', Difficulty: 'Medium' }
    ]
  }
];

const r2Keys = [
  {
    fileName: 'Hyundai_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    rows: [
      ['Question ID', 'Question Text', 'Master Key Answer', 'Evidence Path', 'Notes'],
      [1, 'FY23-FY26 Revenue CAGR', '14.5%', 'F01/DATA_01.xlsx', 'Calculated from revenue model'],
      [2, 'Primary operational bottleneck', 'Tooling supply delay at vendor V-48', 'F02/DOC_06.pdf', 'Vendor audit report'],
      [3, 'Financial impact magnitude', 'KRW 142 Billion', 'F03/DATA_10.xlsx', 'P&L variance breakdown'],
      [4, 'Root cause component', 'Powertrain casting mold alignment', 'F04/DOC_14.pdf', 'Engineering analysis'],
      [5, 'Key evidence document ID', 'DOC-HW-991', 'F05/DOC_17.pdf', 'Internal incident memo'],
      [6, 'Responsible unit manager', 'K. Tanaka (Operations Director)', 'F06/DATA_22.xlsx', 'Staff roster'],
      [7, 'Audit discrepancy variance', '18.4%', 'F07/DATA_25.xlsx', 'Accounting audit sheet'],
      [8, 'Uncovered warranty cost', 'KRW 34.5 Billion', 'F08/DOC_30.pdf', 'Warranty claim log'],
      [9, 'Supply chain delay duration', '42 Days', 'F09/DATA_33.xlsx', 'Logistics log'],
      [10, 'Approved mitigation budget', 'KRW 85 Billion', 'F10/DOC_38.pdf', 'Board approval memo'],
      [11, 'Risk rating level', 'HIGH - CRITICAL', 'F11/DATA_41.xlsx', 'Risk matrix'],
      [12, 'Final War-Room Assessment', 'Three structural weaknesses with evidence chain across 4 files', 'F12/DOC_45.pdf', 'War room summary']
    ]
  },
  {
    fileName: 'Eternal_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    rows: [
      ['Question ID', 'Question Text', 'Master Key Answer', 'Evidence Path', 'Notes'],
      [1, 'FY23-FY26 Revenue CAGR', '22.8%', 'F01/DATA_01.xlsx', 'Revenue growth model'],
      [2, 'Delivery fleet cost increase', '34.2%', 'F02/DOC_06.pdf', 'Gig economy cost analysis'],
      [3, 'Dark store burn rate', 'INR 180 Crore per quarter', 'F03/DATA_10.xlsx', 'Quick commerce P&L'],
      [4, 'Customer acquisition cost spike', 'INR 450 per user', 'F04/DOC_14.pdf', 'Marketing ROI report'],
      [5, 'Merchant commission cap impact', 'INR 92 Crore loss', 'F05/DOC_17.pdf', 'Regulatory impact memo'],
      [6, 'Key risk factor', 'Quick commerce inventory shrinkage', 'F06/DATA_22.xlsx', 'Warehouse audit'],
      [7, 'EBITDA margin shortfall', '5.6%', 'F07/DATA_25.xlsx', 'Financial summary'],
      [8, 'Hyperpure B2B margin', '3.2%', 'F08/DOC_30.pdf', 'B2B P&L statement'],
      [9, 'Ad revenue contribution', '12.4%', 'F09/DATA_33.xlsx', 'Monetization breakdown'],
      [10, 'Take rate percentage', '19.8%', 'F10/DOC_38.pdf', 'Merchant take rate report'],
      [11, 'Churn rate percentage', '8.4%', 'F11/DATA_41.xlsx', 'User retention cohort'],
      [12, 'Final War-Room Assessment', 'Three structural weaknesses across Blinkit, Delivery fleet and Merchant take rate', 'F12/DOC_45.pdf', 'War room report']
    ]
  },
  {
    fileName: 'Dior_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    rows: [
      ['Question ID', 'Question Text', 'Master Key Answer', 'Evidence Path', 'Notes'],
      [1, 'FY23-FY26 Revenue CAGR', '11.2%', 'F01/DATA_01.xlsx', 'Luxury division financial model'],
      [2, 'Leather goods supply chain delay', '28 Days', 'F02/DOC_06.pdf', 'Tuscany tannery audit'],
      [3, 'Grey market parallel export leakage', 'EUR 85 Million', 'F03/DATA_10.xlsx', 'Wholesale audit report'],
      [4, 'Couture atelier cost variance', '16.5%', 'F04/DOC_14.pdf', 'Cost accounting sheet'],
      [5, 'Asia Pacific retail sales decline', '14.2%', 'F05/DOC_17.pdf', 'Regional revenue breakdown'],
      [6, 'Inventory write-down amount', 'EUR 42 Million', 'F06/DATA_22.xlsx', 'Obsolete stock audit'],
      [7, 'Boutique rental escalation rate', '8.9%', 'F07/DATA_25.xlsx', 'Real estate lease log'],
      [8, 'Fragrance marketing expense ratio', '24.5%', 'F08/DOC_30.pdf', 'Advertising expense breakdown'],
      [9, 'VIP client retention rate', '82.4%', 'F09/DATA_33.xlsx', 'Clienteling report'],
      [10, 'Supply chain ESG audit failure count', '3 Facilities', 'F10/DOC_38.pdf', 'Compliance audit note'],
      [11, 'Gross margin percentage', '68.5%', 'F11/DATA_41.xlsx', 'Gross margin schedule'],
      [12, 'Final War-Room Assessment', 'Three structural weaknesses in parallel trade, Asia sales and atelier costs', 'F12/DOC_45.pdf', 'Executive assessment']
    ]
  },
  {
    fileName: 'Cloudflare_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    rows: [
      ['Question ID', 'Question Text', 'Master Key Answer', 'Evidence Path', 'Notes'],
      [1, 'FY23-FY26 Revenue CAGR', '28.5%', 'F01/DATA_01.xlsx', 'SaaS subscription model'],
      [2, 'Enterprise customer dollar-based net retention rate', '115%', 'F02/DOC_06.pdf', 'Retention metric report'],
      [3, 'Bandwidth egress cost overrun', 'USD 38 Million', 'F03/DATA_10.xlsx', 'Network transit invoice log'],
      [4, 'Zero Trust platform adoption delay', '3 Months', 'F04/DOC_14.pdf', 'Product roadmap audit'],
      [5, 'Key enterprise contract loss value', 'USD 14.5 Million', 'F05/DOC_17.pdf', 'Sales pipeline log'],
      [6, 'Global network uptime SLA breach', '99.91%', 'F06/DATA_22.xlsx', 'NOC incident report'],
      [7, 'R2 Storage gross margin', '48.2%', 'F07/DATA_25.xlsx', 'Storage margin schedule'],
      [8, 'Sales & marketing expense percentage of revenue', '46.0%', 'F08/DOC_30.pdf', 'Operating expense report'],
      [9, 'Free tier bandwidth cost burden', 'USD 52 Million', 'F09/DATA_33.xlsx', 'Free tier cost breakdown'],
      [10, 'Channel partner contribution share', '28.0%', 'F10/DOC_38.pdf', 'Partner revenue report'],
      [11, 'Workers KV latency P99 spike', '45 ms', 'F11/DATA_41.xlsx', 'Latency benchmark log'],
      [12, 'Final War-Room Assessment', 'Three structural weaknesses across egress transit, free-tier burden and sales expense', 'F12/DOC_45.pdf', 'War room summary']
    ]
  }
];

// Write Round 1 Master Keys
r1Keys.forEach(k => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(k.rows);
  XLSX.utils.book_append_sheet(wb, ws, '12 Questions');
  const targetPath = path.join(process.cwd(), 'case_folders/round_1', k.fileName);
  XLSX.writeFile(wb, targetPath);
  console.log(`Created Round 1 Master Key: ${targetPath}`);
});

// Write Round 2 Master Keys
r2Keys.forEach(k => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(k.rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Question Key');
  const targetPath = path.join(process.cwd(), 'case_folders/round_2', k.fileName);
  XLSX.writeFile(wb, targetPath);
  console.log(`Created Round 2 Master Key: ${targetPath}`);
});

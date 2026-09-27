export type AnswerType = 
  | "PERCENTAGE"
  | "NUMBER"
  | "SHORT_TEXT"
  | "COMPANY"
  | "CODE"
  | "LOCATION"
  | "CURRENCY"
  | "DATE"
  | "PERSON"
  | "CHAIN"
  | "MULTI_SELECT"
  | "OPEN_ENDED";

export interface QuestionItem {
  id: string;
  num: number;
  question: string;
  text?: string;
  placeholder: string;
  type: "text" | "textarea" | "multiselect" | AnswerType;
  answer_type: AnswerType;
  unit?: string;
  format_hint?: string;
  options?: string[];
  max_choices?: number;
  maxSelect?: number;
  expected_answer?: string;
  expectedAnswer?: string | string[];
  accepted_aliases?: string[];
  acceptedAliases?: string[];
  marks?: number;
}

export const ROUND_1_QUESTIONS: QuestionItem[] = [
  {
    id: "q1",
    num: 1,
    question: "1. What is the full name of the mystery company?",
    placeholder: "Full company name...",
    type: "text",
    answer_type: "COMPANY",
    expected_answer: "Mystery Company",
    accepted_aliases: []
  },
  {
    id: "q2",
    num: 2,
    question: "2. Who is the founder / founding chairman identified through the personnel trail?",
    placeholder: "Founder / founding chairman name...",
    type: "text",
    answer_type: "SHORT_TEXT",
    expected_answer: "Founder Name",
    accepted_aliases: []
  },
  {
    id: "q3",
    num: 3,
    question: "3. What employee/founder ID connects that person to the transaction history?",
    placeholder: "Employee / Founder ID (e.g. EMP-XXX)...",
    type: "text",
    answer_type: "CODE",
    expected_answer: "EMP-001",
    accepted_aliases: ["EMP001", "EMP-01"]
  },
  {
    id: "q4",
    num: 4,
    question: "4. Which city and country are recorded as the founder's base?",
    placeholder: "e.g. Seoul, South Korea...",
    type: "text",
    answer_type: "LOCATION",
    expected_answer: "Base Location",
    accepted_aliases: []
  },
  {
    id: "q5",
    num: 5,
    question: "5. From which city and country did the traced founder-linked transaction originate?",
    placeholder: "City, Country...",
    type: "text",
    answer_type: "LOCATION",
    expected_answer: "Transaction Origin",
    accepted_aliases: []
  },
  {
    id: "q6",
    num: 6,
    question: "6. What was the exact amount of the traced transaction?",
    placeholder: "Transaction amount...",
    type: "text",
    answer_type: "CURRENCY",
    expected_answer: "Amount",
    accepted_aliases: []
  },
  {
    id: "q7",
    num: 7,
    question: "7. What was the stated purpose of that transaction, and what two component categories were involved?",
    placeholder: "Stated purpose and 2 component categories...",
    type: "textarea",
    answer_type: "OPEN_ENDED",
    expected_answer: "Purpose",
    accepted_aliases: []
  },
  {
    id: "q8",
    num: 8,
    question: "8. What purchase-order number connects the powertrain procurement to the Indian manufacturing project?",
    placeholder: "Purchase Order PO-XXX...",
    type: "text",
    answer_type: "CODE",
    expected_answer: "PO Number",
    accepted_aliases: []
  },
  {
    id: "q9",
    num: 9,
    question: "9. Which Indian manufacturing facility was the receiving destination, and what nearby city does the record identify?",
    placeholder: "Facility name and nearby city...",
    type: "text",
    answer_type: "LOCATION",
    expected_answer: "Facility Location",
    accepted_aliases: []
  },
  {
    id: "q10",
    num: 10,
    question: "10. Which early vehicle program is linked to the engine/transmission trail?",
    placeholder: "Vehicle program name...",
    type: "text",
    answer_type: "SHORT_TEXT",
    expected_answer: "Vehicle Program",
    accepted_aliases: []
  },
  {
    id: "q11",
    num: 11,
    question: "11. In what year was the mystery company established?",
    placeholder: "Year (e.g. 1967)...",
    type: "text",
    answer_type: "NUMBER",
    expected_answer: "Establishment Year",
    accepted_aliases: []
  },
  {
    id: "q12",
    num: 12,
    question: "12. What was the company's first car launched in India, and in what year was it launched?",
    placeholder: "Model name and launch year...",
    type: "text",
    answer_type: "SHORT_TEXT",
    expected_answer: "First Car Launch",
    accepted_aliases: []
  }
];

// HYUNDAI ROUND 2
export const HYUNDAI_R2_QUESTIONS: QuestionItem[] = [
  {
    id: "r2_q1",
    num: 1,
    question: "What is the FY23–FY26 revenue CAGR?",
    text: "What is the FY23–FY26 revenue CAGR?",
    placeholder: "e.g. 5.5%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "5.5%",
    expectedAnswer: "5.5%",
    accepted_aliases: ["5.5%", "5.5", "5.50%", "5.47%", "5.47"],
    acceptedAliases: ["5.5%", "5.5", "5.50%", "5.47%", "5.47"]
  },
  {
    id: "r2_q2",
    num: 2,
    question: "What is the FY25→FY26 EBITDA margin decline?",
    text: "What is the FY25→FY26 EBITDA margin decline?",
    placeholder: "e.g. 0.79",
    type: "NUMBER",
    answer_type: "NUMBER",
    unit: "percentage points",
    format_hint: "(percentage points)",
    marks: 1,
    expected_answer: "0.79",
    expectedAnswer: "0.79",
    accepted_aliases: ["0.79", "0.79 percentage points", "0.79%", "0.8", "0.79pp"],
    acceptedAliases: ["0.79", "0.79 percentage points", "0.79%", "0.8", "0.79pp"]
  },
  {
    id: "r2_q3",
    num: 3,
    question: "Which expense category increased most?",
    text: "Which expense category increased most?",
    placeholder: "Category name...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Digital",
    expectedAnswer: "Digital",
    accepted_aliases: ["Digital", "Digital marketing", "Digital expense", "Digital Advertising"],
    acceptedAliases: ["Digital", "Digital marketing", "Digital expense", "Digital Advertising"]
  },
  {
    id: "r2_q4",
    num: 4,
    question: "Which competitor gained most market share?",
    text: "Which competitor gained most market share?",
    placeholder: "Competitor name...",
    type: "COMPANY",
    answer_type: "COMPANY",
    marks: 1,
    expected_answer: "Mahindra",
    expectedAnswer: "Mahindra",
    accepted_aliases: ["Mahindra", "Mahindra & Mahindra", "M&M", "Mahindra Motors"],
    acceptedAliases: ["Mahindra", "Mahindra & Mahindra", "M&M", "Mahindra Motors"]
  },
  {
    id: "r2_q5",
    num: 5,
    question: "Which vehicle category carried premium?",
    text: "Which vehicle category carried premium?",
    placeholder: "Category...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Mass EV",
    expectedAnswer: "Mass EV",
    accepted_aliases: ["Mass EV", "Mass-EV", "EV", "Mass Electric Vehicle"],
    acceptedAliases: ["Mass EV", "Mass-EV", "EV", "Mass Electric Vehicle"]
  },
  {
    id: "r2_q6",
    num: 6,
    question: "Which project consumed largest share of FY26 CAPEX?",
    text: "Which project consumed largest share of FY26 CAPEX?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "TLE-02",
    expectedAnswer: "TLE-02",
    accepted_aliases: ["TLE-02", "TLE02", "TLE 02"],
    acceptedAliases: ["TLE-02", "TLE02", "TLE 02"]
  },
  {
    id: "r2_q7",
    num: 7,
    question: "What % FY26 CAPEX did TLE-02 consume?",
    text: "What % FY26 CAPEX did TLE-02 consume?",
    placeholder: "e.g. 46.25%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "46.25%",
    expectedAnswer: "46.25%",
    accepted_aliases: ["46.25%", "46.25", "46.3%", "46.2%"],
    acceptedAliases: ["46.25%", "46.25", "46.3%", "46.2%"]
  },
  {
    id: "r2_q8",
    num: 8,
    question: "Which project had largest ROI gap?",
    text: "Which project had largest ROI gap?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "EV-35",
    expectedAnswer: "EV-35",
    accepted_aliases: ["EV-35", "EV35", "EV 35"],
    acceptedAliases: ["EV-35", "EV35", "EV 35"]
  },
  {
    id: "r2_q9",
    num: 9,
    question: "Which site shows low utilization/high inventory days?",
    text: "Which site shows low utilization/high inventory days?",
    placeholder: "Site name...",
    type: "LOCATION",
    answer_type: "LOCATION",
    marks: 1,
    expected_answer: "Talegaon",
    expectedAnswer: "Talegaon",
    accepted_aliases: ["Talegaon", "Talegaon plant", "Talegaon site"],
    acceptedAliases: ["Talegaon", "Talegaon plant", "Talegaon site"]
  },
  {
    id: "r2_q10",
    num: 10,
    question: "Top five customers contribute what % FY26 revenue?",
    text: "Top five customers contribute what % FY26 revenue?",
    placeholder: "e.g. 16.5%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "16.5%",
    expectedAnswer: "16.5%",
    accepted_aliases: ["16.5%", "16.5", "16.50%", "16.46%", "16.46"],
    acceptedAliases: ["16.5%", "16.5", "16.50%", "16.46%", "16.46"]
  },
  {
    id: "r2_q11",
    num: 11,
    question: "Which product family has largest GM→CM gap?",
    text: "Which product family has largest GM→CM gap?",
    placeholder: "Product family...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "EV",
    expectedAnswer: "EV",
    accepted_aliases: ["EV", "Electric Vehicles", "Electric Vehicle", "Mass EV"],
    acceptedAliases: ["EV", "Electric Vehicles", "Electric Vehicle", "Mass EV"]
  },
  {
    id: "r2_q12",
    num: 12,
    question: "Select THREE evidence-backed weaknesses:",
    text: "Select THREE evidence-backed weaknesses:",
    placeholder: "Select 3 evidence-backed weaknesses...",
    type: "MULTI_SELECT",
    answer_type: "MULTI_SELECT",
    max_choices: 3,
    maxSelect: 3,
    marks: 3,
    options: [
      "margin deterioration",
      "concentrated CAPEX",
      "underutilized capacity",
      "inventory inefficiency",
      "EV investment ROI gap",
      "competitive pressure",
      "customer concentration"
    ],
    expected_answer: "margin deterioration, concentrated CAPEX, underutilized capacity",
    expectedAnswer: ["margin deterioration", "concentrated CAPEX", "underutilized capacity"],
    accepted_aliases: [
      "margin deterioration",
      "concentrated CAPEX",
      "underutilized capacity",
      "inventory inefficiency",
      "EV investment ROI gap",
      "competitive pressure",
      "customer concentration"
    ],
    acceptedAliases: [
      "margin deterioration",
      "concentrated CAPEX",
      "underutilized capacity",
      "inventory inefficiency",
      "EV investment ROI gap",
      "competitive pressure",
      "customer concentration"
    ]
  }
];

// ETERNAL LTD ROUND 2
export const ETERNAL_R2_QUESTIONS: QuestionItem[] = [
  {
    id: "r2_q1",
    num: 1,
    question: "What is the FY23–FY26 revenue CAGR?",
    text: "What is the FY23–FY26 revenue CAGR?",
    placeholder: "e.g. 21.7%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "21.7%",
    expectedAnswer: "21.7%",
    accepted_aliases: ["21.7%", "21.7", "21.70%"],
    acceptedAliases: ["21.7%", "21.7", "21.70%"]
  },
  {
    id: "r2_q2",
    num: 2,
    question: "What is the FY25→FY26 EBITDA margin decline?",
    text: "What is the FY25→FY26 EBITDA margin decline?",
    placeholder: "e.g. 1.9",
    type: "NUMBER",
    answer_type: "NUMBER",
    unit: "percentage points",
    format_hint: "(percentage points)",
    marks: 1,
    expected_answer: "1.9",
    expectedAnswer: "1.9",
    accepted_aliases: ["1.9", "1.9 percentage points", "1.9%", "1.9 percentage point"],
    acceptedAliases: ["1.9", "1.9 percentage points", "1.9%", "1.9 percentage point"]
  },
  {
    id: "r2_q3",
    num: 3,
    question: "Which expense category increased most?",
    text: "Which expense category increased most?",
    placeholder: "Category name...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "VoltAxis",
    expectedAnswer: "VoltAxis",
    accepted_aliases: ["VoltAxis", "Volt Axis"],
    acceptedAliases: ["VoltAxis", "Volt Axis"]
  },
  {
    id: "r2_q4",
    num: 4,
    question: "Which competitor gained most market share?",
    text: "Which competitor gained most market share?",
    placeholder: "Competitor name...",
    type: "COMPANY",
    answer_type: "COMPANY",
    marks: 1,
    expected_answer: "EV Charging",
    expectedAnswer: "EV Charging",
    accepted_aliases: ["EV Charging", "EV-Charging"],
    acceptedAliases: ["EV Charging", "EV-Charging"]
  },
  {
    id: "r2_q5",
    num: 5,
    question: "Which vehicle category carried premium?",
    text: "Which vehicle category carried premium?",
    placeholder: "Category...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Digital",
    expectedAnswer: "Digital",
    accepted_aliases: ["Digital", "Digital marketing"],
    acceptedAliases: ["Digital", "Digital marketing"]
  },
  {
    id: "r2_q6",
    num: 6,
    question: "Which project consumed largest share of FY26 CAPEX?",
    text: "Which project consumed largest share of FY26 CAPEX?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "PX-ALPHA",
    expectedAnswer: "PX-ALPHA",
    accepted_aliases: ["PX-ALPHA", "PX ALPHA", "PXALPHA"],
    acceptedAliases: ["PX-ALPHA", "PX ALPHA", "PXALPHA"]
  },
  {
    id: "r2_q7",
    num: 7,
    question: "What % FY26 CAPEX did PX-ALPHA consume?",
    text: "What % FY26 CAPEX did PX-ALPHA consume?",
    placeholder: "e.g. 25.9%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "25.9%",
    expectedAnswer: "25.9%",
    accepted_aliases: ["25.9%", "25.9", "25.90%"],
    acceptedAliases: ["25.9%", "25.9", "25.90%"]
  },
  {
    id: "r2_q8",
    num: 8,
    question: "Which project had largest ROI gap?",
    text: "Which project had largest ROI gap?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "PX-ZETA",
    expectedAnswer: "PX-ZETA",
    accepted_aliases: ["PX-ZETA", "PX ZETA", "PXZETA"],
    acceptedAliases: ["PX-ZETA", "PX ZETA", "PXZETA"]
  },
  {
    id: "r2_q9",
    num: 9,
    question: "Which site shows low utilization/high inventory days?",
    text: "Which site shows low utilization/high inventory days?",
    placeholder: "Site name...",
    type: "LOCATION",
    answer_type: "LOCATION",
    marks: 1,
    expected_answer: "SITE-03 Pune",
    expectedAnswer: "SITE-03 Pune",
    accepted_aliases: ["SITE-03 Pune", "SITE-07 Ahmedabad", "SITE-03", "SITE-07", "Pune", "Ahmedabad"],
    acceptedAliases: ["SITE-03 Pune", "SITE-07 Ahmedabad", "SITE-03", "SITE-07", "Pune", "Ahmedabad"]
  },
  {
    id: "r2_q10",
    num: 10,
    question: "Top five customers contribute what % FY26 revenue?",
    text: "Top five customers contribute what % FY26 revenue?",
    placeholder: "e.g. 21.4%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "21.4%",
    expectedAnswer: "21.4%",
    accepted_aliases: ["21.4%", "21.4", "21.40%"],
    acceptedAliases: ["21.4%", "21.4", "21.40%"]
  },
  {
    id: "r2_q11",
    num: 11,
    question: "Which product family has largest GM→CM gap?",
    text: "Which product family has largest GM→CM gap?",
    placeholder: "Product family...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Grid Analytics",
    expectedAnswer: "Grid Analytics",
    accepted_aliases: ["Grid Analytics", "Grid-Analytics"],
    acceptedAliases: ["Grid Analytics", "Grid-Analytics"]
  },
  {
    id: "r2_q12",
    num: 12,
    question: "Select THREE evidence-backed weaknesses:",
    text: "Select THREE evidence-backed weaknesses:",
    placeholder: "Select 3 evidence-backed weaknesses...",
    type: "MULTI_SELECT",
    answer_type: "MULTI_SELECT",
    max_choices: 3,
    maxSelect: 3,
    marks: 3,
    options: [
      "margin pressure",
      "component/supplier dependency",
      "underutilized inventory-heavy sites",
      "weak project ROI",
      "competitive pressure",
      "customer concentration"
    ],
    expected_answer: "margin pressure, component/supplier dependency, underutilized inventory-heavy sites",
    expectedAnswer: ["margin pressure", "component/supplier dependency", "underutilized inventory-heavy sites"],
    accepted_aliases: [
      "margin pressure",
      "component/supplier dependency",
      "underutilized inventory-heavy sites",
      "weak project ROI",
      "competitive pressure",
      "customer concentration"
    ],
    acceptedAliases: [
      "margin pressure",
      "component/supplier dependency",
      "underutilized inventory-heavy sites",
      "weak project ROI",
      "competitive pressure",
      "customer concentration"
    ]
  }
];

// CLOUDFLARE ROUND 2
export const CLOUDFLARE_R2_QUESTIONS: QuestionItem[] = [
  {
    id: "r2_q1",
    num: 1,
    question: "What is the FY23–FY26 revenue CAGR?",
    text: "What is the FY23–FY26 revenue CAGR?",
    placeholder: "e.g. 42.6%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "42.6%",
    expectedAnswer: "42.6%",
    accepted_aliases: ["42.6%", "42.6", "42.60%"],
    acceptedAliases: ["42.6%", "42.6", "42.60%"]
  },
  {
    id: "r2_q2",
    num: 2,
    question: "What is the FY25→FY26 EBITDA margin decline?",
    text: "What is the FY25→FY26 EBITDA margin decline?",
    placeholder: "e.g. 2.8",
    type: "NUMBER",
    answer_type: "NUMBER",
    unit: "percentage points",
    format_hint: "(percentage points)",
    marks: 1,
    expected_answer: "2.8",
    expectedAnswer: "2.8",
    accepted_aliases: ["2.8", "2.8 percentage points", "2.8%", "2.8 percentage point"],
    acceptedAliases: ["2.8", "2.8 percentage points", "2.8%", "2.8 percentage point"]
  },
  {
    id: "r2_q3",
    num: 3,
    question: "Which expense category increased most?",
    text: "Which expense category increased most?",
    placeholder: "Category name...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Zscaler",
    expectedAnswer: "Zscaler",
    accepted_aliases: ["Zscaler"],
    acceptedAliases: ["Zscaler"]
  },
  {
    id: "r2_q4",
    num: 4,
    question: "Which competitor gained most market share?",
    text: "Which competitor gained most market share?",
    placeholder: "Competitor name...",
    type: "COMPANY",
    answer_type: "COMPANY",
    marks: 1,
    expected_answer: "Developer Platform",
    expectedAnswer: "Developer Platform",
    accepted_aliases: ["Developer Platform", "Developer-Platform"],
    acceptedAliases: ["Developer Platform", "Developer-Platform"]
  },
  {
    id: "r2_q5",
    num: 5,
    question: "Which vehicle category carried premium?",
    text: "Which vehicle category carried premium?",
    placeholder: "Category...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Transit & Peering",
    expectedAnswer: "Transit & Peering",
    accepted_aliases: ["Transit & Peering", "Transit and Peering"],
    acceptedAliases: ["Transit & Peering", "Transit and Peering"]
  },
  {
    id: "r2_q6",
    num: 6,
    question: "Which project consumed largest share of FY26 CAPEX?",
    text: "Which project consumed largest share of FY26 CAPEX?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "EDGE-47",
    expectedAnswer: "EDGE-47",
    accepted_aliases: ["EDGE-47", "EDGE47"],
    acceptedAliases: ["EDGE-47", "EDGE47"]
  },
  {
    id: "r2_q7",
    num: 7,
    question: "What % FY26 CAPEX did EDGE-47 consume?",
    text: "What % FY26 CAPEX did EDGE-47 consume?",
    placeholder: "e.g. 26.7%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "26.7%",
    expectedAnswer: "26.7%",
    accepted_aliases: ["26.7%", "26.7", "26.70%"],
    acceptedAliases: ["26.7%", "26.7", "26.70%"]
  },
  {
    id: "r2_q8",
    num: 8,
    question: "Which project had largest ROI gap?",
    text: "Which project had largest ROI gap?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "GPU-52",
    expectedAnswer: "GPU-52",
    accepted_aliases: ["GPU-52", "GPU52"],
    acceptedAliases: ["GPU-52", "GPU52"]
  },
  {
    id: "r2_q9",
    num: 9,
    question: "Which site shows low utilization/high inventory days?",
    text: "Which site shows low utilization/high inventory days?",
    placeholder: "Site name...",
    type: "LOCATION",
    answer_type: "LOCATION",
    marks: 1,
    expected_answer: "TYO-06 Tokyo Edge",
    expectedAnswer: "TYO-06 Tokyo Edge",
    accepted_aliases: ["TYO-06 Tokyo Edge", "TYO-06", "Tokyo Edge", "TYO 06"],
    acceptedAliases: ["TYO-06 Tokyo Edge", "TYO-06", "Tokyo Edge", "TYO 06"]
  },
  {
    id: "r2_q10",
    num: 10,
    question: "Top five customers contribute what % FY26 revenue?",
    text: "Top five customers contribute what % FY26 revenue?",
    placeholder: "e.g. 16.2%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "16.2%",
    expectedAnswer: "16.2%",
    accepted_aliases: ["16.2%", "16.2", "16.20%"],
    acceptedAliases: ["16.2%", "16.2", "16.20%"]
  },
  {
    id: "r2_q11",
    num: 11,
    question: "Which product family has largest GM→CM gap?",
    text: "Which product family has largest GM→CM gap?",
    placeholder: "Product family...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Network Services",
    expectedAnswer: "Network Services",
    accepted_aliases: ["Network Services", "Network-Services"],
    acceptedAliases: ["Network Services", "Network-Services"]
  },
  {
    id: "r2_q12",
    num: 12,
    question: "Select THREE evidence-backed weaknesses:",
    text: "Select THREE evidence-backed weaknesses:",
    placeholder: "Select 3 evidence-backed weaknesses...",
    type: "MULTI_SELECT",
    answer_type: "MULTI_SELECT",
    max_choices: 3,
    maxSelect: 3,
    marks: 3,
    options: [
      "infrastructure efficiency",
      "margin compression",
      "investment underperformance",
      "competitive share pressure",
      "supplier dependency",
      "customer concentration"
    ],
    expected_answer: "infrastructure efficiency, margin compression, investment underperformance",
    expectedAnswer: ["infrastructure efficiency", "margin compression", "investment underperformance"],
    accepted_aliases: [
      "infrastructure efficiency",
      "margin compression",
      "investment underperformance",
      "competitive share pressure",
      "supplier dependency",
      "customer concentration"
    ],
    acceptedAliases: [
      "infrastructure efficiency",
      "margin compression",
      "investment underperformance",
      "competitive share pressure",
      "supplier dependency",
      "customer concentration"
    ]
  }
];

// DIOR ROUND 2
export const DIOR_R2_QUESTIONS: QuestionItem[] = [
  {
    id: "r2_q1",
    num: 1,
    question: "What is the FY23–FY26 revenue CAGR?",
    text: "What is the FY23–FY26 revenue CAGR?",
    placeholder: "e.g. 6.5%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "6.5%",
    expectedAnswer: "6.5%",
    accepted_aliases: ["6.5%", "6.5", "6.50%"],
    acceptedAliases: ["6.5%", "6.5", "6.50%"]
  },
  {
    id: "r2_q2",
    num: 2,
    question: "What is the FY25→FY26 EBITDA margin decline?",
    text: "What is the FY25→FY26 EBITDA margin decline?",
    placeholder: "e.g. 2.25",
    type: "NUMBER",
    answer_type: "NUMBER",
    unit: "percentage points",
    format_hint: "(percentage points)",
    marks: 1,
    expected_answer: "2.25",
    expectedAnswer: "2.25",
    accepted_aliases: ["2.25", "2.25 percentage points", "2.25%", "2.25 percentage point"],
    acceptedAliases: ["2.25", "2.25 percentage points", "2.25%", "2.25 percentage point"]
  },
  {
    id: "r2_q3",
    num: 3,
    question: "Which expense category increased most?",
    text: "Which expense category increased most?",
    placeholder: "Category name...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "House East",
    expectedAnswer: "House East",
    accepted_aliases: ["House East", "House-East"],
    acceptedAliases: ["House East", "House-East"]
  },
  {
    id: "r2_q4",
    num: 4,
    question: "Which competitor gained most market share?",
    text: "Which competitor gained most market share?",
    placeholder: "Competitor name...",
    type: "COMPANY",
    answer_type: "COMPANY",
    marks: 1,
    expected_answer: "Jewelry & Timepieces",
    expectedAnswer: "Jewelry & Timepieces",
    accepted_aliases: ["Jewelry & Timepieces", "Jewelry and Timepieces"],
    acceptedAliases: ["Jewelry & Timepieces", "Jewelry and Timepieces"]
  },
  {
    id: "r2_q5",
    num: 5,
    question: "Which vehicle category carried premium?",
    text: "Which vehicle category carried premium?",
    placeholder: "Category...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Digital",
    expectedAnswer: "Digital",
    accepted_aliases: ["Digital", "Digital marketing"],
    acceptedAliases: ["Digital", "Digital marketing"]
  },
  {
    id: "r2_q6",
    num: 6,
    question: "Which project consumed largest share of FY26 CAPEX?",
    text: "Which project consumed largest share of FY26 CAPEX?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "AT-41",
    expectedAnswer: "AT-41",
    accepted_aliases: ["AT-41", "AT41"],
    acceptedAliases: ["AT-41", "AT41"]
  },
  {
    id: "r2_q7",
    num: 7,
    question: "What % FY26 CAPEX did AT-41 consume?",
    text: "What % FY26 CAPEX did AT-41 consume?",
    placeholder: "e.g. 23.2%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "23.2%",
    expectedAnswer: "23.2%",
    accepted_aliases: ["23.2%", "23.2", "23.20%"],
    acceptedAliases: ["23.2%", "23.2", "23.20%"]
  },
  {
    id: "r2_q8",
    num: 8,
    question: "Which project had largest ROI gap?",
    text: "Which project had largest ROI gap?",
    placeholder: "Project code...",
    type: "CODE",
    answer_type: "CODE",
    marks: 1,
    expected_answer: "AT-41",
    expectedAnswer: "AT-41",
    accepted_aliases: ["AT-41", "AT41"],
    acceptedAliases: ["AT-41", "AT41"]
  },
  {
    id: "r2_q9",
    num: 9,
    question: "Which site shows low utilization/high inventory days?",
    text: "Which site shows low utilization/high inventory days?",
    placeholder: "Site name...",
    type: "LOCATION",
    answer_type: "LOCATION",
    marks: 1,
    expected_answer: "Tokyo Retail Cluster",
    expectedAnswer: "Tokyo Retail Cluster",
    accepted_aliases: ["Tokyo Retail Cluster", "Tokyo Cluster", "Tokyo Retail"],
    acceptedAliases: ["Tokyo Retail Cluster", "Tokyo Cluster", "Tokyo Retail"]
  },
  {
    id: "r2_q10",
    num: 10,
    question: "Top five customers contribute what % FY26 revenue?",
    text: "Top five customers contribute what % FY26 revenue?",
    placeholder: "e.g. 18.7%",
    type: "PERCENTAGE",
    answer_type: "PERCENTAGE",
    unit: "%",
    format_hint: "(%)",
    marks: 1,
    expected_answer: "18.7%",
    expectedAnswer: "18.7%",
    accepted_aliases: ["18.7%", "18.7", "18.70%"],
    acceptedAliases: ["18.7%", "18.7", "18.70%"]
  },
  {
    id: "r2_q11",
    num: 11,
    question: "Which product family has largest GM→CM gap?",
    text: "Which product family has largest GM→CM gap?",
    placeholder: "Product family...",
    type: "SHORT_TEXT",
    answer_type: "SHORT_TEXT",
    marks: 1,
    expected_answer: "Beauty",
    expectedAnswer: "Beauty",
    accepted_aliases: ["Beauty"],
    acceptedAliases: ["Beauty"]
  },
  {
    id: "r2_q12",
    num: 12,
    question: "Select THREE evidence-backed weaknesses:",
    text: "Select THREE evidence-backed weaknesses:",
    placeholder: "Select 3 evidence-backed weaknesses...",
    type: "MULTI_SELECT",
    answer_type: "MULTI_SELECT",
    max_choices: 3,
    maxSelect: 3,
    marks: 3,
    options: [
      "margin pressure",
      "capital inefficiency",
      "utilization/WIP",
      "competitive pressure",
      "customer concentration",
      "people/service risk"
    ],
    expected_answer: "margin pressure, capital inefficiency, utilization/WIP",
    expectedAnswer: ["margin pressure", "capital inefficiency", "utilization/WIP"],
    accepted_aliases: [
      "margin pressure",
      "capital inefficiency",
      "utilization/WIP",
      "competitive pressure",
      "customer concentration",
      "people/service risk"
    ],
    acceptedAliases: [
      "margin pressure",
      "capital inefficiency",
      "utilization/WIP",
      "competitive pressure",
      "customer concentration",
      "people/service risk"
    ]
  }
];


export function getRound2QuestionsForCase(caseId: string): QuestionItem[] {
  if (!caseId) return [];
  const norm = caseId.toLowerCase().trim();
  if (norm === 'dior' || norm.includes('dior') || norm === 'case-03' || norm === 'case-r1-dior' || norm === 'case-r2-dior') return DIOR_R2_QUESTIONS;
  if (norm === 'eternal' || norm.includes('eternal') || norm === 'case-02' || norm === 'case-r1-eternal' || norm === 'case-r2-eternal') return ETERNAL_R2_QUESTIONS;
  if (norm === 'cloudflare' || norm.includes('cloudflare') || norm.includes('cf') || norm === 'case-04' || norm === 'case-r1-cf' || norm === 'case-r2-cloudflare') return CLOUDFLARE_R2_QUESTIONS;
  if (norm === 'hyundai' || norm.includes('hyundai') || norm.includes('hyndai') || norm === 'case-01' || norm === 'case-r1-hyundai' || norm === 'case-r2-hyundai' || norm === 'case-r2-01') return HYUNDAI_R2_QUESTIONS;
  return [];
}


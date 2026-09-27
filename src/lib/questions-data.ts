export interface QuestionItem {
  id: string;
  num: number;
  question: string;
  placeholder: string;
  type: "text" | "textarea";
}

export const ROUND_1_QUESTIONS: QuestionItem[] = [
  {
    id: "q1",
    num: 1,
    question: "1. What is the full name of the mystery company?",
    placeholder: "Full company name...",
    type: "text"
  },
  {
    id: "q2",
    num: 2,
    question: "2. Who is the founder / founding chairman identified through the personnel trail?",
    placeholder: "Founder / founding chairman name...",
    type: "text"
  },
  {
    id: "q3",
    num: 3,
    question: "3. What employee/founder ID connects that person to the transaction history?",
    placeholder: "Employee / Founder ID (e.g. EMP-XXX)...",
    type: "text"
  },
  {
    id: "q4",
    num: 4,
    question: "4. Which city and country are recorded as the founder's base?",
    placeholder: "e.g. Seoul, South Korea...",
    type: "text"
  },
  {
    id: "q5",
    num: 5,
    question: "5. From which city and country did the traced founder-linked transaction originate?",
    placeholder: "City, Country...",
    type: "text"
  },
  {
    id: "q6",
    num: 6,
    question: "6. What was the exact amount of the traced transaction?",
    placeholder: "e.g. $1,250,000 / ₩...",
    type: "text"
  },
  {
    id: "q7",
    num: 7,
    question: "7. What was the stated purpose of that transaction, and what two component categories were involved?",
    placeholder: "Stated purpose and 2 component categories...",
    type: "textarea"
  },
  {
    id: "q8",
    num: 8,
    question: "8. What purchase-order number connects the powertrain procurement to the Indian manufacturing project?",
    placeholder: "Purchase Order PO-XXX...",
    type: "text"
  },
  {
    id: "q9",
    num: 9,
    question: "9. Which Indian manufacturing facility was the receiving destination, and what nearby city does the record identify?",
    placeholder: "Facility name and nearby city...",
    type: "text"
  },
  {
    id: "q10",
    num: 10,
    question: "10. Which early vehicle program is linked to the engine/transmission trail?",
    placeholder: "Vehicle program name...",
    type: "text"
  },
  {
    id: "q11",
    num: 11,
    question: "11. In what year was the mystery company established?",
    placeholder: "Year (e.g. 1967)...",
    type: "text"
  },
  {
    id: "q12",
    num: 12,
    question: "12. What was the company's first car launched in India, and in what year was it launched?",
    placeholder: "Model name and launch year...",
    type: "text"
  }
];

export const ROUND_2_QUESTIONS: QuestionItem[] = [
  {
    id: "r2_q1",
    num: 1,
    question: "Q1. Using the revenue series supplied in the financial model, calculate the FY23-FY26 revenue CAGR. Give percentage to one decimal place.",
    placeholder: "CAGR percentage (e.g. 14.5%)...",
    type: "text"
  },
  {
    id: "r2_q2",
    num: 2,
    question: "Q2. Calculate the change in EBITDA margin from FY25 to FY26 in percentage points. Identify largest expense category increase.",
    placeholder: "Margin change in pp & largest expense category...",
    type: "textarea"
  },
  {
    id: "r2_q3",
    num: 3,
    question: "Q3. Identify the competitor with the largest FY24-Q1 to FY26-Q4 share gain in percentage points.",
    placeholder: "Competitor name & share gain in pp...",
    type: "text"
  },
  {
    id: "r2_q4",
    num: 4,
    question: "Q4. Identify product category with largest price premium vs competitor & overlapping competitor launch event.",
    placeholder: "Product category & competitor launch event...",
    type: "textarea"
  },
  {
    id: "r2_q5",
    num: 5,
    question: "Q5. Spending category with largest YoY increase in FY26 vs FY25 (Totals & percentage increase).",
    placeholder: "Spending category, FY25 & FY26 totals, % increase...",
    type: "textarea"
  },
  {
    id: "r2_q6",
    num: 6,
    question: "Q6. Capital project consuming largest share of FY26 CAPEX (% of total FY26 CAPEX).",
    placeholder: "Capital project name & % of total CAPEX...",
    type: "text"
  },
  {
    id: "r2_q7",
    num: 7,
    question: "Q7. Trace major payment: Transaction ID, project code, vendor ID, PO number, supplier country, destination/site, purpose.",
    placeholder: "Full payment evidence trail details...",
    type: "textarea"
  },
  {
    id: "r2_q8",
    num: 8,
    question: "Q8. Strategic investment with largest expected vs actual ROI gap (Expected ROI, actual ROI, gap in pp).",
    placeholder: "Strategic investment, expected ROI, actual ROI, gap...",
    type: "textarea"
  },
  {
    id: "r2_q9",
    num: 9,
    question: "Q9. Operating site with low utilization & high inventory days. Share of modeled FY26 capacity.",
    placeholder: "Operating site & capacity share %...",
    type: "text"
  },
  {
    id: "r2_q10",
    num: 10,
    question: "Q10. Percentage of FY26 revenue contributed by top 5 customers & customer with highest service/churn risk.",
    placeholder: "% revenue share & highest churn risk customer...",
    type: "textarea"
  },
  {
    id: "r2_q11",
    num: 11,
    question: "Q11. Product family with largest gap between gross margin and contribution margin (Margins & cost component).",
    placeholder: "Product family, gross margin, contribution margin, cost component...",
    type: "textarea"
  },
  {
    id: "r2_q12",
    num: 12,
    question: "Q12. FINAL WAR-ROOM ASSESSMENT: 3 structural weaknesses with metrics & evidence spanning >= 4 files across >= 3 folders.",
    placeholder: "3 structural weaknesses, metrics, and evidence chain...",
    type: "textarea"
  }
];

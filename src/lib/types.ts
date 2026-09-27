export type RoundStatus = "NOT_STARTED" | "ACTIVE" | "PAUSED" | "ENDED" | "LOCKED";

export const EVENT_CONFIG = {
  STARTING_PRIZE: 2000,
  ROUND_DURATION_MINS: 30
};

export type FolderType = 
  | "FINANCIAL"
  | "MARKETING"
  | "OPERATIONS"
  | "PRODUCTS"
  | "PEOPLE"
  | "MARKET"
  | "ARCHIVE"
  | "MISC";

export type FileType = "PDF" | "XLSX" | "CSV" | "PNG" | "JPG" | "TXT";

export interface EvidenceFile {
  id: string;
  folder_id: string;
  filename: string;
  file_type: FileType;
  file_size: string;
  date: string;
  evidence_id?: string;
  relevance?: string;
  content_type: "table" | "pdf" | "image" | "text";
  data_json?: any; // For spreadsheets/tables
  content?: string; // For text/PDF content
  image_url?: string; // For images
}

export interface CaseFolder {
  id: string;
  case_id: string;
  name: string;
  folder_type: FolderType;
  item_count: number;
  last_modified: string;
  description: string;
  files: EvidenceFile[];
}

export interface CaseConfig {
  id: string;
  round_number: 1 | 2;
  title: string;
  description: string;
  correct_company?: string;
  correct_industry?: string;
  correct_hq?: string;
  correct_primary_product?: string;
  correct_additional_fact?: string;
  accepted_company_variants?: string[];
  accepted_industry_variants?: string[];
  accepted_hq_variants?: string[];
  accepted_product_variants?: string[];
  accepted_fact_variants?: string[];
  
  // Round 2 attributes
  r2_what_happened?: string;
  r2_responsible_party?: string;
  r2_financial_impact?: string;
  r2_key_evidence?: string;
  hint_text?: string;
  active: boolean;
}

export interface Team {
  id: string;
  team_code: string;
  name: string;
  member1_name: string;
  member2_name: string;
  access_code: string;
  assigned_case_id_r1: string;
  assigned_case_id_r2?: string;
  status: "REGISTERED" | "R1_IN_PROGRESS" | "R1_COMPLETE" | "R2_IN_PROGRESS" | "R2_SUBMITTED";
  created_at: string;
}

export interface EventState {
  id: string;
  round1_status: RoundStatus;
  round1_start_time: string | null;
  round1_duration_mins: number;
  round1_paused_elapsed_sec?: number;
  round2_status: RoundStatus;
  round2_start_time: string | null;
  round2_duration_mins: number;
  round2_paused_elapsed_sec?: number;
  starting_prize: number;
  current_prize: number;
  updated_at: string;
}

export interface Submission {
  id: string;
  team_id: string;
  team_code: string;
  round_number: 1 | 2;
  answers: Record<string, string>;
  is_correct: boolean;
  score?: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  submitted_at: string;
  remaining_prize: number;
  attempt_number: number;
  time_taken_seconds: number;
}

export interface AuditLog {
  id: string;
  team_code: string;
  action: string;
  details: string;
  timestamp: string;
}

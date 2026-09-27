-- ============================================================================
-- ZODIAC COMPETITION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_code TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    member1_name TEXT NOT NULL,
    member2_name TEXT NOT NULL,
    access_code TEXT NOT NULL,
    assigned_case_id_r1 TEXT NOT NULL DEFAULT 'case-r1-hyundai',
    assigned_case_id_r2 TEXT NOT NULL DEFAULT 'case-r2-hyundai',
    status TEXT NOT NULL DEFAULT 'REGISTERED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event State Table (Singleton Row for Event Control)
CREATE TABLE IF NOT EXISTS public.event_state (
    id TEXT PRIMARY KEY DEFAULT 'evt-001',
    round1_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    round1_start_time TIMESTAMPTZ,
    round1_duration_mins INT DEFAULT 30,
    round1_paused_elapsed_sec INT DEFAULT 0,
    round2_status TEXT NOT NULL DEFAULT 'LOCKED',
    round2_start_time TIMESTAMPTZ,
    round2_duration_mins INT DEFAULT 30,
    round2_paused_elapsed_sec INT DEFAULT 0,
    starting_prize INT DEFAULT 2000,
    current_prize INT DEFAULT 2000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Event State if empty
INSERT INTO public.event_state (id, round1_status, round2_status, round1_duration_mins, round2_duration_mins, starting_prize, current_prize)
VALUES ('evt-001', 'NOT_STARTED', 'LOCKED', 30, 30, 2000, 2000)
ON CONFLICT (id) DO UPDATE SET starting_prize = 2000, current_prize = 2000;

-- 4. Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY,
    round_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    folder_path TEXT,
    hint_text TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Case Folders Table
CREATE TABLE IF NOT EXISTS public.case_folders (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES public.cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    folder_type TEXT DEFAULT 'MISC',
    item_count INT DEFAULT 0,
    last_modified TEXT,
    description TEXT
);

-- 6. Evidence Files Table
CREATE TABLE IF NOT EXISTS public.evidence_files (
    id TEXT PRIMARY KEY,
    folder_id TEXT REFERENCES public.case_folders(id) ON DELETE CASCADE,
    case_id TEXT REFERENCES public.cases(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size TEXT,
    date TEXT,
    evidence_id TEXT,
    content_type TEXT NOT NULL,
    content TEXT,
    data_json JSONB,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT NOT NULL,
    team_code TEXT REFERENCES public.teams(team_code) ON DELETE CASCADE,
    round_number INT NOT NULL,
    answers JSONB NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING',
    remaining_prize INT DEFAULT 0,
    attempt_number INT DEFAULT 1,
    time_taken_seconds INT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Admin Score Overrides Table
CREATE TABLE IF NOT EXISTS public.admin_overrides (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_code TEXT REFERENCES public.teams(team_code) ON DELETE CASCADE,
    round_number INT NOT NULL,
    override_score INT NOT NULL,
    feedback TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_code TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Event State: Read-only for public anon clients; writes restricted to service_role
CREATE POLICY "Allow public read of event_state" ON public.event_state FOR SELECT USING (true);

-- 2. Cases and Case Folders: Read-only for display
CREATE POLICY "Allow public read of cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Allow public read of case_folders" ON public.case_folders FOR SELECT USING (true);

-- 3. Teams: Allow public registration insertion
CREATE POLICY "Allow public registration" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access to teams" ON public.teams FOR ALL USING (true);

-- 4. Submissions: Mediated through backend API service_role
CREATE POLICY "Allow service role access to submissions" ON public.submissions FOR ALL USING (true);

-- 5. Audit Logs: Service role access
CREATE POLICY "Allow service role access to audit_logs" ON public.audit_logs FOR ALL USING (true);

-- Enable Realtime for event_state, submissions, teams, audit_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

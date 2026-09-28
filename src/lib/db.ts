import fs from 'fs';
import path from 'path';
import { EventState, Team, CaseFolder, EvidenceFile, CaseConfig, Submission, AuditLog, EVENT_CONFIG } from './types';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import {
  INITIAL_CASES_EXPANDED,
  generateFoldersForCase01,
  generateFoldersForCase02,
  generateFoldersForCase03,
  generateFoldersForCase04,
  generateFoldersForCase05,
  generateFoldersForCaseR2_01
} from './cases-data';
import { loadActualParticipantCaseFolders } from './case-file-loader';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'casefiles_store.json');

interface SchemaData {
  eventState: EventState;
  teams: Team[];
  cases: CaseConfig[];
  folders: CaseFolder[];
  submissions: Submission[];
  auditLogs: AuditLog[];
}

const INITIAL_EVENT_STATE: EventState = {
  id: "evt-001",
  round1_status: "NOT_STARTED",
  round1_start_time: null,
  round1_ends_at: null,
  round1_duration_mins: EVENT_CONFIG.ROUND_DURATION_MINS,
  round1_paused_elapsed_sec: 0,
  round2_status: "LOCKED" as any,
  round2_start_time: null,
  round2_ends_at: null,
  round2_duration_mins: EVENT_CONFIG.ROUND_DURATION_MINS,
  round2_paused_elapsed_sec: 0,
  starting_prize: EVENT_CONFIG.STARTING_PRIZE,
  current_prize: EVENT_CONFIG.STARTING_PRIZE,
  updated_at: new Date().toISOString()
};

let cachedInitialFolders: CaseFolder[] | null = null;

function getAllInitialFolders(): CaseFolder[] {
  if (cachedInitialFolders && cachedInitialFolders.length > 0) {
    return cachedInitialFolders;
  }
  const r1Folders = loadActualParticipantCaseFolders(1);
  const r2Folders = loadActualParticipantCaseFolders(2);
  if (r1Folders.length > 0 || r2Folders.length > 0) {
    cachedInitialFolders = [...r1Folders, ...r2Folders];
    return cachedInitialFolders;
  }
  cachedInitialFolders = [
    ...generateFoldersForCase01(),
    ...generateFoldersForCase02(),
    ...generateFoldersForCase03(),
    ...generateFoldersForCase04(),
    ...generateFoldersForCase05(),
    ...generateFoldersForCaseR2_01()
  ];
  return cachedInitialFolders;
}

const defaultData: SchemaData = {
  eventState: INITIAL_EVENT_STATE,
  teams: [],
  cases: INITIAL_CASES_EXPANDED,
  folders: getAllInitialFolders(),
  submissions: [],
  auditLogs: []
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData(): SchemaData {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
      saveData(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as SchemaData;
    
    if (!parsed.cases || parsed.cases.length < 6) {
      parsed.cases = INITIAL_CASES_EXPANDED;
      parsed.folders = getAllInitialFolders();
      saveData(parsed);
    }

    if (parsed.eventState.starting_prize !== EVENT_CONFIG.STARTING_PRIZE) {
      parsed.eventState.starting_prize = EVENT_CONFIG.STARTING_PRIZE;
      parsed.eventState.current_prize = EVENT_CONFIG.STARTING_PRIZE;
      saveData(parsed);
    }

    return parsed;
  } catch (err) {
    saveData(defaultData);
    return defaultData;
  }
}

function saveData(data: SchemaData) {
  try {
    ensureDataDir();
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

export const db = {
  async getEventState(): Promise<EventState> {
    let state: EventState;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('event_state').select('*').single();
      if (data && !error) {
        state = data as EventState;
      } else if (process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase query failed for event_state: ${error?.message}`);
      } else {
        const fileData = loadData();
        state = fileData.eventState;
      }
    } else {
      const fileData = loadData();
      state = fileData.eventState;
    }

    state = this.calculateLivePrize(state);

    if (state.round1_start_time && !state.round1_ends_at) {
      const dur = (state.round1_duration_mins || EVENT_CONFIG.ROUND_DURATION_MINS) * 60 * 1000;
      state.round1_ends_at = new Date(new Date(state.round1_start_time).getTime() + dur).toISOString();
    }
    if (state.round2_start_time && !state.round2_ends_at) {
      const dur = (state.round2_duration_mins || EVENT_CONFIG.ROUND_DURATION_MINS) * 60 * 1000;
      state.round2_ends_at = new Date(new Date(state.round2_start_time).getTime() + dur).toISOString();
    }

    // Auto-end rounds if current server time >= round_ends_at
    const now = Date.now();
    if (state.round1_status === 'ACTIVE' && state.round1_ends_at && now >= new Date(state.round1_ends_at).getTime()) {
      return await this.updateEventState({ round1_status: 'ENDED' });
    }
    if (state.round2_status === 'ACTIVE' && state.round2_ends_at && now >= new Date(state.round2_ends_at).getTime()) {
      return await this.updateEventState({ round2_status: 'ENDED', current_prize: 0 });
    }

    return state;
  },

  calculateLivePrize(state: EventState): EventState {
    const basePrize = EVENT_CONFIG.STARTING_PRIZE;
    if (state.round2_status !== 'ACTIVE' || !state.round2_start_time) {
      if (state.round2_status === 'ENDED') {
        state.current_prize = 0;
      } else {
        state.current_prize = basePrize;
      }
      state.starting_prize = basePrize;
      return state;
    }

    const totalSec = (state.round2_duration_mins || EVENT_CONFIG.ROUND_DURATION_MINS) * 60;
    let elapsedSec = state.round2_paused_elapsed_sec || 0;

    if (state.round2_status === 'ACTIVE' && state.round2_start_time) {
      const activeWindowSec = Math.max(0, (Date.now() - new Date(state.round2_start_time).getTime()) / 1000);
      elapsedSec += activeWindowSec;
    }

    if (elapsedSec >= totalSec) {
      state.current_prize = 0;
    } else {
      const ratio = elapsedSec / totalSec;
      state.current_prize = Math.max(0, Math.round(basePrize * (1 - ratio)));
    }

    state.starting_prize = basePrize;
    return state;
  },

  async updateEventState(updates: Partial<EventState>): Promise<EventState> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { round1_ends_at, round2_ends_at, server_now, ...supabasePayload } = updates;
      const payload = {
        ...supabasePayload,
        updated_at: new Date().toISOString()
      };
      const { data: existingRows } = await supabaseAdmin.from('event_state').select('id').limit(1);
      const targetId = existingRows?.[0]?.id || 'evt-001';

      console.log('[DB UPDATE_EVENT_STATE]', { targetId, payload });

      const { error } = await supabaseAdmin
        .from('event_state')
        .update(payload)
        .eq('id', targetId);

      if (error) {
        console.error('[SUPABASE EVENT_STATE UPDATE ERROR]', error);
      }

      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase update error for event_state: ${error.message}`);
      }

      if (!error) {
        return await this.getEventState();
      }


    }

    const data = loadData();
    data.eventState = {
      ...data.eventState,
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    return await this.getEventState();
  },

  async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('teams').select('*').order('created_at', { ascending: true });
      if (data && !error) return data as Team[];
      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase fetch error for teams: ${error.message}`);
      }
    }
    return loadData().teams;
  },

  async getTeamByCode(teamCode: string): Promise<Team | undefined> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('teams')
        .select('*')
        .ilike('team_code', teamCode.trim())
        .single();
      if (data && !error) return data as Team;
      if (error && error.code !== 'PGRST116' && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase fetch error for teamByCode: ${error.message}`);
      }
    }
    return loadData().teams.find(t => t.team_code.toLowerCase() === teamCode.toLowerCase());
  },

  async createTeam(name: string, member1_name: string, member2_name: string): Promise<{ team: Team; isDuplicate: boolean; error?: string }> {
    const existingTeams = await this.getTeams();

    const nameExists = existingTeams.some(t => t.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (nameExists) {
      return { team: null as any, isDuplicate: true, error: "Team name already registered. Please choose a unique name." };
    }

    const round1Cases = [
      'case-r1-hyundai',
      'case-r1-eternal',
      'case-r1-dior',
      'case-r1-cf'
    ];
    const randomCase = round1Cases[Math.floor(Math.random() * round1Cases.length)];

    const r2CaseMap: Record<string, string> = {
      'case-r1-hyundai': 'case-r2-hyundai',
      'case-r1-eternal': 'case-r2-eternal',
      'case-r1-dior': 'case-r2-dior',
      'case-r1-cf': 'case-r2-cloudflare'
    };
    const assignedR2 = r2CaseMap[randomCase] || 'case-r2-hyundai';

    const crypto = require('crypto');
    let randNum = crypto.randomInt(10000, 99999);
    while (existingTeams.some(t => t.team_code === `TEAM-${randNum}`)) {
      randNum = crypto.randomInt(10000, 99999);
    }
    const team_code = `TEAM-${randNum}`;
    const access_code = `CASE-${crypto.randomInt(10000, 99999)}`;

    const newTeam: Team = {
      id: crypto.randomUUID(),
      team_code,
      name: name.trim(),
      member1_name: member1_name.trim(),
      member2_name: member2_name.trim(),
      access_code,
      assigned_case_id_r1: randomCase,
      assigned_case_id_r2: assignedR2,
      status: "REGISTERED",
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('teams').insert(newTeam).select().single();
      if (data && !error) {
        await this.logAudit(team_code, "TEAM_REGISTERED", `Team ${name} registered with members: ${member1_name}, ${member2_name}. Assigned ${randomCase}.`);
        return { team: data as Team, isDuplicate: false };
      }
      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase insert team error: ${error.message}`);
      }
    }

    const data = loadData();
    data.teams.push(newTeam);
    saveData(data);
    await this.logAudit(team_code, "TEAM_REGISTERED", `Team ${name} registered with members: ${member1_name}, ${member2_name}. Assigned ${randomCase}.`);
    return { team: newTeam, isDuplicate: false };
  },

  async getCases(): Promise<CaseConfig[]> {
    return INITIAL_CASES_EXPANDED;
  },

  async getCaseById(caseId: string): Promise<CaseConfig | undefined> {
    return INITIAL_CASES_EXPANDED.find(c => c.id === caseId);
  },

  async getCaseByRound(round: 1 | 2): Promise<CaseConfig | undefined> {
    return INITIAL_CASES_EXPANDED.find(c => c.round_number === round && c.active);
  },

  async saveCase(caseConfig: CaseConfig): Promise<CaseConfig> {
    return caseConfig;
  },

  async saveFolder(folder: CaseFolder): Promise<CaseFolder> {
    return folder;
  },

  async addFileToFolder(folderId: string, file: EvidenceFile): Promise<EvidenceFile> {
    return file;
  },

  async getFolders(roundNumber: 1 | 2 = 1, teamCode?: string, caseId?: string): Promise<CaseFolder[]> {
    let targetCaseId = caseId || "";
    if (!targetCaseId && teamCode) {
      const team = await this.getTeamByCode(teamCode);
      if (team) {
        targetCaseId = roundNumber === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || "case-r2-hyundai");
      }
    }

    if (targetCaseId) {
      const actualFolders = loadActualParticipantCaseFolders(roundNumber, targetCaseId);
      if (actualFolders.length > 0) {
        return actualFolders;
      }
    }

    const caseIds = roundNumber === 1
      ? ['case-r1-hyundai', 'case-r1-eternal', 'case-r1-dior', 'case-r1-cf']
      : ['case-r2-hyundai', 'case-r2-eternal', 'case-r2-dior', 'case-r2-cloudflare'];

    let allRoundFolders: CaseFolder[] = [];
    for (const cId of caseIds) {
      const flds = loadActualParticipantCaseFolders(roundNumber, cId);
      allRoundFolders = [...allRoundFolders, ...flds];
    }
    return allRoundFolders;
  },

  async getSubmissions(): Promise<Submission[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('submissions').select('*').order('submitted_at', { ascending: false });
      if (data && !error) return data as Submission[];
      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase fetch error for submissions: ${error.message}`);
      }
    }
    return loadData().submissions;
  },

  async getTeamSubmissions(teamCode: string): Promise<Submission[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .select('*')
        .ilike('team_code', teamCode.trim())
        .order('submitted_at', { ascending: false });
      if (data && !error) return data as Submission[];
      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase fetch error for teamSubmissions: ${error.message}`);
      }
    }
    return loadData().submissions.filter(s => s.team_code.toLowerCase() === teamCode.toLowerCase());
  },

  async addSubmission(sub: Omit<Submission, 'id' | 'submitted_at'>): Promise<Submission> {
    const crypto = require('crypto');
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      submitted_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { breakdown, original_score, override_score, override_reason, ...supabasePayload } = newSub;
      const { data, error } = await supabaseAdmin.from('submissions').insert(supabasePayload).select().single();
      if (data && !error) {
        const fullSub: Submission = {
          ...(data as Submission),
          breakdown,
          original_score,
          override_score,
          override_reason
        };
        // Also keep local JSON store updated
        const localData = loadData();
        localData.submissions.push(fullSub);
        saveData(localData);
        return fullSub;
      }
      if (error && process.env.NODE_ENV === 'production') {
        console.error('Supabase insert submission error fallback:', error.message);
      }
    }

    const data = loadData();
    data.submissions.push(newSub);
    saveData(data);
    return newSub;
  },

  async updateSubmissionScore(submissionId: string, overrideScore: number, overrideReason?: string): Promise<Submission | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .update({ score: overrideScore })
        .eq('id', submissionId)
        .select()
        .single();
      
      const localData = loadData();
      const sub = localData.submissions.find(s => s.id === submissionId);
      if (sub) {
        if (sub.original_score === undefined) sub.original_score = sub.score;
        sub.override_score = overrideScore;
        sub.override_reason = overrideReason || '';
        sub.score = overrideScore;
        saveData(localData);
        return sub;
      }
      if (data && !error) return { ...(data as Submission), override_score: overrideScore, override_reason: overrideReason };
    }

    const data = loadData();
    const sub = data.submissions.find(s => s.id === submissionId);
    if (sub) {
      if (sub.original_score === undefined) {
        sub.original_score = sub.score;
      }
      sub.override_score = overrideScore;
      sub.override_reason = overrideReason || '';
      sub.score = overrideScore;
      saveData(data);
      return sub;
    }
    return null;
  },

  async logAudit(team_code: string, action: string, details: string): Promise<AuditLog> {
    const crypto = require('crypto');
    const log: AuditLog = {
      id: `log-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      team_code: team_code.toUpperCase(),
      action,
      details,
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { error } = await supabaseAdmin.from('audit_logs').insert(log);
      if (error && process.env.NODE_ENV === 'production') {
        console.error('Supabase audit log error:', error.message);
      }
    }

    const data = loadData();
    data.auditLogs.unshift(log);
    if (data.auditLogs.length > 200) data.auditLogs = data.auditLogs.slice(0, 200);
    saveData(data);
    return log;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
      if (data && !error) return data as AuditLog[];
      if (error && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase fetch error for audit_logs: ${error.message}`);
      }
    }
    return loadData().auditLogs;
  },

  async resetEvent(): Promise<EventState> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { error: err1 } = await supabaseAdmin.from('event_state').update({
        round1_status: "NOT_STARTED",
        round1_start_time: null,
        round1_paused_elapsed_sec: 0,
        round2_status: "LOCKED",
        round2_start_time: null,
        round2_paused_elapsed_sec: 0,
        starting_prize: EVENT_CONFIG.STARTING_PRIZE,
        current_prize: EVENT_CONFIG.STARTING_PRIZE,
        updated_at: new Date().toISOString()
      }).eq('id', 'evt-001');

      await supabaseAdmin.from('submissions').delete().neq('id', 'keep-none');
      await supabaseAdmin.from('teams').update({ status: 'REGISTERED' }).neq('id', 'keep-none');
      await this.logAudit("SYSTEM", "EVENT_RESET", "Event reset by administrator.");

      if (err1 && process.env.NODE_ENV === 'production') {
        throw new Error(`Supabase reset error: ${err1.message}`);
      }

      return await this.getEventState();
    }

    const data = loadData();
    data.eventState = { ...INITIAL_EVENT_STATE, updated_at: new Date().toISOString() };
    data.submissions = [];
    data.teams.forEach(t => t.status = "REGISTERED");
    data.auditLogs = [
      {
        id: `log-${Date.now()}`,
        team_code: "SYSTEM",
        action: "EVENT_RESET",
        details: "Event reset by administrator. All submissions cleared.",
        timestamp: new Date().toISOString()
      }
    ];
    saveData(data);
    return data.eventState;
  }
};

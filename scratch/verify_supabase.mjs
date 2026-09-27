import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log("==================================================");
console.log("1. SUPABASE REAL CONNECTION TEST");
console.log("==================================================");
console.log("URL:", supabaseUrl);
console.log("Anon/Publishable Key:", anonKey ? anonKey.substring(0, 15) + "..." : "MISSING");
console.log("Service Key:", serviceKey ? serviceKey.substring(0, 15) + "..." : "MISSING");

async function verifySupabase() {
  if (!supabaseUrl || !anonKey) {
    console.log("RESULT: SUPABASE DATABASE = NOT READY (Missing URL or Anon Key)");
    return;
  }
  
  const client = createClient(supabaseUrl, serviceKey || anonKey);
  
  try {
    const { data: eventData, error: eventError } = await client.from('event_state').select('*');
    if (eventError) {
      console.log("Error querying event_state:", eventError.message, eventError.code);
    } else {
      console.log("event_state rows:", eventData?.length, eventData);
    }
    
    const { data: teamsData, error: teamsError } = await client.from('teams').select('*');
    if (teamsError) {
      console.log("Error querying teams:", teamsError.message, teamsError.code);
    } else {
      console.log("teams rows:", teamsData?.length);
    }

    const { data: subData, error: subError } = await client.from('submissions').select('*');
    if (subError) {
      console.log("Error querying submissions:", subError.message, subError.code);
    } else {
      console.log("submissions rows:", subData?.length);
    }

    const { data: auditData, error: auditError } = await client.from('audit_logs').select('*');
    if (auditError) {
      console.log("Error querying audit_logs:", auditError.message, auditError.code);
    } else {
      console.log("audit_logs rows:", auditData?.length);
    }

    // Check buckets
    const { data: buckets, error: bucketError } = await client.storage.listBuckets();
    if (bucketError) {
      console.log("Error listing storage buckets:", bucketError.message);
    } else {
      console.log("Storage buckets:", buckets.map(b => ({ name: b.name, public: b.public })));
    }
  } catch (err) {
    console.log("Supabase connection exception:", err);
  }
}

verifySupabase();

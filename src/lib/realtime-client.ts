import { supabasePublic, isSupabaseConfigured } from './supabase';

export function subscribeToEventRealtime(onUpdate: (data: any) => void): () => void {
  // 1. If Supabase client is configured, subscribe to Supabase Realtime Postgres Changes
  if (isSupabaseConfigured && supabasePublic) {
    const channel = supabasePublic
      .channel('zodiac-live-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_state' },
        (payload) => {
          onUpdate({ type: 'EVENT_STATE', payload: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          onUpdate({ type: 'SUBMISSION', payload: payload.new });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          onUpdate({ type: 'TEAM', payload: payload.new });
        }
      )
      .subscribe();

    return () => {
      if (supabasePublic) {
        supabasePublic.removeChannel(channel);
      }
    };
  }

  // 2. Fallback to Server-Sent Events (SSE) stream if offline / local store
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    const sse = new EventSource('/api/realtime');
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    return () => {
      sse.close();
    };
  }

  return () => {};
}

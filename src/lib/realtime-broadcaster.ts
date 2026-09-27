import { EventEmitter } from 'events';

// Global singleton EventEmitter for server-side state broadcasts across SSE streams
class RealtimeBus extends EventEmitter {}

const globalForRealtime = globalThis as unknown as {
  realtimeBus: RealtimeBus;
};

export const realtimeBus = globalForRealtime.realtimeBus || new RealtimeBus();

if (process.env.NODE_ENV !== 'production') {
  globalForRealtime.realtimeBus = realtimeBus;
}

export function broadcastStateChange(payload: any) {
  realtimeBus.emit('state_update', payload);
}

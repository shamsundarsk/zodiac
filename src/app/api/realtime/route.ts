import { db } from '@/lib/db';
import { realtimeBus } from '@/lib/realtime-broadcaster';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state snapshot immediately upon connection
      try {
        const initialState = await db.getEventState();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'INIT', state: initialState })}\n\n`)
        );
      } catch (e) {
        console.error('Error fetching initial SSE state:', e);
      }

      // Listener for server state change events
      const onStateUpdate = async (payload: any) => {
        try {
          const currentState = await db.getEventState();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'UPDATE', payload, state: currentState })}\n\n`)
          );
        } catch (err) {
          console.error('Error broadcasting SSE frame:', err);
        }
      };

      realtimeBus.on('state_update', onStateUpdate);

      // Heartbeat timer every 5 seconds to keep connection alive & push decaying prize updates
      const heartbeatInterval = setInterval(async () => {
        try {
          const state = await db.getEventState();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'TICK', state })}\n\n`)
          );
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 5000);

      // Cleanup on client disconnect
      return () => {
        realtimeBus.off('state_update', onStateUpdate);
        clearInterval(heartbeatInterval);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}

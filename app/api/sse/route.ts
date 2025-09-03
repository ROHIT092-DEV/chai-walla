import { NextRequest } from 'next/server';

const clients = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      
      request.signal.addEventListener('abort', () => {
        clients.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.enqueue(message);
    } catch (error) {
      clients.delete(client);
    }
  });
}
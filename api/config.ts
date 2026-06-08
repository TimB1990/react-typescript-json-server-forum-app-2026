import { jsonResponse } from './helpers';

const DEFAULT = {
  'messages': 10,
  'threads': 5,
  'categories': 4,
  'global': 20
};

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return jsonResponse(DEFAULT);
}
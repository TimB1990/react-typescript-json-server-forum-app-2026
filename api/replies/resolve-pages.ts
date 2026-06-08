import { getDb } from '../db';
import { jsonResponse, errorResponse } from '../helpers';

const DEFAULT = { messages: 10 };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json() as any;
    const { ids } = body;
    const itemsPerPage = DEFAULT.messages;

    if (!ids || !Array.isArray(ids)) {
      return errorResponse('Invalid IDs provided', 400);
    }

    const db = await getDb();
    const allMessages = db.data?.messages || [];

    const results = ids.map((targetId: string) => {
      const message = allMessages.find((m: any) => m.id === targetId);

      if (!message) return { messageId: targetId, atPage: null, error: 'Not found' };

      const threadMessages = allMessages
        .filter((m: any) => m.threadId === message.threadId)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const index = threadMessages.findIndex((m: any) => m.id === targetId);
      const atPage = Math.floor(index / itemsPerPage) + 1;

      const existingReply = db.data!.replies.find((r: any) => r.messageId === targetId);

      if (existingReply) {
        existingReply.atPage = atPage;
      } else {
        db.data!.replies.push({
          messageId: targetId,
          parentMessageId: message.parentId || null,
          threadId: message.threadId,
          atPage: atPage
        });
      }

      return { messageId: targetId, atPage, threadId: message.threadId };
    });

    await db.write();
    return jsonResponse(results);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
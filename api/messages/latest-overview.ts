import { getDb } from '../db';
import { jsonResponse, errorResponse } from '../helpers';

const DEFAULT = { messages: 10 };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || String(DEFAULT.messages), 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    const db = await getDb();
    const allMessages = db.data?.messages || [];

    const sortedMessages = [...allMessages].sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const uniqueThreadMessages = [];
    const seenThreads = new Set();

    for (const message of sortedMessages) {
      if (!seenThreads.has(message.threadId)) {
        seenThreads.add(message.threadId);
        uniqueThreadMessages.push(message);
      }
    }

    const totalCount = uniqueThreadMessages.length;
    const startIndex = (page - 1) * limit;
    const paginatedResult = uniqueThreadMessages.slice(startIndex, startIndex + limit);

    return jsonResponse({
      data: paginatedResult,
      totalCount: totalCount,
      currentPage: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
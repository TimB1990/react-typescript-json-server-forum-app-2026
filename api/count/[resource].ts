import { getDb } from '../db';
import { filterDataByQueryParams, jsonResponse, errorResponse } from '../helpers';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const resource = pathParts[pathParts.length - 1];

    const searchParams = Object.fromEntries(url.searchParams);

    const db = await getDb();
    const data = db.data?.[resource as keyof typeof db.data];

    if (!data || !Array.isArray(data)) {
      return errorResponse('Resource not found', 404);
    }

    const filteredData = filterDataByQueryParams(data, searchParams);

    return jsonResponse({ count: filteredData.length });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
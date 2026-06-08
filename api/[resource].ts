import { getDb } from './db';
import { filterDataByQueryParams, jsonResponse, errorResponse } from './helpers';

const NON_PAGINATED_RESOURCES = ['replies', 'tags', 'config'];
const DEFAULT = {
  'messages': 10,
  'threads': 5,
  'categories': 4,
  'global': 20
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'POST') {
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
      return errorResponse('Not found', 404);
    }

    const filtered = filterDataByQueryParams(data, searchParams);

    const sortOrder = searchParams.order === 'asc' ? 'asc' : 'desc';
    const sorted = [...filtered].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const skipPagination = NON_PAGINATED_RESOURCES.includes(resource);
    let finalResult = sorted;
    let page = 1;
    const resourceDefault = DEFAULT[resource as keyof typeof DEFAULT] || DEFAULT.global;
    let limit = skipPagination ? sorted.length : (parseInt(searchParams.limit as string, 10) || resourceDefault);

    if (!skipPagination) {
      page = parseInt(searchParams.page as string, 10) || 1;
      const startIndex = (page - 1) * limit;
      finalResult = sorted.slice(startIndex, startIndex + limit);
    }

    return jsonResponse({
      data: finalResult,
      totalCount: filtered.length,
      currentPage: page,
      limit: limit,
      totalPages: skipPagination ? 1 : Math.ceil(filtered.length / limit)
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
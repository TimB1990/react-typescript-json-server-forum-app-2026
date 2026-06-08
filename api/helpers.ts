const RESERVED_FILTERS = ['limit', 'page', 'order'];

export function filterDataByQueryParams(data: any[], filters: any) {
  const validFilterKeys = Object.keys(filters).filter(
    key => !RESERVED_FILTERS.includes(key) && filters[key] !== undefined
  );

  if (validFilterKeys.length === 0) return data;

  return data.filter(item => {
    return validFilterKeys.every(key => {
      const itemValue = item?.[key];
      const filterValue = filters[key];
      return String(itemValue) === String(filterValue);
    });
  });
}

export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
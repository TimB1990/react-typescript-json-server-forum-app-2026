export const sanitizeQuotesFromHTML = (
  rawHtml: string,
  threadId?: number
): string => {
  if (!rawHtml) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Mode 1: If threadId is provided, remove only stored quote IDs
  if (threadId !== undefined) {
    const storedQuoteIds = sessionStorage.getItem(`quotes_thread_${threadId}`);

    if (storedQuoteIds) {
      try {
        const quoteIds = JSON.parse(storedQuoteIds) as string[];

        if (Array.isArray(quoteIds) && quoteIds.length > 0) {
          quoteIds.forEach(id => {
            const quoteElement = doc.querySelector(`blockquote[data-quote-id="${id}"]`);
            quoteElement?.remove();
          });
        }
      } catch (error) {
        console.error('Failed to parse stored quote IDs:', error);
      }
    }
  } else {
    // Mode 2: If no threadId is provided, strip ALL blockquotes (e.g., for previews)
    doc.querySelectorAll('blockquote').forEach(node => node.remove());
  }

  return doc.body.innerHTML;
};
// Normalize media type: strip parameters, lowercase
export function mediaTypeOf(contentType = '') {
  const [type] = String(contentType).split(';');
  const base = type.trim().toLowerCase();

  // Normalize old markdown type
  if (base === 'text/x-markdown') return 'text/markdown';

  return base;
}

// Assignment 2:
// - Allow ANY text/*
// - Allow application/json
export function isSupportedType(contentType = '') {
  const type = mediaTypeOf(contentType);
  if (!type) return false;

  // Any text/* subtype is valid (text/plain, text/markdown, text/html, etc.)
  if (type.startsWith('text/')) return true;

  // JSON support
  if (type === 'application/json') return true;

  return false;
}

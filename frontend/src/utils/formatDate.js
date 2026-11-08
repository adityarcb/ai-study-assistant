export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const defaults = { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-US', { ...defaults, ...opts });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

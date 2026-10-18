export const fallback = 'To be announced';
export const hasValue = value => value !== null && value !== undefined && String(value).trim() !== '';
export const display = value => Array.isArray(value) ? (value.filter(hasValue).join(', ') || fallback) : hasValue(value) ? String(value) : fallback;
export const description = tournament => hasValue(tournament.description) ? tournament.description : tournament.id === '2027-soil-invitational' ? 'The 2027 SOIL Invitational is a Science Olympiad invitational tournament hosted by Science Olympiad at Illinois and run by our members and volunteers. Invitationals give teams competition practice ahead of regional and state tournaments.' : fallback;
export function dateValue(value) {
  if (!hasValue(value) || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return null;
  const day=value.slice(0,10), parsed=new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10)!==day || Number.isNaN(Date.parse(value))) return null;
  return {iso:value,label:new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(parsed)};
}
export function externalUrl(value) {
  if (!hasValue(value)) return null;
  try { const url=new URL(value);return url.protocol==='https:' ? url.href : null; } catch {return null;}
}

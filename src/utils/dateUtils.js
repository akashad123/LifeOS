export function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day);
}

export function getWeekStartDate(inputDate) {
  const d = typeof inputDate === 'string' ? parseLocalDate(inputDate) : new Date(inputDate || new Date());
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // day is 0 for Sunday, 1 for Monday, etc.
  // We want Monday to be the start of the week.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return getLocalIsoDate(d);
}

export function getWeekEndDate(inputDate) {
  const d = typeof inputDate === 'string' ? parseLocalDate(inputDate) : new Date(inputDate || new Date());
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 6;
  d.setDate(diff);
  return getLocalIsoDate(d);
}

export function formatWeekRange(startDateStr) {
  const start = parseLocalDate(startDateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const options = { month: 'short', day: 'numeric' };
  // Using en-US to match "Aug 3" format
  return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
}

export function addWeeks(dateStr, weeks) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + (weeks * 7));
  return getLocalIsoDate(d);
}

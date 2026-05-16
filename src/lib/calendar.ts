// Helpers for adding meetings to external calendars (Google, Outlook, Apple)
// and generating ICS feeds.

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startISO: string;
  durationMinutes: number;
  location?: string | null;
}

function toICSDate(iso: string): string {
  // YYYYMMDDTHHMMSSZ
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function endISO(startISO: string, mins: number): string {
  return new Date(new Date(startISO).getTime() + mins * 60_000).toISOString();
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const start = toICSDate(e.startISO);
  const end = toICSDate(endISO(e.startISO, e.durationMinutes));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${start}/${end}`,
    details: e.description ?? '',
    location: e.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    startdt: new Date(e.startISO).toISOString(),
    enddt: new Date(endISO(e.startISO, e.durationMinutes)).toISOString(),
    body: e.description ?? '',
    location: e.location ?? '',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function buildIcs(events: CalendarEvent[], calName = 'Rexxon meetings'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rexxon AI//Meetings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calName)}`,
    'X-PUBLISHED-TTL:PT15M',
  ];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@rexxon.ai`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${toICSDate(e.startISO)}`,
      `DTEND:${toICSDate(endISO(e.startISO, e.durationMinutes))}`,
      `SUMMARY:${escapeICS(e.title)}`,
      e.description ? `DESCRIPTION:${escapeICS(e.description)}` : '',
      e.location ? `LOCATION:${escapeICS(e.location)}` : '',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

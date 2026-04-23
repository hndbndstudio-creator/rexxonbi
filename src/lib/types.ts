// Rexxon AI domain types — derived from Supabase schema

export type SignalType =
  | 'GROWTH'
  | 'COMPLIANCE'
  | 'TECH_EXPANSION'
  | 'SALES_OPS'
  | 'LEADERSHIP'
  | 'FUNDING'
  | 'EARNINGS';

export type SignalSource =
  | 'LINKEDIN'
  | 'INDEED'
  | 'CRUNCHBASE'
  | 'SEC_EDGAR'
  | 'BUSINESS_WIRE'
  | 'GOOGLE_NEWS'
  | 'SEEKING_ALPHA'
  | 'GREENHOUSE'
  | 'LEVER'
  | 'ISACA'
  | 'CYBERSEEK';

export type SignalStatus = 'NEW' | 'CLAIMED' | 'CONVERTED' | 'DISMISSED';
export type Seniority = 'C_LEVEL' | 'VP' | 'DIRECTOR' | 'MANAGER' | 'IC';

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  GROWTH: 'Growth',
  COMPLIANCE: 'Compliance',
  TECH_EXPANSION: 'Tech Expansion',
  SALES_OPS: 'Sales Ops',
  LEADERSHIP: 'Leadership',
  FUNDING: 'Funding',
  EARNINGS: 'Earnings',
};

export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  CRUNCHBASE: 'Crunchbase',
  SEC_EDGAR: 'SEC EDGAR',
  BUSINESS_WIRE: 'Business Wire',
  GOOGLE_NEWS: 'Google News',
  SEEKING_ALPHA: 'Seeking Alpha',
  GREENHOUSE: 'Greenhouse',
  LEVER: 'Lever',
  ISACA: 'ISACA',
  CYBERSEEK: 'CyberSeek',
};

export const SIGNAL_TYPE_COLOR_VAR: Record<SignalType, string> = {
  GROWTH: 'var(--signal-growth)',
  COMPLIANCE: 'var(--signal-compliance)',
  TECH_EXPANSION: 'var(--signal-tech)',
  SALES_OPS: 'var(--signal-sales)',
  LEADERSHIP: 'var(--signal-leadership)',
  FUNDING: 'var(--signal-funding)',
  EARNINGS: 'var(--signal-earnings)',
};

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '••••••';
  return `${'•'.repeat(Math.min(local.length, 6))}@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\d(?=\d{4})/g, '•');
}

export function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'VERY HIGH', color: 'var(--signal-growth)' };
  if (score >= 80) return { label: 'HIGH', color: 'var(--signal-compliance)' };
  if (score >= 65) return { label: 'MEDIUM', color: 'var(--signal-sales)' };
  return { label: 'LOW', color: 'var(--muted-foreground)' };
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

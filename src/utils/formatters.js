const nprFormatter = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-NP');

export function formatNPR(amountInRupees) {
  const safeValue = Number(amountInRupees);
  if (!Number.isFinite(safeValue)) return 'NPR 0';
  return nprFormatter.format(Math.round(safeValue));
}

export function formatCount(value) {
  const safeValue = Number(value);
  if (!Number.isFinite(safeValue)) return '0';
  return numberFormatter.format(safeValue);
}

export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDisplayDate(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNepaliPhone(phone) {
  if (!phone) return 'Not publicly listed';
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+977') && cleaned.length === 14) {
    return `+977 ${cleaned.slice(4, 7)}-${cleaned.slice(7, 10)}${cleaned.slice(10)}`;
  }
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return `+977 ${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return phone;
}

export function getInitials(name) {
  if (!name) return 'BB';
  return String(name)
    .replace(/^Dr\.\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function formatPublicDonorName(fullName, displayMode = 'first_initial') {
  if (!fullName) return 'Voluntary Donor';
  const parts = String(fullName).trim().split(/\s+/);
  if (displayMode === 'first_only' || parts.length === 1) {
    return parts[0];
  }
  if (displayMode === 'full_consented') {
    return fullName;
  }
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

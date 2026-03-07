export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    preparing: '#F97316',
    out_for_delivery: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
  };
  return map[status] || '#6B7280';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string; bgLight: string; textLight: string }> = {
  pharmacy:  { label: 'Pharmacy',  icon: '\u{1F48A}', bg: 'bg-[#0D7377]', text: 'text-white',      bgLight: 'bg-teal-50',   textLight: 'text-[#0D7377]' },
  liquor:    { label: 'Liquor',    icon: '\u{1F377}', bg: 'bg-[#D4A843]', text: 'text-white',      bgLight: 'bg-amber-50',  textLight: 'text-[#D4A843]' },
  cosmetics: { label: 'Cosmetics', icon: '\u{1F484}', bg: 'bg-[#E91E8C]', text: 'text-white',      bgLight: 'bg-pink-50',   textLight: 'text-[#E91E8C]' },
  rations:   { label: 'Rations',   icon: '\u{1F33E}', bg: 'bg-[#E67E22]', text: 'text-white',      bgLight: 'bg-orange-50', textLight: 'text-[#E67E22]' },
  snacks:    { label: 'Snacks',    icon: '\u{1F36A}', bg: 'bg-[#E74C3C]', text: 'text-white',      bgLight: 'bg-red-50',    textLight: 'text-[#E74C3C]' },
  beverages: { label: 'Beverages', icon: '\u{1F964}', bg: 'bg-[#3498DB]', text: 'text-white',      bgLight: 'bg-blue-50',   textLight: 'text-[#3498DB]' },
};

export function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    pharmacy: '#0D7377', liquor: '#D4A843', cosmetics: '#E91E8C',
    rations: '#E67E22', snacks: '#E74C3C', beverages: '#3498DB',
  };
  return map[type] || '#6B7280';
}

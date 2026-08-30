export const CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi / Internet',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Library',
  'Electricity',
  'Water Supply',
  'Security',
  'Other'
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed'
];

export const STATUS_CONFIG = {
  Submitted: {
    label: 'Submitted',
    color: 'slate',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  'Under Review': {
    label: 'Under Review',
    color: 'blue',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  Assigned: {
    label: 'Assigned',
    color: 'purple',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  'In Progress': {
    label: 'In Progress',
    color: 'amber',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  Resolved: {
    label: 'Resolved',
    color: 'emerald',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  Closed: {
    label: 'Closed',
    color: 'gray',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200'
  }
};

export const PRIORITY_CONFIG = {
  Low: {
    label: 'Low',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    badge: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  High: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  Critical: {
    label: 'Critical',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
  }
};

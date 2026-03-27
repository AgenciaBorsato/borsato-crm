export const POLL_INTERVAL = 4000;

export const CM = {
  blue:    { bg: 'bg-blue-500',    ring: 'ring-blue-300',    light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-500',    hex: '#3b82f6'   },
  yellow:  { bg: 'bg-amber-500',   ring: 'ring-amber-300',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-500',   hex: '#f59e0b'   },
  purple:  { bg: 'bg-purple-500',  ring: 'ring-purple-300',  light: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-500',  hex: '#a855f7'   },
  green:   { bg: 'bg-green-500',   ring: 'ring-green-300',   light: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-500',   hex: '#22c55e'   },
  red:     { bg: 'bg-red-500',     ring: 'ring-red-300',     light: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-500',     hex: '#ef4444'   },
  zinc:    { bg: 'bg-gray-400',    ring: 'ring-gray-300',    light: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-400',    hex: '#9ca3af'   },
  orange:  { bg: 'bg-orange-500',  ring: 'ring-orange-300',  light: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-500',  hex: '#f97316'   },
  pink:    { bg: 'bg-pink-500',    ring: 'ring-pink-300',    light: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-500',    hex: '#ec4899'   },
  teal:    { bg: 'bg-teal-500',    ring: 'ring-teal-300',    light: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-500',    hex: '#14b8a6'   },
  indigo:  { bg: 'bg-indigo-500',  ring: 'ring-indigo-300',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-500',  hex: '#6366f1'   },
};

export function daysAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

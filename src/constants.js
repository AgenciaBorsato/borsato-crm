export const POLL_INTERVAL = 4000;

export const CM = {
  blue:   { bg: 'bg-blue-500',   ring: 'ring-blue-300',   light: 'bg-blue-50',   text: 'text-blue-700'   },
  yellow: { bg: 'bg-amber-500',  ring: 'ring-amber-300',  light: 'bg-amber-50',  text: 'text-amber-700'  },
  purple: { bg: 'bg-purple-500', ring: 'ring-purple-300', light: 'bg-purple-50', text: 'text-purple-700' },
  green:  { bg: 'bg-green-500',  ring: 'ring-green-300',  light: 'bg-green-50',  text: 'text-green-700'  },
  red:    { bg: 'bg-red-500',    ring: 'ring-red-300',    light: 'bg-red-50',    text: 'text-red-700'    },
  zinc:   { bg: 'bg-gray-400',   ring: 'ring-gray-300',   light: 'bg-gray-50',   text: 'text-gray-600'   },
};

export function daysAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

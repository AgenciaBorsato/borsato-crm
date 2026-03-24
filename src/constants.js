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

export function renderText(text, myName = '') {
  const React = require('react');
  if (!text) return null;
  const tokenRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*|@[\w\u00C0-\u024F]+)/gi;
  const parts = text.split(tokenRegex);
  if (parts.length === 1) {
    return React.createElement('span', { className: 'text-[13px] text-gray-800 whitespace-pre-wrap break-words' }, text);
  }
  return React.createElement(
    'span',
    { className: 'text-[13px] text-gray-800 whitespace-pre-wrap break-words' },
    parts.map((part, i) => {
      if (!part) return null;
      if (/^https?:\/\//i.test(part) || /^www\./i.test(part)) {
        const href = part.startsWith('http') ? part : 'https://' + part;
        return React.createElement('a', {
          key: i, href, target: '_blank', rel: 'noopener noreferrer',
          className: 'text-[#075e54] underline underline-offset-2 decoration-[#075e54]/40 hover:decoration-[#075e54] break-all',
          onClick: e => e.stopPropagation()
        }, part);
      }
      if (/^@/.test(part)) {
        const mentionName = part.slice(1);
        const isMe = myName && mentionName.toLowerCase() === myName.toLowerCase();
        return React.createElement('span', {
          key: i,
          className: `font-bold rounded px-0.5 ${isMe ? 'bg-yellow-200 text-yellow-900' : 'text-[#075e54]'}`
        }, part);
      }
      return part;
    })
  );
}

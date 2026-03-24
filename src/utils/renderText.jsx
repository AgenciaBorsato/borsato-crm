import React from 'react';

export function renderText(text, myName = '') {
  if (!text) return null;
  const tokenRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*|@[\w\u00C0-\u024F]+)/gi;
  const parts = text.split(tokenRegex);
  if (parts.length === 1) {
    return <span className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{text}</span>;
  }
  return (
    <span className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//i.test(part) || /^www\./i.test(part)) {
          const href = part.startsWith('http') ? part : 'https://' + part;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer"
               className="text-[#075e54] underline underline-offset-2 decoration-[#075e54]/40 hover:decoration-[#075e54] break-all"
               onClick={e => e.stopPropagation()}>
              {part}
            </a>
          );
        }
        if (/^@/.test(part)) {
          const mentionName = part.slice(1);
          const isMe = myName && mentionName.toLowerCase() === myName.toLowerCase();
          return (
            <span key={i} className={`font-bold rounded px-0.5 ${isMe ? 'bg-yellow-200 text-yellow-900' : 'text-[#075e54]'}`}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

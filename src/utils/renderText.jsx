import React from 'react';

function parseInline(text) {
  const tokenRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*|@[\w\u00C0-\u024F]+|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'token', value: match[0] });
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}

export function renderText(text, myName = '') {
  if (!text) return null;
  const parts = parseInline(text);
  const rendered = parts.map((part, i) => {
    if (part.type === 'text') return part.value || null;
    const v = part.value;
    if (/^https?:\/\//i.test(v) || /^www\./i.test(v)) {
      const href = v.startsWith('http') ? v : 'https://' + v;
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
           className="text-[#075e54] underline underline-offset-2 decoration-[#075e54]/40 hover:decoration-[#075e54] break-all"
           onClick={e => e.stopPropagation()}>
          {v}
        </a>
      );
    }
    if (/^@/.test(v)) {
      const mentionName = v.slice(1);
      const isMe = myName && mentionName.toLowerCase() === myName.toLowerCase();
      return (
        <span key={i} className={`font-bold rounded px-0.5 ${isMe ? 'bg-yellow-200 text-yellow-900' : 'text-[#075e54]'}`}>
          {v}
        </span>
      );
    }
    if (/^\*[^*\n]+\*$/.test(v)) {
      return <strong key={i}>{v.slice(1, -1)}</strong>;
    }
    if (/^_[^_\n]+_$/.test(v)) {
      return <em key={i}>{v.slice(1, -1)}</em>;
    }
    if (/^~[^~\n]+~$/.test(v)) {
      return <s key={i}>{v.slice(1, -1)}</s>;
    }
    if (/^`[^`\n]+`$/.test(v)) {
      return <code key={i} className="bg-gray-100 rounded px-0.5 font-mono text-[12px]">{v.slice(1, -1)}</code>;
    }
    return v;
  });
  return (
    <span className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">
      {rendered}
    </span>
  );
}

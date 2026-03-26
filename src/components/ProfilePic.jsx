import React, { useState, useEffect } from 'react';
import { Users2 } from 'lucide-react';
import api from '../api';

export function ParticipantAvatar({ name, phone, size = 'w-8 h-8', textSize = 'text-[10px]' }) {
  const display = name || phone || '?';
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <span className={`${textSize} font-bold text-[#075e54]`}>{display.substring(0, 2).toUpperCase()}</span>
    </div>
  );
}

export default function ProfilePic({ phone, tenantId, name, size = 'w-9 h-9', textSize = 'text-[10px]', isGroup = false, cachedUrl = null }) {
  const [pic, setPic] = useState(cachedUrl || null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (cachedUrl) { setPic(cachedUrl); return; }
    if (!phone || tried) return;
    setTried(true);
    api.fetchProfilePic(phone, tenantId).then(d => {
      const url = d?.profilePictureUrl || d?.wpiUrl || d?.picture || d?.url || null;
      if (url) setPic(url);
    }).catch(() => {});
  }, [phone, tenantId, tried, cachedUrl]);

  // Reset tried when phone changes
  useEffect(() => { setTried(false); setPic(cachedUrl || null); }, [phone]);

  const fallbackInitials = (name || phone || '?').substring(0, 2).toUpperCase();

  if (pic) return <img src={pic} alt="" className={`${size} rounded-full object-cover flex-shrink-0`} onError={() => setPic(null)} />;
  if (isGroup) return (
    <div className={`${size} rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0`}>
      <Users2 className="w-4 h-4 text-blue-700" />
    </div>
  );
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0`}>
      <span className={`${textSize} font-semibold text-gray-600`}>{fallbackInitials}</span>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Users2 } from 'lucide-react';
import api from '../api';

export function ParticipantAvatar({ name, phone, size = 'w-8 h-8', textSize = 'text-[10px]' }) {
  const display = name || phone || '?';
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0`}>
      <span className={`${textSize} font-semibold text-gray-600`}>{display.substring(0, 2).toUpperCase()}</span>
    </div>
  );
}

export default function ProfilePic({ phone, tenantId, name, size = 'w-9 h-9', textSize = 'text-[10px]', isGroup = false, cachedUrl = null }) {
  const [pic, setPic] = useState(cachedUrl || null);
  const lastPhoneRef = useRef(phone);

  useEffect(() => {
    // Se cachedUrl mudou e tem valor, usar direto
    if (cachedUrl) { setPic(cachedUrl); return; }

    // Se phone mudou, resetar pic
    if (phone !== lastPhoneRef.current) {
      lastPhoneRef.current = phone;
      setPic(null);
    }

    // Se ja tem pic ou nao tem phone, parar
    if (pic || !phone) return;

    // Fetch da API
    let cancelled = false;
    api.fetchProfilePic(phone, tenantId).then(d => {
      if (cancelled) return;
      const url = d?.profilePictureUrl || d?.wpiUrl || d?.picture || d?.url || null;
      if (url) setPic(url);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [phone, tenantId, cachedUrl]);

  const fallbackInitials = (name || phone || '?').substring(0, 2).toUpperCase();

  if (pic) return <img src={pic} alt="" loading="lazy" decoding="async" className={`${size} rounded-full object-cover flex-shrink-0`} onError={() => setPic(null)} />;
  if (isGroup) return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <Users2 className="w-4 h-4 text-[#54656f]" />
    </div>
  );
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <span className={`${textSize} font-semibold text-[#54656f]`}>{fallbackInitials}</span>
    </div>
  );
}

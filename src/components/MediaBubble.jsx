import React, { useState, useEffect, useRef } from 'react';
import { Image, Mic, Play, Pause, Download, FileText, MapPin, User } from 'lucide-react';
import api from '../api';

export default function MediaBubble({ msg, tenantId, cachedSrc }) {
  const [media, setMedia] = useState(cachedSrc || null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const loadMedia = async () => {
    if (loading || media) return;
    if (!msg.media_url || msg.media_url === 'undefined') return;
    try {
      let key; try { key = JSON.parse(msg.media_url); } catch (e) { return; }
      setLoading(true);
      const data = await api.fetchMedia(tenantId, key);
      if (data.base64) {
        let src = data.base64;
        if (!src.startsWith('data:')) {
          const mm = { image: 'image/jpeg', audio: 'audio/ogg', video: 'video/mp4', document: 'application/pdf', sticker: 'image/webp' };
          src = `data:${mm[msg.message_type] || 'application/octet-stream'};base64,${src}`;
        }
        setMedia(src);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (cachedSrc) { setMedia(cachedSrc); return; }
    const autoTypes = ['image', 'sticker'];
    if (autoTypes.includes(msg.message_type) && msg.media_url && msg.media_url !== 'undefined') {
      loadMedia();
    }
  }, [msg.id, cachedSrc]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  if (msg.message_type === 'image') return (
    <div className="mb-1">
      {loading && !media && (
        <div className="w-[200px] h-[140px] bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {media ? (
        <img src={media} alt="" className="max-w-[260px] rounded-xl cursor-zoom-in shadow-sm hover:opacity-95 transition-opacity"
          onClick={() => { const w = window.open('', '_blank'); w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${media}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`); w.document.close(); }}
          onError={(e) => { e.currentTarget.style.display='none'; }} />
      ) : (!loading && (
        <button onClick={loadMedia} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200">
          <Image className="w-5 h-5 text-[#25d366]" />
          <span className="text-xs text-gray-600">Ver imagem</span>
        </button>
      ))}
    </div>
  );
  if (msg.message_type === 'audio') return (
    <div className="mb-1">
      {media ? (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 min-w-[180px]">
          <button onClick={toggleAudio} className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center flex-shrink-0">
            {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <div className="flex-1 h-1 bg-gray-300 rounded-full" />
          <audio ref={audioRef} src={media} onEnded={() => setPlaying(false)} />
        </div>
      ) : (
        <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-full px-3 py-2 flex items-center gap-2 hover:bg-gray-200">
          <Mic className="w-4 h-4 text-[#25d366]" />
          <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ouvir audio'}</span>
        </button>
      )}
    </div>
  );
  if (msg.message_type === 'video') return (
    <div className="mb-1">
      {media ? <video src={media} controls className="max-w-[250px] rounded-lg" />
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Play className="w-5 h-5 text-[#25d366]" /><span className="text-xs">{loading ? 'Carregando...' : 'Ver video'}</span></button>}
    </div>
  );
  if (msg.message_type === 'document') return (
    <div className="mb-1">
      {media ? <a href={media} download={msg.content || 'doc'} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Download className="w-5 h-5 text-[#25d366]" /><span className="text-xs">Baixar</span></a>
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><FileText className="w-5 h-5 text-gray-400" /><span className="text-xs">{loading ? 'Carregando...' : 'Baixar'}</span></button>}
    </div>
  );
  if (msg.message_type === 'sticker') return (
    <div className="mb-1">
      {media ? (
        <img src={media} alt="sticker" className="w-[140px] h-[140px] object-contain" />
      ) : loading ? (
        <div className="w-[80px] h-[80px] bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="text-2xl">{String.fromCodePoint(0x1F3A8)}</div>
      )}
    </div>
  );
  if (msg.message_type === 'location') return (
    <div className="mb-1 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-red-500" />
      <span className="text-xs">Localizacao</span>
    </div>
  );
  if (msg.message_type === 'contact') {
    // Tenta extrair nome do vCard se disponivel no content
    let contactName = '';
    let contactPhone = '';
    if (msg.content && msg.content !== '[contact]') {
      const fnMatch = msg.content.match(/FN[;:][^\r\n]*([\r\n]+|:)([^\r\n]+)/i) || msg.content.match(/FN:([^\r\n]+)/i);
      if (fnMatch) contactName = fnMatch[fnMatch.length - 1]?.trim() || '';
      const telMatch = msg.content.match(/TEL[^:]*:([^\r\n]+)/i);
      if (telMatch) contactPhone = telMatch[1]?.trim() || '';
    }
    return (
      <div className="mb-1 flex items-center gap-2.5 bg-gray-100 rounded-xl px-3 py-2.5 min-w-[180px] max-w-[240px]">
        <div className="w-9 h-9 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{contactName || 'Contato'}</p>
          {contactPhone && <p className="text-[10px] text-gray-500 font-mono truncate">{contactPhone}</p>}
          <p className="text-[9px] text-gray-400 mt-0.5">Contato compartilhado</p>
        </div>
      </div>
    );
  }
  return null;
}

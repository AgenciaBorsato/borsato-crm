import React, { useState, useEffect, useRef } from 'react';
import { Image, Mic, Play, Pause, Download, FileText, MapPin, User } from 'lucide-react';
import api from '../api';

const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutos

export default function MediaBubble({ msg, tenantId, cachedSrc }) {
  const [media, setMedia] = useState(cachedSrc || null);
  const [loading, setLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [retryAt, setRetryAt] = useState(null); // timestamp do proximo retry
  const [retryCountdown, setRetryCountdown] = useState(null);
  const retryTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [transcription, setTranscription] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [aiTriggered, setAiTriggered] = useState(false);

  const handleTranscribe = async () => {
    if (transcribing || transcription) return;
    setTranscribing(true);
    try {
      const result = await api.transcribeAudio(tenantId, msg.id);
      if (result?.text) setTranscription(result.text);
      else setTranscription('Nao foi possivel transcrever.');
    } catch (e) {
      setTranscription('Erro ao transcrever.');
    } finally {
      setTranscribing(false);
    }
  };

  const scheduleRetry = () => {
    const at = Date.now() + RETRY_DELAY_MS;
    setRetryAt(at);
    retryTimerRef.current = setTimeout(() => {
      setMediaError(false);
      setRetryAt(null);
      setRetryCountdown(null);
      loadMedia();
    }, RETRY_DELAY_MS);
    // countdown a cada segundo
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((at - Date.now()) / 1000));
      setRetryCountdown(remaining);
      if (remaining === 0) clearInterval(countdownRef.current);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearTimeout(retryTimerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const loadMedia = async () => {
    if (loading || media) return;
    if (!msg.media_url || msg.media_url === 'undefined') return;
    try {
      let key; try { key = JSON.parse(msg.media_url); } catch (e) { return; }
      setLoading(true);
      setMediaError(false);
      const data = await api.fetchMedia(tenantId, key);
      if (data.base64) {
        let src = data.base64;
        if (!src.startsWith('data:')) {
          const mm = { image: 'image/jpeg', audio: 'audio/ogg', video: 'video/mp4', document: 'application/pdf', sticker: 'image/webp' };
          src = `data:${mm[msg.message_type] || 'application/octet-stream'};base64,${src}`;
        }
        setMedia(src);
      } else {
        // Midia indisponivel no momento — agenda retry em 5 min
        setMediaError(true);
        scheduleRetry();
      }
    } catch (e) {
      setMediaError(true);
      scheduleRetry();
    }
    finally { setLoading(false); }
  };

  const handleManualRetry = () => {
    clearTimeout(retryTimerRef.current);
    clearInterval(countdownRef.current);
    setMediaError(false);
    setRetryAt(null);
    setRetryCountdown(null);
    loadMedia();
  };

  const MediaErrorBadge = ({ icon }) => (
    <div className="flex flex-col gap-1">
      <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs">Midia temporariamente indisponivel</span>
      </div>
      <div className="flex items-center gap-2">
        {retryCountdown !== null && retryCountdown > 0 ? (
          <span className="text-[10px] text-gray-400">
            Nova tentativa em {retryCountdown >= 60
              ? `${Math.ceil(retryCountdown / 60)} min`
              : `${retryCountdown}s`}
          </span>
        ) : null}
        <button onClick={handleManualRetry} className="text-[10px] text-blue-500 hover:underline">
          Tentar agora
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (cachedSrc) { setMedia(cachedSrc); return; }
    const autoTypes = ['image', 'sticker', 'video'];
    if (autoTypes.includes(msg.message_type) && msg.media_url && msg.media_url !== 'undefined') {
      loadMedia();
    }
  }, [msg.id, cachedSrc]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const [lightbox, setLightbox] = useState(false);

  if (msg.message_type === 'image') return (
    <div className="mb-1">
      {loading && !media && (
        <div className="w-[280px] h-[200px] bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {media ? (
        <>
          <img src={media} alt="" loading="lazy" decoding="async" className="max-w-[400px] max-h-[400px] rounded-xl cursor-zoom-in shadow-sm hover:shadow-md hover:brightness-95 transition-all object-cover"
            onClick={() => setLightbox(true)}
            onError={(e) => { e.currentTarget.style.display='none'; }} />
          {lightbox && (
            <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-pointer" onClick={() => setLightbox(false)}>
              <img src={media} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition-colors">&times;</button>
            </div>
          )}
        </>
      ) : mediaError ? (
        <MediaErrorBadge icon={<Image className="w-4 h-4" />} />
      ) : (!loading && (
        <button onClick={loadMedia} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200">
          <Image className="w-5 h-5 text-blue-700" />
          <span className="text-xs text-gray-600">Ver imagem</span>
        </button>
      ))}
    </div>
  );
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const fmtTime = s => { if (!s || !isFinite(s)) return '0:00'; const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, '0')}`; };

  if (msg.message_type === 'audio') return (
    <div className="mb-1">
      {media ? (
        <div className="flex items-center gap-2.5 bg-[#e7ffd4] rounded-2xl px-3 py-2.5 min-w-[240px] max-w-[320px]">
          <button onClick={toggleAudio} className="w-9 h-9 bg-[#25d366] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-[#1da851] transition-colors">
            {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[2px] h-6">
              {Array.from({ length: 32 }, (_, i) => {
                const h = [3,5,8,12,6,14,10,7,15,9,4,11,13,6,8,16,7,12,5,10,14,8,6,11,9,15,7,13,4,10,8,12][i % 32];
                const filled = i / 32 <= audioProgress;
                return <div key={i} className={`w-[3px] rounded-full transition-all ${filled ? 'bg-[#25d366]' : 'bg-[#b5d9b0]'}`} style={{ height: `${h}px` }} />;
              })}
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-gray-500 font-mono">{fmtTime(audioProgress * audioDuration)}</span>
              <span className="text-[9px] text-gray-500 font-mono">{fmtTime(audioDuration)}</span>
            </div>
          </div>
          <button onClick={handleTranscribe} disabled={transcribing || !!transcription} title="Transcrever audio" className="flex-shrink-0 p-1.5 rounded-full hover:bg-black/5 disabled:opacity-40 transition-colors">
            <FileText className="w-4 h-4 text-[#075e54]" />
          </button>
          <audio ref={audioRef} src={media}
            onEnded={() => { setPlaying(false); setAudioProgress(0); }}
            onLoadedMetadata={e => setAudioDuration(e.target.duration)}
            onTimeUpdate={e => { if (e.target.duration) setAudioProgress(e.target.currentTime / e.target.duration); }} />
        </div>
      ) : mediaError ? (
        <MediaErrorBadge icon={<Mic className="w-4 h-4" />} />
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-200 transition-colors">
            <Mic className="w-4 h-4 text-[#25d366]" />
            <span className="text-xs text-gray-600 font-medium">{loading ? 'Carregando...' : 'Ouvir audio'}</span>
          </button>
          <button onClick={handleTranscribe} disabled={transcribing || !!transcription} title="Transcrever audio" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-40 transition-colors">
            <FileText className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
      {transcribing && (
        <p className="text-[10px] text-gray-400 mt-1.5 italic">Transcrevendo...</p>
      )}
      {transcription && (
        <div className="mt-1.5 bg-white/80 border border-gray-200 rounded-xl px-3 py-2 max-w-[320px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Transcricao</p>
          <p className="text-xs text-gray-700 leading-relaxed">{transcription}</p>
          {!msg.from_me && msg.chat_id && (
            <button
              onClick={async () => {
                if (aiTriggered) return;
                try {
                  await api.triggerAI(msg.chat_id, tenantId, transcription);
                  setAiTriggered(true);
                } catch (e) { setAiTriggered('erro'); }
              }}
              disabled={!!aiTriggered}
              className="mt-2 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 bg-[#075e54] text-white hover:bg-[#054d44] disabled:bg-gray-300 disabled:text-gray-500"
            >
              {aiTriggered === 'erro' ? 'Erro ao acionar' : aiTriggered ? 'IA acionada' : 'Acionar IA'}
            </button>
          )}
        </div>
      )}
    </div>
  );
  if (msg.message_type === 'video') return (
    <div className="mb-1">
      {media ? <video src={media} controls className="max-w-[250px] rounded-lg" />
        : mediaError ? <MediaErrorBadge icon={<Play className="w-4 h-4" />} />
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Play className="w-5 h-5 text-blue-700" /><span className="text-xs">{loading ? 'Carregando...' : 'Ver video'}</span></button>}
    </div>
  );
  if (msg.message_type === 'document') {
    const rawName = msg.content && !msg.content.startsWith('[') ? msg.content : 'documento';
    const ext = rawName.includes('.') ? rawName.split('.').pop().toUpperCase().slice(0, 5) : 'DOC';
    const extColors = { PDF: 'bg-red-600', DOC: 'bg-blue-700', DOCX: 'bg-blue-700', XLS: 'bg-green-700', XLSX: 'bg-green-700', PPT: 'bg-orange-600', PPTX: 'bg-orange-600', ZIP: 'bg-yellow-600', RAR: 'bg-yellow-600' };
    const extBg = extColors[ext] || 'bg-gray-600';
    return (
      <div className="mb-1">
        {media
          ? <a href={media} download={rawName} className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-200 transition-colors min-w-[180px] max-w-[260px]">
              <div className={`${extBg} text-white text-[9px] font-bold px-1.5 py-1.5 rounded-lg min-w-[36px] text-center flex-shrink-0`}>{ext}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-800 truncate leading-tight">{rawName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Toque para baixar</p>
              </div>
              <Download className="w-4 h-4 text-blue-700 flex-shrink-0" />
            </a>
          : mediaError ? <MediaErrorBadge icon={<FileText className="w-4 h-4" />} />
          : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 min-w-[180px] max-w-[260px] hover:bg-gray-200 transition-colors w-full text-left">
              <div className={`${loading ? 'bg-gray-400' : extBg} text-white text-[9px] font-bold px-1.5 py-1.5 rounded-lg min-w-[36px] text-center flex-shrink-0`}>{ext}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-800 truncate leading-tight">{rawName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{loading ? 'Carregando...' : 'Toque para baixar'}</p>
              </div>
            </button>
        }
      </div>
    );
  }
  if (msg.message_type === 'sticker') return (
    <div className="mb-1">
      {media ? (
        <img src={media} alt="sticker" loading="lazy" decoding="async" className="w-[140px] h-[140px] object-contain" />
      ) : loading ? (
        <div className="w-[80px] h-[80px] bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
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

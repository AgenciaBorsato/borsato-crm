# Patch pendente — imagens enviadas pelo atendente

Os patches abaixo precisam ser aplicados manualmente no App.jsx:

## 1. MediaBubble — aceitar cachedSrc prop

```diff
- function MediaBubble({ msg, tenantId }) {
-   const [media, setMedia] = useState(null);
+ function MediaBubble({ msg, tenantId, cachedSrc }) {
+   const [media, setMedia] = useState(cachedSrc || null);
```

## 2. loadMedia — nao tentar se sem media_url

```diff
  const loadMedia = async () => {
-   if (!msg.media_url || msg.media_url === 'undefined' || loading || media) return;
+   if (loading || media) return;
+   if (!msg.media_url || msg.media_url === 'undefined') return;
```

## 3. useEffect — respeitar cachedSrc

```diff
  useEffect(() => {
+   if (cachedSrc) { setMedia(cachedSrc); return; }
    const autoTypes = ['image', 'sticker'];
    if (autoTypes.includes(msg.message_type) && msg.media_url && msg.media_url !== 'undefined') {
      loadMedia();
    }
- }, [msg.id]);
+ }, [msg.id, cachedSrc]);
```

## 4. ChatView — adicionar localMediaCache

Após `const [loadingTrash, setLoadingTrash] = useState(false);` adicionar:
```js
  const localMediaCache = useRef({});
```

## 5. sendFile — guardar no cache

```diff
        const base64 = reader.result.split(',')[1];
+       const dataUrl = reader.result;
+       const base64 = dataUrl.split(',')[1];
        ...
-       await loadMsgs(cur.id); await load(); setSending(false);
+       const newMsgs = await api.getChatMessages(cur.id, 100, 0);
+       const lastSent = [...newMsgs].reverse().find(m => Number(m.is_from_me) === 1 && ['image','video','document'].includes(m.message_type));
+       if (lastSent) localMediaCache.current[lastSent.id] = dataUrl;
+       setMsgs(newMsgs);
+       await load(); setSending(false);
```

## 6. Render mensagens — cachedSrc e hasMedia

```diff
                const fromMe = ...;
+               const cachedSrc = fromMe ? (localMediaCache.current[m.id] || null) : null;
+               const isMedia = ['image','video','document','audio','sticker'].includes(m.message_type);
-               const hasMedia = m.media_url && m.message_type !== 'text';
+               const hasMedia = isMedia && (m.media_url || cachedSrc);
```

## 7. MediaBubble — passar cachedSrc

```diff
-               {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} />}
+               {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} cachedSrc={cachedSrc} />}
```

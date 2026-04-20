import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Search, Send, X, Check, Trash2, Edit2, Paperclip, Plus,
  Users2, CheckCheck, RotateCcw, RefreshCw, AtSign, Crown, Shield, Bot,
  Reply, Forward, CornerUpRight, Phone, Bell, CalendarClock, Clock, Volume2, VolumeX,
  Smile, Lock, StickyNote
} from 'lucide-react';

// ─── Emojis (10 categorias expandidas) ───────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label:'😀', title:'Sorrisos', emojis:['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🫠','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👻','💀','☠️','👽','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'] },
  { label:'👋', title:'Gestos', emojis:['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','👀','👁','👅','🦷','🦴','👣','💋','🫦','👶','🧒','👦','👧','🧔','👱','👴','👵','🧓','👮','🕵️','💂','🧑‍⚕️','🧑‍🎓','🧑‍🍳','🧑‍🔧','🧑‍💻','🧑‍🎤','🧑‍🎨','🧑‍✈️','🧑‍🚀','🧑‍🚒','🧑‍⚖️','🧑‍🌾','🧑‍💼'] },
  { label:'❤️', title:'Corações', emojis:['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','❤️‍🔥','❤️‍🩹','💋','💯','🔥','✨','⭐','🌟','💫','⚡','🌈','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','🎖️','🏅','🎗️','🎀','🎆','🎇','🧨','✅','❌','⭕','🛑','⛔','⚠️','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','♻️','🆘','🆕','🆒','🆓','🆗','🆙','©️','®️','™️'] },
  { label:'🐶', title:'Animais', emojis:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐛','🐌','🐞','🐜','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦛','🦏','🦒','🦘','🦬','🐃','🐄','🐎','🐑','🦙','🐕','🦮','🐩','🐈','🕊️','🦚','🦜','🦩','🌿','🌱','🌲','🌳','🌴','🌵','🌾','🌺','🌸','🌼','🌻','🌹','🥀','🌷','🌊','🏔️','🌋','🌄','🌅','🌃','🌆','🌇','🌉','🌌','🌠','🌤️','⛅','🌧️','⛈️','🌨️','❄️','☃️','⛄','💨','🌀','☔','🌙','🌛','🌜','🌕','🌑','🌞','☀️','🌈'] },
  { label:'🍕', title:'Comida', emojis:['🍕','🍔','🌮','🌯','🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇','🥞','🧈','🍞','🥐','🥖','🫓','🧀','🥗','🥘','🍝','🍜','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍩','🍪','🥜','🍯','☕','🫖','🍵','🧋','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧃','🧊','🍼','🥛','🍦','🍧','🍨','🫐','🍓','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🫒','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍇','🍈','🍉','🍊','🍋','🍌','🍎','🍏','🍐'] },
  { label:'✈️', title:'Viagem', emojis:['✈️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🚢','🚂','🚄','🚅','🚇','🚌','🚍','🚗','🚕','🚙','🛻','🚚','🚛','🚜','🏎️','🏍️','🛵','🚲','🛴','🛹','🛼','🚧','⚓','🗺️','🗼','🗽','⛪','🕌','⛩️','🏔️','🗻','🌋','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️','🏠','🏡','🏢','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗿','🌍','🌎','🌏','🌐','🧭','🛖','🏕️'] },
  { label:'⚽', title:'Atividades', emojis:['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥍','🏏','🪃','⛳','🪁','🏹','🎣','🤿','🎽','🎿','🛷','🥌','🎯','🎮','🎲','🎰','🎭','🎨','🖼️','🎪','🎠','🎡','🎢','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎬','📽️','📺','📻','🎙️','🎟️','🎫','🎗️','🎀','🏆','🥇','🥈','🥉','🏅','🎖️'] },
  { label:'💡', title:'Objetos', emojis:['💡','🔦','🕯️','🪔','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📀','📷','📸','📹','🎥','📞','☎️','📺','📻','🧭','⏱️','⏰','⏳','🔋','🔌','🪴','🪑','🚪','🛋️','🛏️','🛁','🚿','💊','💉','🩺','🩻','🩹','🩼','💰','💳','💎','⚖️','🪜','🧰','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','🪤','🔑','🗝️','🔐','🔒','🔓','📦','📫','📬','📪','📥','📤','📧','✏️','✒️','🖊️','🖋️','📝','📁','📂','📋','📊','📈','📉','📅','📆','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🏷️','💼','📌','📍','✂️','🔍','🔎','🔬','🔭','📡','🧲','🪄','🧸','🪆'] },
  { label:'🔣', title:'Símbolos', emojis:['💯','🔞','📵','🚫','❌','⭕','🛑','⛔','📛','🚷','🚯','🚳','🔕','💤','✅','☑️','🆗','🆙','🆒','🆕','🆓','⁉️','‼️','❗','❓','⚠️','♻️','✔️','🔗','➡️','⬅️','⬆️','⬇️','↩️','↪️','🔄','🔃','🔀','🔁','🔂','▶️','⏩','⏪','⏫','⏬','🆘','🆔','🆚','🔤','🔡','🔠','💱','💲','©️','®️','™️','🔔','🔕','🎵','🎶','⚕️','♾️','🔰','📶','📳','📴','📵','🔊','🔉','🔈','🔇','📢','📣','📯','🃏','🎴','🀄','ℹ️','🔅','🔆','🔱','⚜️','🏧','🚾','♿','🅿️','🛗','🈳','🈹','🈺','🈵','🈴','🈲','🈶','🈚','🈸','🈷️'] },
  { label:'🇧🇷', title:'Bandeiras', emojis:['🇧🇷','🇺🇸','🇬🇧','🇪🇸','🇵🇹','🇫🇷','🇩🇪','🇮🇹','🇯🇵','🇰🇷','🇨🇳','🇷🇺','🇦🇷','🇨🇴','🇲🇽','🇨🇱','🇵🇪','🇻🇪','🇺🇾','🇧🇴','🇵🇾','🇪🇨','🇬🇹','🇭🇳','🇳🇮','🇨🇷','🇵🇦','🇩🇴','🇨🇺','🇭🇹','🇿🇦','🇳🇬','🇪🇬','🇲🇦','🇰🇪','🇮🇳','🇮🇩','🇵🇭','🇻🇳','🇹🇭','🇲🇾','🇸🇬','🇦🇺','🇨🇦','🇲🇿','🇦🇴','🇵🇱','🇳🇱','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇨🇭','🇦🇹','🇬🇷','🇹🇷','🇮🇱','🇸🇦','🇦🇪','🏳️','🏴','🏳️‍🌈','🏴‍☠️','🚩'] },
];

// Palavras-chave por emoji para busca
const EMOJI_KEYWORDS = {'😀':'feliz happy sorrindo alegre smile bom dia','😃':'feliz happy sorrindo alegre smile','😄':'feliz happy sorrindo alegre smile','😁':'feliz happy sorrindo alegre radiante','😆':'feliz happy rindo alegre laugh','😅':'aliviado nervoso suado relieved laugh','😂':'rindo laugh funny haha choro lol rofl','🤣':'rindo laugh funny haha lol rolando','🥲':'aliviado feliz triste emocionado','😊':'feliz happy sorrindo alegre','😇':'inocente anjo feliz','🙂':'sorrindo feliz ok','🙃':'ironico sarcasmo upside down','😉':'piscando wink','😌':'aliviado satisfeito calmo relieved','😍':'amor love apaixonado coracao olhos','🥰':'amor love apaixonado carinhoso amoroso','😘':'beijo kiss amor love','😗':'beijo kiss','😙':'beijo kiss','😚':'beijo kiss','😋':'delicioso gostoso yummy comida','😛':'lingua brincadeira funny','😝':'lingua brincadeira','😜':'louco brincadeira funny','🤪':'louco crazy brincadeira','🤩':'apaixonado emocionado star struck animado excited','🥳':'festa party parabens birthday animado','😎':'legal cool oculos sunglass','🤓':'nerd geek estudioso','🧐':'pensando intrigado monoculo','😏':'sorriso ironico smirk safado','😒':'desanimado entediado unamused','😞':'triste sad desapontado','😔':'triste sad pensativo pensive','😟':'preocupado worried triste','🥺':'olhos cachorro please pedindo triste puppy eyes','😢':'triste sad chorando cry lagrima','😭':'chorando cry triste sad muito','😤':'bravo raiva frustrado steam','😠':'bravo angry raiva','😡':'bravo angry raiva pouting','🤬':'furioso angry rage palavrao','🤯':'surpreso chocado mind blown explodiu','😳':'surpreso corado flushed embarrassed','🥵':'calor quente hot fever','🥶':'frio cold gelo','😱':'medo scared assustado surprised chocado','😨':'medo scared fearful','😰':'ansioso nervoso suado anxious','😥':'preocupado triste disappointed','😓':'suado nervoso sweat','🤗':'abraco hug carinhoso','🤔':'pensando thinking hmm','🤭':'rindo secreto ah nao oops','🤫':'silencio segredo shh quiet','🤥':'mentiroso lying nariz comprido','😶':'sem expressao speechless','😐':'neutro neutral','😑':'expressionless entediado','😬':'nervoso constrangido grimacing','🙄':'revirando olhos eye roll','😴':'dormindo sleep cansado tired zzz','😷':'mascara doente sick mask','🤒':'doente sick febre','🤕':'doente sick machucado','🤑':'dinheiro money rico rich','😈':'diabinho evil bad','👿':'diabinho angry evil','👻':'fantasma ghost','💀':'caveira skull morto dead','🤖':'robo robot','👋':'oi tchau hi bye hello wave','✋':'para stop high five','👌':'ok perfeito tudo bem fine','✌️':'vitoria peace dois dedos','🤞':'torcer esperanca boa sorte luck','🤟':'rock amo','🤘':'rock heavy metal','🤙':'ligame telefone hang loose','👈':'esquerda left apontando','👉':'direita right apontando','👆':'acima up apontando','👇':'abaixo down apontando','☝️':'um first apontando cima','👍':'ok bom aprovado like concordo thumbs up sim yes','👎':'nao ruim dislike thumbs down','✊':'forca power punho','👊':'soco punch','🤛':'soco esquerda','🤜':'soco direita','👏':'palmas aplausos bravo clapping','🙌':'feliz celebracao palmas hands up','🫶':'amor love carinho heart hands obrigado','👐':'abertas maos open','🤲':'maos juntas cupped','🤝':'acordo aperto mao handshake trato','🙏':'obrigado please favor pray oracao pedir obrigada','✍️':'escrevendo writing assinando','💅':'unhas nails','💪':'forte strength musculo biceps','🦾':'braco mecanico robo forte','❤️':'amor love coracao heart','🧡':'amor love coracao laranja','💛':'amor love coracao amarelo','💚':'amor love coracao verde','💙':'amor love coracao azul','💜':'amor love coracao roxo','🖤':'amor love coracao preto','🤍':'amor love coracao branco','🤎':'amor love coracao marrom','💔':'coracao partido broken heart dor','❣️':'coracao exclamacao amor','💕':'dois coracoes amor love','💞':'coracoes girando amor','💓':'coracao batendo amor','💗':'coracao crescendo amor','💖':'coracao brilhante amor','💘':'flecha cupido amor','💝':'coracao laco presente amor','💋':'beijo kiss amor love','💯':'perfeito cem por cento aprovado ok','🔥':'fogo fire quente hot bomba incrivel','✨':'brilho sparkle estrela magico','⭐':'estrela star favorito','🌟':'estrela star destaque brilhante','💫':'estrela star tonteando','🎉':'festa party parabens birthday celebracao','🎊':'festa party parabens celebracao confete','🎈':'festa party balao balloon parabens','🎁':'presente gift parabens birthday','🏆':'trofeu trophy campeao winner','🥇':'ouro primeiro gold winner','🥈':'prata segundo silver','🥉':'bronze terceiro','✅':'sim certo correto ok verdadeiro check','❌':'nao errado wrong false negativo','⚠️':'atencao warning cuidado','🐶':'cachorro dog animal pet','🐱':'gato cat animal pet','🐭':'rato mouse animal','🐹':'hamster animal pet','🐰':'coelho rabbit animal','🦊':'raposa fox animal','🐻':'urso bear animal','🐼':'panda animal','🐨':'coala koala animal','🐯':'tigre tiger animal','🦁':'leao lion animal','🐮':'vaca cow animal','🐷':'porco pig animal','🐸':'sapo frog animal','🐵':'macaco monkey animal','🙈':'macaco nao ver','🙉':'macaco nao ouvir','🙊':'macaco nao falar','🐔':'galinha chicken frango','🐧':'pinguim penguin','🦋':'borboleta butterfly','🐢':'tartaruga turtle devagar slow','🦄':'unicornio unicorn magico','🐬':'golfinho dolphin','🦈':'tubarao shark','🌺':'flor flower bonito','🌸':'flor florzinha sakura','🌻':'girassol sunflower','🌹':'rosa rose amor romantico','💐':'flores flowers buque','🌷':'tulipa tulip flores','🌊':'onda wave mar sea praia','☀️':'sol sun quente hot dia','🌙':'lua moon noite night','🌈':'arco iris rainbow','🌧️':'chuva rain','❄️':'neve snow frio cold gelo ice','⚡':'raio lightning trovao','🍕':'pizza comida food','🍔':'hamburguer burger comida food','🍟':'batata frita fries comida','🌮':'taco comida food','🍝':'macarrao pasta comida','🍜':'ramen macarrao comida','🍣':'sushi comida japones','🍩':'rosquinha donut comida','🍪':'biscoito cookie comida','🎂':'bolo cake parabens birthday','🧁':'cupcake bolo doce sweet','🍫':'chocolate comida doce sweet','🍭':'bala candy doce sweet','🍦':'sorvete ice cream','🍓':'morango strawberry fruta','🍉':'melancia watermelon fruta','🍎':'maca apple fruta','🍌':'banana fruta','🍋':'limao lemon fruta azedo','🥑':'abacate avocado','☕':'cafe coffee bebida drink','🧋':'bubble tea boba bebida','🍺':'cerveja beer bebida','🥂':'brinde champanhe toast','🍷':'vinho wine bebida','✈️':'aviao plane viagem travel voo','🚀':'foguete rocket espaco space','🚗':'carro car viagem','🏎️':'carro corrida race car','🚲':'bicicleta bike','🚢':'navio ship barco viagem','🏠':'casa house home','🏢':'edificio building escritorio','🏖️':'praia beach areia sand','🌍':'mundo world terra earth','⚽':'bola futebol soccer','🏀':'basquete basketball','🏈':'futebol americano football','🎾':'tenis tennis','🎮':'video game jogo controle','🎲':'dado dice jogo','🎤':'microfone microphone cantor','🎧':'fone headphone musica','🎵':'nota musical music song','🎶':'notas musicais music song','🎸':'guitarra guitar musica','🎹':'piano teclado','🥁':'bateria drums musica','🎨':'arte art pintura painting','📱':'celular phone smartphone','💻':'computador laptop computer','📷':'camera foto photo','💊':'remedio pill medicine','💉':'injecao injection vacina','🩺':'estetoscopio medico doctor','💰':'dinheiro money rico','💳':'cartao card credito','💎':'diamante diamond joia rico','🔑':'chave key','📚':'livros books estudar study','📝':'nota escrever write','🔍':'lupa search buscar procurar','💡':'lampada ideia idea light','🔧':'ferramenta tool chave','🔒':'cadeado lock seguro','🎁':'presente gift parabens birthday','🪄':'varinha magica magic wand','🇧🇷':'brasil brazil bandeira flag','🇺🇸':'estados unidos usa america flag'};

function EmojiPicker({ onSelect, onClose, onGif }) {
  const [tab, setTab] = React.useState('emoji');
  const [cat, setCat] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [gifQuery, setGifQuery] = React.useState('');
  const [gifs, setGifs] = React.useState([]);
  const [gifLoading, setGifLoading] = React.useState(false);
  const [gifConfigured, setGifConfigured] = React.useState(true);
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  React.useEffect(() => {
    if (tab === 'emoji') setTimeout(() => searchRef.current?.focus(), 50);
    if (tab === 'gif') loadGifs('');
  }, [tab]);

  React.useEffect(() => {
    if (tab !== 'gif') return;
    const t = setTimeout(() => loadGifs(gifQuery), 400);
    return () => clearTimeout(t);
  }, [gifQuery]);

  const loadGifs = async (q) => {
    setGifLoading(true);
    try {
      const res = await api.searchGifs(q);
      setGifConfigured(res.configured !== false);
      setGifs(res.results || []);
    } catch { setGifs([]); }
    setGifLoading(false);
  };

  const searchResults = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    const seen = new Set(); const out = [];
    for (const [emoji, kw] of Object.entries(EMOJI_KEYWORDS)) {
      if (kw.includes(q) && !seen.has(emoji)) { seen.add(emoji); out.push(emoji); }
    }
    return out;
  }, [search]);

  const displayEmojis = searchResults ?? EMOJI_CATEGORIES[cat].emojis;

  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-80 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button onClick={() => setTab('emoji')} className={`flex-1 py-2 text-sm font-medium transition-colors ${tab==='emoji'?'text-[#25d366] border-b-2 border-[#25d366]':'text-gray-400 hover:text-gray-600'}`}>😀 Emoji</button>
        <button onClick={() => setTab('gif')} className={`flex-1 py-2 text-sm font-medium transition-colors ${tab==='gif'?'text-[#25d366] border-b-2 border-[#25d366]':'text-gray-400 hover:text-gray-600'}`}>GIF</button>
      </div>

      {tab === 'emoji' && (<>
        {/* Search */}
        <div className="px-2 pt-2 pb-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">🔍</span>
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar emoji..." className="w-full pl-7 pr-7 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-[#25d366]/30" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
          </div>
        </div>
        {/* Category tabs */}
        {!search && (
          <div className="flex overflow-x-auto border-b border-gray-100 px-1 gap-0.5" style={{scrollbarWidth:'none'}}>
            {EMOJI_CATEGORIES.map((c, i) => (
              <button key={i} onClick={() => setCat(i)} title={c.title}
                className={`flex-shrink-0 py-1.5 px-2 text-base hover:bg-gray-50 rounded-lg transition-colors ${cat===i?'bg-gray-100':''}`}>{c.label}</button>
            ))}
          </div>
        )}
        {!search && <div className="px-3 pt-1.5 pb-0.5"><span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{EMOJI_CATEGORIES[cat].title}</span></div>}
        {/* Grid */}
        <div className="p-1.5 grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
          {displayEmojis.length === 0
            ? <div className="col-span-8 text-center py-6 text-gray-400 text-sm">Nenhum emoji encontrado</div>
            : displayEmojis.map(e => (
              <button key={e} onClick={() => onSelect(e)}
                className="p-1.5 text-lg hover:bg-gray-100 rounded-lg transition-colors leading-none hover:scale-110">{e}</button>
            ))}
        </div>
        {search && searchResults && searchResults.length > 0 && (
          <div className="px-3 pb-2 text-[10px] text-gray-400">{searchResults.length} emoji{searchResults.length!==1?'s':''} encontrado{searchResults.length!==1?'s':''}</div>
        )}
      </>)}

      {tab === 'gif' && (<>
        <div className="px-2 pt-2 pb-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">🔍</span>
            <input value={gifQuery} onChange={e => setGifQuery(e.target.value)} autoFocus
              placeholder="Buscar GIF..." className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-[#25d366]/30" />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {!gifConfigured && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🎬</div>
              <p className="text-xs">Configure TENOR_API_KEY<br/>para ativar GIFs</p>
            </div>
          )}
          {gifConfigured && gifLoading && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-2xl animate-pulse">🔍</div>
              <p className="text-xs mt-2">Buscando...</p>
            </div>
          )}
          {gifConfigured && !gifLoading && gifs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🎬</div>
              <p className="text-xs">{gifQuery ? 'Nenhum GIF encontrado' : 'Digite para buscar'}</p>
            </div>
          )}
          {gifConfigured && !gifLoading && gifs.length > 0 && (
            <div className="grid grid-cols-2 gap-1">
              {gifs.map((g, i) => (
                <button key={i} onClick={() => { onGif && onGif(g); onClose(); }}
                  className="relative rounded-lg overflow-hidden hover:opacity-80 transition-opacity bg-gray-100 aspect-video">
                  <img src={g.preview} alt="GIF" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
        {!gifQuery && gifs.length > 0 && (
          <div className="px-3 pb-1.5 text-[10px] text-gray-400 text-center">Em destaque · Tenor</div>
        )}
      </>)}
    </div>
  );
}
import { POLL_INTERVAL, CM } from '../constants';
import { renderText } from '../utils/renderText';
import api from '../api';
import ProfilePic, { ParticipantAvatar } from './ProfilePic';
import MediaBubble from './MediaBubble';
import LeadSummaryCard from './LeadSummaryCard';
import EditLeadModal from './EditLeadModal';

// ─── Separador de data ───────────────────────────────────────────────────────
function DateSeparator({ timestamp }) {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  let label;
  if (d.toDateString() === today.toDateString()) label = 'Hoje';
  else if (d.toDateString() === yesterday.toDateString()) label = 'Ontem';
  else {
    const sameYear = d.getFullYear() === today.getFullYear();
    label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) });
  }
  return (
    <div className="flex items-center justify-center my-3 select-none">
      <span className="bg-[#e1f2fb] text-[#4a9dba] text-[11px] font-medium px-3 py-1 rounded-full shadow-sm border border-[#cde9f6]">
        {label}
      </span>
    </div>
  );
}

// ─── Preview de link ─────────────────────────────────────────────────────────
const URL_REGEX = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*/i;
// Cache global: evita múltiplos fetches para a mesma URL em mensagens diferentes
const _linkPreviewCache = new Map();
function LinkPreviewCard({ url, tenantId }) {
  const [data, setData] = React.useState(_linkPreviewCache.get(url) ?? null);
  const [done, setDone] = React.useState(_linkPreviewCache.has(url));
  React.useEffect(() => {
    if (_linkPreviewCache.has(url)) return; // já resolvido, não refetch
    let cancelled = false;
    api.fetchLinkPreview(url).then(d => {
      const result = (d && !d.error && d.title) ? d : null;
      _linkPreviewCache.set(url, result);
      if (!cancelled) setData(result);
    }).catch(() => { _linkPreviewCache.set(url, null); }).finally(() => { if (!cancelled) setDone(true); });
    return () => { cancelled = true; };
  }, [url]);
  if (!data || !done) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       onClick={e => e.stopPropagation()}
       className="block mt-2 border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors no-underline">
      {data.image && (
        <img src={data.image} alt="" loading="lazy" decoding="async" className="w-full h-[120px] object-cover"
             onError={e => e.target.style.display='none'} />
      )}
      <div className="px-3 py-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{data.siteName || data.host}</p>
        <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2">{data.title}</p>
        {data.description && (
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{data.description}</p>
        )}
      </div>
    </a>
  );
}

function ParticipantRow({ p, onMention }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <ParticipantAvatar name={p.name} phone={p.phone} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-bold text-xs truncate">{p.name || p.phone || 'Contato desconhecido'}</p>
          {p.admin === 'superadmin' && <Crown className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />}
          {p.admin === 'admin' && <Shield className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
        </div>
        {p.name && p.phone && <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>}
        {!p.name && !p.phone && p.jid && <p className="text-[9px] text-gray-300 font-mono truncate">{p.jid.split('@')[0]}</p>}
      </div>
      {hover && (
        <button onClick={onMention} title="Mencionar no chat"
          className="p-1 text-blue-700 hover:bg-blue-50 rounded transition-all flex-shrink-0">
          <AtSign className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function TrashModal({ chats, loading, onClose, onRestore, chatDisplayName, isGrp, fmt }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-gray-400" /><h2 className="font-bold text-sm">Lixeira</h2>{chats.length > 0 && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-bold">{chats.length}</span>}</div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? <div className="py-12 text-center text-gray-400 text-xs">Carregando...</div>
          : chats.length === 0 ? (
            <div className="py-12 text-center text-gray-400"><Trash2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs font-bold">Lixeira vazia</p><p className="text-[10px] mt-1">Conversas excluidas aparecem aqui</p></div>
          ) : chats.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">{chatDisplayName(c)}{isGrp(c) && <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>
                <p className="text-[9px] text-gray-300 mt-0.5">Excluido em {fmt(c.deleted_at)}</p>
              </div>
              <button onClick={() => onRestore(c.id)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-semibold hover:bg-blue-100 transition-all"><RotateCcw className="w-3 h-3" /> Restaurar</button>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100"><p className="text-[10px] text-gray-400 text-center">Conversas restauradas voltam para a lista principal com o historico intacto</p></div>
      </div>
    </div>
  );
}

export default function ChatView({ tenant, columns, onRefresh, requestedPhone, onPhoneHandled, currentUser }) {
  const [chats, setChats] = useState([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [cur, setCur] = useState(() => { const s = localStorage.getItem(`currentChat_${tenant.id}`); return s ? JSON.parse(s) : null; });
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState('all');
  const [files, setFiles] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedChats, setDeletedChats] = useState([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const localMediaCache = useRef({});
  const [participants, setParticipants] = useState([]);
  const [loadingPart, setLoadingPart] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [forwardSearch, setForwardSearch] = useState('');
  const [contactResults, setContactResults] = useState([]);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [showQuickFollowUp, setShowQuickFollowUp] = useState(false);
  const [showScheduleMsg, setShowScheduleMsg] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatViewers, setChatViewers] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const typingDebounceRef = useRef(null);
  const mentionStartRef = useRef(-1);
  const inputRef = useRef(null);
  const curRef = useRef(cur);
  const endRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const fileRef = useRef(null);
  const prevUnreadRef = useRef(0);
  const initialLoadRef = useRef(true);
  const myName = currentUser?.name || '';
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('borsato_sound') !== 'off');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('borsato_sound', next ? 'on' : 'off');
  };

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [soundEnabled]);

  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => {
    if (cur) localStorage.setItem(`currentChat_${tenant.id}`, JSON.stringify(cur));
    else localStorage.removeItem(`currentChat_${tenant.id}`);
  }, [cur, tenant.id]);
  useEffect(() => {
    // Inicializar leituras apenas na primeira vez que o usuario acessa o CRM neste navegador
    // Usa localStorage para nao disparar a cada sessao/aba nova
    const initKey = `chatReadsInit_${tenant.id}_${currentUser?.id || 'u'}`;
    if (!localStorage.getItem(initKey)) {
      api.markAllChatsRead(tenant.id).then(() => localStorage.setItem(initKey, '1')).catch(() => {});
    }
    load(); const i = setInterval(load, POLL_INTERVAL); return () => clearInterval(i);
  }, [tenant.id]);
  useEffect(() => {
    if (cur) { loadMsgs(cur.id); loadLead(cur); api.markChatRead(cur.id).catch(() => {}); const i = setInterval(() => loadMsgs(cur.id), POLL_INTERVAL); return () => clearInterval(i); }
  }, [cur?.id]);
  useEffect(() => {
    if (!cur) { setTypingUsers([]); setChatViewers([]); return; }
    setIsNoteMode(false);
    setChatSearchQuery('');
    setShowChatSearch(false);
    const poll = async () => { try { const r = await api.getTyping(cur.id); setTypingUsers(Array.isArray(r) ? r : []); } catch {} };
    poll(); const i = setInterval(poll, 3000); return () => clearInterval(i);
  }, [cur?.id]);
  useEffect(() => {
    if (!cur) return;
    const heartbeat = () => { api.setChatViewing(cur.id).catch(() => {}); };
    const pollViewers = async () => { try { const r = await api.getChatViewers(cur.id); setChatViewers(Array.isArray(r) ? r : []); } catch {} };
    heartbeat();
    pollViewers();
    const hb = setInterval(heartbeat, 25000);
    const pv = setInterval(pollViewers, 5000);
    return () => { clearInterval(hb); clearInterval(pv); };
  }, [cur?.id]);
  useEffect(() => {
    if (cur && isGrp(cur)) { setShowParticipants(false); setMentionQuery(null); mentionStartRef.current = -1; loadParticipants(cur.remote_jid); }
    else { setParticipants([]); setShowParticipants(false); setMentionQuery(null); }
  }, [cur?.id]);
  useEffect(() => {
    if (!requestedPhone || chats.length === 0) return;
    const clean = requestedPhone.replace(/\D/g, '');
    const match = chats.find(c => (c.contact_phone || '').replace(/\D/g, '') === clean || (c.remote_jid || '').replace(/[^0-9]/g, '').includes(clean));
    if (match) { selectChat(match); onPhoneHandled?.(); }
  }, [requestedPhone, chats]);
  // Scroll inteligente: so rola para o final se usuario nao estiver lendo mensagens antigas
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs]);
  // Resetar scroll ao trocar de conversa
  useEffect(() => {
    userScrolledUpRef.current = false;
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [cur?.id]);
  useEffect(() => {
    const handleVisibility = () => { if (!document.hidden) { const total = chats.reduce((sum, c) => sum + (Number(c.user_unread_count) || 0), 0); document.title = total > 0 ? `(${total}) Borsato CRM` : 'Borsato CRM'; } };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { document.removeEventListener('visibilitychange', handleVisibility); document.title = 'Borsato CRM'; };
  }, [chats]);

  const load = async () => {
    try {
      const rawList = await api.getChats(tenant.id);
      const chatList = rawList.filter((c, i, a) => a.findIndex(x => x.id === c.id) === i);
      setChats(chatList);
      setChatsLoaded(true);
      const ac = curRef.current;
      if (ac) { const upd = chatList.find(c => c.id === ac.id); if (upd) setCur(upd); }
      const totalUnread = chatList.reduce((sum, c) => sum + (Number(c.user_unread_count) || 0), 0);
      if (!initialLoadRef.current && totalUnread > prevUnreadRef.current) playNotificationSound();
      document.title = totalUnread > 0 ? `(${totalUnread}) Borsato CRM` : 'Borsato CRM';
      prevUnreadRef.current = totalUnread; initialLoadRef.current = false;
    } catch (e) { console.error('LOAD_CHATS_ERROR:', e.message, 'tenant:', tenant.id); }
  };
  const loadMsgs = async (id) => { try { setMsgs(await api.getChatMessages(id, 100, 0)); } catch (e) { console.error('LOAD_MSGS_ERROR:', e.message, 'chatId:', id); } };
  const loadLead = async (c) => {
    if (isGrp(c)) { setLead(null); return; }
    const ph = c.contact_phone || c.remote_jid?.split('@')[0];
    if (!ph) { setLead(null); return; }
    try { setLead(await api.getLeadByPhone(ph, tenant.id)); } catch { setLead(null); }
  };
  const loadParticipants = async (groupJid) => {
    setLoadingPart(true);
    try { const d = await api.getGroupParticipants(tenant.id, groupJid); setParticipants(d?.participants || []); } catch (e) { console.error('LOAD_PARTICIPANTS_ERROR:', e.message, 'groupJid:', groupJid); }
    finally { setLoadingPart(false); }
  };
  const loadDeletedChats = async () => { setLoadingTrash(true); try { setDeletedChats(await api.getDeletedChats(tenant.id)); } catch (e) { console.error('LOAD_DELETED_CHATS_ERROR:', e.message); } finally { setLoadingTrash(false); } };
  const restoreChat = async (chatId) => {
    try { await api.restoreChat(chatId); setDeletedChats(prev => prev.filter(c => c.id !== chatId)); await load(); }
    catch { alert('Erro ao restaurar conversa'); }
  };

  const isGrp = c => Number(c.is_group) === 1 || c.is_group === true;
  const chatDisplayName = c => {
    // 1. Nome salvo no celular (contacts.upsert da Evolution API) — maior prioridade
    if (c.device_contact_name) return c.device_contact_name;
    // 2. Nome do lead/contato no CRM (se nao for numero puro)
    const name = c.contact_name;
    if (name && !/^\d{10,}$/.test(name)) return name;
    // 3. Numero de telefone ou JID como fallback
    if (!isGrp(c)) return c.contact_phone || c.remote_jid || '';
    return 'Grupo';
  };
  const selectChat = c => { setCur(c); setSearch(''); };
  const mentionsMe = useCallback((content) => { if (!myName || !content) return false; return content.toLowerCase().includes(`@${myName.toLowerCase()}`); }, [myName]);

  const mentionSuggestions = (mentionQuery !== null && isGrp(cur) && participants.length > 0)
    ? participants.filter(p => (p.name || p.phone || '').toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 8) : [];

  const selectMention = (p) => {
    const name = p.name || p.phone || 'Contato';
    const before = msg.slice(0, mentionStartRef.current);
    const after = msg.slice(mentionStartRef.current + 1 + (mentionQuery?.length || 0));
    setMsg(`${before}@${name} ${after}`); setMentionQuery(null); mentionStartRef.current = -1; setMentionIdx(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleMsgChange = (e) => {
    const val = e.target.value; const pos = e.target.selectionStart; setMsg(val);
    if (isGrp(cur) && participants.length > 0) {
      const m = val.slice(0, pos).match(/@([\w\u00C0-\u024F]*)$/);
      if (m) { mentionStartRef.current = m.index; setMentionQuery(m[1]); setMentionIdx(0); }
      else { setMentionQuery(null); mentionStartRef.current = -1; }
    }
    if (cur && val.trim()) {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => { api.sendTyping(cur.id).catch(() => {}); }, 300);
    }
  };

  const send = async () => {
    if (!cur) return;
    // Se tem arquivos selecionados, envia arquivo com o texto como legenda
    if (files.length > 0) { await sendFiles(msg.trim()); return; }
    if (!msg.trim()) return;
    setSending(true); setMentionQuery(null);
    if (isNoteMode) {
      try {
        await api.sendNote(cur.id, tenant.id, msg);
        setMsg(''); if (inputRef.current) inputRef.current.style.height = 'auto';
        await loadMsgs(cur.id);
      } catch (e) { alert(e.message || 'Erro ao salvar nota'); } finally { setSending(false); }
      return;
    }
    const ph = cur.remote_jid && (isGrp(cur) || cur.remote_jid.includes('@lid')) ? cur.remote_jid : cur.contact_phone || cur.remote_jid?.split('@')[0];
    try {
      await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id, replyTo?.id || null);
      setMsg(''); setReplyTo(null); if (inputRef.current) inputRef.current.style.height = 'auto';
      await loadMsgs(cur.id); await load();
    }
    catch (e) { alert(e.message || 'Erro ao enviar'); } finally { setSending(false); }
  };

  const handleForward = async (targetChat) => {
    if (!forwardMsg || !targetChat) return;
    try {
      await api.forwardMessage(forwardMsg.id, targetChat.id, tenant.id);
      setForwardMsg(null); setForwardSearch('');
      if (targetChat.id === cur?.id) await loadMsgs(cur.id);
      await load();
    } catch (e) { alert(e.message || 'Erro ao encaminhar'); }
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, mentionSuggestions.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') { e.preventDefault(); selectMention(mentionSuggestions[mentionIdx]); return; }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !sending && (msg.trim() || files.length > 0)) { e.preventDefault(); send(); }
  };

  const handleFile = e => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const valid = [];
    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name}: max 10MB`); continue; }
      valid.push(f);
    }
    if (valid.length) setFiles(prev => [...prev, ...valid]);
  };

  const handlePaste = e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const f = item.getAsFile();
        if (f && f.size <= 10 * 1024 * 1024) imageFiles.push(f);
        else if (f) alert('Imagem colada excede 10MB');
      }
    }
    if (imageFiles.length) setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = idx => setFiles(prev => prev.filter((_, i) => i !== idx));

  const readFileAsDataURL = f => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

  const MAX_FILE_SIZE_MB = 64;
  const sendFiles = async (caption = '') => {
    if (!files.length || !cur) return;
    const oversized = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) { alert(`Arquivo "${oversized.name}" excede ${MAX_FILE_SIZE_MB}MB. Reduza o tamanho antes de enviar.`); return; }
    const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const dataUrl = await readFileAsDataURL(f);
        const base64 = dataUrl.split(',')[1];
        const mt = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';
        // Apenas o primeiro arquivo recebe a legenda (padrao WhatsApp)
        const sendResult = await api.sendWhatsAppMedia({ number: ph, base64, fileName: f.name, mediaType: mt, caption: i === 0 ? caption : '', tenantId: tenant.id, chatId: cur.id });
        // Guarda dataUrl no cache local para exibir a imagem imediatamente sem precisar buscar do servidor
        if ((mt === 'image' || mt === 'video') && sendResult?.messageId) {
          localMediaCache.current[sendResult.messageId] = dataUrl;
        }
      }
      setFiles([]); if (fileRef.current) fileRef.current.value = '';
      setMsg(''); if (inputRef.current) inputRef.current.style.height = 'auto';
      const newMsgs = await api.getChatMessages(cur.id, 100, 0);
      setMsgs(newMsgs); await load();
    } catch (e) { alert('Erro: ' + e.message); }
    setSending(false);
  };

  const deleteChat = async id => {
    if (!confirm('Apagar conversa? Ela vai para a lixeira e pode ser restaurada.')) return;
    try { await api.deleteChat(id); if (cur?.id === id) { setCur(null); setLead(null); setMsgs([]); } await load(); }
    catch { alert('Erro'); }
  };

  const fmt = ts => {
    if (!ts) return '';
    const d = new Date(ts), n = new Date();
    if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const filtered = chats.filter(c => {
    if (filter === 'individual' && isGrp(c)) return false;
    if (filter === 'group' && !isGrp(c)) return false;
    if (filter === 'unread' && !(Number(c.user_unread_count) > 0)) return false;
    if (!search) return true;
    return chatDisplayName(c).toLowerCase().includes(search.toLowerCase());
  });

  // Buscar contatos WhatsApp quando search tem 2+ chars e não encontra nos chats
  useEffect(() => {
    if (!search || search.length < 2 || filter === 'group') { setContactResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchingContacts(true);
        const results = await api.searchContacts(tenant.id, search);
        setContactResults(results || []);
      } catch { setContactResults([]); }
      finally { setSearchingContacts(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, tenant.id, filter]);

  const startNewChat = async (phone, name) => {
    try {
      const result = await api.startChat(phone, name, tenant.id);
      if (result?.chatId) {
        await load();
        setSearch(''); setContactResults([]); setShowNewChat(false); setNewChatPhone(''); setNewChatName('');
        // Selecionar o chat recém-criado
        setTimeout(() => {
          const newChat = chats.find(c => c.id === result.chatId) || { id: result.chatId, contact_phone: phone, contact_name: name, remote_jid: `${phone}@s.whatsapp.net`, is_group: 0 };
          selectChat(newChat);
        }, 500);
      }
    } catch (e) { alert(e.message || 'Erro ao criar conversa'); }
  };

  const getStatus = s => {
    if (s === 'read') return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />;
    if (s === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
    if (s === 'pending') return <Clock className="w-3 h-3 text-gray-400" />;
    return <Check className="w-3.5 h-3.5 text-gray-400" />;
  };

  // Formata preview da última mensagem na lista de chats com ícone de mídia
  const formatChatPreview = (c) => {
    const raw = c.last_message || '';
    if (!raw) return '';
    const lower = raw.toLowerCase();
    // Detecta placeholders de tipo gerados pelo backend
    if (raw === '[image]' || lower.includes('[imagem]')) return { icon: '📷', text: 'Foto' };
    if (raw === '[video]' || lower.includes('[vídeo]') || lower.includes('[video]')) return { icon: '🎥', text: 'Vídeo' };
    if (raw === '[audio]' || lower.includes('[áudio]') || lower.includes('[audio]')) return { icon: '🎵', text: 'Áudio' };
    if (raw === '[document]' || lower.includes('[documento]')) return { icon: '📄', text: 'Documento' };
    if (raw === '[sticker]' || lower.includes('[figurinha]') || lower.includes('[sticker]')) return { icon: '🎭', text: 'Figurinha' };
    if (raw === '[location]' || lower.includes('[localização]')) return { icon: '📍', text: 'Localização' };
    if (raw === '[contact]' || lower.includes('[contato]')) return { icon: '👤', text: 'Contato' };
    if (raw === '[emoji]') return { icon: '😀', text: 'Emoji' };
    if (raw === '[reaction]' || lower.includes('[reacao]') || lower.includes('[reação]')) return { icon: '❤️', text: 'Reação' };
    return { text: raw };
  };

  const tenantAIOn = Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true;
  const leadAIOn = lead ? (Number(lead.ai_enabled) === 1 || lead.ai_enabled === true) : false;

  const toggleLeadAI = async () => {
    if (!lead) return;
    const newVal = !leadAIOn;
    try { await api.setLeadAI(lead.id, newVal); setLead({ ...lead, ai_enabled: newVal ? 1 : 0 }); }
    catch { alert('Erro ao alterar IA'); }
  };

  const handleLeadContextRefresh = async () => {
    if (!lead) return;
    try { const result = await api.refreshLeadContext(lead.id); if (result?.lead) setLead(prev => ({ ...prev, ...result.lead })); } catch (e) { console.error('REFRESH_LEAD_CTX_ERROR:', e.message, 'leadId:', lead.id); }
  };

  const renderStageButtons = () => {
    if (!cur || isGrp(cur) || columns.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
        {columns.map(col => {
          const cc = CM[col.color] || CM.zinc;
          const isActive = lead?.stage === col.id;
          const handleClick = async () => {
            if (lead) { await api.updateLead(lead.id, { stage: col.id }); setLead({ ...lead, stage: col.id }); }
            else { const ph = cur.contact_phone || cur.remote_jid?.split('@')[0]; if (ph) { try { const nl = await api.createLead({ tenantId: tenant.id, name: chatDisplayName(cur), phone: ph, source: 'whatsapp', stage: col.id }); setLead(nl); } catch (err) { console.error(err); } } }
            onRefresh();
          };
          return <button key={col.id} onClick={handleClick} className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${isActive ? `${cc.bg} text-white shadow-sm` : `${cc.light} ${cc.text} hover:opacity-80`}`}>{col.name}</button>;
        })}
      </div>
    );
  };

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <div className="w-[340px] min-w-[340px] border-r border-gray-200 flex flex-col bg-white">
        {/* Header da lista de chats */}
        <div className="bg-[#075e54] px-3 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">Conversas</h2>
            <div className="flex items-center gap-1">
              <button onClick={toggleSound} className="w-8 h-8 bg-white/15 hover:bg-white/25 text-white rounded-lg flex items-center justify-center transition-colors" title={soundEnabled ? 'Desativar som' : 'Ativar som'}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>
              <button onClick={() => setShowNewChat(true)} className="w-8 h-8 bg-white/15 hover:bg-white/25 text-white rounded-lg flex items-center justify-center transition-colors" title="Nova conversa"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conversa..." className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:bg-white/15 transition-all" />
          </div>
          <div className="flex gap-1">
            {[{ id: 'all', l: 'Tudo' }, { id: 'individual', l: 'Contatos' }, { id: 'group', l: 'Grupos' }, { id: 'unread', l: 'Nao lidas' }].map(f => {
              const count = f.id === 'unread' ? chats.filter(c => Number(c.user_unread_count) > 0).length : null;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 py-1.5 text-[10px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${filter === f.id ? 'bg-[#25d366] text-white shadow-sm' : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'}`}>
                  {f.l}
                  {count > 0 && <span className={`min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center px-0.5 ${filter === f.id ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {!chatsLoaded && chats.length === 0 && (
            <div className="py-1">
              {[0,1,2,3,4,5,6].map(i => (
                <div key={`sk-${i}`} className="flex items-center gap-3 px-3 py-3 border-b border-gray-100/60">
                  <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="skeleton h-3 w-28 rounded" />
                      <div className="skeleton h-2 w-8 rounded" />
                    </div>
                    <div className="skeleton h-2.5 w-5/6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {chatsLoaded && filtered.length === 0 && !search && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-xs gap-2">
              <MessageSquare className="w-8 h-8 opacity-40" />
              <p>Nenhuma conversa ainda</p>
            </div>
          )}
          {filtered.map(c => {
            const isMentionedInLast = isGrp(c) && myName && (c.last_message || '').toLowerCase().includes(`@${myName.toLowerCase()}`);
            const hasUnread = Number(c.user_unread_count) > 0;
            return (
              <div key={c.id} onClick={() => selectChat(c)} className={`group flex items-center gap-3 px-3 py-3 cursor-pointer transition-all border-b border-gray-100/60 ${cur?.id === c.id ? 'bg-[#075e54]/5 border-l-[3px] border-l-[#25d366]' : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
                <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} isGroup={isGrp(c)} size="w-12 h-12" textSize="text-[11px]" cachedUrl={c.profile_pic_url} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{chatDisplayName(c)}{isGrp(c) && <span className="ml-1.5 text-[7px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded font-medium align-middle">GRUPO</span>}{c.lead_source === 'meta_ads' && <span className="ml-1.5 text-[7px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-bold align-middle">META ADS</span>}</p>
                    <span className={`text-[10px] flex-shrink-0 ml-2 ${hasUnread ? 'text-[#25d366] font-semibold' : 'text-gray-400'}`}>{fmt(c.last_message_time)}</span>
                  </div>
                  <div className="flex justify-between mt-0.5 items-center">
                    <p className={`text-[11px] truncate flex items-center gap-1 ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>
                      {(() => {
                        const preview = formatChatPreview(c);
                        // Double-check antes do preview (quando última msg é nossa)
                        const showTick = c.last_message_is_from_me ? (
                          c.last_message_status === 'read' ? <CheckCheck className="w-3 h-3 text-[#53bdeb] flex-shrink-0" /> :
                          c.last_message_status === 'delivered' ? <CheckCheck className="w-3 h-3 text-gray-400 flex-shrink-0" /> :
                          <Check className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        ) : null;
                        return <>
                          {showTick}
                          {preview.icon && <span className="flex-shrink-0">{preview.icon}</span>}
                          <span className="truncate">{preview.text}</span>
                        </>;
                      })()}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {Number(c.awaiting_response) === 1 && hasUnread && <span className="bg-red-500 text-white text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center" title="Aguardando resposta">!</span>}
                      {isMentionedInLast && <span className="bg-blue-600 text-white text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center"><AtSign className="w-2.5 h-2.5" /></span>}
                      {hasUnread && <span className="bg-[#25d366] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{Number(c.user_unread_count) > 9 ? '9+' : c.user_unread_count}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteChat(c.id); }} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
              </div>
            );
          })}
          {/* Contatos WhatsApp (resultados de busca) */}
          {search && contactResults.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-3 py-2 bg-gray-50"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Contatos WhatsApp</span></div>
              {contactResults.map(c => (
                <div key={c.id} onClick={() => startNewChat(c.phone, c.name || c.push_name || c.phone)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-green-50/50 transition-colors border-b border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#25d366]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#075e54]">{(c.name || c.push_name || c.phone || '?').substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900 truncate">{c.name || c.push_name || c.phone}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{c.phone}</p>
                  </div>
                  <span className="text-[8px] text-[#075e54] font-bold bg-[#25d366]/10 px-2 py-0.5 rounded-full uppercase">Iniciar</span>
                </div>
              ))}
            </div>
          )}
          {search && search.length >= 2 && searchingContacts && (
            <div className="px-3 py-4 text-center text-[10px] text-gray-400">Buscando contatos...</div>
          )}
        </div>
        <div className="p-2 border-t border-gray-100">
          <button onClick={() => { setShowTrash(true); loadDeletedChats(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg text-[11px] font-medium transition-all"><RotateCcw className="w-3 h-3" /> Lixeira</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {cur ? (
          <>
            <div className="bg-white px-4 py-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ProfilePic phone={cur.contact_phone || cur.remote_jid} tenantId={tenant.id} name={chatDisplayName(cur)} size="w-9 h-9" isGroup={isGrp(cur)} cachedUrl={cur.profile_pic_url} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{chatDisplayName(cur)}</p>
                    <div className="flex items-center gap-2">
                      {isGrp(cur) ? (
                        <button onClick={() => setShowParticipants(v => !v)} className="text-[10px] text-blue-700 font-medium hover:underline flex items-center gap-0.5">
                          <Users2 className="w-2.5 h-2.5" />{loadingPart ? 'Carregando...' : participants.length > 0 ? `${participants.length} participantes` : 'Ver participantes'}
                        </button>
                      ) : <p className="text-[11px] text-gray-400">{cur.contact_phone}</p>}
                      {chatViewers.length > 0 && (
                        <div className="flex items-center gap-1" title={`Vendo: ${chatViewers.join(', ')}`}>
                          <div className="flex -space-x-1">
                            {chatViewers.slice(0, 3).map((name, i) => (
                              <div key={i} className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white border border-white ${['bg-purple-500','bg-pink-500','bg-indigo-500'][i % 3]}`}>{name[0]?.toUpperCase()}</div>
                            ))}
                          </div>
                          <span className="text-[9px] text-purple-500 font-medium">{chatViewers.length === 1 ? chatViewers[0].split(' ')[0] : `${chatViewers.length} vendo`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead && (() => {
                    const activeCol = columns.find(col => col.id === lead.stage);
                    if (!activeCol) return null;
                    const cc = CM[activeCol.color] || CM.zinc;
                    return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${cc.light} ${cc.text}`}>{activeCol.name}</span>;
                  })()}
                  {!isGrp(cur) && lead && tenantAIOn && (
                    <button onClick={toggleLeadAI} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${leadAIOn ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      <Bot className="w-4 h-4" /> {leadAIOn ? 'IA ativa' : 'IA pausada'}
                    </button>
                  )}
                  {lead && !isGrp(cur) && (
                    <div className="relative">
                      <button onClick={() => setShowQuickFollowUp(!showQuickFollowUp)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors" title="Criar lembrete">
                        <Bell className="w-3.5 h-3.5" /> Follow Up
                      </button>
                      {showQuickFollowUp && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-1">
                          <p className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase">Lembrar de recontatar</p>
                          {[
                            { l: 'Em 1 hora', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); return d; } },
                            { l: 'Em 3 horas', fn: () => { const d = new Date(); d.setHours(d.getHours() + 3); return d; } },
                            { l: 'Amanha as 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0); return d; } },
                            { l: 'Em 3 dias', fn: () => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(9, 0, 0); return d; } },
                            { l: 'Em 1 semana', fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0); return d; } },
                          ].map(opt => (
                            <button key={opt.l} onClick={async () => {
                              const d = opt.fn();
                              try {
                                await api.createFollowUp({ tenantId: tenant.id, leadId: lead.id, leadName: lead.name || chatDisplayName(cur), leadPhone: lead.phone || cur.contact_phone, scheduledAt: d.toISOString(), note: '' });
                                setShowQuickFollowUp(false);
                              } catch { alert('Erro ao criar follow-up'); }
                            }} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              <Clock className="w-3 h-3 text-gray-400" /> {opt.l}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {lead && (
                    <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Editar lead
                    </button>
                  )}
                  <button onClick={() => { setShowChatSearch(v => !v); setChatSearchQuery(''); }} className={`p-1.5 rounded-lg transition-colors ${showChatSearch ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title="Buscar mensagens">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {showChatSearch && (
                <div className="mt-2.5 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={chatSearchQuery}
                    onChange={e => setChatSearchQuery(e.target.value)}
                    placeholder="Buscar nesta conversa..."
                    className="flex-1 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
                  />
                  {chatSearchQuery && (
                    <button onClick={() => setChatSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  )}
                  {chatSearchQuery && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {msgs.filter(m => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase())).length} resultado(s)
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isGrp(cur) && lead && <LeadSummaryCard lead={lead} onRefresh={handleLeadContextRefresh} compact={true} />}

            <div ref={scrollContainerRef} onScroll={() => {
              const el = scrollContainerRef.current;
              if (!el) return;
              userScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 150;
            }} className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 chat-bg-pattern">
              {(() => {
                const displayMsgs = chatSearchQuery.trim()
                  ? msgs.filter(m => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                  : msgs;
                if (chatSearchQuery.trim() && displayMsgs.length === 0) {
                  return <div className="flex items-center justify-center py-16 text-gray-400 text-xs">Nenhuma mensagem encontrada</div>;
                }
                // Pre-process: marcar imagens agrupáveis (mesma direção, consecutivas, tipo image, sem caption real)
                const grouped = new Set();
                const imageGroups = [];
                for (let i = 0; i < displayMsgs.length; i++) {
                  if (grouped.has(i)) continue;
                  const m = displayMsgs[i];
                  const fromMe = Number(m.is_from_me) === 1;
                  const isImg = m.message_type === 'image' && (m.media_url || (fromMe && localMediaCache.current[m.id]));
                  const isPlaceholderContent = !m.content || m.content === '[image]' || m.content === '[Imagem]';
                  if (!isImg || !isPlaceholderContent) continue;
                  const group = [i];
                  for (let j = i + 1; j < displayMsgs.length; j++) {
                    const n = displayMsgs[j];
                    const nFromMe = Number(n.is_from_me) === 1;
                    if (nFromMe !== fromMe) break;
                    const nIsImg = n.message_type === 'image' && (n.media_url || (nFromMe && localMediaCache.current[n.id]));
                    const nIsPlaceholder = !n.content || n.content === '[image]' || n.content === '[Imagem]';
                    if (!nIsImg || !nIsPlaceholder) break;
                    // Dentro de 5 minutos
                    const timeDiff = Math.abs(new Date(n.timestamp) - new Date(m.timestamp));
                    if (timeDiff > 5 * 60 * 1000) break;
                    group.push(j);
                  }
                  if (group.length >= 2) {
                    group.forEach(idx => grouped.add(idx));
                    imageGroups.push({ startIdx: group[0], indices: group });
                  }
                }
                const groupStartMap = {};
                imageGroups.forEach(g => { groupStartMap[g.startIdx] = g; });

                let _lastMsgDate = null;
                return displayMsgs.map((m, idx) => {
                  if (grouped.has(idx) && !groupStartMap[idx]) return null; // parte de grupo, renderizado pelo líder
                  const _msgDate = new Date(m.timestamp).toDateString();
                  const _showDateSep = _msgDate !== _lastMsgDate;
                  _lastMsgDate = _msgDate;
                  const _sep = _showDateSep ? <DateSeparator key={`sep-${_msgDate}`} timestamp={m.timestamp} /> : null;
                  if (groupStartMap[idx]) {
                    const g = groupStartMap[idx];
                    const gMsgs = g.indices.map(i => msgs[i]);
                    const fromMe = Number(gMsgs[0].is_from_me) === 1;
                    const lastMsg = gMsgs[gMsgs.length - 1];
                    return (
                      <React.Fragment key={`group-${gMsgs[0].id}`}>
                      {_sep}
                      <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-2 py-2 ${fromMe ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100'}`}>
                          {gMsgs[0].sender_name && <p className="text-[10px] font-bold mb-1 text-gray-500">{gMsgs[0].sender_name}</p>}
                          <div className={`grid gap-1 ${gMsgs.length === 2 ? 'grid-cols-2' : gMsgs.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {gMsgs.slice(0, 4).map((gm, gi) => (
                              <div key={gm.id} id={`msg-${gm.id}`} className={`relative overflow-hidden rounded-lg ${gMsgs.length === 3 && gi === 0 ? 'col-span-2' : ''}`}>
                                <MediaBubble msg={gm} tenantId={tenant.id} cachedSrc={fromMe ? (localMediaCache.current[gm.id] || null) : null} />
                                {gi === 3 && gMsgs.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                    <span className="text-white text-2xl font-bold">+{gMsgs.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-end gap-0.5 mt-1">
                            <span className="text-[9px] text-gray-400">{fmt(lastMsg.timestamp)}</span>
                            {fromMe && getStatus(lastMsg.status)}
                          </div>
                        </div>
                      </div>
                      </React.Fragment>
                    );
                  }
                  // Nota interna
                if (Number(m.is_internal) === 1) return (
                  <React.Fragment key={`note-${m.id}`}>
                  {_sep}
                  <div className="flex justify-center my-1">
                    <div className="max-w-[70%] bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Nota interna</span>
                        {m.sender_name && <span className="text-[9px] text-amber-500">• {m.sender_name}</span>}
                        <span className="text-[8px] text-amber-400 ml-auto">{fmt(m.timestamp)}</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                  </React.Fragment>
                );
                // Mensagem normal (não agrupada)
                const fromMe = Number(m.is_from_me) === 1 || m.is_from_me === true;
                const cachedSrc = fromMe ? (localMediaCache.current[m.id] || null) : null;
                const isMedia = ['image','video','document','audio','sticker'].includes(m.message_type);
                const hasMedia = isMedia && (m.media_url || cachedSrc);
                const isPlaceholder = ['[Imagem]','[Audio]','[Video]','[Documento]','[Sticker]','[Localizacao]','[Contato]','[Mensagem]','[Reacao]','[image]','[audio]','[video]','[document]','[sticker]','[location]','[contact]'].includes(m.content);
                const isAI = m.sender_name === 'IA';
                const isMentionedMsg = !fromMe && mentionsMe(m.content);
                const isReaction = m.message_type === 'reaction' && m.content && !m.content.startsWith('[');
                if (isReaction) return (
                  <React.Fragment key={`react-${m.id}`}>
                  {_sep}
                  <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'} my-0.5`}>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-2.5 py-1">
                      <span className="text-lg leading-none">{m.content}</span>
                      {m.sender_name && <span className="text-[9px] text-gray-400 font-medium">{m.sender_name}</span>}
                      <span className="text-[8px] text-gray-300">{fmt(m.timestamp)}</span>
                    </div>
                  </div>
                  </React.Fragment>
                );
                const isForwarded = m.content && m.content.startsWith('[Encaminhada]');
                const _firstUrl = m.content && !isPlaceholder ? (m.content.match(URL_REGEX) || [])[0] : null;
                return (
                  <React.Fragment key={m.id}>
                  {_sep}
                  <div className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group items-end gap-1 ${m.timestamp && (Date.now() - new Date(m.timestamp).getTime()) < 15000 ? 'msg-enter' : ''}`}>
                    {!fromMe && isGrp(cur) && m.sender_name && (
                      <ParticipantAvatar name={m.sender_name} size="w-6 h-6" textSize="text-[9px]" />
                    )}
                    {fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-end">
                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm py-0.5 flex flex-col min-w-[110px]">
                          <button onClick={() => { setReplyTo(m); setTimeout(() => inputRef.current?.focus(), 50); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Reply className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Responder</span>
                          </button>
                          <button onClick={() => setForwardMsg(m)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Forward className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Encaminhar</span>
                          </button>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                          {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch (e) { console.error('SEND_REACTION_ERROR:', e.message, 'msgId:', m.id, 'emoji:', emoji); } }}
                              className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-50">{emoji}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div id={`msg-${m.id}`} className={`msg-bubble ${!hasMedia ? (fromMe ? 'msg-bubble-out' : 'msg-bubble-in') : ''} max-w-[75%] rounded-xl px-3 py-2 transition-all ${
                      fromMe ? (isAI ? 'bg-purple-100/80 border border-purple-200' : (() => {
                          if (!m.sender_name) return 'bg-[#d9fdd3] border border-[#c5e8b7]';
                          const opColors = [
                            'bg-[#d9fdd3] border border-[#c5e8b7]',
                            'bg-blue-100 border border-blue-200',
                            'bg-indigo-100 border border-indigo-200',
                            'bg-teal-100 border border-teal-200',
                            'bg-cyan-100 border border-cyan-200',
                            'bg-emerald-100 border border-emerald-200',
                          ];
                          const h = Math.abs([...m.sender_name].reduce((a, c) => a + c.charCodeAt(0), 0));
                          return opColors[h % opColors.length];
                        })())
                      : isMentionedMsg ? 'bg-amber-50 border border-amber-200'
                      : 'bg-white border border-gray-100'
                    }`}>
                      {isForwarded && <div className="flex items-center gap-1 mb-0.5"><span className="text-[8px] font-medium text-gray-400 flex items-center gap-0.5"><CornerUpRight className="w-2 h-2" /> Encaminhada</span></div>}
                      {isMentionedMsg && <div className="flex items-center gap-1 mb-0.5"><span className="text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1 py-0.5 flex items-center gap-0.5"><AtSign className="w-2 h-2" /> mencionado</span></div>}
                      {m.sender_name && (() => {
                        const nameColors = [
                          { text: 'text-blue-600', bg: 'bg-blue-600' },
                          { text: 'text-emerald-600', bg: 'bg-emerald-600' },
                          { text: 'text-orange-600', bg: 'bg-orange-600' },
                          { text: 'text-pink-600', bg: 'bg-pink-600' },
                          { text: 'text-indigo-600', bg: 'bg-indigo-600' },
                          { text: 'text-red-600', bg: 'bg-red-600' },
                          { text: 'text-teal-600', bg: 'bg-teal-600' },
                          { text: 'text-purple-600', bg: 'bg-purple-600' },
                          { text: 'text-cyan-600', bg: 'bg-cyan-600' },
                          { text: 'text-amber-600', bg: 'bg-amber-600' },
                        ];
                        const hash = Math.abs([...m.sender_name].reduce((a, c) => a + c.charCodeAt(0), 0));
                        const color = nameColors[hash % nameColors.length];
                        const isCrmUser = fromMe && !isAI;
                        return (
                          <p className={`text-[11px] font-bold mb-1.5 pb-1 border-b border-black/5 flex items-center gap-1.5 ${isAI ? 'text-violet-600' : color.text}`}>
                            {isAI && <Bot className="w-2.5 h-2.5" />}
                            {isCrmUser && <span className={`w-2 h-2 rounded-full ${color.bg} flex-shrink-0`} />}
                            {m.sender_name}
                          </p>
                        );
                      })()}
                      {m.quoted_content || m.quoted_type ? (
                        <div className="mb-1.5 bg-black/5 border-l-2 border-gray-400 rounded-r-md px-2.5 py-1.5 cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={() => { const el = document.getElementById(`msg-${m.quoted_message_id}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ring-2','ring-blue-300'); setTimeout(() => el.classList.remove('ring-2','ring-blue-300'), 2000); } }}>
                          {m.quoted_sender && <p className="text-[9px] font-bold text-gray-600 mb-0.5">{m.quoted_sender}</p>}
                          {m.quoted_type && m.quoted_type !== 'text' && !m.quoted_content && (
                            <p className="text-[10px] text-gray-500 italic flex items-center gap-1">
                              {m.quoted_type === 'image' ? '📷 Foto' : m.quoted_type === 'video' ? '🎥 Vídeo' : m.quoted_type === 'audio' ? '🎵 Áudio' : m.quoted_type === 'document' ? '📄 Documento' : m.quoted_type}
                            </p>
                          )}
                          {m.quoted_content && <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{m.quoted_content}</p>}
                        </div>
                      ) : null}
                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} cachedSrc={cachedSrc} />}
                      {m.content && !isPlaceholder && renderText(m.content, myName)}
                      {m.content && isPlaceholder && !hasMedia && <p className="text-[13px] text-gray-500 italic">{m.content}</p>}
                      {_firstUrl && !hasMedia && <LinkPreviewCard url={_firstUrl.startsWith('http') ? _firstUrl : 'https://'+_firstUrl} tenantId={tenant.id} />}
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        <span className="text-[9px] text-gray-400">{fmt(m.timestamp)}</span>
                        {fromMe && getStatus(m.status)}
                      </div>
                    </div>
                    {!fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-end">
                        <div className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                          {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch (e) { console.error('SEND_REACTION_ERROR:', e.message, 'msgId:', m.id, 'emoji:', emoji); } }}
                              className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-50">{emoji}</button>
                          ))}
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm py-0.5 flex flex-col min-w-[110px]">
                          <button onClick={() => { setReplyTo(m); setTimeout(() => inputRef.current?.focus(), 50); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Reply className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Responder</span>
                          </button>
                          <button onClick={() => setForwardMsg(m)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Forward className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Encaminhar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  </React.Fragment>
                );
              }).filter(Boolean);
              })()}
              <div ref={endRef} />
            </div>

            {files.length > 0 && (
              <div className="px-4 py-2.5 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      {f.type.startsWith('image') ? (
                        <img src={URL.createObjectURL(f)} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-[7px] text-gray-400 mt-0.5 truncate max-w-[40px]">{f.name.split('.').pop()}</span>
                        </div>
                      )}
                      <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-lg">+</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{files.length} arquivo{files.length > 1 ? 's' : ''} — adicione uma legenda abaixo (opcional)</span>
                  <button onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-gray-500 font-medium hover:text-red-500 transition-colors">Cancelar</button>
                </div>
              </div>
            )}

            {replyTo && (
              <div className="bg-white px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border-l-3 border-blue-500 rounded-r-lg px-3 py-2 min-w-0" style={{ borderLeftWidth: '3px' }}>
                  <p className="text-[10px] font-bold text-blue-700 mb-0.5">{replyTo.sender_name || (Number(replyTo.is_from_me) === 1 ? 'Você' : 'Contato')}</p>
                  <p className="text-[11px] text-gray-600 truncate">{replyTo.content || (replyTo.message_type !== 'text' ? `[${replyTo.message_type}]` : '')}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            )}

            {typingUsers.length > 0 && (
              <div className="px-5 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex items-center gap-2">
                <div className="flex gap-1 items-end h-4">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span className="text-[11px] text-gray-500 italic">{typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando…</span>
              </div>
            )}

            {isNoteMode && (
              <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 flex items-center gap-2">
                <Lock className="w-3 h-3 text-amber-500" />
                <span className="text-[11px] text-amber-600 font-semibold">Modo nota interna — não será enviado ao contato</span>
              </div>
            )}

            <div className={`px-4 py-3 flex items-end gap-2.5 border-t relative ${isNoteMode ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5"><AtSign className="w-3 h-3 text-blue-700" /><span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Mencionar participante</span></div>
                  {mentionSuggestions.map((p, i) => (
                    <button key={p.jid || p.phone || i} onClick={() => selectMention(p)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${i === mentionIdx ? 'bg-blue-50' : ''}`}>
                      <ParticipantAvatar name={p.name} phone={p.phone} size="w-7 h-7" textSize="text-[9px]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">{p.name || p.phone || 'Contato'}</p>
                          {p.admin === 'superadmin' && <span className="text-[7px] bg-red-50 text-red-500 font-bold px-1 rounded flex items-center gap-0.5"><Crown className="w-1.5 h-1.5" />dono</span>}
                          {p.admin === 'admin' && <span className="text-[7px] bg-amber-50 text-amber-600 font-bold px-1 rounded flex items-center gap-0.5"><Shield className="w-1.5 h-1.5" />admin</span>}
                        </div>
                        {p.name && p.phone && <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" multiple />
              <button onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 mb-0.5 transition-colors"><Paperclip className="w-4 h-4" /></button>
              <div className="relative flex-shrink-0 mb-0.5">
                <button onClick={() => setShowEmojiPicker(v => !v)} className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'text-[#25d366] bg-[#25d366]/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title="Emoji">
                  <Smile className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={emoji => {
                      const el = inputRef.current;
                      if (el) {
                        const start = el.selectionStart ?? msg.length;
                        const end = el.selectionEnd ?? msg.length;
                        const newVal = msg.slice(0, start) + emoji + msg.slice(end);
                        setMsg(newVal);
                        setTimeout(() => { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); }, 10);
                      } else { setMsg(m => m + emoji); }
                      setShowEmojiPicker(false);
                    }}
                    onGif={async gif => {
                      if (!cur || !gif?.mp4) return;
                      setShowEmojiPicker(false);
                      const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
                      setSending(true);
                      try {
                        await api.sendGif({ gifUrl: gif.mp4, chatId: cur.id, tenantId: tenant.id, number: ph });
                        const newMsgs = await api.getChatMessages(cur.id, 100, 0);
                        setMsgs(newMsgs); await load();
                      } catch (e) { alert('Erro ao enviar GIF: ' + e.message); }
                      setSending(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
              <button onClick={() => setIsNoteMode(v => !v)} className={`p-2 rounded-lg flex-shrink-0 mb-0.5 transition-colors ${isNoteMode ? 'text-amber-600 bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`} title="Nota interna (não enviada ao contato)">
                <StickyNote className="w-4 h-4" />
              </button>
              <textarea ref={inputRef} value={msg} onChange={handleMsgChange} onKeyDown={handleKeyDown} onPaste={handlePaste} disabled={sending} rows={2}
                placeholder={isNoteMode ? 'Escreva uma nota interna...' : files.length > 0 ? 'Legenda (opcional)...' : (isGrp(cur) ? 'Mensagem... (@ para mencionar)' : 'Escreva uma mensagem...')}
                className={`flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none resize-none overflow-y-auto leading-relaxed transition-all ${isNoteMode ? 'bg-amber-100/60 focus:bg-amber-50 focus:ring-1 focus:ring-amber-300' : 'bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-200'}`}
                style={{ minHeight: '52px', maxHeight: '120px' }} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
              {/* Agendar mensagem */}
              <div className="relative flex-shrink-0 mb-0.5">
                <button onClick={() => setShowScheduleMsg(!showScheduleMsg)} disabled={!msg.trim()} title="Agendar envio"
                  className="p-2 text-[#25d366] hover:text-[#075e54] hover:bg-[#25d366]/10 rounded-lg disabled:opacity-30 transition-colors">
                  <CalendarClock className="w-4 h-4" />
                </button>
                {showScheduleMsg && msg.trim() && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 p-3 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Agendar envio desta mensagem</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#25d366]" />
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#25d366]" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { l: '30min', fn: () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime(d.toTimeString().slice(0, 5)); } },
                        { l: '1h', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime(d.toTimeString().slice(0, 5)); } },
                        { l: 'Amanha 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime('09:00'); } },
                      ].map(s => (
                        <button key={s.l} type="button" onClick={s.fn} className="px-2 py-1 bg-gray-100 hover:bg-[#25d366]/10 text-gray-600 hover:text-[#075e54] rounded text-[9px] font-semibold transition-colors">{s.l}</button>
                      ))}
                    </div>
                    <button onClick={async () => {
                      if (!scheduleDate) { alert('Escolha uma data'); return; }
                      const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
                      try {
                        await api.createScheduledMessage({ tenantId: tenant.id, chatId: cur.id, contactName: chatDisplayName(cur), contactPhone: ph, remoteJid: cur.remote_jid, message: msg, scheduledAt: `${scheduleDate}T${scheduleTime}:00` });
                        setMsg(''); setShowScheduleMsg(false); setScheduleDate(''); setScheduleTime('09:00');
                      } catch { alert('Erro ao agendar'); }
                    }} disabled={!scheduleDate} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">
                      Agendar envio
                    </button>
                  </div>
                )}
              </div>
              <button onClick={send} disabled={sending || (!msg.trim() && !files.length)} className={`p-2.5 text-white rounded-xl disabled:opacity-30 flex-shrink-0 mb-0.5 transition-colors ${isNoteMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#075e54] hover:bg-[#064a43]'}`}>{isNoteMode ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}</button>
            </div>

            {showParticipants && isGrp(cur) && (
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 z-10 flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div><p className="font-semibold text-sm flex items-center gap-1.5"><Users2 className="w-3.5 h-3.5 text-blue-700" /> Participantes</p><p className="text-[10px] text-gray-400 mt-0.5">{participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'} no grupo</p></div>
                  <button onClick={() => setShowParticipants(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                {loadingPart ? <div className="flex items-center justify-center py-10"><div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
                : participants.length === 0 ? <div className="py-10 text-center text-gray-400"><Users2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs font-medium">Sem participantes</p></div>
                : (
                  <div className="flex-1 overflow-y-auto">
                    {participants.filter(p => p.admin).length > 0 && <div className="px-3 pt-3 pb-1"><span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Administradores</span></div>}
                    {participants.filter(p => p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                    {participants.filter(p => p.admin).length > 0 && participants.filter(p => !p.admin).length > 0 && <div className="px-3 pt-3 pb-1 border-t border-gray-100"><span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Membros</span></div>}
                    {participants.filter(p => !p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                  </div>
                )}
                <div className="p-2 border-t border-gray-100"><button onClick={() => loadParticipants(cur.remote_jid)} disabled={loadingPart} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-400 hover:text-blue-700 hover:bg-gray-50 rounded-lg font-medium disabled:opacity-40 transition-colors"><RefreshCw className={`w-3 h-3 ${loadingPart ? 'animate-spin' : ''}`} /> Atualizar lista</button></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50"><div className="text-center"><MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium text-gray-400">Selecione uma conversa</p><p className="text-xs text-gray-300 mt-1">Escolha um contato na lista ao lado</p></div></div>
        )}
      </div>

      {showEdit && lead && <EditLeadModal lead={lead} columns={columns} onClose={() => setShowEdit(false)} onSave={async data => { await api.updateLead(lead.id, data); setLead({ ...lead, ...data }); setShowEdit(false); onRefresh(); }} onRefresh={() => loadLead(cur)} />}
      {showTrash && <TrashModal chats={deletedChats} loading={loadingTrash} onClose={() => setShowTrash(false)} onRestore={restoreChat} chatDisplayName={chatDisplayName} isGrp={isGrp} fmt={fmt} />}

      {forwardMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Encaminhar mensagem</h3>
              <button onClick={() => { setForwardMsg(null); setForwardSearch(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 mx-3 mt-2 mb-1 rounded-lg">
              <p className="text-[10px] text-gray-400 mb-0.5">Mensagem:</p>
              <p className="text-[11px] text-gray-600 truncate">{forwardMsg.content || `[${forwardMsg.message_type}]`}</p>
            </div>
            <div className="px-3 py-2">
              <input value={forwardSearch} onChange={e => setForwardSearch(e.target.value)} placeholder="Buscar conversa..." autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-200" />
            </div>
            <div className="max-h-64 overflow-y-auto px-1 pb-2">
              {chats.filter(c => c.id !== cur?.id && chatDisplayName(c).toLowerCase().includes(forwardSearch.toLowerCase())).slice(0, 15).map(c => (
                <button key={c.id} onClick={() => handleForward(c)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} size="w-8 h-8" textSize="text-[9px]" isGroup={isGrp(c)} cachedUrl={c.profile_pic_url} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{chatDisplayName(c)}</p>
                    {isGrp(c) && <span className="text-[9px] text-blue-600 font-medium">Grupo</span>}
                  </div>
                  <Forward className="w-3.5 h-3.5 text-gray-300" />
                </button>
              ))}
              {chats.filter(c => c.id !== cur?.id && chatDisplayName(c).toLowerCase().includes(forwardSearch.toLowerCase())).length === 0 && (
                <p className="text-center text-[11px] text-gray-400 py-6">Nenhuma conversa encontrada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Nova conversa</h3>
              <button onClick={() => { setShowNewChat(false); setNewChatPhone(''); setNewChatName(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (newChatPhone.replace(/\D/g, '').length >= 10) startNewChat(newChatPhone.replace(/\D/g, ''), newChatName || newChatPhone); }}
              className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Telefone com DDD</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={newChatPhone} onChange={e => setNewChatPhone(e.target.value)} placeholder="5514999999999"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-200" autoFocus required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nome (opcional)</label>
                <input value={newChatName} onChange={e => setNewChatName(e.target.value)} placeholder="Nome do contato"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-200" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowNewChat(false); setNewChatPhone(''); setNewChatName(''); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={newChatPhone.replace(/\D/g, '').length < 10}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">Iniciar conversa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

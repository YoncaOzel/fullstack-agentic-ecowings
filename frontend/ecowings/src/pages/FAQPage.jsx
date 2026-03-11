import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   MOCK RESPONSES
───────────────────────────────────────────────────────────────── */
const MOCK_RESPONSES = [
  /* ── Uçuş & Rezervasyon ── */
  {
    keywords: ['uçuş ara', 'nasıl arar', 'uçuş bul', 'how to search', 'arama'],
    answer: `Uçuş aramak çok kolay! 🛫\n\nAna sayfadaki arama kutusuna kalkış ve varış noktalarınızı, tarih ve yolcu sayısını girin. "Uçuş Ara" butonuna bastığınızda Amadeus API üzerinden gerçek zamanlı sonuçlar listelenir.\n\nİpucu: Esnek tarihleri deneyerek daha uygun fiyatlar bulabilirsiniz.`,
  },
  {
    keywords: ['rezervasyon', 'bilet al', 'satın al', 'book', 'booking', 'nasıl alır'],
    answer: `Bilet satın almak için aşağıdaki adımları izleyin:\n\n1. Uçuş listesinden istediğiniz seferi seçin.\n2. Yolcu bilgilerini doldurun.\n3. İndirim kuponunuz varsa uygulayın.\n4. Ödeme bilgilerinizi girin ve onaylayın.\n\nBiletiniz anında e-posta adresinize gönderilir ✉️`,
  },
  {
    keywords: ['iptal', 'cancel', 'iade', 'refund', 'geri öde'],
    answer: `Bilet iptali ve iade politikamız:\n\n• **Kalkıştan 72+ saat önce:** Tam iade\n• **24-72 saat arası:** %50 iade\n• **24 saatten az:** İade yapılmaz\n\nİptal işlemi için Profil > Uçuşlarım bölümünü ziyaret edin veya destek@ecowings.com adresine yazın.`,
  },
  {
    keywords: ['koltuk', 'seat', 'seat selection', 'koltuk seç'],
    answer: `Koltuk seçimi için bilet satın alma sürecinde "Koltuk Seç" adımı görünür.\n\nPencere kenarı mı, koridor mu? Tercihlerinizi seçebilirsiniz. Premium seçenekler (ekstra bacak mesafesi, ön sıralar) ek ücrete tabidir.`,
  },
  {
    keywords: ['bagaj', 'bavul', 'luggage', 'valiz', 'kilo'],
    answer: `Bagaj limitleri havayoluna göre değişir, ancak genel kurallar:\n\n🎒 Kabin: 7-10 kg, maks. 55x40x20 cm\n🧳 Hold: 15-23 kg (extra ücret karşılığı artırılabilir)\n\nUçuş detay sayfasında ilgili havayolunun bagaj politikası gösterilmektedir.`,
  },

  /* ── Ağaç & Çevre ── */
  {
    keywords: ['ağaç', 'tree', 'dikme', 'çevre', 'karbon', 'co2', 'carbon', 'yeşil', 'sürdürülebilir'],
    answer: `EcoWings'in en sevdiğim özelliği bu! 🌱\n\n**Her bilet al, bir ağaç dik.** Satın aldığınız her bilet için bir fidan Türkiye'nin ormansızlaşmaya maruz kalan bölgelerine dikilmektedir. Bu süreç Orman Genel Müdürlüğü ile ortaklık kapsamında yürütülmektedir.\n\nProfil sayfanızda katkı sağladığınız ağaç sayısını ve dikilen konumların haritasını görebilirsiniz.`,
  },
  {
    keywords: ['sertifika', 'certificate', 'belge', 'kanıt'],
    answer: `Evet! Her ağaç dikimi için dijital bir **Yeşil Uçuş Sertifikası** oluşturulur ve e-posta adresinize iletilir. Sertifikada:\n\n• Dikilen ağacın türü\n• Konum bilgisi (ilçe düzeyinde)\n• Dikiliş tarihi\n• Karbon tutma tahmini (kg CO₂/yıl)\n\nbilgileri yer alır. Sosyal medyada paylaşabilirsiniz!`,
  },
  {
    keywords: ['kaç ağaç', 'toplam ağaç', 'ne kadar ağaç', 'ağaç sayı'],
    answer: `Toplam dikilen ağaç sayısını Ana Sayfa'daki canlı sayaçtan takip edebilirsiniz. Bireysel katkınızı ise **Profil > Çevre Katkım** bölümünde görürsünüz.\n\nBirlikte şimdiye kadar 47.250'den fazla ağaç diktik! 🌳`,
  },

  /* ── Kupon & Kampanya ── */
  {
    keywords: ['kupon', 'coupon', 'indirim kodu', 'kampanya', 'promo', 'kod'],
    answer: `Kupon kodları ödeme sayfasındaki "İndirim Kodu" alanına girilir.\n\n🎫 Kupon bulmak için:\n• **Kampanyalar** sayfasını ziyaret edin\n• Bültenimize abone olun (ilk ödeme %10 indirim!)\n• Sosyal medya hesaplarımızı takip edin\n\nKuponlar kişiseldir ve tek kullanımlıktır.`,
  },
  {
    keywords: ['son kullanma', 'geçerli', 'expire', 'kupon süresi', 'ne zaman'],
    answer: `Her kuponun geçerlilik süresi farklıdır. Kampanyalar sayfasında her kupon kartında bitiş tarihi belirtilmektedir.\n\n⚠️ Süresi dolmuş kuponlar uygulanamaz. Yeni kampanyalardan ilk haberdar olmak için e-posta bültenimize abone olabilirsiniz.`,
  },
  {
    keywords: ['birden fazla kupon', 'kombine', 'iki kupon', 'stack'],
    answer: `Üzgünüm, şu anda bir siparişte yalnızca **tek kupon kodu** kullanılabilmektedir.\n\nAncak kuponları diğer kampanya fiyatlarıyla birlikte kullanmak mümkündür (kampanya + kupon kombinasyonu geçerlidir).`,
  },

  /* ── Hesap & Profil ── */
  {
    keywords: ['şifre', 'parola', 'password', 'sıfırla', 'reset', 'unuttum'],
    answer: `Şifrenizi sıfırlamak için:\n\n1. Giriş sayfasında **"Şifremi Unuttum"** linkine tıklayın.\n2. E-posta adresinizi girin.\n3. Gelen kutunuzdaki bağlantıya tıklayın (5 dakika geçerlidir).\n4. Yeni şifrenizi belirleyin.\n\nSpam/gereksiz klasörünü de kontrol etmeyi unutmayın 📬`,
  },
  {
    keywords: ['profil', 'hesap güncelle', 'bilgi güncelle', 'isim değiştir', 'email değiştir'],
    answer: `Profil bilgilerinizi güncellemek için:\n\n1. Sağ üstteki isim badge'ine tıklayın.\n2. **Profil Ayarları** sayfasına gidin.\n3. Ad, soyad, telefon veya e-posta bilgilerinizi düzenleyin.\n4. **Kaydet** butonuna basın.\n\nGüvenlik nedeniyle e-posta değişikliği onay gerektirmektedir.`,
  },
  {
    keywords: ['geçmiş', 'uçuşlarım', 'önceki uçuş', 'biletlerim', 'satın aldığım'],
    answer: `Geçmiş uçuşlarınıza ve biletlerinize **Profil > Uçuşlarım** bölümünden ulaşabilirsiniz.\n\nOrada şunları yapabilirsiniz:\n• Bilet PDF'ini indirme\n• Seferin durumunu takip etme\n• İptal veya değişiklik talep etme\n\nSisteme giriş yapmanız gerekmektedir.`,
  },
  {
    keywords: ['kayıt', 'üye ol', 'hesap aç', 'register', 'signup', 'sign up'],
    answer: `EcoWings'e üye olmak tamamen **ücretsiz!** 🎉\n\nKayıt sayfasında ad, soyad, e-posta ve şifre bilgilerinizi girin. E-posta doğrulamasının ardından hemen alışverişe başlayabilirsiniz.\n\nSosyal hesabınızla (Google) da giriş yapabilirsiniz.`,
  },

  /* ── Şanslı Uçuş ── */
  {
    keywords: ['şanslı uçuş', 'lucky flight', 'rastgele', 'sürpriz', 'şans'],
    answer: `**Şanslı Uçuş** özelliği ile nereye gideceğinizi bilmeden bilet alıyorsunuz! ✈️🎲\n\nSadece tarih ve bütçe aralığı belirleyin, uygulamamız sizi Türkiye'den veya yurt dışından sürpriz bir destinasyona götürür.\n\nAdrenalini seviyor musunuz? Deneyin! En çok tercih edilen destinasyonlar: Bali, Lizbon, Reykjavik 🌏`,
  },
];

const FALLBACK =
  `Sorunuzu tam olarak anlayamadım, üzgünüm! 🙏\n\nAşağıdaki konularda yardımcı olabilirim:\n• ✈️ Uçuş arama ve rezervasyon\n• 🌱 Ağaç dikme & çevre katkısı\n• 🎫 Kupon ve kampanyalar\n• 👤 Hesap ve profil işlemleri\n\nTekrar sormak ister misiniz? Konuya göre üstteki chip'lere de tıklayabilirsiniz.`;

function findResponse(text) {
  const lower = text.toLowerCase();
  for (const item of MOCK_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) return item.answer;
  }
  return FALLBACK;
}

/* ─────────────────────────────────────────────────────────────────
   SUGGESTED CHIPS
───────────────────────────────────────────────────────────────── */
const CHIPS = [
  { label: '✈️ Uçuş nasıl ararım?', query: 'Uçuş nasıl ararım?' },
  { label: '🌱 Ağaç katkısı nedir?', query: 'Ağaç dikme katkısı nedir?' },
  { label: '🎫 Kupon nasıl kullanılır?', query: 'Kupon kodu nasıl kullanılır?' },
  { label: '🔑 Şifremi unuttum', query: 'Şifremi unuttum, nasıl sıfırlarım?' },
  { label: '✨ Şanslı Uçuş nedir?', query: 'Şanslı Uçuş nedir?' },
  { label: '🧳 Bagaj kuralları neler?', query: 'Bagaj limitleri nelerdir?' },
];

/* ─────────────────────────────────────────────────────────────────
   RENDER HELPERS — Bold markdown (**text**) support
───────────────────────────────────────────────────────────────── */
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </span>
    );
  });
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function FAQPage() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'ai',
      text: 'Merhaba! 🌿 Ben EcoWings Asistanı. Uçuş aramadan bilet satın almaya, ağaç katkısından kupon kullanımına kadar her konuda sana yardımcı olabilirim.\n\nNasıl yardımcı olabilirim?',
      done: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  /* Scroll to bottom inside the chat box (never moves the page window) */
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  /* ── Typewriter effect ── */
  const typewriterEffect = (fullText, msgId) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, text: fullText.slice(0, i), done: i >= fullText.length }
            : m
        )
      );
      if (i >= fullText.length) clearInterval(interval);
    }, 18);
  };

  /* ── Send handler ── */
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;

    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: trimmed, done: true }]);
    setInput('');
    setLoading(true);

    const answer = findResponse(trimmed);
    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [...prev, { id: aiMsgId, role: 'ai', text: '', done: false }]);
      setTimeout(() => typewriterEffect(answer, aiMsgId), 60);
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (query) => {
    if (loading) return;
    setInput(query);
    inputRef.current?.focus();
  };

  /* ── Fade-up intersection observer for hero elements ── */
  useEffect(() => {
    const els = document.querySelectorAll('.faq-fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ─── Styles ─────────────────────────────────────────── */
  const pageStyle = {
    minHeight: '100vh',
    background: 'var(--bg-main)',
    paddingBottom: '0',
  };

  const containerStyle = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={pageStyle}>
      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{
        padding: '64px 20px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulseOrb 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '10%',
          width: '200px', height: '200px',
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulseOrb 8s ease-in-out infinite 2s',
        }} />

        <div className="faq-fade-up fade-up">
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '100px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.18)',
            color: 'var(--green-primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            <Sparkles size={12} />
            YARDIM MERKEZİ
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(1.9rem, 5vw, 3rem)',
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#1a4d33',
            margin: '0 0 14px',
          }}>
            Nasıl Yardımcı Olabiliriz?
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: '0 auto 32px',
            fontFamily: "'Inter', sans-serif",
          }}>
            Yapay zeka destekli asistanımıza istediğiniz soruyu sorun —
            uçuşlar, kampanyalar, çevre katkısı veya hesabınız hakkında.
          </p>

          {/* Suggested chips */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {CHIPS.map((chip) => (
              <ChipButton key={chip.query} chip={chip} onSelect={handleChip} disabled={loading} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CHAT AREA ════════════════════════════════════ */}
      <div style={containerStyle}>
        {/* Chat window */}
        <div
          className="faq-fade-up fade-up"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '440px',
            maxHeight: '520px',
            marginBottom: '0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Chat header bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderBottom: '1px solid rgba(34,197,94,0.12)',
            background: 'rgba(34,197,94,0.04)',
            flexShrink: 0,
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(22,163,74,0.15))',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green-primary)',
              flexShrink: 0,
            }}>
              <Bot size={16} />
            </div>
            <div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                EcoWings Asistanı
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                color: '#4ade80',
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  display: 'inline-block',
                  boxShadow: '0 0 6px rgba(74,222,128,0.6)',
                  animation: 'statusPulse 2s ease-in-out infinite',
                }} />
                Çevrimiçi
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34,197,94,0.25) transparent',
            }}
          >
            {messages.map((msg) =>
              msg.role === 'user'
                ? <UserMessage key={msg.id} text={msg.text} />
                : <AiMessage key={msg.id} text={msg.text} done={msg.done} />
            )}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', animation: 'msgSlideIn 0.25s ease both' }}>
                <AiAvatar />
                <div style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--green-primary)',
                        display: 'inline-block',
                        opacity: 0.8,
                        animation: `dotBounce 1.2s ease-in-out infinite ${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ══ INPUT BAR ════════════════════════════════════ */}
        <div style={{
          padding: '14px 0 32px',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            background: 'var(--bg-card)',
            border: `1px solid ${inputFocused ? 'rgba(34,197,94,0.45)' : 'rgba(34,197,94,0.18)'}`,
            borderRadius: '14px',
            padding: '12px 12px 12px 16px',
            boxShadow: inputFocused
              ? '0 0 0 3px rgba(34,197,94,0.08), 0 4px 12px rgba(0,0,0,0.06)'
              : '0 4px 12px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Bir soru sorun... (örn: 'Uçuş nasıl ararım?')"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                lineHeight: '1.5',
                maxHeight: '120px',
                overflowY: 'auto',
                caretColor: 'var(--green-primary)',
                opacity: loading ? 0.5 : 1,
                paddingTop: '2px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <SendButton onClick={handleSend} disabled={!input.trim() || loading} />
          </div>
          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            margin: '10px 0 0',
            fontFamily: "'Inter', sans-serif",
          }}>
            Enter ile gönder · Shift+Enter satır ekler
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SUB COMPONENTS
───────────────────────────────────────────────────────────────── */

function UserMessage({ text }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'msgSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <div style={{
        maxWidth: '72%',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#f0fdf4',
        borderRadius: '18px 18px 4px 18px',
        padding: '10px 14px',
        fontSize: '0.88rem',
        lineHeight: 1.55,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div style={{
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(22,163,74,0.12))',
      border: '1px solid rgba(34,197,94,0.28)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--green-primary)',
      flexShrink: 0,
      marginTop: '2px',
    }}>
      <Bot size={14} />
    </div>
  );
}

function AiMessage({ text, done }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      animation: 'msgSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <AiAvatar />
      <div style={{
        maxWidth: '85%',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        lineHeight: 1.7,
        fontFamily: "'Inter', sans-serif",
        paddingTop: '4px',
        wordBreak: 'break-word',
      }}>
        {renderText(text)}
        {!done && (
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '14px',
            background: 'var(--green-primary)',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            animation: 'cursorBlink 0.9s step-end infinite',
          }} />
        )}
      </div>
    </div>
  );
}

function ChipButton({ chip, onSelect, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(chip.query)}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 13px',
        borderRadius: '100px',
        border: `1px solid ${hovered ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
        background: hovered ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.05)',
        color: hovered ? 'var(--green-primary)' : 'var(--text-secondary)',
        fontSize: '0.78rem',
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.18s ease',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        letterSpacing: '0.01em',
      }}
    >
      {chip.label}
      <ChevronRight size={12} />
    </button>
  );
}

function SendButton({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        border: 'none',
        background: disabled
          ? 'rgba(34,197,94,0.15)'
          : hovered
          ? 'linear-gradient(135deg, #4ade80, #22c55e)'
          : 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: disabled ? 'rgba(34,197,94,0.4)' : '#f0fdf4',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.18s ease',
        transform: hovered && !disabled ? 'scale(1.06)' : 'scale(1)',
        boxShadow: !disabled ? '0 2px 12px rgba(34,197,94,0.35)' : 'none',
      }}
    >
      <Send size={16} />
    </button>
  );
}

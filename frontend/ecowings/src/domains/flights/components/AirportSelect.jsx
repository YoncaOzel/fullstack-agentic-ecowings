import { useState, useRef, useEffect } from 'react';
import { PlaneTakeoff, PlaneLanding, Search, ChevronDown, X } from 'lucide-react';

/**
 * Havalimanı seçim dropdown'u.
 *
 * Props:
 *  label      – "Nereden" / "Nereye"
 *  icon       – "takeoff" | "landing"
 *  airports   – [{ code, name, city, country }]
 *  value      – seçili IATA kodu (string)
 *  onChange   – (code: string) => void  — seçilince IATA kodu iletilir
 *  placeholder
 */
export default function AirportSelect({ label, icon = 'takeoff', airports = [], value, onChange, placeholder = 'Şehir veya havalimanı' }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef          = useRef(null);
  const inputRef              = useRef(null);

  // Seçili havalimanı
  const selected = airports.find(a => a.code === value);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtrelenmiş liste
  const q = query.toLowerCase();
  const filtered = q.length === 0
    ? airports
    : airports.filter(a =>
        a.code?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q)
      );

  const handleSelect = (airport) => {
    onChange(airport.code);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  const handleOpen = () => {
    setOpen(true);
    setFocused(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const IconComp = icon === 'landing' ? PlaneLanding : PlaneTakeoff;

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Label */}
      <span style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(34,197,94,0.7)',
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        marginBottom: '4px',
      }}>
        {label}
      </span>

      {/* Trigger */}
      <div
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: focused || open ? '1px solid #22c55e' : '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: focused || open ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <IconComp size={16} style={{ color: focused || open ? '#22c55e' : 'rgba(34,197,94,0.5)', flexShrink: 0, transition: 'color 0.2s ease' }} />

        {open ? (
          /* Arama kutusu açık */
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Şehir, kod veya havalimanı ara..."
            onClick={e => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f0f0f0',
              fontSize: '15px',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        ) : (
          /* Seçili değer ya da placeholder */
          <span style={{
            flex: 1,
            fontSize: '15px',
            color: selected ? '#f0f0f0' : '#4b5563',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {selected ? `${selected.city} (${selected.code})` : placeholder}
          </span>
        )}

        {/* Clear / Chevron */}
        {selected && !open ? (
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} style={{ color: 'rgba(34,197,94,0.5)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(5,18,8,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.06) inset',
          maxHeight: '280px',
          overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: '#4b5563', fontSize: '13px' }}>
              <Search size={16} style={{ marginBottom: '6px', opacity: 0.5 }} />
              <div>Sonuç bulunamadı</div>
            </div>
          ) : (
            filtered.slice(0, 40).map(airport => (
              <button
                key={airport.code}
                onMouseDown={e => e.preventDefault()} // blur engellemeden seçmeyi sağlar
                onClick={() => handleSelect(airport)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  background: airport.code === value ? 'rgba(34,197,94,0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(34,197,94,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (airport.code !== value) e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                onMouseLeave={e => { if (airport.code !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* IATA badge */}
                <span style={{
                  flexShrink: 0,
                  width: '42px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: airport.code === value ? '#22c55e' : '#6b7280',
                  background: airport.code === value ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '3px 0',
                }}>
                  {airport.code}
                </span>

                {/* City + Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {airport.city}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {airport.name} · {airport.country}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { PlaneTakeoff, PlaneLanding, Search, ChevronDown, X, Loader2 } from 'lucide-react';
import airportService from '../../../shared/services/airportService';

/**
 * Havalimanı seçim dropdown'u — debounced API search.
 *
 * Props:
 *  label        – "Nereden" / "Nereye"
 *  icon         – "takeoff" | "landing"
 *  airports     – [{ code, name, city, country }]  (fallback local list)
 *  value        – seçili IATA kodu (string)
 *  onChange     – (code: string) => void
 *  placeholder
 */
export default function AirportSelect({
  label,
  icon = 'takeoff',
  airports = [],
  value,
  onChange,
  placeholder = 'Şehir veya havalimanı',
}) {
  const [open, setOpen]                   = useState(false);
  const [query, setQuery]                 = useState('');
  const [focused, setFocused]             = useState(false);
  const [results, setResults]             = useState([]);
  const [searching, setSearching]         = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const containerRef                      = useRef(null);
  const inputRef                          = useRef(null);
  const debounceTimer                     = useRef(null);

  const selected = airports.find(a => a.code === value)
    || results.find(a => a.code === value)
    || (selectedAirport?.code === value ? selectedAirport : null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setFocused(false);
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced API search
  const doSearch = useCallback((q) => {
    clearTimeout(debounceTimer.current);
    if (!q || q.trim().length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await airportService.searchAirports(q.trim());
        const data = Array.isArray(res.data) ? res.data : [];
        // API'den gelen sonuç boşsa local fallback
        if (data.length === 0 && airports.length > 0) {
          const lq = q.toLowerCase();
          const local = airports.filter(a =>
            a.code?.toLowerCase().startsWith(lq) ||
            a.city?.toLowerCase().startsWith(lq) ||
            a.name?.toLowerCase().startsWith(lq)
          ).slice(0, 10);
          setResults(local);
        } else {
          setResults(data);
        }
      } catch {
        // API hatası — local fallback
        const lq = q.toLowerCase();
        const local = airports.filter(a =>
          a.code?.toLowerCase().includes(lq) ||
          a.city?.toLowerCase().includes(lq) ||
          a.name?.toLowerCase().includes(lq)
        ).slice(0, 10);
        setResults(local);
      } finally {
        setSearching(false);
      }
    }, 250);
  }, [airports]);

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    doSearch(q);
  };

  const handleSelect = (airport) => {
    setSelectedAirport(airport);
    onChange(airport.code, airport);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedAirport(null);
    onChange('');
    setQuery('');
    setResults([]);
  };

  const handleOpen = () => {
    setOpen(true);
    setFocused(true);
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const displayList = query.length > 0 ? results : airports.slice(0, 40);

  const IconComp = icon === 'landing' ? PlaneLanding : PlaneTakeoff;

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Label */}
      <span style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        color: '#1c2b22',
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
          background: 'rgba(255,255,255,0.85)',
          border: focused || open ? '1px solid #22c55e' : '1px solid rgba(34,197,94,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: focused || open ? '0 0 0 3px rgba(34,197,94,0.12)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <IconComp size={16} style={{ color: focused || open ? '#22c55e' : '#6b7280', flexShrink: 0, transition: 'color 0.2s ease' }} />

        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            placeholder="Şehir, kod veya havalimanı ara..."
            onClick={e => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#1c2b22',
              fontSize: '15px',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        ) : (
          <span style={{
            flex: 1,
            fontSize: '15px',
            color: selected ? '#1c2b22' : '#9ca3af',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {selected ? `${selected.city} (${selected.code})` : placeholder}
          </span>
        )}

        {/* Loader / Clear / Chevron */}
        {searching ? (
          <Loader2 size={14} style={{ color: 'rgba(34,197,94,0.6)', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
        ) : selected && !open ? (
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} style={{ color: '#6b7280', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="airport-dropdown" style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          minWidth: '100%',
          width: 'max-content',
          maxWidth: '360px',
          background: '#ffffff',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.12), 0 4px 12px rgba(77,124,95,0.08)',
          maxHeight: '280px',
          overflowY: 'auto',
        }}>
          {searching ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite', color: '#22c55e' }} />
              Aranıyor…
            </div>
          ) : displayList.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              <Search size={16} style={{ marginBottom: '6px', opacity: 0.5, display: 'block', margin: '0 auto 6px' }} />
              <div>{query.length > 0 ? 'Sonuç bulunamadı' : 'Aramaya başlayın'}</div>
            </div>
          ) : (
            displayList.map(airport => (
              <button
                key={airport.code}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(airport)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  background: airport.code === value ? 'rgba(34,197,94,0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (airport.code !== value) e.currentTarget.style.background = '#f4f9f5'; }}
                onMouseLeave={e => { if (airport.code !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* IATA badge */}
                <span style={{
                  flexShrink: 0,
                  width: '42px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: airport.code === value ? '#16a34a' : '#6b7280',
                  background: airport.code === value ? '#f0faf3' : '#f3f4f6',
                  borderRadius: '6px',
                  padding: '3px 0',
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {airport.code}
                </span>

                {/* City + Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c2b22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import { useState } from 'react';
import flightService from '../services/flightService';
import FlightDetail from '../components/FlightDetail';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

export default function FlightTrackerPage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!flightNumber.trim()) { setError('Uçuş numarası girin.'); return; }
    setError('');
    setResult(null);
    setNotFound(false);
    setLoading(true);

    try {
      const res = await flightService.getFlights();
      if (res.data?.succeeded) {
        const found = (res.data.data || []).find(
          (f) => f.flightNumber?.toLowerCase() === flightNumber.trim().toLowerCase()
        );
        if (found) setResult(found);
        else setNotFound(true);
      } else {
        setError(res.data?.message || 'Uçuş bilgisi alınamadı.');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--primary-dark)', color: '#fff', padding: '48px 0' }}>
        <div className="container">
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>📡 Uçuş Takip</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Uçuş numarasıyla anlık bilgi alın</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Uçuş Numarası ile Sorgula</h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
              <input
                className="form-input"
                placeholder="ör: TK123"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '...' : 'Ara'}
              </button>
            </form>
            {error && <ErrorMessage message={error} />}
          </div>

          {loading && <LoadingSpinner text="Uçuş aranıyor..." />}

          {notFound && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <h3>Uçuş Bulunamadı</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                "<strong>{flightNumber}</strong>" numaralı uçuş sistemde kayıtlı değil.
              </p>
            </div>
          )}

          {result && <FlightDetail flight={result} />}
        </div>
      </div>
    </main>
  );
}

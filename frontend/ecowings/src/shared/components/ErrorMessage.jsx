export default function ErrorMessage({ message, errors = [] }) {
  if (!message && errors.length === 0) return null;
  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      padding: '14px 18px',
      color: '#fca5a5',
      fontSize: '0.875rem',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>⚠</span>
      <div>
        {message && <p style={{ fontWeight: 600, marginBottom: errors.length ? '6px' : 0, color: '#fca5a5', margin: errors.length ? '0 0 6px' : 0 }}>{message}</p>}
        {errors.length > 0 && (
          <ul style={{ paddingLeft: '18px', margin: 0, color: '#fca5a5' }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

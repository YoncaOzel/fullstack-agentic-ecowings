export default function ErrorMessage({ message, errors = [] }) {
  if (!message && errors.length === 0) return null;
  return (
    <div style={{
      background: '#fff5f5',
      border: '1px solid #fc8181',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#c53030',
      fontSize: '0.875rem',
      marginBottom: '16px',
    }}>
      {message && <p style={{ fontWeight: 600, marginBottom: errors.length ? '6px' : 0 }}>{message}</p>}
      {errors.length > 0 && (
        <ul style={{ paddingLeft: '18px', margin: 0 }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from './api/client.js';

function App() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    api.get('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then((data) => setStatus(`API: ${data.status}`))
      .catch(() => setStatus('API unreachable'));
  }, []);

  return (
    <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem' }}>
      <h1>Recipe App</h1>
      <p>Starter frontend connected to the backend.</p>
      <p><strong>Status:</strong> {status}</p>
    </main>
  );
}

export default App;

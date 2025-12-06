import { useEffect, useMemo, useState } from 'react';
import { api } from './api/client.js';

const initialRecipe = { title: '', description: '', instructions: '' };
const emptyIngredient = { name: '', quantity: '', unit: '' };

const extractTokens = (payload) => {
  const data = payload?.data ?? payload;
  return {
    token: data?.token,
    refreshToken: data?.refreshToken,
  };
};

function App() {
  const [health, setHealth] = useState('checking...');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [authStatus, setAuthStatus] = useState('idle');

  const [recipes, setRecipes] = useState([]);
  const [recipeForm, setRecipeForm] = useState(initialRecipe);
  const [ingredients, setIngredients] = useState([{ ...emptyIngredient }]);
  const [recipeStatus, setRecipeStatus] = useState('idle');
  const [recipeMessage, setRecipeMessage] = useState('');

  const isAuthed = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    const init = async () => {
      await checkHealth();
      const { accessToken } = api.getTokens();
      if (accessToken) await fetchMe();
    };
    init();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealth(res.status || 'ok');
    } catch (err) {
      setHealth('unreachable');
      setAuthMessage(err.message || 'Health check failed');
    }
  };

  const fetchMe = async () => {
    try {
      const res = await api.me();
      setUser(res.data || res.user || res);
      await loadRecipes();
    } catch (err) {
      api.clearTokens();
      setUser(null);
      setAuthMessage(err.message || 'Session expired');
    }
  };

  const loadRecipes = async () => {
    try {
      const res = await api.recipes.list();
      const payload = res?.data ?? res;
      const items = Array.isArray(payload) ? payload : payload?.recipes || [];
      const normalized = items.map((r) => ({
        ...r,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        instructions: Array.isArray(r.instructions)
          ? r.instructions
          : (r.instructions ? String(r.instructions).split('\n').filter(Boolean) : []),
      }));
      setRecipes(normalized);
    } catch (err) {
      setRecipeMessage(err.message || 'Could not load recipes');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    setAuthStatus('loading');

    if (authMode === 'register') {
      if (password.length < 8) {
        setAuthStatus('error');
        setAuthMessage('Password must be at least 8 characters');
        return;
      }
      if (!/^[a-zA-Z0-9]{3,30}$/.test(username)) {
        setAuthStatus('error');
        setAuthMessage('Username must be 3-30 alphanumeric characters');
        return;
      }
    }

    try {
      const fn = authMode === 'login' ? api.login : api.register;
      const payload = authMode === 'login' 
        ? { email, password }
        : { email, password, username };
      const res = await fn(payload);
      const { token, refreshToken } = extractTokens(res);
      if (token) api.setTokens(token, refreshToken);
      await fetchMe();
      setAuthMessage(authMode === 'login' ? 'Logged in' : 'Registered');
      setAuthStatus('success');
      setPassword('');
      setUsername('');
    } catch (err) {
      setAuthStatus('error');
      setAuthMessage(err.message || 'Auth failed');
    }
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    setRecipeMessage('');
    setRecipeStatus('loading');
    try {
      const instructions = recipeForm.instructions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const filteredIngredients = ingredients
        .map((ing) => ({ ...ing, quantity: Number(ing.quantity || 0) }))
        .filter((ing) => ing.name.trim());

      if (filteredIngredients.length === 0) {
        setRecipeStatus('error');
        setRecipeMessage('Add at least one ingredient');
        return;
      }
      if (instructions.length === 0) {
        setRecipeStatus('error');
        setRecipeMessage('Add at least one instruction');
        return;
      }

      await api.recipes.create({
        title: recipeForm.title,
        description: recipeForm.description,
        instructions,
        ingredients: filteredIngredients,
      });

      setRecipeForm(initialRecipe);
      setIngredients([{ ...emptyIngredient }]);
      setRecipeStatus('success');
      await loadRecipes();
      setRecipeMessage('Recipe created');
    } catch (err) {
      setRecipeStatus('error');
      setRecipeMessage(err.message || 'Could not create recipe');
    }
  };

  const handleLogout = () => {
    api.clearTokens();
    setUser(null);
    setRecipes([]);
    setRecipeMessage('');
    setAuthMessage('Logged out');
    setAuthMode('login');
  };

  const renderDescription = (text) => {
    if (!text) return null;
    return text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, idx) => (
        <p key={idx} style={{ margin: '0 0 0.25rem', color: '#444' }}>{p}</p>
      ));
  };

  const updateIngredient = (index, key, value) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [key]: value } : ing)));
  };

  const addIngredient = () => setIngredients((prev) => [...prev, { ...emptyIngredient }]);

  const removeIngredient = (index) => {
    setIngredients((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  return (
    <main style={{ fontFamily: 'Segoe UI, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto', lineHeight: 1.5 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Recipe App</h1>
          <p style={{ margin: 0, color: '#444' }}>Auth + recipes wired to backend</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div><strong>API</strong>: {health}</div>
          {isAuthed && <div style={{ fontSize: '0.9rem' }}>Signed in as {user?.email || 'user'}</div>}
        </div>
      </header>

      <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1.2fr', alignItems: 'start' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
          {!isAuthed && (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button type="button" onClick={() => setAuthMode('login')} disabled={authMode === 'login'}>
                  Login
                </button>
                <button type="button" onClick={() => setAuthMode('register')} disabled={authMode === 'register'}>
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                <label>
                  Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                {authMode === 'register' && (
                  <label>
                    Username
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </label>
                )}
                <label>
                  Password
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button type="submit" disabled={authStatus === 'loading'}>
                    {authStatus === 'loading' ? 'Submitting...' : authMode === 'login' ? 'Login' : 'Create account'}
                  </button>
                </div>
                {authMessage && <div style={{ color: authStatus === 'error' ? '#b00' : '#0a0' }}>{authMessage}</div>}
              </form>
            </>
          )}

          {isAuthed && (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div><strong>Signed in as</strong><br />{user?.email || 'user'}</div>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
          <h2 style={{ marginTop: 0 }}>Recipes</h2>
          {!isAuthed && <p>Login or register to view recipes.</p>}
          {isAuthed && (
            <>
              <form onSubmit={handleCreateRecipe} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  placeholder="Title"
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  rows={2}
                  required
                />

                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Ingredients</span>
                    <button type="button" onClick={addIngredient} style={{ padding: '0.25rem 0.5rem' }}>+ Add</button>
                  </div>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 0.8fr auto', gap: '0.35rem', alignItems: 'center' }}>
                      <input
                        placeholder="Name"
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                        required
                      />
                      <input
                        placeholder="Unit"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => removeIngredient(idx)} disabled={ingredients.length === 1}>x</button>
                    </div>
                  ))}
                </div>

                <textarea
                  placeholder="Instructions (one step per line)"
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                  rows={3}
                  required
                />
                <button type="submit" disabled={recipeStatus === 'loading'}>
                  {recipeStatus === 'loading' ? 'Saving...' : 'Create recipe'}
                </button>
                {recipeMessage && (
                  <div style={{ color: recipeStatus === 'error' ? '#b00' : '#0a0' }}>{recipeMessage}</div>
                )}
              </form>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {recipes.length === 0 && <p>No recipes yet.</p>}
                {recipes.map((r) => (
                  <article key={r.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '0.75rem', background: '#fff' }}>
                    <h3 style={{ margin: '0 0 0.25rem' }}>{r.title}</h3>
                    {r.createdAt && (
                      <div style={{ margin: '0 0 0.25rem', color: '#666', fontSize: '0.9rem' }}>
                        Created {new Date(r.createdAt).toLocaleString()}
                      </div>
                    )}
                    {renderDescription(r.description)}
                    {r.ingredients?.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Ingredients</strong>
                        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                          {r.ingredients.map((ing, idx) => (
                            <li key={idx}>{ing.name}{ing.quantity ? ` — ${ing.quantity} ${ing.unit || ''}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.instructions?.length > 0 && (
                      <div>
                        <strong>Instructions</strong>
                        <ol style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                          {r.instructions.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;

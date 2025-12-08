import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api/client.js';
import './styles.css';
import Button from './ui/Button.jsx';
import Card from './ui/Card.jsx';
import Section from './ui/Section.jsx';

const initialRecipe = { title: '', description: '', instructions: '' };
const emptyIngredient = { name: '', quantity: '', unit: '' };

const extractTokens = (payload) => {
  const data = payload?.data ?? payload;
  return {
    token: data?.token,
    refreshToken: data?.refreshToken,
  };
};

const Landing = () => (
  <div className="container">
    <div className="landing-hero">
      <div>
        <div className="chip" style={{ marginBottom: '0.75rem' }}>Phase 3</div>
        <h1 style={{ margin: '0 0 0.5rem' }}>Recipe App</h1>
        <p style={{ color: '#5c6475', maxWidth: 520 }}>
          Paste a social/video link and get a clean, structured recipe with ingredients, steps, and timing. Plan meals, generate shopping lists, and organize collections.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Link to="/app"><Button variant="primary">Open App</Button></Link>
          <a className="btn btn-ghost" href="#features">See features</a>
        </div>
      </div>
      <Card title="What you can do">
        <ul style={{ paddingLeft: '1rem', margin: 0, color: '#1f2532' }}>
          <li>Register / login and manage recipes</li>
          <li>Plan meals on a calendar</li>
          <li>Generate and export shopping lists</li>
          <li>Organize recipes into collections</li>
        </ul>
      </Card>
    </div>

    <Section id="features" title="Core features" kicker="Built" className="section">
      <div className="grid-2">
        <Card title="Meal planning" className="card">Calendar with date click, month nav, and entry removal.</Card>
        <Card title="Shopping lists" className="card">Aggregated ingredients by name+unit with CSV/JSON export.</Card>
        <Card title="Collections" className="card">Create collections, add/remove recipes, cascade deletes.</Card>
        <Card title="Auth + Recipes" className="card">JWT auth, recipe CRUD with edit/delete modals.</Card>
      </div>
    </Section>
  </div>
);

const isActivePath = (pathname, current) => pathname === current;

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

  const [importUrl, setImportUrl] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importDescription, setImportDescription] = useState('');
  const [importStatus, setImportStatus] = useState('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importTab, setImportTab] = useState('url'); // 'url' | 'social' | 'image'
  
    // Social import state
    const [socialUrl, setSocialUrl] = useState('');
    const [socialStatus, setSocialStatus] = useState('idle');
    const [socialMessage, setSocialMessage] = useState('');
    const [socialPreview, setSocialPreview] = useState(null);
  
    // Image import state
    const [imageUrl, setImageUrl] = useState('');
    const [imageStatus, setImageStatus] = useState('idle');
    const [imageMessage, setImageMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedMealType, setSelectedMealType] = useState('');
    const [selectedDietary, setSelectedDietary] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('');
    const [filterOptions, setFilterOptions] = useState({ mealTypes: [], dietaries: [], cuisines: [] });
  
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editForm, setEditForm] = useState(initialRecipe);
  const [editIngredients, setEditIngredients] = useState([{ ...emptyIngredient }]);
  const [editStatus, setEditStatus] = useState('idle');
  const [editMessage, setEditMessage] = useState('');
  
  const [mealPlans, setMealPlans] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMealPlanForm, setShowMealPlanForm] = useState(false);
  const [mealPlanForm, setMealPlanForm] = useState({ date: new Date().toISOString().split('T')[0], recipeId: '', notes: '' });
  const [mealPlanStatus, setMealPlanStatus] = useState('idle');
  const [mealPlanMessage, setMealPlanMessage] = useState('');
  
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingListStartDate, setShoppingListStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [shoppingListEndDate, setShoppingListEndDate] = useState(new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
  
  const [collections, setCollections] = useState([]);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('idle');
  const [collectionMessage, setCollectionMessage] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showAddRecipeToCollectionForm, setShowAddRecipeToCollectionForm] = useState(false);
  const [selectedRecipeForCollection, setSelectedRecipeForCollection] = useState('');

  const isAuthed = useMemo(() => Boolean(user), [user]);
  const navigate = useNavigate();
  const location = useLocation();

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
      // Silently clear stale tokens on startup without showing error
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
      navigate('/app', { replace: true });
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

  const handleImportFromUrl = async (e) => {
    e.preventDefault();
    const url = importUrl.trim();
    if (!url) {
      setImportStatus('error');
      setImportMessage('Enter a recipe URL');
      return;
    }

    setImportStatus('loading');
    setImportMessage('');
    setImportPreview(null);

    try {
      const res = await api.imports.fromUrl({
        url,
        title: importTitle || undefined,
        description: importDescription || undefined,
      });

      const recipe = res?.data?.data || res?.data || res;
      setImportPreview(recipe);
      setImportStatus('success');
      setImportMessage('Imported. Review below and edit in Recipes.');
      setImportUrl('');
      setImportTitle('');
      setImportDescription('');
      await loadRecipes();
    } catch (err) {
      setImportStatus('error');
      setImportMessage(err.message || 'Import failed');
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

  const renderDescription = useCallback((text) => {
    if (!text) return null;
    return text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, idx) => (
        <p key={idx} style={{ margin: '0 0 0.25rem', color: '#444' }}>{p}</p>
      ));
  }, []);

  const getFilteredRecipes = useCallback(() => {
    return recipes.filter((r) => {
      // Search by title and ingredients
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesIngredients = r.ingredients?.some(ing => ing.name?.toLowerCase().includes(q)) ?? false;
        const matchesDescription = r.description?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesIngredients && !matchesDescription) return false;
      }

      // Filter by tags (parse tags JSON)
      const tags = r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [];
      if (selectedMealType && !tags.includes(selectedMealType)) return false;
      if (selectedDietary && !tags.some(t => t.toLowerCase().includes(selectedDietary.toLowerCase()))) return false;
      if (selectedCuisine && !tags.some(t => t.toLowerCase().includes(selectedCuisine.toLowerCase()))) return false;

      return true;
    });
  }, [recipes, searchQuery, selectedMealType, selectedDietary, selectedCuisine]);


  const updateIngredient = useCallback((index, key, value) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [key]: value } : ing)));
  }, []);

  const addIngredient = useCallback(() => setIngredients((prev) => [...prev, { ...emptyIngredient }]), []);

  const removeIngredient = useCallback((index) => {
    setIngredients((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setEditForm({
      title: recipe.title,
      description: recipe.description || '',
      instructions: recipe.instructions?.join('\n') || '',
    });
    setEditIngredients(recipe.ingredients || [{ ...emptyIngredient }]);
    setEditMessage('');
    setEditStatus('idle');
  };

  const closeEditModal = () => {
    setEditingRecipe(null);
    setEditForm(initialRecipe);
    setEditIngredients([{ ...emptyIngredient }]);
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    setEditMessage('');
    setEditStatus('loading');
    try {
      const instructions = editForm.instructions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const filteredIngredients = editIngredients
        .map((ing) => ({ ...ing, quantity: Number(ing.quantity || 0) }))
        .filter((ing) => ing.name.trim());

      if (filteredIngredients.length === 0) {
        setEditStatus('error');
        setEditMessage('Add at least one ingredient');
        return;
      }
      if (instructions.length === 0) {
        setEditStatus('error');
        setEditMessage('Add at least one instruction');
        return;
      }

      await api.recipes.update(editingRecipe.id, {
        title: editForm.title,
        description: editForm.description,
        instructions,
        ingredients: filteredIngredients,
      });

      setEditStatus('success');
      setEditMessage('Recipe updated');
    const handleImportFromUrl = async (e) => {
      e.preventDefault();
      const url = importUrl.trim();
      if (!url) {
        setImportStatus('error');
        setImportMessage('Enter a recipe URL');
        return;
      }

      setImportStatus('loading');
      setImportMessage('');
      setImportPreview(null);

      try {
        const res = await api.imports.fromUrl({
          url,
          title: importTitle || undefined,
          description: importDescription || undefined,
        });

        const recipe = res?.data?.data || res?.data || res;
        setImportPreview(recipe);
        setImportStatus('success');
        setImportMessage('Imported. Review below and edit in Recipes.');
        setImportUrl('');
        setImportTitle('');
        setImportDescription('');
        await loadRecipes();
      } catch (err) {
        setImportStatus('error');
        setImportMessage(err.message || 'Import failed');
      }
    };

    const handleImportFromSocial = async (e) => {
      e.preventDefault();
      const url = socialUrl.trim();
      if (!url) {
        setSocialStatus('error');
        setSocialMessage('Enter a social media URL');
        return;
      }

      setSocialStatus('loading');
      setSocialMessage('');
      setSocialPreview(null);

      try {
        const res = await api.imports.fromSocial({ url });
        const recipe = res?.data?.data || res?.data || res;
        setSocialPreview(recipe);
        setSocialStatus('success');
        setSocialMessage('Imported from social. Review below and edit in Recipes.');
        setSocialUrl('');
        await loadRecipes();
      } catch (err) {
        setSocialStatus('error');
        setSocialMessage(err.message || 'Social import failed');
      }
    };

    const handleImportFromImage = async (e) => {
      e.preventDefault();
      const url = imageUrl.trim();
      if (!url) {
        setImageStatus('error');
        setImageMessage('Enter an image URL');
        return;
      }

      setImageStatus('loading');
      setImageMessage('');
      setImagePreview(null);

      try {
        const res = await api.imports.fromImage({ imageUrl: url });
        const recipe = res?.data?.data || res?.data || res;
        setImagePreview(recipe);
        setImageStatus('success');
        setImageMessage('Image imported. Review and edit in Recipes.');
        setImageUrl('');
        await loadRecipes();
      } catch (err) {
        setImageStatus('error');
        setImageMessage(err.message || 'Image import failed');
      }
    };

    const handleUpdateRecipe = async (e) => {
      e.preventDefault();
      setEditStatus('loading');
      try {
        await api.recipes.update(editingRecipe.id, editForm);
        setEditStatus('success');
        setEditMessage('Recipe updated!');
        await loadRecipes();
        setTimeout(closeEditModal, 800);
      } catch (err) {
        setEditStatus('error');
        setEditMessage(err.message || 'Could not update recipe');
      }
    };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await api.recipes.delete(id);
      await loadRecipes();
    } catch (err) {
      setRecipeMessage(err.message || 'Could not delete recipe');
    }
  };

  const updateEditIngredient = (index, key, value) => {
    setEditIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [key]: value } : ing)));
  };

  const addEditIngredient = () => setEditIngredients((prev) => [...prev, { ...emptyIngredient }]);

  const removeEditIngredient = (index) => {
    setEditIngredients((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const loadMealPlans = async () => {
    if (!isAuthed) return;
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
      const res = await api.mealPlans.list({ startDate, endDate });
      const items = Array.isArray(res?.data) ? res.data : res?.data?.mealPlans || [];
      setMealPlans(items);
    } catch (err) {
      setMealPlanMessage(err.message || 'Could not load meal plans');
    }
  };

  useEffect(() => {
    if (isAuthed) loadMealPlans();
  }, [currentMonth, isAuthed]);

  const handleCreateMealPlan = async (e) => {
    e.preventDefault();
    setMealPlanMessage('');
    setMealPlanStatus('loading');
    try {
      await api.mealPlans.create({
        date: new Date(mealPlanForm.date).toISOString(),
        recipeId: mealPlanForm.recipeId ? parseInt(mealPlanForm.recipeId) : null,
        notes: mealPlanForm.notes,
      });
      setMealPlanForm({ date: new Date().toISOString().split('T')[0], recipeId: '', notes: '' });
      setShowMealPlanForm(false);
      setMealPlanStatus('success');
      setMealPlanMessage('Meal plan created');
      await loadMealPlans();
    } catch (err) {
      setMealPlanStatus('error');
      setMealPlanMessage(err.message || 'Could not create meal plan');
    }
  };

  const handleDeleteMealPlan = async (id) => {
    if (!window.confirm('Delete this meal plan entry?')) return;
    try {
      await api.mealPlans.delete(id);
      await loadMealPlans();
    } catch (err) {
      setMealPlanMessage(err.message || 'Could not delete meal plan');
    }
  };

  const getMealPlanForDate = (date) => {
    return mealPlans.find(mp => {
      const mpDate = new Date(mp.date).toDateString();
      const checkDate = new Date(date).toDateString();
      return mpDate === checkDate;
    });
  };

  const loadShoppingList = async () => {
    if (!isAuthed) return;
    try {
      const res = await api.mealPlans.shoppingList({
        startDate: new Date(shoppingListStartDate).toISOString(),
        endDate: new Date(shoppingListEndDate).toISOString(),
      });
      const items = Array.isArray(res?.data) ? res.data : res?.data?.shoppingList || [];
      setShoppingList(items);
    } catch (err) {
      setMealPlanMessage(err.message || 'Could not load shopping list');
    }
  };

  const downloadShoppingList = (format = 'csv') => {
    if (format === 'csv') {
      const headers = ['Item', 'Quantity', 'Unit'];
      const rows = shoppingList.map(item => [item.name, item.quantity, item.unit]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(shoppingList, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  const loadCollections = async () => {
    if (!isAuthed) return;
    try {
      const res = await api.collections.list();
      const items = Array.isArray(res?.data) ? res.data : res?.data?.collections || [];
      setCollections(items);
    } catch (err) {
      setCollectionMessage(err.message || 'Could not load collections');
    }
  };

  useEffect(() => {
    if (isAuthed) loadCollections();
  }, [isAuthed]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setCollectionMessage('');
    setCollectionStatus('loading');
    try {
      await api.collections.create({ name: newCollectionName });
      setNewCollectionName('');
      setShowNewCollectionForm(false);
      setCollectionStatus('success');
      setCollectionMessage('Collection created');
      await loadCollections();
    } catch (err) {
      setCollectionStatus('error');
      setCollectionMessage(err.message || 'Could not create collection');
    }
  };

  const handleAddRecipeToCollection = async (e) => {
    e.preventDefault();
    if (!selectedCollection) {
      setCollectionStatus('error');
      setCollectionMessage('Select a collection first');
      return;
    }
    const recipeIdNum = parseInt(selectedRecipeForCollection, 10);
    if (!recipeIdNum) {
      setCollectionStatus('error');
      setCollectionMessage('Select a recipe to add');
      return;
    }
    setCollectionMessage('');
    setCollectionStatus('loading');
    try {
      await api.collections.addRecipe(selectedCollection.id, { recipeId: recipeIdNum });
      setSelectedRecipeForCollection('');
      setShowAddRecipeToCollectionForm(false);
      setCollectionStatus('success');
      setCollectionMessage('Recipe added to collection');
      await loadCollections();
    } catch (err) {
      setCollectionStatus('error');
      setCollectionMessage(err.message || 'Could not add recipe to collection');
    }
  };

  const handleRemoveRecipeFromCollection = async (collectionId, recipeId) => {
    if (!window.confirm('Remove recipe from collection?')) return;
    try {
      await api.collections.removeRecipe(collectionId, recipeId);
      await loadCollections();
    } catch (err) {
      setCollectionMessage(err.message || 'Could not remove recipe');
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await api.collections.delete(id);
      if (selectedCollection?.id === id) setSelectedCollection(null);
      await loadCollections();
    } catch (err) {
      setCollectionMessage(err.message || 'Could not delete collection');
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, wIdx) => (
      <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
        {week.map((date, dIdx) =>
          date ? (
            <div
              key={dIdx}
              style={{
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: '0.5rem',
                background: '#fafafa',
                minHeight: '80px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
              onClick={() => {
                setMealPlanForm({ ...mealPlanForm, date: date.toISOString().split('T')[0] });
                setShowMealPlanForm(true);
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{date.getDate()}</div>
              {getMealPlanForDate(date) && (
                <div style={{ fontSize: '0.8rem', color: '#0a0', background: '#f0fff0', padding: '0.2rem 0.35rem', borderRadius: 2, marginBottom: '0.25rem' }}>
                  {getMealPlanForDate(date).recipe?.title || 'No recipe'}
                </div>
              )}
            </div>
          ) : (
            <div key={dIdx} style={{ background: '#fff' }} />
          )
        )}
      </div>
    ));
  };

  const Dashboard = useMemo(() => (
    <main style={{ fontFamily: 'Segoe UI, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto', lineHeight: 1.5 }}>
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
              <div style={{ border: '1px dashed #cdd4e0', borderRadius: 8, padding: '1rem', background: '#f8fbff', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div>
                    <div className="chip" style={{ marginBottom: '0.35rem' }}>New</div>
                    <h3 style={{ margin: '0 0 0.25rem' }}>Import from URL</h3>
                    <p style={{ margin: 0, color: '#4a5568' }}>Paste a recipe link; we will extract title, ingredients, and steps.</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#5c6475' }}>Beta</span>
                </div>

                <form onSubmit={handleImportFromUrl} style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    placeholder="https://example.com/recipe"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    required
                  />
                  <input
                    placeholder="Optional title override"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Optional description"
                    value={importDescription}
                    onChange={(e) => setImportDescription(e.target.value)}
                    rows={2}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button type="submit" disabled={importStatus === 'loading'}>
                      {importStatus === 'loading' ? 'Importing...' : 'Import recipe'}
                    </button>
                    {importMessage && (
                      <span style={{ color: importStatus === 'error' ? '#b00' : '#0a0' }}>{importMessage}</span>
                    )}
                  </div>
                </form>

                {importPreview && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{importPreview.title}</div>
                        {importPreview.sourceUrl && (
                          <a href={importPreview.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>
                            View source
                          </a>
                        )}
                        {importPreview.description && (
                          <p style={{ margin: '0.35rem 0 0', color: '#4a5568' }}>{importPreview.description}</p>
                        )}
                      </div>
                      <span className="chip">Imported</span>
                    </div>

                    {importPreview.ingredients?.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Ingredients</strong>
                        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                          {importPreview.ingredients.map((ing, idx) => (
                            <li key={idx}>{ing.name || ing} {ing.quantity ? `— ${ing.quantity} ${ing.unit || ''}` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importPreview.instructions?.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Instructions</strong>
                        <ol style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                          {importPreview.instructions.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fbff' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Search recipes</label>
                  <input
                    type="text"
                    placeholder="Search by title or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Meal Type</span>
                    <select value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value)} style={{ padding: '0.5rem' }}>
                      <option value="">All</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="dessert">Dessert</option>
                    </select>
                  </label>
                  
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dietary</span>
                    <select value={selectedDietary} onChange={(e) => setSelectedDietary(e.target.value)} style={{ padding: '0.5rem' }}>
                      <option value="">All</option>
                      <option value="vegan">Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="gluten-free">Gluten-Free</option>
                      <option value="dairy-free">Dairy-Free</option>
                      <option value="keto">Keto</option>
                    </select>
                  </label>
                  
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cuisine</span>
                    <select value={selectedCuisine} onChange={(e) => setSelectedCuisine(e.target.value)} style={{ padding: '0.5rem' }}>
                      <option value="">All</option>
                      <option value="italian">Italian</option>
                      <option value="asian">Asian</option>
                      <option value="mexican">Mexican</option>
                      <option value="indian">Indian</option>
                      <option value="thai">Thai</option>
                      <option value="mediterranean">Mediterranean</option>
                    </select>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {getFilteredRecipes().length === 0 && <p>No recipes match your filters.</p>}
                {getFilteredRecipes().map((r) => (
                  <article key={r.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '0.75rem', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
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
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => openEditModal(r)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>Edit</button>
                        <button type="button" onClick={async () => {
                          try {
                            const res = await api.imports.autoTag(r.id);
                            const updated = res?.data?.data || res?.data || res;
                            if (updated) {
                              setRecipes(recipes.map(rec => rec.id === r.id ? updated : rec));
                            }
                          } catch (err) {
                            console.error('Auto-tag failed:', err);
                          }
                        }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', background: '#0066cc', color: '#fff' }}>Auto-tag</button>
                        <button type="button" onClick={() => handleDeleteRecipe(r.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', background: '#b00', color: '#fff' }}>Delete</button>
                      </div>@@
            </>
          )}
        </div>
      </section>

      {isAuthed && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Meal Planning</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>

              {renderCalendar()}
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
              <h3 style={{ marginTop: 0 }}>
                {showMealPlanForm ? 'Add/Edit Meal Plan' : 'Selected Date Details'}
              </h3>

              {!showMealPlanForm ? (
                <>
                  <p>Click a date on the calendar to add a meal plan.</p>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {mealPlans
                      .filter(mp => {
                        const mpDate = new Date(mp.date);
                        const now = new Date();
                        return mpDate.getMonth() === now.getMonth() && mpDate.getFullYear() === now.getFullYear();
                      })
                      .map(mp => (
                        <div key={mp.id} style={{ border: '1px solid #eee', borderRadius: 4, padding: '0.75rem', background: '#fff' }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {new Date(mp.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          {mp.recipe && (
                            <div style={{ color: '#0a0', marginBottom: '0.25rem' }}>
                              <strong>{mp.recipe.title}</strong>
                            </div>
                          )}
                          {mp.notes && <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{mp.notes}</div>}
                          <button type="button" onClick={() => handleDeleteMealPlan(mp.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', background: '#b00', color: '#fff' }}>Remove</button>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleCreateMealPlan} style={{ display: 'grid', gap: '0.75rem' }}>
                  <label>
                    Date
                    <input
                      type="date"
                      value={mealPlanForm.date}
                      onChange={(e) => setMealPlanForm({ ...mealPlanForm, date: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Recipe (optional)
                    <select
                      value={mealPlanForm.recipeId}
                      onChange={(e) => setMealPlanForm({ ...mealPlanForm, recipeId: e.target.value })}
                    >
                      <option value="">-- No recipe --</option>
                      {recipes.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Notes
                    <textarea
                      value={mealPlanForm.notes}
                      onChange={(e) => setMealPlanForm({ ...mealPlanForm, notes: e.target.value })}
                      rows={2}
                      placeholder="Add notes for this meal..."
                    />
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" disabled={mealPlanStatus === 'loading'}>
                      {mealPlanStatus === 'loading' ? 'Saving...' : 'Save meal plan'}
                    </button>
                    <button type="button" onClick={() => setShowMealPlanForm(false)}>Cancel</button>
                  </div>
                  {mealPlanMessage && (
                    <div style={{ color: mealPlanStatus === 'error' ? '#b00' : '#0a0' }}>{mealPlanMessage}</div>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {isAuthed && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Shopping List</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', marginBottom: '1rem' }}>
              <label>
                From
                <input
                  type="date"
                  value={shoppingListStartDate}
                  onChange={(e) => setShoppingListStartDate(e.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={shoppingListEndDate}
                  onChange={(e) => setShoppingListEndDate(e.target.value)}
                />
              </label>
              <button type="button" onClick={loadShoppingList} style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem' }}>Generate</button>
            </div>

            {shoppingList.length === 0 ? (
              <p>No shopping list generated. Select a date range and click Generate.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '0.5rem', width: '80px' }}>Quantity</th>
                        <th style={{ textAlign: 'center', padding: '0.5rem', width: '80px' }}>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shoppingList.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.5rem' }}>{item.name}</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'center', padding: '0.5rem' }}>{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => downloadShoppingList('csv')} style={{ padding: '0.5rem 1rem' }}>↓ Download CSV</button>
                  <button type="button" onClick={() => downloadShoppingList('json')} style={{ padding: '0.5rem 1rem' }}>↓ Download JSON</button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {isAuthed && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Collections</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>My Collections</h3>
              <button type="button" onClick={() => setShowNewCollectionForm(true)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>+ New Collection</button>

              {showNewCollectionForm && (
                <form onSubmit={handleCreateCollection} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: '#f0f8ff', borderRadius: 4 }}>
                  <input
                    type="text"
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" disabled={collectionStatus === 'loading'}>
                      {collectionStatus === 'loading' ? 'Creating...' : 'Create'}
                    </button>
                    <button type="button" onClick={() => setShowNewCollectionForm(false)}>Cancel</button>
                  </div>
                  {collectionMessage && (
                    <div style={{ color: collectionStatus === 'error' ? '#b00' : '#0a0' }}>{collectionMessage}</div>
                  )}
                </form>
              )}

              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {collections.length === 0 ? (
                  <p>No collections yet.</p>
                ) : (
                  collections.map(col => (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollection(col)}
                      style={{
                        border: selectedCollection?.id === col.id ? '2px solid #0a0' : '1px solid #ddd',
                        borderRadius: 4,
                        padding: '0.75rem',
                        background: selectedCollection?.id === col.id ? '#f0fff0' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{col.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {col.recipes?.length || 0} recipe{col.recipes?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
              <h3 style={{ marginTop: 0 }}>
                {selectedCollection ? selectedCollection.name : 'Select a collection'}
              </h3>

              {selectedCollection && (
                <>
                  <button type="button" onClick={() => setShowAddRecipeToCollectionForm(true)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>+ Add Recipe</button>

                  {showAddRecipeToCollectionForm && (
                    <form onSubmit={handleAddRecipeToCollection} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', background: '#f0f8ff', borderRadius: 4 }}>
                      <label>
                        Select recipe
                        <select
                          value={selectedRecipeForCollection}
                          onChange={(e) => setSelectedRecipeForCollection(e.target.value)}
                          required
                        >
                          <option value="">-- Choose a recipe --</option>
                          {recipes.map(r => (
                            <option key={r.id} value={r.id}>{r.title}</option>
                          ))}
                        </select>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" disabled={collectionStatus === 'loading'}>
                          {collectionStatus === 'loading' ? 'Adding...' : 'Add'}
                        </button>
                        <button type="button" onClick={() => setShowAddRecipeToCollectionForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {selectedCollection.recipes?.length === 0 ? (
                      <p>No recipes in this collection.</p>
                    ) : (
                      selectedCollection.recipes?.map(cr => (
                        <div key={cr.recipe?.id} style={{ border: '1px solid #eee', borderRadius: 4, padding: '0.75rem', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{cr.recipe?.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{cr.recipe?.description}</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveRecipeFromCollection(selectedCollection.id, cr.recipe?.id)} style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', background: '#b00', color: '#fff' }}>Remove</button>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                    <button type="button" onClick={() => handleDeleteCollection(selectedCollection.id)} style={{ padding: '0.5rem 1rem', background: '#b00', color: '#fff' }}>Delete Collection</button>
                  </div>
                </>
              )}

              {!selectedCollection && (
                <p style={{ color: '#999' }}>Select a collection from the list to view and manage its recipes.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {editingRecipe && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>Edit Recipe</h2>
            <form onSubmit={handleUpdateRecipe} style={{ display: 'grid', gap: '0.5rem' }}>
              <label>
                Title
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                />
              </label>

              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Ingredients</span>
                  <button type="button" onClick={addEditIngredient} style={{ padding: '0.25rem 0.5rem' }}>+ Add</button>
                </div>
                {editIngredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 0.8fr auto', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      placeholder="Name"
                      value={ing.name}
                      onChange={(e) => updateEditIngredient(idx, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => updateEditIngredient(idx, 'quantity', e.target.value)}
                      required
                    />
                    <input
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => updateEditIngredient(idx, 'unit', e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => removeEditIngredient(idx)} disabled={editIngredients.length === 1}>x</button>
                  </div>
                ))}
              </div>

              <label>
                Instructions (one step per line)
                <textarea
                  value={editForm.instructions}
                  onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                  rows={3}
                  required
                />
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={editStatus === 'loading'}>
                  {editStatus === 'loading' ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" onClick={closeEditModal} disabled={editStatus === 'loading'}>Cancel</button>
              </div>
              {editMessage && (
                <div style={{ color: editStatus === 'error' ? '#b00' : '#0a0' }}>{editMessage}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  ), [
    isAuthed, authMode, email, username, password, authStatus, handleAuthSubmit, authMessage, user, handleLogout,
    recipeForm, setRecipeForm, ingredients, updateIngredient, addIngredient, removeIngredient,
    handleCreateRecipe, recipeStatus, recipeMessage, recipes, renderDescription, handleDeleteRecipe, openEditModal,
    mealPlans, currentMonth, setCurrentMonth, renderCalendar, getMealPlanForDate, handleDeleteMealPlan,
    showMealPlanForm, setShowMealPlanForm, mealPlanForm, setMealPlanForm, mealPlanStatus, handleCreateMealPlan, mealPlanMessage,
    shoppingListStartDate, setShoppingListStartDate, shoppingListEndDate, setShoppingListEndDate,
    loadShoppingList, shoppingList, downloadShoppingList, collections, showNewCollectionForm,
    setShowNewCollectionForm, newCollectionName, setNewCollectionName, handleCreateCollection,
    collectionStatus, collectionMessage, selectedCollection, setSelectedCollection,
    showAddRecipeToCollectionForm, setShowAddRecipeToCollectionForm, selectedRecipeForCollection,
    setSelectedRecipeForCollection, handleAddRecipeToCollection, handleRemoveRecipeFromCollection, handleDeleteCollection,
    importUrl, importTitle, importDescription, importStatus, importMessage, importPreview,
    setImportUrl, setImportTitle, setImportDescription, handleImportFromUrl
  ]);
  
  const isActive = (path) => isActivePath(location.pathname, path);

  return (
    <div className="page">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="chip">Beta</span>
          <strong>Recipe App</strong>
          <span style={{ color: '#5c6475', fontSize: '0.95rem' }}>API: {health}</span>
        </div>
        <nav>
          <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">Home</Link>
          <Link className={`nav-link ${location.pathname.startsWith('/app') ? 'active' : ''}`} to="/app">App</Link>
          {isAuthed ? (
            <Button
              variant="ghost"
              onClick={() => {
                handleLogout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          ) : (
            <Link className="nav-link" to="/app">Sign in</Link>
          )}
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={Dashboard} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

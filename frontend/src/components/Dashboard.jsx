import { memo } from 'react';

const Dashboard = memo(function Dashboard({
  isAuthed,
  authMode,
  setAuthMode,
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  authStatus,
  handleAuthSubmit,
  authMessage,
  user,
  handleLogout,
  recipeForm,
  setRecipeForm,
  ingredients,
  updateIngredient,
  addIngredient,
  removeIngredient,
  handleCreateRecipe,
  recipeStatus,
  recipeMessage,
  recipes,
  renderDescription,
  handleDeleteRecipe,
  handleEditRecipe,
  mealPlans,
  currentMonth,
  goToPreviousMonth,
  goToNextMonth,
  renderCalendar,
  showMealPlanForm,
  setShowMealPlanForm,
  mealPlanForm,
  setMealPlanForm,
  mealPlanStatus,
  handleCreateMealPlan,
  mealPlanMessage,
  shoppingListStartDate,
  setShoppingListStartDate,
  shoppingListEndDate,
  setShoppingListEndDate,
  handleGenerateShoppingList,
  shoppingList,
  handleExportShoppingList,
  collections,
  showNewCollectionForm,
  setShowNewCollectionForm,
  newCollectionName,
  setNewCollectionName,
  handleCreateCollection,
  collectionStatus,
  collectionMessage,
  selectedCollection,
  setSelectedCollection,
  showAddRecipeToCollectionForm,
  setShowAddRecipeToCollectionForm,
  selectedRecipeForCollection,
  setSelectedRecipeForCollection,
  handleAddRecipeToCollection,
  handleRemoveRecipeFromCollection,
  handleDeleteCollection,
}) {
  return (
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
                            <strong style={{ fontSize: '0.95rem' }}>Ingredients:</strong>
                            <ul style={{ margin: '0.25rem 0 0 1.2rem', paddingLeft: 0 }}>
                              {r.ingredients.map((ing, i) => (
                                <li key={i} style={{ fontSize: '0.95rem' }}>
                                  {ing.name} – {ing.quantity} {ing.unit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {r.instructions?.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '0.95rem' }}>Instructions:</strong>
                            <ol style={{ margin: '0.25rem 0 0 1.2rem', paddingLeft: 0 }}>
                              {r.instructions.map((step, i) => (
                                <li key={i} style={{ fontSize: '0.95rem' }}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.75rem' }}>
                        <button type="button" onClick={() => handleEditRecipe(r)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteRecipe(r.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: '#c00', color: '#fff' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {isAuthed && (
        <>
          <section style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
            <h2 style={{ marginTop: 0 }}>Meal Planning</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button type="button" onClick={goToPreviousMonth}>← Prev</button>
              <span style={{ fontWeight: 600 }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={goToNextMonth}>Next →</button>
            </div>
            {renderCalendar()}

            {showMealPlanForm && (
              <form onSubmit={handleCreateMealPlan} style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: 6, border: '1px solid #ddd' }}>
                <h3 style={{ margin: 0 }}>Add Meal Plan</h3>
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
                  Recipe
                  <select
                    value={mealPlanForm.recipeId}
                    onChange={(e) => setMealPlanForm({ ...mealPlanForm, recipeId: e.target.value })}
                    required
                  >
                    <option value="">Select a recipe</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes (optional)
                  <textarea
                    value={mealPlanForm.notes}
                    onChange={(e) => setMealPlanForm({ ...mealPlanForm, notes: e.target.value })}
                    rows={2}
                  />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={mealPlanStatus === 'loading'}>
                    {mealPlanStatus === 'loading' ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowMealPlanForm(false)}>Cancel</button>
                </div>
                {mealPlanMessage && <div style={{ color: mealPlanStatus === 'error' ? '#b00' : '#0a0' }}>{mealPlanMessage}</div>}
              </form>
            )}
          </section>

          <section style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
            <h2 style={{ marginTop: 0 }}>Shopping List</h2>
            <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 1fr auto', marginBottom: '1rem' }}>
              <label>
                Start Date
                <input
                  type="date"
                  value={shoppingListStartDate}
                  onChange={(e) => setShoppingListStartDate(e.target.value)}
                />
              </label>
              <label>
                End Date
                <input
                  type="date"
                  value={shoppingListEndDate}
                  onChange={(e) => setShoppingListEndDate(e.target.value)}
                />
              </label>
              <button type="button" onClick={handleGenerateShoppingList} style={{ marginTop: '1.4rem' }}>Generate</button>
            </div>

            {shoppingList.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>Aggregated Ingredients</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => handleExportShoppingList('csv')} style={{ padding: '0.25rem 0.5rem' }}>CSV</button>
                    <button type="button" onClick={() => handleExportShoppingList('json')} style={{ padding: '0.25rem 0.5rem' }}>JSON</button>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {shoppingList.map((item, idx) => (
                    <li key={idx}>{item.name}: {item.totalQuantity} {item.unit}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: 8, padding: '1rem', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Collections</h2>
              <button type="button" onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}>
                {showNewCollectionForm ? 'Cancel' : '+ New'}
              </button>
            </div>

            {showNewCollectionForm && (
              <form onSubmit={handleCreateCollection} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', background: '#fff', borderRadius: 4, border: '1px solid #ddd' }}>
                <label>
                  Collection Name
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={collectionStatus === 'loading'}>
                  {collectionStatus === 'loading' ? 'Creating...' : 'Create'}
                </button>
                {collectionMessage && <div style={{ color: collectionStatus === 'error' ? '#b00' : '#0a0' }}>{collectionMessage}</div>}
              </form>
            )}

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {collections.length === 0 && <p>No collections yet.</p>}
              {collections.map((col) => (
                <div key={col.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: '0.75rem', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{col.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => {
                        setSelectedCollection(col);
                        setShowAddRecipeToCollectionForm(true);
                      }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                        + Add Recipe
                      </button>
                      <button type="button" onClick={() => handleDeleteCollection(col.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: '#c00', color: '#fff' }}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {selectedCollection?.id === col.id && showAddRecipeToCollectionForm && (
                    <form onSubmit={handleAddRecipeToCollection} style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: 4 }}>
                      <label>
                        Select Recipe
                        <select
                          value={selectedRecipeForCollection}
                          onChange={(e) => setSelectedRecipeForCollection(e.target.value)}
                          required
                        >
                          <option value="">Choose...</option>
                          {recipes.map((r) => (
                            <option key={r.id} value={r.id}>{r.title}</option>
                          ))}
                        </select>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" disabled={collectionStatus === 'loading'}>Add</button>
                        <button type="button" onClick={() => {
                          setShowAddRecipeToCollectionForm(false);
                          setSelectedRecipeForCollection('');
                        }}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {col.recipes?.length > 0 ? (
                    <ul style={{ margin: '0.5rem 0 0 1.2rem', paddingLeft: 0 }}>
                      {col.recipes.map((cr) => (
                        <li key={cr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
                          <span>{cr.recipe?.title || 'Untitled'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeFromCollection(col.id, cr.id)}
                            style={{ padding: '0.15rem 0.4rem', fontSize: '0.8rem', background: '#c00', color: '#fff' }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>No recipes in this collection.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
});

export default Dashboard;

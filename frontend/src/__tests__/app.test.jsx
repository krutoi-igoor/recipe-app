import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { vi } from 'vitest';
import { api } from '../api/client.js';

vi.mock('../api/client.js', () => {
  const noop = vi.fn();
  const resolved = vi.fn(() => Promise.resolve({ data: [] }));
  const importResolved = vi.fn(() => Promise.resolve({ data: { title: 'Imported', ingredients: [], instructions: [] } }));
  return {
    api: {
      getTokens: vi.fn(() => ({})),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      get: vi.fn(() => Promise.resolve({ status: 'ok' })),
      me: vi.fn(() => Promise.resolve({ data: { email: 'test@example.com', userId: 1 } })),
      login: vi.fn(() => Promise.resolve({ data: { token: 't', refreshToken: 'r' } })),
      register: vi.fn(() => Promise.resolve({ data: { token: 't', refreshToken: 'r' } })),
      recipes: {
        list: resolved,
        create: resolved,
        update: resolved,
        delete: resolved,
      },
      mealPlans: {
        list: resolved,
        create: resolved,
        delete: resolved,
        shoppingList: resolved,
      },
      collections: {
        list: resolved,
        create: resolved,
        addRecipe: resolved,
        removeRecipe: resolved,
        delete: resolved,
      },
      imports: {
        fromUrl: importResolved,
      },
    },
  };
});

const renderApp = (route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
};

describe('App routing and landing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTokens.mockReturnValue({});
    api.me.mockResolvedValue({ data: { email: 'test@example.com', userId: 1 } });
    api.recipes.list.mockResolvedValue({ data: [] });
    api.imports.fromUrl.mockResolvedValue({ data: { title: 'Imported', ingredients: [{ name: 'Flour', quantity: 2, unit: 'cup' }], instructions: ['Step 1'] } });
  });

  it('shows landing hero on root route', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: /recipe app/i })).toBeInTheDocument();
    expect(screen.getByText(/paste a social/i)).toBeInTheDocument();
  });

  it('renders auth form on /app route', async () => {
    renderApp('/app');
    expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('imports a recipe from URL when authenticated', async () => {
    api.getTokens.mockReturnValue({ accessToken: 'token' });

    renderApp('/app');

    const urlInput = await screen.findByPlaceholderText('https://example.com/recipe');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/cake' } });

    const submitBtn = screen.getByRole('button', { name: /import recipe/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(api.imports.fromUrl).toHaveBeenCalledTimes(1));
    expect(api.imports.fromUrl).toHaveBeenCalledWith({ url: 'https://example.com/cake', title: undefined, description: undefined });

    expect(await screen.findByText(/Imported\. Review below/i)).toBeInTheDocument();
    const importedHeadings = await screen.findAllByText('Imported');
    expect(importedHeadings.length).toBeGreaterThanOrEqual(1);
  });
});

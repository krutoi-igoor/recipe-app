import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { vi } from 'vitest';

vi.mock('../api/client.js', () => {
  const noop = vi.fn();
  const resolved = vi.fn(() => Promise.resolve({ data: [] }));
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
});

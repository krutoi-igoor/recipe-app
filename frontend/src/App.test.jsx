import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock the API
vi.mock('../src/api/client.js', () => ({
  api: {
    get: vi.fn(async (path) => {
      if (path === '/health') return { status: 'healthy' };
      return {};
    }),
    getTokens: vi.fn(() => ({ accessToken: '', refreshToken: '' })),
    clearTokens: vi.fn(),
    me: vi.fn(async () => ({
      data: { id: 1, email: 'test@example.com', username: 'testuser' },
    })),
    register: vi.fn(async (payload) => ({
      data: {
        user: payload,
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      },
    })),
    login: vi.fn(async (payload) => ({
      data: {
        user: { email: payload.email },
        token: 'mock-token',
        refreshToken: 'mock-refresh',
      },
    })),
    recipes: {
      list: vi.fn(async () => ({ data: { recipes: [] } })),
      create: vi.fn(async () => ({ data: { id: 1, title: 'Test Recipe' } })),
    },
    setTokens: vi.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('renders the app and loads health', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Recipe App/i)).toBeInTheDocument();
    });
  });

  it('shows login/register buttons when not authenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });
  });

  it('allows toggling between login and register modes', async () => {
    render(<App />);
    await waitFor(() => {
      const registerBtn = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(registerBtn);
      expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    });
  });

  it('validates password length on register', async () => {
    render(<App />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });

    const emailInput = screen.getByPlaceholderText(/Email/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('renders recipe form when authenticated', async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(getByText(/Recipes/i)).toBeInTheDocument();
    });
  });
});

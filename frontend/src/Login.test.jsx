import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock del contexto de autenticación
vi.mock('./context/context.jsx', () => ({
  useAuth: () => ({
    setRol: vi.fn(),
    setCorreo: vi.fn(),
    setNombre: vi.fn(),
  }),
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Wrapper para el router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Login Component', () => {
  it('renderiza correctamente todos los elementos principales', () => {
    render(
      <RouterWrapper>
        <Login />
      </RouterWrapper>
    );

    expect(screen.getByText('CACVi-UN')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('muestra error cuando se envía el formulario con campos vacíos', async () => {
    render(
      <RouterWrapper>
        <Login />
      </RouterWrapper>
    );

    // Obtener el formulario y enviarlo directamente
    const form = screen.getByRole('button', { name: 'Login' }).closest('form');
    fireEvent.submit(form);

    // Buscar el mensaje de error
    expect(await screen.findByText('Todos los campos son obligatorios')).toBeInTheDocument();
  });

  it('muestra error cuando el email no tiene el dominio @unal.edu.co', async () => {
    const user = userEvent.setup();
    
    render(
      <RouterWrapper>
        <Login />
      </RouterWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Enter email');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@gmail.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(screen.getByText('El correo debe ser @unal.edu.co')).toBeInTheDocument();
  });
});
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Statistics from './Statistics';

// Mock del contexto de autenticación
vi.mock('./context/context.jsx', () => ({
  useAuth: () => ({
    rol: 'admin',
  }),
}));

// Mock del Header component
vi.mock('./Header', () => ({
  default: ({ rol, view }) => (
    <div data-testid="header">
      Header - Role: {rol}, View: {view}
    </div>
  ),
}));

// Mock de window.api
const mockApi = {
  statistics: vi.fn(),
};

// Wrapper para el router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Statistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de window.api
    global.window.api = mockApi;
  });

  it('renderiza correctamente todos los elementos principales cuando no hay datos', async () => {
    // Mock de la API que devuelve datos vacíos
    mockApi.statistics.mockResolvedValue({ data: [] });

    render(
      <RouterWrapper>
        <Statistics />
      </RouterWrapper>
    );

    // Verificar elementos principales
    expect(screen.getByText('STATISTICS')).toBeInTheDocument();
    expect(screen.getByText('IN THIS SPACE YOU CAN SEE THE GENERAL STATISTICS')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    
    // Verificar el mensaje de dedicación
    expect(screen.getByText('This color symbolizes our dedication to eliminating all forms of violence.')).toBeInTheDocument();

    // Esperar a que aparezca el mensaje de "No hay datos disponibles"
    await waitFor(() => {
      expect(screen.getByText('No hay datos disponibles.')).toBeInTheDocument();
    });

    // Verificar que la API fue llamada
    expect(mockApi.statistics).toHaveBeenCalledTimes(1);
  });

  it('renderiza correctamente la tabla con datos de incidentes', async () => {
    // Mock de la API que devuelve datos de incidentes
    const mockIncidentes = [
      {
        nombre: 'Juan Pérez',
        correo: 'juan@example.com',
        edad: 25,
        fecha: '2024-01-15',
        tipo_de_violencia: 'Physical Violence',
        descripcion: 'Descripción del incidente',
        zona: 'Zona Norte'
      },
      {
        nombre: 'María García',
        correo: 'maria@example.com',
        edad: 30,
        fecha: '2024-02-10',
        tipo_de_violencia: 'Psychological Violence',
        descripcion: 'Otra descripción',
        zona: 'Zona Sur'
      }
    ];

    mockApi.statistics.mockResolvedValue({ data: mockIncidentes });

    render(
      <RouterWrapper>
        <Statistics />
      </RouterWrapper>
    );

    // Esperar a que los datos se carguen y aparezcan en la tabla
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Verificar headers de la tabla
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getByText('Edad')).toBeInTheDocument();
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Tipo de violencia')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Zona')).toBeInTheDocument();

    // Verificar datos del primer incidente
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('Physical Violence')).toBeInTheDocument();
    expect(screen.getByText('Descripción del incidente')).toBeInTheDocument();
    expect(screen.getByText('Zona Norte')).toBeInTheDocument();

    // Verificar datos del segundo incidente
    expect(screen.getByText('María García')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('2024-02-10')).toBeInTheDocument();
    expect(screen.getByText('Psychological Violence')).toBeInTheDocument();
    expect(screen.getByText('Otra descripción')).toBeInTheDocument();
    expect(screen.getByText('Zona Sur')).toBeInTheDocument();

    // Verificar que NO aparezca el mensaje de "No hay datos disponibles"
    expect(screen.queryByText('No hay datos disponibles.')).not.toBeInTheDocument();

    // Verificar que la API fue llamada
    expect(mockApi.statistics).toHaveBeenCalledTimes(1);
  });

  it('muestra mensaje de error cuando falla la carga de datos', async () => {
    // Mock de la API que devuelve un error
    mockApi.statistics.mockRejectedValue(new Error('Error de conexión'));

    render(
      <RouterWrapper>
        <Statistics />
      </RouterWrapper>
    );

    // Esperar a que aparezca el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos de estadísticas')).toBeInTheDocument();
    });

    // Verificar que NO aparezca la tabla ni el mensaje de "No hay datos disponibles"
    expect(screen.queryByText('Nombre')).not.toBeInTheDocument();
    expect(screen.queryByText('No hay datos disponibles.')).not.toBeInTheDocument();

    // Verificar que la API fue llamada
    expect(mockApi.statistics).toHaveBeenCalledTimes(1);
  });
});
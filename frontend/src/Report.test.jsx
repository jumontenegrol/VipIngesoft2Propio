import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Report from './Report';

// Mock del contexto de autenticación
vi.mock('./context/context.jsx', () => ({
  useAuth: () => ({
    rol: 'student',
    correo: 'test@unal.edu.co',
    nombre: 'Test User',
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

// Mock de leaflet y react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMapEvents: vi.fn(() => null),
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: vi.fn(() => ({})),
  },
}));

// Mock de turf
vi.mock('@turf/turf', () => ({
  booleanPointInPolygon: vi.fn(() => true),
  point: vi.fn(() => ({})),
}));

// Mock de react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock del archivo map.json
vi.mock('./assets/map.json', () => ({
  default: {
    features: [
      {
        properties: { Id: 1 },
        geometry: { type: 'Polygon', coordinates: [] },
      },
    ],
  },
}));

// Mock del Header component
vi.mock('./Header', () => ({
  default: ({ rol, view }) => (
    <div data-testid="header">
      Header - Role: {rol}, View: {view}
    </div>
  ),
}));

// Wrapper para el router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Report Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente todos los elementos principales', () => {
    render(
      <RouterWrapper>
        <Report />
      </RouterWrapper>
    );

    // Verificar elementos principales
    expect(screen.getByText('Make your Report')).toBeInTheDocument();
    expect(screen.getByText('Please complete the survey')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();

    // Verificar campos del formulario
    expect(screen.getByLabelText('NAME AND LAST NAME')).toBeInTheDocument();
    expect(screen.getByLabelText('EMAIL')).toBeInTheDocument();
    expect(screen.getByLabelText('AGE')).toBeInTheDocument();
    expect(screen.getByLabelText('DATE OF EVENT')).toBeInTheDocument();
    expect(screen.getByLabelText('TYPE OF VIOLENCE YOU HAVE BEEN A VICTIM OF')).toBeInTheDocument();
    expect(screen.getByLabelText('PLEASE DESCRIBE THE EVENT')).toBeInTheDocument();

    // Verificar botón de envío
    expect(screen.getByRole('button', { name: 'SEND THE REPORT' })).toBeInTheDocument();

    // Verificar que los campos de nombre y email estén deshabilitados y con valores del contexto
    expect(screen.getByDisplayValue('Test User')).toBeDisabled();
    expect(screen.getByDisplayValue('test@unal.edu.co')).toBeDisabled();
  });

  it('muestra error cuando se envía el formulario con campos obligatorios vacíos', async () => {
    render(
      <RouterWrapper>
        <Report />
      </RouterWrapper>
    );

    // Obtener el formulario y enviarlo sin llenar los campos requeridos
    const form = screen.getByRole('button', { name: 'SEND THE REPORT' }).closest('form');
    fireEvent.submit(form);

    // Verificar que aparezca el mensaje de error
    expect(await screen.findByText('All fields are required (except description)')).toBeInTheDocument();
  });

  it('muestra error cuando se selecciona una fecha futura', async () => {
    const user = userEvent.setup();

    render(
      <RouterWrapper>
        <Report />
      </RouterWrapper>
    );

    // Llenar campos requeridos
    const ageInput = screen.getByLabelText('AGE');
    const dateInput = screen.getByLabelText('DATE OF EVENT');
    const typeSelect = screen.getByLabelText('TYPE OF VIOLENCE YOU HAVE BEEN A VICTIM OF');

    await user.type(ageInput, '25');
    
    // Establecer una fecha futura
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];
    
    await user.type(dateInput, futureDate);
    await user.selectOptions(typeSelect, 'Physical Violence');

    // Enviar el formulario
    const form = screen.getByRole('button', { name: 'SEND THE REPORT' }).closest('form');
    fireEvent.submit(form);

    // Verificar que aparezca el mensaje de error para fecha futura
    expect(await screen.findByText('The date cannot be in the future')).toBeInTheDocument();
  });

  it('muestra error cuando se selecciona una fecha anterior al mínimo permitido', async () => {
    const user = userEvent.setup();

    render(
      <RouterWrapper>
        <Report />
      </RouterWrapper>
    );

    // Llenar campos requeridos
    const ageInput = screen.getByLabelText('AGE');
    const dateInput = screen.getByLabelText('DATE OF EVENT');
    const typeSelect = screen.getByLabelText('TYPE OF VIOLENCE YOU HAVE BEEN A VICTIM OF');

    await user.type(ageInput, '25');
    await user.type(dateInput, '2022-12-31'); // Fecha anterior al mínimo (2023-01-01)
    await user.selectOptions(typeSelect, 'Physical Violence');

    // Enviar el formulario
    const form = screen.getByRole('button', { name: 'SEND THE REPORT' }).closest('form');
    fireEvent.submit(form);

    // Verificar que aparezca el mensaje de error para fecha muy antigua
    expect(await screen.findByText('The date cannot be before January 1st, 2023')).toBeInTheDocument();
  });
});
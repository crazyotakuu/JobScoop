import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './contexts/AuthContext';
import Profile from './Profile';


jest.mock('axios');

jest.mock('./Profile.css', () => ({}));


const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Helper function to render the component with necessary providers
const renderProfileComponent = (authContextValue = {
  user: { username: 'test@example.com', name: 'Test User' },
  token: 'fake-token',
  isAuthenticated: true,
  logout: jest.fn()
}) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue}>
        <Profile />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockedNavigate.mockClear();

    // Setup default localStorage mock for user data
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ username: 'test@example.com', name: 'Test User' });
      }
      if (key === 'token') {
        return 'fake-token';
      }
      return null;
    });

    // Mock successful API responses
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        name: 'Test User',
        created_at: '2024-01-01',
        subscriptions: []
      }
    });
  });

  test('renders profile form correctly', () => {
    renderProfileComponent();
    
    expect(screen.getByText('USER PROFILE')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions:')).toBeInTheDocument();
  });

  test('loads user data on mount', async () => {
    const mockUser = {
      username: 'test@example.com',
      name: 'Test User'
    };

    axios.post.mockImplementation((url) => {
      if (url === 'http://localhost:8080/get-user') {
        return Promise.resolve({
          status: 200,
          data: {
            name: mockUser.name,
            created_at: '2024-01-01'
          }
        });
      }
      if (url === 'http://localhost:8080/fetch-user-subscriptions') {
        return Promise.resolve({
          status: 200,
          data: {
            subscriptions: []
          }
        });
      }
    });

    renderProfileComponent();

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });
  });

  test('can edit name', async () => {
    renderProfileComponent();
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByTestId('EditIcon').closest('button');
    await userEvent.click(editButton);

    // Dialog should appear
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Type new name
    const nameInput = screen.getByRole('textbox');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    // Mock successful update
    axios.put.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Name Change Succesfull' }
    });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Name Change Succesfull')).toBeInTheDocument();
    });
  });

  // test('validates password requirements', async () => {
  //   renderProfileComponent();

  //   // Wait for initial data load
  //   await waitFor(() => {
  //     expect(screen.getByText('Test User')).toBeInTheDocument();
  //   });

  //   // Click change password button
  //   const changePasswordButton = screen.getByText('Change Password');
  //   await userEvent.click(changePasswordButton);

  //   // Dialog should appear with password fields
  //   const dialog = screen.getByRole('dialog');
  //   expect(dialog).toBeInTheDocument();

  //   const newPasswordInput = screen.getByTestId('new password');
  //   const confirmPasswordInput = screen.getByTestId('confirm password');

  //   // Test invalid password (no uppercase)
  //   await userEvent.type(newPasswordInput, 'password123!');
  //   await userEvent.type(confirmPasswordInput, 'password123!');
  //   expect(screen.getByText('Password requirment failed')).toBeInTheDocument();

  //   // Clear inputs
  //   await userEvent.clear(newPasswordInput);
  //   await userEvent.clear(confirmPasswordInput);

  //   // Test invalid password (no lowercase)
  //   await userEvent.type(newPasswordInput, 'PASSWORD123!');
  //   await userEvent.type(confirmPasswordInput, 'PASSWORD123!');
  //   expect(screen.getByText('Password requirment failed')).toBeInTheDocument();

  //   // Clear inputs
  //   await userEvent.clear(newPasswordInput);
  //   await userEvent.clear(confirmPasswordInput);

  //   // Test invalid password (no number)
  //   await userEvent.type(newPasswordInput, 'Password!');
  //   await userEvent.type(confirmPasswordInput, 'Password!');
  //   expect(screen.getByText('Password requirment failed')).toBeInTheDocument();

  //   // Clear inputs
  //   await userEvent.clear(newPasswordInput);
  //   await userEvent.clear(confirmPasswordInput);

  //   // Test invalid password (no special character)
  //   await userEvent.type(newPasswordInput, 'Password123');
  //   await userEvent.type(confirmPasswordInput, 'Password123');
  //   expect(screen.getByText('Password requirment failed')).toBeInTheDocument();

  //   // Clear inputs
  //   await userEvent.clear(newPasswordInput);
  //   await userEvent.clear(confirmPasswordInput);

  //   // Test valid password
  //   await userEvent.type(newPasswordInput, 'Password123!');
  //   await userEvent.type(confirmPasswordInput, 'Password123!');
    
  //   // Verify error message is gone
  //   expect(screen.queryByText('Password requirment failed')).not.toBeInTheDocument();

  //   // Mock successful update
  //   axios.put.mockResolvedValueOnce({
  //     status: 200,
  //     data: { message: 'Password Change Succesful' }
  //   });

  //   // Click save and verify it's enabled
  //   const saveButton = screen.getByText('Save');
  //   expect(saveButton).not.toBeDisabled();
  //   await userEvent.click(saveButton);

  //   // Verify success message
  //   await waitFor(() => {
  //     expect(screen.getByText('Password Change Succesful')).toBeInTheDocument();
  //   });
  // });

  // test('shows error for password mismatch', async () => {
  //   renderProfileComponent();

  //   // Wait for initial data load
  //   await waitFor(() => {
  //     expect(screen.getByText('Test User')).toBeInTheDocument();
  //   });

  //   // Click change password button
  //   const changePasswordButton = screen.getByText('Change Password');
  //   await userEvent.click(changePasswordButton);

  //   // Fill in different passwords
  //   const newPasswordInput = screen.getByTestId('new password');
  //   const confirmPasswordInput = screen.getByTestId('confirm password');
    
  //   await userEvent.type(newPasswordInput, 'NewPass123!');
  //   await userEvent.type(confirmPasswordInput, 'DifferentPass123!');

  //   // Check error message
  //   expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  // });
}); 
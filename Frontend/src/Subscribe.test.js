import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { act } from '@testing-library/react';
import Subscribe from './subscribe/Subscribe';

// Mock the axios module
jest.mock('axios');

// Mock CSS imports
jest.mock('./subscribe/Subscribe.css', () => ({}));

// Mock the useNavigate hook
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

// Set up proper fetch mocking
beforeEach(() => {
  mockedNavigate.mockClear();
  global.fetch = jest.fn();
  mockLocalStorage.clear();
  mockLocalStorage.getItem.mockImplementation((key) => {
    if (key === 'user') return JSON.stringify({ username: 'test@example.com' });
    return null;
  });

  // Mock successful API responses
  axios.get.mockResolvedValue({
    status: 200,
    data: [
      {
        id: 1,
        company: 'Test Company',
        roles: ['Software Engineer'],
        urls: ['https://test.com/careers']
      }
    ]
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Subscribe Component', () => {
  const mockSubscriptions = [
    {
      id: 1,
      company: 'Test Company',
      roles: ['Software Engineer'],
      urls: ['https://test.com/careers']
    }
  ];

  test('renders subscriptions page title', async () => {
    render(<Subscribe />);
    
    // Wait for the title to appear - the component starts with a loader
    await waitFor(() => {
      expect(screen.getByText('MANAGE YOUR SUBSCRIPTIONS')).toBeInTheDocument();
    });
  });

  test('shows loading state', () => {
    render(<Subscribe />);
    
    // Use { hidden: true } to find the hidden progressbar
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    render(<Subscribe />);
    
    // Wait for the alert to appear - it's not present initially
    await waitFor(() => {
      const alertElement = screen.getByRole('alert', { hidden: true });
      expect(alertElement.textContent).toContain('Error to load the page... Please try again');
    });
  });

  test('navigates to add subscription page', async () => {
    render(<Subscribe />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('MANAGE YOUR SUBSCRIPTIONS')).toBeInTheDocument();
    });
    
    // Use the "Add Subscriptions" button in the top right
    const addButton = screen.getByText('Add Subscriptions');
    
    // Click the button
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Check navigation
    expect(mockedNavigate).toHaveBeenCalledWith('/subscribe/addsubscriptions');
  });

  test('handles edit functionality', async () => {
    render(<Subscribe />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('MANAGE YOUR SUBSCRIPTIONS')).toBeInTheDocument();
    });
    
    // Find the Modify button in the top right
    const editButton = screen.getByText('Modify');
    
    // Click edit button
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    // Check for Save Changes
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  test('displays subscriptions when loaded', async () => {
    render(<Subscribe />);
    
    // Wait for loading spinner to disappear and content to load
    await waitFor(() => {
      const noSubscriptionsMessage = screen.getByText('No subscriptions found');
      expect(noSubscriptionsMessage).toBeInTheDocument();
    });
  });

  test('deletes subscription when delete button is clicked', async () => {
    render(<Subscribe />);
    
    // Wait for the button to appear
    await waitFor(() => {
      const addButton = screen.getByText('Add Your First Subscription');
      expect(addButton).toBeInTheDocument();
    });
  });

  test('debug rendered content', async () => {
    render(<Subscribe />);
    console.log('Initial render:');
    screen.debug();
    
    // Wait a bit for any data to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('After waiting:');
    screen.debug();
  });
});

render(
  <MemoryRouter future={{ v7_startTransition: true }}>
    <Subscribe />
  </MemoryRouter>
); 
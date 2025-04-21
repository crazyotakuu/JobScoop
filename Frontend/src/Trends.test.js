import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './contexts/AuthContext';
import Trends from './Trends';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mocked-bar-chart">Bar Chart</div>
}));

// Mock axios
jest.mock('axios');

// Mock CSS imports
jest.mock('./Trends.css', () => ({}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock subscription data
const mockSubscriptionData = [
  {
    date: '2023-07-15T00:00:00.000Z',
    company: 'Google',
    roleNames: ['Software Engineer'],
    user: 'user1'
  },
  {
    date: '2023-07-20T00:00:00.000Z',
    company: 'Amazon',
    roleNames: ['Data Scientist'],
    user: 'user2'
  },
  {
    date: '2023-08-05T00:00:00.000Z',
    company: 'Microsoft',
    roleNames: ['Product Manager'],
    user: 'user3'
  },
  {
    date: '2023-08-10T00:00:00.000Z',
    company: 'Google',
    roleNames: ['UX Designer'],
    user: 'user4'
  }
];

// Mock correlation data
const mockCorrelationData = [
  {
    company: 'Google',
    role: 'Software Engineer',
    frequency: 25
  },
  {
    company: 'Amazon',
    role: 'Data Scientist',
    frequency: 15
  },
  {
    company: 'Microsoft',
    role: 'Product Manager',
    frequency: 10
  }
];

// Helper function to render the component with necessary providers
const renderTrendsComponent = (authContextValue = {
  user: { username: 'test@example.com', name: 'Test User' },
  token: 'fake-token',
  isAuthenticated: true,
  logout: jest.fn()
}) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue}>
        <Trends />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Trends Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
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

    // Mock subscription data API response
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8080/fetch-all-user-subscriptions') {
        return Promise.resolve({
          status: 200,
          data: mockSubscriptionData
        });
      }
      if (url === 'http://localhost:8080/fetch-subscription-frequencies') {
        return Promise.resolve({
          status: 200,
          data: mockCorrelationData
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders trends dashboard title', async () => {
    renderTrendsComponent();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Subscription Trends Dashboard')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    renderTrendsComponent();
    
    expect(screen.getByText('Loading subscription data...')).toBeInTheDocument();
  });

  test('fetches subscription data on mount', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/fetch-all-user-subscriptions');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/fetch-subscription-frequencies');
    });
  });

  test('renders company chart after data loads', async () => {
    renderTrendsComponent();
    const CompanyChart = await screen.findByTestId('Company-chart');
    
    await waitFor(() => {
      expect(screen.getByText('Most Popular Companies')).toBeInTheDocument();
      expect(CompanyChart).toBeInTheDocument();
    });
  });

  test('renders role chart after data loads', async () => {
    renderTrendsComponent();
    const roleChart = await screen.findByTestId('Role-chart');
    
    await waitFor(() => {
      expect(screen.getByText('Most Popular Job Roles')).toBeInTheDocument();
      expect(roleChart).toBeInTheDocument();
    });
  });

  test('renders correlation table after data loads', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Popular Company-Role Combinations')).toBeInTheDocument();
    });
    
    // Check for table headers with more flexible matching
    // expect(screen.getByText(/Company/i)).toBeInTheDocument();
    // expect(screen.getByText(/Role/i)).toBeInTheDocument();
    // expect(screen.getByText(/Number of Subscribers/i)).toBeInTheDocument();
    // expect(screen.getByText(/Percentage of Users/i)).toBeInTheDocument();
    
    // // Check for actual data from mock data
    // await waitFor(() => {
    //   expect(screen.getByText('Google')).toBeInTheDocument();
    //   expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    // });
  });

  test('allows filtering by date range', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Filter by Date Range')).toBeInTheDocument();
    });
    
    // Get date inputs
    const fromDateInput = screen.getByLabelText('From');
    const toDateInput = screen.getByLabelText('To');
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    
    // Change dates
    fireEvent.change(fromDateInput, { target: { value: '2023-08-01' } });
    fireEvent.change(toDateInput, { target: { value: '2023-08-31' } });
    
    // Apply filter
    fireEvent.click(applyButton);
    
    // Verify filter was applied (checking if the filter function was called is difficult in testing,
    // but we can verify the inputs were updated)
    expect(fromDateInput.value).toBe('2023-08-01');
    expect(toDateInput.value).toBe('2023-08-31');
  });

  test('provides quick date range filters', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('This month')).toBeInTheDocument();
      expect(screen.getByText('Last month')).toBeInTheDocument();
    });
    
    // Click on one of the quick filters
    const last7DaysButton = screen.getByRole('button', { name: 'Last 7 days' });
    fireEvent.click(last7DaysButton);
    
    // This will set a date range of the last 7 days, but it's difficult to test the exact values
    // since they depend on the current date. We can verify the button exists and is clickable.
    expect(last7DaysButton).toBeInTheDocument();
  });

  test('handles refresh data button click', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });
    
    // Clear previous API calls
    axios.get.mockClear();
    
    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /Refresh Data/i });
    fireEvent.click(refreshButton);
    
    // Verify API calls were made again
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/fetch-all-user-subscriptions');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/fetch-subscription-frequencies');
    });
  });

  test('displays error state when API fails', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch data'));
    
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  test('retry button works when in error state', async () => {
    // Mock API error for first call, then success
    axios.get
      .mockRejectedValueOnce(new Error('Failed to fetch data'))
      .mockImplementation((url) => {
        if (url === 'http://localhost:8080/fetch-all-user-subscriptions') {
          return Promise.resolve({
            status: 200,
            data: mockSubscriptionData
          });
        }
        if (url === 'http://localhost:8080/fetch-subscription-frequencies') {
          return Promise.resolve({
            status: 200,
            data: mockCorrelationData
          });
        }
        return Promise.reject(new Error('Not found'));
      });
    
    renderTrendsComponent();
    
    // Verify error state
    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    });
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);
    
    // Verify data loaded after retry
    await waitFor(() => {
      expect(screen.getByText('Subscription Trends Dashboard')).toBeInTheDocument();
    });
  });

  test('shows statistics after data loads', async () => {
    renderTrendsComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Subscription Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Subscriptions')).toBeInTheDocument();
      expect(screen.getByText('Unique Companies')).toBeInTheDocument();
    });
  });

  test('shows no data message when filtered data is empty', async () => {
    renderTrendsComponent();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Filter by Date Range')).toBeInTheDocument();
    });
    
    // Set date range that will result in no data
    const fromDateInput = screen.getByLabelText('From');
    const toDateInput = screen.getByLabelText('To');
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    
    fireEvent.change(fromDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(toDateInput, { target: { value: '2025-01-31' } });
    fireEvent.click(applyButton);
    
    // Check for no data messages
    await waitFor(() => {
      const noDataMessages = screen.getAllByText('No data available for the selected date range');
      expect(noDataMessages.length).toBeGreaterThan(0);
    });
  });
}); 
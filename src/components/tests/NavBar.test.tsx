import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from '../NavBar';
import { BrowserRouter } from 'react-router-dom';

// Mock functions for Supabase signOut and navigation
const mockSignOut = jest.fn();
const mockNavigate = jest.fn();

// Mock the Supabase client used in NavBar
jest.mock('../../helpers/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: () => mockSignOut(),
    },
  },
}));

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Utility function to render components with routing context
function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('NavBar component', () => {
  // Test that clicking "Logout" triggers signOut and navigation to home
  it('calls signOut and navigates to home on logout click', async () => {
    renderWithRouter(<NavBar />);
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Test that all navigation links are rendered correctly
  it('renders all navigation links', () => {
    renderWithRouter(<NavBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Mystery')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  // Test that the app title and icon are displayed
  it('displays the app title and icon', () => {
    renderWithRouter(<NavBar />);

    expect(screen.getByText('Micro-Mastery')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument(); // Checks the <img> tag exists
  });

  // Test that the links point to the correct hrefs
  it('has correct href attributes for each nav link', () => {
    renderWithRouter(<NavBar />);

    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/nav/home');
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/nav/profile');
    expect(screen.getByText('Categories').closest('a')).toHaveAttribute('href', '/nav/categories');
    expect(screen.getByText('Mystery').closest('a')).toHaveAttribute('href', '/nav/mystery');
    expect(screen.getByText('Friends').closest('a')).toHaveAttribute('href', '/nav/friends');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/nav/settings');
  });

  // Snapshot test to ensure layout doesn’t unexpectedly change
  it('matches snapshot', () => {
    const { container } = renderWithRouter(<NavBar />);
    expect(container).toMatchSnapshot();
  });
});
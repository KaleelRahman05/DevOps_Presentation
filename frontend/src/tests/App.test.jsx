import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { describe, expect, it } from 'vitest';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
});

describe('CineScope catalogue', () => {
  it('shows the movie collection', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /pick your next movie/i })).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });

  it('filters movies by title or genre', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: /search movies/i }), {
      target: { value: 'sci-fi' },
    });

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.queryByText('Parasite')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no matches', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: /search movies/i }), {
      target: { value: 'not a movie' },
    });

    expect(screen.getByText(/no movies match/i)).toBeInTheDocument();
  });

  it('switches themes and remembers the selection', () => {
    const { unmount } = render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    fireEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('cinescope-theme')).toBe('light');

    unmount();
    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });
});

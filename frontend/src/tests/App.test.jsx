import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

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
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import StarRating from '../components/StarRating';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend CineScope UI Components', () => {
  it('Navbar renders CineScope brand and navigation', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Cine/i)).toBeInTheDocument();
    expect(screen.getByText(/Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover/i)).toBeInTheDocument();
  });

  it('StarRating renders correct count of stars', () => {
    render(<StarRating value={7} max={10} readOnly={true} />);

    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('MovieCard renders movie title, release year, and genres', () => {
    const mockMovie = {
      _id: '507f191e810c19729de860ea',
      title: 'Inception',
      releaseYear: 2010,
      genres: ['Sci-Fi', 'Action'],
      averageRating: 8.8,
      reviewCount: 42,
      posterUrl: 'https://example.com/poster.jpg',
    };

    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
  });
});

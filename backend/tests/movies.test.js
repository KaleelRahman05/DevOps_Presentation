import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Movie from '../src/models/Movie.js';
import { setupTestDB, createTestAdmin, createTestUser } from './setup.js';

describe('Movies API Endpoints', () => {
  setupTestDB();

  const sampleMovieData = {
    title: 'Interstellar',
    releaseYear: 2014,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    runtime: 169,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  };

  it('GET /api/movies should return an empty list when no movies exist', async () => {
    const res = await request(app).get('/api/movies');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movies).toEqual([]);
    expect(res.body.totalMovies).toBe(0);
  });

  it('GET /api/movies should return list of movies with pagination', async () => {
    await Movie.create(sampleMovieData);
    await Movie.create({
      title: 'Inception',
      releaseYear: 2010,
      genres: ['Sci-Fi', 'Action'],
      synopsis: 'A thief steals corporate secrets through dream-sharing technology.',
      runtime: 148,
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
    });

    const res = await request(app).get('/api/movies?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.totalMovies).toBe(2);
    expect(res.body.totalPages).toBe(1);
  });

  it('GET /api/movies with search filter should filter by title', async () => {
    await Movie.create(sampleMovieData);
    await Movie.create({
      title: 'The Dark Knight',
      releaseYear: 2008,
      genres: ['Action', 'Crime'],
      synopsis: 'Batman battles the Joker.',
      runtime: 152,
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
    });

    const res = await request(app).get('/api/movies?search=Dark Knight');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.movies[0].title).toBe('The Dark Knight');
  });

  it('GET /api/movies with genre filter should return matching movies', async () => {
    await Movie.create(sampleMovieData);
    await Movie.create({
      title: 'The Godfather',
      releaseYear: 1972,
      genres: ['Crime', 'Drama'],
      synopsis: 'The aging patriarch of an organized crime dynasty transfers control to his son.',
      runtime: 175,
      director: 'Francis Ford Coppola',
      cast: ['Marlon Brando', 'Al Pacino'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
    });

    const res = await request(app).get('/api/movies?genre=Sci-Fi');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.movies[0].title).toBe('Interstellar');
  });

  it('GET /api/movies/:id should return 400 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/movies/invalid-object-id-123');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid.*format/i);
  });

  it('GET /api/movies/:id should return 404 for valid but non-existent ObjectId', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/movies/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('GET /api/movies/:id should return 200 and movie details when found', async () => {
    const movie = await Movie.create(sampleMovieData);
    const res = await request(app).get(`/api/movies/${movie._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movie.title).toBe('Interstellar');
  });

  it('POST /api/movies should return 401 when no token is provided', async () => {
    const res = await request(app).post('/api/movies').send(sampleMovieData);

    expect(res.status).toBe(401);
  });

  it('POST /api/movies should return 403 when regular user attempts to create movie', async () => {
    const { token } = await createTestUser();
    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleMovieData);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/administrator/i);
  });

  it('POST /api/movies should validate missing required fields for admin', async () => {
    const { token } = await createTestAdmin();
    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '', // Missing title
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/movies should succeed for authorized admin with valid data', async () => {
    const { token } = await createTestAdmin();
    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleMovieData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.movie.title).toBe('Interstellar');
  });

  it('PUT /api/movies/:id should allow admin to update movie details', async () => {
    const { token } = await createTestAdmin();
    const movie = await Movie.create(sampleMovieData);

    const res = await request(app)
      .put(`/api/movies/${movie._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Interstellar (Special Edition)',
        runtime: 175,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movie.title).toBe('Interstellar (Special Edition)');
    expect(res.body.movie.runtime).toBe(175);
  });

  it('DELETE /api/movies/:id should allow admin to remove a movie', async () => {
    const { token } = await createTestAdmin();
    const movie = await Movie.create(sampleMovieData);

    const res = await request(app)
      .delete(`/api/movies/${movie._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Movie.findById(movie._id);
    expect(deleted).toBeNull();
  });

  it('GET /api/movies/:id/recommendations should return genre-matched recommendations excluding target', async () => {
    const interstellar = await Movie.create(sampleMovieData);
    const inception = await Movie.create({
      title: 'Inception',
      releaseYear: 2010,
      genres: ['Sci-Fi', 'Action'],
      synopsis: 'Dream within a dream.',
      runtime: 148,
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
      averageRating: 9.0,
    });
    const godfather = await Movie.create({
      title: 'The Godfather',
      releaseYear: 1972,
      genres: ['Crime'],
      synopsis: 'Crime saga.',
      runtime: 175,
      director: 'Francis Ford Coppola',
      cast: ['Marlon Brando'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
      averageRating: 9.5,
    });

    const res = await request(app).get(`/api/movies/${interstellar._id}/recommendations`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recommendations).toBeInstanceOf(Array);
    // Should recommend Inception (shares 'Sci-Fi')
    const recommendedTitles = res.body.recommendations.map((r) => r.title);
    expect(recommendedTitles).toContain('Inception');
    // Must NOT contain Interstellar itself!
    expect(recommendedTitles).not.toContain('Interstellar');
    expect(res.body.recommendations[0]).toHaveProperty('recommendationReason');
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Movie from '../src/models/Movie.js';
import Review from '../src/models/Review.js';
import { setupTestDB, createTestAdmin } from './setup.js';

describe('Reviews API and Rating Calculation', () => {
  setupTestDB();

  let testMovie;

  beforeEach(async () => {
    testMovie = await Movie.create({
      title: 'The Matrix',
      releaseYear: 1999,
      genres: ['Sci-Fi', 'Action'],
      synopsis: 'A computer hacker learns about the true nature of reality.',
      runtime: 136,
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
      posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
    });
  });

  it('GET /api/movies/:id/reviews should return empty array when no reviews exist', async () => {
    const res = await request(app).get(`/api/movies/${testMovie._id}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('POST /api/movies/:id/reviews should reject invalid rating (< 1 or > 10)', async () => {
    const res = await request(app)
      .post(`/api/movies/${testMovie._id}/reviews`)
      .send({
        reviewerName: 'Neo',
        rating: 15, // Invalid rating!
        reviewTitle: 'Mind blowing sci-fi',
        reviewText: 'This movie redefined the cyberpunk genre completely.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/movies/:id/reviews should reject missing required review fields', async () => {
    const res = await request(app)
      .post(`/api/movies/${testMovie._id}/reviews`)
      .send({
        reviewerName: '',
        rating: 8,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/movies/:id/reviews should successfully create review and recalculate average rating accurately', async () => {
    // 1st review: rating 8
    const res1 = await request(app)
      .post(`/api/movies/${testMovie._id}/reviews`)
      .send({
        reviewerName: 'Thomas Anderson',
        rating: 8,
        reviewTitle: 'Great concept and philosophy',
        reviewText: 'The red pill blue pill scene is iconic cinema.',
      });

    expect(res1.status).toBe(201);
    expect(res1.body.movieStats.averageRating).toBe(8.0);
    expect(res1.body.movieStats.reviewCount).toBe(1);

    // Verify in database
    let movieInDb = await Movie.findById(testMovie._id);
    expect(movieInDb.averageRating).toBe(8.0);
    expect(movieInDb.reviewCount).toBe(1);

    // 2nd review: rating 10 -> (8 + 10) / 2 = 9.0
    const res2 = await request(app)
      .post(`/api/movies/${testMovie._id}/reviews`)
      .send({
        reviewerName: 'Morpheus',
        rating: 10,
        reviewTitle: 'He is the One',
        reviewText: 'There is a difference between knowing the path and walking the path.',
      });

    expect(res2.status).toBe(201);
    expect(res2.body.movieStats.averageRating).toBe(9.0);
    expect(res2.body.movieStats.reviewCount).toBe(2);

    movieInDb = await Movie.findById(testMovie._id);
    expect(movieInDb.averageRating).toBe(9.0);
    expect(movieInDb.reviewCount).toBe(2);

    // 3rd review: rating 6 -> (8 + 10 + 6) / 3 = 24 / 3 = 8.0
    const res3 = await request(app)
      .post(`/api/movies/${testMovie._id}/reviews`)
      .send({
        reviewerName: 'Agent Smith',
        rating: 6,
        reviewTitle: 'A flawed human construct',
        reviewText: 'Human beings are a disease, a cancer of this planet.',
      });

    expect(res3.status).toBe(201);
    expect(res3.body.movieStats.averageRating).toBe(8.0);
    expect(res3.body.movieStats.reviewCount).toBe(3);

    movieInDb = await Movie.findById(testMovie._id);
    expect(movieInDb.averageRating).toBe(8.0);
    expect(movieInDb.reviewCount).toBe(3);
  });

  it('DELETE /api/reviews/:id should delete review and recalculate movie average rating', async () => {
    const { token } = await createTestAdmin();

    const review1 = await Review.create({
      movieId: testMovie._id,
      reviewerName: 'Reviewer A',
      rating: 10,
      reviewTitle: 'Awesome',
      reviewText: 'Truly incredible film from start to finish.',
    });

    const review2 = await Review.create({
      movieId: testMovie._id,
      reviewerName: 'Reviewer B',
      rating: 6,
      reviewTitle: 'Decent',
      reviewText: 'Had some good parts but dragged in the middle.',
    });

    await Review.calcAverageRating(testMovie._id);

    let movie = await Movie.findById(testMovie._id);
    expect(movie.averageRating).toBe(8.0);
    expect(movie.reviewCount).toBe(2);

    // Delete review2 (rating 6) -> average should become 10.0
    const res = await request(app)
      .delete(`/api/reviews/${review2._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    movie = await Movie.findById(testMovie._id);
    expect(movie.averageRating).toBe(10.0);
    expect(movie.reviewCount).toBe(1);
  });
});

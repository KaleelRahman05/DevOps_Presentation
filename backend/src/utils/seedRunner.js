import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { sampleMovies } from './seedData.js';

dotenv.config();

export const seedDatabase = async ({ quiet = false } = {}) => {
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  log('=============================================');
  log('   CineScope Database Seeder Starting...   ');
  log('=============================================');

  // 1. Seed or Verify Default Administrator Account
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cinescope.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.ADMIN_NAME || 'CineScope Administrator';

  let adminUser = await User.findOne({ email: adminEmail });
  if (!adminUser) {
    adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save hook
      role: 'admin',
    });
    await adminUser.save();
    log(`[Auth] Created initial Admin account: ${adminEmail}`);
  } else {
    log(`[Auth] Admin account already exists: ${adminEmail}`);
  }

  // 2. Seed Movies and Sample Reviews Idempotently
  let insertedMoviesCount = 0;
  let insertedReviewsCount = 0;

  for (const item of sampleMovies) {
    const { initialReviews, ...movieFields } = item;

    // Check if movie already exists by title and release year
    let existingMovie = await Movie.findOne({
      title: movieFields.title,
      releaseYear: movieFields.releaseYear,
    });

    if (!existingMovie) {
      existingMovie = new Movie(movieFields);
      await existingMovie.save();
      insertedMoviesCount++;
      log(`[Movie] Created: ${existingMovie.title} (${existingMovie.releaseYear})`);
    } else {
      log(`[Movie] Already exists: ${existingMovie.title} (${existingMovie.releaseYear})`);
    }

    // Seed initial reviews if none exist for this movie
    if (initialReviews && initialReviews.length > 0) {
      const existingReviewsCount = await Review.countDocuments({
        movieId: existingMovie._id,
      });

      if (existingReviewsCount === 0) {
        for (const rev of initialReviews) {
          const review = new Review({
            movieId: existingMovie._id,
            reviewerName: rev.reviewerName,
            rating: rev.rating,
            reviewTitle: rev.reviewTitle,
            reviewText: rev.reviewText,
          });
          await review.save();
          insertedReviewsCount++;
        }
        await Review.calcAverageRating(existingMovie._id);
        log(`[Review] Added ${initialReviews.length} reviews for '${existingMovie.title}'`);
      }
    }
  }

  log('---------------------------------------------');
  log(`[Seeder Summary]`);
  log(`  Movies added: ${insertedMoviesCount}`);
  log(`  Reviews added: ${insertedReviewsCount}`);
  log(`  Total movies in DB: ${await Movie.countDocuments()}`);
  log(`  Total reviews in DB: ${await Review.countDocuments()}`);
  log('=============================================');
  log('   CineScope Database Seeding Completed!   ');
  log('=============================================');
};

// If run directly via node CLI
const isDirectRun = process.argv[1] && process.argv[1].endsWith('seedRunner.js');
if (isDirectRun) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('[Seeder Error]', error);
      process.exit(1);
    }
  })();
}

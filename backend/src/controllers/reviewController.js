import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

export const getReviewsForMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID format.',
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    const reviews = await Review.find({ movieId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { id: movieId } = req.params;
    const { reviewerName, rating, reviewTitle, reviewText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID format.',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Cannot review non-existent movie.',
      });
    }

    // Determine reviewer name (from auth token or provided name)
    const authorName = req.user?.name || reviewerName;

    if (!authorName || authorName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer name must be at least 2 characters long.',
      });
    }

    // Check for duplicate submission from same reviewer on this movie within the last 5 minutes
    const recentDuplicate = await Review.findOne({
      movieId,
      reviewerName: authorName.trim(),
      reviewTitle: reviewTitle.trim(),
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'You recently submitted this exact review. Please avoid duplicate submissions.',
      });
    }

    const review = new Review({
      movieId,
      reviewerName: authorName.trim(),
      userId: req.user?._id || null,
      rating: parseInt(rating, 10),
      reviewTitle: reviewTitle.trim(),
      reviewText: reviewText.trim(),
    });

    await review.save();

    // Fetch updated movie stats
    const updatedMovie = await Movie.findById(movieId).select('averageRating reviewCount');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review,
      movieStats: {
        averageRating: updatedMovie.averageRating,
        reviewCount: updatedMovie.reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format.',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const movieId = review.movieId;
    await Review.findByIdAndDelete(id);

    // Recalculate movie rating
    const stats = await Review.calcAverageRating(movieId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      movieStats: stats,
    });
  } catch (error) {
    next(error);
  }
};

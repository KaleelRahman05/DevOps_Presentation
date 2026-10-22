import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    reviewerName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 10',
      },
    },
    reviewTitle: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review text must be at least 10 characters'],
      maxlength: [3000, 'Review text cannot exceed 3000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help prevent exact duplicate reviews from the same reviewer on the same movie
reviewSchema.index({ movieId: 1, reviewerName: 1 });
reviewSchema.index({ movieId: 1, createdAt: -1 });

// Static method to recalculate movie average rating and review count
reviewSchema.statics.calcAverageRating = async function (movieId) {
  const stats = await this.aggregate([
    {
      $match: { movieId: new mongoose.Types.ObjectId(movieId) },
    },
    {
      $group: {
        _id: '$movieId',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Movie = mongoose.model('Movie');

  if (stats.length > 0) {
    const averageRating = Math.round(stats[0].avgRating * 10) / 10;
    const reviewCount = stats[0].reviewCount;
    await Movie.findByIdAndUpdate(movieId, {
      averageRating,
      reviewCount,
    });
    return { averageRating, reviewCount };
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: 0,
      reviewCount: 0,
    });
    return { averageRating: 0, reviewCount: 0 };
  }
};

// Post-save hook to recalculate stats
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.movieId);
});

// Post-delete hooks
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.movieId);
  }
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calcAverageRating(this.movieId);
});

export const Review = mongoose.model('Review', reviewSchema);
export default Review;

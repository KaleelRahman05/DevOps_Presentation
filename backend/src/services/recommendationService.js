import Movie from '../models/Movie.js';

/**
 * Generates genre-based recommendations for a given movie.
 * Ranks candidates by matching genre overlap, rating, and review count.
 * Returns an explanatory tag for transparent user recommendations.
 */
export const getMovieRecommendations = async (movieId, limit = 4) => {
  const targetMovie = await Movie.findById(movieId);
  if (!targetMovie) {
    return [];
  }

  // Find other movies sharing at least one genre
  const candidateMovies = await Movie.find({
    _id: { $ne: targetMovie._id },
    genres: { $in: targetMovie.genres },
  })
    .lean()
    .exec();

  if (candidateMovies.length === 0) {
    // Fallback: If no matching genre movies exist, return highest rated other movies
    const fallbackMovies = await Movie.find({ _id: { $ne: targetMovie._id } })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();

    return fallbackMovies.map((movie) => ({
      ...movie,
      recommendationReason: 'Highly rated by CineScope community',
      matchingGenres: [],
    }));
  }

  const targetGenresSet = new Set(targetMovie.genres.map((g) => g.toLowerCase()));

  // Score candidates
  const scored = candidateMovies.map((movie) => {
    const matching = movie.genres.filter((g) =>
      targetGenresSet.has(g.toLowerCase())
    );
    const overlapScore = matching.length;
    // Composite score: 10 points per matched genre + average rating
    const finalScore = overlapScore * 10 + (movie.averageRating || 0);

    let reason;
    if (matching.length > 1) {
      reason = `Because you like ${matching.slice(0, 2).join(' & ')}`;
    } else if (matching.length === 1) {
      reason = `Because you like ${matching[0]}`;
    } else {
      reason = 'Recommended based on overall ratings';
    }

    return {
      ...movie,
      overlapScore,
      finalScore,
      matchingGenres: matching,
      recommendationReason: reason,
    };
  });

  // Sort by finalScore descending
  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored.slice(0, limit);
};

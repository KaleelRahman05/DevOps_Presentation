import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import { getMovieRecommendations } from '../services/recommendationService.js';

export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      year,
      sort = 'rating_desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Title / Director search
    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      query.$or = [
        { title: { $regex: trimmedSearch, $options: 'i' } },
        { director: { $regex: trimmedSearch, $options: 'i' } },
        { cast: { $regex: trimmedSearch, $options: 'i' } },
      ];
    }

    // Genre filter
    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    // Release year filter
    if (year && !isNaN(year)) {
      query.releaseYear = parseInt(year, 10);
    }

    // Sorting options
    let sortOptions = { averageRating: -1, reviewCount: -1 };
    switch (sort) {
      case 'rating_asc':
        sortOptions = { averageRating: 1, reviewCount: 1 };
        break;
      case 'newest':
      case 'year_desc':
        sortOptions = { releaseYear: -1, createdAt: -1 };
        break;
      case 'oldest':
      case 'year_asc':
        sortOptions = { releaseYear: 1 };
        break;
      case 'title_asc':
        sortOptions = { title: 1 };
        break;
      case 'title_desc':
        sortOptions = { title: -1 };
        break;
      case 'rating_desc':
      default:
        sortOptions = { averageRating: -1, reviewCount: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [movies, totalMovies] = await Promise.all([
      Movie.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Movie.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalMovies / limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      totalMovies,
      totalPages,
      currentPage: pageNum,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ featured: true }).limit(5).lean();
    const topRated = await Movie.find().sort({ averageRating: -1, reviewCount: -1 }).limit(10).lean();

    res.status(200).json({
      success: true,
      featured: featured.length > 0 ? featured : topRated.slice(0, 4),
      topRated,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieRecommendationsHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4;

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

    const recommendations = await getMovieRecommendations(id, limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      posterUrl,
      backdropUrl,
      releaseYear,
      genres,
      synopsis,
      runtime,
      director,
      cast,
      featured,
    } = req.body;

    const parsedGenres = Array.isArray(genres)
      ? genres
      : String(genres || '')
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean);

    const parsedCast = Array.isArray(cast)
      ? cast
      : String(cast || '')
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

    const movie = new Movie({
      title,
      posterUrl,
      backdropUrl: backdropUrl || '',
      releaseYear: parseInt(releaseYear, 10),
      genres: parsedGenres,
      synopsis,
      runtime: parseInt(runtime, 10),
      director,
      cast: parsedCast,
      featured: Boolean(featured),
    });

    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
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

    const {
      title,
      posterUrl,
      backdropUrl,
      releaseYear,
      genres,
      synopsis,
      runtime,
      director,
      cast,
      featured,
    } = req.body;

    if (title !== undefined) movie.title = title;
    if (posterUrl !== undefined) movie.posterUrl = posterUrl;
    if (backdropUrl !== undefined) movie.backdropUrl = backdropUrl;
    if (releaseYear !== undefined) movie.releaseYear = parseInt(releaseYear, 10);
    if (synopsis !== undefined) movie.synopsis = synopsis;
    if (runtime !== undefined) movie.runtime = parseInt(runtime, 10);
    if (director !== undefined) movie.director = director;
    if (featured !== undefined) movie.featured = Boolean(featured);

    if (genres !== undefined) {
      movie.genres = Array.isArray(genres)
        ? genres
        : String(genres)
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
    }

    if (cast !== undefined) {
      movie.cast = Array.isArray(cast)
        ? cast
        : String(cast)
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
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

    // Delete associated reviews
    await Review.deleteMany({ movieId: id });
    // Delete the movie
    await Movie.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Movie and associated reviews deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

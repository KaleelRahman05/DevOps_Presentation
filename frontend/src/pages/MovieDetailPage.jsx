import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  User,
  Film,
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';
import { movieService, reviewService } from '../services/api';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';

export const MovieDetailPage = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const [movieRes, reviewsRes, recsRes] = await Promise.all([
          movieService.getMovieById(id),
          reviewService.getReviewsForMovie(id),
          movieService.getRecommendations(id, 4),
        ]);

        setMovie(movieRes.movie);
        setReviews(reviewsRes.reviews || []);
        setRecommendations(recsRes.recommendations || []);
      } catch (err) {
        setError(err.message || 'Movie not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Handle new review submitted without redeployment or reload
  const handleReviewAdded = (newReview, updatedStats) => {
    setReviews((prev) => [newReview, ...prev]);
    if (updatedStats && movie) {
      setMovie((prev) => ({
        ...prev,
        averageRating: updatedStats.averageRating,
        reviewCount: updatedStats.reviewCount,
      }));
    }
  };

  // Handle review deletion (admin action)
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      if (res.movieStats && movie) {
        setMovie((prev) => ({
          ...prev,
          averageRating: res.movieStats.averageRating,
          reviewCount: res.movieStats.reviewCount,
        }));
      }
    } catch (err) {
      alert(`Failed to delete review: ${err.message}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner message="Fetching movie details..." />;
  }

  if (error || !movie) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="alert-box alert-error" style={{ justifyContent: 'center' }}>
          <span>{error || 'Movie not found.'}</span>
        </div>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} />
          <span>Back to Discover Catalog</span>
        </Link>
      </div>
    );
  }

  const ratingStr =
    typeof movie.averageRating === 'number' && movie.averageRating > 0
      ? movie.averageRating.toFixed(1)
      : 'Unrated';

  return (
    <div className="movie-detail-page">
      {/* Backdrop Header */}
      <div
        style={{
          position: 'relative',
          minHeight: '380px',
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11,12,16,0.5) 0%, rgba(11,12,16,0.85) 60%, var(--bg-primary) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px 24px 0',
          }}
        >
          <Link
            to="/"
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              padding: '8px 14px',
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Movies</span>
          </Link>
        </div>
      </div>

      {/* Main Movie Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '-140px auto 0',
          padding: '0 24px 60px',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '36px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Poster Card */}
          <div style={{ maxWidth: '340px', width: '100%', margin: '0 auto' }}>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                background: 'var(--bg-card)',
                aspectRatio: '2 / 3',
              }}
            >
              <img
                src={movie.posterUrl || '/placeholder.svg'}
                alt={`${movie.title} poster`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleShare}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copied ? <Check size={16} color="#2ed573" /> : <Share2 size={16} />}
                <span>{copied ? 'Link Copied!' : 'Share Film'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Movie Info & Synopsis */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {(movie.genres || []).map((genre) => (
                <span
                  key={genre}
                  style={{
                    background: 'rgba(229, 9, 20, 0.15)',
                    color: '#ff6b6b',
                    border: '1px solid rgba(229, 9, 20, 0.3)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '14px',
                letterSpacing: '-0.5px',
              }}
            >
              {movie.title}
            </h1>

            {/* Meta Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '18px',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.3)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-gold)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                }}
              >
                <Star size={18} fill="#f5c518" color="#f5c518" />
                <span>{ratingStr}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 10</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--text-muted)" />
                <span>{movie.releaseYear}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--text-muted)" />
                <span>{movie.runtime} min ({Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m)</span>
              </div>

              <div style={{ color: 'var(--text-muted)' }}>
                <span>{movie.reviewCount || 0} reviews</span>
              </div>
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                Storyline
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7' }}>
                {movie.synopsis}
              </p>
            </div>

            {/* Cast & Crew */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'grid',
                gap: '14px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>
                  Director
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {movie.director}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                  Cast
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(movie.cast || []).map((actor) => (
                    <span
                      key={actor}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Recommendations Section */}
        {recommendations.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <div className="section-header">
              <div className="section-title">
                <span className="section-title-line" />
                <Sparkles size={20} color="#e50914" />
                <span>Because You Liked {movie.genres?.[0] || 'This Movie'}</span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
              }}
            >
              {recommendations.map((rec) => (
                <MovieCard key={rec._id} movie={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '60px' }}>
          <div className="section-header">
            <div className="section-title">
              <span className="section-title-line" />
              <Film size={20} color="#e50914" />
              <span>User Ratings & Reviews</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Review Submission Form */}
          <ReviewForm movieId={movie._id} onReviewAdded={handleReviewAdded} />

          {/* List of existing reviews */}
          <div style={{ marginTop: '30px' }}>
            {reviews.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                Be the first to review <strong>{movie.title}</strong>! Share your rating above.
              </div>
            ) : (
              reviews.map((rev) => (
                <ReviewCard
                  key={rev._id}
                  review={rev}
                  onDelete={handleDeleteReview}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;

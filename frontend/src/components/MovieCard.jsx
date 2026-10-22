import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const rating =
    typeof movie.averageRating === 'number'
      ? movie.averageRating.toFixed(1)
      : '0.0';

  return (
    <Link to={`/movies/${movie._id}`} className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl || '/placeholder.svg'}
          alt={`${movie.title} poster`}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.svg';
          }}
        />

        <div className="movie-rating-badge">
          <Star size={13} fill="#f5c518" color="#f5c518" />
          <span>{rating > 0 ? rating : 'NR'}</span>
        </div>

        {movie.recommendationReason && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              right: '8px',
              background: 'rgba(11, 12, 16, 0.9)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              color: '#ff8a80',
              fontWeight: 600,
              border: '1px solid rgba(229, 9, 20, 0.3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={movie.recommendationReason}
          >
            {movie.recommendationReason}
          </div>
        )}
      </div>

      <div className="movie-card-info">
        <h3 className="movie-card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="movie-card-meta">
          <span>{movie.releaseYear}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MessageSquare size={12} />
            <span>{movie.reviewCount || 0}</span>
          </span>
        </div>

        <div className="movie-card-genres">
          {(movie.genres || []).slice(0, 2).map((genre) => (
            <span key={genre} className="genre-tag">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;

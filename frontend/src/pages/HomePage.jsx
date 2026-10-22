import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Trophy,
  ArrowRight,
  RotateCcw,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Crime',
  'Thriller',
  'Adventure',
  'Animation',
  'Biography',
  'History',
  'Romance',
];

export const HomePage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  // Fetch featured / top-rated on initial mount
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await movieService.getFeaturedMovies();
        setFeaturedMovies(data.featured || []);
        setTopRatedMovies(data.topRated || []);
      } catch (err) {
        console.warn('Hero data fetch error:', err.message);
      }
    };
    fetchHeroData();
  }, []);

  // Fetch movies catalog
  const fetchCatalog = useCallback(
    async (currentPage = 1, append = false) => {
      try {
        if (append) {
          setPageLoading(true);
        } else {
          setLoading(true);
        }
        setError('');

        const params = {
          page: currentPage,
          limit: 12,
          sort: sortBy,
        };
        if (search.trim()) params.search = search.trim();
        if (selectedGenre && selectedGenre !== 'All') params.genre = selectedGenre;
        if (selectedYear) params.year = selectedYear;

        const data = await movieService.getMovies(params);

        if (append) {
          setMovies((prev) => [...prev, ...data.movies]);
        } else {
          setMovies(data.movies || []);
        }

        setTotalPages(data.totalPages || 1);
        setTotalMovies(data.totalMovies || 0);
        setPage(currentPage);
      } catch (err) {
        setError(err.message || 'Failed to load movie catalog.');
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [search, selectedGenre, selectedYear, sortBy]
  );

  useEffect(() => {
    fetchCatalog(1, false);
  }, [fetchCatalog]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedYear('');
    setSortBy('rating_desc');
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchCatalog(page + 1, true);
    }
  };

  const heroMovie = featuredMovies[0] || movies[0];

  return (
    <div className="home-page">
      {/* Featured Hero Banner */}
      {heroMovie && (
        <section
          className="hero-section"
          style={{
            backgroundImage: `url(${heroMovie.backdropUrl || heroMovie.posterUrl})`,
          }}
        >
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="hero-tag">
              <Flame size={14} /> Featured Masterpiece
            </span>
            <h1 className="hero-title">{heroMovie.title}</h1>

            <div className="hero-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f5c518', fontWeight: 700 }}>
                <Star size={16} fill="#f5c518" color="#f5c518" />
                {heroMovie.averageRating > 0 ? heroMovie.averageRating.toFixed(1) : '9.3'} / 10
              </span>
              <span>&bull;</span>
              <span>{heroMovie.releaseYear}</span>
              <span>&bull;</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={15} /> {heroMovie.runtime} min
              </span>
              <span>&bull;</span>
              <span>{(heroMovie.genres || []).join(', ')}</span>
            </div>

            <p className="hero-synopsis">{heroMovie.synopsis}</p>

            <Link
              to={`/movies/${heroMovie._id}`}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              <span>Explore Movie & Reviews</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Main Discover Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Top Rated Spotlight Carousel / Strip */}
        {topRatedMovies.length > 0 && !search && selectedGenre === 'All' && (
          <div style={{ marginBottom: '48px' }}>
            <div className="section-header">
              <div className="section-title">
                <span className="section-title-line" />
                <Trophy size={20} color="#f5c518" />
                <span>Top Rated by CineScope Community</span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              {topRatedMovies.slice(0, 6).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="section-header">
          <div className="section-title">
            <span className="section-title-line" />
            <SlidersHorizontal size={20} color="#e50914" />
            <span>Discover Movies</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              ({totalMovies} titles)
            </span>
          </div>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, director, or cast..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="custom-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              aria-label="Filter by genre"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g === 'All' ? 'All Genres' : g}
                </option>
              ))}
            </select>

            <select
              className="custom-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Filter by year"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2014">2014</option>
              <option value="2010">2010</option>
              <option value="2008">2008</option>
              <option value="2001">2001</option>
              <option value="2000">2000</option>
              <option value="1999">1999</option>
              <option value="1994">1994</option>
              <option value="1972">1972</option>
              <option value="1942">1942</option>
            </select>

            <select
              className="custom-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort movies"
            >
              <option value="rating_desc">Highest Rated</option>
              <option value="rating_asc">Lowest Rated</option>
              <option value="newest">Newest Release</option>
              <option value="oldest">Oldest Release</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>

            {(search || selectedGenre !== 'All' || selectedYear) && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ padding: '9px 12px' }}
                title="Reset all filters"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <LoadingSpinner message="Searching movie catalog..." />
        ) : error ? (
          <div className="alert-box alert-error">
            <span>{error}</span>
          </div>
        ) : movies.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Sparkles size={38} color="#e50914" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              No movies found matching your filters
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Try loosening your search keywords or clearing genre & year filters.
            </p>
            <button onClick={handleResetFilters} className="btn-secondary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={pageLoading}
                  className="btn-secondary"
                  style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                >
                  {pageLoading ? 'Loading more movies...' : `Load More Movies (${page} of ${totalPages})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

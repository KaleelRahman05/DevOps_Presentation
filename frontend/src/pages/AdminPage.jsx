import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import { movieService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = {
  title: '',
  releaseYear: new Date().getFullYear(),
  genres: '',
  synopsis: '',
  runtime: 120,
  director: '',
  cast: '',
  posterUrl: '',
  backdropUrl: '',
  featured: false,
};

export const AdminPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await movieService.getMovies({ limit: 100, sort: 'newest' });
      setMovies(data.movies || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMovieId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovieId(movie._id);
    setFormData({
      title: movie.title || '',
      releaseYear: movie.releaseYear || 2024,
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || '',
      synopsis: movie.synopsis || '',
      runtime: movie.runtime || 120,
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      featured: Boolean(movie.featured),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovieId(null);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and all its reviews?`)) {
      return;
    }

    try {
      await movieService.deleteMovie(id);
      setSuccess(`Movie "${title}" removed successfully.`);
      setMovies((prev) => prev.filter((m) => m._id !== id));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(`Failed to delete movie: ${err.message}`);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.title.trim()) {
      setFormError('Movie title is required.');
      return;
    }
    if (!formData.posterUrl.trim()) {
      setFormError('Valid poster image URL is required.');
      return;
    }
    if (!formData.director.trim()) {
      setFormError('Director name is required.');
      return;
    }
    if (!formData.genres.trim()) {
      setFormError('At least one genre is required.');
      return;
    }
    if (!formData.cast.trim()) {
      setFormError('At least one cast member is required.');
      return;
    }
    if (!formData.synopsis.trim() || formData.synopsis.trim().length < 10) {
      setFormError('Synopsis must be at least 10 characters.');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        ...formData,
        releaseYear: Number(formData.releaseYear),
        runtime: Number(formData.runtime),
        genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
        cast: formData.cast.split(',').map((c) => c.trim()).filter(Boolean),
      };

      if (editingMovieId) {
        const res = await movieService.updateMovie(editingMovieId, payload);
        setMovies((prev) =>
          prev.map((m) => (m._id === editingMovieId ? res.movie : m))
        );
        setSuccess(`Movie "${payload.title}" updated successfully!`);
      } else {
        const res = await movieService.createMovie(payload);
        setMovies((prev) => [res.movie, ...prev]);
        setSuccess(`Movie "${payload.title}" created successfully without needing a redeployment!`);
      }

      handleCloseModal();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please review input fields.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.director.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Movie Catalog Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Add, update, and manage CineScope titles and moderate user review counts.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={18} />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search catalog titles or directors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <LoadingSpinner message="Loading movie database..." />
      ) : (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Movie</th>
                  <th style={{ padding: '14px 18px' }}>Year</th>
                  <th style={{ padding: '14px 18px' }}>Genres</th>
                  <th style={{ padding: '14px 18px' }}>Rating</th>
                  <th style={{ padding: '14px 18px' }}>Reviews</th>
                  <th style={{ padding: '14px 18px' }}>Director</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No movies found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <tr
                      key={movie._id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={movie.posterUrl || '/placeholder.svg'}
                            alt=""
                            style={{
                              width: '36px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              background: '#222',
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {movie.title}
                            </div>
                            {movie.featured && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--accent-red)',
                                  fontWeight: 600,
                                }}
                              >
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                        {movie.releaseYear}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(movie.genres || []).slice(0, 2).map((g) => (
                            <span key={g} className="genre-tag">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--accent-gold)',
                            fontWeight: 700,
                          }}
                        >
                          <Star size={14} fill="#f5c518" color="#f5c518" />
                          {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'NR'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare size={14} />
                          {movie.reviewCount || 0}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                        {movie.director}
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <a
                            href={`/movies/${movie._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ padding: '6px 10px' }}
                            title="View Public Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(movie)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px' }}
                            title="Edit Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie._id, movie.title)}
                            className="btn-danger"
                            style={{ padding: '6px 10px' }}
                            title="Delete Movie"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {editingMovieId ? 'Edit Movie Details' : 'Add New Movie to CineScope'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-box alert-error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label">
                  Movie Title <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Gladiator II"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Release Year</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1888"
                    max="2100"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Runtime (Minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={formData.runtime}
                    onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Genres (comma-separated) <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Action, Sci-Fi, Adventure"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Director <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Christopher Nolan"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Cast (comma-separated) <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Actor A, Actor B"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Poster Image URL <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://.../poster.jpg"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Backdrop Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://.../backdrop.jpg"
                  value={formData.backdropUrl}
                  onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Synopsis <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter a compelling movie summary..."
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-red)' }}
                />
                <label htmlFor="featured-checkbox" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Feature this movie on the Home hero banner
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formSubmitting}>
                  <span>
                    {formSubmitting
                      ? 'Saving...'
                      : editingMovieId
                      ? 'Update Movie'
                      : 'Create Movie'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import StarRating from './StarRating';
import { reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReviewForm = ({ movieId, onReviewAdded }) => {
  const { user } = useAuth();

  const [reviewerName, setReviewerName] = useState(user ? user.name : '');
  const [rating, setRating] = useState(10);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nameToSubmit = user ? user.name : reviewerName.trim();

    if (!nameToSubmit || nameToSubmit.length < 2) {
      setError('Please provide a reviewer name of at least 2 characters.');
      return;
    }

    if (!rating || rating < 1 || rating > 10) {
      setError('Please select a valid rating between 1 and 10.');
      return;
    }

    if (!reviewTitle.trim() || reviewTitle.trim().length < 3) {
      setError('Review title must be at least 3 characters long.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setError('Review body must be at least 10 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewService.createReview(movieId, {
        reviewerName: nameToSubmit,
        rating: Number(rating),
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
      });

      setSuccess('Your review has been submitted and the movie rating has been recalculated!');
      setReviewTitle('');
      setReviewText('');
      if (!user) setReviewerName('');

      if (onReviewAdded) {
        onReviewAdded(res.review, res.movieStats);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginTop: '24px',
      }}
    >
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>Write a CineScope Review</span>
      </h3>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {!user && (
          <div className="form-group">
            <label className="form-label" htmlFor="reviewer-name-input">
              Your Name / Nickname <span style={{ color: 'var(--accent-red)' }}>*</span>
            </label>
            <input
              id="reviewer-name-input"
              type="text"
              className="form-control"
              placeholder="e.g. CinemaBuff99"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        )}

        <div className="form-group" style={{ gridColumn: user ? '1 / -1' : 'auto' }}>
          <label className="form-label">
            Your Rating (1 to 10 Stars) <span style={{ color: 'var(--accent-red)' }}>*</span>
          </label>
          <div style={{ paddingTop: '6px' }}>
            <StarRating
              value={rating}
              onChange={setRating}
              readOnly={submitting}
              max={10}
              size={22}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="review-title-input">
          Headline / Review Title <span style={{ color: 'var(--accent-red)' }}>*</span>
        </label>
        <input
          id="review-title-input"
          type="text"
          className="form-control"
          placeholder="e.g. A visual masterpiece of modern storytelling"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          disabled={submitting}
          maxLength={120}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="review-text-input">
          Detailed Review <span style={{ color: 'var(--accent-red)' }}>*</span>
        </label>
        <textarea
          id="review-text-input"
          className="form-control"
          placeholder="What did you love or dislike about the cinematography, acting, plot, and soundtrack?"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          disabled={submitting}
          rows={4}
          maxLength={3000}
          required
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        style={{ marginTop: '8px' }}
      >
        <Send size={16} />
        <span>{submitting ? 'Submitting...' : 'Post Review & Recalculate Rating'}</span>
      </button>
    </form>
  );
};

export default ReviewForm;

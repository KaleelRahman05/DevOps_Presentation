import React from 'react';
import { Star, User, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReviewCard = ({ review, onDelete }) => {
  const { isAdmin } = useAuth();

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <User size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {review.reviewerName}
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(245, 197, 24, 0.12)',
              border: '1px solid rgba(245, 197, 24, 0.3)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-gold)',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <Star size={14} fill="#f5c518" color="#f5c518" />
            <span>{review.rating}/10</span>
          </div>

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="btn-danger"
              title="Delete this review (Admin)"
              style={{ padding: '4px 8px' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <h4
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '8px',
          color: 'var(--text-primary)',
        }}
      >
        {review.reviewTitle}
      </h4>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-line',
        }}
      >
        {review.reviewText}
      </p>
    </div>
  );
};

export default ReviewCard;

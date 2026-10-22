import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '100px auto',
        padding: '0 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(229, 9, 20, 0.15)',
          color: 'var(--accent-red)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Film size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-red)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '14px 0 8px' }}>
        Scene Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
        The reel you are searching for might have been moved, deleted, or does not exist in the CineScope archive.
      </p>

      <Link to="/" className="btn-primary" style={{ padding: '12px 24px', display: 'inline-flex' }}>
        <Home size={18} />
        <span>Return to CineScope Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;

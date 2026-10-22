import React from 'react';

export const LoadingSpinner = ({ message = 'Loading CineScope...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: 'var(--text-secondary)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(229, 9, 20, 0.2)',
          borderTop: '3px solid var(--accent-red)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export default LoadingSpinner;

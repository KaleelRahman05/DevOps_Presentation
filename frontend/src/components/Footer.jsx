import React from 'react';
import { Film, GitBranch, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Film size={18} color="#e50914" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CineScope</span>
          <span>— Movie Discovery, Ratings & Reviews</span>
        </div>
        <div>
          <span>Academic Project showcasing a real </span>
          <span className="footer-highlight" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <GitBranch size={13} /> Jenkins CI/CD Pipeline
          </span>
          <span> with automated Docker testing and deployment.</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Powered by React, Express, MongoDB, Docker & Jenkins &bull; All sample movie metadata for educational evaluation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

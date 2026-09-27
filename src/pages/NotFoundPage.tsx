import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', width: '100%' }}>
      <h2 style={{ fontSize: '2rem', color: '#f87171', margin: '0 0 1rem 0' }}>
        404 - Page Not Found
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        The requested route does not exist in WorkBench.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          backgroundColor: '#38bdf8',
          color: '#0f172a',
          padding: '0.5rem 1.25rem',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Return to Overview
      </Link>
    </div>
  );
};

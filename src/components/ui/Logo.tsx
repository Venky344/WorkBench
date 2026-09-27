import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 24 : size === 'lg' ? 40 : 32;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src="/logo.png"
        alt="WorkBench Logo"
        width={pixelSize}
        height={pixelSize}
        style={{
          borderRadius: 'var(--wb-radius-md)',
          objectFit: 'contain',
          display: 'block',
        }}
        onError={(e) => {
          // Fallback SVG if logo.png is not found
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        data-testid="logo-fallback"
        style={{
          display: 'none',
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          backgroundColor: 'var(--wb-color-surface-elevated)',
          border: '1px solid var(--wb-color-border-strong)',
          borderRadius: 'var(--wb-radius-md)',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--wb-color-primary)',
          fontWeight: 'bold',
          fontSize: `${pixelSize * 0.5}px`,
        }}
      >
        W
      </div>

      {showText && (
        <span
          style={{
            fontSize:
              size === 'sm'
                ? 'var(--wb-text-sm)'
                : size === 'lg'
                  ? 'var(--wb-text-xl)'
                  : 'var(--wb-text-base)',
            fontWeight: 'var(--wb-weight-bold)',
            letterSpacing: 'var(--wb-tracking-tight)',
            color: 'var(--wb-color-fg)',
          }}
        >
          Work<span style={{ color: 'var(--wb-color-primary)' }}>Bench</span>
        </span>
      )}
    </div>
  );
};

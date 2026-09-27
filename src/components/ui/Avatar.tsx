import React, { useState } from 'react';
import { User, Folder, Sparkles } from 'lucide-react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarType = 'user' | 'project' | 'source';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  type?: AvatarType;
  color?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  type = 'user',
  color,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const getPixelSize = (): number => {
    switch (size) {
      case 'sm':
        return 24;
      case 'lg':
        return 40;
      case 'xl':
        return 48;
      case 'md':
      default:
        return 32;
    }
  };

  const getInitials = (text?: string): string => {
    if (!text) return '';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || '';
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  const pixelSize = getPixelSize();
  const initials = getInitials(name || alt);

  const getDefaultIcon = () => {
    const iconSize = Math.floor(pixelSize * 0.5);
    switch (type) {
      case 'project':
        return <Folder size={iconSize} />;
      case 'source':
        return <Sparkles size={iconSize} />;
      case 'user':
      default:
        return <User size={iconSize} />;
    }
  };

  return (
    <div
      className={`wb-avatar wb-avatar-${size} ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderRadius: type === 'project' ? 'var(--wb-radius-md)' : 'var(--wb-radius-full)',
        backgroundColor: color || 'var(--wb-color-surface-active)',
        color: 'var(--wb-color-fg)',
        border: '1px solid var(--wb-color-border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        fontSize: `${Math.max(10, Math.floor(pixelSize * 0.38))}px`,
        fontWeight: 'var(--wb-weight-semibold)',
        flexShrink: 0,
      }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        getDefaultIcon()
      )}
    </div>
  );
};

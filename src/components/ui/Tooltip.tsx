import React, { useState, useRef, ReactNode, useId } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delayMs = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const id = useId();

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPlacementStyles = (): React.CSSProperties => {
    switch (placement) {
      case 'bottom':
        return {
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          left: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'top':
      default:
        return {
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide();
      }}
    >
      {children}
      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className="wb-tooltip"
          style={{
            position: 'absolute',
            zIndex: 'var(--wb-z-tooltip)',
            backgroundColor: 'var(--wb-color-surface-elevated)',
            color: 'var(--wb-color-fg)',
            border: '1px solid var(--wb-color-border-strong)',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--wb-radius-sm)',
            fontSize: 'var(--wb-text-xs)',
            fontWeight: 'var(--wb-weight-normal)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: 'var(--wb-shadow-md)',
            animation: 'wb-fade-in var(--wb-duration-fast) var(--wb-ease-out)',
            ...getPlacementStyles(),
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

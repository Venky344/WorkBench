import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  projects: 'Projects',
  chats: 'Conversations',
  inbox: 'Inbox',
  tasks: 'Tasks',
  decisions: 'Decision Log',
  resources: 'Resources',
  settings: 'Settings',
  showcase: 'Design System Showcase',
  'design-system': 'Design System Showcase',
};

export interface BreadcrumbsProps {
  customSegments?: Array<{ label: string; href?: string }>;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customSegments, className = '' }) => {
  const location = useLocation();

  const getSegments = () => {
    if (customSegments && customSegments.length > 0) {
      return customSegments;
    }

    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0) {
      return [{ label: 'Home', href: '/' }];
    }

    const segments: Array<{ label: string; href?: string }> = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;
      const label = ROUTE_LABELS[segment.toLowerCase()] || decodeURIComponent(segment);
      segments.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return segments;
  };

  const segments = getSegments();

  return (
    <nav aria-label="Breadcrumb" className={`wb-breadcrumbs ${className}`}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontSize: 'var(--wb-text-sm)',
        }}
      >
        {segments.map((item, index) => {
          const isFirst = index === 0;

          return (
            <li
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              {!isFirst && (
                <ChevronRight
                  size={14}
                  color="var(--wb-color-fg-subtle)"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                />
              )}

              {item.href ? (
                <Link
                  to={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--wb-color-fg-muted)',
                    textDecoration: 'none',
                    fontWeight: 'var(--wb-weight-normal)',
                    transition: 'var(--wb-transition-colors)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--wb-color-fg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--wb-color-fg-muted)')}
                >
                  {isFirst && <Home size={14} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current="page"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'var(--wb-color-fg)',
                    fontWeight: 'var(--wb-weight-semibold)',
                  }}
                >
                  {isFirst && <Home size={14} />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

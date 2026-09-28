import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/ui';
import { ChevronRight } from 'lucide-react';

export interface ProjectModuleCardProps {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly to: string;
  readonly phaseBadge: string;
}

export const ProjectModuleCard: React.FC<ProjectModuleCardProps> = ({
  title,
  description,
  icon,
  to,
  phaseBadge,
}) => {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
      <Card
        variant="interactive"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          border: '1px solid var(--wb-color-border)',
          transition: 'transform 0.15s ease, border-color 0.15s ease',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontSize: 'var(--wb-text-sm)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg)',
              }}
            >
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--wb-radius-md)',
                  backgroundColor: 'var(--wb-color-surface-active)',
                  color: 'var(--wb-color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <span>{title}</span>
            </div>

            <Badge variant="neutral" badgeStyle="subtle">
              {phaseBadge}
            </Badge>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              lineHeight: 'var(--wb-leading-normal)',
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.25rem',
            marginTop: '1rem',
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-primary)',
            fontWeight: 'var(--wb-weight-medium)',
          }}
        >
          <span>Open module</span>
          <ChevronRight size={14} />
        </div>
      </Card>
    </Link>
  );
};

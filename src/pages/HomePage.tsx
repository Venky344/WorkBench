import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '@/components/ui';
import { ArrowRight, Palette, Layers, Box } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      <Card variant="elevated">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>WorkBench Workspace Foundation</CardTitle>
            <Badge variant="primary" dot>
              Phase 2 Active
            </Badge>
          </div>
          <CardDescription>
            Core visual language, semantic tokens, and accessible UI component primitives are
            verified and active.
          </CardDescription>
        </CardHeader>

        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--wb-color-bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--wb-color-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                <Palette size={16} />
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    textTransform: 'uppercase',
                  }}
                >
                  Design System
                </span>
              </div>
              <div style={{ color: 'var(--wb-color-fg)', fontWeight: 600 }}>
                Semantic Tokens & Themes
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--wb-color-bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--wb-color-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                <Box size={16} />
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    textTransform: 'uppercase',
                  }}
                >
                  UI Primitives
                </span>
              </div>
              <div style={{ color: 'var(--wb-color-fg)', fontWeight: 600 }}>
                20+ Reusable Components
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--wb-color-bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--wb-color-primary)',
                  marginBottom: '0.25rem',
                }}
              >
                <Layers size={16} />
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    textTransform: 'uppercase',
                  }}
                >
                  Next Phase
                </span>
              </div>
              <div style={{ color: 'var(--wb-color-fg)', fontWeight: 600 }}>
                Phase 3 (App Shell)
              </div>
            </div>
          </div>

          <p
            style={{
              color: 'var(--wb-color-fg-muted)',
              fontSize: 'var(--wb-text-sm)',
              lineHeight: 'var(--wb-leading-normal)',
            }}
          >
            Experience and inspect all design tokens, interactive controls, dialogs, tabs, form
            controls, and theme switches in the dedicated internal showcase.
          </p>
        </CardContent>

        <CardFooter>
          <Link to="/showcase" style={{ textDecoration: 'none' }}>
            <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
              Open Design System Showcase
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

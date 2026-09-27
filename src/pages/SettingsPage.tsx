import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Separator,
} from '@/components/ui';
import { useThemeStore } from '@/stores/theme.store';
import { appConfig } from '@/app/config/app.config';
import { Moon, Sun, Laptop, ShieldCheck, HardDrive, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{ margin: 0, fontSize: 'var(--wb-text-2xl)', fontWeight: 'var(--wb-weight-bold)' }}
        >
          Settings & Preferences
        </h1>
        <p
          style={{
            margin: '0.25rem 0 0 0',
            fontSize: 'var(--wb-text-sm)',
            color: 'var(--wb-color-fg-muted)',
          }}
        >
          Manage your personal workspace appearance, offline storage preferences, and environment
          configurations.
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <Card variant="default">
        <CardHeader>
          <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>Appearance & Theme</CardTitle>
          <CardDescription>
            Select your interface theme preference (Dark by default)
          </CardDescription>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant={theme === 'dark' ? 'primary' : 'outline'}
              leftIcon={<Moon size={16} />}
              onClick={() => setTheme('dark')}
            >
              Dark Theme {theme === 'dark' && '(Active)'}
            </Button>
            <Button
              variant={theme === 'light' ? 'primary' : 'outline'}
              leftIcon={<Sun size={16} />}
              onClick={() => setTheme('light')}
            >
              Light Theme {theme === 'light' && '(Active)'}
            </Button>
            <Button
              variant={theme === 'system' ? 'primary' : 'outline'}
              leftIcon={<Laptop size={16} />}
              onClick={() => setTheme('system')}
            >
              System Default {theme === 'system' && `(${resolvedTheme})`}
            </Button>
          </div>
          <p
            style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)', margin: 0 }}
          >
            Theme changes update all semantic tokens across the entire application shell
            dynamically.
          </p>
        </CardContent>
      </Card>

      {/* 2. Storage & Privacy Boundaries */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardDrive size={18} color="var(--wb-color-primary)" />
            <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>
              Storage & Offline Invariants
            </CardTitle>
          </div>
          <CardDescription>Local-first architectural status</CardDescription>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              borderRadius: 'var(--wb-radius-md)',
              border: '1px solid var(--wb-color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--wb-color-success)" />
              <div>
                <div
                  style={{ fontSize: 'var(--wb-text-sm)', fontWeight: 'var(--wb-weight-semibold)' }}
                >
                  Local-First Operation
                </div>
                <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
                  All workspace operations function 100% locally without cloud dependencies.
                </div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              borderRadius: 'var(--wb-radius-md)',
              border: '1px solid var(--wb-color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--wb-color-success)" />
              <div>
                <div
                  style={{ fontSize: 'var(--wb-text-sm)', fontWeight: 'var(--wb-weight-semibold)' }}
                >
                  No Embedded LLM Requirement
                </div>
                <div style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
                  WorkBench organizes external AI conversations; zero heavy AI models or API key
                  requirements.
                </div>
              </div>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 3. About WorkBench */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} color="var(--wb-color-accent)" />
            <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>About WorkBench</CardTitle>
          </div>
          <CardDescription>Product version and build information</CardDescription>
        </CardHeader>
        <CardContent
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: 'var(--wb-text-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <span>Application Version</span>
            <span style={{ fontWeight: 600, color: 'var(--wb-color-fg)' }}>
              v{appConfig.version}
            </span>
          </div>
          <Separator />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <span>Active Roadmap Phase</span>
            <span style={{ fontWeight: 600, color: 'var(--wb-color-primary)' }}>
              Phase 3 — Application Shell
            </span>
          </div>
          <Separator />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            <span>Target Environment</span>
            <span style={{ fontWeight: 600, color: 'var(--wb-color-fg)' }}>
              {appConfig.environment}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
import { useAppStore } from '@/stores/app.store';
import {
  FolderKanban,
  MessageSquareQuote,
  Inbox,
  CheckSquare,
  Plus,
  ArrowRight,
  GitCommit,
  BookMarked,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setQuickCaptureOpen } = useAppStore();

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* 1. Welcome Banner Card */}
      <Card variant="elevated" style={{ borderLeft: '4px solid var(--wb-color-primary)' }}>
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CardTitle style={{ fontSize: 'var(--wb-text-2xl)' }}>Welcome to WorkBench</CardTitle>
              <Badge variant="primary" dot>
                Phase 3 App Shell Active
              </Badge>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setQuickCaptureOpen(true)}
            >
              Quick Capture
            </Button>
          </div>
          <CardDescription style={{ fontSize: 'var(--wb-text-base)', marginTop: '0.375rem' }}>
            Everything you work on, organized in one personal digital work area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            style={{
              color: 'var(--wb-color-fg-muted)',
              fontSize: 'var(--wb-text-sm)',
              lineHeight: 'var(--wb-leading-normal)',
              margin: 0,
            }}
          >
            WorkBench unites your AI conversations across ChatGPT, Claude, Gemini, and Perplexity
            with local files, notes, tasks, and architectural decisions in structured project
            containers.
          </p>
        </CardContent>
      </Card>

      {/* 2. Workspace Summary KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <Link to="/projects" style={{ textDecoration: 'none' }}>
          <Card
            variant="default"
            style={{ cursor: 'pointer', transition: 'var(--wb-transition-colors)' }}
          >
            <CardHeader style={{ paddingBottom: '0.25rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    color: 'var(--wb-color-fg-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  Projects
                </span>
                <FolderKanban size={18} color="var(--wb-color-primary)" />
              </div>
              <CardTitle style={{ fontSize: 'var(--wb-text-2xl)', marginTop: '0.25rem' }}>
                3
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Active organizational containers
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/chats" style={{ textDecoration: 'none' }}>
          <Card variant="default" style={{ cursor: 'pointer' }}>
            <CardHeader style={{ paddingBottom: '0.25rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    color: 'var(--wb-color-fg-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  Conversations
                </span>
                <MessageSquareQuote size={18} color="var(--wb-color-accent)" />
              </div>
              <CardTitle style={{ fontSize: 'var(--wb-text-2xl)', marginTop: '0.25rem' }}>
                12
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Imported across 3 AI providers
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/inbox" style={{ textDecoration: 'none' }}>
          <Card variant="default" style={{ cursor: 'pointer' }}>
            <CardHeader style={{ paddingBottom: '0.25rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    color: 'var(--wb-color-fg-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  Inbox Staging
                </span>
                <Inbox size={18} color="var(--wb-color-warning)" />
              </div>
              <CardTitle style={{ fontSize: 'var(--wb-text-2xl)', marginTop: '0.25rem' }}>
                5
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-warning)' }}>
                Requires project triage
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/tasks" style={{ textDecoration: 'none' }}>
          <Card variant="default" style={{ cursor: 'pointer' }}>
            <CardHeader style={{ paddingBottom: '0.25rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    color: 'var(--wb-color-fg-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  Open Tasks
                </span>
                <CheckSquare size={18} color="var(--wb-color-success)" />
              </div>
              <CardTitle style={{ fontSize: 'var(--wb-text-2xl)', marginTop: '0.25rem' }}>
                8
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: '0.25rem' }}>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Action items linked to context
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. Recent Activity & Project Preview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Projects Card */}
        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>Recent Projects</CardTitle>
              <Link
                to="/projects"
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-primary)',
                  textDecoration: 'none',
                }}
              >
                View all
              </Link>
            </div>
            <CardDescription>Primary organizational containers</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--wb-color-bg-subtle)',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--wb-radius-full)',
                    backgroundColor: 'var(--wb-color-primary)',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 'var(--wb-text-sm)',
                      fontWeight: 'var(--wb-weight-semibold)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    CricAuction Architecture
                  </div>
                  <div
                    style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}
                  >
                    6 chats • 4 tasks • 2 decisions
                  </div>
                </div>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--wb-color-bg-subtle)',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--wb-radius-full)',
                    backgroundColor: 'var(--wb-color-accent)',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 'var(--wb-text-sm)',
                      fontWeight: 'var(--wb-weight-semibold)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    Deep Research Sprint
                  </div>
                  <div
                    style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}
                  >
                    4 chats • 12 references
                  </div>
                </div>
              </div>
              <Badge variant="neutral">Research</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/projects" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={14} />}
              >
                Go to Projects Hub
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Decisions & Context */}
        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>Logged Decisions</CardTitle>
              <Link
                to="/decisions"
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-primary)',
                  textDecoration: 'none',
                }}
              >
                View log
              </Link>
            </div>
            <CardDescription>Architectural records and technical choices</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--wb-color-bg-subtle)',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCommit size={14} color="var(--wb-color-success)" />
                <span
                  style={{ fontSize: 'var(--wb-text-sm)', fontWeight: 'var(--wb-weight-semibold)' }}
                >
                  Use WebSocket for Live Bidding
                </span>
              </div>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Decision rationale derived from ChatGPT conversation on real-time sync.
              </span>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--wb-color-bg-subtle)',
                borderRadius: 'var(--wb-radius-md)',
                border: '1px solid var(--wb-color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookMarked size={14} color="var(--wb-color-primary)" />
                <span
                  style={{ fontSize: 'var(--wb-text-sm)', fontWeight: 'var(--wb-weight-semibold)' }}
                >
                  Adopt Local-First Architecture
                </span>
              </div>
              <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
                Zero mandatory cloud dependencies; fast offline indexing.
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/decisions" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={14} />}
              >
                Open Decision Log
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

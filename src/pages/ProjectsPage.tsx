import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
} from '@/components/ui';
import { Plus, Search } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const ProjectsPage: React.FC = () => {
  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-2xl)',
              fontWeight: 'var(--wb-weight-bold)',
            }}
          >
            Projects
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Primary organizational containers holding conversations, files, notes, tasks, and
            decisions.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() =>
            toast.info('Project creation will be implemented in Phase 5.', 'Projects Module')
          }
        >
          New Project
        </Button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input placeholder="Filter projects by title or tag..." leftIcon={<Search size={14} />} />
        </div>
        <Badge variant="primary" dot>
          3 Active
        </Badge>
        <Badge variant="neutral">0 Archived</Badge>
      </div>

      {/* Project Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--wb-radius-full)',
                    backgroundColor: 'var(--wb-color-primary)',
                  }}
                />
                <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>CricAuction</CardTitle>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
            <CardDescription>Live cricket player bidding platform architecture</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="neutral" badgeStyle="outline">
                #websocket
              </Badge>
              <Badge variant="neutral" badgeStyle="outline">
                #auction
              </Badge>
              <Badge variant="neutral" badgeStyle="outline">
                #cricheroes
              </Badge>
            </div>
            <div
              style={{
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
                marginTop: '0.5rem',
              }}
            >
              Contains 6 conversations, 4 tasks, 2 architectural decisions.
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%' }}
              onClick={() =>
                toast.info(
                  'Project workspace navigation will be built in Phase 6.',
                  'CricAuction Workspace',
                )
              }
            >
              Open Project Workspace
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--wb-radius-full)',
                    backgroundColor: 'var(--wb-color-accent)',
                  }}
                />
                <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>
                  Deep Research Sprint
                </CardTitle>
              </div>
              <Badge variant="neutral">Research</Badge>
            </div>
            <CardDescription>
              Exploration of state management and local-first SQLite indexing
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="neutral" badgeStyle="outline">
                #local-first
              </Badge>
              <Badge variant="neutral" badgeStyle="outline">
                #indexing
              </Badge>
            </div>
            <div
              style={{
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
                marginTop: '0.5rem',
              }}
            >
              Contains 4 conversations, 12 references.
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%' }}
              onClick={() =>
                toast.info(
                  'Project workspace navigation will be built in Phase 6.',
                  'Research Workspace',
                )
              }
            >
              Open Project Workspace
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--wb-radius-full)',
                    backgroundColor: 'var(--wb-color-success)',
                  }}
                />
                <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>WorkBench Core</CardTitle>
              </div>
              <Badge variant="success">Foundation</Badge>
            </div>
            <CardDescription>Product and architecture development for WorkBench</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="neutral" badgeStyle="outline">
                #phases
              </Badge>
              <Badge variant="neutral" badgeStyle="outline">
                #design-system
              </Badge>
            </div>
            <div
              style={{
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
                marginTop: '0.5rem',
              }}
            >
              Phase 0–32 roadmap execution tracking.
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%' }}
              onClick={() =>
                toast.info(
                  'Project workspace navigation will be built in Phase 6.',
                  'WorkBench Core',
                )
              }
            >
              Open Project Workspace
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

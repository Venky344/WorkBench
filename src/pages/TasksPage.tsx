import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Checkbox,
} from '@/components/ui';
import { Plus } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const TasksPage: React.FC = () => {
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
            Tasks
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Actionable work items bidirectionally connected to conversations, decisions, files, and
            snippets.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() =>
            toast.info(
              'Task management and entity linking will be implemented in Phase 10.',
              'Tasks Module',
            )
          }
        >
          New Task
        </Button>
      </div>

      {/* Task List Cards */}
      <Card variant="default">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>Pending Work Items</CardTitle>
            <Badge variant="primary" dot>
              8 Open Tasks
            </Badge>
          </div>
          <CardDescription>Tasks organized across active projects</CardDescription>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
            <Checkbox
              label="Implement WebSocket auth handshake with HMAC signatures"
              helperText="Linked to Decision: 'Use WebSocket for Live Bidding' • CricAuction"
            />
            <Badge variant="primary">High Priority</Badge>
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
            <Checkbox
              label="Benchmark tokenization performance on 10,000 mock chat records"
              helperText="Linked to Chat: 'Local-First Indexing Strategy' • Deep Research"
            />
            <Badge variant="neutral">Normal</Badge>
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
            <Checkbox
              defaultChecked
              label="Complete Phase 2 WorkBench Design System specification"
              helperText="Linked to WorkBench Core"
            />
            <Badge variant="success">Completed</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
} from '@/components/ui';
import { Inbox, Trash2, FolderPlus } from 'lucide-react';
import { toast } from '@/stores/toast.store';
import { useAppStore } from '@/stores/app.store';

export const InboxPage: React.FC = () => {
  const { setQuickCaptureOpen } = useAppStore();

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
            Inbox Staging Area
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Temporary staging buffer for captured notes, web links, and unassigned imports awaiting
            triage.
          </p>
        </div>

        <Button variant="primary" onClick={() => setQuickCaptureOpen(true)}>
          Quick Capture
        </Button>
      </div>

      {/* Staged Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Card variant="default">
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={18} color="var(--wb-color-warning)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  Perplexity Research: Web Worker Threading
                </CardTitle>
              </div>
              <Badge variant="warning" dot>
                Staged
              </Badge>
            </div>
            <CardDescription>
              Captured via browser extension snippet. Summary of offloading full-text tokenization
              to Web Workers.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: '0.25rem' }}>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Captured 2 hours ago • Source: Perplexity
            </span>
          </CardContent>
          <CardFooter style={{ justifyContent: 'space-between' }}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => toast.error('Item discarded from inbox')}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FolderPlus size={14} />}
              onClick={() =>
                toast.info(
                  'Inbox triage and routing engine will be built in Phase 17.',
                  'Inbox Module',
                )
              }
            >
              Move to Project
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={18} color="var(--wb-color-warning)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  Code Snippet: Zod Schema Parser
                </CardTitle>
              </div>
              <Badge variant="warning" dot>
                Staged
              </Badge>
            </div>
            <CardDescription>
              TypeScript AST validation snippet for normalizing external JSON export files.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: '0.25rem' }}>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Captured yesterday • Manual Quick Capture
            </span>
          </CardContent>
          <CardFooter style={{ justifyContent: 'space-between' }}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => toast.error('Item discarded from inbox')}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FolderPlus size={14} />}
              onClick={() =>
                toast.info(
                  'Inbox triage and routing engine will be built in Phase 17.',
                  'Inbox Module',
                )
              }
            >
              Move to Project
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

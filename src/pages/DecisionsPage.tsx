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
import { GitCommit, Plus } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const DecisionsPage: React.FC = () => {
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
            Decision Log
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Structured architectural, design, and technical decision records capturing rationale and
            context.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() =>
            toast.info(
              'Decision logging and context linking will be built in Phase 10.',
              'Decisions Module',
            )
          }
        >
          Record Decision
        </Button>
      </div>

      {/* Decision Records */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Card variant="default">
          <CardHeader>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCommit size={18} color="var(--wb-color-success)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>
                  ADR-001: Adopt Local-First Architecture with No Mandatory LLM
                </CardTitle>
              </div>
              <Badge variant="success" dot>
                Accepted
              </Badge>
            </div>
            <CardDescription>Project: WorkBench Core • Decided on 2026-09-27</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                margin: 0,
              }}
            >
              <strong>Context & Rationale:</strong> WorkBench is an organizer above AI platforms
              rather than an AI generator. The core application must function completely offline and
              remain lightweight.
            </p>
          </CardContent>
          <CardFooter style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Linked to Product Contract & Phase 0 Roadmap
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info(
                  'Decision detail viewer will be implemented in Phase 10.',
                  'Decision Log',
                )
              }
            >
              View Full Record
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCommit size={18} color="var(--wb-color-success)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-lg)' }}>
                  ADR-002: Use WebSocket Protocol for Real-Time Bidding Feed
                </CardTitle>
              </div>
              <Badge variant="success" dot>
                Accepted
              </Badge>
            </div>
            <CardDescription>Project: CricAuction • Decided on 2026-09-26</CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                margin: 0,
              }}
            >
              <strong>Context & Rationale:</strong> HTTP long-polling introduces unacceptable
              latency spikes during rapid auction bidding. WebSockets provide sub-50ms duplex
              streaming.
            </p>
          </CardContent>
          <CardFooter style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Linked to Conversation: 'CricHeroes Authentication Handshake'
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info(
                  'Decision detail viewer will be implemented in Phase 10.',
                  'Decision Log',
                )
              }
            >
              View Full Record
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

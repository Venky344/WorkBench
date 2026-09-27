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
import { MessageSquareQuote, Search, Upload, ExternalLink } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const ChatsPage: React.FC = () => {
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
            Conversations
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Normalized multi-source conversation records imported from ChatGPT, Claude, Gemini, and
            Perplexity.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Upload size={16} />}
          onClick={() =>
            toast.info(
              'Universal Import Engine will be implemented in Phase 15 & 16.',
              'Import Hub',
            )
          }
        >
          Import Conversation
        </Button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Search messages, prompts, or code snippets..."
            leftIcon={<Search size={14} />}
          />
        </div>
        <Badge variant="primary" dot>
          12 Imported
        </Badge>
        <Badge variant="neutral">3 Pinned</Badge>
      </div>

      {/* Conversation List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Card variant="default">
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
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
                <MessageSquareQuote size={18} color="var(--wb-color-accent)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  CricHeroes Authentication Handshake
                </CardTitle>
                <Badge variant="info">ChatGPT</Badge>
              </div>
              <Badge variant="neutral" badgeStyle="outline">
                Project: CricAuction
              </Badge>
            </div>
            <CardDescription>
              Discussion on HMAC SHA-256 webhook signatures and auth retry strategies.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: '0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
              }}
            >
              <span>18 Messages</span>
              <span>•</span>
              <span>Imported 2 days ago</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ExternalLink size={12} /> Source URL Preserved
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info('Conversation viewer will be implemented in Phase 7.', 'Chat Viewer')
              }
            >
              Open Conversation Record
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
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
                <MessageSquareQuote size={18} color="var(--wb-color-primary)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  Local-First Relational Indexing Strategy
                </CardTitle>
                <Badge variant="primary">Claude</Badge>
              </div>
              <Badge variant="neutral" badgeStyle="outline">
                Project: Deep Research
              </Badge>
            </div>
            <CardDescription>
              Comparison of SQLite FTS5 vs. in-memory inverted tokenizers for fast sub-50ms search.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: '0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
              }}
            >
              <span>24 Messages</span>
              <span>•</span>
              <span>Imported yesterday</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ExternalLink size={12} /> Claude Shared Session
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info('Conversation viewer will be implemented in Phase 7.', 'Chat Viewer')
              }
            >
              Open Conversation Record
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

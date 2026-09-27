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
import { Plus, ExternalLink, FileCode } from 'lucide-react';
import { toast } from '@/stores/toast.store';

export const ResourcesPage: React.FC = () => {
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
            Resources & Reference Links
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Useful external documentation, APIs, code repositories, PDFs, and bookmarks.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() =>
            toast.info('Resource management will be built in Phase 9.', 'Resources Module')
          }
        >
          Add Resource
        </Button>
      </div>

      {/* Resource Cards */}
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
                <ExternalLink size={18} color="var(--wb-color-primary)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  CricHeroes API Docs
                </CardTitle>
              </div>
              <Badge variant="neutral">Documentation</Badge>
            </div>
            <CardDescription>Live match scoring API and webhook specification</CardDescription>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Associated with Project: CricAuction
            </span>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%' }}
              rightIcon={<ExternalLink size={14} />}
              onClick={() => window.open('https://cricheroes.com', '_blank')}
            >
              Open External Link
            </Button>
          </CardFooter>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCode size={18} color="var(--wb-color-accent)" />
                <CardTitle style={{ fontSize: 'var(--wb-text-base)' }}>
                  Fast Tokenizer Benchmark
                </CardTitle>
              </div>
              <Badge variant="neutral">Code Reference</Badge>
            </div>
            <CardDescription>Inverted indexing performance scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              Associated with Project: Deep Research
            </span>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%' }}
              onClick={() => toast.info('File viewer will be implemented in Phase 9.', 'Resources')}
            >
              View Reference Code
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

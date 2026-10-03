import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Dialog,
  DialogFooter,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { CodeSnippet, Tag } from '@/domain/entities';
import { toast } from '@/stores/toast.store';
import { Code, Copy, Check, Edit2, Trash2 } from 'lucide-react';

export interface CodeSnippetCardProps {
  readonly snippet: CodeSnippet;
  readonly tags?: readonly Tag[];
  readonly onEdit: (snippet: CodeSnippet) => void;
  readonly onDelete: (snippet: CodeSnippet) => void;
  readonly isReadOnly?: boolean;
}

export const CodeSnippetCard: React.FC<CodeSnippetCardProps> = ({
  snippet,
  tags = [],
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const snippetTags = tags.filter((t) => snippet.tags && snippet.tags.includes(t.id));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success('Snippet copied to clipboard.', 'Copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code to clipboard.', 'Copy Error');
    }
  };

  // Preview code up to 6 lines
  const codeLines = snippet.code.split('\n').slice(0, 6).join('\n');
  const hasMoreLines = snippet.code.split('\n').length > 6;

  return (
    <>
      <Card
        variant="default"
        className="wb-code-snippet-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all var(--wb-duration-fast) ease',
        }}
      >
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <Code size={18} color="var(--wb-color-primary)" style={{ flexShrink: 0 }} />
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={snippet.title || snippet.filename || 'Code Snippet'}
              >
                {snippet.title || snippet.filename || 'Untitled Snippet'}
              </CardTitle>
            </div>

            <Badge variant="neutral" style={{ flexShrink: 0, fontSize: '10px' }}>
              {snippet.language.toUpperCase()}
            </Badge>
          </div>

          {snippet.description && (
            <CardDescription style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.375rem' }}>
              {snippet.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Formatted Code Block (Non-executable) */}
          <div
            style={{
              position: 'relative',
              backgroundColor: 'var(--wb-color-bg-code, #18181b)',
              borderRadius: 'var(--wb-radius-md)',
              padding: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <pre
              style={{
                margin: 0,
                color: 'var(--wb-color-fg-code, #f4f4f5)',
                fontSize: '11px',
                fontFamily: 'var(--wb-font-mono, monospace)',
                lineHeight: 1.4,
                overflowX: 'auto',
                whiteSpace: 'pre',
              }}
            >
              <code>{codeLines}</code>
            </pre>
            {hasMoreLines && (
              <div
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '0.375rem',
                  fontFamily: 'var(--wb-font-mono, monospace)',
                }}
              >
                + {snippet.code.split('\n').length - 6} more lines
              </div>
            )}
          </div>

          {snippetTags.length > 0 && (
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.75rem' }}
            >
              {snippetTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: '11px',
              color: 'var(--wb-color-fg-subtle)',
              marginTop: '0.625rem',
            }}
          >
            Updated {new Date(snippet.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>

        <CardFooter
          style={{ borderTop: '1px solid var(--wb-color-border-subtle)', paddingTop: '0.5rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                copied ? <Check size={12} color="var(--wb-color-success)" /> : <Copy size={12} />
              }
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy Code'}
            </Button>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(snippet)}
                  aria-label={`Edit ${snippet.title || 'snippet'}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${snippet.title || 'snippet'}`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Code Snippet?"
        description="Are you sure you want to delete this code snippet? This action cannot be undone."
        maxWidth="450px"
      >
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowDeleteConfirm(false);
              onDelete(snippet);
            }}
          >
            Delete Snippet
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

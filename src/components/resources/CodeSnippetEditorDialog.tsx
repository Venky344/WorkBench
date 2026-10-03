import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea, Select } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useCodeSnippetService } from '@/app/providers';
import { CodeSnippet, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';

const COMMON_LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'plaintext', label: 'Plain Text' },
];

export interface CodeSnippetEditorDialogProps {
  readonly snippet?: CodeSnippet | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onSnippetSaved: (snippet: CodeSnippet) => void;
}

export const CodeSnippetEditorDialog: React.FC<CodeSnippetEditorDialogProps> = ({
  snippet,
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onSnippetSaved,
}) => {
  const snippetService = useCodeSnippetService();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title || '');
      setLanguage(snippet.language || 'typescript');
      setCode(snippet.code);
      setFilename(snippet.filename || '');
      setDescription(snippet.description || '');
      setSelectedTagIds(snippet.tags || []);
    } else {
      setTitle('');
      setLanguage('typescript');
      setCode('');
      setFilename('');
      setDescription('');
      setSelectedTagIds([]);
    }
  }, [snippet, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSaving(true);
    try {
      if (snippet) {
        const updated = await snippetService.updateCodeSnippet(snippet.id, {
          title: title.trim() || undefined,
          language,
          code,
          filename: filename.trim() || undefined,
          description: description.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(
          `Code snippet "${updated.title || updated.filename || 'Snippet'}" updated.`,
          'Snippet Saved',
        );
        onSnippetSaved(updated);
      } else {
        const created = await snippetService.createCodeSnippet({
          workspaceId,
          projectId,
          title: title.trim() || undefined,
          language,
          code,
          filename: filename.trim() || undefined,
          description: description.trim() || undefined,
          tags: selectedTagIds,
        });
        toast.success(`Code snippet added.`, 'Snippet Created');
        onSnippetSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save code snippet';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={snippet ? 'Edit Code Snippet' : 'New Code Snippet'}
      description={
        snippet
          ? 'Update code contents, language metadata, or annotations.'
          : 'Save a reusable code snippet or configuration block.'
      }
      maxWidth="750px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Snippet Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Database Connection Helper"
            />

            <Select
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={COMMON_LANGUAGES}
            />

            <Input
              label="Filename (Optional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="db.ts"
            />
          </div>

          <Textarea
            label="Code Content"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste or write your code snippet here..."
            rows={12}
            required
            style={{
              fontFamily: 'var(--wb-font-mono, monospace)',
              fontSize: 'var(--wb-text-xs)',
              lineHeight: 1.5,
              tabSize: 2,
            }}
          />

          <Textarea
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explanation or usage notes..."
            rows={2}
          />

          <TagPicker
            workspaceId={workspaceId}
            selectedTagIds={selectedTagIds}
            onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
            label="Tags (Optional)"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!code.trim() || isSaving}
          >
            {snippet ? 'Save Changes' : 'Create Snippet'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

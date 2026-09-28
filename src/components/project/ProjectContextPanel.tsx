import React, { useState } from 'react';
import { Project } from '@/domain/entities';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea } from '@/components/ui';
import { BookOpen, Edit3, Check, X, Sparkles } from 'lucide-react';
import { useProjectService } from '@/app/providers';
import { toast } from '@/stores/toast.store';

export interface ProjectContextPanelProps {
  readonly project: Project;
  readonly onProjectUpdated: (updated: Project) => void;
}

export const ProjectContextPanel: React.FC<ProjectContextPanelProps> = ({
  project,
  onProjectUpdated,
}) => {
  const projectService = useProjectService();
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState(project.instructions ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await projectService.updateProject(project.id, {
        instructions: instructions.trim() || undefined,
      });
      onProjectUpdated(updated);
      setIsEditing(false);
      toast.success('Project context and instructions saved.', 'Context Updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save context';
      toast.error(msg, 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInstructions(project.instructions ?? '');
    setIsEditing(false);
  };

  return (
    <Card variant="default" className="wb-project-context-panel">
      <CardHeader
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--wb-color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-surface-active)',
              color: 'var(--wb-color-primary)',
            }}
          >
            <BookOpen size={16} />
          </div>
          <div>
            <CardTitle style={{ fontSize: 'var(--wb-text-base)', margin: 0 }}>
              Project Context & Guidelines
            </CardTitle>
          </div>
        </div>

        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 size={14} />}
            onClick={() => {
              setInstructions(project.instructions ?? '');
              setIsEditing(true);
            }}
          >
            {project.instructions ? 'Edit Context' : 'Add Guidelines'}
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<X size={14} />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent style={{ paddingTop: '1rem' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Textarea
              id="project-context-editor"
              rows={6}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Document architectural guidelines, technology stack, conventions, and context for this workspace..."
              style={{ fontFamily: 'inherit', fontSize: 'var(--wb-text-sm)' }}
              autoFocus
            />
            <p
              style={{
                margin: 0,
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
              }}
            >
              Project context is stored locally with this project and serves as reference guidelines
              for all child activities.
            </p>
          </div>
        ) : project.instructions ? (
          <div
            style={{
              fontSize: 'var(--wb-text-sm)',
              color: 'var(--wb-color-fg)',
              lineHeight: 'var(--wb-leading-relaxed)',
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--wb-radius-md)',
              border: '1px solid var(--wb-color-border-subtle)',
            }}
          >
            {project.instructions}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              color: 'var(--wb-color-fg-muted)',
              fontSize: 'var(--wb-text-sm)',
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--wb-color-fg-subtle)', flexShrink: 0 }} />
            <span>
              No project instructions or context set. Add architectural notes, rules, or technology
              conventions to document this workspace.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

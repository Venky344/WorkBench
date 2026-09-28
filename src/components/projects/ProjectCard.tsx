import React from 'react';
import { Project } from '@/domain/entities';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
} from '@/components/ui';
import { MoreVertical, Star, FolderOpen, Edit3, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { getProjectColorVar, renderProjectIcon } from './project-theme';

export interface ProjectCardProps {
  readonly project: Project;
  readonly onOpen: (project: Project) => void;
  readonly onEdit: (project: Project) => void;
  readonly onTogglePin: (project: Project) => void;
  readonly onArchiveToggle: (project: Project) => void;
  readonly onDelete: (project: Project) => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const timestamp = Date.parse(isoString);
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  onEdit,
  onTogglePin,
  onArchiveToggle,
  onDelete,
}) => {
  const colorVar = getProjectColorVar(project.color);

  return (
    <Card
      variant="default"
      className="wb-project-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all var(--wb-duration-normal) var(--wb-ease-default)',
        position: 'relative',
        opacity: project.isArchived ? 0.75 : 1,
        borderLeft: `4px solid ${colorVar}`,
      }}
    >
      <CardHeader style={{ paddingBottom: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Icon & Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--wb-radius-md)',
                backgroundColor: 'var(--wb-color-surface-active)',
                color: colorVar,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {renderProjectIcon(project.icon, 18)}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <CardTitle
                style={{
                  fontSize: 'var(--wb-text-base)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(project)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    color: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  aria-label={`Open project ${project.name}`}
                >
                  {project.name}
                </button>
              </CardTitle>
            </div>
          </div>

          {/* Quick Actions (Pin + Dropdown Menu) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tooltip content={project.isPinned ? 'Unpin project' : 'Pin project'}>
              <Button
                variant="ghost"
                size="sm"
                aria-label={project.isPinned ? 'Unpin project' : 'Pin project'}
                onClick={() => onTogglePin(project)}
                style={{
                  padding: '0.25rem',
                  height: 'auto',
                  color: project.isPinned ? 'var(--wb-color-warning)' : 'var(--wb-color-fg-subtle)',
                }}
              >
                <Star
                  size={15}
                  fill={project.isPinned ? 'var(--wb-color-warning)' : 'none'}
                  strokeWidth={2}
                />
              </Button>
            </Tooltip>

            <DropdownMenu
              align="right"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Project options for ${project.name}`}
                  style={{ padding: '0.25rem', height: 'auto', color: 'var(--wb-color-fg-muted)' }}
                >
                  <MoreVertical size={16} />
                </Button>
              }
            >
              <DropdownMenuItem icon={<FolderOpen size={14} />} onClick={() => onOpen(project)}>
                Open Project
              </DropdownMenuItem>

              <DropdownMenuItem icon={<Edit3 size={14} />} onClick={() => onEdit(project)}>
                Edit Metadata
              </DropdownMenuItem>

              <DropdownMenuItem icon={<Star size={14} />} onClick={() => onTogglePin(project)}>
                {project.isPinned ? 'Unpin from Top' : 'Pin to Top'}
              </DropdownMenuItem>

              <DropdownMenuItem
                icon={project.isArchived ? <RefreshCw size={14} /> : <Archive size={14} />}
                onClick={() => onArchiveToggle(project)}
              >
                {project.isArchived ? 'Restore Project' : 'Archive Project'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                destructive
                icon={<Trash2 size={14} />}
                onClick={() => onDelete(project)}
              >
                Delete Project...
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>

        {project.description && (
          <CardDescription
            style={{
              marginTop: '0.5rem',
              fontSize: 'var(--wb-text-xs)',
              lineHeight: 'var(--wb-leading-relaxed)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent style={{ paddingBottom: '0.5rem', paddingTop: 0 }}>
        {project.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {project.tags.map((tag) => (
              <Badge key={tag} variant="neutral" badgeStyle="subtle">
                #{tag.replace(/^#/, '')}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--wb-color-border-subtle)',
          paddingTop: '0.625rem',
          paddingBottom: '0.625rem',
          fontSize: 'var(--wb-text-xs)',
          color: 'var(--wb-color-fg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {project.isArchived ? (
            <Badge variant="warning" badgeStyle="subtle">
              Archived
            </Badge>
          ) : project.isPinned ? (
            <Badge variant="warning" badgeStyle="outline">
              Pinned
            </Badge>
          ) : (
            <Badge variant="neutral" badgeStyle="subtle">
              Active
            </Badge>
          )}
          <span>Updated {formatRelativeTime(project.updatedAt)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(project)}
          style={{ fontSize: 'var(--wb-text-xs)', padding: '0.25rem 0.625rem' }}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  );
};

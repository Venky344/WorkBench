import React from 'react';
import { EntityType, RelationshipType } from '@/domain/entities';
import { RelationshipOrigin } from '@/domain/brain';
import {
  FolderKanban,
  MessageSquare,
  MessageSquareQuote,
  FileText,
  StickyNote,
  BookMarked,
  Bookmark,
  Code2,
  CheckSquare,
  GitCommit,
  Tag as TagIcon,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const getEntityTypeIcon = (entityType: EntityType, size = 16): React.ReactNode => {
  switch (entityType) {
    case 'project':
      return <FolderKanban size={size} />;
    case 'chat':
      return <MessageSquare size={size} />;
    case 'chat_group':
      return <MessageSquareQuote size={size} />;
    case 'file':
      return <FileText size={size} />;
    case 'note':
      return <StickyNote size={size} />;
    case 'link':
      return <ExternalLink size={size} />;
    case 'bookmark':
      return <Bookmark size={size} />;
    case 'reference':
      return <BookMarked size={size} />;
    case 'code_snippet':
      return <Code2 size={size} />;
    case 'task':
      return <CheckSquare size={size} />;
    case 'decision':
      return <GitCommit size={size} />;
    case 'tag':
      return <TagIcon size={size} />;
    default:
      return <HelpCircle size={size} />;
  }
};

export const getEntityTypeLabel = (entityType: EntityType): string => {
  switch (entityType) {
    case 'project':
      return 'Project';
    case 'chat':
      return 'Chat';
    case 'chat_group':
      return 'Chat Group';
    case 'file':
      return 'File';
    case 'note':
      return 'Note';
    case 'link':
      return 'Link';
    case 'bookmark':
      return 'Bookmark';
    case 'reference':
      return 'Reference';
    case 'code_snippet':
      return 'Code Snippet';
    case 'task':
      return 'Task';
    case 'decision':
      return 'Decision';
    case 'tag':
      return 'Tag';
    default:
      return entityType;
  }
};

export const getRelationshipTypeLabel = (relType: RelationshipType): string => {
  switch (relType) {
    case 'relates_to':
      return 'Relates To';
    case 'references':
      return 'References';
    case 'implements':
      return 'Implements';
    case 'documents':
      return 'Documents';
    case 'supersedes':
      return 'Supersedes';
    case 'derived_from':
      return 'Derived From';
    case 'contains':
      return 'Contains';
    default:
      return relType;
  }
};

export const getRelationshipTypeBadgeVariant = (
  relType: RelationshipType,
): 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' => {
  switch (relType) {
    case 'implements':
      return 'success';
    case 'documents':
      return 'info';
    case 'supersedes':
      return 'warning';
    case 'references':
      return 'primary';
    case 'derived_from':
      return 'info';
    case 'contains':
      return 'neutral';
    case 'relates_to':
    default:
      return 'neutral';
  }
};

export const getOriginBadgeVariant = (
  origin: RelationshipOrigin,
): 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' => {
  switch (origin) {
    case 'explicit':
      return 'primary';
    case 'shared_tags':
      return 'info';
    case 'reference':
      return 'success';
    case 'project_membership':
    default:
      return 'neutral';
  }
};

export const getOriginLabel = (origin: RelationshipOrigin): string => {
  switch (origin) {
    case 'explicit':
      return 'Explicit Link';
    case 'shared_tags':
      return 'Shared Tag';
    case 'reference':
      return 'Reference';
    case 'project_membership':
      return 'Same Project';
    default:
      return origin;
  }
};

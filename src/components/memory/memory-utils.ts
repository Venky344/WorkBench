import React from 'react';
import {
  Lightbulb,
  Target,
  ShieldAlert,
  Heart,
  GitCommit,
  BookmarkCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { MemoryType, MemoryImportance, MemoryStatus } from '@/domain/entities';

export interface MemoryTypeInfo {
  readonly label: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string; size?: number | string }>;
  readonly color: string;
}

export const MEMORY_TYPE_MAP: Record<MemoryType, MemoryTypeInfo> = {
  fact: {
    label: 'Fact',
    description: 'Verified information or technical reality about the project',
    icon: Lightbulb,
    color: 'var(--color-info, #3b82f6)',
  },
  goal: {
    label: 'Goal',
    description: 'Target outcome, milestone, or success criteria',
    icon: Target,
    color: 'var(--color-success, #10b981)',
  },
  constraint: {
    label: 'Constraint',
    description: 'Technical, architectural, resource, or business limitation',
    icon: ShieldAlert,
    color: 'var(--color-warning, #f59e0b)',
  },
  preference: {
    label: 'Preference',
    description: 'Team or stakeholder convention, guideline, or preference',
    icon: Heart,
    color: 'var(--color-accent, #8b5cf6)',
  },
  decision: {
    label: 'Decision',
    description: 'Key architectural or design choice preserved for context',
    icon: GitCommit,
    color: 'var(--color-primary, #6366f1)',
  },
  key_context: {
    label: 'Key Context',
    description: 'High-level project framing or critical orientation context',
    icon: BookmarkCheck,
    color: 'var(--color-indigo, #4f46e5)',
  },
  note: {
    label: 'Note',
    description: 'General deliberate memory or observation',
    icon: FileText,
    color: 'var(--color-text-secondary, #64748b)',
  },
};

export const getMemoryTypeInfo = (type: MemoryType): MemoryTypeInfo => {
  return (
    MEMORY_TYPE_MAP[type] || {
      label: type,
      description: 'Project memory item',
      icon: HelpCircle,
      color: 'var(--color-text-muted)',
    }
  );
};

export const getImportanceBadgeVariant = (
  importance: MemoryImportance,
): 'neutral' | 'info' | 'warning' | 'destructive' => {
  switch (importance) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
    default:
      return 'neutral';
  }
};

export const getStatusBadgeVariant = (status: MemoryStatus): 'success' | 'neutral' => {
  return status === 'active' ? 'success' : 'neutral';
};

export { isMemoryDueForReview } from '@/domain/memory';

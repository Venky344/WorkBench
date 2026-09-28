import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

export interface WorkspaceSettings {
  readonly theme?: 'system' | 'light' | 'dark';
  readonly defaultProjectTemplateId?: EntityId;
  readonly quickCaptureShortcut?: string;
  readonly autoSaveIntervalMs?: number;
}

/**
 * Root container representing the local WorkBench workspace.
 */
export interface Workspace extends BaseEntity {
  readonly name: string;
  readonly description?: string;
  readonly activeProjectId?: EntityId;
  readonly settings?: WorkspaceSettings;
}

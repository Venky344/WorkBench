import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';

/**
 * Primary organizational container within the WorkBench workspace.
 */
export interface Project extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly color?: string;
  readonly icon?: string;
  readonly instructions?: string;
  readonly isArchived: boolean;
  readonly archivedAt?: ISOTimestamp;
  readonly isPinned: boolean;
  readonly order: number;
  readonly tags: readonly string[];
  readonly customMetadata?: Readonly<Record<string, string | number | boolean>>;
}

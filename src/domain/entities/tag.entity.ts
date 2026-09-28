import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

/**
 * Universal tag definition for organization and cross-entity filtering.
 */
export interface Tag extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly name: string;
  readonly normalizedName: string;
  readonly color?: string;
  readonly description?: string;
}

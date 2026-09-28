import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

/**
 * Local workspace user profile representation.
 * Designed for local-first single-user operation with future multi-profile capability.
 */
export interface User extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly displayName: string;
  readonly email?: string;
  readonly avatarUrl?: string;
  readonly isLocal: boolean;
}

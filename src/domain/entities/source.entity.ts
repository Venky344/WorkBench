import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';
import { SourceProvider } from '../value-objects/provenance';

/**
 * Top-level representation of an external source (AI platform, export bundle, URL, etc.).
 */
export interface Source extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly provider: SourceProvider;
  readonly displayName: string;
  readonly externalId?: string;
  readonly sourceUrl?: string;
  readonly author?: string;
  readonly importedAt: ISOTimestamp;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

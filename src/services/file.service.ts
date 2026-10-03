import { BaseService } from './base.service';
import { IFileRepository } from '@/repositories/contracts/entity-repositories.contract';
import { IFileStorage } from '@/persistence/file-storage/file-storage.interface';
import { FileEntity } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface UploadFileInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly name?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly file: {
    readonly name: string;
    readonly size: number;
    readonly type?: string;
    readonly bytes: Blob | Uint8Array | ArrayBuffer;
  };
}

export interface UpdateFileMetadataInput {
  readonly name?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export class FileService extends BaseService {
  constructor(
    private readonly fileRepo: IFileRepository,
    private readonly fileStorage: IFileStorage,
  ) {
    super('FileService');
  }

  /**
   * Uploads and stores a local file, saving both binary bytes and metadata record.
   * Handles failure transactionally: cleans up stored bytes if metadata persistence fails.
   */
  async uploadFile(input: UploadFileInput): Promise<FileEntity> {
    const rawName = input.name || input.file.name;
    const name = validateNonEmptyString(rawName, 'File name');
    const originalFilename = input.file.name || name;
    const mimeType = input.file.type || 'application/octet-stream';
    const sizeBytes = input.file.size;

    if (sizeBytes < 0) {
      throw new ValidationError('File size cannot be negative');
    }

    const storageKey = `file_${generateEntityId()}`;

    // 1. Store binary bytes first
    try {
      await this.fileStorage.saveFile(storageKey, input.file.bytes, mimeType);
    } catch (error) {
      this.log.error(`Failed to store physical file bytes for "${name}"`, error);
      throw error;
    }

    // 2. Persist FileEntity metadata
    const now = createCurrentTimestamp();
    const entity: FileEntity = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      name: name.trim(),
      originalFilename: originalFilename.trim(),
      mimeType,
      sizeBytes,
      pathOrReference: storageKey,
      description: input.description?.trim() || undefined,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const saved = await this.fileRepo.save(entity);
      this.log.info(
        `File metadata persisted: "${saved.name}" (${saved.id}) in project ${saved.projectId}`,
      );
      return saved;
    } catch (error) {
      this.log.error(
        `Failed to save FileEntity metadata for "${name}". Rolling back stored bytes...`,
        error,
      );
      // Attempt cleanup
      try {
        await this.fileStorage.deleteFile(storageKey);
      } catch (cleanupError) {
        this.log.warn(`Orphan blob cleanup failed for key "${storageKey}"`, cleanupError);
      }
      throw error;
    }
  }

  async getFile(id: EntityId): Promise<FileEntity | null> {
    return this.fileRepo.findById(id);
  }

  async getFileOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<FileEntity> {
    const file = await this.fileRepo.findById(id);
    if (!file) {
      throw new NotFoundError('File', id);
    }
    if (expectedProjectId && file.projectId !== expectedProjectId) {
      throw new ValidationError(
        `File "${id}" belongs to project "${file.projectId}", not "${expectedProjectId}"`,
      );
    }
    return file;
  }

  /**
   * Retrieves binary bytes as a Blob along with file metadata.
   */
  async getFileBlob(
    id: EntityId,
    expectedProjectId?: EntityId,
  ): Promise<{ entity: FileEntity; blob: Blob }> {
    const entity = await this.getFileOrThrow(id, expectedProjectId);
    const storageKey = entity.pathOrReference;
    const blob = await this.fileStorage.readFile(storageKey);

    if (!blob) {
      throw new NotFoundError('File bytes', storageKey);
    }

    return { entity, blob };
  }

  /**
   * Updates file display metadata without mutating storage key or binary content.
   */
  async updateFileMetadata(
    id: EntityId,
    updates: UpdateFileMetadataInput,
    expectedProjectId?: EntityId,
  ): Promise<FileEntity> {
    const existing = await this.getFileOrThrow(id, expectedProjectId);

    let updatedName = existing.name;
    if (updates.name !== undefined) {
      updatedName = validateNonEmptyString(updates.name, 'File name').trim();
    }

    const updated: FileEntity = {
      ...existing,
      name: updatedName,
      description:
        updates.description !== undefined
          ? updates.description.trim() || undefined
          : existing.description,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.fileRepo.save(updated);
    this.log.info(`File metadata updated: "${saved.name}" (${saved.id})`);
    return saved;
  }

  /**
   * Deletes FileEntity metadata and associated binary blob storage.
   * Deletes physical file bytes first to prevent unrecoverable orphan blobs.
   */
  async deleteFile(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.fileRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `File "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    // 1. Delete binary bytes first
    try {
      await this.fileStorage.deleteFile(existing.pathOrReference);
    } catch (error) {
      this.log.error(
        `Failed to delete physical file bytes for storage key "${existing.pathOrReference}"`,
        error,
      );
      throw error;
    }

    // 2. Delete metadata record
    try {
      await this.fileRepo.delete(id);
    } catch (error) {
      this.log.error(`Failed to delete FileEntity metadata "${id}"`, error);
      throw error;
    }

    this.log.info(`File deleted: "${existing.name}" (${existing.id})`);
    return true;
  }

  async listFilesByProject(projectId: EntityId): Promise<readonly FileEntity[]> {
    return this.fileRepo.findByProjectId(projectId);
  }

  async listFilesByWorkspace(workspaceId: EntityId): Promise<readonly FileEntity[]> {
    return this.fileRepo.findByWorkspaceId(workspaceId);
  }

  /**
   * Formats raw bytes into deterministic human-readable string (e.g. 1.2 KB, 4.8 MB).
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1));
    return `${formatted} ${sizes[i]}`;
  }
}

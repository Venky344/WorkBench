import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { FileService } from '@/services/file.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { ValidationError } from '@/utils/errors';

describe('FileService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let fileService: FileService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let workspaceId: EntityId;
  let projectId: EntityId;

  beforeEach(async () => {
    storageEngine = new MemoryStorageEngine();
    storageService = new StorageService(storageEngine);
    await storageService.initialize();

    workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
    projectService = new ProjectService(storageService.projects);
    fileService = new FileService(storageService.files, storageService.fileStorage);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Alpha Project',
    });
    projectId = project.id;
  });

  it('uploads a file, stores binary bytes, and creates metadata entity', async () => {
    const content = 'Technical Architecture Overview';
    const bytes = new TextEncoder().encode(content);

    const file = await fileService.uploadFile({
      workspaceId,
      projectId,
      name: 'Architecture Spec',
      description: 'Main architecture diagram',
      tags: ['spec', 'v1'],
      file: {
        name: 'arch_spec.md',
        size: bytes.byteLength,
        type: 'text/markdown',
        bytes,
      },
    });

    expect(file.id).toBeDefined();
    expect(file.name).toBe('Architecture Spec');
    expect(file.originalFilename).toBe('arch_spec.md');
    expect(file.mimeType).toBe('text/markdown');
    expect(file.sizeBytes).toBe(bytes.byteLength);
    expect(file.pathOrReference).toMatch(/^file_/);
    expect(file.tags).toEqual(['spec', 'v1']);

    // Retrieve metadata
    const retrieved = await fileService.getFileOrThrow(file.id, projectId);
    expect(retrieved.id).toBe(file.id);

    // Retrieve binary blob
    const { blob } = await fileService.getFileBlob(file.id, projectId);
    expect(blob).toBeDefined();
    expect(await blob.text()).toBe(content);
  });

  it('updates file metadata without modifying bytes or original filename', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const file = await fileService.uploadFile({
      workspaceId,
      projectId,
      name: 'Original Name',
      file: {
        name: 'sample.dat',
        size: 3,
        type: 'application/octet-stream',
        bytes,
      },
    });

    const updated = await fileService.updateFileMetadata(
      file.id,
      {
        name: 'Updated Name',
        description: 'Updated Description',
        tags: ['updated-tag'],
      },
      projectId,
    );

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated Description');
    expect(updated.tags).toEqual(['updated-tag']);
    expect(updated.originalFilename).toBe('sample.dat');
    expect(updated.pathOrReference).toBe(file.pathOrReference);
  });

  it('deletes file metadata and its physical stored bytes', async () => {
    const bytes = new TextEncoder().encode('To be deleted');
    const file = await fileService.uploadFile({
      workspaceId,
      projectId,
      name: 'Delete Me',
      file: {
        name: 'temp.txt',
        size: bytes.byteLength,
        type: 'text/plain',
        bytes,
      },
    });

    const deleted = await fileService.deleteFile(file.id, projectId);
    expect(deleted).toBe(true);

    const existsInDb = await fileService.getFile(file.id);
    expect(existsInDb).toBeNull();

    const blobExists = await storageService.fileStorage.fileExists(file.pathOrReference);
    expect(blobExists).toBe(false);

    // Repeated deletion returns false safely
    const secondDelete = await fileService.deleteFile(file.id, projectId);
    expect(secondDelete).toBe(false);
  });

  it('returns false when attempting to delete a non-existent file', async () => {
    const deleted = await fileService.deleteFile('non-existent-file-id', projectId);
    expect(deleted).toBe(false);
  });

  it('rolls back stored physical blob if metadata persistence fails during upload', async () => {
    let capturedStorageKey = '';
    const origSaveFile = storageService.fileStorage.saveFile.bind(storageService.fileStorage);
    storageService.fileStorage.saveFile = async (key, data, mime) => {
      capturedStorageKey = key;
      return origSaveFile(key, data, mime);
    };

    // Make repo save fail
    const origSave = storageService.files.save.bind(storageService.files);
    storageService.files.save = async () => {
      throw new Error('Database disk error');
    };

    await expect(
      fileService.uploadFile({
        workspaceId,
        projectId,
        name: 'Fail Spec',
        file: {
          name: 'fail.txt',
          size: 4,
          type: 'text/plain',
          bytes: new TextEncoder().encode('Fail'),
        },
      }),
    ).rejects.toThrow('Database disk error');

    // Verify the blob was rolled back
    const blobExists = await storageService.fileStorage.fileExists(capturedStorageKey);
    expect(blobExists).toBe(false);

    // Restore
    storageService.files.save = origSave;
  });

  it('preserves metadata and throws if physical blob deletion fails during delete', async () => {
    const bytes = new TextEncoder().encode('Protected');
    const file = await fileService.uploadFile({
      workspaceId,
      projectId,
      name: 'Protected File',
      file: {
        name: 'protected.txt',
        size: bytes.byteLength,
        type: 'text/plain',
        bytes,
      },
    });

    // Make storage delete fail
    const origDelete = storageService.fileStorage.deleteFile.bind(storageService.fileStorage);
    storageService.fileStorage.deleteFile = async () => {
      throw new Error('Storage device locked');
    };

    await expect(fileService.deleteFile(file.id, projectId)).rejects.toThrow(
      'Storage device locked',
    );

    // Metadata must still be present
    const fileInDb = await fileService.getFile(file.id);
    expect(fileInDb).not.toBeNull();

    // Restore
    storageService.fileStorage.deleteFile = origDelete;
  });

  it('enforces project isolation on file operations', async () => {
    const otherProject = await projectService.createProject({
      workspaceId,
      name: 'Beta Project',
    });

    const file = await fileService.uploadFile({
      workspaceId,
      projectId,
      name: 'Alpha Secret File',
      file: {
        name: 'secret.txt',
        size: 10,
        type: 'text/plain',
        bytes: new Uint8Array([1, 2, 3]),
      },
    });

    // Accessing file with wrong projectId must throw ValidationError
    await expect(fileService.getFileOrThrow(file.id, otherProject.id)).rejects.toThrow(
      ValidationError,
    );
    await expect(fileService.getFileBlob(file.id, otherProject.id)).rejects.toThrow(
      ValidationError,
    );
    await expect(
      fileService.updateFileMetadata(file.id, { name: 'Hacked' }, otherProject.id),
    ).rejects.toThrow(ValidationError);
    await expect(fileService.deleteFile(file.id, otherProject.id)).rejects.toThrow(ValidationError);
  });

  it('formats file sizes deterministically', () => {
    expect(FileService.formatFileSize(0)).toBe('0 B');
    expect(FileService.formatFileSize(500)).toBe('500 B');
    expect(FileService.formatFileSize(1024)).toBe('1 KB');
    expect(FileService.formatFileSize(1536)).toBe('1.5 KB');
    expect(FileService.formatFileSize(1048576)).toBe('1 MB');
    expect(FileService.formatFileSize(1073741824)).toBe('1 GB');
  });
});

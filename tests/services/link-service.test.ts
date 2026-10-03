import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { LinkService } from '@/services/link.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { ValidationError } from '@/utils/errors';

describe('LinkService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let linkService: LinkService;
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
    linkService = new LinkService(storageService.links);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Link Project',
    });
    projectId = project.id;
  });

  it('creates and retrieves a link, automatically extracting the domain', async () => {
    const link = await linkService.createLink({
      workspaceId,
      projectId,
      url: 'https://developer.mozilla.org/en-US/docs/Web/API',
      title: 'MDN Web Docs',
      description: 'Web API reference',
      tags: ['web', 'docs'],
    });

    expect(link.id).toBeDefined();
    expect(link.url).toBe('https://developer.mozilla.org/en-US/docs/Web/API');
    expect(link.domain).toBe('developer.mozilla.org');
    expect(link.title).toBe('MDN Web Docs');
    expect(link.tags).toEqual(['web', 'docs']);

    const retrieved = await linkService.getLinkOrThrow(link.id, projectId);
    expect(retrieved.id).toBe(link.id);
  });

  it('rejects invalid or unsafe URL schemes', () => {
    expect(() => LinkService.validateAndParseUrl('javascript:alert(1)')).toThrow(ValidationError);
    expect(() => LinkService.validateAndParseUrl('data:text/html,<h1>Hi</h1>')).toThrow(
      ValidationError,
    );
    expect(() => LinkService.validateAndParseUrl('not a url')).toThrow(ValidationError);
    expect(() => LinkService.validateAndParseUrl('')).toThrow();
  });

  it('updates a link and recomputes domain when URL changes', async () => {
    const link = await linkService.createLink({
      workspaceId,
      projectId,
      url: 'https://react.dev',
      title: 'React',
    });

    const updated = await linkService.updateLink(
      link.id,
      {
        url: 'https://vite.dev',
        title: 'Vite Build Tool',
      },
      projectId,
    );

    expect(updated.url).toBe('https://vite.dev/');
    expect(updated.domain).toBe('vite.dev');
    expect(updated.title).toBe('Vite Build Tool');
  });

  it('deletes a link', async () => {
    const link = await linkService.createLink({
      workspaceId,
      projectId,
      url: 'https://google.com',
      title: 'Google',
    });

    const deleted = await linkService.deleteLink(link.id, projectId);
    expect(deleted).toBe(true);

    expect(await linkService.getLink(link.id)).toBeNull();
  });
});

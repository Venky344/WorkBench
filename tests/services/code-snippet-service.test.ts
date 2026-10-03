import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { CodeSnippetService } from '@/services/code-snippet.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { ValidationError } from '@/utils/errors';

describe('CodeSnippetService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let snippetService: CodeSnippetService;
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
    snippetService = new CodeSnippetService(storageService.codeSnippets);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Snippet Test',
    });
    projectId = project.id;
  });

  it('creates, retrieves, updates, and deletes code snippets', async () => {
    const snippet = await snippetService.createCodeSnippet({
      workspaceId,
      projectId,
      title: 'Database Query Helper',
      language: 'typescript',
      code: 'export function query<T>(sql: string): Promise<T[]> { ... }',
      filename: 'db.ts',
      description: 'Helper function for running typed sql queries',
      tags: ['db', 'sql'],
    });

    expect(snippet.id).toBeDefined();
    expect(snippet.title).toBe('Database Query Helper');
    expect(snippet.language).toBe('typescript');
    expect(snippet.filename).toBe('db.ts');

    const retrieved = await snippetService.getCodeSnippetOrThrow(snippet.id, projectId);
    expect(retrieved.id).toBe(snippet.id);

    const byLang = await snippetService.listByLanguage(projectId, 'typescript');
    expect(byLang.length).toBe(1);

    const updated = await snippetService.updateCodeSnippet(
      snippet.id,
      {
        language: 'ts',
        description: 'Updated description',
      },
      projectId,
    );
    expect(updated.language).toBe('ts');
    expect(updated.description).toBe('Updated description');

    const deleted = await snippetService.deleteCodeSnippet(snippet.id, projectId);
    expect(deleted).toBe(true);
    expect(await snippetService.getCodeSnippet(snippet.id)).toBeNull();
  });

  it('rejects empty code content', async () => {
    await expect(
      snippetService.createCodeSnippet({
        workspaceId,
        projectId,
        language: 'python',
        code: '   ',
      }),
    ).rejects.toThrow(ValidationError);
  });
});

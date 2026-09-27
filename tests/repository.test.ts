import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '@/repositories/base.repository';
import { BaseEntity } from '@/domain/types';
import { NotFoundError } from '@/utils/errors';

interface MockProject extends BaseEntity {
  name: string;
}

describe('InMemoryRepository Abstraction', () => {
  let repository: InMemoryRepository<MockProject>;

  beforeEach(() => {
    repository = new InMemoryRepository<MockProject>('MockProject');
  });

  it('should save and find entity by id', async () => {
    const project: MockProject = {
      id: 'proj-1',
      name: 'Test Project',
      createdAt: '2026-09-27T00:00:00Z',
      updatedAt: '2026-09-27T00:00:00Z',
    };

    await repository.save(project);
    const found = await repository.findById('proj-1');

    expect(found).toEqual(project);
    expect(await repository.exists('proj-1')).toBe(true);
  });

  it('should return null when entity not found', async () => {
    const found = await repository.findById('non-existent');
    expect(found).toBeNull();
    expect(await repository.exists('non-existent')).toBe(false);
  });

  it('should throw NotFoundError on getOrThrow when entity missing', async () => {
    await expect(repository.getOrThrow('missing-id')).rejects.toThrow(NotFoundError);
  });

  it('should delete entity', async () => {
    const project: MockProject = {
      id: 'proj-2',
      name: 'To Delete',
      createdAt: '2026-09-27T00:00:00Z',
      updatedAt: '2026-09-27T00:00:00Z',
    };

    await repository.save(project);
    expect(await repository.delete('proj-2')).toBe(true);
    expect(await repository.findById('proj-2')).toBeNull();
  });
});

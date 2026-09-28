import { describe, it, expect } from 'vitest';
import { EntitySerializer } from '@/persistence/serializers/entity.serializer';
import { Project, Chat, BaseEntity } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { SerializationError } from '@/utils/errors';

describe('EntitySerializer', () => {
  it('serializes a domain entity into a plain JSON record', () => {
    const project: Project = {
      id: generateEntityId(),
      workspaceId: generateEntityId(),
      name: 'Alpha Project',
      slug: 'alpha-project',
      isArchived: false,
      isPinned: true,
      order: 0,
      tags: Object.freeze(['frontend', 'react']),
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    const record = EntitySerializer.serialize(project);

    expect(record.id).toBe(project.id);
    expect(record.name).toBe('Alpha Project');
    expect(record.tags).toEqual(['frontend', 'react']);
  });

  it('deserializes a plain record into an immutable domain entity', () => {
    const raw = {
      id: generateEntityId(),
      workspaceId: generateEntityId(),
      title: 'ChatGPT Discussion',
      isPinned: false,
      isArchived: false,
      messageCount: 5,
      order: 1,
      tags: ['ai', 'design'],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    const entity = EntitySerializer.deserialize<Chat>(raw);

    expect(entity.id).toBe(raw.id);
    expect(entity.title).toBe('ChatGPT Discussion');
    expect(Object.isFrozen(entity)).toBe(true);
  });

  it('throws SerializationError when serializing invalid entity', () => {
    const invalid = {
      id: 'bad-id',
      createdAt: 'invalid-timestamp',
    };

    expect(() => EntitySerializer.serialize(invalid as unknown as BaseEntity)).toThrow(
      SerializationError,
    );
  });

  it('throws SerializationError when deserializing invalid record', () => {
    expect(() => EntitySerializer.deserialize(null)).toThrow(SerializationError);
    expect(() => EntitySerializer.deserialize({ id: 'bad-id' })).toThrow(SerializationError);
  });

  it('handles batch serialization and deserialization', () => {
    const projects: Project[] = [
      {
        id: generateEntityId(),
        workspaceId: generateEntityId(),
        name: 'P1',
        slug: 'p1',
        isArchived: false,
        isPinned: false,
        order: 0,
        tags: [],
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      },
      {
        id: generateEntityId(),
        workspaceId: generateEntityId(),
        name: 'P2',
        slug: 'p2',
        isArchived: false,
        isPinned: false,
        order: 1,
        tags: [],
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      },
    ];

    const records = EntitySerializer.serializeBatch(projects);
    expect(records.length).toBe(2);

    const deserialized = EntitySerializer.deserializeBatch<Project>(records);
    expect(deserialized.length).toBe(2);
    expect(deserialized[0]?.id).toBe(projects[0]?.id);
    expect(deserialized[1]?.id).toBe(projects[1]?.id);
  });
});

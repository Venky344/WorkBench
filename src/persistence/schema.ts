import { DatabaseSchema, StoreSchema } from './storage.interface';

export const WORKBENCH_DB_NAME = 'workbench_local_db';
export const WORKBENCH_DB_VERSION = 1;

export const STORES = {
  WORKSPACES: 'workspaces',
  USERS: 'users',
  PROJECTS: 'projects',
  CHATS: 'chats',
  MESSAGES: 'messages',
  CHAT_GROUPS: 'chat_groups',
  FILES: 'files',
  NOTES: 'notes',
  LINKS: 'links',
  BOOKMARKS: 'bookmarks',
  REFERENCES: 'references',
  CODE_SNIPPETS: 'code_snippets',
  TASKS: 'tasks',
  DECISIONS: 'decisions',
  TAGS: 'tags',
  SOURCES: 'sources',
  RELATIONSHIPS: 'relationships',
  ACTIVITY_EVENTS: 'activity_events',
  INBOX_ITEMS: 'inbox_items',
  AUTOMATIONS: 'automations',
  PROJECT_TEMPLATES: 'project_templates',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export const V1_STORES: readonly StoreSchema[] = [
  {
    name: STORES.WORKSPACES,
    keyPath: 'id',
    indexes: [{ name: 'by_name', keyPath: 'name' }],
  },
  {
    name: STORES.USERS,
    keyPath: 'id',
    indexes: [{ name: 'by_workspaceId', keyPath: 'workspaceId' }],
  },
  {
    name: STORES.PROJECTS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_slug', keyPath: 'slug' },
      { name: 'by_isArchived', keyPath: 'isArchived' },
      { name: 'by_order', keyPath: 'order' },
    ],
  },
  {
    name: STORES.CHATS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_chatGroupId', keyPath: 'chatGroupId' },
      { name: 'by_sourceId', keyPath: 'sourceId' },
      { name: 'by_isArchived', keyPath: 'isArchived' },
      { name: 'by_isPinned', keyPath: 'isPinned' },
    ],
  },
  {
    name: STORES.MESSAGES,
    keyPath: 'id',
    indexes: [
      { name: 'by_chatId', keyPath: 'chatId' },
      { name: 'by_role', keyPath: 'role' },
      { name: 'by_sequenceNumber', keyPath: 'sequenceNumber' },
    ],
  },
  {
    name: STORES.CHAT_GROUPS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_order', keyPath: 'order' },
    ],
  },
  {
    name: STORES.FILES,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_sourceId', keyPath: 'sourceId' },
      { name: 'by_mimeType', keyPath: 'mimeType' },
    ],
  },
  {
    name: STORES.NOTES,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_sourceId', keyPath: 'sourceId' },
      { name: 'by_isPinned', keyPath: 'isPinned' },
    ],
  },
  {
    name: STORES.LINKS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_domain', keyPath: 'domain' },
      { name: 'by_sourceId', keyPath: 'sourceId' },
    ],
  },
  {
    name: STORES.BOOKMARKS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_targetEntityType', keyPath: 'targetEntityType' },
      { name: 'by_targetEntityId', keyPath: 'targetEntityId' },
    ],
  },
  {
    name: STORES.REFERENCES,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_sourceEntityId', keyPath: 'sourceEntityId' },
    ],
  },
  {
    name: STORES.CODE_SNIPPETS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_chatId', keyPath: 'chatId' },
      { name: 'by_language', keyPath: 'language' },
    ],
  },
  {
    name: STORES.TASKS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_priority', keyPath: 'priority' },
      { name: 'by_dueDate', keyPath: 'dueDate' },
    ],
  },
  {
    name: STORES.DECISIONS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_status', keyPath: 'status' },
    ],
  },
  {
    name: STORES.TAGS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_normalizedName', keyPath: 'normalizedName' },
    ],
  },
  {
    name: STORES.SOURCES,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_provider', keyPath: 'provider' },
    ],
  },
  {
    name: STORES.RELATIONSHIPS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_sourceEntityId', keyPath: 'sourceEntityId' },
      { name: 'by_targetEntityId', keyPath: 'targetEntityId' },
      { name: 'by_relationshipType', keyPath: 'relationshipType' },
    ],
  },
  {
    name: STORES.ACTIVITY_EVENTS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_entityId', keyPath: 'entityId' },
      { name: 'by_timestamp', keyPath: 'timestamp' },
    ],
  },
  {
    name: STORES.INBOX_ITEMS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_captureType', keyPath: 'captureType' },
    ],
  },
  {
    name: STORES.AUTOMATIONS,
    keyPath: 'id',
    indexes: [
      { name: 'by_workspaceId', keyPath: 'workspaceId' },
      { name: 'by_projectId', keyPath: 'projectId' },
      { name: 'by_isEnabled', keyPath: 'isEnabled' },
    ],
  },
  {
    name: STORES.PROJECT_TEMPLATES,
    keyPath: 'id',
    indexes: [
      { name: 'by_category', keyPath: 'category' },
      { name: 'by_isBuiltin', keyPath: 'isBuiltin' },
    ],
  },
];

export const CURRENT_DATABASE_SCHEMA: DatabaseSchema = {
  name: WORKBENCH_DB_NAME,
  version: WORKBENCH_DB_VERSION,
  stores: V1_STORES,
};

import { BaseService } from './base.service';
import {
  IWorkspaceRepository,
  IUserRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { Workspace, User } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { EntityId } from '@/types';

export class WorkspaceService extends BaseService {
  private readonly workspaceRepo: IWorkspaceRepository;
  private readonly userRepo: IUserRepository;

  constructor(workspaceRepo: IWorkspaceRepository, userRepo: IUserRepository) {
    super('WorkspaceService');
    this.workspaceRepo = workspaceRepo;
    this.userRepo = userRepo;
  }

  async getOrCreateDefaultWorkspace(): Promise<{ workspace: Workspace; user: User }> {
    let workspace = await this.workspaceRepo.findDefault();
    if (!workspace) {
      const now = createCurrentTimestamp();
      workspace = await this.workspaceRepo.save({
        id: generateEntityId(),
        name: 'My WorkBench',
        description: 'Personal local digital work area',
        createdAt: now,
        updatedAt: now,
        settings: {
          theme: 'system',
          autoSaveIntervalMs: 5000,
        },
      });
      this.log.info(`Created default workspace: ${workspace.id}`);
    }

    const users = await this.userRepo.findByWorkspaceId(workspace.id);
    let user = users[0];
    if (!user) {
      const now = createCurrentTimestamp();
      user = await this.userRepo.save({
        id: generateEntityId(),
        workspaceId: workspace.id,
        displayName: 'Local User',
        isLocal: true,
        createdAt: now,
        updatedAt: now,
      });
      this.log.info(`Created default local user: ${user.id}`);
    }

    return { workspace, user };
  }

  async setActiveProject(workspaceId: EntityId, projectId?: EntityId): Promise<Workspace> {
    const workspace = await this.workspaceRepo.getOrThrow(workspaceId);
    const updated: Workspace = {
      ...workspace,
      activeProjectId: projectId,
      updatedAt: createCurrentTimestamp(),
    };
    return this.workspaceRepo.save(updated);
  }
}

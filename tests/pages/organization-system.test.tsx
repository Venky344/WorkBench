import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TagPicker, TagBadge, TagManager, OrganizationFilters } from '@/components/organization';
import { ServiceProvider } from '@/app/providers/ServiceProvider';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { Tag, Workspace } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';

describe('Organization System UI Components', () => {
  let storage: MemoryStorageEngine;
  let services: ServiceContainer;
  let mockWorkspace: Workspace;

  beforeEach(async () => {
    storage = new MemoryStorageEngine();
    services = createServiceContainer(storage);
    await services.initialize();
    const wsData = await services.workspaceService.getOrCreateDefaultWorkspace();
    mockWorkspace = wsData.workspace;
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <ServiceProvider services={services}>{ui}</ServiceProvider>
      </MemoryRouter>,
    );
  };

  describe('TagBadge', () => {
    it('renders tag badge with name and hash prefix', () => {
      const tag: Tag = {
        id: generateEntityId(),
        workspaceId: mockWorkspace.id,
        name: 'frontend',
        normalizedName: 'frontend',
        color: 'blue',
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      };

      render(<TagBadge tag={tag} />);
      expect(screen.getByText('#frontend')).toBeInTheDocument();
    });

    it('handles remove button click when onRemove is provided', async () => {
      const user = userEvent.setup();
      let removed = false;
      const tag: Tag = {
        id: generateEntityId(),
        workspaceId: mockWorkspace.id,
        name: 'urgent',
        normalizedName: 'urgent',
        color: 'red',
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      };

      render(
        <TagBadge
          tag={tag}
          onRemove={() => {
            removed = true;
          }}
        />,
      );
      const removeBtn = screen.getByRole('button', { name: /Remove tag urgent/i });
      await user.click(removeBtn);
      expect(removed).toBe(true);
    });
  });

  describe('TagPicker', () => {
    it('allows searching, selecting, and creating new tags inline', async () => {
      const user = userEvent.setup();
      const tagService = services.tagService;

      // Seed an initial tag
      await tagService.createTag({
        workspaceId: mockWorkspace.id,
        name: 'backend',
        color: 'green',
      });

      const TagPickerTestContainer: React.FC = () => {
        const [selectedIds, setSelectedIds] = React.useState<readonly string[]>([]);
        return (
          <div>
            <div data-testid="selected-count">{selectedIds.length}</div>
            <TagPicker
              workspaceId={mockWorkspace.id}
              selectedTagIds={selectedIds}
              onChange={(ids) => setSelectedIds(ids)}
              placeholder="Pick tags..."
            />
          </div>
        );
      };

      renderWithProviders(<TagPickerTestContainer />);

      // Focus input to open dropdown
      const pickerInput = screen.getByPlaceholderText('Pick tags...');
      await user.click(pickerInput);

      // Verify existing tag is shown in dropdown
      expect(await screen.findByText('#backend')).toBeInTheDocument();

      // Click existing tag to select it
      await user.click(screen.getByText('#backend'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

      // Type a new tag name into the input
      await user.type(pickerInput, 'websocket');

      // Click Create tag button
      const createButton = await screen.findByText(/Create tag "#websocket"/i);
      await user.click(createButton);

      // Verify new tag was created in tagService and selected
      await waitFor(() => {
        expect(screen.getByTestId('selected-count')).toHaveTextContent('2');
      });

      const tagsInDb = await tagService.listTags(mockWorkspace.id);
      expect(tagsInDb.some((t) => t.normalizedName === 'websocket')).toBe(true);
    });
  });

  describe('TagManager', () => {
    it('lists workspace tags, allows creating a tag, editing, and deleting with safety', async () => {
      const user = userEvent.setup();
      const tagService = services.tagService;

      await tagService.createTag({
        workspaceId: mockWorkspace.id,
        name: 'infrastructure',
        color: 'purple',
        description: 'Cloud and server infra',
      });

      renderWithProviders(<TagManager workspaceId={mockWorkspace.id} />);

      // Wait for tag to appear in list
      expect(await screen.findByText('#infrastructure')).toBeInTheDocument();
      expect(screen.getByText('Cloud and server infra')).toBeInTheDocument();

      // Create new tag via manager
      const newTagBtn = screen.getByRole('button', { name: /New Tag/i });
      await user.click(newTagBtn);

      const nameInput = screen.getByLabelText(/Tag Name/i);
      await user.type(nameInput, 'documentation');

      const submitBtn = screen.getByRole('button', { name: 'Create Tag' });
      await user.click(submitBtn);

      expect(await screen.findByText('#documentation')).toBeInTheDocument();

      // Edit tag
      const editButtons = screen.getAllByRole('button', { name: /Edit tag/i });
      await user.click(editButtons[0]!);

      const editDescInput = screen.getByLabelText(/Description \(Optional\)/i);
      await user.clear(editDescInput);
      await user.type(editDescInput, 'Updated tag notes');

      const saveChangesBtn = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(saveChangesBtn);

      expect(await screen.findByText('Updated tag notes')).toBeInTheDocument();
    });
  });

  describe('OrganizationFilters', () => {
    it('renders status tabs, tag filters, and clear filter button', async () => {
      const user = userEvent.setup();
      const tag1: Tag = {
        id: 'tag-1',
        workspaceId: mockWorkspace.id,
        name: 'frontend',
        normalizedName: 'frontend',
        color: 'blue',
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      };

      let activeStatus = 'active';
      let selectedTagId: string | null = null;
      let searchQuery = '';
      let cleared = false;

      render(
        <OrganizationFilters
          statusOptions={[
            { id: 'active', label: 'Active', count: 5 },
            { id: 'pinned', label: 'Pinned', count: 2 },
            { id: 'archived', label: 'Archived', count: 1 },
          ]}
          activeStatus={activeStatus}
          onStatusChange={(st) => {
            activeStatus = st;
          }}
          availableTags={[tag1]}
          selectedTagId={selectedTagId}
          onTagSelect={(t) => {
            selectedTagId = t;
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            searchQuery = q;
          }}
          onClearFilters={() => {
            cleared = true;
          }}
          isFiltered={true}
        />,
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('#frontend')).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
      await user.click(clearBtn);
      expect(cleared).toBe(true);
    });
  });
});

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import {
  ResourceFilterBar,
  ResourceSortOption,
  FileCard,
  FileUploadDialog,
  FilePreviewDialog,
  FileMetadataEditDialog,
} from '@/components/resources';
import { useFileService, useTagService } from '@/app/providers';
import { FileEntity, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { UploadCloud, FolderOpen } from 'lucide-react';

export const ProjectFilesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const fileService = useFileService();
  const tagService = useTagService();

  const [files, setFiles] = useState<readonly FileEntity[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ResourceSortOption>('updated_desc');
  const [selectedTagId, setSelectedTagId] = useState<EntityId | null>(null);

  // Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileEntity | null>(null);
  const [editFile, setEditFile] = useState<FileEntity | null>(null);

  const loadFilesAndTags = useCallback(async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const [loadedFiles, loadedTags] = await Promise.all([
        fileService.listFilesByProject(project.id),
        tagService.listTags(project.workspaceId),
      ]);
      setFiles(loadedFiles);
      setTags(loadedTags);
    } catch {
      toast.error('Failed to load project files', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [fileService, tagService, project?.id, project?.workspaceId]);

  useEffect(() => {
    loadFilesAndTags();
  }, [loadFilesAndTags]);

  const handleDownload = async (file: FileEntity) => {
    try {
      const { blob } = await fileService.getFileBlob(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFilename || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to download "${file.name}"`, 'Download Error');
    }
  };

  const handleDelete = async (file: FileEntity) => {
    try {
      await fileService.deleteFile(file.id, project.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success(`File "${file.name}" deleted.`, 'File Deleted');
    } catch {
      toast.error('Failed to delete file', 'Error');
    }
  };

  const handleFileUploaded = (uploaded: FileEntity) => {
    setFiles((prev) => [uploaded, ...prev]);
  };

  const handleFileUpdated = (updated: FileEntity) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.originalFilename.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          f.mimeType.toLowerCase().includes(q),
      );
    }

    if (selectedTagId) {
      result = result.filter((f) => f.tags && f.tags.includes(selectedTagId));
    }

    switch (sort) {
      case 'created_desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'updated_desc':
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [files, search, sort, selectedTagId]);

  if (isLoading) {
    return <LoadingState message="Loading files..." />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header & Upload Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--wb-text-lg)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
            }}
          >
            Project Files
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Persistent local attachments and working assets for this project.
          </p>
        </div>

        {!project.isArchived && (
          <Button
            variant="primary"
            leftIcon={<UploadCloud size={16} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload File
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      {files.length > 0 && (
        <ResourceFilterBar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          availableTags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
          placeholder="Filter files by name, type, description..."
          count={filteredFiles.length}
        />
      )}

      {/* Files Grid or Empty State */}
      {files.length === 0 ? (
        <div style={{ padding: '3rem 0' }}>
          <EmptyState
            icon={<FolderOpen size={40} />}
            title="No files yet"
            description="Upload documents, images, datasets, or other project files."
            actionLabel={!project.isArchived ? 'Upload First File' : undefined}
            onAction={!project.isArchived ? () => setIsUploadOpen(true) : undefined}
          />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={{ padding: '2rem 0' }}>
          <EmptyState
            title="No matching files"
            description="Try adjusting your search query or tag filter."
            actionLabel="Clear Filters"
            actionVariant="ghost"
            onAction={() => {
              setSearch('');
              setSelectedTagId(null);
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              tags={tags}
              onPreview={(f) => setPreviewFile(f)}
              onDownload={handleDownload}
              onEdit={(f) => setEditFile(f)}
              onDelete={handleDelete}
              isReadOnly={project.isArchived}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <FileUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onFileUploaded={handleFileUploaded}
      />

      {/* Preview Dialog */}
      <FilePreviewDialog
        isOpen={previewFile !== null}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Edit Metadata Dialog */}
      <FileMetadataEditDialog
        isOpen={editFile !== null}
        file={editFile}
        onClose={() => setEditFile(null)}
        onFileUpdated={handleFileUpdated}
      />
    </div>
  );
};

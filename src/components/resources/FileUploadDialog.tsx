import React, { useState, useRef } from 'react';
import { Dialog, DialogFooter, Button, Input, Textarea } from '@/components/ui';
import { TagPicker } from '@/components/organization';
import { useFileService } from '@/app/providers';
import { FileEntity, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { UploadCloud, File, AlertCircle, X } from 'lucide-react';
import { FileService } from '@/services/file.service';

export interface FileUploadDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly onFileUploaded: (file: FileEntity) => void;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onClose,
  workspaceId,
  projectId,
  onFileUploaded,
}) => {
  const fileService = useFileService();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<readonly EntityId[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setDisplayName('');
    setDescription('');
    setSelectedTagIds([]);
    setErrorMessage(null);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const handleFileChange = (file: globalThis.File | null) => {
    if (!file) {
      setSelectedFile(null);
      setDisplayName('');
      return;
    }
    setSelectedFile(file);
    setDisplayName(file.name);
    setErrorMessage(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uploaded = await fileService.uploadFile({
        workspaceId,
        projectId,
        name: displayName.trim() || selectedFile.name,
        description: description.trim() || undefined,
        tags: selectedTagIds,
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          bytes: arrayBuffer,
        },
      });

      toast.success(`File "${uploaded.name}" uploaded successfully.`, 'File Uploaded');
      onFileUploaded(uploaded);
      resetForm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      setErrorMessage(message);
      toast.error(message, 'Upload Error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File Attachment"
      description="Select and attach a local file to this project."
      maxWidth="540px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-danger-subtle)',
              color: 'var(--wb-color-danger)',
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${
              isDragOver
                ? 'var(--wb-color-primary)'
                : selectedFile
                  ? 'var(--wb-color-accent)'
                  : 'var(--wb-color-border-strong)'
            }`,
            borderRadius: 'var(--wb-radius-lg)',
            backgroundColor: isDragOver ? 'var(--wb-color-bg-subtle)' : 'var(--wb-color-surface)',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--wb-duration-fast) ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleFileChange(file);
            }}
          />

          {selectedFile ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <File size={28} color="var(--wb-color-primary)" />
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontWeight: 'var(--wb-weight-semibold)',
                    fontSize: 'var(--wb-text-sm)',
                    color: 'var(--wb-color-fg)',
                    maxWidth: '280px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedFile.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--wb-text-xs)',
                    color: 'var(--wb-color-fg-muted)',
                  }}
                >
                  {FileService.formatFileSize(selectedFile.size)} •{' '}
                  {selectedFile.type || 'Unknown format'}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setDisplayName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Remove selected file"
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud size={32} color="var(--wb-color-fg-subtle)" />
              <div
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                Click to browse or drag and drop a file here
              </div>
              <div
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-fg-muted)',
                }}
              >
                Supports documents, images, PDFs, code archives, datasets, etc.
              </div>
            </>
          )}
        </div>

        {/* Display Name Input */}
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. System Architecture Diagram"
          required
        />

        {/* Description Textarea */}
        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief context about this file..."
          rows={2}
        />

        {/* Tag Picker */}
        <TagPicker
          workspaceId={workspaceId}
          selectedTagIds={selectedTagIds}
          onChange={(ids: readonly EntityId[], _tags: readonly Tag[]) => setSelectedTagIds(ids)}
          label="Tags (Optional)"
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
          >
            Upload File
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

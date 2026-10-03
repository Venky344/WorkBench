import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Dialog,
  DialogFooter,
} from '@/components/ui';
import { TagBadge } from '@/components/organization';
import { FileEntity, Tag } from '@/domain/entities';
import { FileService } from '@/services/file.service';
import {
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
  Eye,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';

export interface FileCardProps {
  readonly file: FileEntity;
  readonly tags?: readonly Tag[];
  readonly onPreview: (file: FileEntity) => void;
  readonly onDownload: (file: FileEntity) => void;
  readonly onEdit: (file: FileEntity) => void;
  readonly onDelete: (file: FileEntity) => void;
  readonly isReadOnly?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  tags = [],
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getFileIcon = (mimeType: string) => {
    const mime = mimeType.toLowerCase();
    if (mime.startsWith('image/')) {
      return <FileImage size={20} color="var(--wb-color-accent)" />;
    }
    if (
      mime.includes('javascript') ||
      mime.includes('typescript') ||
      mime.includes('json') ||
      mime.includes('html') ||
      mime.includes('css') ||
      mime.includes('python') ||
      mime.includes('sql')
    ) {
      return <FileCode size={20} color="var(--wb-color-primary)" />;
    }
    if (
      mime.includes('zip') ||
      mime.includes('tar') ||
      mime.includes('rar') ||
      mime.includes('gz')
    ) {
      return <FileArchive size={20} color="var(--wb-color-warning)" />;
    }
    if (mime.includes('csv') || mime.includes('excel') || mime.includes('spreadsheet')) {
      return <FileSpreadsheet size={20} color="var(--wb-color-success)" />;
    }
    if (mime.includes('pdf') || mime.startsWith('text/')) {
      return <FileText size={20} color="var(--wb-color-primary)" />;
    }
    return <File size={20} color="var(--wb-color-fg-muted)" />;
  };

  const fileTags = tags.filter((t) => file.tags && file.tags.includes(t.id));

  return (
    <>
      <Card
        variant="default"
        className="wb-file-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all var(--wb-duration-fast) ease',
        }}
      >
        <CardHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
              <div style={{ flexShrink: 0 }}>{getFileIcon(file.mimeType)}</div>
              <div style={{ minWidth: 0 }}>
                <CardTitle
                  style={{
                    fontSize: 'var(--wb-text-sm)',
                    fontWeight: 'var(--wb-weight-semibold)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={file.name}
                >
                  {file.name}
                </CardTitle>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--wb-color-fg-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.originalFilename}
                </div>
              </div>
            </div>

            <Badge variant="neutral" style={{ flexShrink: 0, fontSize: '10px' }}>
              {FileService.formatFileSize(file.sizeBytes)}
            </Badge>
          </div>

          {file.description && (
            <CardDescription
              style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.5rem', lineClamp: 2 }}
            >
              {file.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
        >
          {fileTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
              {fileTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="sm" />
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: '11px',
              color: 'var(--wb-color-fg-subtle)',
              marginTop: '0.75rem',
            }}
          >
            Updated {new Date(file.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>

        <CardFooter
          style={{ borderTop: '1px solid var(--wb-color-border-subtle)', paddingTop: '0.625rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Eye size={13} />}
                onClick={() => onPreview(file)}
                aria-label={`Preview ${file.name}`}
              >
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={() => onDownload(file)}
                aria-label={`Download ${file.name}`}
              >
                Download
              </Button>
            </div>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(file)}
                  aria-label={`Edit metadata for ${file.name}`}
                >
                  <Edit2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--wb-color-danger)' }}
                  aria-label={`Delete ${file.name}`}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete File Attachment?"
        description={`This removes "${file.name}" from this project and deletes its stored local binary copy.`}
        maxWidth="440px"
      >
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowDeleteConfirm(false);
              onDelete(file);
            }}
          >
            Delete File
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

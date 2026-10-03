import React, { useState, useEffect } from 'react';
import { Dialog, DialogFooter, Button, LoadingState } from '@/components/ui';
import { useFileService } from '@/app/providers';
import { FileEntity } from '@/domain/entities';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { FileService } from '@/services/file.service';

export interface FilePreviewDialogProps {
  readonly file: FileEntity | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({ file, isOpen, onClose }) => {
  const fileService = useFileService();

  const [isLoading, setIsLoading] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setTextContent(null);
      setError(null);
      return;
    }

    let isMounted = true;
    let createdUrl: string | null = null;

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { blob } = await fileService.getFileBlob(file.id);
        if (!isMounted) return;

        createdUrl = URL.createObjectURL(blob);
        setObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return createdUrl;
        });

        // If text/code/json/markdown, read text content
        const mime = file.mimeType.toLowerCase();
        if (
          mime.startsWith('text/') ||
          mime.includes('json') ||
          mime.includes('javascript') ||
          mime.includes('typescript') ||
          mime.includes('markdown') ||
          mime.includes('xml') ||
          mime.includes('csv')
        ) {
          const text = blob.text ? await blob.text() : await new Response(blob).text();
          if (isMounted) {
            setTextContent(text);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load file contents');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [file, isOpen, fileService]);

  const handleDownload = () => {
    if (!objectUrl || !file) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.originalFilename || file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const isText = textContent !== null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={file.name}
      description={`${file.originalFilename} • ${FileService.formatFileSize(file.sizeBytes)} • ${file.mimeType}`}
      maxWidth="720px"
    >
      <div style={{ minHeight: '260px', maxHeight: '65vh', overflowY: 'auto' }}>
        {isLoading && <LoadingState message="Loading file preview..." />}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--wb-radius-md)',
              backgroundColor: 'var(--wb-color-danger-subtle)',
              color: 'var(--wb-color-danger)',
              fontSize: 'var(--wb-text-sm)',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {isImage && objectUrl && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'var(--wb-color-bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--wb-radius-md)',
                }}
              >
                <img
                  src={objectUrl}
                  alt={file.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '55vh',
                    objectFit: 'contain',
                    borderRadius: 'var(--wb-radius-sm)',
                  }}
                />
              </div>
            )}

            {isPdf && objectUrl && (
              <div style={{ width: '100%', height: '55vh' }}>
                <iframe
                  src={objectUrl}
                  title={file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 'var(--wb-radius-md)',
                  }}
                />
              </div>
            )}

            {isText && (
              <pre
                style={{
                  backgroundColor: 'var(--wb-color-bg-code, #18181b)',
                  color: 'var(--wb-color-fg-code, #f4f4f5)',
                  padding: '1rem',
                  borderRadius: 'var(--wb-radius-md)',
                  fontSize: 'var(--wb-text-xs)',
                  fontFamily: 'var(--wb-font-mono, monospace)',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                }}
              >
                <code>{textContent}</code>
              </pre>
            )}

            {!isImage && !isPdf && !isText && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  gap: '1rem',
                }}
              >
                <FileText size={48} color="var(--wb-color-primary)" />
                <div>
                  <div
                    style={{
                      fontWeight: 'var(--wb-weight-semibold)',
                      fontSize: 'var(--wb-text-base)',
                      color: 'var(--wb-color-fg)',
                    }}
                  >
                    Browser preview is not available for this file type
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--wb-text-xs)',
                      color: 'var(--wb-color-fg-muted)',
                      marginTop: '0.25rem',
                    }}
                  >
                    Download the file to inspect its contents using your local application.
                  </div>
                </div>
                <Button
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  onClick={handleDownload}
                >
                  Download File
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        {objectUrl && (
          <Button variant="primary" leftIcon={<Download size={15} />} onClick={handleDownload}>
            Download
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

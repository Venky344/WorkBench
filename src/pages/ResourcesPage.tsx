import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  LoadingState,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui';
import { ResourceFilterBar, ResourceSortOption, FilePreviewDialog } from '@/components/resources';
import {
  useWorkspaceContext,
  useProjectService,
  useFileService,
  useNoteService,
  useLinkService,
  useBookmarkService,
  useReferenceService,
  useCodeSnippetService,
  useTagService,
} from '@/app/providers';
import {
  Project,
  FileEntity,
  Note,
  Link,
  Bookmark,
  Reference,
  CodeSnippet,
  Tag,
} from '@/domain/entities';
import { EntityId } from '@/types';
import { FileService } from '@/services/file.service';
import { toast } from '@/stores/toast.store';
import {
  BookMarked,
  Globe,
  Bookmark as BookmarkIcon,
  BookOpen,
  Code,
  FileText,
  StickyNote,
  ExternalLink,
  Folder,
  Eye,
  Download,
  Copy,
  Check,
} from 'lucide-react';

type GlobalCategory = 'all' | 'files' | 'notes' | 'links' | 'bookmarks' | 'references' | 'snippets';

export const ResourcesPage: React.FC = () => {
  const { workspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const projectService = useProjectService();
  const fileService = useFileService();
  const noteService = useNoteService();
  const linkService = useLinkService();
  const bookmarkService = useBookmarkService();
  const referenceService = useReferenceService();
  const codeSnippetService = useCodeSnippetService();
  const tagService = useTagService();

  const [activeCategory, setActiveCategory] = useState<GlobalCategory>('all');
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [files, setFiles] = useState<readonly FileEntity[]>([]);
  const [notes, setNotes] = useState<readonly Note[]>([]);
  const [links, setLinks] = useState<readonly Link[]>([]);
  const [bookmarks, setBookmarks] = useState<readonly Bookmark[]>([]);
  const [references, setReferences] = useState<readonly Reference[]>([]);
  const [snippets, setSnippets] = useState<readonly CodeSnippet[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, sort, tag filter
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ResourceSortOption>('updated_desc');
  const [selectedTagId, setSelectedTagId] = useState<EntityId | null>(null);

  // Preview dialog for files
  const [previewFile, setPreviewFile] = useState<FileEntity | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const [
        allProjects,
        allFiles,
        allNotes,
        allLinks,
        allBookmarks,
        allRefs,
        allSnippets,
        allTags,
      ] = await Promise.all([
        projectService.listProjects(workspace.id),
        fileService.listFilesByWorkspace(workspace.id),
        noteService.listNotesByWorkspace(workspace.id),
        linkService.listLinksByWorkspace(workspace.id),
        bookmarkService.listBookmarksByWorkspace(workspace.id),
        referenceService.listReferencesByWorkspace(workspace.id),
        codeSnippetService.listCodeSnippetsByWorkspace(workspace.id),
        tagService.listTags(workspace.id),
      ]);

      setProjects(allProjects);
      setFiles(allFiles);
      setNotes(allNotes);
      setLinks(allLinks);
      setBookmarks(allBookmarks);
      setReferences(allRefs);
      setSnippets(allSnippets);
      setTags(allTags);
    } catch {
      toast.error('Failed to load workspace resources', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [
    workspace?.id,
    projectService,
    fileService,
    noteService,
    linkService,
    bookmarkService,
    referenceService,
    codeSnippetService,
    tagService,
  ]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    for (const p of projects) {
      map.set(p.id, p);
    }
    return map;
  }, [projects]);

  const handleCopyCode = async (snippet: CodeSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedSnippetId(snippet.id);
      toast.success('Code copied to clipboard.', 'Copied');
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch {
      toast.error('Failed to copy snippet', 'Copy Error');
    }
  };

  const handleDownloadFile = async (file: FileEntity) => {
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

  // Filter items
  const filteredFiles = useMemo(() => {
    let res = [...files];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (f) => f.name.toLowerCase().includes(q) || f.originalFilename.toLowerCase().includes(q),
      );
    }
    if (selectedTagId) {
      res = res.filter((f) => f.tags && f.tags.includes(selectedTagId));
    }
    return res;
  }, [files, search, selectedTagId]);

  const filteredNotes = useMemo(() => {
    let res = [...notes];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
      );
    }
    if (selectedTagId) {
      res = res.filter((n) => n.tags && n.tags.includes(selectedTagId));
    }
    return res;
  }, [notes, search, selectedTagId]);

  const filteredLinks = useMemo(() => {
    let res = [...links];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter((l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
    }
    if (selectedTagId) {
      res = res.filter((l) => l.tags && l.tags.includes(selectedTagId));
    }
    return res;
  }, [links, search, selectedTagId]);

  const filteredBookmarks = useMemo(() => {
    let res = [...bookmarks];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (b) => b.title.toLowerCase().includes(q) || (b.note && b.note.toLowerCase().includes(q)),
      );
    }
    if (selectedTagId) {
      res = res.filter((b) => b.tags && b.tags.includes(selectedTagId));
    }
    return res;
  }, [bookmarks, search, selectedTagId]);

  const filteredReferences = useMemo(() => {
    let res = [...references];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (r) => r.title.toLowerCase().includes(q) || r.targetUri.toLowerCase().includes(q),
      );
    }
    if (selectedTagId) {
      res = res.filter((r) => r.tags && r.tags.includes(selectedTagId));
    }
    return res;
  }, [references, search, selectedTagId]);

  const filteredSnippets = useMemo(() => {
    let res = [...snippets];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(
        (s) => (s.title && s.title.toLowerCase().includes(q)) || s.code.toLowerCase().includes(q),
      );
    }
    if (selectedTagId) {
      res = res.filter((s) => s.tags && s.tags.includes(selectedTagId));
    }
    return res;
  }, [snippets, search, selectedTagId]);

  const totalRawCount =
    files.length +
    notes.length +
    links.length +
    bookmarks.length +
    references.length +
    snippets.length;

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--wb-text-2xl)',
            fontWeight: 'var(--wb-weight-bold)',
            color: 'var(--wb-color-fg)',
          }}
        >
          Resources & Reference Links
        </h1>
        <p
          style={{
            margin: '0.25rem 0 0 0',
            fontSize: 'var(--wb-text-sm)',
            color: 'var(--wb-color-fg-muted)',
          }}
        >
          All persistent working assets, documentation links, citations, code snippets, notes, and
          files across active projects.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading workspace resources..." />
      ) : (
        <>
          {/* Category Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--wb-color-border-subtle)',
              gap: '0.25rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            <Button
              variant={activeCategory === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All ({totalRawCount})
            </Button>
            <Button
              variant={activeCategory === 'links' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<Globe size={14} />}
              onClick={() => setActiveCategory('links')}
            >
              Links ({links.length})
            </Button>
            <Button
              variant={activeCategory === 'files' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={() => setActiveCategory('files')}
            >
              Files ({files.length})
            </Button>
            <Button
              variant={activeCategory === 'notes' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<StickyNote size={14} />}
              onClick={() => setActiveCategory('notes')}
            >
              Notes ({notes.length})
            </Button>
            <Button
              variant={activeCategory === 'snippets' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<Code size={14} />}
              onClick={() => setActiveCategory('snippets')}
            >
              Code Snippets ({snippets.length})
            </Button>
            <Button
              variant={activeCategory === 'bookmarks' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<BookmarkIcon size={14} />}
              onClick={() => setActiveCategory('bookmarks')}
            >
              Bookmarks ({bookmarks.length})
            </Button>
            <Button
              variant={activeCategory === 'references' ? 'secondary' : 'ghost'}
              size="sm"
              leftIcon={<BookOpen size={14} />}
              onClick={() => setActiveCategory('references')}
            >
              References ({references.length})
            </Button>
          </div>

          {/* Filter Bar */}
          {totalRawCount > 0 && (
            <ResourceFilterBar
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              availableTags={tags}
              selectedTagId={selectedTagId}
              onTagSelect={setSelectedTagId}
              placeholder="Filter resources across workspace..."
            />
          )}

          {/* Empty State */}
          {totalRawCount === 0 ? (
            <div style={{ padding: '3rem 0' }}>
              <EmptyState
                icon={<BookMarked size={40} />}
                title="No workspace resources found"
                description="Open any project to add files, notes, external documentation links, citations, or code snippets."
                actionLabel="Go to Projects"
                onAction={() => navigate('/projects')}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Links Section */}
              {(activeCategory === 'all' || activeCategory === 'links') &&
                filteredLinks.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      External Links ({filteredLinks.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredLinks.map((link) => {
                        const proj = link.projectId ? projectMap.get(link.projectId) : undefined;
                        return (
                          <Card key={link.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <Globe size={18} color="var(--wb-color-primary)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {link.title}
                                  </CardTitle>
                                </div>
                                <Badge variant="neutral">{link.domain}</Badge>
                              </div>
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/resources`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                              {link.description && (
                                <CardDescription
                                  style={{ fontSize: 'var(--wb-text-xs)', marginTop: '0.375rem' }}
                                >
                                  {link.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardFooter
                              style={{
                                borderTop: '1px solid var(--wb-color-border-subtle)',
                                paddingTop: '0.5rem',
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ width: '100%' }}
                                rightIcon={<ExternalLink size={12} />}
                                onClick={() =>
                                  window.open(link.url, '_blank', 'noopener,noreferrer')
                                }
                              >
                                Open Link
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Bookmarks Section */}
              {(activeCategory === 'all' || activeCategory === 'bookmarks') &&
                filteredBookmarks.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Bookmarks ({filteredBookmarks.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredBookmarks.map((bookmark) => {
                        const proj = bookmark.projectId
                          ? projectMap.get(bookmark.projectId)
                          : undefined;
                        return (
                          <Card key={bookmark.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <BookmarkIcon size={18} color="var(--wb-color-accent)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {bookmark.title}
                                  </CardTitle>
                                </div>
                                <Badge variant="primary" style={{ fontSize: '10px' }}>
                                  {bookmark.targetEntityType.toUpperCase()}
                                </Badge>
                              </div>
                              {bookmark.note && (
                                <div
                                  style={{
                                    fontSize: 'var(--wb-text-xs)',
                                    color: 'var(--wb-color-fg-muted)',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  {bookmark.note}
                                </div>
                              )}
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/resources`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* References Section */}
              {(activeCategory === 'all' || activeCategory === 'references') &&
                filteredReferences.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      References & Citations ({filteredReferences.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredReferences.map((ref) => {
                        const proj = ref.projectId ? projectMap.get(ref.projectId) : undefined;
                        return (
                          <Card key={ref.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <BookOpen size={18} color="var(--wb-color-primary)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {ref.title}
                                  </CardTitle>
                                </div>
                                <Badge variant="neutral" style={{ fontSize: '10px' }}>
                                  {ref.referenceKind.toUpperCase()}
                                </Badge>
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--wb-color-fg-muted)',
                                  fontFamily: 'var(--wb-font-mono, monospace)',
                                  marginTop: '0.25rem',
                                }}
                              >
                                {ref.targetUri}
                              </div>
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/resources`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Files Section */}
              {(activeCategory === 'all' || activeCategory === 'files') &&
                filteredFiles.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Files & Documents ({filteredFiles.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredFiles.map((file) => {
                        const proj = file.projectId ? projectMap.get(file.projectId) : undefined;
                        return (
                          <Card key={file.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <FileText size={18} color="var(--wb-color-primary)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {file.name}
                                  </CardTitle>
                                </div>
                                <Badge variant="neutral">
                                  {FileService.formatFileSize(file.sizeBytes)}
                                </Badge>
                              </div>
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/files`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--wb-color-fg-muted)',
                                  marginTop: '0.25rem',
                                }}
                              >
                                {file.originalFilename} • {file.mimeType}
                              </div>
                            </CardHeader>
                            <CardFooter
                              style={{
                                borderTop: '1px solid var(--wb-color-border-subtle)',
                                paddingTop: '0.5rem',
                              }}
                            >
                              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Eye size={12} />}
                                  style={{ flex: 1 }}
                                  onClick={() => setPreviewFile(file)}
                                >
                                  Preview
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Download size={12} />}
                                  style={{ flex: 1 }}
                                  onClick={() => handleDownloadFile(file)}
                                >
                                  Download
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Notes Section */}
              {(activeCategory === 'all' || activeCategory === 'notes') &&
                filteredNotes.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Notes ({filteredNotes.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredNotes.map((note) => {
                        const proj = note.projectId ? projectMap.get(note.projectId) : undefined;
                        return (
                          <Card key={note.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <StickyNote size={18} color="var(--wb-color-primary)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {note.title}
                                  </CardTitle>
                                </div>
                                {note.isPinned && <Badge variant="primary">Pinned</Badge>}
                              </div>
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/notes/${note.id}`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  fontSize: 'var(--wb-text-xs)',
                                  color: 'var(--wb-color-fg-muted)',
                                  margin: 0,
                                  lineClamp: 2,
                                }}
                              >
                                {note.content.slice(0, 120) || 'Empty note...'}
                              </p>
                            </CardContent>
                            <CardFooter
                              style={{
                                borderTop: '1px solid var(--wb-color-border-subtle)',
                                paddingTop: '0.5rem',
                              }}
                            >
                              {proj && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  style={{ width: '100%' }}
                                  rightIcon={<ExternalLink size={12} />}
                                  onClick={() => navigate(`/projects/${proj.id}/notes/${note.id}`)}
                                >
                                  Open Note in Project
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Code Snippets Section */}
              {(activeCategory === 'all' || activeCategory === 'snippets') &&
                filteredSnippets.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: 'var(--wb-text-sm)',
                        fontWeight: 'var(--wb-weight-semibold)',
                        color: 'var(--wb-color-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Code Snippets ({filteredSnippets.length})
                    </h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {filteredSnippets.map((snippet) => {
                        const proj = snippet.projectId
                          ? projectMap.get(snippet.projectId)
                          : undefined;
                        const isCopied = copiedSnippetId === snippet.id;
                        return (
                          <Card key={snippet.id} variant="default">
                            <CardHeader>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                  }}
                                >
                                  <Code size={18} color="var(--wb-color-primary)" />
                                  <CardTitle
                                    style={{
                                      fontSize: 'var(--wb-text-sm)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {snippet.title || snippet.filename || 'Snippet'}
                                  </CardTitle>
                                </div>
                                <Badge variant="neutral">{snippet.language.toUpperCase()}</Badge>
                              </div>
                              {proj && (
                                <div
                                  onClick={() => navigate(`/projects/${proj.id}/resources`)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '11px',
                                    color: 'var(--wb-color-primary)',
                                    cursor: 'pointer',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Folder size={12} />
                                  <span>Project: {proj.name}</span>
                                </div>
                              )}
                            </CardHeader>
                            <CardContent>
                              <pre
                                style={{
                                  margin: 0,
                                  backgroundColor: 'var(--wb-color-bg-code, #18181b)',
                                  color: 'var(--wb-color-fg-code, #f4f4f5)',
                                  padding: '0.5rem',
                                  borderRadius: 'var(--wb-radius-sm)',
                                  fontSize: '10px',
                                  fontFamily: 'var(--wb-font-mono, monospace)',
                                  maxHeight: '100px',
                                  overflow: 'hidden',
                                }}
                              >
                                <code>{snippet.code.split('\n').slice(0, 4).join('\n')}</code>
                              </pre>
                            </CardContent>
                            <CardFooter
                              style={{
                                borderTop: '1px solid var(--wb-color-border-subtle)',
                                paddingTop: '0.5rem',
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                style={{ width: '100%' }}
                                leftIcon={
                                  isCopied ? (
                                    <Check size={12} color="var(--wb-color-success)" />
                                  ) : (
                                    <Copy size={12} />
                                  )
                                }
                                onClick={() => handleCopyCode(snippet)}
                              >
                                {isCopied ? 'Copied to Clipboard' : 'Copy Code'}
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </>
      )}

      {/* File Preview Dialog */}
      <FilePreviewDialog
        isOpen={previewFile !== null}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};

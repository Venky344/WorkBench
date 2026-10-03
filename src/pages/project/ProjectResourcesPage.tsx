import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import {
  ResourceFilterBar,
  ResourceSortOption,
  LinkCard,
  LinkDialog,
  BookmarkCard,
  BookmarkDialog,
  ReferenceCard,
  ReferenceDialog,
  CodeSnippetCard,
  CodeSnippetEditorDialog,
} from '@/components/resources';
import {
  useLinkService,
  useBookmarkService,
  useReferenceService,
  useCodeSnippetService,
  useTagService,
} from '@/app/providers';
import { Link, Bookmark, Reference, CodeSnippet, Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { toast } from '@/stores/toast.store';
import { BookMarked, Globe, Bookmark as BookmarkIcon, BookOpen, Code } from 'lucide-react';

export type ResourceCategory = 'all' | 'links' | 'bookmarks' | 'references' | 'snippets';

export const ProjectResourcesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const linkService = useLinkService();
  const bookmarkService = useBookmarkService();
  const referenceService = useReferenceService();
  const codeSnippetService = useCodeSnippetService();
  const tagService = useTagService();

  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [links, setLinks] = useState<readonly Link[]>([]);
  const [bookmarks, setBookmarks] = useState<readonly Bookmark[]>([]);
  const [references, setReferences] = useState<readonly Reference[]>([]);
  const [snippets, setSnippets] = useState<readonly CodeSnippet[]>([]);
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ResourceSortOption>('updated_desc');
  const [selectedTagId, setSelectedTagId] = useState<EntityId | null>(null);

  // Creation & Edit Dialogs
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const [isRefDialogOpen, setIsRefDialogOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Reference | null>(null);

  const [isSnippetDialogOpen, setIsSnippetDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);

  const loadResources = useCallback(async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const [l, b, r, s, t] = await Promise.all([
        linkService.listLinksByProject(project.id),
        bookmarkService.listBookmarksByProject(project.id),
        referenceService.listReferencesByProject(project.id),
        codeSnippetService.listCodeSnippetsByProject(project.id),
        tagService.listTags(project.workspaceId),
      ]);
      setLinks(l);
      setBookmarks(b);
      setReferences(r);
      setSnippets(s);
      setTags(t);
    } catch {
      toast.error('Failed to load project resources', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [
    project?.id,
    project?.workspaceId,
    linkService,
    bookmarkService,
    referenceService,
    codeSnippetService,
    tagService,
  ]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Handlers for Links
  const handleDeleteLink = async (item: Link) => {
    try {
      await linkService.deleteLink(item.id, project.id);
      setLinks((prev) => prev.filter((l) => l.id !== item.id));
      toast.success(`Link "${item.title}" deleted.`, 'Deleted');
    } catch {
      toast.error('Failed to delete link', 'Error');
    }
  };

  // Handlers for Bookmarks
  const handleDeleteBookmark = async (item: Bookmark) => {
    try {
      await bookmarkService.deleteBookmark(item.id, project.id);
      setBookmarks((prev) => prev.filter((b) => b.id !== item.id));
      toast.success(`Bookmark "${item.title}" deleted.`, 'Deleted');
    } catch {
      toast.error('Failed to delete bookmark', 'Error');
    }
  };

  // Handlers for References
  const handleDeleteRef = async (item: Reference) => {
    try {
      await referenceService.deleteReference(item.id, project.id);
      setReferences((prev) => prev.filter((r) => r.id !== item.id));
      toast.success(`Reference "${item.title}" deleted.`, 'Deleted');
    } catch {
      toast.error('Failed to delete reference', 'Error');
    }
  };

  // Handlers for Code Snippets
  const handleDeleteSnippet = async (item: CodeSnippet) => {
    try {
      await codeSnippetService.deleteCodeSnippet(item.id, project.id);
      setSnippets((prev) => prev.filter((s) => s.id !== item.id));
      toast.success(`Code snippet deleted.`, 'Deleted');
    } catch {
      toast.error('Failed to delete code snippet', 'Error');
    }
  };

  // Filter and sort items per category
  const filteredLinks = useMemo(() => {
    let result = [...links];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.domain.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)),
      );
    }
    if (selectedTagId) {
      result = result.filter((l) => l.tags && l.tags.includes(selectedTagId));
    }
    return result;
  }, [links, search, selectedTagId]);

  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.note && b.note.toLowerCase().includes(q)) ||
          (b.targetUrl && b.targetUrl.toLowerCase().includes(q)),
      );
    }
    if (selectedTagId) {
      result = result.filter((b) => b.tags && b.tags.includes(selectedTagId));
    }
    return result;
  }, [bookmarks, search, selectedTagId]);

  const filteredReferences = useMemo(() => {
    let result = [...references];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.targetUri.toLowerCase().includes(q) ||
          (r.annotation && r.annotation.toLowerCase().includes(q)),
      );
    }
    if (selectedTagId) {
      result = result.filter((r) => r.tags && r.tags.includes(selectedTagId));
    }
    return result;
  }, [references, search, selectedTagId]);

  const filteredSnippets = useMemo(() => {
    let result = [...snippets];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          s.language.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)),
      );
    }
    if (selectedTagId) {
      result = result.filter((s) => s.tags && s.tags.includes(selectedTagId));
    }
    return result;
  }, [snippets, search, selectedTagId]);

  const totalItemCount =
    filteredLinks.length +
    filteredBookmarks.length +
    filteredReferences.length +
    filteredSnippets.length;

  const totalRawCount = links.length + bookmarks.length + references.length + snippets.length;

  if (isLoading) {
    return <LoadingState message="Loading project resources..." />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header & Quick Action */}
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
            Project Resources
          </h2>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
            }}
          >
            Curated web links, fast navigation pointers, citation references, and code snippets.
          </p>
        </div>

        {!project.isArchived && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Globe size={14} />}
              onClick={() => {
                setEditingLink(null);
                setIsLinkDialogOpen(true);
              }}
            >
              Add Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookmarkIcon size={14} />}
              onClick={() => {
                setEditingBookmark(null);
                setIsBookmarkDialogOpen(true);
              }}
            >
              Add Bookmark
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookOpen size={14} />}
              onClick={() => {
                setEditingRef(null);
                setIsRefDialogOpen(true);
              }}
            >
              Add Reference
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Code size={14} />}
              onClick={() => {
                setEditingSnippet(null);
                setIsSnippetDialogOpen(true);
              }}
            >
              Add Snippet
            </Button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--wb-color-border-subtle)',
          gap: '0.5rem',
        }}
      >
        <Button
          variant={activeCategory === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          All Resources ({totalRawCount})
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
        <Button
          variant={activeCategory === 'snippets' ? 'secondary' : 'ghost'}
          size="sm"
          leftIcon={<Code size={14} />}
          onClick={() => setActiveCategory('snippets')}
        >
          Snippets ({snippets.length})
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
          placeholder="Filter resources by name, URL, code, description..."
          count={
            activeCategory === 'all'
              ? totalItemCount
              : activeCategory === 'links'
                ? filteredLinks.length
                : activeCategory === 'bookmarks'
                  ? filteredBookmarks.length
                  : activeCategory === 'references'
                    ? filteredReferences.length
                    : filteredSnippets.length
          }
        />
      )}

      {/* Empty State when no resources at all */}
      {totalRawCount === 0 ? (
        <div style={{ padding: '3rem 0' }}>
          <EmptyState
            icon={<BookMarked size={40} />}
            title="No project resources yet"
            description="Add web links, citations, saved entity bookmarks, or reusable code snippets."
            actionLabel={!project.isArchived ? 'Add Web Link' : undefined}
            onAction={
              !project.isArchived
                ? () => {
                    setEditingLink(null);
                    setIsLinkDialogOpen(true);
                  }
                : undefined
            }
          />
        </div>
      ) : (
        /* Resource Collections Display */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Links Section */}
          {(activeCategory === 'all' || activeCategory === 'links') && filteredLinks.length > 0 && (
            <div>
              {activeCategory === 'all' && (
                <h3
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
                </h3>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    tags={tags}
                    onEdit={(l) => {
                      setEditingLink(l);
                      setIsLinkDialogOpen(true);
                    }}
                    onDelete={handleDeleteLink}
                    isReadOnly={project.isArchived}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Section */}
          {(activeCategory === 'all' || activeCategory === 'bookmarks') &&
            filteredBookmarks.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <h3
                    style={{
                      fontSize: 'var(--wb-text-sm)',
                      fontWeight: 'var(--wb-weight-semibold)',
                      color: 'var(--wb-color-fg-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Pointers & Bookmarks ({filteredBookmarks.length})
                  </h3>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {filteredBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      tags={tags}
                      onEdit={(b) => {
                        setEditingBookmark(b);
                        setIsBookmarkDialogOpen(true);
                      }}
                      onDelete={handleDeleteBookmark}
                      isReadOnly={project.isArchived}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* References Section */}
          {(activeCategory === 'all' || activeCategory === 'references') &&
            filteredReferences.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <h3
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
                  </h3>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {filteredReferences.map((ref) => (
                    <ReferenceCard
                      key={ref.id}
                      reference={ref}
                      tags={tags}
                      onEdit={(r) => {
                        setEditingRef(r);
                        setIsRefDialogOpen(true);
                      }}
                      onDelete={handleDeleteRef}
                      isReadOnly={project.isArchived}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Code Snippets Section */}
          {(activeCategory === 'all' || activeCategory === 'snippets') &&
            filteredSnippets.length > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <h3
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
                  </h3>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {filteredSnippets.map((snippet) => (
                    <CodeSnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      tags={tags}
                      onEdit={(s) => {
                        setEditingSnippet(s);
                        setIsSnippetDialogOpen(true);
                      }}
                      onDelete={handleDeleteSnippet}
                      isReadOnly={project.isArchived}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* If filtering produced 0 matching items */}
          {totalItemCount === 0 && totalRawCount > 0 && (
            <div style={{ padding: '2rem 0' }}>
              <EmptyState
                title="No matching resources"
                description="Try adjusting your search query, active tab, or tag filter."
                actionLabel="Clear Filters"
                actionVariant="ghost"
                onAction={() => {
                  setSearch('');
                  setSelectedTagId(null);
                  setActiveCategory('all');
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <LinkDialog
        isOpen={isLinkDialogOpen}
        link={editingLink}
        onClose={() => {
          setIsLinkDialogOpen(false);
          setEditingLink(null);
        }}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onLinkSaved={(saved) => {
          setLinks((prev) => {
            const exists = prev.some((l) => l.id === saved.id);
            return exists ? prev.map((l) => (l.id === saved.id ? saved : l)) : [saved, ...prev];
          });
        }}
      />

      <BookmarkDialog
        isOpen={isBookmarkDialogOpen}
        bookmark={editingBookmark}
        onClose={() => {
          setIsBookmarkDialogOpen(false);
          setEditingBookmark(null);
        }}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onBookmarkSaved={(saved) => {
          setBookmarks((prev) => {
            const exists = prev.some((b) => b.id === saved.id);
            return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev];
          });
        }}
      />

      <ReferenceDialog
        isOpen={isRefDialogOpen}
        reference={editingRef}
        onClose={() => {
          setIsRefDialogOpen(false);
          setEditingRef(null);
        }}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onReferenceSaved={(saved) => {
          setReferences((prev) => {
            const exists = prev.some((r) => r.id === saved.id);
            return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
          });
        }}
      />

      <CodeSnippetEditorDialog
        isOpen={isSnippetDialogOpen}
        snippet={editingSnippet}
        onClose={() => {
          setIsSnippetDialogOpen(false);
          setEditingSnippet(null);
        }}
        workspaceId={project.workspaceId}
        projectId={project.id}
        onSnippetSaved={(saved) => {
          setSnippets((prev) => {
            const exists = prev.some((s) => s.id === saved.id);
            return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev];
          });
        }}
      />
    </div>
  );
};

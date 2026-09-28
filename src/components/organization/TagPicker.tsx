import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tag } from '@/domain/entities';
import { EntityId } from '@/types';
import { useTagService } from '@/app/providers';
import { Button } from '@/components/ui';
import { TagBadge } from './TagBadge';
import { TAG_COLOR_OPTIONS } from './tag-theme';
import { toast } from '@/stores/toast.store';
import { Plus, Check, Tag as TagIcon, X } from 'lucide-react';

export interface TagPickerProps {
  readonly workspaceId: EntityId;
  readonly selectedTagIds: readonly EntityId[];
  readonly onChange: (selectedTagIds: readonly EntityId[], selectedTags: readonly Tag[]) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly allowCreate?: boolean;
  readonly style?: React.CSSProperties;
}

export const TagPicker: React.FC<TagPickerProps> = ({
  workspaceId,
  selectedTagIds,
  onChange,
  label,
  placeholder = 'Add or create tags...',
  disabled = false,
  allowCreate = true,
  style,
}) => {
  const tagService = useTagService();

  const [availableTags, setAvailableTags] = useState<readonly Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [isCreating, setIsCreating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadTags = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const tags = await tagService.listTags(workspaceId);
      setAvailableTags(tags);
    } catch {
      // ignore
    }
  }, [tagService, workspaceId]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  // Filtered available tags based on search query
  const normalizedQuery = tagService.normalizeTagName(query);
  const filteredTags = availableTags.filter((t) => {
    if (!normalizedQuery) return true;
    return (
      t.normalizedName.includes(normalizedQuery) ||
      t.name.toLowerCase().includes(query.toLowerCase().trim())
    );
  });

  const exactMatchExists = availableTags.some(
    (t) =>
      t.normalizedName === normalizedQuery || t.name.toLowerCase() === query.toLowerCase().trim(),
  );

  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id));

  const handleToggleTag = (tag: Tag) => {
    let nextIds: EntityId[];
    let nextTags: Tag[];

    if (selectedTagIds.includes(tag.id)) {
      nextIds = selectedTagIds.filter((id) => id !== tag.id);
      nextTags = selectedTags.filter((t) => t.id !== tag.id);
    } else {
      nextIds = [...selectedTagIds, tag.id];
      nextTags = [...selectedTags, tag];
    }

    onChange(nextIds, nextTags);
  };

  const handleRemoveTagById = (tagId: EntityId) => {
    const nextIds = selectedTagIds.filter((id) => id !== tagId);
    const nextTags = selectedTags.filter((t) => t.id !== tagId);
    onChange(nextIds, nextTags);
  };

  const handleCreateNewTag = async () => {
    const trimmed = query.trim().replace(/^#+/, '').trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      const created = await tagService.createTag({
        workspaceId,
        name: trimmed,
        color: newTagColor,
      });

      setAvailableTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Tag "#${created.name}" created.`, 'Tag Created');

      // Automatically select newly created tag
      const nextIds = [...selectedTagIds, created.id];
      const nextTags = [...selectedTags, created];
      onChange(nextIds, nextTags);

      setQuery('');
      setIsOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tag';
      toast.error(msg, 'Tag Error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="wb-tag-picker"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        position: 'relative',
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: 'var(--wb-text-xs)',
            fontWeight: 'var(--wb-weight-medium)',
            color: 'var(--wb-color-fg)',
          }}
        >
          {label}
        </label>
      )}

      {/* Selected Tags & Popover Input Area */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.625rem',
          minHeight: '2.375rem',
          borderRadius: 'var(--wb-radius-md)',
          border: `1px solid ${isOpen ? 'var(--wb-color-primary)' : 'var(--wb-color-border-strong)'}`,
          backgroundColor: 'var(--wb-color-surface)',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
          transition: 'var(--wb-transition-colors)',
        }}
      >
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            onRemove={disabled ? undefined : () => handleRemoveTagById(tag.id)}
          />
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flex: 1,
            minWidth: '120px',
          }}
        >
          <TagIcon size={13} style={{ color: 'var(--wb-color-fg-subtle)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={query}
            placeholder={selectedTags.length === 0 ? placeholder : 'Add more tags...'}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!exactMatchExists && query.trim() && allowCreate) {
                  handleCreateNewTag();
                } else if (filteredTags.length > 0 && filteredTags[0]) {
                  handleToggleTag(filteredTags[0]);
                  setQuery('');
                }
              } else if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg)',
              width: '100%',
              padding: 0,
            }}
          />
        </div>

        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([], []);
            }}
            aria-label="Clear all tags"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.125rem',
              color: 'var(--wb-color-fg-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Popover Suggestions & Creation */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available Tags"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 'var(--wb-z-dropdown)',
            backgroundColor: 'var(--wb-color-surface-elevated)',
            border: '1px solid var(--wb-color-border)',
            borderRadius: 'var(--wb-radius-lg)',
            boxShadow: 'var(--wb-shadow-lg)',
            padding: '0.5rem',
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            animation: 'wb-fade-in var(--wb-duration-fast) var(--wb-ease-out)',
          }}
        >
          {filteredTags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.375rem 0.5rem',
                      borderRadius: 'var(--wb-radius-md)',
                      backgroundColor: isSelected
                        ? 'var(--wb-color-surface-active)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'var(--wb-transition-colors)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--wb-color-bg-subtle)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <TagBadge tag={tag} size="sm" />
                    {isSelected && <Check size={14} color="var(--wb-color-primary)" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '0.5rem',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-muted)',
                textAlign: 'center',
              }}
            >
              No matching tags found.
            </div>
          )}

          {/* New Tag Creation Action */}
          {allowCreate && query.trim() && !exactMatchExists && (
            <div
              style={{
                marginTop: '0.25rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--wb-color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--wb-color-fg-muted)',
                  }}
                >
                  Tag Color:
                </span>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {TAG_COLOR_OPTIONS.slice(0, 6).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-label={`Select ${opt.label} color`}
                      onClick={() => setNewTagColor(opt.id)}
                      style={{
                        width: '1rem',
                        height: '1rem',
                        borderRadius: 'var(--wb-radius-full)',
                        backgroundColor: opt.colorVar,
                        border:
                          newTagColor === opt.id
                            ? '2px solid var(--wb-color-fg)'
                            : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                isLoading={isCreating}
                onClick={handleCreateNewTag}
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
              >
                Create tag &quot;#{query.trim().replace(/^#+/, '')}&quot;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

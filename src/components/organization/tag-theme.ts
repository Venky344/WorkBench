export interface TagColorOption {
  readonly id: string;
  readonly label: string;
  readonly colorVar: string;
  readonly bgSubtleVar: string;
  readonly borderVar: string;
}

export const TAG_COLOR_OPTIONS: readonly TagColorOption[] = [
  {
    id: 'blue',
    label: 'Blue',
    colorVar: 'var(--wb-color-primary)',
    bgSubtleVar: 'var(--wb-color-primary-subtle)',
    borderVar: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    colorVar: '#06b6d4',
    bgSubtleVar: 'rgba(6, 182, 212, 0.15)',
    borderVar: 'rgba(6, 182, 212, 0.35)',
  },
  {
    id: 'green',
    label: 'Green',
    colorVar: 'var(--wb-color-success)',
    bgSubtleVar: 'var(--wb-color-success-subtle)',
    borderVar: 'rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    colorVar: 'var(--wb-color-warning)',
    bgSubtleVar: 'var(--wb-color-warning-subtle)',
    borderVar: 'rgba(234, 179, 8, 0.3)',
  },
  {
    id: 'orange',
    label: 'Orange',
    colorVar: '#f97316',
    bgSubtleVar: 'rgba(249, 115, 22, 0.15)',
    borderVar: 'rgba(249, 115, 22, 0.35)',
  },
  {
    id: 'red',
    label: 'Red',
    colorVar: 'var(--wb-color-destructive)',
    bgSubtleVar: 'var(--wb-color-destructive-subtle)',
    borderVar: 'rgba(239, 68, 68, 0.3)',
  },
  {
    id: 'purple',
    label: 'Purple',
    colorVar: '#a855f7',
    bgSubtleVar: 'rgba(168, 85, 247, 0.15)',
    borderVar: 'rgba(168, 85, 247, 0.35)',
  },
  {
    id: 'pink',
    label: 'Pink',
    colorVar: '#ec4899',
    bgSubtleVar: 'rgba(236, 72, 153, 0.15)',
    borderVar: 'rgba(236, 72, 153, 0.35)',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    colorVar: 'var(--wb-color-fg-muted)',
    bgSubtleVar: 'var(--wb-color-surface-active)',
    borderVar: 'var(--wb-color-border-subtle)',
  },
];

export function getTagColorStyles(color?: string): {
  color: string;
  backgroundColor: string;
  borderColor: string;
} {
  const defaultOption = TAG_COLOR_OPTIONS[0] ?? {
    id: 'neutral',
    label: 'Neutral',
    colorVar: 'var(--wb-color-fg)',
    bgSubtleVar: 'var(--wb-color-surface-active)',
    borderVar: 'var(--wb-color-border-subtle)',
  };
  const found = TAG_COLOR_OPTIONS.find((opt) => opt.id === color) ?? defaultOption;
  return {
    color: found.colorVar,
    backgroundColor: found.bgSubtleVar,
    borderColor: found.borderVar,
  };
}

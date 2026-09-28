import React from 'react';
import {
  LucideIcon,
  Folder,
  Code,
  Briefcase,
  GraduationCap,
  FlaskConical,
  Gamepad2,
  Cpu,
  Layers,
  Sparkles,
  Compass,
  Database,
  Terminal,
  Globe,
  Palette,
  Box,
  Layout,
} from 'lucide-react';

export interface ProjectColorOption {
  readonly id: string;
  readonly label: string;
  readonly bgToken: string;
  readonly borderToken: string;
}

export const PROJECT_COLOR_PALETTE: readonly ProjectColorOption[] = [
  {
    id: 'blue',
    label: 'Blue',
    bgToken: 'var(--wb-color-primary)',
    borderToken: 'var(--wb-color-primary)',
  },
  { id: 'cyan', label: 'Cyan', bgToken: '#06b6d4', borderToken: '#0891b2' },
  { id: 'violet', label: 'Violet', bgToken: '#8b5cf6', borderToken: '#7c3aed' },
  { id: 'green', label: 'Green', bgToken: '#10b981', borderToken: '#059669' },
  { id: 'amber', label: 'Amber', bgToken: '#f59e0b', borderToken: '#d97706' },
  { id: 'red', label: 'Red', bgToken: '#ef4444', borderToken: '#dc2626' },
  { id: 'pink', label: 'Pink', bgToken: '#ec4899', borderToken: '#db2777' },
  {
    id: 'slate',
    label: 'Slate',
    bgToken: 'var(--wb-color-fg-muted)',
    borderToken: 'var(--wb-color-border-bold)',
  },
] as const;

export const getProjectColorVar = (colorName?: string): string => {
  const match = PROJECT_COLOR_PALETTE.find((c) => c.id === colorName);
  return match ? match.bgToken : 'var(--wb-color-primary)';
};

export interface ProjectIconOption {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const PROJECT_ICON_LIST: readonly ProjectIconOption[] = [
  { id: 'folder', label: 'Folder', icon: Folder },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'graduation-cap', label: 'Education', icon: GraduationCap },
  { id: 'flask', label: 'Lab / Research', icon: FlaskConical },
  { id: 'gamepad', label: 'Gaming', icon: Gamepad2 },
  { id: 'cpu', label: 'Systems / AI', icon: Cpu },
  { id: 'layers', label: 'Architecture', icon: Layers },
  { id: 'sparkles', label: 'Creative', icon: Sparkles },
  { id: 'compass', label: 'Exploration', icon: Compass },
  { id: 'database', label: 'Data', icon: Database },
  { id: 'terminal', label: 'CLI / Backend', icon: Terminal },
  { id: 'globe', label: 'Web', icon: Globe },
  { id: 'palette', label: 'Design', icon: Palette },
  { id: 'box', label: 'Package', icon: Box },
  { id: 'layout', label: 'Dashboard', icon: Layout },
] as const;

export const renderProjectIcon = (
  iconName?: string,
  size = 20,
  className = '',
): React.ReactElement => {
  const match = PROJECT_ICON_LIST.find((i) => i.id === iconName);
  const IconComponent = match ? match.icon : Folder;
  return React.createElement(IconComponent, { size, className });
};

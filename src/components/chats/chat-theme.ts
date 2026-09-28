import React from 'react';
import {
  LucideIcon,
  MessageSquare,
  MessageSquareCode,
  Sparkles,
  Bot,
  BrainCircuit,
  Terminal,
  Cpu,
  Bookmark,
  Lightbulb,
  Workflow,
  Compass,
  FolderKanban,
  FileCode2,
  Atom,
  Boxes,
  Zap,
} from 'lucide-react';
import { PROJECT_COLOR_PALETTE, ProjectColorOption } from '@/components/projects/project-theme';

export const CHAT_GROUP_COLOR_PALETTE: readonly ProjectColorOption[] = PROJECT_COLOR_PALETTE;

export const getChatGroupColorVar = (colorName?: string): string => {
  const match = CHAT_GROUP_COLOR_PALETTE.find((c) => c.id === colorName);
  return match ? match.bgToken : 'var(--wb-color-primary)';
};

export interface ChatGroupIconOption {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const CHAT_GROUP_ICON_LIST: readonly ChatGroupIconOption[] = [
  { id: 'message-square', label: 'Chat', icon: MessageSquare },
  { id: 'message-code', label: 'Code Discussion', icon: MessageSquareCode },
  { id: 'brain', label: 'Reasoning', icon: BrainCircuit },
  { id: 'sparkles', label: 'Ideas & Brainstorm', icon: Sparkles },
  { id: 'bot', label: 'Assistant', icon: Bot },
  { id: 'terminal', label: 'Terminal / CLI', icon: Terminal },
  { id: 'cpu', label: 'System Architecture', icon: Cpu },
  { id: 'lightbulb', label: 'Insights', icon: Lightbulb },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'compass', label: 'Research', icon: Compass },
  { id: 'kanban', label: 'Planning', icon: FolderKanban },
  { id: 'file-code', label: 'Snippets', icon: FileCode2 },
  { id: 'atom', label: 'Deep Dive', icon: Atom },
  { id: 'boxes', label: 'Modular', icon: Boxes },
  { id: 'zap', label: 'Rapid Prototype', icon: Zap },
  { id: 'bookmark', label: 'Curated', icon: Bookmark },
] as const;

export const renderChatGroupIcon = (
  iconName?: string,
  size = 18,
  className = '',
): React.ReactElement => {
  const match = CHAT_GROUP_ICON_LIST.find((i) => i.id === iconName);
  const IconComponent = match ? match.icon : MessageSquare;
  return React.createElement(IconComponent, { size, className });
};

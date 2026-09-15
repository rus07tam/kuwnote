import type { ReactNode } from 'react';

export type RichTextSize = 'sm' | 'base' | 'lg' | 'xl';
export type RichTextColor =
  | 'default'
  | 'muted'
  | 'red'
  | 'green'
  | 'blue'
  | 'amber'
  | 'purple'
  | 'pink'
  | 'cyan'
  | (string & {});

export interface RichTextSpan {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: RichTextColor;
  size?: RichTextSize;
}

export type BlockType =
  | 'paragraph'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  | 'bullet-list'
  | 'numbered-list'
  | 'todo-list'
  | 'divider'
  | 'table';

export interface TableCell {
  id: string;
  spans: RichTextSpan[];
}

export interface TableData {
  headers: TableCell[];
  rows: TableCell[][];
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  spans: RichTextSpan[];
  level?: number; // List nesting level (0, 1, 2, 3...)
  checked?: boolean; // For todo-list
  tableData?: TableData; // For table block
}

export interface DocumentMetadata {
  tags: string[];
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteDocument {
  id: string;
  workspaceId: string;
  title: string;
  metadata: DocumentMetadata;
  blocks: DocumentBlock[];
}

export type WorkspaceItemType = 'folder' | 'document';

export interface WorkspaceItem {
  id: string;
  workspaceId: string;
  parentId: string | null; // null means root of workspace
  type: WorkspaceItemType;
  title: string;
  icon?: string;
  color?: string;
  isExpanded?: boolean; // for folders
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export type NavPosition = 'left' | 'right' | 'top' | 'bottom';
export type MenuPosition = 'left' | 'right';
export type MenuType = 'inline' | 'floating';

export interface AppLayoutConfig {
  navPosition: NavPosition;
  menuPosition: MenuPosition;
  menuType: MenuType;
  menuWidth: number;
  activeNavTab: string;
  isMenuOpen: boolean;
}

export type AppTheme = 'system' | 'light' | 'dark';
export type AccentColor =
  | 'indigo'
  | 'emerald'
  | 'sapphire'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'cyan'
  | 'dynamic-android';

export interface AppSettings {
  theme: AppTheme;
  accentColor: AccentColor;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'compact' | 'normal' | 'spacious';
  editorMode: 'edit' | 'read';
  spellcheck: boolean;
  showLineNumbers: boolean;
  autoSaveInterval: number; // in seconds
}

// Extensibility & Plugin API types
export interface ExtensionNavItem {
  id: string;
  label: string;
  iconName: string;
  tooltip?: string;
  badge?: string | number;
  order?: number;
}

export interface ExtensionMenuPanel {
  id: string;
  title: string;
  render: () => ReactNode;
}

export interface ExtensionContentView {
  id: string;
  title: string;
  render: () => ReactNode;
}

export interface ExtensionBottomAction {
  id: string;
  label: string;
  iconName: string;
  onClick: () => void;
}

export interface KuwnoteExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  navItems?: ExtensionNavItem[];
  menuPanels?: Record<string, ExtensionMenuPanel>;
  contentViews?: Record<string, ExtensionContentView>;
  bottomActions?: ExtensionBottomAction[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
  action: () => void;
}

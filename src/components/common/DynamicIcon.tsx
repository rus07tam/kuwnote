import React from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  BookOpen,
  Sparkles,
  Brain,
  Command,
  Settings,
  Search,
  CheckSquare,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Table,
  Minus,
  Code,
  Tag,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Move,
  Eye,
  Check,
  X,
  Palette,
  Layout,
  Sliders,
  PanelLeft,
  PanelRight,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Laptop,
  Share2,
  Download,
  Upload,
  RefreshCw,
  FolderPlus,
  FilePlus,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  folder: Folder,
  'folder-open': FolderOpen,
  'folder-plus': FolderPlus,
  'file-text': FileText,
  'file-plus': FilePlus,
  'book-open': BookOpen,
  sparkles: Sparkles,
  brain: Brain,
  command: Command,
  settings: Settings,
  search: Search,
  'check-square': CheckSquare,
  list: List,
  'list-ordered': ListOrdered,
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  'heading-4': Heading4,
  'heading-5': Heading5,
  'heading-6': Heading6,
  table: Table,
  divider: Minus,
  code: Code,
  tag: Tag,
  calendar: Calendar,
  layers: Layers,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  plus: Plus,
  'more-horizontal': MoreHorizontal,
  trash: Trash2,
  edit: Edit2,
  copy: Copy,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  move: Move,
  eye: Eye,
  check: Check,
  x: X,
  palette: Palette,
  layout: Layout,
  sliders: Sliders,
  'panel-left': PanelLeft,
  'panel-right': PanelRight,
  maximize: Maximize2,
  minimize: Minimize2,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  share: Share2,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
};

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name = 'file-text',
  className = 'w-4 h-4',
  size,
}) => {
  if (!name) return <FileText className={className} size={size} />;

  // Check if it's an emoji (character length > 0 and not ascii letters/dash)
  const isEmoji = /\p{Extended_Pictographic}/u.test(name);
  if (isEmoji) {
    return (
      <span
        className={`inline-flex items-center justify-center leading-none ${className}`}
        style={size ? { fontSize: `${size}px` } : undefined}
      >
        {name}
      </span>
    );
  }

  const normalized = name.toLowerCase().trim();
  const IconComponent = ICON_MAP[normalized] || FileText;

  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'folder',
  'book-open',
  'sparkles',
  'brain',
  'file-text',
  'command',
  'check-square',
  'table',
  'tag',
  'calendar',
  'layers',
  'code',
  'palette',
];

export const AVAILABLE_EMOJIS = [
  '📝',
  '🚀',
  '💡',
  '⭐',
  '📚',
  '🎯',
  '🔥',
  '✨',
  '🧠',
  '⚙️',
  '🎨',
  '💼',
  '📌',
  '🌱',
  '🔮',
  '💎',
];

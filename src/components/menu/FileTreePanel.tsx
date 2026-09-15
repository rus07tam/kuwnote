import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkspaceItem } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { Button } from '../ui/Button';
import {
  Plus,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  MoreVertical,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TreeItemProps {
  item: WorkspaceItem;
  level: number;
  draggedItemId: string | null;
  setDraggedItemId: (id: string | null) => void;
}

export const FileTreePanel: React.FC = () => {
  const {
    activeWorkspace,
    workspaceItems,
    openDocument,
    activeDocId,
    toggleFolderExpanded,
    openModal,
    openContextMenu,
    deleteItem,
    duplicateItem,
    moveItem,
  } = useApp();

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  // Group items by parentId
  const itemsByParent = React.useMemo(() => {
    const map = new Map<string | null, WorkspaceItem[]>();
    for (const item of workspaceItems) {
      const p = item.parentId || null;
      if (!map.has(p)) {
        map.set(p, []);
      }
      map.get(p)!.push(item);
    }
    // Sort: folders first, then alphabetically
    for (const [, list] of map) {
      list.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      });
    }
    return map;
  }, [workspaceItems]);

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverRoot(false);
    if (draggedItemId) {
      moveItem(draggedItemId, null);
      setDraggedItemId(null);
    }
  };

  const TreeItem: React.FC<TreeItemProps> = ({ item, level }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const isFolder = item.type === 'folder';
    const isSelected = item.type === 'document' && item.id === activeDocId;
    const children = itemsByParent.get(item.id) || [];

    const handleContextMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      openContextMenu(e, [
        {
          id: 'rename',
          label: 'Переименовать',
          icon: 'edit',
          action: () => openModal('rename-item', item),
        },
        {
          id: 'duplicate',
          label: 'Дублировать',
          icon: 'copy',
          action: () => duplicateItem(item.id),
        },
        {
          id: 'move',
          label: 'Переместить в папку...',
          icon: 'move',
          action: () => openModal('move-item', item),
        },
        ...(isFolder
          ? [
              {
                id: 'new-doc-inside',
                label: 'Новый файл в этой папке',
                icon: 'file-plus',
                separatorBefore: true,
                action: () => openModal('create-item', { type: 'document', parentId: item.id }),
              },
              {
                id: 'new-folder-inside',
                label: 'Новая подпапка',
                icon: 'folder-plus',
                action: () => openModal('create-item', { type: 'folder', parentId: item.id }),
              },
            ]
          : []),
        {
          id: 'delete',
          label: isFolder ? 'Удалить папку' : 'Удалить файл',
          icon: 'trash',
          danger: true,
          separatorBefore: true,
          action: () => {
            if (
              confirm(
                `Вы уверены, что хотите удалить "${item.title}"?${
                  isFolder ? ' Все вложенные элементы также будут удалены.' : ''
                }`
              )
            ) {
              deleteItem(item.id);
            }
          },
        },
      ]);
    };

    const handleClick = () => {
      if (isFolder) {
        toggleFolderExpanded(item.id);
      } else {
        openDocument(item.id);
      }
    };

    const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.setData('text/plain', item.id);
      setDraggedItemId(item.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!isFolder || draggedItemId === item.id) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (isFolder && draggedItemId && draggedItemId !== item.id) {
        moveItem(draggedItemId, item.id);
        setDraggedItemId(null);
      }
    };

    return (
      <div className="select-none">
        <div
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{ paddingLeft: `${Math.max(8, level * 14 + 8)}px` }}
          className={cn(
            'group flex cursor-pointer items-center justify-between py-1.5 pr-2 text-xs rounded-md transition-all',
            isSelected
              ? 'bg-indigo-500/10 text-indigo-700 font-medium dark:bg-indigo-500/20 dark:text-indigo-300'
              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60',
            isDragOver && 'bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-950/60',
            draggedItemId === item.id && 'opacity-40'
          )}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isFolder ? (
              <span className="text-zinc-400 dark:text-zinc-500">
                {item.isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            ) : (
              <span className="w-3.5" />
            )}

            {isFolder ? (
              item.isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )
            ) : item.icon ? (
              <DynamicIcon name={item.icon} className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            )}

            <span className="truncate">{item.title}</span>
          </div>

          <button
            type="button"
            onClick={handleContextMenu}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>

        {/* Children if expanded folder */}
        {isFolder && item.isExpanded && children.length > 0 && (
          <div className="relative">
            <div
              className="absolute left-[15px] top-0 bottom-0 w-px bg-zinc-200/60 dark:bg-zinc-800/60"
              style={{ left: `${level * 14 + 14}px` }}
            />
            {children.map((child) => (
              <TreeItem
                key={child.id}
                item={child}
                level={level + 1}
                draggedItemId={draggedItemId}
                setDraggedItemId={setDraggedItemId}
              />
            ))}
          </div>
        )}

        {isFolder && item.isExpanded && children.length === 0 && (
          <div
            style={{ paddingLeft: `${(level + 1) * 14 + 22}px` }}
            className="py-1 text-[11px] italic text-zinc-400 dark:text-zinc-600"
          >
            Пустая папка
          </div>
        )}
      </div>
    );
  };

  const rootItems = itemsByParent.get(null) || [];

  return (
    <div className="flex h-full flex-col">
      {/* Header with workspace name and create buttons */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-800/80">
        <div className="truncate pr-2">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: activeWorkspace?.color || '#6366f1' }}
            />
            <h3 className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {activeWorkspace?.name || 'Воркспейс'}
            </h3>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {workspaceItems.filter((i) => i.type === 'document').length} документов
          </p>
        </div>

        {/* Quick create toolbar */}
        <div className="flex items-center gap-1">
          <Button
            id="btn-create-file"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400"
            onClick={() => openModal('create-item', { type: 'document', parentId: null })}
            title="Создать файл"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            id="btn-create-folder"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400"
            onClick={() => openModal('create-item', { type: 'folder', parentId: null })}
            title="Создать папку"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tree Content */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverRoot(true);
        }}
        onDragLeave={() => setIsDragOverRoot(false)}
        onDrop={handleRootDrop}
        className={cn(
          'flex-1 overflow-y-auto p-1.5 transition-colors',
          isDragOverRoot && 'bg-indigo-50/50 dark:bg-indigo-950/20'
        )}
      >
        {rootItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <FileText className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-xs">В этом воркспейсе еще нет файлов</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => openModal('create-item', { type: 'document', parentId: null })}
              >
                <Plus className="mr-1 h-3 w-3" /> Файл
              </Button>
            </div>
          </div>
        ) : (
          rootItems.map((item) => (
            <TreeItem
              key={item.id}
              item={item}
              level={0}
              draggedItemId={draggedItemId}
              setDraggedItemId={setDraggedItemId}
            />
          ))
        )}
      </div>
    </div>
  );
};

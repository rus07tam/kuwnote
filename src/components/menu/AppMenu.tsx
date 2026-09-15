import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { usePluginRegistry, pluginRegistry } from '../../services/pluginApi';
import { WorkspacesPanel } from './WorkspacesPanel';
import { FileTreePanel } from './FileTreePanel';
import { SearchPanel } from './SearchPanel';
import { SettingsPanel } from './SettingsPanel';
import { DynamicIcon } from '../common/DynamicIcon';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../lib/utils';
import { Plus, FilePlus, FolderPlus, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const AppMenu: React.FC = () => {
  const { layout, setMenuWidth, toggleMenu, openModal } = useApp();
  const { bottomActions: pluginBottomActions } = usePluginRegistry();

  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startWidthRef = useRef(layout.menuWidth);

  // Resize handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = e.clientX;
    startWidthRef.current = layout.menuWidth;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startPosRef.current;
      // If menu is on the left, moving mouse right increases width
      // If menu is on the right, moving mouse left increases width
      const multiplier = layout.menuPosition === 'left' ? 1 : -1;
      const newWidth = startWidthRef.current + delta * multiplier;
      setMenuWidth(newWidth);
    },
    [isResizing, layout.menuPosition, setMenuWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!layout.isMenuOpen) {
    return null;
  }

  // Render panel based on active navigation tab
  const renderMenuContent = () => {
    switch (layout.activeNavTab) {
      case 'workspaces':
        return <WorkspacesPanel />;
      case 'files':
        return <FileTreePanel />;
      case 'search':
        return <SearchPanel />;
      case 'settings':
        return <SettingsPanel />;
      default: {
        // Check if a plugin registered a menu panel for this tab
        const pluginPanel = pluginRegistry.getMenuPanel(layout.activeNavTab);
        if (pluginPanel) {
          return (
            <div className="flex h-full flex-col p-3">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {pluginPanel.title}
              </h3>
              <div className="flex-1 overflow-y-auto">{pluginPanel.render()}</div>
            </div>
          );
        }
        return <FileTreePanel />;
      }
    }
  };

  const isLeft = layout.menuPosition === 'left';
  const isFloating = layout.menuType === 'floating';

  return (
    <aside
      id="kuwnote-app-menu"
      style={{ width: `${layout.menuWidth}px` }}
      className={cn(
        'group/menu z-30 flex flex-col select-none transition-all duration-150',
        'border-zinc-200/80 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-900/95 backdrop-blur-md',
        // Positioning
        isLeft ? 'order-first border-r' : 'order-last border-l',
        // Floating styling
        isFloating && [
          'shadow-2xl rounded-2xl my-3 border',
          isLeft ? 'ml-3' : 'mr-3',
          'h-[calc(100%-1.5rem)]',
        ],
        !isFloating && 'h-full',
        isResizing && 'transition-none select-none'
      )}
    >
      {/* Resizer Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute top-0 bottom-0 z-40 w-2 cursor-col-resize transition-all hover:bg-indigo-500/30 group-hover/menu:opacity-100',
          isLeft ? '-right-1' : '-left-1',
          isResizing && 'bg-indigo-500/50 w-2.5'
        )}
        title="Потяните для изменения ширины меню"
      >
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-zinc-300 transition-all dark:bg-zinc-700 hover:bg-indigo-500',
            isLeft ? 'right-0' : 'left-0'
          )}
        />
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-hidden">{renderMenuContent()}</div>

      {/* Fixed Centered Bottom Toolbar */}
      <div
        id="menu-bottom-toolbar"
        className="sticky bottom-0 z-20 flex items-center justify-center gap-1 border-t border-zinc-200/80 bg-zinc-50/90 px-3 py-2 backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-950/90"
      >
        {/* Quick new document */}
        <Tooltip content="Новая заметка" side="top">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={() => openModal('create-item', { type: 'document', parentId: null })}
          >
            <FilePlus className="h-4 w-4" />
          </Button>
        </Tooltip>

        {/* Quick new folder */}
        <Tooltip content="Новая папка" side="top">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={() => openModal('create-item', { type: 'folder', parentId: null })}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </Tooltip>

        {/* Plugin extension bottom actions */}
        {pluginBottomActions.map((action) => (
          <Tooltip key={action.id} content={action.label} side="top">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={action.onClick}
            >
              <DynamicIcon name={action.iconName} className="h-4 w-4" />
            </Button>
          </Tooltip>
        ))}

        {/* Collapse toggle */}
        <Tooltip content="Свернуть меню" side="top">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
            onClick={toggleMenu}
          >
            {isLeft ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
};

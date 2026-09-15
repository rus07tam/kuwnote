import React from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { Button } from '../ui/Button';
import { Plus, Check, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export const WorkspacesPanel: React.FC = () => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    openModal,
    openContextMenu,
    deleteWorkspace,
  } = useApp();

  const handleContextMenu = (e: React.MouseEvent, ws: (typeof workspaces)[0]) => {
    openContextMenu(e, [
      {
        id: 'edit-ws',
        label: 'Редактировать воркспейс',
        icon: 'edit',
        action: () => openModal('edit-workspace', ws),
      },
      {
        id: 'rename-ws',
        label: 'Переименовать',
        icon: 'edit',
        action: () => openModal('rename-workspace', { id: ws.id, currentTitle: ws.name }),
      },
      {
        id: 'delete-ws',
        label: 'Удалить воркспейс',
        icon: 'trash',
        danger: true,
        disabled: workspaces.length <= 1,
        separatorBefore: true,
        action: () => {
          if (confirm(`Удалить воркспейс "${ws.name}" и все его документы?`)) {
            deleteWorkspace(ws.id);
          }
        },
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-800/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Воркспейсы
          </h3>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {workspaces.length} пространств
          </p>
        </div>
        <Button
          id="btn-create-workspace"
          size="sm"
          variant="outline"
          onClick={() => openModal('create-workspace')}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Создать</span>
        </Button>
      </div>

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <div
              key={ws.id}
              id={`workspace-item-${ws.id}`}
              onClick={() => setActiveWorkspaceId(ws.id)}
              onContextMenu={(e) => handleContextMenu(e, ws)}
              className={cn(
                'group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-all',
                isActive
                  ? 'bg-zinc-200/80 text-zinc-950 font-medium shadow-xs dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                  style={{ backgroundColor: ws.color || '#6366f1' }}
                >
                  <DynamicIcon name={ws.icon} className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">{ws.name}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isActive && (
                  <Check className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 opacity-100" />
                )}
                <button
                  type="button"
                  onClick={(e) => handleContextMenu(e, ws)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700"
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

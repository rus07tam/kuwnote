import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { cn } from '../../lib/utils';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu } = useApp();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen || contextMenu.items.length === 0) return null;

  // Clamp positioning to prevent overflow outside screen
  const menuWidth = 190;
  const menuHeight = contextMenu.items.length * 34 + 16;
  const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 10);
  const y = Math.min(contextMenu.y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(10, x)}px`, top: `${Math.max(10, y)}px` }}
      className="fixed z-50 min-w-[180px] rounded-lg border border-zinc-200 bg-white/95 p-1 text-zinc-950 shadow-xl backdrop-blur-md transition-all animate-in fade-in-80 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-50"
    >
      {contextMenu.items.map((item, idx) => (
        <React.Fragment key={item.id || idx}>
          {item.separatorBefore && (
            <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          )}
          <button
            disabled={item.disabled}
            onClick={() => {
              item.action();
              closeContextMenu();
            }}
            className={cn(
              'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
              item.danger
                ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50'
                : 'text-zinc-700 dark:text-zinc-300',
              item.disabled && 'pointer-events-none opacity-40'
            )}
          >
            {item.icon && <DynamicIcon name={item.icon} className="h-3.5 w-3.5 shrink-0" />}
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

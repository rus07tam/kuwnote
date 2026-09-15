import React from 'react';
import { TauriBridge, APP_INFO } from '../../services/tauri';
import { useApp } from '../../context/AppContext';
import { Minus, Square, X, Sparkles } from 'lucide-react';

export const TauriTitlebar: React.FC = () => {
  const { activeWorkspace, activeDocument } = useApp();

  return (
    <header
      data-tauri-drag-region
      className="flex h-8 select-none items-center justify-between border-b border-zinc-200/70 bg-zinc-100/80 px-3 text-xs text-zinc-600 backdrop-blur-md dark:border-zinc-850 dark:bg-zinc-950/80 dark:text-zinc-400"
    >
      {/* Left: App Identity */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
          Kuwnote
        </span>
        <span className="text-[10px] text-zinc-400 hidden sm:inline">
          {APP_INFO.packageIdentifier}
        </span>
      </div>

      {/* Middle: Active Document / Workspace breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] truncate max-w-sm">
        <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
          {activeWorkspace?.name}
        </span>
        {activeDocument && (
          <>
            <span className="text-zinc-400">/</span>
            <span className="truncate text-zinc-900 dark:text-zinc-100 font-semibold">
              {activeDocument.title}
            </span>
          </>
        )}
      </div>

      {/* Right: Window Controls (Tauri bridge + web simulation) */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => TauriBridge.minimizeWindow()}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          title="Свернуть"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => TauriBridge.toggleMaximizeWindow()}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          title="Развернуть"
        >
          <Square className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={() => TauriBridge.closeWindow()}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-500 hover:text-white transition-colors"
          title="Закрыть"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </header>
  );
};

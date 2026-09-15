import React from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentEditor } from '../editor/DocumentEditor';
import { SettingsPanel } from '../menu/SettingsPanel';
import { pluginRegistry } from '../../services/pluginApi';
import { Button } from '../ui/Button';
import {
  FileText,
  Plus,
  Settings,
  Sparkles,
  Layers,
  FolderPlus,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const ContentArea: React.FC = () => {
  const {
    activeDocId,
    activeDocument,
    workspaceItems,
    openDocument,
    openModal,
    updateLayout,
    layout,
  } = useApp();

  // Check if a plugin registered a custom content view for current tab
  const pluginContentView = pluginRegistry.getContentView(layout.activeNavTab);
  if (pluginContentView) {
    return (
      <main id="kuwnote-content-area" className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl p-6">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {pluginContentView.title}
          </h2>
          {pluginContentView.render()}
        </div>
      </main>
    );
  }

  // If a document is active, display the editor
  if (activeDocId && activeDocument) {
    return (
      <main id="kuwnote-content-area" className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-950">
        <DocumentEditor />
      </main>
    );
  }

  // If settings tab is active and no doc is open, show settings directly in main content
  if (layout.activeNavTab === 'settings') {
    return (
      <main id="kuwnote-content-area" className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-950 p-6">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Настройки Kuwnote
          </h2>
          <SettingsPanel isEmbedded={true} />
        </div>
      </main>
    );
  }

  // Recent documents in active workspace
  const docItems = workspaceItems.filter((i) => i.type === 'document').slice(0, 5);

  // Default Empty State: "Здесь будут открываться файлы и виджеты"
  return (
    <main
      id="kuwnote-content-area"
      className="flex flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-zinc-50/50 p-8 text-center dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-md space-y-5 animate-in fade-in zoom-in-95">
        {/* Subtle decorative icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <FileText className="h-8 w-8 text-indigo-500/80" />
        </div>

        {/* Title and prompt-prescribed message */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Здесь будут открываться файлы и виджеты
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Выберите документ в боковом меню слева или создайте новую заметку с rich-блоками,
            таблицами и списками.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            id="empty-state-new-doc"
            onClick={() => openModal('create-item', { type: 'document', parentId: null })}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Новая заметка</span>
          </Button>

          <Button
            id="empty-state-new-folder"
            variant="outline"
            onClick={() => openModal('create-item', { type: 'folder', parentId: null })}
            className="gap-1.5"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Новая папка</span>
          </Button>
        </div>

        {/* Recent files list if available */}
        {docItems.length > 0 && (
          <div className="mt-6 text-left border-t border-zinc-200/80 pt-4 dark:border-zinc-800/80">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Недавние документы
            </h4>
            <div className="space-y-1">
              {docItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openDocument(item.id)}
                  className="group flex w-full items-center justify-between rounded-lg p-2 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-850"
                >
                  <div className="flex items-center gap-2 truncate text-zinc-700 dark:text-zinc-300">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

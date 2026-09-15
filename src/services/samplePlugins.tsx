import React, { useState } from 'react';
import { pluginRegistry } from './pluginApi';
import { Network, Sparkles, StickyNote, Activity, FileText } from 'lucide-react';

export function initializeDefaultPlugins(): void {
  // 1. Obsidian-style Graph View Plugin
  pluginRegistry.register({
    id: 'graph-view',
    name: 'Граф связей (Graph View)',
    description: 'Интерактивная карта связей между документами и тегами',
    version: '1.0.0',
    navItems: [
      {
        id: 'graph-view',
        label: 'Граф связей',
        iconName: 'layers',
        tooltip: 'Граф документов (Graph View)',
        order: 10,
      },
    ],
    menuPanels: {
      'graph-view': {
        id: 'graph-menu',
        title: 'Управление графом',
        render: () => (
          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <p>Визуализация графа связей между документами и тегами текущего воркспейса.</p>
            <div className="rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800 space-y-1.5 bg-zinc-50 dark:bg-zinc-900">
              <div className="font-semibold text-zinc-850 dark:text-zinc-200">Фильтры графа:</div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Отображать теги как узлы</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Группировать по папкам</span>
              </label>
            </div>
          </div>
        ),
      },
    },
    contentViews: {
      'graph-view': {
        id: 'graph-content',
        title: 'Интерактивный граф заметок',
        render: () => (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-900/40 min-h-[400px]">
            <div className="relative flex h-64 w-full max-w-lg items-center justify-center">
              {/* Decorative canvas of nodes */}
              <div className="absolute top-8 left-12 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-xs shadow-lg animate-pulse">
                Kuwnote
              </div>
              <div className="absolute top-24 right-16 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-xs shadow-md">
                Doc
              </div>
              <div className="absolute bottom-12 left-24 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white text-xs shadow-md">
                Tags
              </div>
              <div className="absolute bottom-10 right-28 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] shadow-md">
                v2
              </div>
              {/* Connecting lines */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none stroke-zinc-300 dark:stroke-zinc-700">
                <line x1="120" y1="60" x2="360" y2="120" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="120" y1="60" x2="160" y2="200" strokeWidth="1.5" />
                <line x1="360" y1="120" x2="280" y2="210" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Плагин «Граф связей» загружен через Extensibility API Kuwnote.
            </p>
          </div>
        ),
      },
    },
  });
}

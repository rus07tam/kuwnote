import {
  Workspace,
  WorkspaceItem,
  NoteDocument,
  DocumentBlock,
  AppSettings,
  AppLayoutConfig,
} from '../types';

const STORAGE_KEYS = {
  WORKSPACES: 'kuwnote_workspaces_v1',
  WORKSPACE_ITEMS: 'kuwnote_workspace_items_v1',
  DOCUMENTS: 'kuwnote_documents_v1',
  ACTIVE_WORKSPACE: 'kuwnote_active_workspace_v1',
  ACTIVE_DOCUMENT: 'kuwnote_active_doc_v1',
  SETTINGS: 'kuwnote_settings_v1',
  LAYOUT: 'kuwnote_layout_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accentColor: 'indigo',
  fontFamily: 'sans',
  fontSize: 'normal',
  editorMode: 'edit',
  spellcheck: true,
  showLineNumbers: false,
  autoSaveInterval: 3,
};

export function getDefaultLayout(): AppLayoutConfig {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return {
    navPosition: isMobile ? 'bottom' : 'left',
    menuPosition: 'left',
    menuType: isMobile ? 'inline' : 'floating',
    menuWidth: 290,
    activeNavTab: 'files',
    isMenuOpen: true,
  };
}

export function createSpan(
  text: string,
  options?: Partial<import('../types').RichTextSpan>
): import('../types').RichTextSpan {
  return {
    id: `span_${Math.random().toString(36).substring(2, 9)}`,
    text,
    ...options,
  };
}

export function createDefaultBlock(type: import('../types').BlockType = 'paragraph', text = ''): DocumentBlock {
  const id = `block_${Math.random().toString(36).substring(2, 10)}`;
  
  if (type === 'table') {
    return {
      id,
      type: 'table',
      spans: [],
      tableData: {
        headers: [
          { id: 'h1', spans: [createSpan('Функция', { bold: true })] },
          { id: 'h2', spans: [createSpan('Статус', { bold: true })] },
          { id: 'h3', spans: [createSpan('Описание', { bold: true })] },
        ],
        rows: [
          [
            { id: 'r1c1', spans: [createSpan('Воркспейсы')] },
            { id: 'r1c2', spans: [createSpan('Готово', { color: 'green', bold: true })] },
            { id: 'r1c3', spans: [createSpan('Иконка, цвет, дерево файлов')] },
          ],
          [
            { id: 'r2c1', spans: [createSpan('Блочный редактор')] },
            { id: 'r2c2', spans: [createSpan('Готово', { color: 'green', bold: true })] },
            { id: 'r2c3', spans: [createSpan('H1-H6, списки, таблицы, форматирование')] },
          ],
          [
            { id: 'r3c1', spans: [createSpan('API плагинов')] },
            { id: 'r3c2', spans: [createSpan('Активно', { color: 'blue' })] },
            { id: 'r3c3', spans: [createSpan('Расширяемые меню, тулбар и контент')] },
          ],
        ],
      },
    };
  }

  return {
    id,
    type,
    spans: [createSpan(text)],
    level: 0,
    checked: false,
  };
}

const INITIAL_SEED = (() => {
  const ws1Id = 'ws_personal';
  const ws2Id = 'ws_work';

  const initialWorkspaces: Workspace[] = [
    {
      id: ws1Id,
      name: 'Личные заметки',
      icon: 'sparkles',
      color: '#6366f1', // Indigo
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: ws2Id,
      name: 'Kuwnote Core & Dev',
      icon: 'brain',
      color: '#10b981', // Emerald
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 7200000,
    },
  ];

  const doc1Id = 'doc_welcome';
  const doc2Id = 'doc_shortcuts';
  const folder1Id = 'folder_projects';
  const doc3Id = 'doc_project_plan';

  const initialItems: WorkspaceItem[] = [
    {
      id: doc1Id,
      workspaceId: ws1Id,
      parentId: null,
      type: 'document',
      title: 'Добро пожаловать в Kuwnote',
      icon: 'book-open',
      color: '#6366f1',
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 1200000,
    },
    {
      id: folder1Id,
      workspaceId: ws1Id,
      parentId: null,
      type: 'folder',
      title: 'Проекты и архитектура',
      icon: 'folder',
      color: '#f59e0b',
      isExpanded: true,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: doc3Id,
      workspaceId: ws1Id,
      parentId: folder1Id,
      type: 'document',
      title: 'План релиза Kuwnote Desktop',
      icon: 'file-text',
      color: '#10b981',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: doc2Id,
      workspaceId: ws1Id,
      parentId: null,
      type: 'document',
      title: 'Горячие клавиши и форматирование',
      icon: 'command',
      color: '#ec4899',
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 4500000,
    },
  ];

  const initialDocs: Record<string, NoteDocument> = {
    [doc1Id]: {
      id: doc1Id,
      workspaceId: ws1Id,
      title: 'Добро пожаловать в Kuwnote',
      metadata: {
        tags: ['kuwnote', 'notion', 'obsidian', 'руководство', 'блоки'],
        icon: 'book-open',
        color: '#6366f1',
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 1200000,
      },
      blocks: [
        {
          id: 'b1',
          type: 'heading-1',
          spans: [
            createSpan('Kuwnote: Новое поколение модульных заметок', {
              bold: true,
              color: 'purple',
            }),
          ],
        },
        {
          id: 'b2',
          type: 'paragraph',
          spans: [
            createSpan('Kuwnote объединяет гибкость '),
            createSpan('Notion', { bold: true, color: 'blue' }),
            createSpan(' и свободу '),
            createSpan('Obsidian', { bold: true, color: 'purple' }),
            createSpan('. Все данные структурированы по '),
            createSpan('воркспейсам', { code: true }),
            createSpan(', а документы состоят из независимых блоков с rich-текстом.'),
          ],
        },
        {
          id: 'b3',
          type: 'heading-2',
          spans: [createSpan('1. Структура приложения', { bold: true })],
        },
        {
          id: 'b4',
          type: 'bullet-list',
          level: 0,
          spans: [
            createSpan('Воркспейсы: ', { bold: true }),
            createSpan('Каждый воркспейс имеет свое дерево файлов, цветовую тему и иконку.'),
          ],
        },
        {
          id: 'b5',
          type: 'bullet-list',
          level: 1,
          spans: [
            createSpan('Поддержка вложенных папок и drag-and-drop перемещения.', { italic: true }),
          ],
        },
        {
          id: 'b6',
          type: 'bullet-list',
          level: 0,
          spans: [
            createSpan('Трехкомпонентный интерфейс: ', { bold: true }),
            createSpan('Панель навигации (4 стороны), Настраиваемое меню (inline/floating с ресайзом) и Контент.'),
          ],
        },
        {
          id: 'b7',
          type: 'heading-2',
          spans: [createSpan('2. Возможности редактора блоков', { bold: true })],
        },
        {
          id: 'b8',
          type: 'todo-list',
          checked: true,
          level: 0,
          spans: [
            createSpan('Заголовки уровней H1, H2, H3, H4, H5, H6', { strikethrough: true }),
          ],
        },
        {
          id: 'b9',
          type: 'todo-list',
          checked: true,
          level: 0,
          spans: [
            createSpan('Маркированные, нумерованные и todo-списки с вложенностью (отступы)', {
              strikethrough: true,
            }),
          ],
        },
        {
          id: 'b10',
          type: 'todo-list',
          checked: true,
          level: 1,
          spans: [
            createSpan('Переключение чекбокса в один клик!', { color: 'green', bold: true }),
          ],
        },
        {
          id: 'b11',
          type: 'todo-list',
          checked: false,
          level: 0,
          spans: [
            createSpan('Интерактивные таблицы с форматированием каждой ячейки'),
          ],
        },
        {
          id: 'b12',
          type: 'divider',
          spans: [],
        },
        {
          id: 'b13',
          type: 'heading-3',
          spans: [createSpan('Сводная таблица архитектуры', { bold: true })],
        },
        createDefaultBlock('table'),
      ],
    },
    [doc2Id]: {
      id: doc2Id,
      workspaceId: ws1Id,
      title: 'Горячие клавиши и форматирование',
      metadata: {
        tags: ['подсказки', 'шорткаты'],
        icon: 'command',
        color: '#ec4899',
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 4500000,
      },
      blocks: [
        {
          id: 'b2_1',
          type: 'heading-1',
          spans: [createSpan('Быстрые действия и управление', { bold: true })],
        },
        {
          id: 'b2_2',
          type: 'numbered-list',
          level: 0,
          spans: [
            createSpan('Переключение режима чтения/редактирования: ', { bold: true }),
            createSpan('Кнопка в шапке документа.'),
          ],
        },
        {
          id: 'b2_3',
          type: 'numbered-list',
          level: 0,
          spans: [
            createSpan('ПКМ по блоку: ', { bold: true }),
            createSpan('Дублировать, переместить вверх/вниз, конвертировать или удалить.'),
          ],
        },
        {
          id: 'b2_4',
          type: 'numbered-list',
          level: 0,
          spans: [
            createSpan('ПКМ по файлу/папке: ', { bold: true }),
            createSpan('Переименовать, дублировать, переместить в другую папку или удалить.'),
          ],
        },
        {
          id: 'b2_5',
          type: 'numbered-list',
          level: 0,
          spans: [
            createSpan('Ресайз меню: ', { bold: true }),
            createSpan('Наведите курсор на край меню и потяните мышь для изменения ширины.'),
          ],
        },
      ],
    },
    [doc3Id]: {
      id: doc3Id,
      workspaceId: ws1Id,
      title: 'План релиза Kuwnote Desktop',
      metadata: {
        tags: ['десктоп', 'tauri-v2', 'релиз'],
        icon: 'file-text',
        color: '#10b981',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 3600000,
      },
      blocks: [
        {
          id: 'b3_1',
          type: 'heading-1',
          spans: [createSpan('Kuwnote Tauri v2 Roadmap', { bold: true, color: 'green' })],
        },
        {
          id: 'b3_2',
          type: 'paragraph',
          spans: [
            createSpan('Целевой пакет: '),
            createSpan('org.ruject.kuwnote', { code: true, bold: true }),
          ],
        },
        {
          id: 'b3_3',
          type: 'todo-list',
          checked: true,
          level: 0,
          spans: [createSpan('Поддержка Tauri v2 window controls и bridge')],
        },
        {
          id: 'b3_4',
          type: 'todo-list',
          checked: true,
          level: 0,
          spans: [createSpan('Динамическое меню: floating / inline с ресайзом')],
        },
        {
          id: 'b3_5',
          type: 'todo-list',
          checked: true,
          level: 0,
          spans: [createSpan('Редактор rich-блоков и таблиц с тегами и метаданными')],
        },
      ],
    },
  };

  return {
    workspaces: initialWorkspaces,
    items: initialItems,
    documents: initialDocs,
    activeWorkspaceId: ws1Id,
    activeDocId: doc1Id,
  };
})();

export const StorageService = {
  loadWorkspaces(): Workspace[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading workspaces from storage', e);
    }
    return INITIAL_SEED.workspaces;
  },

  saveWorkspaces(workspaces: Workspace[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
    } catch (e) {
      console.error('Error saving workspaces', e);
    }
  },

  loadWorkspaceItems(): WorkspaceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKSPACE_ITEMS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading workspace items', e);
    }
    return INITIAL_SEED.items;
  },

  saveWorkspaceItems(items: WorkspaceItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving workspace items', e);
    }
  },

  loadDocuments(): Record<string, NoteDocument> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading documents', e);
    }
    return INITIAL_SEED.documents;
  },

  saveDocuments(documents: Record<string, NoteDocument>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.error('Error saving documents', e);
    }
  },

  loadActiveWorkspaceId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE) || INITIAL_SEED.activeWorkspaceId;
  },

  saveActiveWorkspaceId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, id);
  },

  loadActiveDocId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOCUMENT) || INITIAL_SEED.activeDocId;
  },

  saveActiveDocId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DOCUMENT, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_DOCUMENT);
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  loadLayout(): AppLayoutConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      if (data) return { ...getDefaultLayout(), ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading layout', e);
    }
    return getDefaultLayout();
  },

  saveLayout(layout: AppLayoutConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout));
    } catch (e) {
      console.error('Error saving layout', e);
    }
  },

  exportAllData(): string {
    const data = {
      app: 'Kuwnote',
      packageIdentifier: 'org.ruject.kuwnote',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      workspaces: this.loadWorkspaces(),
      items: this.loadWorkspaceItems(),
      documents: this.loadDocuments(),
      settings: this.loadSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.workspaces && Array.isArray(data.workspaces)) {
        this.saveWorkspaces(data.workspaces);
      }
      if (data.items && Array.isArray(data.items)) {
        this.saveWorkspaceItems(data.items);
      }
      if (data.documents && typeof data.documents === 'object') {
        this.saveDocuments(data.documents);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.clear();
  },
};

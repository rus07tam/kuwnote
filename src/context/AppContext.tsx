import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Workspace,
  WorkspaceItem,
  NoteDocument,
  DocumentBlock,
  BlockType,
  AppLayoutConfig,
  AppSettings,
  ContextMenuItem,
} from '../types';
import {
  StorageService,
  createDefaultBlock,
} from '../services/storage';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface AppContextType {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace | undefined;
  createWorkspace: (name: string, icon?: string, color?: string) => string;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspaceId: (id: string) => void;

  // Workspace Items (Files and Folders)
  items: WorkspaceItem[];
  workspaceItems: WorkspaceItem[]; // Filtered by active workspace
  createItem: (
    title: string,
    type: 'folder' | 'document',
    parentId?: string | null,
    icon?: string,
    color?: string
  ) => string;
  renameItem: (id: string, newTitle: string) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => string | null;
  moveItem: (id: string, newParentId: string | null) => void;
  toggleFolderExpanded: (id: string) => void;

  // Documents
  documents: Record<string, NoteDocument>;
  activeDocId: string | null;
  activeDocument: NoteDocument | null;
  openDocument: (id: string | null) => void;
  updateActiveDocumentTitle: (title: string) => void;
  updateActiveDocumentMetadata: (updates: Partial<NoteDocument['metadata']>) => void;
  addTagToActiveDoc: (tag: string) => void;
  removeTagFromActiveDoc: (tag: string) => void;
  
  // Document Blocks
  addBlock: (type: BlockType, afterIndex?: number) => void;
  updateBlock: (blockId: string, updates: Partial<DocumentBlock>) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: 'up' | 'down') => void;
  deleteBlock: (blockId: string) => void;
  convertBlockType: (blockId: string, newType: BlockType) => void;
  toggleTodoBlock: (blockId: string) => void;

  // Layout
  layout: AppLayoutConfig;
  updateLayout: (updates: Partial<AppLayoutConfig>) => void;
  toggleMenu: () => void;
  setMenuWidth: (width: number) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Array<{ item: WorkspaceItem; doc?: NoteDocument; matchScore: number }>;

  // Global Context Menu
  contextMenu: ContextMenuState;
  openContextMenu: (e: React.MouseEvent, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;

  // Modals & Popups helper
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from StorageService
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.loadWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() =>
    StorageService.loadActiveWorkspaceId()
  );
  const [items, setItems] = useState<WorkspaceItem[]>(() => StorageService.loadWorkspaceItems());
  const [documents, setDocuments] = useState<Record<string, NoteDocument>>(() =>
    StorageService.loadDocuments()
  );
  const [activeDocId, setActiveDocIdState] = useState<string | null>(() =>
    StorageService.loadActiveDocId()
  );
  const [layout, setLayoutState] = useState<AppLayoutConfig>(() => StorageService.loadLayout());
  const [settings, setSettingsState] = useState<AppSettings>(() => StorageService.loadSettings());

  // In-memory UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sync state to storage
  useEffect(() => {
    StorageService.saveWorkspaces(workspaces);
  }, [workspaces]);

  useEffect(() => {
    StorageService.saveWorkspaceItems(items);
  }, [items]);

  useEffect(() => {
    StorageService.saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    StorageService.saveActiveWorkspaceId(activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    StorageService.saveActiveDocId(activeDocId);
  }, [activeDocId]);

  useEffect(() => {
    StorageService.saveLayout(layout);
  }, [layout]);

  useEffect(() => {
    StorageService.saveSettings(settings);
    // Apply theme class to documentElement
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings]);

  // Responsive default layout check on screen resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && layout.navPosition === 'left' && layout.menuType === 'floating') {
        setLayoutState((prev) => ({
          ...prev,
          navPosition: 'bottom',
          menuType: 'inline',
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout.navPosition, layout.menuType]);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const workspaceItems = useMemo(
    () => items.filter((item) => item.workspaceId === (activeWorkspace?.id || activeWorkspaceId)),
    [items, activeWorkspace, activeWorkspaceId]
  );

  const activeDocument = useMemo(() => {
    if (!activeDocId) return null;
    return documents[activeDocId] || null;
  }, [documents, activeDocId]);

  // Workspace actions
  const createWorkspace = useCallback(
    (name: string, icon = 'folder', color = '#6366f1'): string => {
      const id = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newWs: Workspace = {
        id,
        name: name.trim() || 'Новый воркспейс',
        icon,
        color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspaceIdState(id);
      return id;
    },
    []
  );

  const updateWorkspace = useCallback((id: string, updates: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w))
    );
  }, []);

  const deleteWorkspace = useCallback(
    (id: string) => {
      if (workspaces.length <= 1) {
        return; // Don't delete the last workspace
      }
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      // Also delete items in this workspace
      setItems((prev) => prev.filter((i) => i.workspaceId !== id));
      if (activeWorkspaceId === id) {
        const remaining = workspaces.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          setActiveWorkspaceIdState(remaining[0].id);
        }
      }
    },
    [workspaces, activeWorkspaceId]
  );

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    setActiveDocIdState(null); // Clear active document when switching workspace
  }, []);

  // Items Actions
  const createItem = useCallback(
    (
      title: string,
      type: 'folder' | 'document',
      parentId: string | null = null,
      icon?: string,
      color?: string
    ): string => {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const wsId = activeWorkspace?.id || activeWorkspaceId;

      const newItem: WorkspaceItem = {
        id,
        workspaceId: wsId,
        parentId,
        type,
        title: title.trim() || (type === 'folder' ? 'Новая папка' : 'Без названия'),
        icon: icon || (type === 'folder' ? 'folder' : 'file-text'),
        color: color || activeWorkspace?.color || '#6366f1',
        isExpanded: type === 'folder' ? true : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setItems((prev) => [...prev, newItem]);

      if (type === 'document') {
        const newDoc: NoteDocument = {
          id,
          workspaceId: wsId,
          title: newItem.title,
          metadata: {
            tags: [],
            icon: newItem.icon || 'file-text',
            color: newItem.color || '#6366f1',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          blocks: [
            createDefaultBlock('heading-1', newItem.title),
            createDefaultBlock('paragraph', ''),
          ],
        };
        setDocuments((prev) => ({ ...prev, [id]: newDoc }));
        setActiveDocIdState(id);
      }

      return id;
    },
    [activeWorkspace, activeWorkspaceId]
  );

  const renameItem = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: trimmed, updatedAt: Date.now() } : item))
    );
    // If it's a document, sync document title too
    setDocuments((prev) => {
      if (prev[id]) {
        return {
          ...prev,
          [id]: { ...prev[id], title: trimmed, metadata: { ...prev[id].metadata, updatedAt: Date.now() } },
        };
      }
      return prev;
    });
  }, []);

  const deleteItem = useCallback(
    (id: string) => {
      // Find all nested child ids recursively if it's a folder
      const getChildIds = (parentId: string, allItems: WorkspaceItem[]): string[] => {
        const children = allItems.filter((i) => i.parentId === parentId);
        let res: string[] = [];
        for (const child of children) {
          res.push(child.id);
          if (child.type === 'folder') {
            res = res.concat(getChildIds(child.id, allItems));
          }
        }
        return res;
      };

      setItems((prev) => {
        const toDeleteIds = new Set([id, ...getChildIds(id, prev)]);
        // Clean up documents
        setDocuments((docPrev) => {
          const nextDocs = { ...docPrev };
          toDeleteIds.forEach((delId) => {
            delete nextDocs[delId];
          });
          return nextDocs;
        });

        if (activeDocId && toDeleteIds.has(activeDocId)) {
          setActiveDocIdState(null);
        }

        return prev.filter((item) => !toDeleteIds.has(item.id));
      });
    },
    [activeDocId]
  );

  const duplicateItem = useCallback(
    (id: string): string | null => {
      const item = items.find((i) => i.id === id);
      if (!item) return null;

      const newId = `${item.type}_${Date.now()}_dup`;
      const newItem: WorkspaceItem = {
        ...item,
        id: newId,
        title: `${item.title} (копия)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setItems((prev) => [...prev, newItem]);

      if (item.type === 'document' && documents[id]) {
        const originalDoc = documents[id];
        const newDoc: NoteDocument = {
          ...originalDoc,
          id: newId,
          title: newItem.title,
          metadata: {
            ...originalDoc.metadata,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          blocks: originalDoc.blocks.map((b) => ({
            ...b,
            id: `block_${Math.random().toString(36).substring(2, 9)}`,
          })),
        };
        setDocuments((prev) => ({ ...prev, [newId]: newDoc }));
        setActiveDocIdState(newId);
      }

      return newId;
    },
    [items, documents]
  );

  const moveItem = useCallback((id: string, newParentId: string | null) => {
    // Prevent moving folder into itself
    if (id === newParentId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, parentId: newParentId, updatedAt: Date.now() } : i))
    );
  }, []);

  const toggleFolderExpanded = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isExpanded: !i.isExpanded } : i))
    );
  }, []);

  // Document actions
  const openDocument = useCallback((id: string | null) => {
    setActiveDocIdState(id);
  }, []);

  const updateActiveDocumentTitle = useCallback(
    (title: string) => {
      if (!activeDocId) return;
      const trimmed = title.trim() || 'Без названия';
      setDocuments((prev) => {
        if (!prev[activeDocId]) return prev;
        return {
          ...prev,
          [activeDocId]: {
            ...prev[activeDocId],
            title: trimmed,
            metadata: {
              ...prev[activeDocId].metadata,
              updatedAt: Date.now(),
            },
          },
        };
      });
      // Also update workspace item title
      setItems((prev) =>
        prev.map((i) => (i.id === activeDocId ? { ...i, title: trimmed, updatedAt: Date.now() } : i))
      );
    },
    [activeDocId]
  );

  const updateActiveDocumentMetadata = useCallback(
    (updates: Partial<NoteDocument['metadata']>) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        if (!prev[activeDocId]) return prev;
        return {
          ...prev,
          [activeDocId]: {
            ...prev[activeDocId],
            metadata: {
              ...prev[activeDocId].metadata,
              ...updates,
              updatedAt: Date.now(),
            },
          },
        };
      });
      // If icon or color changed, update in item too
      if (updates.icon || updates.color) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === activeDocId
              ? {
                  ...i,
                  ...(updates.icon ? { icon: updates.icon } : {}),
                  ...(updates.color ? { color: updates.color } : {}),
                }
              : i
          )
        );
      }
    },
    [activeDocId]
  );

  const addTagToActiveDoc = useCallback(
    (tag: string) => {
      if (!activeDocId || !tag.trim()) return;
      const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        if (doc.metadata.tags.includes(cleanTag)) return prev;
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            metadata: {
              ...doc.metadata,
              tags: [...doc.metadata.tags, cleanTag],
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [activeDocId]
  );

  const removeTagFromActiveDoc = useCallback(
    (tag: string) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            metadata: {
              ...doc.metadata,
              tags: doc.metadata.tags.filter((t) => t !== tag),
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [activeDocId]
  );

  // Document Block operations
  const addBlock = useCallback(
    (type: BlockType, afterIndex?: number) => {
      if (!activeDocId) return;
      const newBlock = createDefaultBlock(type);
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const blocks = [...doc.blocks];
        if (typeof afterIndex === 'number' && afterIndex >= 0 && afterIndex < blocks.length) {
          blocks.splice(afterIndex + 1, 0, newBlock);
        } else {
          blocks.push(newBlock);
        }
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<DocumentBlock>) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const blocks = doc.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const duplicateBlock = useCallback(
    (blockId: string) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const index = doc.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return prev;
        const blockToDup = doc.blocks[index];
        const newBlock: DocumentBlock = {
          ...JSON.parse(JSON.stringify(blockToDup)),
          id: `block_${Math.random().toString(36).substring(2, 9)}`,
        };
        const blocks = [...doc.blocks];
        blocks.splice(index + 1, 0, newBlock);
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const moveBlock = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const index = doc.blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return prev;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= doc.blocks.length) return prev;
        const blocks = [...doc.blocks];
        const [moved] = blocks.splice(index, 1);
        blocks.splice(targetIndex, 0, moved);
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const blocks = doc.blocks.filter((b) => b.id !== blockId);
        // Ensure at least one empty block remains
        if (blocks.length === 0) {
          blocks.push(createDefaultBlock('paragraph', ''));
        }
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const convertBlockType = useCallback(
    (blockId: string, newType: BlockType) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const blocks = doc.blocks.map((b) => {
          if (b.id !== blockId) return b;
          if (newType === 'table' && !b.tableData) {
            return createDefaultBlock('table');
          }
          return {
            ...b,
            type: newType,
            checked: newType === 'todo-list' ? (b.checked ?? false) : undefined,
          };
        });
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  const toggleTodoBlock = useCallback(
    (blockId: string) => {
      if (!activeDocId) return;
      setDocuments((prev) => {
        const doc = prev[activeDocId];
        if (!doc) return prev;
        const blocks = doc.blocks.map((b) =>
          b.id === blockId ? { ...b, checked: !b.checked } : b
        );
        return {
          ...prev,
          [activeDocId]: {
            ...doc,
            blocks,
            metadata: { ...doc.metadata, updatedAt: Date.now() },
          },
        };
      });
    },
    [activeDocId]
  );

  // Layout updates
  const updateLayout = useCallback((updates: Partial<AppLayoutConfig>) => {
    setLayoutState((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleMenu = useCallback(() => {
    setLayoutState((prev) => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
  }, []);

  const setMenuWidth = useCallback((width: number) => {
    const clamped = Math.max(220, Math.min(560, width));
    setLayoutState((prev) => ({ ...prev, menuWidth: clamped }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Search
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return workspaceItems
      .filter((item) => item.type === 'document')
      .map((item) => {
        const doc = documents[item.id];
        let score = 0;
        if (item.title.toLowerCase().includes(query)) score += 10;
        if (doc) {
          if (doc.metadata.tags.some((t) => t.toLowerCase().includes(query))) score += 5;
          const blocksText = doc.blocks
            .map((b) => b.spans?.map((s) => s.text).join(' ') || '')
            .join(' ')
            .toLowerCase();
          if (blocksText.includes(query)) score += 3;
        }
        return { item, doc, matchScore: score };
      })
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [searchQuery, workspaceItems, documents]);

  // Global Context Menu
  const openContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      items,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  // Modal helpers
  const openModal = useCallback((modalId: string, data?: any) => {
    setActiveModal(modalId);
    setModalData(data || null);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setActiveWorkspaceId,
      items,
      workspaceItems,
      createItem,
      renameItem,
      deleteItem,
      duplicateItem,
      moveItem,
      toggleFolderExpanded,
      documents,
      activeDocId,
      activeDocument,
      openDocument,
      updateActiveDocumentTitle,
      updateActiveDocumentMetadata,
      addTagToActiveDoc,
      removeTagFromActiveDoc,
      addBlock,
      updateBlock,
      duplicateBlock,
      moveBlock,
      deleteBlock,
      convertBlockType,
      toggleTodoBlock,
      layout,
      updateLayout,
      toggleMenu,
      setMenuWidth,
      settings,
      updateSettings,
      searchQuery,
      setSearchQuery,
      searchResults,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      activeModal,
      modalData,
      openModal,
      closeModal,
    }),
    [
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setActiveWorkspaceId,
      items,
      workspaceItems,
      createItem,
      renameItem,
      deleteItem,
      duplicateItem,
      moveItem,
      toggleFolderExpanded,
      documents,
      activeDocId,
      activeDocument,
      openDocument,
      updateActiveDocumentTitle,
      updateActiveDocumentMetadata,
      addTagToActiveDoc,
      removeTagFromActiveDoc,
      addBlock,
      updateBlock,
      duplicateBlock,
      moveBlock,
      deleteBlock,
      convertBlockType,
      toggleTodoBlock,
      layout,
      updateLayout,
      toggleMenu,
      setMenuWidth,
      settings,
      updateSettings,
      searchQuery,
      searchResults,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      activeModal,
      modalData,
      openModal,
      closeModal,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

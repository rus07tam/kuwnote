import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { IconPicker } from '../common/IconPicker';
import { ColorPicker } from '../common/ColorPicker';
import { Folder, FileText } from 'lucide-react';

export const AppModals: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    createWorkspace,
    updateWorkspace,
    createItem,
    renameItem,
    moveItem,
    workspaceItems,
    updateActiveDocumentMetadata,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'rename-item' && modalData) {
      setInputVal(modalData.title || '');
    } else if (activeModal === 'rename-workspace' && modalData) {
      setInputVal(modalData.currentTitle || '');
    } else if (activeModal === 'edit-workspace' && modalData) {
      setInputVal(modalData.name || '');
      setSelectedIcon(modalData.icon || 'folder');
      setSelectedColor(modalData.color || '#6366f1');
    } else if (activeModal === 'create-workspace') {
      setInputVal('');
      setSelectedIcon('folder');
      setSelectedColor('#6366f1');
    } else if (activeModal === 'create-item') {
      setInputVal('');
      setTargetParentId(modalData?.parentId || null);
    } else if (activeModal === 'move-item') {
      setTargetParentId(modalData?.parentId || null);
    }
  }, [activeModal, modalData]);

  // Create Workspace
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      createWorkspace(inputVal.trim(), selectedIcon, selectedColor);
      closeModal();
    }
  };

  // Edit Workspace
  const handleEditWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalData?.id && inputVal.trim()) {
      updateWorkspace(modalData.id, {
        name: inputVal.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      closeModal();
    }
  };

  // Rename Workspace
  const handleRenameWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalData?.id && inputVal.trim()) {
      updateWorkspace(modalData.id, { name: inputVal.trim() });
      closeModal();
    }
  };

  // Create Item (file or folder)
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const type = modalData?.type || 'document';
    createItem(inputVal.trim(), type, targetParentId);
    closeModal();
  };

  // Rename Item
  const handleRenameItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalData?.id && inputVal.trim()) {
      renameItem(modalData.id, inputVal.trim());
      closeModal();
    }
  };

  // Move Item
  const handleMoveItem = () => {
    if (modalData?.id) {
      moveItem(modalData.id, targetParentId);
      closeModal();
    }
  };

  // Document Icon change
  const handleSelectDocIcon = (icon: string) => {
    updateActiveDocumentMetadata({ icon });
    closeModal();
  };

  // Document Color change
  const handleSelectDocColor = (color: string) => {
    updateActiveDocumentMetadata({ color });
    closeModal();
  };

  const folders = workspaceItems.filter(
    (i) => i.type === 'folder' && i.id !== modalData?.id
  );

  return (
    <>
      {/* Create Workspace Modal */}
      <Dialog
        isOpen={activeModal === 'create-workspace'}
        onClose={closeModal}
        title="Создать новый воркспейс"
        description="Задайте название, выберите иконку и цвет пространства"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Название</label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Например: Личные заметки, Работа, Проекты"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Цвет</label>
            <div className="mt-1.5">
              <ColorPicker currentColor={selectedColor} onSelect={setSelectedColor} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Иконка</label>
            <div className="mt-1.5">
              <IconPicker currentIcon={selectedIcon} onSelect={setSelectedIcon} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" disabled={!inputVal.trim()}>
              Создать
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Workspace Modal */}
      <Dialog
        isOpen={activeModal === 'edit-workspace'}
        onClose={closeModal}
        title="Редактировать воркспейс"
      >
        <form onSubmit={handleEditWorkspace} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Название</label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Цвет</label>
            <div className="mt-1.5">
              <ColorPicker currentColor={selectedColor} onSelect={setSelectedColor} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Иконка</label>
            <div className="mt-1.5">
              <IconPicker currentIcon={selectedIcon} onSelect={setSelectedIcon} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" disabled={!inputVal.trim()}>
              Сохранить
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Rename Workspace Modal */}
      <Dialog
        isOpen={activeModal === 'rename-workspace'}
        onClose={closeModal}
        title="Переименовать воркспейс"
      >
        <form onSubmit={handleRenameWorkspace} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Новое название</label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" disabled={!inputVal.trim()}>
              Сохранить
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create Item Modal */}
      <Dialog
        isOpen={activeModal === 'create-item'}
        onClose={closeModal}
        title={modalData?.type === 'folder' ? 'Создать папку' : 'Создать заметку'}
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {modalData?.type === 'folder' ? 'Название папки' : 'Заголовок заметки'}
            </label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={modalData?.type === 'folder' ? 'Новая папка' : 'Без названия'}
              className="mt-1"
              autoFocus
            />
          </div>

          {folders.length > 0 && (
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Родительская папка
              </label>
              <select
                value={targetParentId || ''}
                onChange={(e) => setTargetParentId(e.target.value || null)}
                className="mt-1 w-full rounded-md border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="">Корень воркспейса (без папки)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Dialog>

      {/* Rename Item Modal */}
      <Dialog
        isOpen={activeModal === 'rename-item'}
        onClose={closeModal}
        title="Переименовать"
      >
        <form onSubmit={handleRenameItem} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Новое имя</label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" disabled={!inputVal.trim()}>
              Сохранить
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Move Item Modal */}
      <Dialog
        isOpen={activeModal === 'move-item'}
        onClose={closeModal}
        title="Переместить элемент"
        description={`Выберите папку назначения для «${modalData?.title}»`}
      >
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setTargetParentId(null)}
              className={`flex w-full items-center gap-2 rounded-md p-2 text-left text-xs transition-colors ${
                targetParentId === null
                  ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>📁</span>
              <span>Корень воркспейса</span>
            </button>

            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTargetParentId(f.id)}
                className={`flex w-full items-center gap-2 rounded-md p-2 text-left text-xs transition-colors ${
                  targetParentId === f.id
                    ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>📁</span>
                <span>{f.title}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="button" onClick={handleMoveItem}>
              Переместить
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Document Icon Modal */}
      <Dialog
        isOpen={activeModal === 'edit-doc-icon'}
        onClose={closeModal}
        title="Выбрать иконку документа"
      >
        <IconPicker
          currentIcon={modalData?.metadata?.icon}
          onSelect={handleSelectDocIcon}
        />
      </Dialog>

      {/* Edit Document Color Modal */}
      <Dialog
        isOpen={activeModal === 'edit-doc-color'}
        onClose={closeModal}
        title="Выбрать цвет маркера"
      >
        <div className="py-2">
          <ColorPicker
            currentColor={modalData?.metadata?.color}
            onSelect={handleSelectDocColor}
          />
        </div>
      </Dialog>
    </>
  );
};

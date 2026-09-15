import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import {
  Eye,
  Edit3,
  Search,
  MoreHorizontal,
  Share2,
  Calendar,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DocumentHeaderProps {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  showFindBar: boolean;
  setShowFindBar: (show: boolean) => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  isEditMode,
  setIsEditMode,
  showFindBar,
  setShowFindBar,
}) => {
  const {
    activeDocument,
    updateActiveDocumentTitle,
    openModal,
  } = useApp();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  if (!activeDocument) return null;

  const handleStartTitleEdit = () => {
    if (!isEditMode) return;
    setTitleDraft(activeDocument.title);
    setIsEditingTitle(true);
  };

  const handleFinishTitleEdit = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim()) {
      updateActiveDocumentTitle(titleDraft.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishTitleEdit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="border-b border-zinc-200/80 bg-white/40 pb-4 backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-900/40">
      {/* Top Toolbar Row */}
      <div className="flex items-center justify-between pb-3">
        {/* Left Toolbar: Toggle Read/Write mode & Find */}
        <div className="flex items-center gap-1.5">
          <Tooltip content={isEditMode ? 'Перейти в режим чтения' : 'Перейти в режим редактирования'}>
            <Button
              id="btn-toggle-read-write"
              size="sm"
              variant={isEditMode ? 'default' : 'secondary'}
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                'h-8 gap-1.5 text-xs font-medium shadow-2xs',
                isEditMode
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300'
              )}
            >
              {isEditMode ? (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Редактирование</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Просмотр</span>
                </>
              )}
            </Button>
          </Tooltip>

          <Tooltip content="Поиск по документу">
            <Button
              id="btn-find-in-doc"
              size="sm"
              variant={showFindBar ? 'secondary' : 'ghost'}
              onClick={() => setShowFindBar(!showFindBar)}
              className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{activeDocument.blocks.length} блоков</span>
        </div>
      </div>

      {/* Main Document Identity Header: Icon + Color Marker + Title */}
      <div className="flex items-center gap-3">
        {/* Icon & Color Marker button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => isEditMode && openModal('edit-doc-icon', activeDocument)}
            disabled={!isEditMode}
            title={isEditMode ? 'Изменить иконку' : undefined}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-xs transition-transform',
              isEditMode && 'hover:scale-105 cursor-pointer ring-1 ring-zinc-200 dark:ring-zinc-800'
            )}
            style={{ backgroundColor: `${activeDocument.metadata.color || '#6366f1'}15` }}
          >
            <DynamicIcon
              name={activeDocument.metadata.icon || 'file-text'}
              className="h-5 w-5"
              size={20}
            />
          </button>

          {/* Color Marker */}
          <button
            type="button"
            onClick={() => isEditMode && openModal('edit-doc-color', activeDocument)}
            disabled={!isEditMode}
            title={isEditMode ? 'Изменить маркер цвета' : undefined}
            className={cn(
              'h-3.5 w-3.5 rounded-full shadow-2xs transition-transform',
              isEditMode && 'cursor-pointer hover:scale-125'
            )}
            style={{ backgroundColor: activeDocument.metadata.color || '#6366f1' }}
          />
        </div>

        {/* Title */}
        <div className="flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleFinishTitleEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-2xl font-bold tracking-tight text-zinc-900 outline-none dark:text-zinc-50 border-b-2 border-indigo-500"
            />
          ) : (
            <h1
              onClick={handleStartTitleEdit}
              className={cn(
                'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate',
                isEditMode && 'cursor-pointer hover:opacity-80'
              )}
              title={isEditMode ? 'Нажмите для редактирования заголовка' : undefined}
            >
              {activeDocument.title || 'Без названия'}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

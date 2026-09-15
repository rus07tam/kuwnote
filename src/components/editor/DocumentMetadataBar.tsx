import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar, Clock, Tag, Plus, X } from 'lucide-react';

interface DocumentMetadataBarProps {
  isEditMode: boolean;
}

export const DocumentMetadataBar: React.FC<DocumentMetadataBarProps> = ({ isEditMode }) => {
  const { activeDocument, addTagToActiveDoc, removeTagFromActiveDoc } = useApp();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  if (!activeDocument) return null;

  const { metadata } = activeDocument;

  const formatDate = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const handleAddTagSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTagText.trim()) {
      addTagToActiveDoc(newTagText.trim());
      setNewTagText('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="my-3 space-y-2 border-b border-zinc-100 pb-3 text-xs text-zinc-500 dark:border-zinc-850 dark:text-zinc-400">
      {/* Row 1: Dates & Timestamps */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5" title="Дата создания">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>Создан: {formatDate(metadata.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1.5" title="Дата изменения">
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
          <span>Изменен: {formatDate(metadata.updatedAt)}</span>
        </div>
      </div>

      {/* Row 2: Document Tags on a separate line */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mr-1">
          <Tag className="h-3.5 w-3.5" />
          <span>Теги:</span>
        </div>

        {metadata.tags.length === 0 && !isAddingTag && (
          <span className="italic text-[11px] text-zinc-400">Нет тегов</span>
        )}

        {metadata.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={`cursor-pointer transition-all ${
              isEditMode
                ? 'hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-300'
                : ''
            }`}
            onClick={() => {
              if (isEditMode) {
                removeTagFromActiveDoc(tag);
              }
            }}
            title={isEditMode ? 'Нажмите для удаления тега' : undefined}
          >
            <span>#{tag}</span>
            {isEditMode && <X className="ml-1 h-3 w-3 text-zinc-400 hover:text-red-600" />}
          </Badge>
        ))}

        {/* Add Tag control in edit mode */}
        {isEditMode && (
          <>
            {isAddingTag ? (
              <form onSubmit={handleAddTagSubmit} className="flex items-center gap-1">
                <Input
                  size={1}
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsAddingTag(false);
                  }}
                  placeholder="тег + Enter"
                  autoFocus
                  className="h-6 w-24 text-[11px] px-1.5 py-0"
                />
                <Button type="submit" size="sm" variant="ghost" className="h-6 px-1.5 text-[11px]">
                  +
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingTag(false)}
                  className="h-6 px-1 text-[11px] text-zinc-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              >
                <Plus className="h-3 w-3" />
                <span>Добавить тег</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

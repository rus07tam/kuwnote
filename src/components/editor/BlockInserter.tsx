import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BlockType } from '../../types';
import { Button } from '../ui/Button';
import {
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  AlignLeft,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Table,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BlockInserterProps {
  afterIndex?: number;
}

const BLOCK_OPTIONS: {
  type: BlockType;
  title: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    type: 'paragraph',
    title: 'Текст',
    desc: 'Обычный параграф с rich-текстом',
    icon: AlignLeft,
  },
  {
    type: 'heading-1',
    title: 'Заголовок 1',
    desc: 'Главный заголовок H1',
    icon: Heading1,
  },
  {
    type: 'heading-2',
    title: 'Заголовок 2',
    desc: 'Подзаголовок раздела H2',
    icon: Heading2,
  },
  {
    type: 'heading-3',
    title: 'Заголовок 3',
    desc: 'Заголовок подраздела H3',
    icon: Heading3,
  },
  {
    type: 'heading-4',
    title: 'Заголовок 4',
    desc: 'Малый заголовок H4',
    icon: Heading4,
  },
  {
    type: 'heading-5',
    title: 'Заголовок 5',
    desc: 'Микро-заголовок H5',
    icon: Heading5,
  },
  {
    type: 'heading-6',
    title: 'Заголовок 6',
    desc: 'Субтитры H6',
    icon: Heading6,
  },
  {
    type: 'todo-list',
    title: 'Список задач',
    desc: 'Интерактивные чекбоксы с отступами',
    icon: CheckSquare,
  },
  {
    type: 'bullet-list',
    title: 'Маркированный список',
    desc: 'Список с точками и вложенностью',
    icon: List,
  },
  {
    type: 'numbered-list',
    title: 'Нумерованный список',
    desc: 'Список с номерами и вложенностью',
    icon: ListOrdered,
  },
  {
    type: 'table',
    title: 'Таблица',
    desc: 'Таблица с настраиваемыми строками и колонками',
    icon: Table,
  },
  {
    type: 'divider',
    title: 'Разделитель',
    desc: 'Горизонтальная линия для разделения секций',
    icon: Minus,
  },
];

export const BlockInserter: React.FC<BlockInserterProps> = ({ afterIndex }) => {
  const { addBlock } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutside);
    }
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleSelect = (type: BlockType) => {
    addBlock(type, afterIndex);
    setIsOpen(false);
  };

  return (
    <div ref={popoverRef} className="relative my-4">
      <Button
        id="btn-add-block"
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full gap-2 border-dashed border-zinc-300 py-2.5 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
      >
        <Plus className="h-4 w-4" />
        <span>Добавить блок</span>
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-40 w-80 max-h-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white/98 p-1.5 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/98 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Выберите тип блока
          </div>
          <div className="grid grid-cols-1 gap-1">
            {BLOCK_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelect(opt.type)}
                  className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {opt.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

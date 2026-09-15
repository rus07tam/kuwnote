import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentBlock, RichTextSpan, BlockType, TableData } from '../../types';
import { InlineRichToolbar } from './InlineRichToolbar';
import { cn } from '../../lib/utils';
import {
  CheckSquare,
  Square,
  GripVertical,
  Plus,
  Trash2,
  Indent,
  Outdent,
} from 'lucide-react';

interface BlockRendererProps {
  block: DocumentBlock;
  index: number;
  isEditMode: boolean;
  searchHighlight?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  index,
  isEditMode,
  searchHighlight,
}) => {
  const {
    updateBlock,
    duplicateBlock,
    moveBlock,
    deleteBlock,
    convertBlockType,
    toggleTodoBlock,
    openContextMenu,
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);
  const [activeSpanIdx, setActiveSpanIdx] = useState<number>(0);
  const [showToolbar, setShowToolbar] = useState(false);

  // Context Menu for Block
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    openContextMenu(e, [
      {
        id: 'dup-block',
        label: 'Дублировать блок',
        icon: 'copy',
        action: () => duplicateBlock(block.id),
      },
      {
        id: 'move-up-block',
        label: 'Переместить вверх',
        icon: 'arrow-up',
        disabled: index === 0,
        action: () => moveBlock(block.id, 'up'),
      },
      {
        id: 'move-down-block',
        label: 'Переместить вниз',
        icon: 'arrow-down',
        action: () => moveBlock(block.id, 'down'),
      },
      {
        id: 'convert-p',
        label: 'Превратить в параграф',
        icon: 'file-text',
        separatorBefore: true,
        action: () => convertBlockType(block.id, 'paragraph'),
      },
      {
        id: 'convert-h1',
        label: 'Превратить в Заголовок 1',
        icon: 'heading-1',
        action: () => convertBlockType(block.id, 'heading-1'),
      },
      {
        id: 'convert-h2',
        label: 'Превратить в Заголовок 2',
        icon: 'heading-2',
        action: () => convertBlockType(block.id, 'heading-2'),
      },
      {
        id: 'convert-bullet',
        label: 'Превратить в список',
        icon: 'list',
        action: () => convertBlockType(block.id, 'bullet-list'),
      },
      {
        id: 'convert-todo',
        label: 'Превратить в Todo чекбокс',
        icon: 'check-square',
        action: () => convertBlockType(block.id, 'todo-list'),
      },
      {
        id: 'convert-table',
        label: 'Превратить в таблицу',
        icon: 'table',
        action: () => convertBlockType(block.id, 'table'),
      },
      {
        id: 'delete-block',
        label: 'Удалить блок',
        icon: 'trash',
        danger: true,
        separatorBefore: true,
        action: () => deleteBlock(block.id),
      },
    ]);
  };

  // Format toggling for the active span
  const handleToggleFormat = (key: keyof RichTextSpan, val?: any) => {
    const spans = [...(block.spans || [])];
    if (spans.length === 0) {
      spans.push({ id: 's1', text: '' });
    }
    const targetIdx = Math.min(activeSpanIdx, spans.length - 1);
    spans[targetIdx] = {
      ...spans[targetIdx],
      [key]: val,
    };
    updateBlock(block.id, { spans });
  };

  // Text content change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const text = e.target.value;
    const spans = [...(block.spans || [])];
    if (spans.length === 0) {
      spans.push({ id: 's1', text });
    } else {
      spans[activeSpanIdx || 0] = {
        ...spans[activeSpanIdx || 0],
        text,
      };
    }
    updateBlock(block.id, { spans });
  };

  const currentSpan = block.spans?.[activeSpanIdx] || { text: '' };
  const fullText = block.spans?.map((s) => s.text).join('') || '';

  // Render Rich Text Spans in Read Mode
  const renderReadSpans = (spans: RichTextSpan[]) => {
    if (!spans || spans.length === 0) {
      return <span className="opacity-40 italic">Пустой блок</span>;
    }

    return spans.map((span) => {
      const colorClasses: Record<string, string> = {
        red: 'text-red-600 dark:text-red-400',
        green: 'text-emerald-600 dark:text-emerald-400',
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        purple: 'text-purple-600 dark:text-purple-400',
        pink: 'text-pink-600 dark:text-pink-400',
        muted: 'text-zinc-400 dark:text-zinc-500',
      };

      const sizeClasses: Record<string, string> = {
        sm: 'text-xs',
        base: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      };

      let content: React.ReactNode = span.text;

      // Search match highlighting
      if (searchHighlight && span.text.toLowerCase().includes(searchHighlight.toLowerCase())) {
        const parts = span.text.split(new RegExp(`(${searchHighlight})`, 'gi'));
        content = parts.map((part, i) =>
          part.toLowerCase() === searchHighlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-zinc-950 dark:bg-amber-500/80 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        );
      }

      return (
        <span
          key={span.id}
          className={cn(
            span.bold && 'font-bold',
            span.italic && 'italic',
            span.underline && 'underline underline-offset-2',
            span.strikethrough && 'line-through text-zinc-400 dark:text-zinc-500',
            span.code &&
              'font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1 py-0.5 rounded text-xs',
            span.color && colorClasses[span.color],
            span.size && sizeClasses[span.size]
          )}
        >
          {content}
        </span>
      );
    });
  };

  // Indent / Outdent list items
  const handleIndent = (direction: 'in' | 'out') => {
    const curLevel = block.level || 0;
    const nextLevel = direction === 'in' ? Math.min(5, curLevel + 1) : Math.max(0, curLevel - 1);
    updateBlock(block.id, { level: nextLevel });
  };

  // Table operations
  const handleTableCellChange = (
    rowIndex: number,
    colIndex: number,
    text: string,
    isHeader = false
  ) => {
    if (!block.tableData) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    if (isHeader) {
      tableData.headers[colIndex].spans = [{ id: 's', text, bold: true }];
    } else {
      tableData.rows[rowIndex][colIndex].spans = [{ id: 's', text }];
    }
    updateBlock(block.id, { tableData });
  };

  const handleAddTableRow = () => {
    if (!block.tableData) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    const colsCount = tableData.headers.length;
    const newRow = Array.from({ length: colsCount }, (_, c) => ({
      id: `r_${Date.now()}_c${c}`,
      spans: [{ id: 's', text: '' }],
    }));
    tableData.rows.push(newRow);
    updateBlock(block.id, { tableData });
  };

  const handleAddTableColumn = () => {
    if (!block.tableData) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    tableData.headers.push({
      id: `h_${Date.now()}`,
      spans: [{ id: 's', text: `Колонка ${tableData.headers.length + 1}`, bold: true }],
    });
    for (const row of tableData.rows) {
      row.push({
        id: `c_${Date.now()}`,
        spans: [{ id: 's', text: '' }],
      });
    }
    updateBlock(block.id, { tableData });
  };

  const handleDeleteTableRow = (rowIdx: number) => {
    if (!block.tableData || block.tableData.rows.length <= 1) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    tableData.rows.splice(rowIdx, 1);
    updateBlock(block.id, { tableData });
  };

  const handleDeleteTableCol = (colIdx: number) => {
    if (!block.tableData || block.tableData.headers.length <= 1) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    tableData.headers.splice(colIdx, 1);
    for (const row of tableData.rows) {
      row.splice(colIdx, 1);
    }
    updateBlock(block.id, { tableData });
  };

  // Indentation style for lists
  const indentPadding = (block.level || 0) * 22;

  // Heading font sizes
  const headingStyles: Record<string, string> = {
    'heading-1': 'text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 my-2',
    'heading-2': 'text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 my-1.5',
    'heading-3': 'text-lg font-semibold text-zinc-800 dark:text-zinc-200 my-1',
    'heading-4': 'text-base font-semibold text-zinc-800 dark:text-zinc-200 my-1',
    'heading-5': 'text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 my-0.5',
    'heading-6': 'text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 my-0.5',
  };

  // Divider Block
  if (block.type === 'divider') {
    return (
      <div
        onContextMenu={handleContextMenu}
        className="group relative my-4 py-1 select-none"
      >
        <hr className="border-zinc-200 dark:border-zinc-800" />
        {isEditMode && (
          <button
            type="button"
            onClick={handleContextMenu}
            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 text-[10px]"
          >
            Разделитель (ПКМ)
          </button>
        )}
      </div>
    );
  }

  // Table Block
  if (block.type === 'table') {
    const td = block.tableData || { headers: [], rows: [] };
    return (
      <div
        onContextMenu={handleContextMenu}
        className="group relative my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xs p-1"
      >
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              {td.headers.map((h, colIdx) => (
                <th key={h.id || colIdx} className="p-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  {isEditMode ? (
                    <div className="flex items-center gap-1">
                      <input
                        className="w-full bg-transparent font-semibold outline-none"
                        value={h.spans.map((s) => s.text).join('')}
                        onChange={(e) => handleTableCellChange(0, colIdx, e.target.value, true)}
                      />
                      {td.headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTableCol(colIdx)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-0.5"
                          title="Удалить колонку"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    renderReadSpans(h.spans)
                  )}
                </th>
              ))}
              {isEditMode && (
                <th className="w-8 p-1 text-center">
                  <button
                    type="button"
                    onClick={handleAddTableColumn}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700"
                    title="Добавить колонку"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {td.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              >
                {row.map((cell, colIdx) => (
                  <td key={cell.id || colIdx} className="p-2 text-zinc-700 dark:text-zinc-300">
                    {isEditMode ? (
                      <input
                        className="w-full bg-transparent outline-none"
                        value={cell.spans.map((s) => s.text).join('')}
                        onChange={(e) =>
                          handleTableCellChange(rowIdx, colIdx, e.target.value, false)
                        }
                      />
                    ) : (
                      renderReadSpans(cell.spans)
                    )}
                  </td>
                ))}
                {isEditMode && (
                  <td className="w-8 p-1 text-center">
                    {td.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTableRow(rowIdx)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-0.5"
                        title="Удалить строку"
                      >
                        ×
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isEditMode && (
          <div className="flex items-center justify-between p-1 text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleAddTableRow}
              className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Plus className="h-3 w-3" /> Добавить строку
            </button>
            <span className="text-[10px] text-zinc-400">ПКМ для опций блока</span>
          </div>
        )}
      </div>
    );
  }

  // Standard Text Blocks (Paragraph, Headings, Lists, Todos)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      style={{ paddingLeft: `${indentPadding}px` }}
      className="group relative my-1 transition-all"
    >
      {/* Block Controls / Floating Toolbar when focused in edit mode */}
      {isEditMode && showToolbar && (
        <div className="absolute -top-9 left-0 z-30 animate-in fade-in zoom-in-95">
          <InlineRichToolbar
            activeSpan={currentSpan}
            onToggleFormat={handleToggleFormat}
          />
        </div>
      )}

      {/* Left-side drag/menu handle in Edit Mode */}
      {isEditMode && (
        <div className="absolute -left-7 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleContextMenu}
            className="cursor-pointer rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
            title="Опции блока (ПКМ)"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {(block.type === 'bullet-list' ||
            block.type === 'numbered-list' ||
            block.type === 'todo-list') && (
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => handleIndent('in')}
                className="p-0.5 text-[9px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                title="Увеличить отступ"
              >
                <Indent className="h-2.5 w-2.5" />
              </button>
              {(block.level || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => handleIndent('out')}
                  className="p-0.5 text-[9px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  title="Уменьшить отступ"
                >
                  <Outdent className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Inner Block Content */}
      <div className="flex items-start gap-2">
        {/* Bullet List Bullet */}
        {block.type === 'bullet-list' && (
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500 dark:bg-zinc-400" />
        )}

        {/* Numbered List Counter */}
        {block.type === 'numbered-list' && (
          <span className="mt-0.5 shrink-0 font-medium text-xs text-zinc-400 dark:text-zinc-500">
            {index + 1}.
          </span>
        )}

        {/* Todo List Checkbox */}
        {block.type === 'todo-list' && (
          <button
            type="button"
            onClick={() => toggleTodoBlock(block.id)}
            className="mt-1 shrink-0 text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400"
          >
            {block.checked ? (
              <CheckSquare className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Text Area / Render */}
        <div className="flex-1">
          {isEditMode ? (
            <div className="relative">
              <textarea
                rows={1}
                value={fullText}
                onFocus={() => setShowToolbar(true)}
                onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
                onChange={handleTextChange}
                placeholder={
                  block.type.startsWith('heading')
                    ? `Заголовок ${block.type.split('-')[1]}...`
                    : block.type === 'todo-list'
                    ? 'Элемент списка задач...'
                    : 'Введите текст блока (выделите для форматирования)...'
                }
                className={cn(
                  'w-full resize-none bg-transparent outline-none transition-colors border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-800',
                  block.type.startsWith('heading') ? headingStyles[block.type] : 'text-sm text-zinc-800 dark:text-zinc-200',
                  block.type === 'todo-list' && block.checked && 'line-through text-zinc-400 dark:text-zinc-500'
                )}
                style={{
                  height: 'auto',
                  overflow: 'hidden',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
          ) : (
            <div
              className={cn(
                block.type.startsWith('heading')
                  ? headingStyles[block.type]
                  : 'text-sm leading-relaxed text-zinc-800 dark:text-zinc-200',
                block.type === 'todo-list' && block.checked && 'line-through text-zinc-400 dark:text-zinc-500'
              )}
            >
              {renderReadSpans(block.spans)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

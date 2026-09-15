import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentBlock, RichTextSpan, BlockType, TableData, RichTextColor, RichTextSize } from '../../types';
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
  Palette,
} from 'lucide-react';

interface BlockRendererProps {
  block: DocumentBlock;
  index: number;
  isEditMode: boolean;
  searchHighlight?: string;
}

export const COLOR_CLASSES: Record<RichTextColor, string> = {
  default: 'text-zinc-900 dark:text-zinc-100',
  muted: 'text-zinc-400 dark:text-zinc-500',
  red: 'text-red-600 dark:text-red-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-purple-600 dark:text-purple-400',
  pink: 'text-pink-600 dark:text-pink-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
};

export const SIZE_CLASSES: Record<RichTextSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

// Convert spans into HTML with styling classes and data attributes for edit mode
function spansToHtml(spans: RichTextSpan[]): string {
  if (!spans || spans.length === 0) return '';
  return spans
    .map((span) => {
      const isCustomColor =
        span.color &&
        span.color !== 'default' &&
        !COLOR_CLASSES[span.color as RichTextColor];
      const colorClass =
        span.color && COLOR_CLASSES[span.color as RichTextColor]
          ? COLOR_CLASSES[span.color as RichTextColor]
          : '';
      const sizeClass = span.size ? SIZE_CLASSES[span.size] : '';
      const classes = [
        'rich-span',
        span.bold && 'font-bold',
        span.italic && 'italic',
        span.underline && 'underline underline-offset-2',
        span.strikethrough && 'line-through text-zinc-400 dark:text-zinc-500',
        span.code &&
          'font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1 py-0.5 rounded text-xs',
        colorClass,
        sizeClass,
      ]
        .filter(Boolean)
        .join(' ');

      const dataAttrs = [
        span.color && `data-color="${span.color}"`,
        span.size && `data-size="${span.size}"`,
        span.bold && 'data-bold="true"',
        span.italic && 'data-italic="true"',
        span.underline && 'data-underline="true"',
        span.strikethrough && 'data-strikethrough="true"',
        span.code && 'data-code="true"',
      ]
        .filter(Boolean)
        .join(' ');

      const styleAttr = isCustomColor ? `style="color: ${span.color};"` : '';

      const escaped = (span.text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br>');

      return `<span class="${classes}" ${styleAttr} ${dataAttrs}>${escaped}</span>`;
    })
    .join('');
}

// Parse HTML DOM back into RichTextSpan array
function parseSpansFromElement(el: HTMLElement): RichTextSpan[] {
  const spans: RichTextSpan[] = [];

  function traverse(node: Node, style: Partial<RichTextSpan>) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        spans.push({
          id: `s_${Math.random().toString(36).substring(2, 8)}`,
          text,
          ...style,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      if (elem.tagName === 'BR') {
        spans.push({
          id: `s_${Math.random().toString(36).substring(2, 8)}`,
          text: '\n',
        });
        return;
      }

      const nextStyle: Partial<RichTextSpan> = { ...style };
      const color = elem.getAttribute('data-color') as RichTextColor;
      if (color) {
        nextStyle.color = color;
      } else if (elem.style && elem.style.color) {
        nextStyle.color = elem.style.color;
      }

      const size = elem.getAttribute('data-size') as RichTextSize;
      if (size) nextStyle.size = size;

      if (
        elem.getAttribute('data-bold') === 'true' ||
        elem.tagName === 'B' ||
        elem.tagName === 'STRONG' ||
        elem.classList.contains('font-bold')
      ) {
        nextStyle.bold = true;
      }
      if (
        elem.getAttribute('data-italic') === 'true' ||
        elem.tagName === 'I' ||
        elem.tagName === 'EM' ||
        elem.classList.contains('italic')
      ) {
        nextStyle.italic = true;
      }
      if (
        elem.getAttribute('data-underline') === 'true' ||
        elem.tagName === 'U' ||
        elem.classList.contains('underline')
      ) {
        nextStyle.underline = true;
      }
      if (
        elem.getAttribute('data-strikethrough') === 'true' ||
        elem.tagName === 'S' ||
        elem.classList.contains('line-through')
      ) {
        nextStyle.strikethrough = true;
      }
      if (
        elem.getAttribute('data-code') === 'true' ||
        elem.tagName === 'CODE' ||
        elem.classList.contains('font-mono')
      ) {
        nextStyle.code = true;
      }

      // Check class-based colors
      for (const [colName, colCls] of Object.entries(COLOR_CLASSES)) {
        if (colName !== 'default' && elem.classList.contains(colCls.split(' ')[0])) {
          nextStyle.color = colName as RichTextColor;
          break;
        }
      }

      for (let i = 0; i < elem.childNodes.length; i++) {
        traverse(elem.childNodes[i], nextStyle);
      }
    }
  }

  for (let i = 0; i < el.childNodes.length; i++) {
    traverse(el.childNodes[i], {});
  }

  if (spans.length === 0) {
    return [{ id: 's1', text: '' }];
  }

  // Merge adjacent spans with identical formatting
  const merged: RichTextSpan[] = [];
  for (const s of spans) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.bold === s.bold &&
      prev.italic === s.italic &&
      prev.underline === s.underline &&
      prev.strikethrough === s.strikethrough &&
      prev.code === s.code &&
      prev.color === s.color &&
      prev.size === s.size
    ) {
      prev.text += s.text;
    } else {
      merged.push({ ...s });
    }
  }
  return merged;
}

// Render Rich Text Spans in Read Mode
function renderReadSpans(spans: RichTextSpan[], searchHighlight?: string) {
  if (!spans || spans.length === 0) {
    return <span className="opacity-40 italic">Пустой блок</span>;
  }

  return spans.map((span, i) => {
    let content: React.ReactNode = span.text;

    // Search match highlighting
    if (searchHighlight && span.text.toLowerCase().includes(searchHighlight.toLowerCase())) {
      const parts = span.text.split(new RegExp(`(${searchHighlight})`, 'gi'));
      content = parts.map((part, pIdx) =>
        part.toLowerCase() === searchHighlight.toLowerCase() ? (
          <mark key={pIdx} className="bg-amber-300 text-zinc-950 dark:bg-amber-500/80 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      );
    }

    const isCustom =
      span.color &&
      span.color !== 'default' &&
      !COLOR_CLASSES[span.color as RichTextColor];
    const colorClass =
      span.color && COLOR_CLASSES[span.color as RichTextColor]
        ? COLOR_CLASSES[span.color as RichTextColor]
        : '';

    return (
      <span
        key={span.id || i}
        className={cn(
          span.bold && 'font-bold',
          span.italic && 'italic',
          span.underline && 'underline underline-offset-2',
          span.strikethrough && 'line-through text-zinc-400 dark:text-zinc-500',
          span.code &&
            'font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1 py-0.5 rounded text-xs',
          colorClass,
          span.size && SIZE_CLASSES[span.size]
        )}
        style={isCustom ? { color: span.color } : undefined}
      >
        {content}
      </span>
    );
  });
}

// Rich Text Table Cell Component (no cycling color button, full rich text support)
const TableCellView: React.FC<{
  spans: RichTextSpan[];
  isHeader?: boolean;
  isEditMode: boolean;
  onChange: (spans: RichTextSpan[]) => void;
  searchHighlight?: string;
  placeholder?: string;
}> = ({ spans, isHeader, isEditMode, onChange, searchHighlight, placeholder }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!isTypingRef.current && cellRef.current) {
      const html = spansToHtml(spans);
      if (cellRef.current.innerHTML !== html) {
        cellRef.current.innerHTML = html;
      }
    }
  }, [spans]);

  if (!isEditMode) {
    return <div className="min-h-[1.25rem] py-0.5">{renderReadSpans(spans, searchHighlight)}</div>;
  }

  return (
    <div
      ref={cellRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || (isHeader ? 'Заголовок' : 'Текст...')}
      onInput={() => {
        if (!cellRef.current) return;
        isTypingRef.current = true;
        const next = parseSpansFromElement(cellRef.current);
        onChange(next);
      }}
      onBlur={() => {
        isTypingRef.current = false;
        if (cellRef.current) {
          const next = parseSpansFromElement(cellRef.current);
          onChange(next);
        }
      }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          document.execCommand('bold', false);
          if (cellRef.current) onChange(parseSpansFromElement(cellRef.current));
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          document.execCommand('italic', false);
          if (cellRef.current) onChange(parseSpansFromElement(cellRef.current));
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
          e.preventDefault();
          document.execCommand('underline', false);
          if (cellRef.current) onChange(parseSpansFromElement(cellRef.current));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          document.execCommand('insertLineBreak');
          if (cellRef.current) onChange(parseSpansFromElement(cellRef.current));
        }
      }}
      className={cn(
        'min-h-[1.25rem] w-full rounded px-1.5 py-0.5 outline-none transition-colors focus:bg-zinc-100/80 dark:focus:bg-zinc-800/80 break-words',
        isHeader ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-800 dark:text-zinc-200'
      )}
    />
  );
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  index,
  isEditMode,
  searchHighlight,
}) => {
  const {
    activeDocument,
    updateBlock,
    addBlock,
    duplicateBlock,
    moveBlock,
    reorderBlock,
    deleteBlock,
    convertBlockType,
    toggleTodoBlock,
    openContextMenu,
  } = useApp();

  const [showToolbar, setShowToolbar] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Partial<RichTextSpan>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropAfter, setIsDropAfter] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Sync DOM with block.spans when not typing (e.g. block change, external update)
  useEffect(() => {
    if (!editableRef.current) return;
    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    const html = spansToHtml(block.spans || []);
    if (editableRef.current.innerHTML !== html) {
      editableRef.current.innerHTML = html;
    }
    // Update active format based on first span
    if (block.spans && block.spans.length > 0) {
      setActiveFormat(block.spans[0]);
    }
  }, [block.id, block.spans]);

  // Context Menu for Block
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isIndentable =
      block.type === 'bullet-list' ||
      block.type === 'numbered-list' ||
      block.type === 'todo-list';

    const menuItems: any[] = [
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
    ];

    if (isIndentable) {
      menuItems.push(
        {
          id: 'indent-in',
          label: 'Увеличить отступ',
          icon: 'indent',
          separatorBefore: true,
          disabled: (block.level || 0) >= 5,
          action: () => handleIndent('in'),
        },
        {
          id: 'indent-out',
          label: 'Уменьшить отступ',
          icon: 'outdent',
          disabled: (block.level || 0) <= 0,
          action: () => handleIndent('out'),
        }
      );
    }

    menuItems.push({
      id: 'delete-block',
      label: 'Удалить блок',
      icon: 'trash',
      danger: true,
      separatorBefore: true,
      action: () => deleteBlock(block.id),
    });

    openContextMenu(e, menuItems);
  };

  // Format toggling for the editable block (support selection or whole block)
  const handleToggleFormat = (key: keyof RichTextSpan, val?: any) => {
    if (!editableRef.current) return;

    setActiveFormat((prev) => ({ ...prev, [key]: val }));

    const sel = window.getSelection();
    let hasSelectionInside = false;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (editableRef.current.contains(range.commonAncestorContainer)) {
        hasSelectionInside = true;
        // Wrap selected range with styled span
        const span = document.createElement('span');
        span.className = 'rich-span';
        if (key === 'color') {
          span.setAttribute('data-color', val);
          if (val && val !== 'default') {
            span.classList.add(...COLOR_CLASSES[val as RichTextColor].split(' '));
          }
        } else if (key === 'bold') {
          if (val) {
            span.setAttribute('data-bold', 'true');
            span.classList.add('font-bold');
          }
        } else if (key === 'italic') {
          if (val) {
            span.setAttribute('data-italic', 'true');
            span.classList.add('italic');
          }
        } else if (key === 'underline') {
          if (val) {
            span.setAttribute('data-underline', 'true');
            span.classList.add('underline', 'underline-offset-2');
          }
        } else if (key === 'strikethrough') {
          if (val) {
            span.setAttribute('data-strikethrough', 'true');
            span.classList.add('line-through', 'text-zinc-400');
          }
        } else if (key === 'code') {
          if (val) {
            span.setAttribute('data-code', 'true');
            span.classList.add('font-mono', 'bg-zinc-100', 'dark:bg-zinc-800', 'px-1', 'py-0.5', 'rounded', 'text-xs');
          }
        } else if (key === 'size') {
          span.setAttribute('data-size', val);
          if (val) span.classList.add(SIZE_CLASSES[val as RichTextSize]);
        }

        try {
          span.appendChild(range.extractContents());
          range.insertNode(span);
        } catch {
          // Fallback if extraction fails
        }
      }
    }

    if (!hasSelectionInside) {
      // Apply to all spans in block
      const currentSpans = block.spans || [{ id: 's1', text: editableRef.current.innerText || '' }];
      const updated = currentSpans.map((s) => ({
        ...s,
        [key]: val,
      }));
      editableRef.current.innerHTML = spansToHtml(updated);
    }

    // Parse updated spans from DOM and sync to state
    isTypingRef.current = false;
    const nextSpans = parseSpansFromElement(editableRef.current);
    updateBlock(block.id, { spans: nextSpans });
  };

  // On input typing
  const handleInput = () => {
    if (!editableRef.current) return;
    isTypingRef.current = true;
    const nextSpans = parseSpansFromElement(editableRef.current);
    updateBlock(block.id, { spans: nextSpans });
  };

  // Keyboard navigation and block creation UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleToggleFormat('bold', !activeFormat.bold);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleToggleFormat('italic', !activeFormat.italic);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      handleToggleFormat('underline', !activeFormat.underline);
      return;
    }

    // Enter key creates new block or list item
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = editableRef.current?.innerText.trim() || '';

      // If empty list or todo item, convert back to paragraph
      if (
        (block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo-list') &&
        text === ''
      ) {
        convertBlockType(block.id, 'paragraph');
        return;
      }

      // If in a list or todo item, create next list item
      if (block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo-list') {
        addBlock(block.type, index);
        return;
      }

      // Default: create a new paragraph block right below
      addBlock('paragraph', index);
      return;
    }

    // Backspace on empty block: delete block and focus previous
    if (e.key === 'Backspace') {
      const text = editableRef.current?.innerText || '';
      if (text === '' && activeDocument && activeDocument.blocks.length > 1) {
        e.preventDefault();
        deleteBlock(block.id);
        return;
      }
    }

    // Tab / Shift+Tab indent
    if (e.key === 'Tab') {
      if (block.type === 'bullet-list' || block.type === 'numbered-list' || block.type === 'todo-list') {
        e.preventDefault();
        if (e.shiftKey) {
          handleIndent('out');
        } else {
          handleIndent('in');
        }
      }
    }
  };

  // Indent / Outdent list items
  const handleIndent = (direction: 'in' | 'out') => {
    const curLevel = block.level || 0;
    const nextLevel = direction === 'in' ? Math.min(5, curLevel + 1) : Math.max(0, curLevel - 1);
    updateBlock(block.id, { level: nextLevel });
  };

  // Table operations with rich text spans
  const handleTableSpansChange = (
    rowIndex: number,
    colIndex: number,
    newSpans: RichTextSpan[],
    isHeader = false
  ) => {
    if (!block.tableData) return;
    const tableData: TableData = JSON.parse(JSON.stringify(block.tableData));
    if (isHeader) {
      tableData.headers[colIndex].spans = newSpans;
    } else {
      tableData.rows[rowIndex][colIndex].spans = newSpans;
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

  // Heading styles
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
                <th key={h.id || colIdx} className="p-2 font-semibold">
                  <div className="flex items-center gap-1 group/th">
                    <div className="flex-1 min-w-[60px]">
                      <TableCellView
                        spans={h.spans}
                        isHeader
                        isEditMode={isEditMode}
                        onChange={(newSpans) =>
                          handleTableSpansChange(0, colIdx, newSpans, true)
                        }
                        searchHighlight={searchHighlight}
                        placeholder={`Колонка ${colIdx + 1}`}
                      />
                    </div>
                    {isEditMode && td.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTableCol(colIdx)}
                        className="opacity-0 group-hover/th:opacity-100 text-zinc-400 hover:text-red-500 p-0.5 rounded"
                        title="Удалить колонку"
                      >
                        ×
                      </button>
                    )}
                  </div>
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
                  <td key={cell.id || colIdx} className="p-2">
                    <TableCellView
                      spans={cell.spans}
                      isEditMode={isEditMode}
                      onChange={(newSpans) =>
                        handleTableSpansChange(rowIdx, colIdx, newSpans, false)
                      }
                      searchHighlight={searchHighlight}
                      placeholder="Текст..."
                    />
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
  const placeholderText = block.type.startsWith('heading')
    ? `Заголовок ${block.type.split('-')[1]}...`
    : block.type === 'todo-list'
    ? 'Элемент списка задач...'
    : 'Введите текст блока (выделите для форматирования)...';

  return (
    <div
      id={`block-${block.id}`}
      onContextMenu={handleContextMenu}
      onDragOver={(e) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        setIsDropAfter(e.clientY > midY);
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        if (!isEditMode) return;
        e.preventDefault();
        setIsDragOver(false);
        const srcStr = e.dataTransfer.getData('text/plain');
        if (!srcStr) return;
        const srcIdx = parseInt(srcStr, 10);
        if (isNaN(srcIdx) || srcIdx === index) return;
        let targetIdx = isDropAfter ? index + 1 : index;
        if (srcIdx < targetIdx) targetIdx -= 1;
        reorderBlock(srcIdx, targetIdx);
      }}
      style={{ paddingLeft: `${indentPadding}px` }}
      className="group relative my-1 transition-all"
    >
      {/* Drop Indicator */}
      {isDragOver && (
        <div
          className={cn(
            'absolute left-0 right-0 h-0.5 z-30 pointer-events-none rounded-full',
            isDropAfter ? '-bottom-1' : '-top-1'
          )}
          style={{ backgroundColor: 'var(--accent-color, #6366f1)' }}
        />
      )}

      {/* Block Controls / Floating Toolbar when focused in edit mode */}
      {isEditMode && showToolbar && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute -top-10 left-0 z-30 animate-in fade-in zoom-in-95"
        >
          <InlineRichToolbar
            activeSpan={activeFormat}
            onToggleFormat={handleToggleFormat}
          />
        </div>
      )}

      {/* Left-side drag'n'drop handle in Edit Mode */}
      {isEditMode && (
        <div className="absolute -left-7 top-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            draggable={isEditMode}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={handleContextMenu}
            className="cursor-grab active:cursor-grabbing rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            title="Перетащите для перемещения блока (или нажмите ПКМ для меню)"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
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
          <span className="mt-0.5 shrink-0 font-medium text-xs text-zinc-400 dark:text-zinc-500 select-none">
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

        {/* Content Area: Rich Text in Both Edit and Read Modes */}
        <div className="flex-1 min-w-0">
          {isEditMode ? (
            <div
              className="relative"
              onFocus={() => setShowToolbar(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setShowToolbar(false);
                }
              }}
            >
              <div
                ref={editableRef}
                id={`block-editable-${block.id}`}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholderText}
                className={cn(
                  'w-full min-h-[1.5em] bg-transparent outline-none transition-colors border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-800 break-words',
                  block.type.startsWith('heading')
                    ? headingStyles[block.type]
                    : 'text-sm leading-relaxed text-zinc-900 dark:text-zinc-100',
                  block.type === 'todo-list' && block.checked && 'line-through text-zinc-400 dark:text-zinc-500'
                )}
              />
            </div>
          ) : (
            <div
              className={cn(
                block.type.startsWith('heading')
                  ? headingStyles[block.type]
                  : 'text-sm leading-relaxed text-zinc-900 dark:text-zinc-100',
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

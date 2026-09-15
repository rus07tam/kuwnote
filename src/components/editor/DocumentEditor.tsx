import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentHeader } from './DocumentHeader';
import { DocumentMetadataBar } from './DocumentMetadataBar';
import { BlockRenderer } from './BlockRenderer';
import { BlockInserter } from './BlockInserter';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const DocumentEditor: React.FC = () => {
  const { activeDocument, settings } = useApp();
  const [isEditMode, setIsEditMode] = useState(settings.editorMode === 'edit');
  const [showFindBar, setShowFindBar] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Count matches across all blocks
  const matchCount = useMemo(() => {
    if (!findQuery.trim() || !activeDocument) return 0;
    const q = findQuery.toLowerCase();
    let count = 0;
    for (const block of activeDocument.blocks) {
      if (block.type === 'table' && block.tableData) {
        for (const row of block.tableData.rows) {
          for (const cell of row) {
            const text = (cell.spans ? cell.spans.map((s) => s.text).join('') : '').toLowerCase();
            if (text.includes(q)) {
              count += text.split(q).length - 1;
            }
          }
        }
      } else {
        const text = (block.spans ? block.spans.map((s) => s.text).join('') : '').toLowerCase();
        if (text.includes(q)) {
          count += text.split(q).length - 1;
        }
      }
    }
    return count;
  }, [findQuery, activeDocument]);

  // Reset match index when query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [findQuery]);

  const handleNextMatch = () => {
    if (matchCount === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
  };

  const handlePrevMatch = () => {
    if (matchCount === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchCount) % matchCount);
  };

  // Scroll to matching block when match index changes
  useEffect(() => {
    if (!findQuery.trim() || matchCount === 0 || !activeDocument) return;
    const q = findQuery.toLowerCase();
    let accumulated = 0;
    for (const block of activeDocument.blocks) {
      let blockMatches = 0;
      if (block.type === 'table' && block.tableData) {
        for (const row of block.tableData.rows) {
          for (const cell of row) {
            const text = (cell.spans ? cell.spans.map((s) => s.text).join('') : '').toLowerCase();
            if (text.includes(q)) {
              blockMatches += text.split(q).length - 1;
            }
          }
        }
      } else {
        const text = (block.spans ? block.spans.map((s) => s.text).join('') : '').toLowerCase();
        if (text.includes(q)) {
          blockMatches += text.split(q).length - 1;
        }
      }
      if (accumulated + blockMatches > currentMatchIndex) {
        const el = document.getElementById(`block-${block.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        break;
      }
      accumulated += blockMatches;
    }
  }, [currentMatchIndex, findQuery, matchCount, activeDocument]);

  if (!activeDocument) return null;

  const fontClasses: Record<string, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const sizeClasses: Record<string, string> = {
    compact: 'text-xs leading-normal',
    normal: 'text-sm leading-relaxed',
    spacious: 'text-base leading-loose',
  };

  return (
    <div
      id="kuwnote-document-editor"
      className={cn(
        'mx-auto w-full max-w-4xl px-8 sm:px-12 py-6 pb-36 transition-all',
        fontClasses[settings.fontFamily || 'sans'],
        sizeClasses[settings.fontSize || 'normal']
      )}
    >
      {/* Document Header */}
      <DocumentHeader
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        showFindBar={showFindBar}
        setShowFindBar={setShowFindBar}
      />

      {/* Find Toolbar inside Document */}
      {showFindBar && (
        <div className="my-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/90 p-2 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 animate-in fade-in">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <Input
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  handlePrevMatch();
                } else {
                  handleNextMatch();
                }
              } else if (e.key === 'Escape') {
                setShowFindBar(false);
                setFindQuery('');
              }
            }}
            placeholder="Поиск по тексту документа (Enter - далее, Shift+Enter - назад)..."
            className="h-7 text-xs flex-1"
            autoFocus
          />

          {findQuery.trim() && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0 px-1">
              {matchCount > 0 ? `${currentMatchIndex + 1} из ${matchCount}` : '0 совпадений'}
            </span>
          )}

          {/* Previous / Next buttons - strictly disabled when matchCount is 0 */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              disabled={matchCount === 0}
              onClick={handlePrevMatch}
              className="h-7 w-7 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Предыдущее совпадение (Shift+Enter)"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={matchCount === 0}
              onClick={handleNextMatch}
              className="h-7 w-7 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              title="Следующее совпадение (Enter)"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setShowFindBar(false);
                setFindQuery('');
              }}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Закрыть поиск (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Metadata Bar (Dates, Tags) */}
      <DocumentMetadataBar isEditMode={isEditMode} />

      {/* Blocks Container */}
      <div className="space-y-1 pt-2">
        {activeDocument.blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            index={index}
            isEditMode={isEditMode}
            searchHighlight={findQuery}
          />
        ))}
      </div>

      {/* Add Block button in Edit Mode */}
      {isEditMode && <BlockInserter />}
    </div>
  );
};

import React, { useState } from 'react';
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
          <Search className="h-4 w-4 text-zinc-400" />
          <Input
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            placeholder="Поиск по тексту документа..."
            className="h-7 text-xs flex-1"
            autoFocus
          />
          {findQuery && (
            <span className="text-[11px] text-zinc-400">
              Поиск «{findQuery}»
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setShowFindBar(false);
              setFindQuery('');
            }}
            className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
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

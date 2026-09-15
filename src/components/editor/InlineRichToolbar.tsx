import React from 'react';
import { RichTextSpan, RichTextColor, RichTextSize } from '../../types';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Palette,
  Type,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface InlineRichToolbarProps {
  activeSpan: Partial<RichTextSpan>;
  onToggleFormat: (format: keyof RichTextSpan, value?: any) => void;
  className?: string;
}

const COLOR_OPTIONS: { id: RichTextColor; label: string; class: string }[] = [
  { id: 'default', label: 'По умолчанию', class: 'bg-zinc-800 dark:bg-zinc-200' },
  { id: 'red', label: 'Красный', class: 'bg-red-500' },
  { id: 'green', label: 'Зеленый', class: 'bg-emerald-500' },
  { id: 'blue', label: 'Синий', class: 'bg-blue-500' },
  { id: 'amber', label: 'Янтарный', class: 'bg-amber-500' },
  { id: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
  { id: 'pink', label: 'Розовый', class: 'bg-pink-500' },
];

export const InlineRichToolbar: React.FC<InlineRichToolbarProps> = ({
  activeSpan,
  onToggleFormat,
  className,
}) => {
  const [showColors, setShowColors] = React.useState(false);
  const [showSizes, setShowSizes] = React.useState(false);

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onToggleFormat('bold', !activeSpan.bold)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.bold
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Жирный (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggleFormat('italic', !activeSpan.italic)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.italic
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Курсив (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggleFormat('underline', !activeSpan.underline)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.underline
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Подчеркнутый"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggleFormat('strikethrough', !activeSpan.strikethrough)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.strikethrough
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Зачеркнутый"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggleFormat('code', !activeSpan.code)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.code
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Моноширинный код"
      >
        <Code className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      {/* Color Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColors(!showColors);
            setShowSizes(false);
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
            activeSpan.color && activeSpan.color !== 'default' && 'text-indigo-600 dark:text-indigo-400'
          )}
          title="Цвет текста"
        >
          <Palette className="h-3.5 w-3.5" />
        </button>

        {showColors && (
          <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onToggleFormat('color', c.id);
                  setShowColors(false);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:scale-110 transition-transform"
                title={c.label}
              >
                <span className={cn('h-3.5 w-3.5 rounded-full', c.class)} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowSizes(!showSizes);
            setShowColors(false);
          }}
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          title="Размер шрифта"
        >
          <Type className="h-3.5 w-3.5" />
        </button>

        {showSizes && (
          <div className="absolute left-0 top-full mt-1 z-50 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {(
              [
                { id: 'sm', label: 'Маленький' },
                { id: 'base', label: 'Обычный' },
                { id: 'lg', label: 'Крупный' },
                { id: 'xl', label: 'Очень крупный' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onToggleFormat('size', s.id);
                  setShowSizes(false);
                }}
                className={cn(
                  'px-2 py-1 text-left text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  activeSpan.size === s.id && 'font-bold text-indigo-600 dark:text-indigo-400'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

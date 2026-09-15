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

const COLOR_OPTIONS: { id: RichTextColor; label: string; class: string; dotHex: string }[] = [
  { id: 'default', label: 'По умолчанию', class: 'bg-zinc-800 dark:bg-zinc-200', dotHex: '#3f3f46' },
  { id: 'muted', label: 'Приглушенный', class: 'bg-zinc-400 dark:bg-zinc-500', dotHex: '#71717a' },
  { id: 'red', label: 'Красный', class: 'bg-red-500', dotHex: '#ef4444' },
  { id: 'green', label: 'Зеленый', class: 'bg-emerald-500', dotHex: '#10b981' },
  { id: 'blue', label: 'Синий', class: 'bg-blue-500', dotHex: '#3b82f6' },
  { id: 'amber', label: 'Янтарный', class: 'bg-amber-500', dotHex: '#f59e0b' },
  { id: 'purple', label: 'Фиолетовый', class: 'bg-purple-500', dotHex: '#a855f7' },
  { id: 'pink', label: 'Розовый', class: 'bg-pink-500', dotHex: '#ec4899' },
  { id: 'cyan', label: 'Голубой', class: 'bg-cyan-500', dotHex: '#06b6d4' },
];

export const InlineRichToolbar: React.FC<InlineRichToolbarProps> = ({
  activeSpan,
  onToggleFormat,
  className,
}) => {
  const [showColors, setShowColors] = React.useState(false);
  const [showSizes, setShowSizes] = React.useState(false);

  const activeColorObj = COLOR_OPTIONS.find((c) => c.id === activeSpan.color);
  const isCustomColor = Boolean(
    activeSpan.color &&
      activeSpan.color !== 'default' &&
      !COLOR_OPTIONS.some((c) => c.id === activeSpan.color)
  );
  const currentDotHex = isCustomColor ? activeSpan.color : activeColorObj?.dotHex;

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 select-none',
        className
      )}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
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
        onMouseDown={(e) => e.preventDefault()}
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
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onToggleFormat('underline', !activeSpan.underline)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          activeSpan.underline
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        )}
        title="Подчеркнутый (Ctrl+U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
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
        onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColors(!showColors);
            setShowSizes(false);
          }}
          className={cn(
            'relative flex h-7 w-7 items-center justify-center rounded transition-colors',
            activeSpan.color && activeSpan.color !== 'default'
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          )}
          title="Цвет текста"
        >
          <Palette className="h-3.5 w-3.5" />
          {currentDotHex && (
            <span
              className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ring-1 ring-white dark:ring-zinc-900"
              style={{ backgroundColor: currentDotHex }}
            />
          )}
        </button>

        {showColors && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 top-full mt-1 z-50 flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 min-w-[190px]"
          >
            <div className="flex flex-wrap items-center gap-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onToggleFormat('color', c.id);
                    setShowColors(false);
                  }}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full hover:scale-125 transition-transform',
                    activeSpan.color === c.id && 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-900'
                  )}
                  title={c.label}
                >
                  <span className={cn('h-3.5 w-3.5 rounded-full shadow-2xs', c.class)} />
                </button>
              ))}
            </div>

            {/* Custom Color Selector */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-1.5 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Кастомный цвет:</span>
              <label className="relative flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="color"
                  value={isCustomColor ? activeSpan.color : '#6366f1'}
                  onChange={(e) => {
                    onToggleFormat('color', e.target.value);
                  }}
                  className="h-4 w-4 cursor-pointer rounded border-0 p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                  {isCustomColor ? activeSpan.color : 'Палитра'}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Size Dropdown */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowSizes(!showSizes);
            setShowColors(false);
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            activeSpan.size && activeSpan.size !== 'base'
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          )}
          title="Размер шрифта"
        >
          <Type className="h-3.5 w-3.5" />
        </button>

        {showSizes && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 top-full mt-1 z-50 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onToggleFormat('size', s.id);
                  setShowSizes(false);
                }}
                className={cn(
                  'px-2 py-1 text-left text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                  activeSpan.size === s.id && 'font-bold text-indigo-600 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-800'
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

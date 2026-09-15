import React, { useState } from 'react';
import { AVAILABLE_EMOJIS, AVAILABLE_ICONS, DynamicIcon } from './DynamicIcon';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface IconPickerProps {
  currentIcon?: string;
  onSelect: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect }) => {
  const [tab, setTab] = useState<'emoji' | 'icons'>('emoji');
  const [search, setSearch] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-3">
      <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setTab('emoji')}
          className={cn(
            'flex-1 rounded-md py-1 text-xs font-medium transition-colors',
            tab === 'emoji'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          Эмодзи
        </button>
        <button
          type="button"
          onClick={() => setTab('icons')}
          className={cn(
            'flex-1 rounded-md py-1 text-xs font-medium transition-colors',
            tab === 'icons'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          )}
        >
          Иконки
        </button>
      </div>

      {tab === 'icons' && (
        <Input
          placeholder="Поиск иконки..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs"
        />
      )}

      <div className="max-h-48 overflow-y-auto">
        {tab === 'emoji' ? (
          <div className="grid grid-cols-8 gap-1.5 p-1">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  currentIcon === emoji && 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 p-1">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => onSelect(iconName)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  currentIcon === iconName && 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                )}
                title={iconName}
              >
                <DynamicIcon name={iconName} className="h-5 w-5" />
                <span className="max-w-[48px] truncate text-[10px] text-zinc-500">{iconName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

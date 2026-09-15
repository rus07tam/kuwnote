import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Zinc', value: '#71717a' },
  { name: 'Dark Slate', value: '#334155' },
];

interface ColorPickerProps {
  currentColor?: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onSelect }) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        {PRESET_COLORS.map((c) => {
          const isSelected = currentColor?.toLowerCase() === c.value.toLowerCase();
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onSelect(c.value)}
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 shadow-xs',
                isSelected && 'ring-2 ring-zinc-950 dark:ring-zinc-50 ring-offset-2'
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {isSelected && <Check className="h-4 w-4 text-white drop-shadow-md" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

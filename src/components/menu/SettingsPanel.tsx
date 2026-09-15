import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { TauriBridge } from '../../services/tauri';
import { Button } from '../ui/Button';
import {
  Sun,
  Moon,
  Laptop,
  Palette,
  Layout,
  Sliders,
  Type,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AccentColor, NavPosition, MenuPosition, MenuType, AppTheme } from '../../types';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, layout, updateLayout } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCENT_COLORS: { id: AccentColor; label: string; bgClass: string; hex: string }[] = [
    { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', hex: '#6366f1' },
    { id: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', hex: '#10b981' },
    { id: 'sapphire', label: 'Sapphire', bgClass: 'bg-blue-600', hex: '#2563eb' },
    { id: 'amber', label: 'Amber', bgClass: 'bg-amber-500', hex: '#f59e0b' },
    { id: 'rose', label: 'Rose', bgClass: 'bg-rose-500', hex: '#f43f5e' },
    { id: 'violet', label: 'Violet', bgClass: 'bg-violet-600', hex: '#7c3aed' },
    { id: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-500', hex: '#06b6d4' },
    { id: 'dynamic-android', label: 'Android Dynamic', bgClass: 'bg-gradient-to-tr from-teal-400 to-amber-300', hex: '#14b8a6' },
  ];

  const handleExport = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuwnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (StorageService.importAllData(content)) {
        alert('Данные успешно импортированы! Страница будет перезагружена.');
        window.location.reload();
      } else {
        alert('Ошибка импорта: некорректный JSON файл.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Сбросить все заметки и восстановить начальные демонстрационные данные?')) {
      StorageService.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 space-y-5 text-xs text-zinc-700 dark:text-zinc-300">
      {/* App Header info */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-100/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-xs">
            Kw
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Kuwnote</h4>
            <p className="text-[11px] text-zinc-400">org.ruject.kuwnote • v2.0.0</p>
          </div>
        </div>
      </div>

      {/* Theme Section */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
          <Sun className="h-3.5 w-3.5 text-zinc-500" />
          <span>Тема оформления</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(
            [
              { id: 'system', label: 'Системная', icon: Laptop },
              { id: 'light', label: 'Белая', icon: Sun },
              { id: 'dark', label: 'Черная', icon: Moon },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => updateSettings({ theme: id as AppTheme })}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
                settings.theme === id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
            <Palette className="h-3.5 w-3.5 text-zinc-500" />
            <span>Акцентный цвет</span>
          </label>
          {settings.accentColor === 'dynamic-android' && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Smartphone className="h-3 w-3" /> Android Dynamic
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ACCENT_COLORS.map((col) => {
            const isSelected = settings.accentColor === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => updateSettings({ accentColor: col.id })}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-all text-center',
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-850'
                )}
              >
                <span className={cn('h-5 w-5 rounded-full shadow-2xs', col.bgClass)} />
                <span className="text-[10px] font-medium leading-none text-zinc-600 dark:text-zinc-400">
                  {col.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Toolbar Position */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
          <Layout className="h-3.5 w-3.5 text-zinc-500" />
          <span>Позиция панели навигации</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(
            [
              { id: 'left', label: 'Слева' },
              { id: 'right', label: 'Справа' },
              { id: 'top', label: 'Вверху' },
              { id: 'bottom', label: 'Снизу' },
            ] as const
          ).map((pos) => (
            <button
              key={pos.id}
              onClick={() => updateLayout({ navPosition: pos.id as NavPosition })}
              className={cn(
                'rounded-md py-1.5 text-xs font-medium transition-colors text-center',
                layout.navPosition === pos.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Position & Mode */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
          <Sliders className="h-3.5 w-3.5 text-zinc-500" />
          <span>Позиция и вид меню</span>
        </label>
        
        {/* Menu Position: Left vs Right */}
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(
            [
              { id: 'left', label: 'Слева' },
              { id: 'right', label: 'Справа' },
            ] as const
          ).map((pos) => (
            <button
              key={pos.id}
              onClick={() => updateLayout({ menuPosition: pos.id as MenuPosition })}
              className={cn(
                'rounded-md py-1.5 text-xs font-medium transition-colors text-center',
                layout.menuPosition === pos.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Menu Type: Inline vs Floating */}
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(
            [
              { id: 'inline', label: 'Inline (встроенное)' },
              { id: 'floating', label: 'Floating (плавающее)' },
            ] as const
          ).map((type) => (
            <button
              key={type.id}
              onClick={() => updateLayout({ menuType: type.id as MenuType })}
              className={cn(
                'rounded-md py-1.5 text-xs font-medium transition-colors text-center',
                layout.menuType === type.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Typography settings */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
          <Type className="h-3.5 w-3.5 text-zinc-500" />
          <span>Шрифт заметок</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(
            [
              { id: 'sans', label: 'Sans (Modern)' },
              { id: 'serif', label: 'Serif (Book)' },
              { id: 'mono', label: 'Mono (Code)' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => updateSettings({ fontFamily: f.id })}
              className={cn(
                'rounded-md py-1.5 text-xs font-medium transition-colors text-center',
                settings.fontFamily === f.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data management and backup */}
      <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <label className="font-medium text-zinc-900 dark:text-zinc-100">
          Резервное копирование и данные
        </label>
        <div className="flex flex-col gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Экспорт всех воркспейсов (JSON)</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full justify-start gap-2 h-8 text-xs"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span>Импорт из JSON файла</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-full justify-start gap-2 h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Сбросить данные к образцу</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

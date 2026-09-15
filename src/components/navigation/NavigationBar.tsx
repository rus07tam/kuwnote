import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePluginRegistry } from '../../services/pluginApi';
import { DynamicIcon } from '../common/DynamicIcon';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../lib/utils';
import { Layers, FolderTree, Search, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const NavigationBar: React.FC = () => {
  const { layout, updateLayout, toggleMenu } = useApp();
  const { navItems: pluginNavItems } = usePluginRegistry();

  const isVertical = layout.navPosition === 'left' || layout.navPosition === 'right';

  const defaultNavItems = [
    {
      id: 'workspaces',
      label: 'Воркспейсы',
      icon: 'layers',
      tooltip: 'Воркспейсы (Пространства)',
    },
    {
      id: 'files',
      label: 'Файлы',
      icon: 'folder-tree',
      tooltip: 'Древо документов и папок',
    },
    {
      id: 'search',
      label: 'Поиск',
      icon: 'search',
      tooltip: 'Быстрый поиск по заметкам',
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: 'settings',
      tooltip: 'Настройки приложения',
    },
  ];

  const handleNavClick = (tabId: string) => {
    if (layout.activeNavTab === tabId && layout.isMenuOpen) {
      // If clicking already active tab, toggle menu
      toggleMenu();
    } else {
      updateLayout({
        activeNavTab: tabId,
        isMenuOpen: true,
      });
    }
  };

  return (
    <nav
      id="kuwnote-navigation-bar"
      className={cn(
        'z-40 flex select-none items-center justify-between border-zinc-200/80 bg-zinc-50/90 p-2 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90',
        isVertical
          ? 'w-14 flex-col border-r py-3 px-1.5'
          : 'h-13 w-full border-b px-4 py-1.5',
        layout.navPosition === 'right' && 'border-r-0 border-l',
        layout.navPosition === 'bottom' && 'border-b-0 border-t order-last'
      )}
    >
      {/* Brand logo / app icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          isVertical ? 'mb-4 flex-col gap-1' : 'mr-4 flex-row gap-2'
        )}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          title="Kuwnote (org.ruject.kuwnote)"
        >
          <span className="font-bold text-sm tracking-tighter">Kw</span>
        </div>
      </div>

      {/* Main navigation icons */}
      <div
        className={cn(
          'flex flex-1 items-center gap-1.5',
          isVertical ? 'flex-col justify-start' : 'flex-row justify-center'
        )}
      >
        {defaultNavItems.map((item) => {
          const isActive = layout.activeNavTab === item.id && layout.isMenuOpen;
          return (
            <Tooltip
              key={item.id}
              content={item.tooltip}
              side={isVertical ? (layout.navPosition === 'left' ? 'right' : 'left') : 'bottom'}
            >
              <button
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
                )}
              >
                {item.icon === 'layers' && <Layers className="h-4 w-4" />}
                {item.icon === 'folder-tree' && <FolderTree className="h-4 w-4" />}
                {item.icon === 'search' && <Search className="h-4 w-4" />}
                {item.icon === 'settings' && <Settings className="h-4 w-4" />}

                {/* Active indicator pip */}
                {isActive && (
                  <span
                    className={cn(
                      'absolute rounded-full bg-indigo-500',
                      isVertical
                        ? layout.navPosition === 'left'
                          ? '-left-1 h-3 w-1'
                          : '-right-1 h-3 w-1'
                        : layout.navPosition === 'top'
                        ? '-top-1 h-1 w-3'
                        : '-bottom-1 h-1 w-3'
                    )}
                  />
                )}
              </button>
            </Tooltip>
          );
        })}

        {/* Extensible plugin navigation items */}
        {pluginNavItems.map((pluginItem) => {
          const isActive = layout.activeNavTab === pluginItem.id && layout.isMenuOpen;
          return (
            <Tooltip
              key={pluginItem.id}
              content={pluginItem.label}
              side={isVertical ? (layout.navPosition === 'left' ? 'right' : 'left') : 'bottom'}
            >
              <button
                id={`nav-plugin-btn-${pluginItem.id}`}
                onClick={() => handleNavClick(pluginItem.id)}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70'
                )}
              >
                <DynamicIcon name={pluginItem.iconName} className="h-4 w-4" />
                {pluginItem.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                    {pluginItem.badge}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Menu toggle collapse button */}
      <div className={cn('flex items-center', isVertical ? 'mt-auto pt-2' : 'ml-auto')}>
        <Tooltip
          content={layout.isMenuOpen ? 'Скрыть меню' : 'Открыть меню'}
          side={isVertical ? (layout.navPosition === 'left' ? 'right' : 'left') : 'top'}
        >
          <button
            id="toggle-menu-btn"
            onClick={toggleMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            {layout.isMenuOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </Tooltip>
      </div>
    </nav>
  );
};

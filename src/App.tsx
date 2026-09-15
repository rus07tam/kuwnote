import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationBar } from './components/navigation/NavigationBar';
import { AppMenu } from './components/menu/AppMenu';
import { ContentArea } from './components/content/ContentArea';
import { ContextMenu } from './components/common/ContextMenu';
import { AppModals } from './components/modals/AppModals';
import { TauriTitlebar } from './components/common/TauriTitlebar';
import { initializeDefaultPlugins } from './services/samplePlugins';
import { cn } from './lib/utils';

// Inner shell component that accesses layout and settings from useApp
const AppShell: React.FC = () => {
  const { layout, settings } = useApp();

  const isNavHorizontal = layout.navPosition === 'top' || layout.navPosition === 'bottom';

  return (
    <div
      id="kuwnote-root"
      className={cn(
        'relative flex h-screen w-screen flex-col overflow-hidden bg-white text-zinc-900 select-none dark:bg-zinc-950 dark:text-zinc-50'
      )}
    >
      {/* Desktop Tauri Window Titlebar */}
      <TauriTitlebar />

      {/* Main Layout Container */}
      <div
        className={cn(
          'relative flex flex-1 overflow-hidden',
          isNavHorizontal ? 'flex-col' : 'flex-row'
        )}
      >
        {/* Navigation Bar when Top or Left */}
        {(layout.navPosition === 'top' || layout.navPosition === 'left') && <NavigationBar />}

        {/* Workspace Center Body (Menu + Content Area) */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Menu if positioned on Left */}
          {layout.menuPosition === 'left' && <AppMenu />}

          {/* Main Content Area */}
          <ContentArea />

          {/* Menu if positioned on Right */}
          {layout.menuPosition === 'right' && <AppMenu />}
        </div>

        {/* Navigation Bar when Bottom or Right */}
        {(layout.navPosition === 'bottom' || layout.navPosition === 'right') && <NavigationBar />}
      </div>

      {/* Global Context Menu */}
      <ContextMenu />

      {/* Modals & Dialogs */}
      <AppModals />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    // Initialize default extensible plugins
    initializeDefaultPlugins();
  }, []);

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

import React from 'react';
import {
  KuwnoteExtension,
  ExtensionNavItem,
  ExtensionMenuPanel,
  ExtensionContentView,
  ExtensionBottomAction,
} from '../types';

type Listener = () => void;

class PluginRegistry {
  private plugins: Map<string, KuwnoteExtension> = new Map();
  private listeners: Set<Listener> = new Set();

  public register(plugin: KuwnoteExtension): () => void {
    this.plugins.set(plugin.id, plugin);
    this.notify();
    return () => this.unregister(plugin.id);
  }

  public unregister(pluginId: string): void {
    if (this.plugins.delete(pluginId)) {
      this.notify();
    }
  }

  public getPlugins(): KuwnoteExtension[] {
    return Array.from(this.plugins.values());
  }

  public getPlugin(id: string): KuwnoteExtension | undefined {
    return this.plugins.get(id);
  }

  public getAllNavItems(): ExtensionNavItem[] {
    const items: ExtensionNavItem[] = [];
    for (const p of this.plugins.values()) {
      if (p.navItems) {
        items.push(...p.navItems);
      }
    }
    return items.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
  }

  public getMenuPanel(navId: string): ExtensionMenuPanel | undefined {
    for (const p of this.plugins.values()) {
      if (p.menuPanels && p.menuPanels[navId]) {
        return p.menuPanels[navId];
      }
    }
    return undefined;
  }

  public getContentView(viewId: string): ExtensionContentView | undefined {
    for (const p of this.plugins.values()) {
      if (p.contentViews && p.contentViews[viewId]) {
        return p.contentViews[viewId];
      }
    }
    return undefined;
  }

  public getAllBottomActions(): ExtensionBottomAction[] {
    const actions: ExtensionBottomAction[] = [];
    for (const p of this.plugins.values()) {
      if (p.bottomActions) {
        actions.push(...p.bottomActions);
      }
    }
    return actions;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const pluginRegistry = new PluginRegistry();

export function usePluginRegistry(): {
  plugins: KuwnoteExtension[];
  navItems: ExtensionNavItem[];
  bottomActions: ExtensionBottomAction[];
} {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    return pluginRegistry.subscribe(() => setTick((t) => t + 1));
  }, []);

  return {
    plugins: pluginRegistry.getPlugins(),
    navItems: pluginRegistry.getAllNavItems(),
    bottomActions: pluginRegistry.getAllBottomActions(),
  };
}

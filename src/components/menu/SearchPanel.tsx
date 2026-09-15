import React from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { DynamicIcon } from '../common/DynamicIcon';
import { Search, Tag, FileText, ArrowRight } from 'lucide-react';

export const SearchPanel: React.FC = () => {
  const { searchQuery, setSearchQuery, searchResults, openDocument, activeDocId } = useApp();

  return (
    <div className="flex h-full flex-col">
      {/* Header with Search Input */}
      <div className="border-b border-zinc-200/80 p-3 dark:border-zinc-800/80">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <Input
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по заметкам, тегам, тексту..."
            className="h-8 pl-8 text-xs"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {searchQuery.trim() === '' ? (
          <div className="p-4 text-center text-xs text-zinc-400">
            <Search className="mx-auto mb-2 h-6 w-6 opacity-30" />
            <p>Введите ключевые слова для поиска по всем документам воркспейса</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-400">
            Ничего не найдено по запросу «{searchQuery}»
          </div>
        ) : (
          searchResults.map(({ item, doc }) => {
            const isSelected = item.id === activeDocId;
            return (
              <div
                key={item.id}
                onClick={() => openDocument(item.id)}
                className={`group cursor-pointer rounded-lg p-2.5 transition-all text-left ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-xs truncate">
                    {item.icon ? (
                      <DynamicIcon name={item.icon} className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                </div>

                {/* Tags preview */}
                {doc && doc.metadata.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {doc.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded bg-zinc-200/60 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, HelpCircle } from 'lucide-react';
import { POPULAR_LINK_PRESETS, LINK_CATEGORIES, LinkPreset } from '../utils/linkPresets';
import { getOfficialBrandIcon } from './BrandIcons';

interface LinkPresetsSelectorProps {
  onSelectPreset: (preset: LinkPreset) => void;
  selectedUrl?: string;
  selectedTitle?: string;
}

export function LinkPresetsSelector({
  onSelectPreset,
  selectedUrl = '',
  selectedTitle = '',
}: LinkPresetsSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const filteredPresets = useMemo(() => {
    return POPULAR_LINK_PRESETS.filter((preset) => {
      // Category filter
      if (selectedCategory !== 'all' && preset.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        preset.title.toLowerCase().includes(q) ||
        preset.shortLabel.toLowerCase().includes(q) ||
        preset.defaultGroup.toLowerCase().includes(q) ||
        preset.defaultUrl.toLowerCase().includes(q) ||
        preset.helperTip.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-2.5 bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3 sm:p-3.5">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <label className="text-[11px] font-bold text-white uppercase tracking-wider">
            Atajos Rápidos de Tipo de Enlace
          </label>
        </div>

        {/* Mini Search */}
        <div className="relative">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar red o enlace..."
            className="w-full sm:w-44 pl-7 pr-2.5 py-1 text-[11px] bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-[11px] sm:text-[10px] touch-pan-x">
        {LINK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center justify-center ${
              selectedCategory === cat.id
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar touch-pan-y">
        {filteredPresets.map((preset) => {
          const isSelected =
            (selectedUrl && selectedUrl.includes(preset.defaultUrl)) ||
            (selectedTitle && selectedTitle.toLowerCase() === preset.title.toLowerCase());

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectPreset(preset);
                setActiveTip(preset.helperTip);
              }}
              onMouseEnter={() => setActiveTip(preset.helperTip)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group min-h-[44px] ${preset.bgClass} ${preset.borderClass} ${
                isSelected ? 'ring-2 ring-sky-400 font-bold' : ''
              }`}
              title={preset.helperTip}
            >
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getOfficialBrandIcon(preset.defaultUrl, preset.title, 'w-5 h-5') || (
                  <span className="text-base leading-none">{preset.emoji}</span>
                )}
              </div>
              <div className="truncate min-w-0">
                <span className={`block text-[11px] truncate leading-tight ${preset.textClass}`}>
                  {preset.shortLabel.replace(/^[^\s]+\s*/, '')}
                </span>
                <span className="block text-[9px] text-slate-400 truncate">
                  {preset.defaultGroup}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper tooltip info banner */}
      {activeTip && (
        <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-[10px] text-slate-300 flex items-start gap-1.5 animate-in fade-in duration-150">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
          <span className="leading-tight">{activeTip}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  Palette,
  Search,
  Check,
  Sparkles,
  Layers,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CURATED_BACKGROUND_PRESETS,
  BACKGROUND_CATEGORIES,
  BackgroundPreset,
  BackgroundCategory,
} from '../utils/imageUpload';

interface BackgroundPresetsGalleryProps {
  currentGradient?: string;
  currentBgType?: string;
  onSelect: (preset: BackgroundPreset) => void;
  onResetToSolid?: () => void;
}

export function BackgroundPresetsGallery({
  currentGradient,
  currentBgType,
  onSelect,
  onResetToSolid,
}: BackgroundPresetsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered presets based on category and search query
  const filteredPresets = useMemo(() => {
    return CURATED_BACKGROUND_PRESETS.filter((preset) => {
      const matchesCategory =
        selectedCategory === 'Todos' || preset.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        preset.name.toLowerCase().includes(q) ||
        preset.category.toLowerCase().includes(q) ||
        preset.id.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Galería de Fondos de Pantalla Prediseñados
              <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                {CURATED_BACKGROUND_PRESETS.length} disponibles
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Fondos ultra nítidos y texturas de alta gama adaptados a pantallas Retina y móviles
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por estilo o color..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs (Interactive Filter Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {BACKGROUND_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count =
            cat === 'Todos'
              ? CURATED_BACKGROUND_PRESETS.length
              : CURATED_BACKGROUND_PRESETS.filter((p) => p.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-700/60 text-white' : 'bg-slate-900 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Presets Grid */}
      {filteredPresets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredPresets.map((preset) => {
            const isCurrentlyActive =
              currentBgType === 'gradient' && currentGradient === preset.gradient;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelect(preset)}
                className={`group relative p-3 rounded-2xl border text-left transition-all duration-200 overflow-hidden flex flex-col justify-between min-h-[110px] ${
                  isCurrentlyActive
                    ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-lg shadow-sky-500/20'
                    : 'border-slate-800 hover:border-slate-600 hover:scale-[1.02]'
                }`}
                style={{ background: preset.gradient }}
              >
                {/* Visual miniature mock inside the card preview */}
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Mini avatar representation */}
                    <div
                      className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center text-[9px] font-bold shadow-xs"
                      style={{
                        backgroundColor: preset.cardBg,
                        color: preset.textColor,
                      }}
                    >
                      •
                    </div>
                    {/* Mini button mockup */}
                    <div
                      className="h-2.5 w-10 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: preset.cardBg }}
                    />
                  </div>

                  {/* Active Badge */}
                  {isCurrentlyActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-sky-500 text-slate-950 px-2 py-0.5 rounded-md shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" /> Activo
                    </span>
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: preset.accent }}
                      title={`Acento: ${preset.accent}`}
                    />
                  )}
                </div>

                {/* Preset Metadata */}
                <div className="mt-auto pt-2 bg-gradient-to-t from-black/85 via-black/60 to-transparent -mx-3 -mb-3 p-3 rounded-b-2xl">
                  <span className="block text-xs font-bold text-white drop-shadow-md truncate">
                    {preset.name}
                  </span>
                  <span className="block text-[10px] text-slate-300 font-medium drop-shadow-xs truncate">
                    {preset.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80">
          <p className="text-xs text-slate-400">
            No se encontraron fondos que coincidan con "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="mt-2 text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Ver todos los fondos
          </button>
        </div>
      )}

      {/* Footer Info & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Haz clic en cualquier diseño para aplicarlo instantáneamente a tu tarjeta
        </span>

        {onResetToSolid && (
          <button
            type="button"
            onClick={onResetToSolid}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer a color sólido</span>
          </button>
        )}
      </div>
    </div>
  );
}

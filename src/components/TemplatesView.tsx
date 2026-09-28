import React, { useState } from 'react';
import {
  TemplateCategory,
  CATEGORY_DEFINITIONS,
  PRESET_TEMPLATES,
  PresetTemplate,
} from '../types/document';
import { BookOpen, Search, ChevronRight, Layers, Sparkles } from 'lucide-react';

interface TemplatesViewProps {
  onApplyPreset: (preset: PresetTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onApplyPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'all'
  >('all');
  const [search, setSearch] = useState<string>('');

  const filteredTemplates = PRESET_TEMPLATES.filter((tmpl) => {
    if (selectedCategory !== 'all' && tmpl.category !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tmpl.title.toLowerCase().includes(q) ||
        tmpl.subtitle.toLowerCase().includes(q) ||
        tmpl.docType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Албан бичгийн бэлэн загварууд
        </h2>
        <p className="text-xs text-slate-500">
          Монгол хэл дээр бэлтгэсэн стандартын дагуу загваруудаас сонгон шууд ашиглана уу
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Загварын нэр, төрлөөр хайх (түрээс, акт, итгэмжлэл, өргөдөл...)"
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Бүгд ({PRESET_TEMPLATES.length})
          </button>
          {CATEGORY_DEFINITIONS.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className="p-5 bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-400 rounded-2xl transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {preset.categoryLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {preset.docType}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors mb-1.5 leading-snug">
                {preset.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {preset.subtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {preset.mode === 'corporate' ? 'Компани / Албан тоот' : 'Иргэн / Өргөдөл'}
              </span>
              <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                <span>Ашиглах</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  TemplateCategory,
  DocumentType,
  CATEGORY_DEFINITIONS,
  PRESET_TEMPLATES,
  PresetTemplate,
} from '../types/document';
import { X, Plus, BookOpen, Layers, Check, Sparkles } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocType: (type: DocumentType | string, category: TemplateCategory) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
  initialCategory?: TemplateCategory;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onSelectDocType,
  onApplyPreset,
  initialCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>(
    initialCategory || 'application'
  );
  const [activeTab, setActiveTab] = useState<'types' | 'presets'>('types');

  if (!isOpen) return null;

  const currentCategoryDef = CATEGORY_DEFINITIONS.find(
    (c) => c.key === activeCategory
  );

  const categoryPresets = PRESET_TEMPLATES.filter(
    (p) => p.category === activeCategory
  );

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Шинэ баримт бичиг үүсгэх
              </h2>
              <p className="text-xs text-slate-500">
                Баримтын ангилал, төрөл эсвэл бэлэн загвараас сонгоно уу
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {CATEGORY_DEFINITIONS.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Төрлөөр сонгох vs Бэлэн загвар ашиглах */}
        <div className="px-6 py-2 border-b border-slate-100 flex items-center justify-between text-xs bg-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentCategoryDef?.icon}</span>
            <span className="font-bold text-slate-800">
              {currentCategoryDef?.label}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-[11px]">
              {currentCategoryDef?.description}
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('types')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'types'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Баримтын төрлүүд
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Бэлэн загварууд ({categoryPresets.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'types' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCategoryDef?.docTypes.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectDocType(item.type, activeCategory);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group flex items-start justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                        {item.label}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 pl-4">{item.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline self-center shrink-0">
                    Эхлүүлэх →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryPresets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                            {preset.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600 shrink-0">
                            {preset.docType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {preset.subtitle}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          {preset.mode === 'corporate' ? 'Байгууллагын албан тоот' : 'Иргэний өргөдөл'}
                        </span>
                        <span className="font-bold text-blue-600 group-hover:underline">
                          Ашиглах →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    Энэ ангилалд бэлэн загвар одоогоор алга байна. "Баримтын төрлүүд" хэсгээс сонгон эхлүүлнэ үү.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

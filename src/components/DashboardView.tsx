import React from 'react';
import {
  SavedDocument,
  TemplateCategory,
  CATEGORY_DEFINITIONS,
  PRESET_TEMPLATES,
  PresetTemplate,
} from '../types/document';
import {
  Plus,
  FileText,
  Clock,
  ExternalLink,
  Copy,
  Trash2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface DashboardViewProps {
  documents: SavedDocument[];
  onOpenDocument: (doc: SavedDocument) => void;
  onDuplicateDocument: (doc: SavedDocument) => void;
  onDeleteDocument: (id: string) => void;
  onNewDocument: () => void;
  onSelectCategory: (cat: TemplateCategory) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  onOpenDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onNewDocument,
  onSelectCategory,
  onApplyPreset,
}) => {
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Hero / Action Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Мэргэжлийн албан хэрэг хөтлөлтийн систем</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Баримт бичиг боловсруулах систем
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Word дээр гараар форматлах шаардлагагүй. Баримтын төрлөө сонгоод мэдээллээ оруулахад систем автоматаар мэргэжлийн стандартад нийцүүлэн бэлтгэж, шууд хэвлэх эсвэл PDF болгон татаж авах боломжтой.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Шинэ баримт эхлүүлэх</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Section: 📄 Сүүлд боловсруулсан */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              📄 Сүүлд боловсруулсан баримтууд
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Нийт {documents.length} баримт
          </span>
        </div>

        {recentDocs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => onOpenDocument(doc)}
                  className="flex items-start gap-3 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                        {doc.title || doc.docType}
                      </span>
                      {doc.documentNumber && (
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          № {doc.documentNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-600">{doc.docType}</span>
                      <span>•</span>
                      <span>{doc.date || 'Огноогүй'}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(doc.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onDuplicateDocument(doc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    title="Хуулбар үүсгэх"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Хуулбарлах</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Устгах"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Нээх</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Одоогоор боловсруулсан баримт бичиг байхгүй байна
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                "+ Шинэ баримт" товч дээр дарж эхний баримтаа хялбархан үүсгэнэ үү.
              </p>
            </div>
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Шинэ баримт эхлүүлэх</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Categories Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Баримтын үндсэн ангиллууд
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORY_DEFINITIONS.map((cat) => (
            <div
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="p-4 bg-white hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-xl transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      {cat.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[11px] text-slate-600">
                {cat.docTypes.slice(0, 3).map((dt, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium"
                  >
                    {dt.label}
                  </span>
                ))}
                {cat.docTypes.length > 3 && (
                  <span className="text-slate-400 self-center">
                    +{cat.docTypes.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Ready-to-use Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Түгээмэл ашиглагддаг бэлэн загварууд
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_TEMPLATES.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="text-left p-3.5 bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-xl transition-all group shadow-2xs flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                    {preset.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600 shrink-0">
                    {preset.categoryLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {preset.subtitle}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 mt-3 inline-flex items-center gap-1 group-hover:underline">
                <span>Загварыг ашиглах</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

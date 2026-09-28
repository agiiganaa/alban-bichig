import React, { useState } from 'react';
import {
  SavedDocument,
  TemplateCategory,
  CATEGORY_DEFINITIONS,
} from '../types/document';
import {
  Search,
  Plus,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';

interface DocumentsListViewProps {
  documents: SavedDocument[];
  onOpenDocument: (doc: SavedDocument) => void;
  onDuplicateDocument: (doc: SavedDocument) => void;
  onDeleteDocument: (id: string) => void;
  onNewDocument: () => void;
}

export const DocumentsListView: React.FC<DocumentsListViewProps> = ({
  documents,
  onOpenDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onNewDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'all'
  >('all');

  const filteredDocs = documents.filter((doc) => {
    // Category match
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (doc.title || '').toLowerCase().includes(q);
      const typeMatch = (doc.docType || '').toLowerCase().includes(q);
      const numMatch = (doc.documentNumber || '').toLowerCase().includes(q);
      const textMatch = (doc.data?.roughText || '')
        .toLowerCase()
        .includes(q) || (doc.data?.formalizedText || '').toLowerCase().includes(q);
      const recipientMatch = (doc.data?.recipient || '').toLowerCase().includes(q);
      return titleMatch || typeMatch || numMatch || textMatch || recipientMatch;
    }

    return true;
  });

  const categoryFilters: { key: TemplateCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Бүгд' },
    { key: 'application', label: 'Өргөдөл, хүсэлт' },
    { key: 'corporate_letter', label: 'Албан тоот' },
    { key: 'poa', label: 'Итгэмжлэл' },
    { key: 'contract', label: 'Гэрээ' },
    { key: 'handover', label: 'Акт' },
    { key: 'internal', label: 'Дотоод бичиг' },
    { key: 'other', label: 'Бусад' },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Миний баримтууд
          </h2>
          <p className="text-xs text-slate-500">
            Хадгалсан, боловсруулсан баримт бичгүүдийн жагсаалт
          </p>
        </div>

        <button
          type="button"
          onClick={onNewDocument}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Шинэ баримт</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Баримтын нэр, дугаар (АКТ-26), агуулга эсвэл түлхүүр үгээр хайх...'
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categoryFilters.map((cf) => (
            <button
              key={cf.key}
              type="button"
              onClick={() => setSelectedCategory(cf.key)}
              className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                selectedCategory === cf.key
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left content */}
                <div
                  onClick={() => onOpenDocument(doc)}
                  className="flex items-start gap-3.5 cursor-pointer flex-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                        {doc.title || doc.docType}
                      </span>
                      {doc.documentNumber && (
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          № {doc.documentNumber}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status === 'completed'
                          ? 'Бэлэн'
                          : doc.status === 'printed'
                          ? 'Хэвлэсэн'
                          : 'Ноорог'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{doc.docType}</span>
                      <span>•</span>
                      <span>{doc.date || 'Огноогүй'}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        Сүүлд зассан:{' '}
                        {new Date(doc.updatedAt).toLocaleDateString()}{' '}
                        {new Date(doc.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {doc.data?.recipient && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        Хэнд: {doc.data.recipient.split('\n')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onDuplicateDocument(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Хуулбар үүсгэх"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Хуулбарлах</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Хайлтад тохирох баримт олдсонгүй'
                  : 'Хадгалсан баримт байхгүй байна'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery
                  ? 'Хайлтын үгээ өөрчлөөд дахин оролдоно уу.'
                  : 'Шинэ баримт үүсгэж боловсруулалт хийнэ үү.'}
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Бүх баримтыг харах
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

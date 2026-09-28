import React from 'react';
import {
  FileText,
  Printer,
  Plus,
  LayoutDashboard,
  FileEdit,
  FolderKanban,
  BookOpen,
  Building2,
  Settings,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export type AppNavTab =
  | 'dashboard'
  | 'editor'
  | 'documents'
  | 'templates'
  | 'org'
  | 'settings';

interface HeaderProps {
  currentTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onNewDocument: () => void;
  onPrint: () => void;
  savedCount: number;
  isSaving?: boolean;
  activeDocTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewDocument,
  onPrint,
  savedCount,
  isSaving,
  activeDocTitle,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Name & Identity */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                АЛБАН БИЧИГ БЭЛТГЭГЧ
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight">
                Албан бичиг, өргөдөл, хүсэлт, гэрээ хялбар боловсруулах систем
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Хянах самбар</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('editor')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'editor'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Баримт засах</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('documents')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'documents'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Миний баримтууд</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-100 text-blue-700 font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('templates')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'templates'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Загварууд</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('org')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'org'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Байгууллага</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('settings')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Тохиргоо"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Auto-save Status Indicator */}
            {currentTab === 'editor' && (
              <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-1 rounded bg-slate-50 border border-slate-200">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                    <span className="text-amber-700">Хадгалж байна...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Хадгалагдсан ✓</span>
                  </>
                )}
              </div>
            )}

            {/* + Шинэ баримт */}
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Шинэ баримт</span>
            </button>

            {/* Хэвлэх / PDF */}
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Хэвлэх / PDF татах"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Хэвлэх / PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            Самбар
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('editor')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              currentTab === 'editor'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            Засах
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('documents')}
            className={`px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              currentTab === 'documents'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            <span>Баримтууд</span>
            {savedCount > 0 && <span>({savedCount})</span>}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('templates')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              currentTab === 'templates'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            Загварууд
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('org')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              currentTab === 'org'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            Байгууллага
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              currentTab === 'settings'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600'
            }`}
          >
            Тохиргоо
          </button>
        </div>
      </div>
    </header>
  );
};

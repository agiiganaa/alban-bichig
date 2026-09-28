import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Info,
  CheckCircle,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onPrint: () => void;
  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPrint,
  activeTab,
  setActiveTab,
}) => {
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  return (
    <>
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Албан бичиг бэлтгэгч
                  </h1>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    MNS 5140 : 2021
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Монгол улсын стандартын дагуу компанийн албан тоот, өргөдөл, хүсэлт бэлтгэх систем
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex lg:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Бичих
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Харах
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                title="Албан бичгийн стандартын тухай"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Хэвлэх / PDF татах</span>
                <span className="sm:hidden">Хэвлэх</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Монгол Улсын Албан хэрэг хөтлөлтийн стандарт
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Монгол Улсын баримт бичгийн стандарт <strong>MNS 5140-1:2021</strong>-ийн
                дагуу албан өргөдөл, хүсэлт дараах үндсэн шаардлагыг хангасан байдаг:
              </p>

              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Хүлээн авагч (Баруун дээд талд):</strong>{' '}
                    Хүлээн авах байгууллага, албан тушаалтан, нэрийг тодорхой бичиж
                    «танаа» эсвэл «-д/-т»-ээр төгсгөнө.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Гарчиг (Хуудасны голд):</strong>{' '}
                    Ө Р Г Ө Д Ө Л эсвэл Х Ү С Э Л Т гэж үсэг хоорондын зайтай,
                    томоор бичнэ.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Их бие бичвэр (Догол мөр 1.25 см):</strong>{' '}
                    Догол мөр бүр 1.25 см зайтай, хоёр тийш тэгшилсэн (Justified)
                    байх ба шалтгаан, үндэслэл, хүсэж буй шийдлийг тодорхой тусгана.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Баталгаажуулалт (Баруун доод талд):</strong>{' '}
                    Өргөдөл гаргагчийн албан тушаал, гарын үсэг, овог нэр, огноо,
                    холбоо барих утсыг заавал байрлуулна.
                  </div>
                </div>
              </div>

              <p className="text-slate-500">
                💡 <strong>Зөвлөмж:</strong> «✨ Албан найруулгаар засах» товчлуур нь
                Gemini хиймэл оюуны тусламжтайгаар таны энгийн үгээр бичсэн
                санааг эдгээр шаардлагад нийцүүлэн албан хэлбэрт шилжүүлдэг.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors"
              >
                Ойлголоо
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

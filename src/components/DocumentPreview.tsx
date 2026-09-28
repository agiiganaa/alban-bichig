import React, { useState } from 'react';
import { DocumentData } from '../types/document';
import { OfficialA4Document } from './OfficialA4Document';
import {
  Printer,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Stamp,
  Edit3,
} from 'lucide-react';

interface DocumentPreviewProps {
  data: DocumentData;
  onPrint: () => void;
  onUpdateFont: (family: 'serif' | 'sans', size: 'sm' | 'base' | 'lg') => void;
  onToggleStamp: () => void;
  onChange: (updated: Partial<DocumentData>) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  data,
  onPrint,
  onUpdateFont,
  onToggleStamp,
  onChange,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(true);

  const handleCopyText = async () => {
    const rawText = data.formalizedText || data.roughText || '';
    const paragraphs =
      data.paragraphsList && data.paragraphsList.length > 0
        ? data.paragraphsList
        : rawText
            .split('\n')
            .map((p) => p.trim())
            .filter((p) => p.length > 0);

    const fullText = `${data.companyName ? data.companyName + '\n' : ''}${
      data.recipient ? 'Хэнд: ' + data.recipient + '\n' : ''
    }
${data.title || data.docType}
Огноо: ${data.date}    Байршил: ${data.city}

${paragraphs.join('\n\n')}

${data.signatoryTitle || 'Гарын үсэг:'} ${data.signatoryName || data.sender || ''}
${
  data.secondSignatoryName
    ? `${data.secondSignatoryTitle || 'Хүлээн авсан:'} ${data.secondSignatoryName}`
    : ''
}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Top Preview Control Toolbar (Hidden in Print) */}
      <div className="no-print bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Edit mode toggle button */}
          <button
            type="button"
            onClick={() => setIsEditModeActive(!isEditModeActive)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              isEditModeActive
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Хуудас дээр дарж шууд засах горим"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditModeActive ? 'Засах: Нээлттэй' : 'Зөвхөн харах'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Font switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => onUpdateFont('serif', data.fontSize)}
              title="Times New Roman"
              className={`px-2.5 py-1 rounded text-xs font-serif transition-colors cursor-pointer ${
                data.fontFamily === 'serif'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Times
            </button>
            <button
              type="button"
              onClick={() => onUpdateFont('sans', data.fontSize)}
              title="Arial"
              className={`px-2.5 py-1 rounded text-xs font-sans transition-colors cursor-pointer ${
                data.fontFamily === 'sans'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arial
            </button>
          </div>

          {/* Font size switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => onUpdateFont(data.fontFamily, 'sm')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                data.fontSize === 'sm'
                  ? 'bg-white font-bold text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Жижиг
            </button>
            <button
              type="button"
              onClick={() => onUpdateFont(data.fontFamily, 'base')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                data.fontSize === 'base' || !data.fontSize
                  ? 'bg-white font-bold text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Дунд
            </button>
            <button
              type="button"
              onClick={() => onUpdateFont(data.fontFamily, 'lg')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                data.fontSize === 'lg'
                  ? 'bg-white font-bold text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Том
            </button>
          </div>

          {/* Stamp toggle */}
          <button
            type="button"
            onClick={onToggleStamp}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-colors cursor-pointer ${
              data.officialStamp
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Албаны тамга"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Албаны тамга</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(60, prev - 10))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
              title="Багасгах"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] text-slate-600 font-mono w-10 text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(130, prev + 10))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
              title="Томсгох"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded transition-colors text-xs font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Хууллаа</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Хуулах</span>
              </>
            )}
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded shadow-xs transition-all font-semibold text-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Хэвлэх / PDF татах</span>
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start">
        <div
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
          }}
          className="transition-transform duration-150 shadow-xl rounded-xs overflow-hidden"
        >
          <OfficialA4Document
            data={data}
            isPrintMode={false}
            isEditModeActive={isEditModeActive}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

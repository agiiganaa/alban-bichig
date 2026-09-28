import React, { useState } from 'react';
import {
  DocumentData,
  ActItem,
  QuoteItem,
  MeetingActionItem,
} from '../types/document';
import {
  Printer,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  FileText,
  Stamp,
  Car,
  ListTodo,
  Edit3,
  Plus,
  Trash2,
  Paperclip,
  DollarSign,
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

  const isActDoc = data.docType.includes('АКТ');
  const isPoaDoc = data.docType.includes('ИТГЭМЖЛЭЛ');
  const isVehiclePoa = data.docType === 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ';
  const isMeetingMinutes = data.docType === 'ХУРЛЫН ТЭМДЭГЛЭЛ';
  const isInternalMemo = data.docType === 'ДОТООД САНАМЖ БИЧИГ';
  const isPaymentGuarantee = data.docType.includes('БАТАЛГАА');
  const isPriceQuote =
    data.docType === 'ҮНИЙН САНАЛ' || Boolean(data.quoteItems && data.quoteItems.length > 0);

  const getDocTitle = () => {
    switch (data.docType) {
      case 'ӨРГӨДӨЛ':
        return 'Ө Р Г Ө Д Ө Л';
      case 'ХҮСЭЛТ':
        return 'Х Ү С Э Л Т';
      case 'ТОДОРХОЙЛОЛТ':
        return 'Т О Д О Р Х О Й Л О Л Т';
      case 'АЛБАН ТООТ':
        return 'А Л Б А Н   Т О О Т';
      case 'ҮНИЙН САНАЛ':
        return 'Ү Н И Й Н   С А Н А Л';
      case 'ШААРДАХ БИЧИГ':
        return 'Ш А А Р Д А Х   Б И Ч И Г';
      case 'МЭДЭГДЭЛ':
        return 'М Э Д Э Г Д Э Л';
      case 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ':
        return 'Э Д   Х Ө Р Ө Н Г Ө   Х Ү Л Э Э Л Ц Э Х   А К Т';
      case 'АЖИЛ ХҮЛЭЭЛЦЭХ АКТ':
        return 'А Ж И Л   Х Ү Л Э Э Л Ц Э Х   А К Т';
      case 'ИТГЭМЖЛЭЛ':
        return 'И Т Г Э М Ж Л Э Л';
      case 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ':
        return 'Т Э Э В Р И Й Н   Х Э Р Э Г С Л И Й Н   И Т Г Э М Ж Л Э Л';
      case 'ХУРЛЫН ТЭМДЭГЛЭЛ':
        return 'Х У Р Л Ы Н   Т Э М Д Э Г Л Э Л';
      case 'ДОТООД САНАМЖ БИЧИГ':
        return 'Д О Т О О Д   С А Н А М Ж   Б И Ч И Г';
      case 'САХИЛГЫН ШИЙТГЭЛИЙН МЭДЭГДЭХ ХУУДАС':
        return 'С А Х И Л Г Ы Н   Ш И Й Т Г Э Л   М Э Д Э Г Д Э Х   Х У У Д А С';
      case 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС':
        return 'Т Ө Л Б Ө Р   Т Ө Л Ө Х   Б А Т А Л Г А А Н Ы   Х У У Д А С';
      default:
        return data.docType;
    }
  };

  const getPrimarySignatoryTitle = () => {
    if (data.signatoryTitle) return data.signatoryTitle;
    if (isActDoc) return 'Хүлээлгэн өгсөн:';
    if (isPoaDoc) return 'Итгэмжлэгч:';
    if (isMeetingMinutes) return 'Хурал даргалагч:';
    if (isPaymentGuarantee) return 'Баталгаа гаргасан:';
    if (data.mode === 'corporate') return 'Гүйцэтгэх захирал:';
    if (data.docType === 'ӨРГӨДӨЛ') return 'Өргөдөл гаргасан:';
    if (data.docType === 'ХҮСЭЛТ') return 'Хүсэлт гаргасан:';
    return 'Гарын үсэг:';
  };

  const getSecondarySignatoryTitle = () => {
    if (data.secondSignatoryTitle) return data.secondSignatoryTitle;
    if (isActDoc) return 'Хүлээн авсан:';
    if (isPoaDoc) return 'Итгэмжлэгдэгч:';
    if (isMeetingMinutes) return 'Тэмдэглэл хөтөлсөн:';
    if (isPaymentGuarantee) return 'Баталгаа хүлээн авсан:';
    return 'Хүлээн авсан:';
  };

  // Convert paragraphs to array
  const rawText = data.formalizedText || data.roughText || '';
  const paragraphs =
    data.paragraphsList && data.paragraphsList.length > 0
      ? data.paragraphsList
      : rawText
          .split('\n')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

  // Update a single paragraph from in-place preview editing
  const handleParagraphBlur = (index: number, newContent: string) => {
    const updated = [...paragraphs];
    updated[index] = newContent;
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  // Add clause directly from preview
  const handleAddClauseInPreview = () => {
    const updated = [
      ...paragraphs,
      'Шинэ заалтын агуулгыг энд бичнэ үү. Товшиж шууд засварлах боломжтой.',
    ];
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  // Remove clause directly from preview
  const handleRemoveClauseInPreview = (index: number) => {
    const updated = paragraphs.filter((_, i) => i !== index);
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  // Act items update from preview
  const handleUpdateActItem = (id: string, updatedFields: Partial<ActItem>) => {
    const current = data.actItems || [];
    onChange({
      actItems: current.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    });
  };

  const handleAddActItemInPreview = () => {
    const current = data.actItems || [];
    const newItem: ActItem = {
      id: String(Date.now()),
      name: 'Шинэ эд хөрөнгийн нэр',
      quantity: '1 ширхэг',
      condition: 'Бүрэн ажиллагаатай',
      notes: '',
    };
    onChange({ actItems: [...current, newItem] });
  };

  const handleRemoveActItemInPreview = (id: string) => {
    const current = data.actItems || [];
    onChange({ actItems: current.filter((item) => item.id !== id) });
  };

  // Price Quote items update from preview
  const handleUpdateQuoteItem = (id: string, updatedFields: Partial<QuoteItem>) => {
    const current = data.quoteItems || [];
    onChange({
      quoteItems: current.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updatedFields };
        const qty = parseFloat(merged.quantity.replace(/,/g, ''));
        const price = parseFloat(merged.unitPrice.replace(/,/g, ''));
        if (!isNaN(qty) && !isNaN(price) && updatedFields.totalPrice === undefined) {
          merged.totalPrice = (qty * price).toLocaleString('en-US');
        }
        return merged;
      }),
    });
  };

  const handleAddQuoteItemInPreview = () => {
    const current = data.quoteItems || [];
    const newItem: QuoteItem = {
      id: String(Date.now()),
      name: 'Шинэ бараа, үйлчилгээний нэр',
      unit: 'ш',
      quantity: '1',
      unitPrice: '100,000',
      totalPrice: '100,000',
      notes: '',
    };
    onChange({ quoteItems: [...current, newItem] });
  };

  const handleRemoveQuoteItemInPreview = (id: string) => {
    const current = data.quoteItems || [];
    onChange({ quoteItems: current.filter((item) => item.id !== id) });
  };

  // Meeting Action items update from preview
  const handleUpdateMeetingActionItem = (
    id: string,
    updatedFields: Partial<MeetingActionItem>
  ) => {
    const current = data.meetingActionItems || [];
    onChange({
      meetingActionItems: current.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    });
  };

  const handleAddMeetingActionItemInPreview = () => {
    const current = data.meetingActionItems || [];
    const newItem: MeetingActionItem = {
      id: String(Date.now()),
      task: 'Шинэ үүрэг даалгавар',
      assignee: 'Хариуцагч ажилтан',
      deadline: '2026.10.15',
    };
    onChange({ meetingActionItems: [...current, newItem] });
  };

  const handleRemoveMeetingActionItemInPreview = (id: string) => {
    const current = data.meetingActionItems || [];
    onChange({ meetingActionItems: current.filter((item) => item.id !== id) });
  };

  // Custom fields update in preview
  const handleRemoveCustomFieldInPreview = (id: string) => {
    const current = data.customFields || [];
    onChange({ customFields: current.filter((item) => item.id !== id) });
  };

  const handleAddCustomFieldInPreview = () => {
    const current = data.customFields || [];
    const newField = {
      id: String(Date.now()),
      label: 'Талбар',
      value: 'Утга',
    };
    onChange({ customFields: [...current, newField] });
  };

  // Attachments update in preview
  const handleRemoveAttachmentInPreview = (index: number) => {
    const current = (data.attachments || []).filter((_, i) => i !== index);
    onChange({ attachments: current });
  };

  const handleAddAttachmentInPreview = () => {
    const current = data.attachments || [];
    const count = current.length + 1;
    onChange({
      attachments: [...current, `${count}. Шинэ хавсралт баримт (1 хуудас)`],
      showAttachments: true,
    });
  };

  const quoteTotalSum = (data.quoteItems || []).reduce((sum, item) => {
    const val = parseFloat((item.totalPrice || '').replace(/,/g, '')) || 0;
    return sum + val;
  }, 0);

  const handleCopyText = async () => {
    const fullText = `${data.companyName ? data.companyName + '\n' : ''}${
      data.recipient ? 'Хэнд: ' + data.recipient + '\n' : ''
    }
${getDocTitle()}
Огноо: ${data.date}    Байршил: ${data.city}

${paragraphs.join('\n\n')}

${getPrimarySignatoryTitle()} ${data.signatoryName || data.sender || ''}
${
  data.secondSignatoryName
    ? `${getSecondarySignatoryTitle()} ${data.secondSignatoryName}`
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

  const fontClass = data.fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  const fontSizeClass =
    data.fontSize === 'sm'
      ? 'text-[12.5px] leading-[1.6]'
      : data.fontSize === 'lg'
      ? 'text-[14.5px] leading-[1.75]'
      : 'text-[13.5px] leading-[1.7]';

  const hasDualSignatures =
    data.showSecondParty !== false &&
    (isActDoc ||
      isPoaDoc ||
      isMeetingMinutes ||
      isPaymentGuarantee ||
      Boolean(data.secondSignatoryName));

  const showCompanyHeader =
    data.showCompanyHeader !== false && data.mode === 'corporate';
  const showDocNumber = data.showDocNumber !== false;
  const showRecipient = data.showRecipient !== false && Boolean(data.recipient);
  const showDateLocation = data.showDateLocation !== false;
  const showAttachments =
    data.showAttachments !== false &&
    data.attachments &&
    data.attachments.length > 0;

  // Shared editable class styling
  const editableClass = isEditModeActive
    ? 'cursor-text hover:outline-1 hover:outline-dashed hover:outline-blue-400 focus:outline-2 focus:outline-blue-600 focus:bg-blue-50/20 rounded-xs transition-all print:outline-none print:bg-transparent'
    : '';

  return (
    <div className="flex flex-col h-full">
      {/* Top Preview Control Toolbar (Hidden in Print) */}
      <div className="no-print bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>А4 Баримт бичгийн харагдац</span>
          </span>

          {/* Toggle WYSIWYG editing badge */}
          <button
            type="button"
            onClick={() => setIsEditModeActive(!isEditModeActive)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              isEditModeActive
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-slate-200 text-slate-600'
            }`}
            title="Бичвэр дээр товшиж Word шиг шууд засварлах горим"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditModeActive ? 'Word засах: ИДЭВХТЭЙ' : 'Засах горим'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Font switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => onUpdateFont('serif', data.fontSize)}
              title="Times New Roman"
              className={`px-2 py-1 rounded text-[11px] font-serif transition-colors ${
                data.fontFamily === 'serif'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Times
            </button>
            <button
              type="button"
              onClick={() => onUpdateFont('sans', data.fontSize)}
              title="Arial"
              className={`px-2 py-1 rounded text-[11px] font-sans transition-colors ${
                data.fontFamily === 'sans'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arial
            </button>
          </div>

          {/* Stamp toggle */}
          <button
            type="button"
            onClick={onToggleStamp}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
              data.officialStamp
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Албаны тамга"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Албаны тамга</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded p-0.5">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(60, prev - 10))}
              className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
              title="Багасгах"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] text-slate-600 font-mono w-10 text-center">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md shadow-xs transition-all font-semibold text-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Хэвлэх / PDF татах</span>
          </button>
        </div>
      </div>

      {/* Notice Banner about direct click-to-edit */}
      {isEditModeActive && (
        <div className="no-print bg-blue-50/70 border-b border-blue-200/60 px-4 py-1.5 text-[11px] text-blue-900 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold">💡 Word шиг шууд засах:</span>
            <span>Та хуудас дээрх дурын гарчиг, догол мөр, хүснэгт дээр дарж шууд бичиж, арилгаж болно.</span>
          </span>
          <span className="text-[10px] text-blue-600 hidden sm:inline">MNS 5140 Стандарт</span>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 overflow-auto bg-slate-200/80 p-3 sm:p-6 lg:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
        <div
          id="official-a4-document"
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
          }}
          className={`print-document-container w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0 rounded-xs relative flex flex-col justify-between transition-transform duration-150 ${fontClass}`}
        >
          {/* Inner Document Padding (MNS standard: Top 20mm, Right 15mm, Bottom 20mm, Left 30mm) */}
          <div className="p-8 sm:p-12 md:pt-[20mm] md:pb-[20mm] md:pr-[15mm] md:pl-[30mm] flex-1 flex flex-col justify-between">
            {/* Upper Section */}
            <div>
              {/* ================= CORPORATE LETTERHEAD ================= */}
              {showCompanyHeader && (
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 pb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {data.companyLogo ? (
                        <img
                          src={data.companyLogo}
                          alt="Logo"
                          className="w-14 h-14 object-contain shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs font-sans">
                          {data.companyName
                            ? data.companyName.replace(/[^а-яөүёa-z0-9]/gi, '').charAt(0) || 'M'
                            : 'M'}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <h2
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ companyName: e.currentTarget.textContent || '' })
                          }
                          className={`text-base sm:text-lg font-bold text-slate-900 tracking-wide uppercase leading-tight font-sans ${editableClass}`}
                        >
                          {data.companyName || '«МОНГОЛ ТЕХНОЛОГИ» ХХК'}
                        </h2>

                        <div
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ companyNameEn: e.currentTarget.textContent || '' })
                          }
                          className={`text-[11px] text-slate-600 font-semibold tracking-wider uppercase font-sans ${editableClass}`}
                        >
                          {data.companyNameEn || 'MONGOL TECHNOLOGY LLC'}
                        </div>

                        <div className="text-[10px] text-slate-500 font-sans leading-tight pt-1 space-y-0.5">
                          <div
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              onChange({ companyAddress: e.currentTarget.textContent || '' })
                            }
                            className={editableClass}
                          >
                            {data.companyAddress || 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо'}
                          </div>

                          <div className="flex flex-wrap gap-x-3 text-slate-600">
                            <span
                              contentEditable={isEditModeActive}
                              suppressContentEditableWarning={true}
                              onBlur={(e) =>
                                onChange({
                                  companyPhone:
                                    e.currentTarget.textContent?.replace('Утас: ', '') || '',
                                })
                              }
                              className={editableClass}
                            >
                              Утас: {data.companyPhone || '7711-0099'}
                            </span>
                            <span
                              contentEditable={isEditModeActive}
                              suppressContentEditableWarning={true}
                              onBlur={(e) =>
                                onChange({
                                  companyEmail:
                                    e.currentTarget.textContent?.replace('И-мэйл: ', '') || '',
                                })
                              }
                              className={editableClass}
                            >
                              И-мэйл: {data.companyEmail || 'info@company.mn'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[10px] text-slate-500 font-sans space-y-0.5">
                      <div className="font-mono">
                        РД:{' '}
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ companyRegister: e.currentTarget.textContent || '' })
                          }
                          className={`font-bold text-slate-900 ${editableClass}`}
                        >
                          {data.companyRegister || '5412980'}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        MNS 5140 : 2021
                      </div>
                    </div>
                  </div>

                  {/* Standard Double Line for Mongolian Letterhead */}
                  <div className="border-t-2 border-slate-900 mt-1 mb-0.5" />
                  <div className="border-t border-slate-900 mb-4" />

                  {/* Registration Date & Number Line */}
                  <div className="flex items-center justify-between text-xs text-slate-800 font-sans mb-6 pb-2 border-b border-slate-200">
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onChange({ date: e.currentTarget.textContent || '' })}
                      className={editableClass}
                    >
                      {data.date || '2026 оны ... сарын ... өдөр'}
                    </div>

                    {showDocNumber && (
                      <div className="font-bold font-mono">
                        Дугаар: №{' '}
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ documentNumber: e.currentTarget.textContent || '' })
                          }
                          className={editableClass}
                        >
                          {data.documentNumber || '_____'}
                        </span>
                      </div>
                    )}

                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onChange({ city: e.currentTarget.textContent || '' })}
                      className={`text-slate-500 text-[11px] ${editableClass}`}
                    >
                      {data.city || 'Улаанбаатар хот'}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal accreditation if no corporate header */}
              {!showCompanyHeader && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
                  <div className="text-[11px] text-slate-400 font-sans tracking-widest uppercase">
                    Монгол Улс · Албан баримт бичиг
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    MNS 5140 : 2021
                  </div>
                </div>
              )}

              {/* ================= RECIPIENT BLOCK ================= */}
              {showRecipient && !isMeetingMinutes && (
                <div className="flex justify-end mb-6">
                  <div className="w-full sm:w-3/5 text-right sm:text-left sm:pl-8">
                    <div className="text-xs uppercase text-slate-500 font-sans tracking-wider mb-0.5">
                      Хэнд:
                    </div>
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ recipient: e.currentTarget.textContent || '' })
                      }
                      className={`text-sm sm:text-base font-bold text-slate-900 leading-snug whitespace-pre-line ${editableClass}`}
                    >
                      {data.recipient}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= CENTER TITLE ================= */}
              <div className="text-center my-6">
                <h1
                  contentEditable={isEditModeActive}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange({
                      docType: (e.currentTarget.textContent?.trim() || data.docType) as any,
                    })
                  }
                  className={`text-lg sm:text-xl font-bold tracking-[0.2em] text-slate-900 uppercase ${editableClass}`}
                >
                  {getDocTitle()}
                </h1>

                {/* Sub-header line if Personal mode */}
                {!showCompanyHeader && showDateLocation && (
                  <div className="flex items-center justify-between border-b border-slate-300 mt-4 pb-2 text-xs sm:text-sm text-slate-700 font-sans">
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onChange({ date: e.currentTarget.textContent || '' })}
                      className={editableClass}
                    >
                      {data.date || '2026 оны ... сарын ... өдөр'}
                    </div>
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onChange({ city: e.currentTarget.textContent || '' })}
                      className={editableClass}
                    >
                      {data.city || 'Улаанбаатар хот'}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= MEETING MINUTES HEADER METADATA ================= */}
              {isMeetingMinutes && (
                <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 mb-6 text-xs text-slate-800 space-y-2 font-sans">
                  <div className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <div>
                      Хурлын сэдэв:{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ meetingTitle: e.currentTarget.textContent || '' })
                        }
                        className={editableClass}
                      >
                        {data.meetingTitle || 'Удирдах зөвлөлийн хурал'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-slate-600">Огноо, газар:</span>{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onChange({ date: e.currentTarget.textContent || '' })}
                        className={editableClass}
                      >
                        {data.date}
                      </span>{' '}
                      ·{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onChange({ city: e.currentTarget.textContent || '' })}
                        className={editableClass}
                      >
                        {data.city}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Хурал даргалагч:</span>{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ meetingChairperson: e.currentTarget.textContent || '' })
                        }
                        className={editableClass}
                      >
                        {data.meetingChairperson || data.signatoryName || 'Удирдлага'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Тэмдэглэл хөтөлсөн:</span>{' '}
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ meetingSecretary: e.currentTarget.textContent || '' })
                      }
                      className={editableClass}
                    >
                      {data.meetingSecretary || data.secondSignatoryName || 'Нарийн бичиг'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Оролцсон гишүүд (Ирц):</span>{' '}
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ meetingAttendees: e.currentTarget.textContent || '' })
                      }
                      className={editableClass}
                    >
                      {data.meetingAttendees || 'Нийт гишүүд 100% ирцтэй'}
                    </span>
                  </div>
                </div>
              )}

              {/* ================= INTERNAL MEMO HEADER ================= */}
              {isInternalMemo && (
                <div className="border border-slate-300 mb-6 font-sans text-xs divide-y divide-slate-300 bg-slate-50/50">
                  <div className="grid grid-cols-4 p-2">
                    <span className="font-bold text-slate-700">ХЭНД:</span>
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ recipient: e.currentTarget.textContent || '' })
                      }
                      className={`col-span-3 text-slate-900 font-semibold ${editableClass}`}
                    >
                      {data.recipient || 'Бүх хэлтсийн ажилтнуудад'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 p-2">
                    <span className="font-bold text-slate-700">ХЭНЭЭС:</span>
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => onChange({ sender: e.currentTarget.textContent || '' })}
                      className={`col-span-3 text-slate-900 font-semibold ${editableClass}`}
                    >
                      {data.sender || data.signatoryName || 'Удирдлага'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 p-2">
                    <span className="font-bold text-slate-700">СЭДЭВ:</span>
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ memoSubject: e.currentTarget.textContent || '' })
                      }
                      className={`col-span-3 text-slate-900 font-bold ${editableClass}`}
                    >
                      {data.memoSubject || 'Ажлын санамж бичиг'}
                    </span>
                  </div>
                </div>
              )}

              {/* ================= VEHICLE SPECS BOX ================= */}
              {isVehiclePoa && (
                <div className="mb-6 p-3.5 bg-slate-50 border border-slate-300 rounded-sm text-xs font-sans space-y-1.5">
                  <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-700" />
                    Тээврийн хэрэгслийн үзүүлэлт:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500">Улсын дугаар:</span>{' '}
                      <strong
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ vehiclePlate: e.currentTarget.textContent || '' })
                        }
                        className={`font-mono text-slate-900 ${editableClass}`}
                      >
                        {data.vehiclePlate || '12-34 УБҮ'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Марк:</span>{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ vehicleModel: e.currentTarget.textContent || '' })
                        }
                        className={`font-semibold text-slate-900 ${editableClass}`}
                      >
                        {data.vehicleModel || 'Toyota Prado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Арлын №:</span>{' '}
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ vehicleVin: e.currentTarget.textContent || '' })
                        }
                        className={`font-mono text-slate-900 ${editableClass}`}
                      >
                        {data.vehicleVin || 'JTEBU5JR...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PAYMENT GUARANTEE HIGHLIGHT BOX ================= */}
              {isPaymentGuarantee && (
                <div className="mb-6 p-4 bg-teal-50/60 border-2 border-teal-600/30 rounded-sm font-sans text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-teal-900">
                      Баталгаажуулсан төлбөрийн дүн:
                    </span>
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({
                          paymentAmountNumber:
                            e.currentTarget.textContent?.replace(' ₮', '') || '',
                        })
                      }
                      className={`text-base font-bold font-mono text-teal-800 ${editableClass}`}
                    >
                      {data.paymentAmountNumber || '85,000,000'} ₮
                    </span>
                  </div>
                  <div
                    contentEditable={isEditModeActive}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      onChange({ paymentAmountWords: e.currentTarget.textContent || '' })
                    }
                    className={`text-slate-700 italic ${editableClass}`}
                  >
                    ({data.paymentAmountWords || 'наян таван сая төгрөг'})
                  </div>
                  <div className="text-slate-700 pt-1 border-t border-teal-200/60">
                    <strong>Төлбөр төлөх эцсийн хугацаа:</strong>{' '}
                    <span
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ paymentDueDate: e.currentTarget.textContent || '' })
                      }
                      className={editableClass}
                    >
                      {data.paymentDueDate || '2026 оны 10 дугаар сарын 25'}
                    </span>
                  </div>
                </div>
              )}

              {/* ================= DYNAMIC WYSIWYG PARAGRAPHS & CLAUSES ================= */}
              <div className={`mt-4 text-slate-900 space-y-3.5 ${fontSizeClass}`}>
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => (
                    <div key={idx} className="relative group/p">
                      <p
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          handleParagraphBlur(idx, e.currentTarget.textContent || '')
                        }
                        style={{ textIndent: '1.25cm' }}
                        className={`text-justify leading-relaxed whitespace-pre-line ${editableClass}`}
                      >
                        {p}
                      </p>

                      {/* Quick remove button on hover in non-print mode */}
                      {isEditModeActive && paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClauseInPreview(idx)}
                          className="no-print absolute -right-7 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-600 opacity-0 group-hover/p:opacity-100 transition-opacity p-1 cursor-pointer"
                          title="Энэ заалтыг устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="italic text-slate-400 py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded font-sans text-xs">
                    Баримт бичгийн агуулгыг оруулна уу.
                  </div>
                )}

                {/* Quick Add Clause button in preview */}
                {isEditModeActive && (
                  <div className="no-print pt-1 flex justify-start">
                    <button
                      type="button"
                      onClick={handleAddClauseInPreview}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 border border-dashed border-blue-300 rounded cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Шинэ заалт / догол мөр нэмэх</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ================= HANDOVER ACT ITEMS TABLE (WITH WYSIWYG CELLS) ================= */}
              {isActDoc && data.actItems && data.actItems.length > 0 && (
                <div className="mt-6 font-sans">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span>Хүлээлцсэн эд хөрөнгийн жагсаалт:</span>
                    {isEditModeActive && (
                      <button
                        type="button"
                        onClick={handleAddActItemInPreview}
                        className="no-print text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                      >
                        + Мөр нэмэх
                      </button>
                    )}
                  </div>
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold">
                        <th className="border border-slate-400 px-2 py-1.5 w-10 text-center">№</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">
                          Эд хөрөнгө, ажлын нэр
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 w-24 text-center">
                          Тоо ширхэг
                        </th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">
                          Төлөв байдал
                        </th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">
                          Тэмдэглэл
                        </th>
                        {isEditModeActive && (
                          <th className="border border-slate-400 px-1 py-1 w-8 no-print" />
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.actItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 group/row">
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-medium">
                            {index + 1}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateActItem(item.id, {
                                name: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 font-medium ${editableClass}`}
                          >
                            {item.name || '-'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateActItem(item.id, {
                                quantity: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-2 py-1.5 text-center ${editableClass}`}
                          >
                            {item.quantity || '-'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateActItem(item.id, {
                                condition: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 ${editableClass}`}
                          >
                            {item.condition || '-'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateActItem(item.id, {
                                notes: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 text-slate-600 ${editableClass}`}
                          >
                            {item.notes || '-'}
                          </td>
                          {isEditModeActive && (
                            <td className="border border-slate-400 px-1 py-1 text-center no-print">
                              <button
                                type="button"
                                onClick={() => handleRemoveActItemInPreview(item.id)}
                                className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="Мөр устгах"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================= PRICE QUOTATION ITEMS TABLE (WITH WYSIWYG CELLS) ================= */}
              {isPriceQuote && data.quoteItems && data.quoteItems.length > 0 && (
                <div className="mt-6 font-sans">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-700" />
                      Үнийн саналын хүснэгт:
                    </span>
                    {isEditModeActive && (
                      <button
                        type="button"
                        onClick={handleAddQuoteItemInPreview}
                        className="no-print text-[11px] text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                      >
                        + Мөр нэмэх
                      </button>
                    )}
                  </div>
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold">
                        <th className="border border-slate-400 px-2 py-1.5 w-10 text-center">№</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">
                          Бараа, үйлчилгээний нэр
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 w-16 text-center">
                          Нэгж
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 w-18 text-center">
                          Тоо
                        </th>
                        <th className="border border-slate-400 px-3 py-1.5 w-28 text-right">
                          Нэгж үнэ (₮)
                        </th>
                        <th className="border border-slate-400 px-3 py-1.5 w-32 text-right">
                          Нийт үнэ (₮)
                        </th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">
                          Тэмдэглэл
                        </th>
                        {isEditModeActive && (
                          <th className="border border-slate-400 px-1 py-1 w-8 no-print" />
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.quoteItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 group/row">
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-medium">
                            {index + 1}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                name: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 font-medium ${editableClass}`}
                          >
                            {item.name || '-'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                unit: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-2 py-1.5 text-center ${editableClass}`}
                          >
                            {item.unit || 'ш'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                quantity: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-2 py-1.5 text-center font-mono ${editableClass}`}
                          >
                            {item.quantity || '1'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                unitPrice: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 text-right font-mono ${editableClass}`}
                          >
                            {item.unitPrice || '0'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                totalPrice: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 text-right font-mono font-bold ${editableClass}`}
                          >
                            {item.totalPrice || '0'}
                          </td>
                          <td
                            contentEditable={isEditModeActive}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleUpdateQuoteItem(item.id, {
                                notes: e.currentTarget.textContent || '',
                              })
                            }
                            className={`border border-slate-400 px-3 py-1.5 text-slate-600 ${editableClass}`}
                          >
                            {item.notes || '-'}
                          </td>
                          {isEditModeActive && (
                            <td className="border border-slate-400 px-1 py-1 text-center no-print">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuoteItemInPreview(item.id)}
                                className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="Мөр устгах"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-400">
                        <td colSpan={5} className="border border-slate-400 px-3 py-2 text-right">
                          НИЙТ ДҮН:
                        </td>
                        <td className="border border-slate-400 px-3 py-2 text-right font-mono text-blue-900 text-sm">
                          {quoteTotalSum.toLocaleString('en-US')} ₮
                        </td>
                        <td
                          colSpan={isEditModeActive ? 2 : 1}
                          className="border border-slate-400 px-3 py-2 text-slate-500 text-[11px] font-normal"
                        >
                          (НӨАТ багтсан)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* ================= MEETING ACTION ITEMS TABLE (WITH WYSIWYG CELLS) ================= */}
              {isMeetingMinutes &&
                data.meetingActionItems &&
                data.meetingActionItems.length > 0 && (
                  <div className="mt-6 font-sans">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                      <span className="flex items-center gap-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-blue-700" />
                        Биелүүлэх үүрэг даалгаврын хуваарь:
                      </span>
                      {isEditModeActive && (
                        <button
                          type="button"
                          onClick={handleAddMeetingActionItemInPreview}
                          className="no-print text-[11px] text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                        >
                          + Даалгавар нэмэх
                        </button>
                      )}
                    </div>
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-semibold">
                          <th className="border border-slate-400 px-2 py-1.5 w-10 text-center">№</th>
                          <th className="border border-slate-400 px-3 py-1.5 text-left">
                            Үүрэг даалгавар
                          </th>
                          <th className="border border-slate-400 px-3 py-1.5 w-36 text-left">
                            Хариуцагч
                          </th>
                          <th className="border border-slate-400 px-3 py-1.5 w-28 text-center">
                            Хугацаа
                          </th>
                          {isEditModeActive && (
                            <th className="border border-slate-400 px-1 py-1 w-8 no-print" />
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {data.meetingActionItems.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 group/row">
                            <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-medium">
                              {index + 1}
                            </td>
                            <td
                              contentEditable={isEditModeActive}
                              suppressContentEditableWarning={true}
                              onBlur={(e) =>
                                handleUpdateMeetingActionItem(item.id, {
                                  task: e.currentTarget.textContent || '',
                                })
                              }
                              className={`border border-slate-400 px-3 py-1.5 font-medium ${editableClass}`}
                            >
                              {item.task || '-'}
                            </td>
                            <td
                              contentEditable={isEditModeActive}
                              suppressContentEditableWarning={true}
                              onBlur={(e) =>
                                handleUpdateMeetingActionItem(item.id, {
                                  assignee: e.currentTarget.textContent || '',
                                })
                              }
                              className={`border border-slate-400 px-3 py-1.5 ${editableClass}`}
                            >
                              {item.assignee || '-'}
                            </td>
                            <td
                              contentEditable={isEditModeActive}
                              suppressContentEditableWarning={true}
                              onBlur={(e) =>
                                handleUpdateMeetingActionItem(item.id, {
                                  deadline: e.currentTarget.textContent || '',
                                })
                              }
                              className={`border border-slate-400 px-3 py-1.5 text-center font-mono ${editableClass}`}
                            >
                              {item.deadline || '-'}
                            </td>
                            {isEditModeActive && (
                              <td className="border border-slate-400 px-1 py-1 text-center no-print">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveMeetingActionItemInPreview(item.id)
                                  }
                                  className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                  title="Даалгавар устгах"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* ================= CUSTOM DYNAMIC FIELDS ================= */}
              {data.customFields && data.customFields.length > 0 && (
                <div className="mt-6 pt-3 border-t border-slate-200 text-xs font-sans space-y-1.5">
                  {data.customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-start justify-between gap-2 group/custom"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const updated = (data.customFields || []).map((f) =>
                              f.id === field.id
                                ? { ...f, label: e.currentTarget.textContent || '' }
                                : f
                            );
                            onChange({ customFields: updated });
                          }}
                          className={`font-bold text-slate-800 ${editableClass}`}
                        >
                          {field.label}:
                        </span>
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            const updated = (data.customFields || []).map((f) =>
                              f.id === field.id
                                ? { ...f, value: e.currentTarget.textContent || '' }
                                : f
                            );
                            onChange({ customFields: updated });
                          }}
                          className={editableClass}
                        >
                          {field.value}
                        </span>
                      </div>

                      {isEditModeActive && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomFieldInPreview(field.id)}
                          className="no-print opacity-0 group-hover/custom:opacity-100 text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Талбар устгах"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ================= ATTACHMENTS LIST ================= */}
              {showAttachments && (
                <div className="mt-6 pt-3 border-t border-slate-200 text-xs font-sans space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>Хавсралт баримт бичгийн жагсаалт:</span>
                    </div>
                    {isEditModeActive && (
                      <button
                        type="button"
                        onClick={handleAddAttachmentInPreview}
                        className="no-print text-[11px] text-blue-700 hover:text-blue-900 underline font-medium cursor-pointer"
                      >
                        + Хавсралт нэмэх
                      </button>
                    )}
                  </div>
                  {data.attachments?.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group/att pl-4"
                    >
                      <div
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          const updated = [...(data.attachments || [])];
                          updated[i] = e.currentTarget.textContent || '';
                          onChange({ attachments: updated });
                        }}
                        className={`text-slate-700 flex-1 ${editableClass}`}
                      >
                        {att}
                      </div>

                      {isEditModeActive && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachmentInPreview(i)}
                          className="no-print opacity-0 group-hover/att:opacity-100 text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Хавсралт хасах"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Duration Note */}
              {data.duration && !isPaymentGuarantee && (
                <div className="mt-6 pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start gap-2 font-sans">
                  <span className="font-bold text-slate-900">Хугацаа:</span>
                  <span
                    contentEditable={isEditModeActive}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => onChange({ duration: e.currentTarget.textContent || '' })}
                    className={editableClass}
                  >
                    {data.duration}
                  </span>
                </div>
              )}
            </div>

            {/* ================= BOTTOM SIGNATURE / SIGN-OFF BLOCK ================= */}
            <div className="mt-12 pt-6">
              {hasDualSignatures ? (
                /* Dual Signatures layout */
                <div className="grid grid-cols-2 gap-8 items-end">
                  {/* Left Side: 1-р тал */}
                  <div className="flex flex-col items-start text-left">
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ signatoryTitle: e.currentTarget.textContent || '' })
                      }
                      className={`text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
                    >
                      {getPrimarySignatoryTitle()}
                    </div>

                    <div className="relative w-48 h-18 flex items-end justify-center mb-1">
                      {data.signatureDataUrl ? (
                        <img
                          src={data.signatureDataUrl}
                          alt="Гарын үсэг 1"
                          className="max-h-16 max-w-full object-contain relative z-10 select-none pointer-events-none"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-300 italic self-center font-sans">
                          (Гарын үсэг зураагүй)
                        </span>
                      )}

                      {data.officialStamp && (
                        <div className="absolute left-2 -top-3 w-18 h-18 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center text-[8px] font-bold uppercase tracking-wider transform -rotate-12 pointer-events-none select-none shadow-xs bg-red-50/15">
                          <span className="text-[7px] text-red-500 font-sans">БАТЛАВ</span>
                          <span className="text-[9px] my-0.5 text-red-600">★ ★ ★</span>
                          <span className="text-[6.5px] text-center font-sans leading-none px-1">
                            {data.companyName
                              ? data.companyName.replace(/[«»]/g, '').slice(0, 14)
                              : 'АЛБАН ТАМГА'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-48 border-t border-slate-400 pt-1.5 flex items-center justify-between text-xs sm:text-sm text-slate-900 font-semibold font-sans">
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({
                            signatoryName: e.currentTarget.textContent || '',
                            sender: e.currentTarget.textContent || '',
                          })
                        }
                        className={editableClass}
                      >
                        {data.signatoryName || data.sender || '[Нэр]'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 font-sans">
                      Огноо: {data.date}
                    </div>
                  </div>

                  {/* Right Side: 2-р тал */}
                  <div className="flex flex-col items-end text-right">
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ secondSignatoryTitle: e.currentTarget.textContent || '' })
                      }
                      className={`text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
                    >
                      {getSecondarySignatoryTitle()}
                    </div>

                    <div className="relative w-48 h-18 flex items-end justify-center mb-1">
                      {data.secondSignatureDataUrl ? (
                        <img
                          src={data.secondSignatureDataUrl}
                          alt="Гарын үсэг 2"
                          className="max-h-16 max-w-full object-contain relative z-10 select-none pointer-events-none"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-300 italic self-center font-sans">
                          (Гарын үсэг зураагүй)
                        </span>
                      )}
                    </div>

                    <div className="w-48 border-t border-slate-400 pt-1.5 flex items-center justify-between text-xs sm:text-sm text-slate-900 font-semibold font-sans">
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({ secondSignatoryName: e.currentTarget.textContent || '' })
                        }
                        className={editableClass}
                      >
                        {data.secondSignatoryName || '[Нэр]'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 font-sans">
                      Огноо: {data.date}
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Signatory layout */
                <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                  <div className="text-xs text-slate-600 space-y-1 w-full sm:w-1/2 font-sans">
                    {data.senderPhone && (
                      <div>
                        <span className="font-medium text-slate-800">Холбоо барих утас:</span>{' '}
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ senderPhone: e.currentTarget.textContent || '' })
                          }
                          className={editableClass}
                        >
                          {data.senderPhone}
                        </span>
                      </div>
                    )}
                    {data.senderRegister && (
                      <div>
                        <span className="font-medium text-slate-800">Регистрийн №:</span>{' '}
                        <span
                          contentEditable={isEditModeActive}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange({ senderRegister: e.currentTarget.textContent || '' })
                          }
                          className={editableClass}
                        >
                          {data.senderRegister}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-1/2 flex flex-col items-end text-right">
                    <div
                      contentEditable={isEditModeActive}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange({ signatoryTitle: e.currentTarget.textContent || '' })
                      }
                      className={`text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
                    >
                      {getPrimarySignatoryTitle()}
                    </div>

                    <div className="relative w-56 h-20 flex items-end justify-center mb-1">
                      {data.signatureDataUrl ? (
                        <img
                          src={data.signatureDataUrl}
                          alt="Гарын үсэг"
                          className="max-h-16 max-w-full object-contain relative z-10 select-none pointer-events-none"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-300 italic self-center font-sans">
                          (Гарын үсэг зураагүй)
                        </span>
                      )}

                      {data.officialStamp && (
                        <div className="absolute right-0 -top-3 w-20 h-20 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center text-[8.5px] font-bold uppercase tracking-wider transform -rotate-12 pointer-events-none select-none shadow-xs bg-red-50/15">
                          <span className="text-[7.5px] text-red-500 font-sans">БАТЛАВ</span>
                          <span className="text-[10px] my-0.5 text-red-600">★ ★ ★</span>
                          <span className="text-[7px] text-center font-sans leading-none px-1">
                            {data.companyName
                              ? data.companyName.replace(/[«»]/g, '').slice(0, 16)
                              : 'АЛБАН ТАМГА'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-56 border-t border-slate-400 pt-1.5 flex items-center justify-between text-xs sm:text-sm text-slate-900 font-semibold font-sans">
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                      <span
                        contentEditable={isEditModeActive}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange({
                            signatoryName: e.currentTarget.textContent || '',
                            sender: e.currentTarget.textContent || '',
                          })
                        }
                        className={editableClass}
                      >
                        {data.signatoryName || data.sender || '[Нэр]'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">/</span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 font-sans">
                      Огноо: {data.date}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

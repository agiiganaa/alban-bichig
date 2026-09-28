import React from 'react';
import {
  DocumentData,
  ActItem,
  QuoteItem,
  MeetingActionItem,
} from '../types/document';
import { normalizeDocumentSections } from '../utils/documentUtils';
import { Trash2, Plus, Paperclip } from 'lucide-react';

interface OfficialA4DocumentProps {
  data: DocumentData;
  isPrintMode?: boolean;
  isEditModeActive?: boolean;
  onChange?: (updated: Partial<DocumentData>) => void;
}

export const OfficialA4Document: React.FC<OfficialA4DocumentProps> = ({
  data,
  isPrintMode = false,
  isEditModeActive = false,
  onChange,
}) => {
  const isActDoc = data.docType.includes('АКТ');
  const isPoaDoc = data.docType.includes('ИТГЭМЖЛЭЛ');
  const isMeetingMinutes = data.docType === 'ХУРЛЫН ТЭМДЭГЛЭЛ';
  const isInternalMemo = data.docType === 'ДОТООД САНАМЖ БИЧИГ';
  const isPaymentGuarantee = data.docType.includes('БАТАЛГАА');
  const isPriceQuote =
    data.docType === 'ҮНИЙН САНАЛ' ||
    Boolean(data.quoteItems && data.quoteItems.length > 0);

  // Document Title without artificial spacing
  const docTitle = data.title || data.docType;

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

  // Normalize paragraphs and sections with stable IDs
  const docSections = normalizeDocumentSections(
    data.paragraphsList,
    data.formalizedText,
    data.roughText,
    data.documentSections
  );

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

  // Editable styling only on screen preview
  const canEdit = !isPrintMode && isEditModeActive && Boolean(onChange);
  const editableClass = canEdit
    ? 'cursor-text hover:outline-1 hover:outline-dashed hover:outline-blue-400 focus:outline-2 focus:outline-blue-600 focus:bg-blue-50/20 rounded-xs transition-all'
    : '';

  // Paragraph handlers
  const handleParagraphBlur = (id: string, newContent: string) => {
    if (!onChange) return;
    const updated = docSections.map((s) =>
      s.id === id ? { ...s, content: newContent } : s
    );
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
  };

  const handleAddClauseInPreview = () => {
    if (!onChange) return;
    const newId = `section-${Date.now()}`;
    const updated = [
      ...docSections,
      {
        id: newId,
        title: `Заалт §${docSections.length + 1}`,
        content: 'Шинэ заалтын агуулгыг энд бичнэ үү.',
      },
    ];
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
  };

  const handleRemoveClauseInPreview = (id: string) => {
    if (!onChange || docSections.length <= 1) return;
    const updated = docSections.filter((s) => s.id !== id);
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
  };

  // Table items handlers
  const handleUpdateActItem = (id: string, updatedFields: Partial<ActItem>) => {
    if (!onChange) return;
    const current = data.actItems || [];
    onChange({
      actItems: current.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    });
  };

  const handleAddActItemInPreview = () => {
    if (!onChange) return;
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
    if (!onChange) return;
    const current = data.actItems || [];
    onChange({ actItems: current.filter((item) => item.id !== id) });
  };

  const handleUpdateQuoteItem = (
    id: string,
    updatedFields: Partial<QuoteItem>
  ) => {
    if (!onChange) return;
    const current = data.quoteItems || [];
    onChange({
      quoteItems: current.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updatedFields };
        const qty = parseFloat(merged.quantity.replace(/,/g, ''));
        const price = parseFloat(merged.unitPrice.replace(/,/g, ''));
        if (
          !isNaN(qty) &&
          !isNaN(price) &&
          updatedFields.totalPrice === undefined
        ) {
          merged.totalPrice = (qty * price).toLocaleString('en-US');
        }
        return merged;
      }),
    });
  };

  const handleAddQuoteItemInPreview = () => {
    if (!onChange) return;
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
    if (!onChange) return;
    const current = data.quoteItems || [];
    onChange({ quoteItems: current.filter((item) => item.id !== id) });
  };

  const quoteTotalSum = (data.quoteItems || []).reduce((sum, item) => {
    const val = parseFloat((item.totalPrice || '').replace(/,/g, '')) || 0;
    return sum + val;
  }, 0);

  const handleUpdateMeetingActionItem = (
    id: string,
    updatedFields: Partial<MeetingActionItem>
  ) => {
    if (!onChange) return;
    const current = data.meetingActionItems || [];
    onChange({
      meetingActionItems: current.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    });
  };

  const handleAddMeetingActionItemInPreview = () => {
    if (!onChange) return;
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
    if (!onChange) return;
    const current = data.meetingActionItems || [];
    onChange({
      meetingActionItems: current.filter((item) => item.id !== id),
    });
  };

  return (
    <div
      className={`official-document-sheet ${fontClass} ${
        isPrintMode
          ? 'print-document-sheet w-[210mm] min-h-[297mm] bg-white text-black p-[20mm_15mm_20mm_25mm] box-border'
          : 'w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 md:p-[20mm_15mm_20mm_25mm] box-border relative flex flex-col justify-between'
      }`}
    >
      {/* Upper Content Section */}
      <div className="flex-1">
        {/* ================= 1. CORPORATE LETTERHEAD HEADER ================= */}
        {showCompanyHeader ? (
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 pb-2">
              {/* Left Side: Logo & Organization Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {data.companyLogo ? (
                  <img
                    src={data.companyLogo}
                    alt="Logo"
                    className="w-14 h-14 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 font-sans print:bg-black print:text-white">
                    {data.companyName
                      ? data.companyName.replace(/[^а-яөүёa-z0-9]/gi, '').charAt(0) || 'M'
                      : 'M'}
                  </div>
                )}

                <div className="space-y-0.5 min-w-0">
                  <h2
                    contentEditable={canEdit}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      onChange?.({ companyName: e.currentTarget.textContent || '' })
                    }
                    className={`text-base font-bold text-slate-900 uppercase leading-snug font-sans ${editableClass}`}
                  >
                    {data.companyName || '«АРВИН ТЕХНОЛОГИ» ХХК'}
                  </h2>

                  {data.companyNameEn && (
                    <div
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange?.({ companyNameEn: e.currentTarget.textContent || '' })
                      }
                      className={`text-[11px] text-slate-600 font-semibold uppercase tracking-wider font-sans ${editableClass}`}
                    >
                      {data.companyNameEn}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-sans leading-tight pt-0.5 space-y-0.5">
                    {data.companyAddress && (
                      <div
                        contentEditable={canEdit}
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          onChange?.({ companyAddress: e.currentTarget.textContent || '' })
                        }
                        className={editableClass}
                      >
                        {data.companyAddress}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-3 text-slate-600">
                      {data.companyPhone && (
                        <span
                          contentEditable={canEdit}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange?.({
                              companyPhone:
                                e.currentTarget.textContent?.replace('Утас: ', '') || '',
                            })
                          }
                          className={editableClass}
                        >
                          Утас: {data.companyPhone}
                        </span>
                      )}
                      {data.companyEmail && (
                        <span
                          contentEditable={canEdit}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            onChange?.({
                              companyEmail:
                                e.currentTarget.textContent?.replace('И-мэйл: ', '') || '',
                            })
                          }
                          className={editableClass}
                        >
                          И-мэйл: {data.companyEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: РД & Document Number */}
              <div className="text-right shrink-0 text-xs font-sans space-y-1">
                {data.companyRegister && (
                  <div className="text-slate-700">
                    РД:{' '}
                    <span
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange?.({ companyRegister: e.currentTarget.textContent || '' })
                      }
                      className={`font-bold font-mono text-slate-900 ${editableClass}`}
                    >
                      {data.companyRegister}
                    </span>
                  </div>
                )}
                {showDocNumber && data.documentNumber && (
                  <div className="text-slate-900 font-bold font-mono">
                    №{' '}
                    <span
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        onChange?.({ documentNumber: e.currentTarget.textContent || '' })
                      }
                      className={editableClass}
                    >
                      {data.documentNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Official Divider Line */}
            <div className="border-t-2 border-slate-900 mt-1 mb-2 print:border-black" />

            {/* Date & City Row */}
            {showDateLocation && (
              <div className="flex items-center justify-between text-xs text-slate-800 font-sans mb-4">
                <div
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onChange?.({ date: e.currentTarget.textContent || '' })}
                  className={editableClass}
                >
                  {data.date || '2026 оны 09 дүгээр сарын 29'}
                </div>

                <div
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => onChange?.({ city: e.currentTarget.textContent || '' })}
                  className={editableClass}
                >
                  {data.city || 'Улаанбаатар хот'}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= PERSONAL MODE DATE & LOCATION ================= */
          showDateLocation && (
            <div className="flex items-center justify-between text-xs text-slate-800 font-sans mb-5 pb-2 border-b border-slate-300">
              <div
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) => onChange?.({ date: e.currentTarget.textContent || '' })}
                className={editableClass}
              >
                {data.date || '2026 оны 09 дүгээр сарын 29'}
              </div>

              <div
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) => onChange?.({ city: e.currentTarget.textContent || '' })}
                className={editableClass}
              >
                {data.city || 'Улаанбаатар хот'}
              </div>
            </div>
          )
        )}

        {/* ================= 2. RECIPIENT BLOCK (If present) ================= */}
        {showRecipient && !isMeetingMinutes && (
          <div className="flex justify-end mb-5">
            <div className="w-full sm:w-3/5 text-right sm:text-left sm:pl-8">
              <div className="text-xs uppercase text-slate-500 font-sans tracking-wider mb-0.5">
                Хэнд:
              </div>
              <div
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  onChange?.({ recipient: e.currentTarget.textContent || '' })
                }
                className={`text-sm font-bold text-slate-900 leading-snug whitespace-pre-line ${editableClass}`}
              >
                {data.recipient}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. DOCUMENT TITLE ================= */}
        <div className="text-center my-4">
          <h1
            contentEditable={canEdit}
            suppressContentEditableWarning={true}
            onBlur={(e) =>
              onChange?.({
                title: e.currentTarget.textContent?.trim() || docTitle,
              })
            }
            className={`text-[19px] sm:text-[20px] font-bold text-slate-900 uppercase tracking-normal ${editableClass}`}
          >
            {docTitle}
          </h1>
        </div>

        {/* ================= 4. MEETING MINUTES METADATA ================= */}
        {isMeetingMinutes && (
          <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 mb-5 text-xs text-slate-800 space-y-2 font-sans print:bg-transparent print:border-slate-300">
            <div className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <div>
                Хурлын сэдэв:{' '}
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ meetingTitle: e.currentTarget.textContent || '' })
                  }
                  className={editableClass}
                >
                  {data.meetingTitle || 'Ээлжит хурлын тэмдэглэл'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-700">Хурал даргалагч:</span>{' '}
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ meetingChairperson: e.currentTarget.textContent || '' })
                  }
                  className={editableClass}
                >
                  {data.meetingChairperson || data.signatoryName || 'Б.Батбаяр'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Тэмдэглэл хөтөлсөн:</span>{' '}
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ meetingSecretary: e.currentTarget.textContent || '' })
                  }
                  className={editableClass}
                >
                  {data.meetingSecretary || data.secondSignatoryName || 'Э.Тэмүүлэн'}
                </span>
              </div>
            </div>
            {data.meetingAttendees && (
              <div>
                <span className="font-semibold text-slate-700">Оролцсон гишүүд:</span>{' '}
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ meetingAttendees: e.currentTarget.textContent || '' })
                  }
                  className={editableClass}
                >
                  {data.meetingAttendees}
                </span>
              </div>
            )}
            {data.meetingAgenda && (
              <div className="pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Хэлэлцсэн асуудал:</span>{' '}
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ meetingAgenda: e.currentTarget.textContent || '' })
                  }
                  className={editableClass}
                >
                  {data.meetingAgenda}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ================= 5. BODY PARAGRAPHS & CLAUSES ================= */}
        <div className={`space-y-3.5 ${fontSizeClass} text-slate-900 text-justify`}>
          {docSections.map((sec) => (
            <div key={sec.id} className="relative group/p">
              <p
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  handleParagraphBlur(sec.id, e.currentTarget.textContent || '')
                }
                className={`indent-mns whitespace-pre-line leading-relaxed ${editableClass}`}
              >
                {sec.content}
              </p>

              {canEdit && docSections.length > 1 && (
                <div className="no-print absolute -right-7 top-0 hidden group-hover/p:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveClauseInPreview(sec.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 bg-white rounded shadow-xs border border-slate-200 cursor-pointer"
                    title="Энэ догол мөрийг хасах"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {canEdit && (
            <div className="no-print pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleAddClauseInPreview}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer bg-blue-50/50 hover:bg-blue-100/60 px-2.5 py-1 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Шинэ догол мөр нэмэх</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 6. DYNAMIC TABLES (If applicable) ================= */}
        {/* Handover Act Table */}
        {isActDoc && data.actItems && data.actItems.length > 0 && (
          <div className="my-5 table-container">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-sans">
                Хүлээлцэх эд хөрөнгийн жагсаалт:
              </h4>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddActItemInPreview}
                  className="no-print text-[11px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  + Мөр нэмэх
                </button>
              )}
            </div>
            <table className="w-full border-collapse border border-slate-400 text-xs font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-800 print:bg-slate-100">
                  <th className="border border-slate-400 px-2 py-1 text-center w-8">№</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Эд хөрөнгийн нэр</th>
                  <th className="border border-slate-400 px-2 py-1 text-center w-20">Тоо ширхэг</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Төлөв байдал</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Тэмдэглэл</th>
                  {canEdit && <th className="border border-slate-400 px-1 py-1 w-6 no-print" />}
                </tr>
              </thead>
              <tbody>
                {data.actItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-medium">
                      {idx + 1}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateActItem(item.id, {
                          name: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 font-medium ${editableClass}`}
                    >
                      {item.name}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateActItem(item.id, {
                          quantity: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-center font-mono ${editableClass}`}
                    >
                      {item.quantity}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateActItem(item.id, {
                          condition: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 ${editableClass}`}
                    >
                      {item.condition}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateActItem(item.id, {
                          notes: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 ${editableClass}`}
                    >
                      {item.notes || '-'}
                    </td>
                    {canEdit && (
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

        {/* Price Quotation Table */}
        {isPriceQuote && data.quoteItems && data.quoteItems.length > 0 && (
          <div className="my-5 table-container">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-sans">
                Үнийн саналын задаргаа:
              </h4>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddQuoteItemInPreview}
                  className="no-print text-[11px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  + Бараа нэмэх
                </button>
              )}
            </div>
            <table className="w-full border-collapse border border-slate-400 text-xs font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-800 print:bg-slate-100">
                  <th className="border border-slate-400 px-2 py-1 text-center w-8">№</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Бараа, ажил, үйлчилгээний нэр</th>
                  <th className="border border-slate-400 px-2 py-1 text-center w-12">Х/н</th>
                  <th className="border border-slate-400 px-2 py-1 text-center w-14">Тоо</th>
                  <th className="border border-slate-400 px-2 py-1 text-right w-24">Нэгж үнэ (₮)</th>
                  <th className="border border-slate-400 px-2 py-1 text-right w-24">Нийт дүн (₮)</th>
                  {canEdit && <th className="border border-slate-400 px-1 py-1 w-6 no-print" />}
                </tr>
              </thead>
              <tbody>
                {data.quoteItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-medium">
                      {idx + 1}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateQuoteItem(item.id, {
                          name: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 font-medium ${editableClass}`}
                    >
                      {item.name}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateQuoteItem(item.id, {
                          unit: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-center font-mono ${editableClass}`}
                    >
                      {item.unit}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateQuoteItem(item.id, {
                          quantity: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-center font-mono ${editableClass}`}
                    >
                      {item.quantity}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateQuoteItem(item.id, {
                          unitPrice: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-right font-mono ${editableClass}`}
                    >
                      {item.unitPrice}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateQuoteItem(item.id, {
                          totalPrice: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-right font-mono font-bold ${editableClass}`}
                    >
                      {item.totalPrice}
                    </td>
                    {canEdit && (
                      <td className="border border-slate-400 px-1 py-1 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuoteItemInPreview(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Мөр хасах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold font-mono text-slate-900 border-t border-slate-400 print:bg-slate-50">
                  <td colSpan={5} className="border border-slate-400 px-3 py-1.5 text-right font-sans">
                    НИЙТ ДҮН:
                  </td>
                  <td className="border border-slate-400 px-3 py-1.5 text-right font-bold text-blue-900 print:text-black">
                    {quoteTotalSum.toLocaleString('en-US')} ₮
                  </td>
                  {canEdit && <td className="border border-slate-400 no-print" />}
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Meeting Minutes Action Items Table */}
        {isMeetingMinutes && data.meetingActionItems && data.meetingActionItems.length > 0 && (
          <div className="my-5 table-container">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-sans">
                Хурлаас өгсөн үүрэг даалгавар, биелүүлэх хугацаа:
              </h4>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleAddMeetingActionItemInPreview}
                  className="no-print text-[11px] text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                >
                  + Даалгавар нэмэх
                </button>
              )}
            </div>
            <table className="w-full border-collapse border border-slate-400 text-xs font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-800 print:bg-slate-100">
                  <th className="border border-slate-400 px-2 py-1 text-center w-8">№</th>
                  <th className="border border-slate-400 px-2 py-1 text-left">Үүрэг даалгаврын агуулга</th>
                  <th className="border border-slate-400 px-2 py-1 text-left w-36">Хариуцагч</th>
                  <th className="border border-slate-400 px-2 py-1 text-center w-28">Хугацаа</th>
                  {canEdit && <th className="border border-slate-400 px-1 py-1 w-6 no-print" />}
                </tr>
              </thead>
              <tbody>
                {data.meetingActionItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-medium">
                      {idx + 1}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateMeetingActionItem(item.id, {
                          task: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 font-medium ${editableClass}`}
                    >
                      {item.task}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateMeetingActionItem(item.id, {
                          assignee: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 ${editableClass}`}
                    >
                      {item.assignee}
                    </td>
                    <td
                      contentEditable={canEdit}
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        handleUpdateMeetingActionItem(item.id, {
                          deadline: e.currentTarget.textContent || '',
                        })
                      }
                      className={`border border-slate-400 px-2 py-1 text-center font-mono ${editableClass}`}
                    >
                      {item.deadline}
                    </td>
                    {canEdit && (
                      <td className="border border-slate-400 px-1 py-1 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleRemoveMeetingActionItemInPreview(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
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

        {/* ================= 7. CUSTOM KEY-VALUE FIELDS ================= */}
        {data.customFields && data.customFields.length > 0 && (
          <div className="mt-5 pt-2 border-t border-slate-200 text-xs font-sans space-y-1">
            {data.customFields.map((field) => (
              <div key={field.id} className="flex items-start gap-2">
                <span className="font-bold text-slate-800">{field.label}:</span>
                <span className="text-slate-700">{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ================= 8. ATTACHMENTS LIST ================= */}
        {showAttachments && (
          <div className="mt-5 pt-2 border-t border-slate-200 text-xs font-sans space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Хавсралт баримт бичгийн жагсаалт:</span>
            </div>
            {data.attachments?.map((att, i) => (
              <div key={i} className="pl-4 text-slate-700">
                {att}
              </div>
            ))}
          </div>
        )}

        {/* Duration Note */}
        {data.duration && !isPaymentGuarantee && (
          <div className="mt-5 pt-2 border-t border-slate-200 text-xs text-slate-700 flex items-start gap-2 font-sans">
            <span className="font-bold text-slate-900">Хугацаа:</span>
            <span>{data.duration}</span>
          </div>
        )}
      </div>

      {/* ================= 9. SIGNATORY / SIGN-OFF BLOCK ================= */}
      <div className="mt-10 pt-4 signatory-block">
        {hasDualSignatures ? (
          /* Dual Signatures Layout */
          <div className="grid grid-cols-2 gap-8 items-end">
            {/* Left: 1-р тал */}
            <div className="flex flex-col items-start text-left">
              <div
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  onChange?.({ signatoryTitle: e.currentTarget.textContent || '' })
                }
                className={`text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
              >
                {getPrimarySignatoryTitle()}
              </div>

              <div className="relative w-48 h-16 flex items-end justify-center mb-1">
                {data.signatureDataUrl ? (
                  <img
                    src={data.signatureDataUrl}
                    alt="Гарын үсэг 1"
                    className="max-h-16 max-w-full object-contain relative z-10 select-none"
                  />
                ) : (
                  <span className="text-[11px] text-slate-300 italic self-center font-sans">
                    (Гарын үсэг)
                  </span>
                )}

                {data.officialStamp && (
                  <div className="absolute left-2 -top-2 w-16 h-16 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center text-[7.5px] font-bold uppercase tracking-wider transform -rotate-12 pointer-events-none select-none bg-red-50/15 print:border-red-600 print:text-red-600">
                    <span className="text-[6.5px] text-red-500 font-sans">БАТЛАВ</span>
                    <span className="text-[8px] text-red-600">★ ★ ★</span>
                    <span className="text-[6px] text-center font-sans leading-none px-1">
                      {data.companyName
                        ? data.companyName.replace(/[«»]/g, '').slice(0, 14)
                        : 'АЛБАН ТАМГА'}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-48 border-t border-slate-400 pt-1 flex items-center justify-between text-xs text-slate-900 font-semibold font-sans">
                <span className="text-[10px] text-slate-500 font-normal">/</span>
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({
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

            {/* Right: 2-р тал */}
            <div className="flex flex-col items-end text-right">
              <div
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  onChange?.({ secondSignatoryTitle: e.currentTarget.textContent || '' })
                }
                className={`text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
              >
                {getSecondarySignatoryTitle()}
              </div>

              <div className="relative w-48 h-16 flex items-end justify-center mb-1">
                {data.secondSignatureDataUrl ? (
                  <img
                    src={data.secondSignatureDataUrl}
                    alt="Гарын үсэг 2"
                    className="max-h-16 max-w-full object-contain relative z-10 select-none"
                  />
                ) : (
                  <span className="text-[11px] text-slate-300 italic self-center font-sans">
                    (Гарын үсэг)
                  </span>
                )}
              </div>

              <div className="w-48 border-t border-slate-400 pt-1 flex items-center justify-between text-xs text-slate-900 font-semibold font-sans">
                <span className="text-[10px] text-slate-500 font-normal">/</span>
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({ secondSignatoryName: e.currentTarget.textContent || '' })
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
          /* Single Signatory Layout */
          <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
            <div className="text-xs text-slate-600 space-y-1 w-full sm:w-1/2 font-sans">
              {data.senderPhone && (
                <div>
                  <span className="font-medium text-slate-800">Холбоо барих утас:</span>{' '}
                  <span
                    contentEditable={canEdit}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      onChange?.({ senderPhone: e.currentTarget.textContent || '' })
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
                    contentEditable={canEdit}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                      onChange?.({ senderRegister: e.currentTarget.textContent || '' })
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
                contentEditable={canEdit}
                suppressContentEditableWarning={true}
                onBlur={(e) =>
                  onChange?.({ signatoryTitle: e.currentTarget.textContent || '' })
                }
                className={`text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-sans ${editableClass}`}
              >
                {getPrimarySignatoryTitle()}
              </div>

              <div className="relative w-56 h-18 flex items-end justify-center mb-1">
                {data.signatureDataUrl ? (
                  <img
                    src={data.signatureDataUrl}
                    alt="Гарын үсэг"
                    className="max-h-16 max-w-full object-contain relative z-10 select-none"
                  />
                ) : (
                  <span className="text-[11px] text-slate-300 italic self-center font-sans">
                    (Гарын үсэг)
                  </span>
                )}

                {data.officialStamp && (
                  <div className="absolute right-2 -top-2 w-18 h-18 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center text-[8px] font-bold uppercase tracking-wider transform -rotate-12 pointer-events-none select-none bg-red-50/15 print:border-red-600 print:text-red-600">
                    <span className="text-[7px] text-red-500 font-sans">БАТЛАВ</span>
                    <span className="text-[9px] my-0.5 text-red-600">★ ★ ★</span>
                    <span className="text-[6.5px] text-center font-sans leading-none px-1">
                      {data.companyName
                        ? data.companyName.replace(/[«»]/g, '').slice(0, 16)
                        : 'АЛБАН ТАМГА'}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-56 border-t border-slate-400 pt-1 flex items-center justify-between text-xs text-slate-900 font-semibold font-sans">
                <span className="text-[10px] text-slate-500 font-normal">/</span>
                <span
                  contentEditable={canEdit}
                  suppressContentEditableWarning={true}
                  onBlur={(e) =>
                    onChange?.({
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
  );
};

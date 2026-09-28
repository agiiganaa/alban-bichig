import React, { useState } from 'react';
import {
  DocumentData,
  DocumentMode,
  DocumentType,
  TemplateCategory,
  AiTone,
  ActItem,
  QuoteItem,
  MeetingActionItem,
  PRESET_TEMPLATES,
  PresetTemplate,
} from '../types/document';
import { SignaturePad } from './SignaturePad';
import {
  Sparkles,
  BookOpen,
  Calendar,
  User,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Building2,
  Layers,
  Wand2,
  Trash2,
  Plus,
  Car,
  ShieldCheck,
  Users,
  FileCheck2,
  ListTodo,
  PenTool,
  Paperclip,
  CheckSquare,
  SlidersHorizontal,
  X,
  DollarSign,
  FileText,
} from 'lucide-react';

interface DocumentFormProps {
  data: DocumentData;
  onChange: (updated: Partial<DocumentData>) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
  onReset: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  data,
  onChange,
  onApplyPreset,
  onReset,
}) => {
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<AiTone>('standard');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [previousRoughText, setPreviousRoughText] = useState<string | null>(null);
  const [activeSigTab, setActiveSigTab] = useState<'primary' | 'secondary'>('primary');
  const [showAdvancedToggles, setShowAdvancedToggles] = useState<boolean>(false);

  // Extract paragraphs array
  const rawText = data.formalizedText || data.roughText || '';
  const paragraphs =
    data.paragraphsList && data.paragraphsList.length > 0
      ? data.paragraphsList
      : rawText
          .split('\n')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

  const handleFormalizeWithAi = async () => {
    const textToFormalize =
      paragraphs.length > 0 ? paragraphs.join('\n\n') : data.roughText;

    if (!textToFormalize.trim()) {
      setAiError('Шалтгаан, агуулгын хэсэгт ноорог бичвэрээ оруулна уу.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const response = await fetch('/api/formalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: data.mode,
          docType: data.docType,
          recipient: data.recipient,
          sender: data.sender || data.signatoryName,
          companyName: data.companyName,
          signatoryTitle: data.signatoryTitle,
          roughText: textToFormalize,
          duration: data.duration,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Хүсэлт амжилтгүй боллоо');
      }

      const result = await response.json();
      setPreviousRoughText(textToFormalize);

      const newParagraphs = result.formalizedText
        .split('\n')
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      onChange({
        formalizedText: result.formalizedText,
        paragraphsList: newParagraphs,
      });

      setAiSuccess('Албан хэрэг хөтлөлтийн стандартын дагуу найруулан заслаа!');
      setTimeout(() => setAiSuccess(null), 4000);
    } catch (err: any) {
      console.error('AI Formalization failed:', err);
      setAiError(
        err.message || 'Албан найруулга хийх явцад алдаа гарлаа. Дахин оролдоно уу.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRevertText = () => {
    if (previousRoughText) {
      const prevParagraphs = previousRoughText
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      onChange({
        formalizedText: previousRoughText,
        paragraphsList: prevParagraphs,
      });
      setPreviousRoughText(null);
      setAiSuccess('Өмнөх ноорог текстийг сэргээлээ');
      setTimeout(() => setAiSuccess(null), 2500);
    }
  };

  // Dynamic Clause/Paragraph management
  const handleAddParagraph = () => {
    const current = paragraphs.length > 0 ? paragraphs : [''];
    const updated = [
      ...current,
      'Шинэ заалт / догол мөрийн агуулгыг энд бичнэ үү.',
    ];
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  const handleUpdateParagraph = (index: number, newText: string) => {
    const updated = [...paragraphs];
    updated[index] = newText;
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  const handleRemoveParagraph = (index: number) => {
    const updated = paragraphs.filter((_, i) => i !== index);
    onChange({
      paragraphsList: updated,
      formalizedText: updated.join('\n\n'),
    });
  };

  // Custom Key-Value fields management
  const handleAddCustomField = () => {
    const current = data.customFields || [];
    const newField = {
      id: String(Date.now()),
      label: 'Талбарын нэр',
      value: 'Утга / Мэдээлэл',
    };
    onChange({ customFields: [...current, newField] });
  };

  const handleUpdateCustomField = (
    id: string,
    updated: { label?: string; value?: string }
  ) => {
    const current = data.customFields || [];
    onChange({
      customFields: current.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    });
  };

  const handleRemoveCustomField = (id: string) => {
    const current = data.customFields || [];
    onChange({ customFields: current.filter((f) => f.id !== id) });
  };

  // Attachments list management
  const handleAddAttachment = () => {
    const current = data.attachments || [];
    const count = current.length + 1;
    const newAtt = `${count}. Хавсралт баримт бичгийн нэр (хуудасны тоо)`;
    onChange({
      attachments: [...current, newAtt],
      showAttachments: true,
    });
  };

  const handleUpdateAttachment = (index: number, newText: string) => {
    const current = [...(data.attachments || [])];
    current[index] = newText;
    onChange({ attachments: current });
  };

  const handleRemoveAttachment = (index: number) => {
    const current = (data.attachments || []).filter((_, i) => i !== index);
    onChange({ attachments: current });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange({ companyLogo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Act Items Table management
  const handleAddActItem = () => {
    const currentItems = data.actItems || [];
    const newItem: ActItem = {
      id: String(Date.now()),
      name: '',
      quantity: '1 ширхэг',
      condition: 'Хэвийн, бүрэн ажиллагаатай',
      notes: '',
    };
    onChange({ actItems: [...currentItems, newItem] });
  };

  const handleUpdateActItem = (id: string, updatedFields: Partial<ActItem>) => {
    const currentItems = data.actItems || [];
    onChange({
      actItems: currentItems.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    });
  };

  const handleRemoveActItem = (id: string) => {
    const currentItems = data.actItems || [];
    onChange({
      actItems: currentItems.filter((item) => item.id !== id),
    });
  };

  // Price Quote items table management
  const handleAddQuoteItem = () => {
    const current = data.quoteItems || [];
    const newItem: QuoteItem = {
      id: String(Date.now()),
      name: '',
      unit: 'ш',
      quantity: '1',
      unitPrice: '',
      totalPrice: '',
      notes: '',
    };
    onChange({ quoteItems: [...current, newItem] });
  };

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

  const handleRemoveQuoteItem = (id: string) => {
    const current = data.quoteItems || [];
    onChange({
      quoteItems: current.filter((item) => item.id !== id),
    });
  };

  const quoteTotalSum = (data.quoteItems || []).reduce((sum, item) => {
    const val = parseFloat((item.totalPrice || '').replace(/,/g, '')) || 0;
    return sum + val;
  }, 0);

  // Meeting Action Items management
  const handleAddMeetingActionItem = () => {
    const current = data.meetingActionItems || [];
    const newItem: MeetingActionItem = {
      id: String(Date.now()),
      task: '',
      assignee: '',
      deadline: '',
    };
    onChange({ meetingActionItems: [...current, newItem] });
  };

  const handleUpdateMeetingActionItem = (
    id: string,
    updated: Partial<MeetingActionItem>
  ) => {
    const current = data.meetingActionItems || [];
    onChange({
      meetingActionItems: current.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    });
  };

  const handleRemoveMeetingActionItem = (id: string) => {
    const current = data.meetingActionItems || [];
    onChange({
      meetingActionItems: current.filter((item) => item.id !== id),
    });
  };

  const isActDoc = data.docType.includes('АКТ');
  const isPoaDoc = data.docType.includes('ИТГЭМЖЛЭЛ');
  const isVehiclePoa = data.docType === 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ';
  const isMeetingMinutes = data.docType === 'ХУРЛЫН ТЭМДЭГЛЭЛ';
  const isInternalMemo = data.docType === 'ДОТООД САНАМЖ БИЧИГ';
  const isPaymentGuarantee = data.docType.includes('БАТАЛГАА');
  const isPriceQuote =
    data.docType === 'ҮНИЙН САНАЛ' || Boolean(data.quoteItems && data.quoteItems.length > 0);

  const categories: { key: TemplateCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Бүгд', icon: '⚡' },
    { key: 'application', label: 'Өргөдөл, хүсэлт', icon: '📁' },
    { key: 'corporate_letter', label: 'Албан тоот', icon: '🏢' },
    { key: 'handover', label: 'Хүлээлцэх акт', icon: '📋' },
    { key: 'poa', label: 'Итгэмжлэл', icon: '📑' },
    { key: 'internal', label: 'Дотоод бичиг', icon: '👥' },
    { key: 'guarantee', label: 'Баталгаа, шаардах', icon: '🛡️' },
  ];

  const filteredTemplates = PRESET_TEMPLATES.filter((tmpl) => {
    if (selectedCategory === 'all') return true;
    return tmpl.category === selectedCategory;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* 0. Primary Mode Selector: Personal vs Corporate */}
      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
          <span>Баримт бичгийн горим</span>
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer lowercase"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Шинээр эхлэх</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              onChange({
                mode: 'personal',
                docType: data.docType.includes('АКТ') ? data.docType : 'ӨРГӨДӨЛ',
              });
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              data.mode === 'personal'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Иргэн / Ажилтан</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({
                mode: 'corporate',
                docType: data.docType === 'ӨРГӨДӨЛ' ? 'АЛБАН ТООТ' : data.docType,
                companyName: data.companyName || '«АРВИН ТЕХНОЛОГИ» ХХК',
                companyNameEn: data.companyNameEn || 'ARVIN TECHNOLOGY LLC',
                companyRegister: data.companyRegister || '5412980',
                companyAddress:
                  data.companyAddress ||
                  'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
                companyPhone: data.companyPhone || '7711-0099',
                companyEmail: data.companyEmail || 'info@arvintech.mn',
                companyWebsite: data.companyWebsite || 'www.arvintech.mn',
                documentNumber: data.documentNumber || '26/108',
                signatoryTitle: data.signatoryTitle || 'Гүйцэтгэх захирал',
                signatoryName: data.signatoryName || 'Б.Батбаяр',
                officialStamp: true,
                showCompanyHeader: true,
              });
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              data.mode === 'corporate'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Компани / ААН (Албан тоот)</span>
          </button>
        </div>
      </div>

      {/* QUICK SECTION TOGGLES (Хэсгүүдийг асаах / унтраах) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Баримтын хэсгүүдийг сонгох (Асаах / Унтраах):</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAdvancedToggles(!showAdvancedToggles)}
            className="text-[11px] text-blue-600 hover:text-blue-800 underline font-normal cursor-pointer"
          >
            {showAdvancedToggles ? 'Хураах' : 'Дэлгэрэнгүй'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {data.mode === 'corporate' && (
            <label
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
                data.showCompanyHeader !== false
                  ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <input
                type="checkbox"
                checked={data.showCompanyHeader !== false}
                onChange={(e) => onChange({ showCompanyHeader: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Компанийн толгой & Лого</span>
            </label>
          )}

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              data.showDocNumber !== false
                ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={data.showDocNumber !== false}
              onChange={(e) => onChange({ showDocNumber: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Албан бичгийн №</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              data.showRecipient !== false
                ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={data.showRecipient !== false}
              onChange={(e) => onChange({ showRecipient: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Хүлээн авагч (Хэнд)</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              data.showDateLocation !== false
                ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={data.showDateLocation !== false}
              onChange={(e) => onChange({ showDateLocation: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Огноо, байршил</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              data.showSecondParty !== false
                ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={data.showSecondParty !== false}
              onChange={(e) => onChange({ showSecondParty: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>2-р талын гарын үсэг</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              Boolean(data.officialStamp)
                ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(data.officialStamp)}
              onChange={(e) => onChange({ officialStamp: e.target.checked })}
              className="rounded text-rose-600"
            />
            <span>Албаны тамга</span>
          </label>

          <label
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors ${
              data.showAttachments !== false && Boolean(data.attachments?.length)
                ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <input
              type="checkbox"
              checked={data.showAttachments !== false && Boolean(data.attachments?.length)}
              onChange={(e) => onChange({ showAttachments: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Хавсралт жагсаалт</span>
          </label>
        </div>
      </div>

      {/* 1. Categorized Presets Library */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Бэлэн загварууд:</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {filteredTemplates.length} загвар
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span>{cat.icon} </span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyPreset(template)}
              className="text-left p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-lg transition-all group shadow-2xs flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">
                    {template.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 shrink-0">
                    {template.categoryLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {template.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Corporate Letterhead Settings (If corporate mode) */}
      {data.mode === 'corporate' && data.showCompanyHeader !== false && (
        <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Компанийн толгой & Албан хэвлэмэл хуудасны мэдээлэл
            </span>
            <button
              type="button"
              onClick={() => onChange({ showCompanyHeader: false })}
              className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Хураах</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Компанийн нэр (Монгол)
              </label>
              <input
                type="text"
                value={data.companyName || ''}
                onChange={(e) => onChange({ companyName: e.target.value })}
                placeholder='ж.нь: «АРВИН ТЕХНОЛОГИ» ХХК'
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Байгууллагын лого
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Лого сонгох</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {data.companyLogo && (
                  <button
                    type="button"
                    onClick={() => onChange({ companyLogo: '' })}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer"
                    title="Лого устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Компанийн нэр (Англи / Дэд гарчиг)
              </label>
              <input
                type="text"
                value={data.companyNameEn || ''}
                onChange={(e) => onChange({ companyNameEn: e.target.value })}
                placeholder="ARVIN TECHNOLOGY LLC"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">
                  Албан бичгийн дугаар (№)
                </label>
                {data.documentNumber && (
                  <button
                    type="button"
                    onClick={() => onChange({ documentNumber: '' })}
                    className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    ✕ Арилгах
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">№</span>
                <input
                  type="text"
                  value={data.documentNumber || ''}
                  onChange={(e) => onChange({ documentNumber: e.target.value })}
                  placeholder="26/108"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-700">
                Албан ёсны хаяг
              </label>
              <input
                type="text"
                value={data.companyAddress || ''}
                onChange={(e) => onChange({ companyAddress: e.target.value })}
                placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг..."
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Байгууллагын РД
              </label>
              <input
                type="text"
                value={data.companyRegister || ''}
                onChange={(e) => onChange({ companyRegister: e.target.value })}
                placeholder="5412980"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Утас & И-мэйл
              </label>
              <input
                type="text"
                value={`${data.companyPhone || ''} ${data.companyEmail ? '· ' + data.companyEmail : ''}`}
                onChange={(e) => onChange({ companyPhone: e.target.value })}
                placeholder="Утас: 7711-0099, И-мэйл: info@company.mn"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700">
                Вэбсайт
              </label>
              <input
                type="text"
                value={data.companyWebsite || ''}
                onChange={(e) => onChange({ companyWebsite: e.target.value })}
                placeholder="www.company.mn"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Document Title, Date, Recipient */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Баримт бичгийн төрөл / Гарчиг
          </label>
          <input
            type="text"
            value={data.docType}
            onChange={(e) => onChange({ docType: e.target.value as DocumentType })}
            className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date & Location */}
        {data.showDateLocation !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Огноо</label>
                <button
                  type="button"
                  onClick={() => onChange({ date: '' })}
                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕ Арилгах
                </button>
              </div>
              <input
                type="text"
                value={data.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Байршил / Хот
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ city: '' })}
                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕ Арилгах
                </button>
              </div>
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Recipient */}
        {data.showRecipient !== false && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Хэнд (Хүлээн авагч байгууллага, албан тушаалтан)
              </label>
              {data.recipient && (
                <button
                  type="button"
                  onClick={() => onChange({ recipient: '' })}
                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕ Арилгах
                </button>
              )}
            </div>
            <input
              type="text"
              value={data.recipient}
              onChange={(e) => onChange({ recipient: e.target.value })}
              placeholder='ж.нь: "Гүйцэтгэх захирал танаа", "«Хаан Банк» танаа"'
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Duration / Validity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Хугацаа (Чөлөөний хугацаа / Гэрээний хугацаа / Хүчинтэй хугацаа)
            </label>
            {data.duration && (
              <button
                type="button"
                onClick={() => onChange({ duration: '' })}
                className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                ✕ Арилгах
              </button>
            )}
          </div>
          <input
            type="text"
            value={data.duration || ''}
            onChange={(e) => onChange({ duration: e.target.value })}
            placeholder="ж.нь: 2026.10.01 - 2026.10.03 (3 хоног) эсвэл 1 жилийн хугацаатай"
            className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ================= SPECIALIZED 1: ХҮЛЭЭЛЦЭХ АКТ (HANDOVER ACT) ================= */}
      {isActDoc && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Хүлээлцэх эд хөрөнгө, ажлын жагсаалт (Акт хүснэгт)
            </span>
            <button
              type="button"
              onClick={handleAddActItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Мөр нэмэх</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">
              Хүлээлцсэн байршил / Тасаг, өрөө
            </label>
            <input
              type="text"
              value={data.handoverLocation || ''}
              onChange={(e) => onChange({ handoverLocation: e.target.value })}
              placeholder="ж.нь: Төв байр, 404 тоот өрөө"
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            {data.actItems && data.actItems.length > 0 ? (
              data.actItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-2 relative group"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      № {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                      title="Энэ мөрийг устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-red-600 font-medium">Мөр устгах</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateActItem(item.id, { name: e.target.value })
                        }
                        placeholder="Эд хөрөнгийн нэр..."
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-medium"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateActItem(item.id, { quantity: e.target.value })
                        }
                        placeholder="Тоо (1 ш)"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded text-center"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={item.condition}
                        onChange={(e) =>
                          handleUpdateActItem(item.id, { condition: e.target.value })
                        }
                        placeholder="Төлөв (Хэвийн)"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) =>
                        handleUpdateActItem(item.id, { notes: e.target.value })
                      }
                      placeholder="Нэмэлт тэмдэглэл, дагалдах зүйлс..."
                      className="w-full text-[11px] px-2.5 py-1 border border-slate-200 rounded text-slate-600 bg-slate-50/50"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-white rounded border border-dashed border-emerald-300 text-xs text-slate-500">
                Одоогоор хүснэгтэд мөр байхгүй байна.{' '}
                <button
                  type="button"
                  onClick={handleAddActItem}
                  className="text-emerald-700 underline font-medium cursor-pointer"
                >
                  Мөр нэмэх
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SPECIALIZED 1.5: ҮНИЙН САНАЛ (PRICE QUOTATION) ================= */}
      {isPriceQuote && (
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Үнийн саналын хүснэгт & Бараа үйлчилгээний задаргаа
            </span>
            <button
              type="button"
              onClick={handleAddQuoteItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Мөр нэмэх</span>
            </button>
          </div>

          <div className="space-y-2">
            {data.quoteItems && data.quoteItems.length > 0 ? (
              data.quoteItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs space-y-2 relative group"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      № {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuoteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                      title="Энэ мөрийг устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-red-600 font-medium">Мөр устгах</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <label className="text-[10px] text-slate-500 block mb-0.5">
                        Бараа, ажил үйлчилгээний нэр
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { name: e.target.value })
                        }
                        placeholder="Сервер, лиценз, суурилуулалт..."
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">
                        Хэмжих нэгж
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { unit: e.target.value })
                        }
                        placeholder="ш, багц, сар..."
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded text-center"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 block mb-0.5">
                        Тоо ширхэг
                      </label>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { quantity: e.target.value })
                        }
                        placeholder="1"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] text-slate-500 block mb-0.5">
                        Нэгж үнэ (₮)
                      </label>
                      <input
                        type="text"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { unitPrice: e.target.value })
                        }
                        placeholder="2,500,000"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded text-right font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1 border-t border-slate-100">
                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { notes: e.target.value })
                        }
                        placeholder="Нэмэлт тайлбар, үзүүлэлт..."
                        className="w-full text-[11px] px-2.5 py-1 border border-slate-200 rounded text-slate-600 bg-slate-50/50"
                      />
                    </div>
                    <div className="sm:col-span-5 flex items-center justify-end gap-1.5 text-xs">
                      <span className="text-slate-500 text-[11px]">Нийт үнэ:</span>
                      <input
                        type="text"
                        value={item.totalPrice}
                        onChange={(e) =>
                          handleUpdateQuoteItem(item.id, { totalPrice: e.target.value })
                        }
                        placeholder="0"
                        className="w-36 text-xs px-2 py-1 border border-blue-300 rounded text-right font-bold font-mono text-blue-900 bg-blue-50/40"
                      />
                      <span className="text-slate-600 font-mono">₮</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-white rounded border border-dashed border-blue-300 text-xs text-slate-500">
                Одоогоор хүснэгтэд мөр байхгүй байна.{' '}
                <button
                  type="button"
                  onClick={handleAddQuoteItem}
                  className="text-blue-700 underline font-medium cursor-pointer"
                >
                  Мөр нэмэх
                </button>
              </div>
            )}
          </div>

          {/* Quote Total Summary Bar */}
          {data.quoteItems && data.quoteItems.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-100/70 border border-blue-200 rounded-lg text-xs">
              <span className="font-bold text-blue-950">
                Нийт үнийн дүн ({data.quoteItems.length} бараа/үйлчилгээ):
              </span>
              <span className="font-mono font-bold text-base text-blue-900">
                {quoteTotalSum.toLocaleString('en-US')} ₮
              </span>
            </div>
          )}
        </div>
      )}

      {/* ================= SPECIALIZED 2: ИТГЭМЖЛЭЛ (POWER OF ATTORNEY) ================= */}
      {isPoaDoc && (
        <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Итгэмжлэлийн талууд
            </span>
            <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100 px-2 py-0.5 rounded">
              Иргэний хууль
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Итгэмжлэгч (Эрх олгогч)
              </label>
              <input
                type="text"
                value={data.grantorName || data.sender || ''}
                onChange={(e) => {
                  onChange({ grantorName: e.target.value, sender: e.target.value });
                }}
                placeholder="Баатар овогтой Ганзориг"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Итгэмжлэгчийн РД
              </label>
              <input
                type="text"
                value={data.grantorRegister || data.senderRegister || ''}
                onChange={(e) => {
                  onChange({
                    grantorRegister: e.target.value,
                    senderRegister: e.target.value,
                  });
                }}
                placeholder="УШ85101519"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Итгэмжлэгдэгч (Төлөөлөгч)
              </label>
              <input
                type="text"
                value={data.attorneyName || data.secondSignatoryName || ''}
                onChange={(e) => {
                  onChange({
                    attorneyName: e.target.value,
                    secondSignatoryName: e.target.value,
                  });
                }}
                placeholder="Төмөр овогтой Төгөлдөр"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Итгэмжлэгдэгчийн РД
              </label>
              <input
                type="text"
                value={data.attorneyRegister || data.secondSignatoryRegister || ''}
                onChange={(e) => {
                  onChange({
                    attorneyRegister: e.target.value,
                    secondSignatoryRegister: e.target.value,
                  });
                }}
                placeholder="ЧД92080412"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>

          {isVehiclePoa && (
            <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
              <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-600" />
                Тээврийн хэрэгслийн үзүүлэлт:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={data.vehiclePlate || ''}
                  onChange={(e) => onChange({ vehiclePlate: e.target.value })}
                  placeholder="Улсын дугаар (12-34 УБҮ)"
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
                <input
                  type="text"
                  value={data.vehicleModel || ''}
                  onChange={(e) => onChange({ vehicleModel: e.target.value })}
                  placeholder="Марк (Toyota Prado)"
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                />
                <input
                  type="text"
                  value={data.vehicleVin || ''}
                  onChange={(e) => onChange({ vehicleVin: e.target.value })}
                  placeholder="Арлын дугаар (VIN)"
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SPECIALIZED 3: ХУРЛЫН ТЭМДЭГЛЭЛ ================= */}
      {isMeetingMinutes && (
        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              Хурлын явц, ирц ба гарсан шийдвэрүүд
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">
              Хурлын сэдэв / Нэр
            </label>
            <input
              type="text"
              value={data.meetingTitle || ''}
              onChange={(e) => onChange({ meetingTitle: e.target.value })}
              placeholder="ж.нь: Удирдах зөвлөлийн төсөв батлах хурал"
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Хурал даргалагч
              </label>
              <input
                type="text"
                value={data.meetingChairperson || data.signatoryName || ''}
                onChange={(e) => {
                  onChange({
                    meetingChairperson: e.target.value,
                    signatoryName: e.target.value,
                  });
                }}
                placeholder="Гүйцэтгэх захирал Б.Батбаяр"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Тэмдэглэл хөтөлсөн (Нарийн бичиг)
              </label>
              <input
                type="text"
                value={data.meetingSecretary || data.secondSignatoryName || ''}
                onChange={(e) => {
                  onChange({
                    meetingSecretary: e.target.value,
                    secondSignatoryName: e.target.value,
                  });
                }}
                placeholder="Туслах Э.Ундрах"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Оролцсон гишүүд (Ирц)
            </label>
            <input
              type="text"
              value={data.meetingAttendees || ''}
              onChange={(e) => onChange({ meetingAttendees: e.target.value })}
              placeholder="Нийт гишүүд 100% ирцтэй"
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
            />
          </div>

          {/* Action items table */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span className="flex items-center gap-1">
                <ListTodo className="w-3.5 h-3.5 text-amber-600" />
                Биелүүлэх үүрэг даалгаврын хуваарь:
              </span>
              <button
                type="button"
                onClick={handleAddMeetingActionItem}
                className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium cursor-pointer"
              >
                + Даалгавар нэмэх
              </button>
            </div>

            {data.meetingActionItems && data.meetingActionItems.length > 0 ? (
              data.meetingActionItems.map((act, index) => (
                <div
                  key={act.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 bg-white p-2 rounded border border-amber-200 text-xs items-center"
                >
                  <div className="sm:col-span-1 text-center font-mono font-bold text-amber-800">
                    {index + 1}
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={act.task}
                      onChange={(e) =>
                        handleUpdateMeetingActionItem(act.id, { task: e.target.value })
                      }
                      placeholder="Үүрэг даалгавар..."
                      className="w-full text-xs px-2 py-1 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={act.assignee}
                      onChange={(e) =>
                        handleUpdateMeetingActionItem(act.id, { assignee: e.target.value })
                      }
                      placeholder="Хариуцагч..."
                      className="w-full text-xs px-2 py-1 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={act.deadline}
                      onChange={(e) =>
                        handleUpdateMeetingActionItem(act.id, { deadline: e.target.value })
                      }
                      placeholder="Хугацаа..."
                      className="w-full text-xs px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveMeetingActionItem(act.id)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3 bg-white rounded border border-dashed border-amber-200 text-xs text-slate-400">
                Үүрэг даалгаврын хуваарь оруулаагүй байна.{' '}
                <button
                  type="button"
                  onClick={handleAddMeetingActionItem}
                  className="text-amber-700 underline font-medium cursor-pointer"
                >
                  Даалгавар нэмэх
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SPECIALIZED 4: ДОТООД САНАМЖ БИЧИГ (MEMO) ================= */}
      {isInternalMemo && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Дотоод санамж бичгийн тохиргоо
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Сэдэв / Гарчиг
            </label>
            <input
              type="text"
              value={data.memoSubject || ''}
              onChange={(e) => onChange({ memoSubject: e.target.value })}
              placeholder="ж.нь: Ажлын цагийн горим болон мэдээллийн аюулгүй байдлын тухай"
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md font-semibold"
            />
          </div>
        </div>
      )}

      {/* ================= SPECIALIZED 5: ТӨЛБӨР ТӨЛӨХ БАТАЛГАА ================= */}
      {isPaymentGuarantee && (
        <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-teal-900 border-b border-teal-200 pb-1.5 flex items-center justify-between">
            <span>Төлбөрийн баталгааны үзүүлэлт</span>
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-100 px-2 py-0.5 rounded">
              Хууль зүйн баталгаа
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Төлбөрийн дүн (Тоогоор, төгрөг)
              </label>
              <input
                type="text"
                value={data.paymentAmountNumber || ''}
                onChange={(e) => onChange({ paymentAmountNumber: e.target.value })}
                placeholder="85,000,000"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Төлбөрийн дүн (Үсгээр)
              </label>
              <input
                type="text"
                value={data.paymentAmountWords || ''}
                onChange={(e) => onChange({ paymentAmountWords: e.target.value })}
                placeholder="наян таван сая төгрөг"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">
              Төлж барагдуулах эцсийн хугацаа
            </label>
            <input
              type="text"
              value={data.paymentDueDate || data.duration || ''}
              onChange={(e) => {
                onChange({
                  paymentDueDate: e.target.value,
                  duration: e.target.value,
                });
              }}
              placeholder="2026 оны 10 дугаар сарын 25-ны өдрийн дотор"
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded"
            />
          </div>
        </div>
      )}

      {/* 4. DYNAMIC PARAGRAPHS & CLAUSES (+ Шинэ заалт нэмэх, хасах) & AI Assistant */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>Их биеийн заалтууд & Догол мөрүүд ({paragraphs.length}):</span>
          </label>

          {/* AI Tone Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
            <span className="text-slate-500 px-1.5 hidden sm:inline">Өнгө аяс:</span>
            <button
              type="button"
              onClick={() => setSelectedTone('government')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedTone === 'government'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Төрийн алба
            </button>
            <button
              type="button"
              onClick={() => setSelectedTone('b2b')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedTone === 'b2b'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              B2B Түншлэл
            </button>
            <button
              type="button"
              onClick={() => setSelectedTone('respectful')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedTone === 'respectful'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Хүндэтгэлтэй
            </button>
          </div>
        </div>

        {/* Dynamic Clauses List with individual edit & trash icons */}
        <div className="space-y-2.5">
          {paragraphs.map((p, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white border border-slate-300 rounded-lg shadow-2xs space-y-1.5 group/clause hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {idx === 0 ? '§1. Эхлэл / Үндэслэл' : `§${idx + 1}. Заалт / Догол мөр`}
                </span>
                {paragraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Энэ заалтыг хасах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={p}
                onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                placeholder="Заалтын бичвэрийг оруулна уу..."
                className="w-full text-xs p-2 bg-slate-50/50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed text-slate-900"
              />
            </div>
          ))}
        </div>

        {/* Add Paragraph & AI Formalize Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddParagraph}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Шинэ заалт / догол мөр нэмэх</span>
          </button>

          <button
            type="button"
            onClick={handleFormalizeWithAi}
            disabled={isAiLoading || paragraphs.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs text-white transition-all shadow-xs cursor-pointer ${
              isAiLoading
                ? 'bg-slate-400 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isAiLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Албан найруулгад шилжүүлж байна...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Албан найруулгаар засах</span>
              </>
            )}
          </button>
        </div>

        {/* Revert link */}
        {previousRoughText && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRevertText}
              className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 cursor-pointer"
            >
              Анхны ноорог эхийг буцаах
            </button>
          </div>
        )}

        {/* Status Messages */}
        {aiSuccess && (
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{aiSuccess}</span>
          </div>
        )}

        {aiError && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* ================= 5. CUSTOM FIELDS & ATTACHMENTS (НЭМЭХ / ХАСАХ) ================= */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Нэмэлт мэдээлэл & Хавсралтын жагсаалт:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddCustomField}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline"
            >
              + Нэмэлт мэдээлэл нэмэх
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleAddAttachment}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer underline"
            >
              + Хавсралт нэмэх
            </button>
          </div>
        </div>

        {/* Custom Key-Value fields list */}
        {data.customFields && data.customFields.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-slate-600">
              Нэмэлт мэдээллийн талбарууд:
            </div>
            {data.customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-300">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) =>
                    handleUpdateCustomField(field.id, { label: e.target.value })
                  }
                  placeholder="Талбарын нэр"
                  className="w-1/3 text-xs px-2 py-1 border border-slate-200 rounded font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) =>
                    handleUpdateCustomField(field.id, { value: e.target.value })
                  }
                  placeholder="Утга / Мэдээлэл"
                  className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                  title="Талбар хасах"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Attachments List */}
        {data.attachments && data.attachments.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-slate-500" />
              Хавсралт баримт бичгүүд:
            </div>
            {data.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-300">
                <input
                  type="text"
                  value={att}
                  onChange={(e) => handleUpdateAttachment(i, e.target.value)}
                  placeholder="Хавсралт баримтын нэр..."
                  className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(i)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                  title="Хавсралт хасах"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Dual Signatures / Submitter Section */}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            Гарын үсэг баталгаажуулалт
          </label>

          {/* Toggle between Primary and Secondary Signatory */}
          {(isActDoc || isPoaDoc || data.secondSignatoryName || data.showSecondParty) && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-[11px]">
              <button
                type="button"
                onClick={() => setActiveSigTab('primary')}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  activeSigTab === 'primary'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                1-р тал ({data.signatoryTitle || 'Гаргасан'})
              </button>
              <button
                type="button"
                onClick={() => setActiveSigTab('secondary')}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  activeSigTab === 'secondary'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                2-р тал ({data.secondSignatoryTitle || 'Хүлээн авсан'})
              </button>
            </div>
          )}
        </div>

        {/* Submitter Name inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">
                1-р талын нэр, албан тушаал
              </label>
              {(data.signatoryName || data.sender) && (
                <button
                  type="button"
                  onClick={() => onChange({ signatoryName: '', sender: '' })}
                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕ Арилгах
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.signatoryTitle || ''}
                onChange={(e) => onChange({ signatoryTitle: e.target.value })}
                placeholder="Албан тушаал"
                className="w-1/2 text-xs px-2 py-1 bg-white border border-slate-300 rounded"
              />
              <input
                type="text"
                value={data.signatoryName || data.sender || ''}
                onChange={(e) =>
                  onChange({ signatoryName: e.target.value, sender: e.target.value })
                }
                placeholder="Овог нэр"
                className="w-1/2 text-xs px-2 py-1 bg-white border border-slate-300 rounded font-semibold"
              />
            </div>

            {/* Sender phone & register inputs */}
            {data.mode === 'personal' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <input
                    type="text"
                    value={data.senderPhone || ''}
                    onChange={(e) => onChange({ senderPhone: e.target.value })}
                    placeholder="Утас: 9911-..."
                    className="w-full text-[11px] px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={data.senderRegister || ''}
                    onChange={(e) => onChange({ senderRegister: e.target.value })}
                    placeholder="РД: УШ..."
                    className="w-full text-[11px] px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">
                2-р талын нэр (Хүлээн авсан / Итгэмжлэгдэгч)
              </label>
              {data.secondSignatoryName && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      secondSignatoryName: '',
                      secondSignatoryTitle: '',
                      showSecondParty: false,
                    })
                  }
                  className="text-[10px] text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕ Хасах
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.secondSignatoryTitle || ''}
                onChange={(e) => onChange({ secondSignatoryTitle: e.target.value })}
                placeholder="Хүлээн авсан:"
                className="w-1/2 text-xs px-2 py-1 bg-white border border-slate-300 rounded"
              />
              <input
                type="text"
                value={data.secondSignatoryName || ''}
                onChange={(e) => onChange({ secondSignatoryName: e.target.value })}
                placeholder="Овог нэр"
                className="w-1/2 text-xs px-2 py-1 bg-white border border-slate-300 rounded font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Active Signature Pad Canvas */}
        {activeSigTab === 'primary' ? (
          <div>
            <div className="text-[11px] text-slate-500 mb-1">
              1-р тал: <strong>{data.signatoryTitle || 'Гарын үсэг зурах'}:</strong>{' '}
              {data.signatoryName || data.sender}
            </div>
            <SignaturePad
              signatureDataUrl={data.signatureDataUrl}
              onSignatureChange={(url) => onChange({ signatureDataUrl: url })}
            />
          </div>
        ) : (
          <div>
            <div className="text-[11px] text-slate-500 mb-1">
              2-р тал: <strong>{data.secondSignatoryTitle || 'Хүлээн авсан'}:</strong>{' '}
              {data.secondSignatoryName}
            </div>
            <SignaturePad
              signatureDataUrl={data.secondSignatureDataUrl}
              onSignatureChange={(url) => onChange({ secondSignatureDataUrl: url })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

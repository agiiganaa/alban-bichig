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
  OrgProfile,
  AppSettings,
} from '../types/document';
import { SignaturePad } from './SignaturePad';
import {
  formatRecipientBlock,
  generateDocNumber,
  getFormattedMongolianDate,
} from '../utils/documentUtils';
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
  Stamp,
  Hash,
  Copy,
  Scissors,
  SpellCheck,
  Maximize2,
  Check,
  ChevronDown,
} from 'lucide-react';

interface DocumentFormProps {
  data: DocumentData;
  onChange: (updated: Partial<DocumentData>) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
  onReset: () => void;
  orgProfile?: OrgProfile;
  appSettings?: AppSettings;
  onGenerateNextNumber?: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  data,
  onChange,
  onApplyPreset,
  onReset,
  orgProfile,
  appSettings,
  onGenerateNextNumber,
}) => {
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<AiTone>('standard');
  const [previousRoughText, setPreviousRoughText] = useState<string | null>(null);
  const [activeSigTab, setActiveSigTab] = useState<'primary' | 'secondary'>('primary');
  const [showAdvancedToggles, setShowAdvancedToggles] = useState<boolean>(false);

  // Recipient builder state
  const [recipientOrg, setRecipientOrg] = useState<string>('');
  const [recipientTitle, setRecipientTitle] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [showRecipientBuilder, setShowRecipientBuilder] = useState<boolean>(false);

  // Extract paragraphs array
  const rawText = data.formalizedText || data.roughText || '';
  const paragraphs =
    data.paragraphsList && data.paragraphsList.length > 0
      ? data.paragraphsList
      : rawText
          .split('\n')
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

  // AI Operations (Formalize, Grammar, Shorten, Expand, Title)
  const handleAiAction = async (action: 'formalize' | 'grammar' | 'shorten' | 'expand' | 'suggest_title') => {
    const textToProcess =
      paragraphs.length > 0 ? paragraphs.join('\n\n') : data.roughText;

    if (!textToProcess.trim() && action !== 'suggest_title') {
      setAiError('Шалтгаан, агуулгын хэсэгт эх бичвэрээ оруулна уу.');
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
          roughText: textToProcess || data.docType,
          duration: data.duration,
          tone: selectedTone,
          action,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Хүсэлт амжилтгүй боллоо');
      }

      const result = await response.json();
      setPreviousRoughText(textToProcess);

      if (action === 'suggest_title' && result.suggestedTitle) {
        onChange({ title: result.suggestedTitle });
        setAiSuccess(`Гарчиг санал болгов: "${result.suggestedTitle}"`);
      } else if (result.formalizedText) {
        const newParagraphs = result.formalizedText
          .split('\n')
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);

        onChange({
          formalizedText: result.formalizedText,
          paragraphsList: newParagraphs,
        });

        const successMsg =
          action === 'grammar'
            ? 'Зөв бичгийн дүрэм, үг үсгийн алдааг хянаж заслаа!'
            : action === 'shorten'
            ? 'Баримтын агуулгыг товчлон богиносголоо!'
            : action === 'expand'
            ? 'Агуулга, үндэслэлийг дэлгэрүүлэн баяжууллаа!'
            : 'Албан хэрэг хөтлөлтийн стандартын дагуу найруулав!';

        setAiSuccess(successMsg);
      }

      setTimeout(() => setAiSuccess(null), 4000);
    } catch (err: any) {
      console.error('AI Action failed:', err);
      setAiError(
        err.message || 'AI боловсруулалт хийх явцад алдаа гарлаа. Дахин оролдоно уу.'
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
      setAiSuccess('Өмнөх бичвэрийг сэргээлээ');
      setTimeout(() => setAiSuccess(null), 2500);
    }
  };

  // Recipient auto-formatter helper
  const handleApplyRecipientFormat = () => {
    const formatted = formatRecipientBlock(recipientOrg, recipientTitle, recipientName);
    if (formatted) {
      onChange({ recipient: formatted });
      setShowRecipientBuilder(false);
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

  // Pull organization profile to document
  const handlePullOrgProfile = () => {
    if (!orgProfile) return;
    onChange({
      companyName: orgProfile.companyName,
      companyNameEn: orgProfile.companyNameEn,
      companyRegister: orgProfile.companyRegister,
      companyAddress: orgProfile.companyAddress,
      companyPhone: orgProfile.companyPhone,
      companyEmail: orgProfile.companyEmail,
      companyWebsite: orgProfile.companyWebsite,
      companyLogo: orgProfile.companyLogo,
      signatoryTitle: orgProfile.signatoryTitle,
      signatoryName: orgProfile.signatoryName,
      showCompanyHeader: true,
      officialStamp: true,
    });
    setAiSuccess('Байгууллагын профайлыг баримтад татлаа!');
    setTimeout(() => setAiSuccess(null), 2500);
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
    const newAtt = `${count}. Хавсралт баримт бичгийн нэр – 1 хуудас`;
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

  // Stamp image upload
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange({ stampImage: result, officialStamp: true });
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
  const isContract = data.docType.includes('ГЭРЭЭ');
  const isPriceQuote =
    data.docType === 'ҮНИЙН САНАЛ' || Boolean(data.quoteItems && data.quoteItems.length > 0);

  return (
    <div className="space-y-5 text-slate-800">
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
            <span>Цэвэрлэх</span>
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
                showCompanyHeader: true,
                officialStamp: true,
              });
              if (orgProfile && !data.companyName) {
                handlePullOrgProfile();
              }
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              data.mode === 'corporate'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Компани / Албан тоот</span>
          </button>
        </div>
      </div>

      {/* QUICK SECTION TOGGLES */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Баримтын хэсгүүдийг сонгох:</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAdvancedToggles(!showAdvancedToggles)}
            className="text-[11px] text-blue-600 hover:text-blue-800 underline font-normal cursor-pointer"
          >
            {showAdvancedToggles ? 'Хураах' : 'Бүгдийг харах'}
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
            <span>Хавсралт</span>
          </label>
        </div>
      </div>

      {/* 1. Corporate Letterhead Settings (If corporate mode) */}
      {data.mode === 'corporate' && data.showCompanyHeader !== false && (
        <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Компанийн толгой & Албан хэвлэмэл хуудас
            </span>
            {orgProfile && (
              <button
                type="button"
                onClick={handlePullOrgProfile}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer underline"
              >
                Профайлаас татах
              </button>
            )}
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
                Англи нэр
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
              <label className="text-[11px] font-semibold text-slate-700">
                РД
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

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">
              Хаяг & Утас
            </label>
            <input
              type="text"
              value={data.companyAddress || ''}
              onChange={(e) => onChange({ companyAddress: e.target.value })}
              placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо..."
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md"
            />
          </div>
        </div>
      )}

      {/* 2. Document Title, Number, Date, Recipient */}
      <div className="space-y-3">
        {/* Document Type & Auto Numbering */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 space-y-1.5">
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

          <div className="sm:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                Албан бичгийн №
              </label>
              {onGenerateNextNumber && (
                <button
                  type="button"
                  onClick={onGenerateNextNumber}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  title="Дараагийн дугаарыг тооцоолох"
                >
                  + Дугаар авах
                </button>
              )}
            </div>
            <input
              type="text"
              value={data.documentNumber || ''}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder="26/108"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md font-mono font-bold"
            />
          </div>
        </div>

        {/* Date & Location */}
        {data.showDateLocation !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Огноо</label>
                <button
                  type="button"
                  onClick={() => onChange({ date: getFormattedMongolianDate() })}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                >
                  Өнөөдөр
                </button>
              </div>
              <input
                type="text"
                value={data.date}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Байршил / Хот
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Recipient Block with Auto-formatter */}
        {data.showRecipient !== false && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Хүлээн авагч (Хэнд)
              </label>
              <button
                type="button"
                onClick={() => setShowRecipientBuilder(!showRecipientBuilder)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                {showRecipientBuilder ? 'Хураах' : 'Формат туслах ▾'}
              </button>
            </div>

            {/* Recipient Builder popup helper */}
            {showRecipientBuilder && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block">Байгууллага</label>
                    <input
                      type="text"
                      value={recipientOrg}
                      onChange={(e) => setRecipientOrg(e.target.value)}
                      placeholder='«Түшиг» ХХК'
                      className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Албан тушаал</label>
                    <input
                      type="text"
                      value={recipientTitle}
                      onChange={(e) => setRecipientTitle(e.target.value)}
                      placeholder="Гүйцэтгэх захирал"
                      className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Нэр</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Д.Бат-Эрдэнэ"
                      className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleApplyRecipientFormat}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Формат хийж оруулах
                  </button>
                </div>
              </div>
            )}

            <textarea
              rows={3}
              value={data.recipient}
              onChange={(e) => onChange({ recipient: e.target.value })}
              placeholder='«Монгол Шуудан» ХК-ийн&#10;Мэдээллийн технологийн газрын захирал&#10;Ц.Мөнхбат танаа'
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* 3. AI DOCUMENT ASSISTANT TOOLBAR */}
      <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              AI Баримт бичгийн туслах
            </span>
          </div>

          {/* Tone Selector */}
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as AiTone)}
            className="text-[11px] bg-white border border-blue-200 rounded px-2 py-1 text-slate-700 font-medium"
          >
            <option value="standard">Стандарт албан бичиг</option>
            <option value="government">Төрийн байгууллагад (Хатуу)</option>
            <option value="b2b">Түнш байгууллагад (B2B соёлтой)</option>
            <option value="respectful">Хүндэтгэлтэй (Дипломат)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiAction('formalize')}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Найруулга засах</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiAction('grammar')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <SpellCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Алдаа засах</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiAction('shorten')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-600" />
            <span>Богиносгох</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => handleAiAction('expand')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Дэлгэрүүлэх</span>
          </button>
        </div>

        {/* Status / Errors / Revert */}
        {aiError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {aiSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{aiSuccess}</span>
            </span>
            {previousRoughText && (
              <button
                type="button"
                onClick={handleRevertText}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Буцаах
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. DYNAMIC PARAGRAPHS & CLAUSES (Word-like clause builder) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Их бие бичвэр & Догол мөрүүд ({paragraphs.length})
          </label>
          <button
            type="button"
            onClick={handleAddParagraph}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Догол мөр нэмэх</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {paragraphs.map((para, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border border-slate-300 rounded-xl shadow-2xs space-y-1.5 relative group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                  § {idx + 1}-р догол мөр
                </span>
                {paragraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveParagraph(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Догол мөр устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Устгах</span>
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={para}
                onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                placeholder="Догол мөрийн агуулгыг энд бичнэ үү..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed text-justify"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. SPECIALIZED SECTIONS (Акт, Үнийн санал, Гэрээ, Итгэмжлэл, Хурлын тэмдэглэл) */}
      {/* Handover Act Table */}
      {isActDoc && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Хүлээлцэх эд хөрөнгийн хүснэгт
            </span>
            <button
              type="button"
              onClick={handleAddActItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Мөр нэмэх</span>
            </button>
          </div>

          <div className="space-y-2">
            {(data.actItems || []).map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    № {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActItem(item.id)}
                    className="text-rose-600 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Устгах</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateActItem(item.id, { name: e.target.value })
                    }
                    placeholder="Эд хөрөнгийн нэр..."
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded font-medium"
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateActItem(item.id, { quantity: e.target.value })
                    }
                    placeholder="Тоо ширхэг (1 ш)"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded text-center"
                  />
                  <input
                    type="text"
                    value={item.condition}
                    onChange={(e) =>
                      handleUpdateActItem(item.id, { condition: e.target.value })
                    }
                    placeholder="Төлөв (Бүрэн бүтэн)"
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Quote Table */}
      {isPriceQuote && (
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Үнийн саналын задаргаа (Хүснэгт)
            </span>
            <button
              type="button"
              onClick={handleAddQuoteItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Мөр нэмэх</span>
            </button>
          </div>

          <div className="space-y-2">
            {(data.quoteItems || []).map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-lg border border-blue-200 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    № {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuoteItem(item.id)}
                    className="text-rose-600 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Устгах</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateQuoteItem(item.id, { name: e.target.value })
                    }
                    placeholder="Бараа, үйлчилгээний нэр..."
                    className="text-xs px-2 py-1.5 border border-slate-300 rounded font-medium sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuoteItem(item.id, { quantity: e.target.value })
                    }
                    placeholder="Тоо"
                    className="text-xs px-2 py-1.5 border border-slate-300 rounded text-center font-mono"
                  />
                  <input
                    type="text"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleUpdateQuoteItem(item.id, { unitPrice: e.target.value })
                    }
                    placeholder="Нэгж үнэ (₮)"
                    className="text-xs px-2 py-1.5 border border-slate-300 rounded text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Info */}
      {isVehiclePoa && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-blue-600" />
            Тээврийн хэрэгслийн үзүүлэлт
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={data.vehiclePlate || ''}
              onChange={(e) => onChange({ vehiclePlate: e.target.value })}
              placeholder="Улсын № (12-34 УБҮ)"
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
            />
            <input
              type="text"
              value={data.vehicleModel || ''}
              onChange={(e) => onChange({ vehicleModel: e.target.value })}
              placeholder="Марк (Toyota Prado)"
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
            />
            <input
              type="text"
              value={data.vehicleVin || ''}
              onChange={(e) => onChange({ vehicleVin: e.target.value })}
              placeholder="Арлын дугаар..."
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
            />
          </div>
        </div>
      )}

      {/* Payment Guarantee details */}
      {isPaymentGuarantee && (
        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-teal-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Төлбөрийн баталгааны үзүүлэлт
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={data.paymentAmountNumber || ''}
              onChange={(e) => onChange({ paymentAmountNumber: e.target.value })}
              placeholder="Төлбөрийн дүн тоогоор (₮)"
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
            />
            <input
              type="text"
              value={data.paymentDueDate || ''}
              onChange={(e) => onChange({ paymentDueDate: e.target.value })}
              placeholder="Төлөх эцсийн хугацаа"
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
            />
          </div>
        </div>
      )}

      {/* 6. ATTACHMENTS (Хавсралт жагсаалт) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
            Хавсралт баримтууд ({(data.attachments || []).length})
          </label>
          <button
            type="button"
            onClick={handleAddAttachment}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            + Хавсралт нэмэх
          </button>
        </div>

        {(data.attachments || []).map((att, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={att}
              onChange={(e) => handleUpdateAttachment(idx, e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium"
            />
            <button
              type="button"
              onClick={() => handleRemoveAttachment(idx)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 7. SIGNATURE SECTION (Primary & Secondary) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-blue-600" />
            Гарын үсэг зурах / Баталгаажуулах
          </span>

          {data.showSecondParty && (
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveSigTab('primary')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  activeSigTab === 'primary'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600'
                }`}
              >
                1-р тал
              </button>
              <button
                type="button"
                onClick={() => setActiveSigTab('secondary')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                  activeSigTab === 'secondary'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600'
                }`}
              >
                2-р тал
              </button>
            </div>
          )}
        </div>

        {activeSigTab === 'primary' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Албан тушаал
                </label>
                <input
                  type="text"
                  value={data.signatoryTitle || ''}
                  onChange={(e) => onChange({ signatoryTitle: e.target.value })}
                  placeholder="Гүйцэтгэх захирал"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Овог нэр
                </label>
                <input
                  type="text"
                  value={data.signatoryName || data.sender || ''}
                  onChange={(e) =>
                    onChange({
                      signatoryName: e.target.value,
                      sender: e.target.value,
                    })
                  }
                  placeholder="Б.Батбаяр"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold"
                />
              </div>
            </div>

            {/* Signature Drawing / Upload Pad */}
            <SignaturePad
              signatureDataUrl={data.signatureDataUrl}
              onSignatureChange={(url) => onChange({ signatureDataUrl: url })}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  2-р талын албан тушаал / Үүрэг
                </label>
                <input
                  type="text"
                  value={data.secondSignatoryTitle || ''}
                  onChange={(e) => onChange({ secondSignatoryTitle: e.target.value })}
                  placeholder="Хүлээн авсан ажилтан"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  2-р талын нэр
                </label>
                <input
                  type="text"
                  value={data.secondSignatoryName || ''}
                  onChange={(e) => onChange({ secondSignatoryName: e.target.value })}
                  placeholder="О.Мөнхжаргал"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold"
                />
              </div>
            </div>

            <SignaturePad
              signatureDataUrl={data.secondSignatureDataUrl}
              onSignatureChange={(url) => onChange({ secondSignatureDataUrl: url })}
            />
          </div>
        )}
      </div>

      {/* 8. STAMP CONTROLS */}
      {data.officialStamp && (
        <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-rose-600" />
              Албаны тамганы тохиргоо
            </span>
            <label className="text-[11px] text-rose-700 hover:underline cursor-pointer">
              <span>Тамганы зураг оруулах</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleStampUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <label className="flex items-center gap-1.5">
              <span className="text-[11px]">Эргүүлэлт:</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={data.stampRotation || -12}
                onChange={(e) =>
                  onChange({ stampRotation: parseInt(e.target.value, 10) })
                }
                className="w-24 text-rose-600"
              />
              <span className="text-[10px] font-mono">{data.stampRotation || -12}°</span>
            </label>

            <label className="flex items-center gap-1.5">
              <span className="text-[11px]">Нэвт харагдалт:</span>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={data.stampOpacity || 0.85}
                onChange={(e) =>
                  onChange({ stampOpacity: parseFloat(e.target.value) })
                }
                className="w-24 text-rose-600"
              />
              <span className="text-[10px] font-mono">
                {Math.round((data.stampOpacity || 0.85) * 100)}%
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

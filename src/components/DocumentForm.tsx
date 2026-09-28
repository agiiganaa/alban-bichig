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
  DocumentSection,
} from '../types/document';
import { SignaturePad } from './SignaturePad';
import {
  formatRecipientBlock,
  generateDocNumber,
  getFormattedMongolianDate,
  normalizeDocumentSections,
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
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<AiTone>('standard');
  const [previousContent, setPreviousContent] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [activeSigTab, setActiveSigTab] = useState<'primary' | 'secondary'>('primary');
  const [showAdvancedToggles, setShowAdvancedToggles] = useState<boolean>(false);

  // Recipient builder state
  const [recipientOrg, setRecipientOrg] = useState<string>('');
  const [recipientTitle, setRecipientTitle] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [showRecipientBuilder, setShowRecipientBuilder] = useState<boolean>(false);

  // Stable, normalized sections derived from document data
  const sections: DocumentSection[] = React.useMemo(() => {
    return normalizeDocumentSections(
      data.paragraphsList,
      data.formalizedText,
      data.roughText,
      data.documentSections
    );
  }, [data.documentSections, data.paragraphsList, data.formalizedText, data.roughText]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>('section-1');

  // Guaranteed valid active section ID
  const activeSectionId =
    sections.find((s) => s.id === selectedSectionId)?.id ||
    sections[0]?.id ||
    'section-1';

  // AI Operations: ONLY processes the currently selected section and replaces it
  const handleAiAction = async (
    action: 'formalize' | 'grammar' | 'shorten' | 'expand'
  ) => {
    // Requirement 3: 1 Click = 1 AI Request. Prevent duplicate/concurrent calls.
    if (isAiProcessing) return;

    // Requirement 4: Find exactly the selected section by stable ID
    const currentSection =
      sections.find((s) => s.id === activeSectionId) || sections[0];

    if (!currentSection || !currentSection.content.trim()) {
      setAiError('Эхлээд сонгосон догол мөрөндөө засах текстээ оруулна уу.');
      setTimeout(() => setAiError(null), 3500);
      return;
    }

    setIsAiProcessing(true);
    setActiveAction(action);
    setAiError(null);
    setAiSuccess(null);

    // Save previous state for undo
    setPreviousContent({
      id: currentSection.id,
      content: currentSection.content,
    });

    try {
      const response = await fetch('/api/formalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentSection.content,
          action,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.error || 'AI боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.'
        );
      }

      const result = await response.json();
      const newText = (result.result || result.formalizedText || '').trim();

      if (!newText) {
        throw new Error('AI-аас засварласан үр дүн ирсэнгүй.');
      }

      // Requirement 2 & 5: UPDATE EXISTING CONTENT ONLY.
      // Do NOT push, do NOT create new paragraphs or sections, do NOT duplicate text.
      const updatedSections = sections.map((sec) =>
        sec.id === currentSection.id ? { ...sec, content: newText } : sec
      );

      const newParagraphsList = updatedSections.map((s) => s.content);
      onChange({
        documentSections: updatedSections,
        paragraphsList: newParagraphsList,
        formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
      });

      const successLabels: Record<string, string> = {
        formalize: 'Найруулгыг засаж шинэчиллээ.',
        grammar: 'Үг, үсэг, дүрмийн алдааг шалгаж заслаа.',
        shorten: 'Агуулгыг товчлон хураангуйлж шинэчиллээ.',
        expand: 'Агуулгыг дэлгэрүүлэн баяжууллаа.',
      };

      setAiSuccess(successLabels[action] || 'Амжилттай заслаа.');
      setTimeout(() => setAiSuccess(null), 4000);
    } catch (err: any) {
      console.error('AI Action failed:', err);
      setAiError(
        err.message || 'AI боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.'
      );
      setTimeout(() => setAiError(null), 4000);
    } finally {
      setIsAiProcessing(false);
      setActiveAction(null);
    }
  };

  // Undo AI changes
  const handleUndo = () => {
    if (!previousContent) return;
    const restored = sections.map((sec) =>
      sec.id === previousContent.id
        ? { ...sec, content: previousContent.content }
        : sec
    );
    const newParagraphsList = restored.map((s) => s.content);
    onChange({
      documentSections: restored,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
    setPreviousContent(null);
    setAiSuccess('Өмнөх бичвэрийг сэргээлээ.');
    setTimeout(() => setAiSuccess(null), 2500);
  };

  // Recipient auto-formatter helper
  const handleApplyRecipientFormat = () => {
    const formatted = formatRecipientBlock(recipientOrg, recipientTitle, recipientName);
    if (formatted) {
      onChange({ recipient: formatted });
      setShowRecipientBuilder(false);
    }
  };

  // Dynamic Clause/Paragraph management with stable IDs
  const handleAddParagraph = () => {
    const newId = `section-${Date.now()}`;
    const updated = [
      ...sections,
      { id: newId, title: `Заалт §${sections.length + 1}`, content: '' },
    ];
    setSelectedSectionId(newId);
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
  };

  const handleUpdateSection = (id: string, newText: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, content: newText } : sec
    );
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
    });
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    const updated = sections.filter((sec) => sec.id !== id);
    if (activeSectionId === id) {
      setSelectedSectionId(updated[0]?.id || 'section-1');
    }
    const newParagraphsList = updated.map((s) => s.content);
    onChange({
      documentSections: updated,
      paragraphsList: newParagraphsList,
      formalizedText: newParagraphsList.filter(Boolean).join('\n\n'),
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
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                AI Баримт бичгийн туслах
              </span>
              <span className="text-[10px] text-blue-700 font-medium">
                Сонгогдсон: § {sections.findIndex((s) => s.id === activeSectionId) >= 0 ? sections.findIndex((s) => s.id === activeSectionId) + 1 : 1}-р хэсэг ({sections.find((s) => s.id === activeSectionId)?.title || 'Зүйл / Үндэслэл'})
              </span>
            </div>
          </div>

          {/* Tone Selector */}
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value as AiTone)}
            disabled={isAiProcessing}
            className="text-[11px] bg-white border border-blue-200 rounded px-2 py-1 text-slate-700 font-medium disabled:opacity-50"
          >
            <option value="standard">Стандарт албан бичиг</option>
            <option value="government">Төрийн байгууллагад (Хатуу)</option>
            <option value="b2b">Түнш байгууллагад (B2B соёлтой)</option>
            <option value="respectful">Хүндэтгэлтэй (Дипломат)</option>
          </select>
        </div>

        {/* Action Buttons: Exactly 4 distinct actions for selected section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            disabled={isAiProcessing}
            onClick={() => handleAiAction('formalize')}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>
              {isAiProcessing && activeAction === 'formalize'
                ? 'Найруулж байна...'
                : 'Найруулга засах'}
            </span>
          </button>

          <button
            type="button"
            disabled={isAiProcessing}
            onClick={() => handleAiAction('grammar')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <SpellCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {isAiProcessing && activeAction === 'grammar'
                ? 'Шалгаж байна...'
                : 'Алдаа шалгах'}
            </span>
          </button>

          <button
            type="button"
            disabled={isAiProcessing}
            onClick={() => handleAiAction('shorten')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {isAiProcessing && activeAction === 'shorten'
                ? 'Богиносгож байна...'
                : 'Богиносгох'}
            </span>
          </button>

          <button
            type="button"
            disabled={isAiProcessing}
            onClick={() => handleAiAction('expand')}
            className="p-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-slate-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {isAiProcessing && activeAction === 'expand'
                ? 'Дэлгэрүүлж байна...'
                : 'Дэлгэрүүлэх'}
            </span>
          </button>
        </div>

        {/* Status / Errors / Undo */}
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
            {previousContent && (
              <button
                type="button"
                onClick={handleUndo}
                className="text-[11px] text-slate-700 hover:text-slate-900 underline font-semibold cursor-pointer"
              >
                Буцаах
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. DYNAMIC PARAGRAPHS & CLAUSES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Их бие бичвэр & Догол мөрүүд ({sections.length})
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
          {sections.map((sec, idx) => {
            const isSelected = activeSectionId === sec.id;
            const sectionTitle = sec.title || (idx === 0 ? 'Зүйл / Үндэслэл' : `Заалт §${idx + 1}`);
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`p-3 bg-white border rounded-xl shadow-2xs space-y-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/15'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      § {idx + 1}. {sectionTitle}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-blue-700 font-sans font-semibold bg-blue-100/80 px-1.5 py-0.2 rounded">
                        Сонгогдсон хэсэг ✓
                      </span>
                    )}
                  </div>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSection(sec.id);
                      }}
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
                  value={sec.content}
                  onFocus={() => setSelectedSectionId(sec.id)}
                  onChange={(e) => handleUpdateSection(sec.id, e.target.value)}
                  placeholder="Догол мөрийн агуулгыг энд бичнэ үү..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed text-justify"
                />
              </div>
            );
          })}
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

import React, { useState, useEffect } from 'react';
import {
  DocumentData,
  DocumentType,
  TemplateCategory,
  PRESET_TEMPLATES,
  PresetTemplate,
  SavedDocument,
  OrgProfile,
  AppSettings,
  DEFAULT_ORG_PROFILE,
  DEFAULT_APP_SETTINGS,
} from './types/document';
import { Header, AppNavTab } from './components/Header';
import { DocumentForm } from './components/DocumentForm';
import { DocumentPreview } from './components/DocumentPreview';
import { OfficialA4Document } from './components/OfficialA4Document';
import { DashboardView } from './components/DashboardView';
import { DocumentsListView } from './components/DocumentsListView';
import { TemplatesView } from './components/TemplatesView';
import { OrganizationProfileView } from './components/OrganizationProfileView';
import { SettingsView } from './components/SettingsView';
import { NewDocumentModal } from './components/NewDocumentModal';
import {
  generateDocNumber,
  getFormattedMongolianDate,
} from './utils/documentUtils';

// Seed sample documents for initial experience
const SEED_DOCUMENTS: SavedDocument[] = [
  {
    id: 'seed-doc-1',
    title: '«Монгол Шуудан» ХК-д хамтран ажиллах албан тоот',
    category: 'corporate_letter',
    docType: 'АЛБАН ТООТ',
    documentNumber: 'АБ-2026-108',
    date: '2026.09.29',
    updatedAt: '2026.09.29',
    status: 'completed',
    data: {
      mode: 'corporate',
      docType: 'АЛБАН ТООТ',
      recipient: '«Монгол Шуудан» ХК-ийн Мэдээллийн технологийн газрын захирал Ц.Мөнхбат танаа',
      sender: '«Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр',
      senderPhone: '7711-0099',
      senderRegister: '5412980',
      date: '2026 оны 09 дүгээр сарын 29',
      city: 'Улаанбаатар хот',
      duration: '',
      roughText: 'Манай хоёр байгууллагын хооронд цахим системийн интеграцчлалын ажил явагдаж байгаа. Туршилтын орчны холболт дууссан тул бодит орчны серверийн тохиргоо, API түлхүүрийг шилжүүлж өгөхийг хүсье.',
      formalizedText: 'Энэхүү албан бичгээр танай хамт олонд энэ өдрийн мэндийг дэвшүүлж, цаашдын ажил үйлсэд тань өндөр амжилт хүсье.\n\nМанай хоёр байгууллагын хооронд байгуулсан хамтран ажиллах санамж бичгийн хүрээнд хийгдэж буй цахим үйлчилгээний туршилтын орчны интеграцийн ажил амжилттай дууслаа.\n\nИймд систем хөгжүүлэлтийн дараагийн шат буюу бодит (Production) орчны серверийн холболт, API түлхүүрийг 2026 оны 10 дугаар сарын 10-ны өдрийн дотор шилжүүлэн өгч хамтран ажиллана уу.\n\nЦаашид хамтын ажиллагаа улам бүр өргөжин хөгжинө гэдэгт гүнээ итгэж байна.',
      fontFamily: 'serif',
      fontSize: 'base',
      showDottedLine: true,
      officialStamp: true,
      companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
      companyNameEn: 'ARVIN TECHNOLOGY LLC',
      companyRegister: '5412980',
      companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
      companyPhone: '7711-0099, 9911-2233',
      companyEmail: 'contact@arvintech.mn',
      companyWebsite: 'www.arvintech.mn',
      documentNumber: 'АБ-2026-108',
      signatoryTitle: 'Гүйцэтгэх захирал',
      signatoryName: 'Б.Батбаяр',
    },
  },
  {
    id: 'seed-doc-2',
    title: 'Тээврийн хэрэгслийн итгэмжлэл',
    category: 'poa',
    docType: 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ',
    documentNumber: 'ИТ-26/05',
    date: '2026.09.29',
    updatedAt: '2026.09.29',
    status: 'draft',
    data: {
      mode: 'corporate',
      docType: 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ',
      recipient: '',
      sender: 'Б.Батбаяр',
      date: '2026 оны 09 дүгээр сарын 29',
      city: 'Улаанбаатар хот',
      roughText: 'Компанийн эзэмшлийн Toyota Land Cruiser 200 маркийн тээврийн хэрэгслийг жолоодох эрх олгох итгэмжлэл.',
      formalizedText: 'Монгол Улсын Иргэний хуулийн 62, 64 дүгээр зүйлийг үндэслэн «Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр нь менежер Э.Тэмүүлэнд компанийн өмчлөлийн Toyota Land Cruiser маркийн 12-34 УБ улсын дугаартай тээврийн хэрэгслийг албан ажлын зориулалтаар жолоодох бүрэн эрхийг үүгээр олгож байна.',
      fontFamily: 'serif',
      fontSize: 'base',
      companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
      companyNameEn: 'ARVIN TECHNOLOGY LLC',
      companyRegister: '5412980',
      companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо',
      companyPhone: '7711-0099',
      companyEmail: 'contact@arvintech.mn',
      documentNumber: 'ИТ-26/05',
      grantorName: 'Б.Батбаяр',
      grantorRegister: 'УХ85011234',
      attorneyName: 'Э.Тэмүүлэн',
      attorneyRegister: 'УШ92051678',
      attorneyPhone: '9988-7766',
      poaDuration: '2027 оны 09 дүгээр сарын 29 хүртэл 1 жилийн хугацаатай',
      officialStamp: true,
      showSecondParty: true,
      secondSignatoryTitle: 'Итгэмжлэгдэгч',
      secondSignatoryName: 'Э.Тэмүүлэн',
      secondSignatoryRegister: 'УШ92051678',
    },
  },
  {
    id: 'seed-doc-3',
    title: 'Ээлжийн амралт авах тухай өргөдөл',
    category: 'application',
    docType: 'ӨРГӨДӨЛ',
    documentNumber: 'ӨР-2026-034',
    date: '2026.09.28',
    updatedAt: '2026.09.28',
    status: 'completed',
    data: {
      mode: 'personal',
      docType: 'ӨРГӨДӨЛ',
      recipient: '«Арвин Технологи» ХХК-ийн Хүний нөөцийн хэлтсийн дарга Н.Энхтуяа танаа',
      sender: 'Мэдээллийн ажилтан Д.Болд',
      senderPhone: '8811-2244',
      senderRegister: 'УП90010111',
      date: '2026 оны 09 дүгээр сарын 28',
      city: 'Улаанбаатар хот',
      duration: '2026.10.01 - 2026.10.21',
      roughText: '2026 оны ээлжийн амралтаа 10-р сарын 1-нээс 21-ний хооронд эдэлмээр байна. Ажлаа С.Ганзоригт хүлээлгэж өгнө.',
      formalizedText: 'Миний бие Д.Болд нь 2026 оны хуваарийн дагуу ээлжийн амралтаа 2026 оны 10 дугаар сарын 01-ний өдрөөс 10 дугаар сарын 21-ний өдрийг дуустал ажлын 15 хоногийн хугацаатайгаар авах хүсэлтэй байна.\n\nАмралтын хугацаанд гүйцэтгэх өдөр тутмын ажил үүргийг тус хэлтсийн ажилтан С.Ганзоригт бүрэн хүлээлгэн өгсөн болно.\n\nИймд миний хүсэлтийг хүлээн авч, зохих журмын дагуу шийдвэрлэж өгнө үү.',
      fontFamily: 'serif',
      fontSize: 'base',
      showDottedLine: true,
      officialStamp: false,
    },
  },
];

export default function App() {
  // Navigation: 'dashboard' | 'editor' | 'documents' | 'templates' | 'org' | 'settings'
  const [currentNavTab, setCurrentNavTab] = useState<AppNavTab>('dashboard');

  // Mobile editor tab: 'edit' | 'preview'
  const [mobileEditorTab, setMobileEditorTab] = useState<'edit' | 'preview'>('edit');

  // Organization profile (persisted in localStorage)
  const [orgProfile, setOrgProfile] = useState<OrgProfile>(() => {
    const saved = localStorage.getItem('alban_bichig_org_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved org profile:', e);
      }
    }
    return DEFAULT_ORG_PROFILE;
  });

  // App Settings (persisted in localStorage)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('alban_bichig_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    return DEFAULT_APP_SETTINGS;
  });

  // Saved documents list (persisted in localStorage)
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>(() => {
    const saved = localStorage.getItem('alban_bichig_saved_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved documents:', e);
      }
    }
    return SEED_DOCUMENTS;
  });

  // Current active document data in editor
  const [activeDocId, setActiveDocId] = useState<string>(() => SEED_DOCUMENTS[0].id);
  const [documentData, setDocumentData] = useState<DocumentData>(() => SEED_DOCUMENTS[0].data);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // New Document Modal state
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState<boolean>(false);
  const [modalInitialCategory, setModalInitialCategory] = useState<TemplateCategory | undefined>(undefined);

  // Save to localStorage when savedDocuments change
  useEffect(() => {
    try {
      localStorage.setItem('alban_bichig_saved_docs', JSON.stringify(savedDocuments));
    } catch (e) {
      console.error('Error saving documents to localStorage:', e);
    }
  }, [savedDocuments]);

  // Save org profile to localStorage
  const handleSaveOrgProfile = (profile: OrgProfile) => {
    setOrgProfile(profile);
    try {
      localStorage.setItem('alban_bichig_org_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving org profile:', e);
    }
  };

  // Apply org profile to current document
  const handleApplyOrgProfileToDoc = () => {
    setDocumentData((prev) => ({
      ...prev,
      companyName: orgProfile.companyName || prev.companyName,
      companyNameEn: orgProfile.companyNameEn || prev.companyNameEn,
      companyLogo: orgProfile.companyLogo || prev.companyLogo,
      companyRegister: orgProfile.companyRegister || prev.companyRegister,
      companyAddress: orgProfile.companyAddress || prev.companyAddress,
      companyPhone: orgProfile.companyPhone || prev.companyPhone,
      companyEmail: orgProfile.companyEmail || prev.companyEmail,
      companyWebsite: orgProfile.companyWebsite || prev.companyWebsite,
      signatoryTitle: orgProfile.signatoryTitle || prev.signatoryTitle,
      signatoryName: orgProfile.signatoryName || prev.signatoryName,
    }));
  };

  // Save settings to localStorage
  const handleSaveSettings = (settings: AppSettings) => {
    setAppSettings(settings);
    try {
      localStorage.setItem('alban_bichig_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  // Update current document data and auto-sync to savedDocuments list
  const handleUpdate = (updated: Partial<DocumentData>) => {
    setIsSaving(true);
    setDocumentData((prev) => {
      const nextData: DocumentData = {
        ...prev,
        ...updated,
      };

      // Auto update in savedDocuments list
      setSavedDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.id === activeDocId) {
            return {
              ...doc,
              title: nextData.title || nextData.docType || doc.title,
              docType: nextData.docType || doc.docType,
              documentNumber: nextData.documentNumber || doc.documentNumber,
              updatedAt: getFormattedMongolianDate(new Date(), 'numeric'),
              data: nextData,
            };
          }
          return doc;
        })
      );

      setTimeout(() => setIsSaving(false), 500);
      return nextData;
    });
  };

  // Generate next document number based on settings
  const handleGenerateNextNumber = () => {
    const nextNumber = generateDocNumber(
      appSettings.numberingPrefix,
      appSettings.numberingYear,
      appSettings.numberingCounter
    );
    handleUpdate({ documentNumber: nextNumber });

    // Increment setting counter
    setAppSettings((prev) => {
      const nextSettings = {
        ...prev,
        numberingCounter: prev.numberingCounter + 1,
      };
      localStorage.setItem('alban_bichig_settings', JSON.stringify(nextSettings));
      return nextSettings;
    });
  };

  // Open existing document
  const handleOpenDocument = (doc: SavedDocument) => {
    setActiveDocId(doc.id);
    setDocumentData(doc.data);
    setCurrentNavTab('editor');
  };

  // Duplicate an existing document
  const handleDuplicateDocument = (doc: SavedDocument) => {
    const newId = `doc-${Date.now()}`;
    const duplicated: SavedDocument = {
      ...doc,
      id: newId,
      title: `${doc.title} (Хуулбар)`,
      date: getFormattedMongolianDate(new Date(), 'numeric'),
      updatedAt: getFormattedMongolianDate(new Date(), 'numeric'),
      status: 'draft',
      data: {
        ...doc.data,
        id: newId,
        title: `${doc.title} (Хуулбар)`,
      },
    };

    setSavedDocuments((prev) => [duplicated, ...prev]);
    setActiveDocId(newId);
    setDocumentData(duplicated.data);
    setCurrentNavTab('editor');
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    setSavedDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (id === activeDocId && remaining.length > 0) {
        setActiveDocId(remaining[0].id);
        setDocumentData(remaining[0].data);
      }
      return remaining;
    });
  };

  // Apply a preset template
  const handleApplyPreset = (preset: PresetTemplate) => {
    const newDocId = `doc-${Date.now()}`;
    const today = getFormattedMongolianDate(new Date(), appSettings.dateFormat);
    const docNum =
      preset.documentNumber ||
      generateDocNumber(
        appSettings.numberingPrefix,
        appSettings.numberingYear,
        appSettings.numberingCounter
      );

    const newDocData: DocumentData = {
      id: newDocId,
      title: preset.title,
      mode: preset.mode,
      docType: preset.docType,
      recipient: preset.recipient || '',
      sender:
        preset.sender ||
        (preset.mode === 'corporate' ? orgProfile.signatoryName : ''),
      senderPhone:
        preset.senderPhone ||
        (preset.mode === 'corporate' ? orgProfile.companyPhone : ''),
      senderRegister:
        preset.senderRegister ||
        (preset.mode === 'corporate' ? orgProfile.companyRegister : ''),
      date: today,
      city: 'Улаанбаатар хот',
      duration: preset.duration || '',
      roughText: preset.roughText,
      formalizedText: preset.formalizedText,
      paragraphsList: preset.paragraphsList || [],
      customFields: preset.customFields || [],
      attachments: preset.attachments || [],
      fontFamily: 'serif',
      fontSize: 'base',
      showDottedLine: true,
      officialStamp:
        preset.officialStamp !== undefined
          ? preset.officialStamp
          : preset.mode === 'corporate',
      showCompanyHeader:
        preset.showCompanyHeader ?? preset.mode === 'corporate',
      showDocNumber: preset.showDocNumber ?? preset.mode === 'corporate',
      showRecipient: preset.showRecipient ?? true,
      showDateLocation: preset.showDateLocation ?? true,
      showSecondParty: preset.showSecondParty ?? false,
      showAttachments: preset.showAttachments ?? false,

      // Company info
      companyName:
        orgProfile.companyName || preset.companyName || '«АРВИН ТЕХНОЛОГИ» ХХК',
      companyNameEn:
        orgProfile.companyNameEn || preset.companyNameEn || 'ARVIN TECHNOLOGY LLC',
      companyLogo: orgProfile.companyLogo || '',
      companyRegister:
        orgProfile.companyRegister || preset.companyRegister || '5412980',
      companyAddress:
        orgProfile.companyAddress || preset.companyAddress || 'Улаанбаатар хот',
      companyPhone:
        orgProfile.companyPhone || preset.companyPhone || '7711-0099',
      companyEmail:
        orgProfile.companyEmail || preset.companyEmail || 'contact@arvintech.mn',
      companyWebsite:
        orgProfile.companyWebsite || preset.companyWebsite || 'www.arvintech.mn',
      documentNumber: docNum,
      signatoryTitle:
        preset.signatoryTitle ||
        orgProfile.signatoryTitle ||
        'Гүйцэтгэх захирал',
      signatoryName:
        preset.signatoryName || orgProfile.signatoryName || 'Б.Батбаяр',

      // Specialized fields
      actItems: preset.actItems || [],
      quoteItems: preset.quoteItems || [],
      handoverLocation: preset.handoverLocation || '',
      grantorName:
        preset.grantorName ||
        (preset.mode === 'corporate' ? orgProfile.signatoryName : ''),
      grantorRegister:
        preset.grantorRegister ||
        (preset.mode === 'corporate' ? orgProfile.companyRegister : ''),
      attorneyName: preset.attorneyName || '',
      attorneyRegister: preset.attorneyRegister || '',
      attorneyPhone: preset.attorneyPhone || '',
      poaDuration: preset.poaDuration || '',
      poaScope: preset.poaScope || [],
      vehiclePlate: preset.vehiclePlate || '',
      vehicleModel: preset.vehicleModel || '',
      vehicleVin: preset.vehicleVin || '',
      meetingTitle: preset.meetingTitle || '',
      meetingChairperson:
        preset.meetingChairperson ||
        (preset.mode === 'corporate' ? orgProfile.signatoryName : ''),
      meetingSecretary: preset.meetingSecretary || '',
      meetingAttendees: preset.meetingAttendees || '',
      meetingAgenda: preset.meetingAgenda || '',
      meetingDecisions: preset.meetingDecisions || '',
      meetingActionItems: preset.meetingActionItems || [],
      memoSubject: preset.memoSubject || '',
      memoAttachmentsCount: preset.memoAttachmentsCount || '',
      employeeName: preset.employeeName || '',
      employeePosition: preset.employeePosition || '',
      infractionDescription: preset.infractionDescription || '',
      disciplinaryActionType: preset.disciplinaryActionType || '',
      legalBasis: preset.legalBasis || '',
      paymentAmountNumber: preset.paymentAmountNumber || '',
      paymentAmountWords: preset.paymentAmountWords || '',
      paymentDueDate: preset.paymentDueDate || '',
      secondSignatoryTitle: preset.secondSignatoryTitle || '',
      secondSignatoryName: preset.secondSignatoryName || '',
      secondSignatoryRegister: preset.secondSignatoryRegister || '',
    };

    const newDoc: SavedDocument = {
      id: newDocId,
      title: preset.title,
      category: preset.category,
      docType: preset.docType,
      documentNumber: docNum,
      date: getFormattedMongolianDate(new Date(), 'numeric'),
      updatedAt: getFormattedMongolianDate(new Date(), 'numeric'),
      status: 'draft',
      data: newDocData,
    };

    setSavedDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDocId);
    setDocumentData(newDocData);
    setIsNewDocModalOpen(false);
    setCurrentNavTab('editor');
  };

  // Create new blank document of specific type
  const handleSelectDocTypeFromModal = (
    type: DocumentType | string,
    category: TemplateCategory
  ) => {
    // Check if there is a preset for this type
    const foundPreset = PRESET_TEMPLATES.find((p) => p.docType === type);
    if (foundPreset) {
      handleApplyPreset(foundPreset);
      return;
    }

    const isCorporate = [
      'corporate_letter',
      'contract',
      'internal',
      'handover',
    ].includes(category);
    const newDocId = `doc-${Date.now()}`;
    const today = getFormattedMongolianDate(new Date(), appSettings.dateFormat);
    const docNum = generateDocNumber(
      appSettings.numberingPrefix,
      appSettings.numberingYear,
      appSettings.numberingCounter
    );

    const newDocData: DocumentData = {
      id: newDocId,
      title: `${type}`,
      mode: isCorporate ? 'corporate' : 'personal',
      docType: type,
      recipient: '',
      sender: isCorporate ? orgProfile.signatoryName : '',
      senderPhone: isCorporate ? orgProfile.companyPhone : '',
      senderRegister: isCorporate ? orgProfile.companyRegister : '',
      date: today,
      city: 'Улаанбаатар хот',
      duration: '',
      roughText: '',
      formalizedText: '',
      paragraphsList: [''],
      customFields: [],
      attachments: [],
      fontFamily: 'serif',
      fontSize: 'base',
      showDottedLine: true,
      officialStamp: isCorporate,
      showCompanyHeader: isCorporate,
      showDocNumber: isCorporate,
      showRecipient: true,
      showDateLocation: true,
      showSecondParty: false,
      showAttachments: false,
      companyName: orgProfile.companyName,
      companyNameEn: orgProfile.companyNameEn,
      companyLogo: orgProfile.companyLogo,
      companyRegister: orgProfile.companyRegister,
      companyAddress: orgProfile.companyAddress,
      companyPhone: orgProfile.companyPhone,
      companyEmail: orgProfile.companyEmail,
      companyWebsite: orgProfile.companyWebsite,
      documentNumber: docNum,
      signatoryTitle: orgProfile.signatoryTitle || 'Гүйцэтгэх захирал',
      signatoryName: orgProfile.signatoryName || '',
    };

    const newDoc: SavedDocument = {
      id: newDocId,
      title: `${type}`,
      category,
      docType: type,
      documentNumber: docNum,
      date: getFormattedMongolianDate(new Date(), 'numeric'),
      updatedAt: getFormattedMongolianDate(new Date(), 'numeric'),
      status: 'draft',
      data: newDocData,
    };

    setSavedDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDocId);
    setDocumentData(newDocData);
    setIsNewDocModalOpen(false);
    setCurrentNavTab('editor');
  };

  const handleResetDocument = () => {
    setDocumentData((prev) => ({
      ...prev,
      roughText: '',
      formalizedText: '',
      paragraphsList: [''],
      customFields: [],
      attachments: [],
      actItems: [],
      quoteItems: [],
      meetingActionItems: [],
    }));
  };

  // Robust print handler ensuring fonts and images are ready before triggering Chrome print
  const handlePrint = async () => {
    // Mark current document as printed
    setSavedDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId ? { ...doc, status: 'printed' } : doc
      )
    );

    // Wait for document fonts to be ready
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading wait skipped:', e);
      }
    }

    // Wait for images in print root to finish loading if any
    const images = Array.from(
      document.querySelectorAll('#print-root img')
    ) as HTMLImageElement[];

    if (images.length > 0) {
      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(true);
              else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
              }
            })
        )
      );
    }

    requestAnimationFrame(() => {
      window.print();
    });
  };

  const openNewDocModal = (category?: TemplateCategory) => {
    setModalInitialCategory(category);
    setIsNewDocModalOpen(true);
  };

  return (
    <>
      {/* ================= SCREEN USER INTERFACE (Hidden during print) ================= */}
      <div className="no-print min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Top Application Header Navigation */}
        <Header
          currentTab={currentNavTab}
          onSelectTab={setCurrentNavTab}
          onNewDocument={() => openNewDocModal()}
          onPrint={handlePrint}
          savedCount={savedDocuments.length}
          isSaving={isSaving}
          activeDocTitle={documentData.title || documentData.docType}
        />

        {/* Main App Content Body */}
        <main className="flex-1 w-full mx-auto p-3 sm:p-6 lg:p-8">
          {/* VIEW 1: Dashboard */}
          {currentNavTab === 'dashboard' && (
            <DashboardView
              documents={savedDocuments}
              onOpenDocument={handleOpenDocument}
              onDuplicateDocument={handleDuplicateDocument}
              onDeleteDocument={handleDeleteDocument}
              onNewDocument={() => openNewDocModal()}
              onSelectCategory={(cat) => openNewDocModal(cat)}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {/* VIEW 2: Document Editor (Two Column Layout + A4 Live Preview) */}
          {currentNavTab === 'editor' && (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form Controls */}
                <div
                  className={`lg:col-span-6 xl:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 sm:p-6 ${
                    mobileEditorTab === 'preview' ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <DocumentForm
                    data={documentData}
                    onChange={handleUpdate}
                    onApplyPreset={handleApplyPreset}
                    onReset={handleResetDocument}
                    orgProfile={orgProfile}
                    appSettings={appSettings}
                    onGenerateNextNumber={handleGenerateNextNumber}
                  />

                  {/* Mobile switch to preview CTA */}
                  <div className="lg:hidden mt-6 pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMobileEditorTab('preview')}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Баримтыг А4 хэлбэрээр харах →</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Live A4 Document Preview */}
                <div
                  className={`lg:col-span-6 xl:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden ${
                    mobileEditorTab === 'edit' ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <DocumentPreview
                    data={documentData}
                    onPrint={handlePrint}
                    onUpdateFont={(fontFamily, fontSize) =>
                      handleUpdate({ fontFamily, fontSize })
                    }
                    onToggleStamp={() =>
                      handleUpdate({
                        officialStamp: !documentData.officialStamp,
                      })
                    }
                    onChange={handleUpdate}
                  />
                </div>
              </div>

              {/* Floating Action Button on Mobile when viewing form to quickly jump to preview */}
              <div className="lg:hidden fixed bottom-4 right-4 z-40">
                <button
                  type="button"
                  onClick={() =>
                    setMobileEditorTab((prev) =>
                      prev === 'edit' ? 'preview' : 'edit'
                    )
                  }
                  className="shadow-lg px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-medium flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  {mobileEditorTab === 'edit' ? (
                    <>
                      <span>👁️ А4 Харах</span>
                    </>
                  ) : (
                    <>
                      <span>✏️ Засварлах</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: My Documents (Миний баримтууд) */}
          {currentNavTab === 'documents' && (
            <DocumentsListView
              documents={savedDocuments}
              onOpenDocument={handleOpenDocument}
              onDuplicateDocument={handleDuplicateDocument}
              onDeleteDocument={handleDeleteDocument}
              onNewDocument={() => openNewDocModal()}
            />
          )}

          {/* VIEW 4: Templates (Загварууд) */}
          {currentNavTab === 'templates' && (
            <TemplatesView onApplyPreset={handleApplyPreset} />
          )}

          {/* VIEW 5: Organization Profile (Байгууллагын мэдээлэл) */}
          {currentNavTab === 'org' && (
            <OrganizationProfileView
              profile={orgProfile}
              onSaveProfile={handleSaveOrgProfile}
              onApplyToCurrentDoc={handleApplyOrgProfileToDoc}
            />
          )}

          {/* VIEW 6: Settings (Тохиргоо) */}
          {currentNavTab === 'settings' && (
            <SettingsView
              settings={appSettings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>

        {/* New Document Modal with Categories & Templates */}
        <NewDocumentModal
          isOpen={isNewDocModalOpen}
          onClose={() => setIsNewDocModalOpen(false)}
          onSelectDocType={handleSelectDocTypeFromModal}
          onApplyPreset={handleApplyPreset}
          initialCategory={modalInitialCategory}
        />
      </div>

      {/* ================= DEDICATED PRINT ROOT (Always in DOM, visible ONLY in print) ================= */}
      <div id="print-root" className="print-only">
        <OfficialA4Document data={documentData} isPrintMode={true} />
      </div>
    </>
  );
}

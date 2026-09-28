import React, { useState } from 'react';
import {
  DocumentData,
  DocumentType,
  DocumentMode,
  PRESET_TEMPLATES,
  PresetTemplate,
} from './types/document';
import { Header } from './components/Header';
import { DocumentForm } from './components/DocumentForm';
import { DocumentPreview } from './components/DocumentPreview';

// Helper to format today's date in Mongolian format
const getFormattedMongolianDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year} оны ${month} дугаар сарын ${day}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [documentData, setDocumentData] = useState<DocumentData>({
    mode: 'corporate', // Default to corporate or personal
    docType: 'АЛБАН ТООТ',
    recipient: '«Монгол Шуудан» ХК-ийн Мэдээллийн технологийн газрын захирал Ц.Мөнхбат танаа',
    sender: '«Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр',
    senderPhone: '7711-0099',
    senderRegister: '5412980',
    date: getFormattedMongolianDate(),
    city: 'Улаанбаатар хот',
    duration: '',
    roughText:
      'Манай хоёр байгууллагын хооронд цахим системийн интеграцчлалын ажил явагдаж байгаа. Туршилтын орчны холболт дууссан тул бодит орчны серверийн тохиргоо, API түлхүүрийг шилжүүлж өгөхийг хүсье.',
    formalizedText:
      'Энэхүү албан бичгээр танай хамт олонд энэ өдрийн мэндийг дэвшүүлж, цаашдын ажил үйлсэд тань өндөр амжилт хүсье.\n\nМанай хоёр байгууллагын хооронд байгуулсан 2026 оны хамтран ажиллах санамж бичгийн хүрээнд хийгдэж буй "Цахим үйлчилгээний нэгдсэн систем"-ийн туршилтын (Sandbox) орчны интеграцийн ажил бүрэн амжилттай хийгдэж дууссан болохыг мэдэгдэж байна.\n\nИймд систем хөгжүүлэлтийн дараагийн шат буюу бодит (Production) орчны серверийн тохиргоо, холболтын API түлхүүрүүд болон аюулгүй байдлын протоколыг 2026 оны 10 дугаар сарын 10-ны өдрийн дотор манай техникийн багт шилжүүлэн өгч хамтран ажиллана уу.\n\nЦаашид хамтын ажиллагаа улам бүр өргөжин хөгжинө гэдэгт гүнээ итгэж байна.',
    signatureDataUrl: '',
    fontFamily: 'serif',
    fontSize: 'base',
    showDottedLine: true,
    officialStamp: true,

    // Corporate fields
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
    companyPhone: '7711-0099, 9911-2233',
    companyEmail: 'contact@arvintech.mn',
    companyWebsite: 'www.arvintech.mn',
    documentNumber: '26/108',
    signatoryTitle: 'Гүйцэтгэх захирал',
    signatoryName: 'Б.Батбаяр',
  });

  const handleUpdate = (updated: Partial<DocumentData>) => {
    setDocumentData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleApplyPreset = (preset: PresetTemplate) => {
    setDocumentData((prev) => ({
      ...prev,
      mode: preset.mode,
      docType: preset.docType,
      recipient: preset.recipient,
      sender: preset.sender,
      senderPhone: preset.senderPhone || '',
      senderRegister: preset.senderRegister || '',
      duration: preset.duration || '',
      roughText: preset.roughText,
      formalizedText: preset.formalizedText,
      companyName: preset.companyName || prev.companyName,
      companyNameEn: preset.companyNameEn || prev.companyNameEn,
      companyRegister: preset.companyRegister || prev.companyRegister,
      companyAddress: preset.companyAddress || prev.companyAddress,
      companyPhone: preset.companyPhone || prev.companyPhone,
      companyEmail: preset.companyEmail || prev.companyEmail,
      companyWebsite: preset.companyWebsite || prev.companyWebsite,
      documentNumber: preset.documentNumber || prev.documentNumber,
      signatoryTitle: preset.signatoryTitle || prev.signatoryTitle,
      signatoryName: preset.signatoryName || prev.signatoryName,
      officialStamp: preset.officialStamp !== undefined ? preset.officialStamp : prev.officialStamp,

      // Specialized fields
      actItems: preset.actItems || [],
      handoverLocation: preset.handoverLocation || '',
      grantorName: preset.grantorName || '',
      grantorRegister: preset.grantorRegister || '',
      attorneyName: preset.attorneyName || '',
      attorneyRegister: preset.attorneyRegister || '',
      attorneyPhone: preset.attorneyPhone || '',
      poaDuration: preset.poaDuration || '',
      poaScope: preset.poaScope || [],
      vehiclePlate: preset.vehiclePlate || '',
      vehicleModel: preset.vehicleModel || '',
      vehicleVin: preset.vehicleVin || '',
      meetingTitle: preset.meetingTitle || '',
      meetingChairperson: preset.meetingChairperson || '',
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
    }));
  };

  const handleReset = () => {
    setDocumentData({
      mode: 'personal',
      docType: 'ӨРГӨДӨЛ',
      recipient: '',
      sender: '',
      senderPhone: '',
      senderRegister: '',
      date: getFormattedMongolianDate(),
      city: 'Улаанбаатар хот',
      duration: '',
      roughText: '',
      formalizedText: '',
      signatureDataUrl: '',
      secondSignatureDataUrl: '',
      fontFamily: 'serif',
      fontSize: 'base',
      showDottedLine: true,
      officialStamp: false,
      companyName: '',
      companyNameEn: '',
      companyLogo: '',
      companyRegister: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyWebsite: '',
      documentNumber: '',
      signatoryTitle: 'Гүйцэтгэх захирал',
      signatoryName: '',
      secondSignatoryTitle: '',
      secondSignatoryName: '',
      secondSignatoryRegister: '',
      actItems: [],
      grantorName: '',
      grantorRegister: '',
      attorneyName: '',
      attorneyRegister: '',
      poaDuration: '',
      vehiclePlate: '',
      meetingTitle: '',
      meetingChairperson: '',
      meetingSecretary: '',
      meetingAttendees: '',
      meetingAgenda: '',
      meetingDecisions: '',
      meetingActionItems: [],
      memoSubject: '',
      paymentAmountNumber: '',
      paymentAmountWords: '',
      paymentDueDate: '',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        onPrint={handlePrint}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
        {/* Desktop Layout: Split View / Mobile Layout: Tabbed View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
          {/* Left Column: Form & Signature */}
          <div
            className={`lg:col-span-6 xl:col-span-5 bg-white border border-slate-200/80 rounded-xl shadow-xs p-4 sm:p-6 no-print ${
              activeTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DocumentForm
              data={documentData}
              onChange={handleUpdate}
              onApplyPreset={handleApplyPreset}
              onReset={handleReset}
            />

            {/* Mobile switch to preview CTA */}
            <div className="lg:hidden mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Баримтыг А4 хэлбэрээр урьдчилан харах →</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live A4 Document Preview */}
          <div
            className={`lg:col-span-6 xl:col-span-7 bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:rounded-none ${
              activeTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DocumentPreview
              data={documentData}
              onPrint={handlePrint}
              onUpdateFont={(fontFamily, fontSize) =>
                handleUpdate({ fontFamily, fontSize })
              }
              onToggleStamp={() =>
                handleUpdate({ officialStamp: !documentData.officialStamp })
              }
              onChange={handleUpdate}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Button on Mobile when viewing form to quickly jump to preview */}
      <div className="lg:hidden no-print fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() =>
            setActiveTab((prev) => (prev === 'edit' ? 'preview' : 'edit'))
          }
          className="shadow-lg px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-medium flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          {activeTab === 'edit' ? (
            <>
              <span>👁️ А4 Харах</span>
            </>
          ) : (
            <>
              <span>✏️ Маягт засах</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

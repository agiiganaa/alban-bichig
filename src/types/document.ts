export type DocumentType =
  // Өргөдөл, хүсэлт
  | 'ӨРГӨДӨЛ'
  | 'ХҮСЭЛТ'
  | 'ГОМДОЛ'
  | 'САНАЛ'
  | 'ТАЙЛБАР'
  // Албан бичиг
  | 'АЛБАН ТООТ'
  | 'ХАРИУ АЛБАН БИЧИГ'
  | 'МЭДЭГДЭЛ'
  | 'МЭДЭЭЛЭЛ ХҮРГҮҮЛЭХ АЛБАН БИЧИГ'
  | 'ТОДОРХОЙЛОЛТ'
  // Итгэмжлэл
  | 'ЕРӨНХИЙ ИТГЭМЖЛЭЛ'
  | 'ИТГЭМЖЛЭЛ'
  | 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ'
  | 'ТӨЛӨӨЛӨХ ЭРХИЙН ИТГЭМЖЛЭЛ'
  | 'САНХҮҮГИЙН ИТГЭМЖЛЭЛ'
  // Гэрээ
  | 'ТҮРЭЭСИЙН ГЭРЭЭ'
  | 'ХУДАЛДАХ ХУДАЛДАН АВАХ ГЭРЭЭ'
  | 'ҮЙЛЧИЛГЭЭНИЙ ГЭРЭЭ'
  | 'АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ'
  | 'ХАМТРАН АЖИЛЛАХ ГЭРЭЭ'
  // Акт
  | 'ХҮЛЭЭЛЦЭХ АКТ'
  | 'АЖИЛ ХҮЛЭЭЛЦЭХ АКТ'
  | 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ'
  | 'ТООЛЛОГЫН АКТ'
  // Дотоод баримт
  | 'ДОТООД САНАМЖ БИЧИГ'
  | 'ХУРЛЫН ТЭМДЭГЛЭЛ'
  | 'ҮҮРЭГ ДААЛГАВАР'
  | 'ТАНИЛЦУУЛГА'
  // Бусад
  | 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС'
  | 'ШААРДАХ БИЧИГ'
  | 'ТӨЛБӨР ТӨЛӨХ ХҮСЭЛТ'
  | 'ЧӨЛӨӨ АВАХ ӨРГӨДӨЛ'
  | 'АЖЛЫН ГАЗРЫН ТОДОРХОЙЛОЛТ'
  | 'ҮНИЙН САНАЛ'
  | 'САХИЛГЫН ШИЙТГЭЛИЙН МЭДЭГДЭХ ХУУДАС';

export type DocumentMode = 'personal' | 'corporate';

export type TemplateCategory =
  | 'application' // Өргөдөл, хүсэлт
  | 'corporate_letter' // Албан бичиг
  | 'poa' // Итгэмжлэл
  | 'contract' // Гэрээ
  | 'handover' // Акт
  | 'internal' // Дотоод баримт
  | 'other'; // Бусад

export type AiTone = 'government' | 'b2b' | 'respectful' | 'standard';

export interface ActItem {
  id: string;
  name: string;
  quantity: string;
  condition: string;
  notes: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  notes?: string;
}

export interface MeetingActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export interface DocumentData {
  id?: string;
  title?: string;
  mode: DocumentMode;
  docType: DocumentType | string;
  status?: 'draft' | 'completed' | 'printed';

  // Common / general fields
  recipient: string;
  recipientOrg?: string;
  recipientTitle?: string;
  recipientName?: string;
  sender: string;
  senderPhone?: string;
  senderRegister?: string;
  date: string;
  city: string;
  duration?: string;
  roughText: string;
  formalizedText: string;

  // Typography & Styling (Word-like)
  fontFamily: 'serif' | 'sans';
  fontSize: 'sm' | 'base' | 'lg';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: '1.4' | '1.6' | '1.8' | '2.0';
  pageNumberStyle?: 'none' | 'hyphen' | 'fraction';
  showDottedLine?: boolean;

  // Signature
  signatureDataUrl?: string;
  signatureScale?: number;
  secondSignatoryTitle?: string;
  secondSignatoryName?: string;
  secondSignatoryRegister?: string;
  secondSignatoryPhone?: string;
  secondSignatureDataUrl?: string;
  secondSignatureScale?: number;

  // Stamp
  officialStamp?: boolean;
  stampImage?: string;
  stampScale?: number;
  stampRotation?: number;
  stampOpacity?: number;

  // Corporate / Company Letterhead specific fields
  companyName?: string;
  companyNameEn?: string;
  companyLogo?: string;
  companyRegister?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  documentNumber?: string;
  referencedDocNumber?: string;
  signatoryTitle?: string;
  signatoryName?: string;

  // Handover Act specific
  handoverLocation?: string;
  handoverCommission?: string;
  actItems?: ActItem[];

  // Price Quotation specific
  quoteItems?: QuoteItem[];

  // Power of Attorney (Итгэмжлэл) specific
  grantorName?: string;
  grantorRegister?: string;
  grantorAddress?: string;
  attorneyName?: string;
  attorneyRegister?: string;
  attorneyPhone?: string;
  poaDuration?: string;
  poaScope?: string[];
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleVin?: string;

  // Contract specific
  contractSubject?: string;
  contractAmount?: string;
  contractTerm?: string;
  contractFirstParty?: string;
  contractSecondParty?: string;

  // Meeting Minutes (Хурлын тэмдэглэл) specific
  meetingTitle?: string;
  meetingChairperson?: string;
  meetingSecretary?: string;
  meetingAttendees?: string;
  meetingAgenda?: string;
  meetingDecisions?: string;
  meetingActionItems?: MeetingActionItem[];

  // Internal Memo specific
  memoSubject?: string;
  memoAttachmentsCount?: string;

  // Disciplinary Notice specific
  employeeName?: string;
  employeePosition?: string;
  infractionDescription?: string;
  disciplinaryActionType?: string;
  legalBasis?: string;

  // Payment Guarantee specific
  guarantorName?: string;
  guarantorRegister?: string;
  creditorName?: string;
  paymentAmountNumber?: string;
  paymentAmountWords?: string;
  paymentDueDate?: string;

  // Dynamic Add / Remove Sections & Clauses
  documentSections?: DocumentSection[];
  paragraphsList?: string[];
  customFields?: { id: string; label: string; value: string }[];
  attachments?: string[];

  // Quick Section Toggles
  showCompanyHeader?: boolean;
  showDocNumber?: boolean;
  showRecipient?: boolean;
  showDateLocation?: boolean;
  showSecondParty?: boolean;
  showAttachments?: boolean;
}

export interface PresetTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: TemplateCategory;
  categoryLabel: string;
  mode: DocumentMode;
  docType: DocumentType | string;
  recipient?: string;
  sender?: string;
  senderPhone?: string;
  senderRegister?: string;
  signatoryTitle?: string;
  signatoryName?: string;
  duration?: string;
  roughText: string;
  formalizedText: string;
  paragraphsList?: string[];
  customFields?: { id: string; label: string; value: string }[];
  attachments?: string[];
  showCompanyHeader?: boolean;
  showDocNumber?: boolean;
  showRecipient?: boolean;
  showDateLocation?: boolean;
  showSecondParty?: boolean;
  showAttachments?: boolean;
  quoteItems?: QuoteItem[];
  companyName?: string;
  companyNameEn?: string;
  companyRegister?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  documentNumber?: string;
  officialStamp?: boolean;
  actItems?: ActItem[];
  handoverLocation?: string;
  grantorName?: string;
  grantorRegister?: string;
  attorneyName?: string;
  attorneyRegister?: string;
  attorneyPhone?: string;
  poaDuration?: string;
  poaScope?: string[];
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  meetingTitle?: string;
  meetingChairperson?: string;
  meetingSecretary?: string;
  meetingAttendees?: string;
  meetingAgenda?: string;
  meetingDecisions?: string;
  meetingActionItems?: MeetingActionItem[];
  memoSubject?: string;
  memoAttachmentsCount?: string;
  employeeName?: string;
  employeePosition?: string;
  infractionDescription?: string;
  disciplinaryActionType?: string;
  legalBasis?: string;
  paymentAmountNumber?: string;
  paymentAmountWords?: string;
  paymentDueDate?: string;
  secondSignatoryTitle?: string;
  secondSignatoryName?: string;
  secondSignatoryRegister?: string;
}

export interface OrgProfile {
  companyName: string;
  companyNameEn: string;
  companyRegister: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyLogo: string;
  signatoryTitle: string;
  signatoryName: string;
}

export interface AppSettings {
  numberingPrefix: string;
  numberingYear: string;
  numberingCounter: number;
  dateFormat: 'formal_full' | 'numeric' | 'formal_short';
  pageNumberStyle: 'none' | 'hyphen' | 'fraction';
  lineSpacing: '1.4' | '1.6' | '1.8';
  textAlign: 'justify' | 'left';
}

export const DEFAULT_ORG_PROFILE: OrgProfile = {
  companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
  companyNameEn: 'ARVIN TECHNOLOGY LLC',
  companyRegister: '5412980',
  companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
  companyPhone: '7711-0099, 9911-2233',
  companyEmail: 'contact@arvintech.mn',
  companyWebsite: 'www.arvintech.mn',
  companyLogo: '',
  signatoryTitle: 'Гүйцэтгэх захирал',
  signatoryName: 'Б.Батбаяр',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  numberingPrefix: 'АБ',
  numberingYear: '2026',
  numberingCounter: 109,
  dateFormat: 'formal_full',
  pageNumberStyle: 'hyphen',
  lineSpacing: '1.6',
  textAlign: 'justify',
};

export interface SavedDocument {
  id: string;
  title: string;
  docType: string;
  documentNumber: string;
  date: string;
  category: TemplateCategory;
  status: 'draft' | 'completed' | 'printed';
  updatedAt: string;
  data: DocumentData;
}

export const CATEGORY_DEFINITIONS: {
  key: TemplateCategory;
  label: string;
  icon: string;
  description: string;
  docTypes: { type: DocumentType | string; label: string; desc: string }[];
}[] = [
  {
    key: 'application',
    label: 'Өргөдөл, хүсэлт',
    icon: '📝',
    description: 'Иргэн, ажилтны албан ёсны өргөдөл, хүсэлт, тайлбар бичиг',
    docTypes: [
      { type: 'ӨРГӨДӨЛ', label: 'Өргөдөл', desc: 'Ажилд орох, чөлөө авах, дэвших' },
      { type: 'ХҮСЭЛТ', label: 'Хүсэлт', desc: 'Шийдвэрлүүлэх, зөвшөөрөл авах хүсэлт' },
      { type: 'ГОМДОЛ', label: 'Гомдол', desc: 'Шалгуулж шийдвэрлүүлэх гомдол' },
      { type: 'САНАЛ', label: 'Санал', desc: 'Ажил сайжруулах, төслийн санал' },
      { type: 'ТАЙЛБАР', label: 'Тайлбар', desc: 'Ажил үүрэг, нөхцөл байдлын тайлбар' },
    ],
  },
  {
    key: 'corporate_letter',
    label: 'Албан бичиг',
    icon: '🏢',
    description: 'Компани, байгууллагын албан тоот, хариу бичиг, мэдэгдэл',
    docTypes: [
      { type: 'АЛБАН ТООТ', label: 'Албан тоот', desc: 'Байгууллага хоорондын албан захидал' },
      { type: 'ХАРИУ АЛБАН БИЧИГ', label: 'Хариу албан бичиг', desc: 'Албан тоотод өгөх хариу' },
      { type: 'МЭДЭГДЭЛ', label: 'Мэдэгдэл', desc: 'Албан ёсны мэдэгдэх хуудас' },
      { type: 'МЭДЭЭЛЭЛ ХҮРГҮҮЛЭХ АЛБАН БИЧИГ', label: 'Мэдээлэл хүргүүлэх', desc: 'Тайлан, баримт хүргүүлэх' },
      { type: 'ТОДОРХОЙЛОЛТ', label: 'Тодорхойлолт', desc: 'Байгууллагын албан тодорхойлолт' },
    ],
  },
  {
    key: 'poa',
    label: 'Итгэмжлэл',
    icon: '📑',
    description: 'Байгууллага, иргэнийг төлөөлөх хууль ёсны эрх олгох баримт',
    docTypes: [
      { type: 'ЕРӨНХИЙ ИТГЭМЖЛЭЛ', label: 'Ерөнхий итгэмжлэл', desc: 'Бүрэн эрх олгох итгэмжлэл' },
      { type: 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ', label: 'Тээврийн хэрэгслийн', desc: 'Автомашин жолоодох, захиран зарцуулах' },
      { type: 'ТӨЛӨӨЛӨХ ЭРХИЙН ИТГЭМЖЛЭЛ', label: 'Төлөөлөх эрхийн', desc: 'Шүүх, төрийн байгууллагад төлөөлөх' },
      { type: 'САНХҮҮГИЙН ИТГЭМЖЛЭЛ', label: 'Банк, санхүүгийн', desc: 'Данс удирдах, гүйлгээ хийх' },
    ],
  },
  {
    key: 'contract',
    label: 'Гэрээ',
    icon: '🤝',
    description: 'Бизнес, түрээс, хамтын ажиллагааны үндсэн загвар гэрээнүүд',
    docTypes: [
      { type: 'ТҮРЭЭСИЙН ГЭРЭЭ', label: 'Түрээсийн гэрээ', desc: 'Байр, оффис, эд хөрөнгө түрээслэх' },
      { type: 'ХУДАЛДАХ ХУДАЛДАН АВАХ ГЭРЭЭ', label: 'Худалдах худалдан авах', desc: 'Бараа бүтээгдэхүүн худалдах' },
      { type: 'ҮЙЛЧИЛГЭЭНИЙ ГЭРЭЭ', label: 'Үйлчилгээний гэрээ', desc: 'Мэргэжлийн үйлчилгээ үзүүлэх' },
      { type: 'АЖИЛ ГҮЙЦЭТГЭХ ГЭРЭЭ', label: 'Ажил гүйцэтгэх гэрээ', desc: 'Барилга, засвар, хөгжүүлэлтийн ажил' },
      { type: 'ХАМТРАН АЖИЛЛАХ ГЭРЭЭ', label: 'Хамтран ажиллах гэрээ', desc: 'Төсөл хамтран хэрэгжүүлэх' },
    ],
  },
  {
    key: 'handover',
    label: 'Акт',
    icon: '📋',
    description: 'Эд хөрөнгө, ажил үүрэг, тооллого хүлээлцэх албан ёсны актууд',
    docTypes: [
      { type: 'ХҮЛЭЭЛЦЭХ АКТ', label: 'Хүлээлцэх акт', desc: 'Ерөнхий эд хөрөнгө хүлээлцэх' },
      { type: 'АЖИЛ ХҮЛЭЭЛЦЭХ АКТ', label: 'Ажил хүлээлцэх акт', desc: 'Ажлаас чөлөөлөгдөх, шилжих үед' },
      { type: 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ', label: 'Эд хөрөнгийн акт', desc: 'Тоног төхөөрөмж, бараа хүлээлцэх' },
      { type: 'ТООЛЛОГЫН АКТ', label: 'Тооллогын акт', desc: 'Жилийн эцсийн эд хөрөнгийн тооллого' },
    ],
  },
  {
    key: 'internal',
    label: 'Дотоод баримт',
    icon: '👥',
    description: 'Компанийн дотоод хурлын тэмдэглэл, санамж бичиг, даалгавар',
    docTypes: [
      { type: 'ДОТООД САНАМЖ БИЧИГ', label: 'Дотоод бичиг', desc: 'Хэлтэс хоорондын санамж бичиг' },
      { type: 'ХУРЛЫН ТЭМДЭГЛЭЛ', label: 'Хурлын тэмдэглэл', desc: 'Удирдах зөвлөл, ээлжит хурлын тэмдэглэл' },
      { type: 'ҮҮРЭГ ДААЛГАВАР', label: 'Үүрэг даалгавар', desc: 'Удирдлагын үүрэг даалгаврын хуудас' },
      { type: 'ТАНИЛЦУУЛГА', label: 'Танилцуулга', desc: 'Удирдлагад танилцуулах бичиг' },
    ],
  },
  {
    key: 'other',
    label: 'Бусад',
    icon: '🛡️',
    description: 'Баталгаа, шаардах бичиг, тодорхойлолт, үнийн санал',
    docTypes: [
      { type: 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС', label: 'Баталгаа', desc: 'Төлбөр төлөх баталгааны бичиг' },
      { type: 'ШААРДАХ БИЧИГ', label: 'Шаардлага', desc: 'Гэрээний үүрэг, төлбөр шаардах' },
      { type: 'ТӨЛБӨР ТӨЛӨХ ХҮСЭЛТ', label: 'Төлбөр төлөх хүсэлт', desc: 'Нэхэмжлэх, төлбөрийн хүсэлт' },
      { type: 'ЧӨЛӨӨ АВАХ ӨРГӨДӨЛ', label: 'Чөлөө авах өргөдөл', desc: 'Цалинтай, цалингүй чөлөө хүсэх' },
      { type: 'АЖЛЫН ГАЗРЫН ТОДОРХОЙЛОЛТ', label: 'Ажлын тодорхойлолт', desc: 'Виз, банканд өгөх тодорхойлолт' },
      { type: 'ҮНИЙН САНАЛ', label: 'Үнийн санал', desc: 'Бараа, үйлчилгээний үнийн задаргаа' },
    ],
  },
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
  // 1. Албан тоот
  {
    id: 'corp-b2b-collab',
    title: 'Хамтран ажиллах албан тоот',
    subtitle: 'Түнш байгууллагад төсөл, үйл ажиллагаанд хамтрах санал тавих',
    category: 'corporate_letter',
    categoryLabel: 'Албан бичиг',
    mode: 'corporate',
    docType: 'АЛБАН ТООТ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
    companyPhone: '7711-0099',
    companyEmail: 'contact@arvintech.mn',
    companyWebsite: 'www.arvintech.mn',
    documentNumber: '26/108',
    recipient: '«Монгол Шуудан» ХК-ийн\nМэдээллийн технологийн газрын захирал\nЦ.Мөнхбат танаа',
    sender: '«Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр',
    signatoryTitle: 'Гүйцэтгэх захирал',
    signatoryName: 'Б.Батбаяр',
    roughText:
      'Манай хоёр байгууллагын хооронд цахим системийн туршилтын орчны интеграци амжилттай дууссан. Одоо үйлдвэрлэлийн бодит серверийн холболт, API түлхүүрийг шилжүүлж өгөхийг хүсье.',
    formalizedText:
      'Энэхүү албан бичгээр танай хамт олонд энэ өдрийн амар амгаланг айлтган мэндчилж, цаашдын ажил үйлсэд тань өндөр амжилт хүсье.\n\nМанай хоёр байгууллагын хооронд байгуулсан хамтран ажиллах санамж бичгийн хүрээнд хэрэгжиж буй "Цахим үйлчилгээний нэгдсэн систем"-ийн туршилтын (Sandbox) орчны интеграцийн ажил бүрэн амжилттай хийгдэж дууссан болохыг үүгээр мэдэгдэж байна.\n\nИймд төслийн дараагийн шат буюу бодит (Production) орчны серверийн тохиргоо, холболтын API түлхүүрүүд болон аюулгүй байдлын протоколыг хуваарийн дагуу манай техникийн багт шилжүүлэн өгч хамтран ажиллана уу.\n\nБидний тавьж буй хүсэлтийг хүлээн авч, зохих журмын дагуу шийдвэрлэнэ гэдэгт гүнээ итгэж байна.',
    officialStamp: true,
  },
  // 2. Үнийн санал
  {
    id: 'corp-price-quote',
    title: 'Үнийн санал хүргүүлэх',
    subtitle: 'Бараа бүтээгдэхүүн, үйлчилгээний үнийн санал хүснэгтээр',
    category: 'other',
    categoryLabel: 'Үнийн санал',
    mode: 'corporate',
    docType: 'ҮНИЙН САНАЛ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2',
    companyPhone: '7711-0099',
    companyEmail: 'sales@arvintech.mn',
    companyWebsite: 'www.arvintech.mn',
    documentNumber: 'ҮС-26/38',
    recipient: '«Тавантолгой Түлш» ХХК-ийн\nХудалдан авалтын газарт',
    sender: '«Арвин Технологи» ХХК-ийн Борлуулалтын захирал М.Тэмүүлэн',
    signatoryTitle: 'Борлуулалтын захирал:',
    signatoryName: 'М.Тэмүүлэн',
    duration: 'Үнийн санал 30 хоногийн хугацаанд хүчинтэй',
    roughText:
      'Танай байгууллагаас зарласан сүлжээ, серверийн тоног төхөөрөмж нийлүүлэх ажлын албан ёсны үнийн саналыг хүснэгтээр хүргүүлж байна.',
    formalizedText:
      'Танай байгууллагаас зарласан "Мэдээллийн аюулгүй байдал, серверийн тоног төхөөрөмж нийлүүлэх" сонгон шалгаруулалтад зориулан манай компаниас дараах техникийн шаардлага хангасан бараа бүтээгдэхүүний албан ёсны үнийн саналыг хүргүүлж байна.\n\nҮнийн саналд дурдсан бүх бараа бүтээгдэхүүн нь үйлдвэрлэгчийн 1-3 жилийн албан ёсны баталгаатай бөгөөд Улаанбаатар хот дахь байгууллагын хаягаар хүргэж, суурилуулах ажлыг үнэ төлбөргүй хариуцна.\n\nТөлбөрийн нөхцөл: Гэрээ байгуулснаас хойш урьдчилгаа 40%, нийлүүлж дууссаны дараа үлдэгдэл 60%-ийг шилжүүлнэ.',
    officialStamp: true,
    quoteItems: [
      {
        id: '1',
        name: 'Сервер компьютер (Dell PowerEdge R750)',
        unit: 'ш',
        quantity: '2',
        unitPrice: '28,500,000',
        totalPrice: '57,000,000',
        notes: '2x Intel Xeon, 128GB RAM',
      },
      {
        id: '2',
        name: 'Сүлжээний хамгаалалтын төхөөрөмж (Fortinet FortiGate 100F)',
        unit: 'ш',
        quantity: '1',
        unitPrice: '14,200,000',
        totalPrice: '14,200,000',
        notes: '1 жилийн UTP лицензтэй',
      },
      {
        id: '3',
        name: 'Үйлдлийн систем (Windows Server Standard)',
        unit: 'багц',
        quantity: '2',
        unitPrice: '4,800,000',
        totalPrice: '9,600,000',
        notes: '16 core лиценз',
      },
      {
        id: '4',
        name: 'Суурилуулалт, тохиргооны инженерийн үйлчилгээ',
        unit: 'төсөл',
        quantity: '1',
        unitPrice: '3,500,000',
        totalPrice: '3,500,000',
        notes: '7 хоногийн дотор бүрэн гүйцэтгэнэ',
      },
    ],
  },
  // 3. Өргөдөл (Ажилд орох)
  {
    id: 'app-job',
    title: 'Ажилд орох тухай өргөдөл',
    subtitle: 'Сонгон шалгаруулалтад оролцох албан өргөдөл',
    category: 'application',
    categoryLabel: 'Өргөдөл',
    mode: 'personal',
    docType: 'ӨРГӨДӨЛ',
    recipient: '«Голомт Банк» ХК-ийн\nХүний нөөцийн удирдлагын газарт',
    sender: 'Иргэн Б.Болд',
    senderRegister: 'УБ92051412',
    senderPhone: '9911-5544',
    signatoryTitle: 'Өргөдөл гаргасан:',
    signatoryName: 'Б.Болд',
    roughText:
      'Танай банкны Зээлийн эдийн засагчийн ажлын байрны зарыг үзээд өргөдөл гаргаж байна. Би банк санхүүгийн чиглэлээр 5 жил ажилласан туршлагатай.',
    formalizedText:
      'Миний бие Бат овогтой Болд нь танай байгууллагаас олон нийтийн сүлжээгээр зарласан "Зээлийн ахлах эдийн засагч"-ийн ажлын байрны сонгон шалгаруулалтад оролцох хүсэлттэй байна.\n\nБи 2015-2019 онд МУИС-ийг Банк санхүүгийн чиглэлээр бакалавр зэрэгтэй төгссөн бөгөөд арилжааны банканд зээлийн эдийн засагч, шинжээчээр 5 дахь жилдээ тогтвортой ажиллаж буй туршлагатай.\n\nМэргэжлийн өндөр хариуцлага, харилцааны ур чадвар, багаар ажиллах туршлагаа дайчлан танай хамт олонтой үр дүнтэй хамтран ажиллах хүсэлтэй байгаа тул өргөдлийг минь хүлээн авч, ярилцлагад урихыг хүсье.',
    attachments: [
      '1. Иргэний үнэмлэхийн лавлагаа – 1 хуудас',
      '2. Дипломын хуулбар, дүнгийн жагсаалт – 2 хуудас',
      '3. Дэлгэрэнгүй анкет (CV) – 2 хуудас',
    ],
    showAttachments: true,
  },
  // 4. Чөлөө хүсэх өргөдөл
  {
    id: 'app-leave',
    title: 'Цалинтай / цалингүй чөлөө авах өргөдөл',
    subtitle: 'Хувийн зайлшгүй шалтгаанаар чөлөө хүсэх',
    category: 'application',
    categoryLabel: 'Өргөдөл',
    mode: 'personal',
    docType: 'ӨРГӨДӨЛ',
    recipient: '«Тавантолгой Түлш» ХХК-ийн\nГүйцэтгэх захирал танаа',
    sender: 'Мэдээллийн технологийн хэлтсийн ажилтан Д.Сүхбат',
    senderRegister: 'УК88031578',
    senderPhone: '8800-4411',
    signatoryTitle: 'Өргөдөл гаргасан:',
    signatoryName: 'Д.Сүхбат',
    duration: '2026 оны 10 дугаар сарын 05-наас 10 дугаар сарын 09 хүртэл (ажлын 5 хоног)',
    roughText:
      'Гэр бүлийн зайлшгүй гачигдал гарсан тул 5 хоногийн чөлөө олгохыг хүсье. Ажлаа хамт ажилладаг Г.Бат-Оргилд хүлээлгэж өгсөн.',
    formalizedText:
      'Миний бие Мэдээллийн технологийн хэлтсийн Системийн админ Д.Сүхбат нь ар гэрийн зайлшгүй шалтгааны улмаас 2026 оны 10 дугаар сарын 05-ны өдрөөс 10 дугаар сарын 09-ний өдрийг дуустал нийт ажлын 5 хоногийн цалингүй чөлөө олгохыг хүсэж байна.\n\nЧөлөөтэй байх хугацаанд хариуцсан өдөр тутмын ажил үүргийг тус хэлтсийн сүлжээний инженер Г.Бат-Оргилд бүрэн танилцуулж, хэвийн ажиллагааг хангуулахаар түр хариуцуулан тохиролцсон болно.\n\nИймд дээрх хугацааны чөлөө олгож, шийдвэрлэж өгнө үү.',
  },
  // 5. Түрээсийн гэрээ
  {
    id: 'contract-lease',
    title: 'Үл хөдлөх хөрөнгө, оффис түрээслэх гэрээ',
    subtitle: 'Ажлын байр, оффисын талбай түрээсийн үндсэн гэрээ',
    category: 'contract',
    categoryLabel: 'Гэрээ',
    mode: 'corporate',
    docType: 'ТҮРЭЭСИЙН ГЭРЭЭ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо',
    documentNumber: 'ГР-2026/14',
    recipient: 'Түрээслүүлэгч болон Түрээслэгч талуудын хооронд',
    signatoryTitle: 'Түрээслүүлэгч:',
    signatoryName: 'Б.Батбаяр',
    secondSignatoryTitle: 'Түрээслэгч:',
    secondSignatoryName: 'Г.Чинзориг',
    secondSignatoryRegister: 'ЧК85041211',
    duration: '2026 оны 10 дугаар сарын 01-нээс 2027 оны 10 дугаар сарын 01 хүртэл (1 жил)',
    roughText:
      'Сүхбаатар дүүргийн 1-р хороонд байрлах оффисын 120 м.кв талбайг сарын 4.5 сая төгрөгөөр түрээслэх гэрээ байгуулж байна.',
    formalizedText:
      'НЭГ. ГЭРЭЭНИЙ ЗҮЙЛ БА ХУГАЦАА\n1.1. Энэхүү гэрээгээр Түрээслүүлэгч нь өөрийн өмчлөлийн Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Чингисийн өргөн чөлөө 15/2 тоотод байрлах, улсын бүртгэлийн гэрчилгээтэй 120 (нэг зуун хорь) м.кв талбай бүхий оффисын зориулалттай талбайг Түрээслэгчийн эзэмшил, ашиглалтад түр шилжүүлнэ.\n1.2. Гэрээний хүчинтэй хугацаа нь 2026 оны 10 дугаар сарын 01-ний өдрөөс 2027 оны 10 дугаар сарын 01-ний өдөр хүртэл 1 (нэг) жилийн хугацаатай байна.\n\nХОЁР. ТҮРЭЭСИЙН ТӨЛБӨР, ТООЦОО\n2.1. Түрээсийн сарын төлбөр нь 4,500,000 (дөрвөн сая таван зуун мянга) төгрөг байна.\n2.2. Түрээслэгч нь тухайн сарын түрээсийн төлбөрийг сар бүрийн 05-ны өдрийн дотор Түрээслүүлэгчийн Хаан банк дахь дансанд шилжүүлнэ.\n2.3. Гэрээ байгуулах үед 1 сарын түрээсийн төлбөртэй тэнцэх барьцаа 4,500,000 төгрөгийг урьдчилан байршуулна.\n\nГУРАВ. ТАЛУУДЫН ЭРХ, ҮҮРЭГ БА ХАРИУЦЛАГА\n3.1. Түрээслүүлэгч нь түрээсийн байрыг бүрэн бүтэн, сантехник, цахилгааны гэмтэлгүйгээр актаар хүлээлгэн өгөх үүрэгтэй.\n3.2. Түрээслэгч нь түрээсийн талбайг зориулалтын дагуу гамтай ашиглаж, байгууллагын дотоод журам, галын аюулгүй байдлыг чанд сахина.\n3.3. Төлбөр төлөх хугацаа хэтэрсэн хоног тутамд төлөгдөөгүй дүнгийн 0.2 хувийн алданги тооцно.',
    showCompanyHeader: true,
    showSecondParty: true,
    officialStamp: true,
  },
  // 6. Хүлээлцэх акт
  {
    id: 'act-handover-assets',
    title: 'Эд хөрөнгө хүлээлцэх акт',
    subtitle: 'Компьютер, тоног төхөөрөмж, эд хогшил албан ёсоор шилжүүлэх',
    category: 'handover',
    categoryLabel: 'Акт',
    mode: 'corporate',
    docType: 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    documentNumber: 'АКТ-26/18',
    recipient: 'Ажилтан чөлөөлөгдөх болон эд хөрөнгө шилжүүлэх комисст',
    signatoryTitle: 'Хүлээлгэн өгсөн:',
    signatoryName: 'П.Эрдэнэбат (Ахлах нярав)',
    secondSignatoryTitle: 'Хүлээн авсан:',
    secondSignatoryName: 'О.Мөнхжаргал (Инженер)',
    secondSignatoryRegister: 'УБ94082215',
    handoverLocation: 'Төв оффис, 405 тоот лаборатори',
    roughText:
      'Ажилтны ажлын байр өөрчлөгдсөнтэй холбогдуулан компанийн өмч болох суурин компьютер, дэлгэц, ажлын ширээ, сандлыг бүрэн бүтэн хүлээлгэн өгөв.',
    formalizedText:
      'Энэхүү актаар «Арвин Технологи» ХХК-ийн ажилтны шилжилт хөдөлгөөн, үүрэгт ажлын хуваарилалтын дагуу компанийн үндсэн хөрөнгөд бүртгэлтэй доорх нэр бүхий тоног төхөөрөмж, эд хогшлыг биет байдлаар шалган бүрэн бүтэн хүлээлцсэнийг баталгаажуулав.\n\nХүлээлцсэн эд хөрөнгө нь техникийн болон гадаад үзэмжийн хувьд бүрэн ажиллагаатай, гэмтэл эвдрэлгүй болохыг талууд харилцан шалгаж баталгаажуулсан бөгөөд цаашдын хадгалалт, ашиглалтын хариуцлагыг хүлээн авагч тал хариуцна.',
    actItems: [
      {
        id: '1',
        name: 'Нөүтбүүк (MacBook Pro 16" M3 Max)',
        quantity: '1 ширхэг',
        condition: 'Шинэ, цэвэрхэн, бүрэн ажиллагаатай',
        notes: 'Цэнэглэгч, хамгаалалтын цүнхний хамт',
      },
      {
        id: '2',
        name: 'Дэлгэц (Dell UltraSharp 27" 4K)',
        quantity: '2 ширхэг',
        condition: 'Зураасгүй, дэлгэцийн өнгө хэвийн',
        notes: 'Type-C болон HDMI кабель дагалдана',
      },
      {
        id: '3',
        name: 'Оффисын сандал (Herman Miller Aeron)',
        quantity: '1 ширхэг',
        condition: 'Хэвийн, тохируулга ажиллаж байна',
        notes: 'Үндсэн хөрөнгийн код: 2024-EQ-88',
      },
    ],
    showCompanyHeader: true,
    showSecondParty: true,
    officialStamp: true,
  },
  // 7. Ерөнхий итгэмжлэл
  {
    id: 'poa-general',
    title: 'Ерөнхий итгэмжлэл (Компаниас)',
    subtitle: 'Байгууллагыг шүүх, төрийн байгууллага, гэрээ хэлцэлд төлөөлөх',
    category: 'poa',
    categoryLabel: 'Итгэмжлэл',
    mode: 'corporate',
    docType: 'ЕРӨНХИЙ ИТГЭМЖЛЭЛ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    documentNumber: 'ИТ-26/05',
    grantorName: '«Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр',
    grantorRegister: '5412980',
    attorneyName: 'Хуулийн зөвлөх Н.Уранбилэг',
    attorneyRegister: 'УК90112045',
    attorneyPhone: '9988-7766',
    poaDuration: '2026 оны 10 дугаар сарын 01-нээс 2027 оны 10 дугаар сарын 01 хүртэл (1 жил)',
    signatoryTitle: 'Итгэмжлэгч (Гүйцэтгэх захирал):',
    signatoryName: 'Б.Батбаяр',
    secondSignatoryTitle: 'Итгэмжлэгдэгч:',
    secondSignatoryName: 'Н.Уранбилэг',
    secondSignatoryRegister: 'УК90112045',
    roughText:
      'Компанийн хуулийн зөвлөх Н.Уранбилэгт төрийн байгууллага, шүүх, татвар, нийгмийн даатгал болон харилцагч талуудтай харилцах, гэрээ хэлцэл байгуулахад компанийг бүрэн төлөөлөх эрх олгож байна.',
    formalizedText:
      'Монгол Улсын Иргэний хуулийн 62 дугаар зүйлийн 62.3, 64 дүгээр зүйлийн 64.2 дахь хэсгийг тус тус үндэслэн «Арвин Технологи» ХХК (РД: 5412980)-ийг төлөөлөн Гүйцэтгэх захирал Б.Батбаяр би тус компанийн Хуулийн ахлах зөвлөх Наран овогтой Уранбилэг (РД: УК90112045)-т дараах бүрэн эрхийг олгож байна.\n\nҮүнд:\n1. Монгол Улсын бүх шатны шүүх, прокурор, цагдаа, шүүхийн шийдвэр гүйцэтгэх байгууллага, татвар, гааль, улсын бүртгэл болон төрийн бусад эрх бүхий байгууллагуудад компанийг бүрэн төлөөлөн оролцох;\n2. Компанийн өмнөөс нэхэмжлэл гаргах, хүлээн авах, тайлбар, нотлох баримт гарган өгөх, эвлэрлийн гэрээ байгуулах, шүүхийн шийдвэрт давж заалдах болон хяналтын гомдол гаргах;\n3. Түнш, харилцагч байгууллагуудтай ажил хэргийн хэлэлцээ хийх, баримт бичигт гарын үсэг зурах.\n\nЭнэхүү итгэмжлэл нь олгосон өдрөөс эхлэн 1 (нэг) жилийн хугацаанд хүчин төгөлдөр байх ба бусдад дамжуулан итгэмжлэх эрхгүй олгогдов.',
    showCompanyHeader: true,
    showSecondParty: true,
    officialStamp: true,
  },
  // 8. Тээврийн хэрэгслийн итгэмжлэл
  {
    id: 'poa-vehicle',
    title: 'Тээврийн хэрэгслийн итгэмжлэл',
    subtitle: 'Автомашин жолоодох, захиран зарцуулах, үзлэг оношилгоонд оруулах',
    category: 'poa',
    categoryLabel: 'Итгэмжлэл',
    mode: 'personal',
    docType: 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ',
    grantorName: 'Иргэн С.Ганбаатар',
    grantorRegister: 'УБ80051214',
    attorneyName: 'Иргэн Д.Мөнх-Эрдэнэ',
    attorneyRegister: 'УБ89100523',
    attorneyPhone: '9900-1122',
    vehiclePlate: '12-34 УБҮ',
    vehicleModel: 'Toyota Land Cruiser Prado',
    vehicleVin: 'JTEBU5JR80512398',
    poaDuration: '2 (хоёр) жилийн хугацаатай',
    signatoryTitle: 'Итгэмжлэгч (Өмчлөгч):',
    signatoryName: 'С.Ганбаатар',
    secondSignatoryTitle: 'Итгэмжлэгдэгч:',
    secondSignatoryName: 'Д.Мөнх-Эрдэнэ',
    roughText:
      'Миний нэр дээрх 12-34 УБҮ улсын дугаартай Prado автомашиныг Д.Мөнх-Эрдэнэд Монгол улсын нутаг дэвсгэрт жолоодох, техникийн үзлэг, оношилгоо, даатгалд хамруулах эрх олгож байна.',
    formalizedText:
      'Монгол Улсын Иргэний хуулийн 62, 64 дүгээр зүйлийг үндэслэн миний бие өөрийн өмчлөлийн дараах тээврийн хэрэгслийг жолоодох, захиран зарцуулах эрхийг Иргэн Д.Мөнх-Эрдэнэ (РД: УБ89100523)-д олгож байна.\n\nТээврийн хэрэгслийн үзүүлэлт:\n- Улсын дугаар: 12-34 УБҮ\n- Марк, загвар: Toyota Land Cruiser Prado\n- Арлын дугаар: JTEBU5JR80512398\n\nИтгэмжлэгдэгч нь уг тээврийн хэрэгслийг Монгол Улсын замын хөдөлгөөний дүрмийн дагуу жолоодох, техникийн оношилгоо, авто тээврийн татвар, торгууль, албан журмын болон сайн дурын даатгалд хамруулах, шаардлагатай засвар үйлчилгээ хийлгэх бүрэн эрхтэй.\n\nЭнэхүү итгэмжлэл нь олгосон өдрөөс хойш 2 (хоёр) жилийн хугацаанд хүчинтэй байна.',
    showSecondParty: true,
  },
  // 9. Хурлын тэмдэглэл
  {
    id: 'internal-meeting',
    title: 'Удирдах зөвлөлийн хурлын тэмдэглэл',
    subtitle: 'Хэлэлцсэн асуудал, гаргасан шийдвэр, үүрэг даалгаврын хуудас',
    category: 'internal',
    categoryLabel: 'Дотоод баримт',
    mode: 'corporate',
    docType: 'ХУРЛЫН ТЭМДЭГЛЭЛ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    meetingTitle: 'Компанийн 2026 оны 3-р улирлын гүйцэтгэл, төсвийн хуралдаан',
    meetingChairperson: 'Гүйцэтгэх захирал Б.Батбаяр',
    meetingSecretary: 'Нарийн бичиг Т.Ариунзаяа',
    meetingAttendees: 'Гүйцэтгэх захирал Б.Батбаяр, Санхүү эрхэлсэн дэд захирал Ц.Мөнхзул, Маркетингийн хэлтсийн дарга С.Баярсайхан, Мэдээллийн технологийн албаны дарга Д.Болд',
    signatoryTitle: 'Хурал даргалагч:',
    signatoryName: 'Б.Батбаяр',
    secondSignatoryTitle: 'Тэмдэглэл хөтөлсөн:',
    secondSignatoryName: 'Т.Ариунзаяа',
    roughText:
      'Гуравдугаар улирлын санхүүгийн төлөвлөгөө 94 хувийн биелэлттэй гарлаа. Шинэ бүтээгдэхүүний маркетинг төсвийг баталж, IT дэд бүтцийн шинэчлэлийг эхлүүлэхээр шийдвэрлэв.',
    formalizedText:
      'ХЭЛЭЛЦСЭН АСУУДАЛ:\n1. 2026 оны 3-р улирлын санхүү, борлуулалтын төлөвлөгөөний биелэлт;\n2. 4-р улирлын маркетингийн төсөв болон шинэ бүтээгдэхүүний нээлтийн бэлтгэл ажил;\n3. Мэдээллийн аюулгүй байдал, серверийн шинэчлэлийн асуудал.\n\nХУРЛААС ГАРСАН ШИЙДВЭР:\n1. Гуравдугаар улирлын борлуулалтын биелэлтийг "Хангалттай" гэж дүгнэж, санхүүгийн тайланг батлав.\n2. Шинэ программ хангамж нэвтрүүлэх маркетингийн батлагдсан төсвийг 10 дугаар сарын 15-ны дотор санхүүжүүлэхийг Санхүүгийн газарт үүрэг болгов.\n3. IT серверийн нөөц төвийг байгуулах ажлын гүйцэтгэгчийг сонгон шалгаруулах ажлын хэсэг байгуулахаар тогтов.',
    meetingActionItems: [
      {
        id: '1',
        task: 'Маркетингийн 4-р улирлын дэлгэрэнгүй төлөвлөгөөг батлуулах',
        assignee: 'С.Баярсайхан (Маркетинг)',
        deadline: '2026.10.10',
      },
      {
        id: '2',
        task: 'Серверийн шинэчлэлийн тендерийн бичиг баримт бэлтгэх',
        assignee: 'Д.Болд (IT алба)',
        deadline: '2026.10.20',
      },
      {
        id: '3',
        task: 'Улирлын урамшууллын санг эцэслэж гүйцэтгэх удирдлагад танилцуулах',
        assignee: 'Ц.Мөнхзул (Санхүү)',
        deadline: '2026.10.12',
      },
    ],
    showCompanyHeader: true,
    showSecondParty: true,
  },
  // 10. Төлбөр төлөх баталгааны хуудас
  {
    id: 'other-payment-guarantee',
    title: 'Төлбөр төлөх баталгааны хуудас',
    subtitle: 'Худалдан авсан бараа, үзүүлсэн үйлчилгээний төлбөрийг хугацаанд нь төлөх албан баталгаа',
    category: 'other',
    categoryLabel: 'Баталгаа',
    mode: 'corporate',
    docType: 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    documentNumber: 'БТ-2026/09',
    recipient: '«Шунхлай Трейдинг» ХХК-ийн Санхүүгийн газарт',
    signatoryTitle: 'Баталгаа гаргасан (Гүйцэтгэх захирал):',
    signatoryName: 'Б.Батбаяр',
    paymentAmountNumber: '85,000,000',
    paymentAmountWords: 'наян таван сая төгрөг',
    paymentDueDate: '2026 оны 10 дугаар сарын 25-ны өдөр',
    roughText:
      'Танай компаниас нийлүүлсэн шатахуун, тосолгооны материалын үлдэгдэл 85 сая төгрөгийг 10 дугаар сарын 25-ны дотор бүрэн төлж дуусгахаа баталж байна.',
    formalizedText:
      'Талуудын хооронд байгуулсан 2026 оны 01 дүгээр сарын 15-ны өдрийн №ХА-26 тоот "Бүтээгдэхүүн нийлүүлэх тухай гэрээ"-ний дагуу нийлүүлэгдсэн шатах тослох материалын төлбөрийн үлдэгдэл болох 85,000,000 (наян таван сая) төгрөгийг манай компани 2026 оны 10 дугаар сарын 25-ны өдрийн дотор танай байгууллагын Голомт банк дахь албан ёсны харилцах дансанд 100% шилжүүлэн дуусгахаа үүгээр үл маргах журмаар батлан дааж баталгаа гаргаж байна.\n\nХэрэв дээр дурдсан хугацаанд төлбөрийг барагдуулаагүй нөхцөлд гэрээний дагуу хэтэрсэн хоног тутамд төлөгдөөгүй дүнгийн 0.2 хувийн алданги тооцуулах бөгөөд үүсэх хууль зүйн болон санхүүгийн хариуцлагыг манай компани бүрэн хариуцна.',
    showCompanyHeader: true,
    officialStamp: true,
  },
  // 11. Ажлын газрын тодорхойлолт
  {
    id: 'other-work-reference',
    title: 'Ажлын газрын албан ёсны тодорхойлолт',
    subtitle: 'Ажилтны албан тушаал, цалин, ажилласан хугацааны тодорхойлолт',
    category: 'other',
    categoryLabel: 'Тодорхойлолт',
    mode: 'corporate',
    docType: 'ТОДОРХОЙЛОЛТ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    documentNumber: 'ТД-2026/41',
    recipient: 'Шаардагдах байгууллагад (Виз мэдүүлэх, Банкны зээл авах)',
    signatoryTitle: 'Гүйцэтгэх захирал:',
    signatoryName: 'Б.Батбаяр',
    roughText:
      'Манай компанид ахлах хөгжүүлэгчээр ажилладаг Н.Болд нь 2022 оноос хойш ажиллаж байгаа бөгөөд сарын үндсэн цалин 4.5 сая төгрөг болно.',
    formalizedText:
      '«Арвин Технологи» ХХК (РД: 5412980) нь тус байгууллагын Програм хангамжийн хөгжүүлэлтийн хэлтэст Ахлах инженерээр ажиллаж буй Бат овогтой Болд (РД: УШ91081512)-ийг дараах байдлаар тодорхойлж байна.\n\nН.Болд нь 2022 оны 04 дүгээр сарын 01-ний өдрөөс эхлэн өнөөдрийг хүртэл хугацаагүй хөдөлмөрийн гэрээгээр үндсэн ажилтнаар тасралтгүй үр бүтээлтэй ажиллаж байна.\n\nТүүний сарын үндсэн цалин 4,500,000 (дөрвөн сая таван зуун мянга) төгрөг бөгөөд Нийгмийн даатгалын шимтгэл, Хүн амын орлогын албан татвар хуулийн дагуу тогтмол суутгагдан төлөгддөг болно.\n\nН.Болд нь ажил үүрэгтээ хариуцлагатай, мэргэжлийн өндөр ёс зүйтэй ажилтан тул түүний хүсэлтээр виз болон банкны зээлийн бүрдүүлбэрт зориулан энэхүү тодорхойлолтыг гаргаж өгөв.',
    showCompanyHeader: true,
    officialStamp: true,
  },
];

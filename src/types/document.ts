export type DocumentType =
  | 'ӨРГӨДӨЛ'
  | 'ХҮСЭЛТ'
  | 'ТОДОРХОЙЛОЛТ'
  | 'АЛБАН ТООТ'
  | 'ШААРДАХ БИЧИГ'
  | 'МЭДЭГДЭЛ'
  | 'ҮНИЙН САНАЛ'
  | 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ'
  | 'АЖИЛ ХҮЛЭЭЛЦЭХ АКТ'
  | 'ИТГЭМЖЛЭЛ'
  | 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ'
  | 'ХУРЛЫН ТЭМДЭГЛЭЛ'
  | 'ДОТООД САНАМЖ БИЧИГ'
  | 'САХИЛГЫН ШИЙТГЭЛИЙН МЭДЭГДЭХ ХУУДАС'
  | 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС';

export type DocumentMode = 'personal' | 'corporate';

export type TemplateCategory =
  | 'application' // Өргөдөл, хүсэлт
  | 'corporate_letter' // Албан тоот, мэдэгдэл
  | 'handover' // Хүлээлцэх акт
  | 'poa' // Итгэмжлэл
  | 'internal' // Дотоод бичиг, хурлын тэмдэглэл
  | 'guarantee'; // Баталгаа, шаардах бичиг

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

export interface DocumentData {
  mode: DocumentMode;
  docType: DocumentType;

  // Common / general fields
  recipient: string;
  sender: string;
  senderPhone?: string;
  senderRegister?: string;
  date: string;
  city: string;
  duration?: string;
  roughText: string;
  formalizedText: string;
  signatureDataUrl?: string;
  fontFamily: 'serif' | 'sans';
  fontSize: 'sm' | 'base' | 'lg';
  showDottedLine: boolean;
  officialStamp?: boolean;

  // Dual Signatory fields (For Handover Acts, POA, Guarantees)
  secondSignatoryTitle?: string;
  secondSignatoryName?: string;
  secondSignatoryRegister?: string;
  secondSignatoryPhone?: string;
  secondSignatureDataUrl?: string;

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

  // 1. Handover Act specific
  handoverLocation?: string;
  handoverCommission?: string;
  actItems?: ActItem[];

  // 2. Power of Attorney (Итгэмжлэл) specific
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

  // 3. Meeting Minutes (Хурлын тэмдэглэл) specific
  meetingTitle?: string;
  meetingChairperson?: string;
  meetingSecretary?: string;
  meetingAttendees?: string;
  meetingAgenda?: string;
  meetingDecisions?: string;
  meetingActionItems?: MeetingActionItem[];

  // 4. Internal Memo specific
  memoSubject?: string;
  memoAttachmentsCount?: string;

  // 5. Disciplinary Notice specific
  employeeName?: string;
  employeePosition?: string;
  infractionDescription?: string;
  disciplinaryActionType?: string;
  legalBasis?: string;

  // 6. Payment Guarantee specific
  guarantorName?: string;
  guarantorRegister?: string;
  creditorName?: string;
  paymentAmountNumber?: string;
  paymentAmountWords?: string;
  paymentDueDate?: string;

  // 7. Price Quotation specific
  quoteItems?: QuoteItem[];

  // Dynamic Add / Remove Sections & Clauses
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
  docType: DocumentType;
  recipient: string;
  sender: string;
  senderPhone?: string;
  senderRegister?: string;
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
  signatoryTitle?: string;
  signatoryName?: string;
  officialStamp?: boolean;

  // Specialized attributes for preset
  secondSignatoryTitle?: string;
  secondSignatoryName?: string;
  secondSignatoryRegister?: string;
  handoverLocation?: string;
  actItems?: ActItem[];
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
  guarantorName?: string;
  creditorName?: string;
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
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  // ================= 1. ХҮЛЭЭЛЦЭХ АКТ (HANDOVER ACTS) =================
  {
    id: 'handover-asset',
    title: 'Эд хөрөнгө хүлээлцэх акт',
    subtitle: 'Компьютер, оффисын тавилга, үндсэн хөрөнгө хүлээлцэх',
    category: 'handover',
    categoryLabel: 'Хүлээлцэх акт',
    mode: 'corporate',
    docType: 'ЭД ХӨРӨНГӨ ХҮЛЭЭЛЦЭХ АКТ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyNameEn: 'ARVIN TECHNOLOGY LLC',
    companyRegister: '5412980',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо',
    documentNumber: 'АКТ-26/04',
    recipient: 'Эд хөрөнгийн комисст',
    sender: 'Ахлах инженер Д.Болд',
    signatoryTitle: 'Хүлээлгэн өгсөн:',
    signatoryName: 'Д.Болд',
    secondSignatoryTitle: 'Хүлээн авсан:',
    secondSignatoryName: 'Б.Баярмаа (Нярав)',
    secondSignatoryRegister: 'УШ94051218',
    handoverLocation: 'Төв байр, 404 тоот',
    roughText: 'Ажилтны албан хэрэгцээнд ашиглаж байсан нөөц зөөврийн компьютер болон мониторыг ажлаас чөлөөлөгдөж буйтай холбогдуулан компанийн няравт хүлээлгэн өгөв.',
    formalizedText:
      'Монгол Улсын Нягтлан бодох бүртгэлийн тухай хууль болон компанийн "Үндсэн хөрөнгийн бүртгэл, хяналтын журам"-ыг үндэслэн тус байгууллагын Мэдээллийн технологийн албаны Ахлах инженер Д.Болд миний бие эзэмшилд байсан доорх эд хөрөнгийг компанийн нярав Б.Баярмаад шалган хүлээлгэн өгөв.\n\nХүлээлцэх үед бүх тоног төхөөрөмжийн бүрэн бүтэн байдал, үйлдлийн системийн ажиллагааг шалгаж, харилцан ямар нэгэн маргаангүйгээр хүлээлцсэнийг энэхүү актаар баталгаажуулав.',
    officialStamp: true,
    actItems: [
      {
        id: '1',
        name: 'Зөөврийн компьютер (MacBook Pro 16" M2)',
        quantity: '1 ширхэг',
        condition: 'Хэвийн, цэвэрхэн, зураасгүй',
        notes: 'Цэнэглэгч, цүнхний хамт',
      },
      {
        id: '2',
        name: 'Дэлгэц (Dell UltraSharp 27" 4K)',
        quantity: '1 ширхэг',
        condition: 'Ажиллагаа хэвийн, дэлгэц цэвэр',
        notes: 'Type-C, HDMI кабель дагалдав',
      },
      {
        id: '3',
        name: 'Утасгүй гар ба хулгана (Logitech MX Master)',
        quantity: '1 хос',
        condition: 'Бүрэн ажиллагаатай',
        notes: 'Няравын өрөөнд хүлээн авсан',
      },
    ],
  },
  {
    id: 'handover-job',
    title: 'Ажил хүлээлцэх акт',
    subtitle: 'Ажлын байр шилжих, үүрэг хариуцлага, бичиг баримт хүлээлцэх',
    category: 'handover',
    categoryLabel: 'Хүлээлцэх акт',
    mode: 'corporate',
    docType: 'АЖИЛ ХҮЛЭЭЛЦЭХ АКТ',
    companyName: '«МЭДЭЭЛЭЛ ТЕХНОЛОГИЙН ТӨВ» ХХК',
    companyRegister: '5120987',
    documentNumber: 'АКТ-26/12',
    recipient: 'Гүйцэтгэх удирдлагын зөвлөлд',
    sender: 'Маркетингийн менежер С.Уянга',
    signatoryTitle: 'Ажил хүлээлгэн өгсөн:',
    signatoryName: 'С.Уянга',
    secondSignatoryTitle: 'Ажил хүлээн авсан:',
    secondSignatoryName: 'М.Түвшин',
    secondSignatoryRegister: 'ЧД93010114',
    handoverLocation: 'Компанийн оффис',
    roughText: 'Маркетингийн менежерийн албан тушаалын өдөр тутмын ажил, сошиал сувгуудын нууц үг, гэрээт байгууллагуудын тооцоо, 4-р улирлын төлөвлөгөөг шинэ ажилтанд бүрэн шилжүүлж өгөв.',
    formalizedText:
      'Тус компанийн Маркетингийн албаны менежер С.Уянга нь өөр ажилд шилжих болсон тул өөрийн эрхэлж байсан ажлын чиг үүрэг, тайлан тооцоо, албан бичиг баримтуудыг дараагийн ажилтан М.Түвшинд доорх бүрэлдэхүүнээр албан ёсоор хүлээлгэн өгөв.\n\nАжил үүрэг хүлээлцэх хугацаанд хариуцаж байсан төсөл, гэрээт ажлууд болон цахим системүүдийн нэвтрэх эрхийг бүрэн шалгаж, харилцан ямар нэгэн үлдэгдэл тооцоо, маргаангүйгээр шилжүүлэн авсныг баталж байна.',
    officialStamp: true,
    actItems: [
      {
        id: '1',
        name: 'Компанийн сошиал сувгууд (FB, IG, LinkedIn)',
        quantity: '4 хуудас',
        condition: 'Админ эрх шилжүүлсэн',
        notes: '2FA тохиргоог шинэчилсэн',
      },
      {
        id: '2',
        name: '2026 оны 4-р улирлын маркетингийн төлөвлөгөө',
        quantity: '1 файл / 18 хуудас',
        condition: 'Удирдлагаар батлагдсан',
        notes: 'Google Drive хавтсанд байршуулсан',
      },
      {
        id: '3',
        name: 'Хэвлэлийн болон медиа гэрээт түншүүдийн жагсаалт',
        quantity: '8 гэрээ',
        condition: 'Тооцоо нийлсэн акттай',
        notes: 'Санхүүгийн албатай холбосон',
      },
    ],
  },

  // ================= 2. ИТГЭМЖЛЭЛ (POWERS OF ATTORNEY) =================
  {
    id: 'poa-general',
    title: 'Төлөөлөх бүрэн эрхийн итгэмжлэл',
    subtitle: 'Банк, төрийн байгууллага, гэрээ хэлцэлд бүрэн эрх олгох',
    category: 'poa',
    categoryLabel: 'Итгэмжлэл',
    mode: 'personal',
    docType: 'ИТГЭМЖЛЭЛ',
    recipient: 'Бүх шатны төрийн болон хувийн хэвшлийн байгууллага, банк санхүүгийн газарт',
    sender: 'Иргэн Б.Ганзориг',
    grantorName: 'Баатар овогтой Ганзориг',
    grantorRegister: 'УШ85101519',
    grantorAddress: 'Улаанбаатар хот, Баянзүрх дүүрэг, 25-р хороо, 14-р байр 88 тоот',
    attorneyName: 'Төмөр овогтой Төгөлдөр',
    attorneyRegister: 'ЧД92080412',
    attorneyPhone: '9911-7788',
    poaDuration: '1 (нэг) жилийн хугацаатай',
    poaScope: [
      'Банк, санхүүгийн байгууллагад данс нээх, гүйлгээ хийх, баримт бичиг хүлээн авах',
      'Төрийн үйлчилгээний E-Mongolia, Улсын бүртгэлийн байгууллагад хүсэлт гаргах, лавлагаа авах',
      'Үл хөдлөх хөрөнгийн холбогдох эрхийн бүртгэлийн асуудлаар төлөөлөх',
      'Энэхүү итгэмжлэлийг бусдад дамжуулан итгэмжлэх эрхгүй',
    ],
    signatoryTitle: 'Итгэмжлэгч:',
    signatoryName: 'Б.Ганзориг',
    secondSignatoryTitle: 'Итгэмжлэгдэгч:',
    secondSignatoryName: 'Т.Төгөлдөр',
    secondSignatoryRegister: 'ЧД92080412',
    roughText: 'Миний бие гадаадад суралцахаар явах болсон тул өөрийн төрсөн дүү Т.Төгөлдөрт банк, төрийн байгууллагад миний өмнөөс хандах, бичиг баримт бүрдүүлэх 1 жилийн хугацаатай бүрэн эрх олгож байна.',
    formalizedText:
      'Монгол Улсын Иргэний хуулийн 62 дугаар зүйлийн 62.3, 64 дүгээр зүйлийн 64.2 дахь хэсгийг тус тус үндэслэн:\n\nИтгэмжлэгч: Баатар овогтой Ганзориг (РД: УШ85101519, оршин суух хаяг: Улаанбаатар хот, Баянзүрх дүүрэг, 25-р хороо, 14-р байр 88 тоот) миний бие нь;\n\nИтгэмжлэгдэгч: Төмөр овогтой Төгөлдөр (РД: ЧД92080412, холбоо барих утас: 9911-7788)-т дараах бүрэн эрхийг олгож итгэмжилж байна.\n\nОлгосон эрх хэмжээ:\n1. Банк, банк бус санхүүгийн байгууллагад миний нэр дээрх дансаар үйлчлүүлэх, мөнгөн хөрөнгө хүлээн авах, шилжүүлэх;\n2. Төрийн болон хувийн хэвшлийн бүх шатны байгууллага, Улсын бүртгэлийн ерөнхий газар, Татварын албанд намайг бүрэн төлөөлж хүсэлт, өргөдөл гаргах, лавлагаа баримт бичгийг хүлээн авах, гарын үсэг зурах;\n3. Энэхүү итгэмжлэлийн дагуу хийсэн аливаа үйлдлийн хууль зүйн үр дагаврыг итгэмжлэгч бүрэн хариуцна.\n\nЭнэхүү итгэмжлэл нь олгосон өдрөөс эхлэн 1 (нэг) жилийн хугацаанд хүчин төгөлдөр байна. Бусдад дамжуулан итгэмжлэх эрхгүй.',
    officialStamp: false,
  },
  {
    id: 'poa-vehicle',
    title: 'Тээврийн хэрэгсэл жолоодох / захиран зарцуулах итгэмжлэл',
    subtitle: 'Автомашин жолоодох, техникийн үзлэг, даатгалд төлөөлөх',
    category: 'poa',
    categoryLabel: 'Итгэмжлэл',
    mode: 'personal',
    docType: 'ТЭЭВРИЙН ХЭРЭГСЛИЙН ИТГЭМЖЛЭЛ',
    recipient: 'Тээврийн цагдаагийн алба, Авто тээврийн үндэсний төв, Даатгалын компаниудад',
    sender: 'Өмчлөгч Н.Алтангэрэл',
    grantorName: 'Наран овогтой Алтангэрэл',
    grantorRegister: 'ХУ83042011',
    grantorAddress: 'Хан-Уул дүүрэг, 11-р хороо, Зайсан 45',
    attorneyName: 'Дорж овогтой Бат-Эрдэнэ',
    attorneyRegister: 'УШ90111215',
    attorneyPhone: '9900-5544',
    vehiclePlate: '12-34 УБҮ',
    vehicleModel: 'Toyota Land Cruiser Prado 150',
    vehicleVin: 'JTEBU5JR505123456',
    poaDuration: '3 (гурав) жилийн хугацаатай',
    poaScope: [
      'Монгол Улсын замын хөдөлгөөнд тээврийн хэрэгслийг жолоодон оролцох',
      'Техникийн оношилгоо, албан татвар, торгууль төлөх',
      'Жолоочийн хариуцлагын болон тээврийн хэрэгслийн даатгалд хамруулах, нөхөн төлбөр авах',
      'Улсын бүртгэлийн шилжилт хөдөлгөөн хийх, худалдан борлуулах',
    ],
    signatoryTitle: 'Тээврийн хэрэгсэл өмчлөгч:',
    signatoryName: 'Н.Алтангэрэл',
    secondSignatoryTitle: 'Итгэмжлэгдэгч жолооч:',
    secondSignatoryName: 'Д.Бат-Эрдэнэ',
    secondSignatoryRegister: 'УШ90111215',
    roughText: 'Миний эзэмшлийн 12-34 УБҮ улсын дугаартай Prado автомашиныг жолоодох, үзлэг оношилгоонд оруулах, шаардлагатай бол бусдад худалдах эрхийг Д.Бат-Эрдэнэд 3 жилийн хугацаатай итгэмжилж байна.',
    formalizedText:
      'Иргэний хуулийн 62, 64 дүгээр зүйлийн дагуу иргэн Н.Алтангэрэл (РД: ХУ83042011) миний бие өөрийн өмчлөлийн дараах тээврийн хэрэгслийг итгэмжлэгдэгч Д.Бат-Эрдэнэ (РД: УШ90111215)-д итгэмжлэн шилжүүлж байна.\n\nТээврийн хэрэгслийн үзүүлэлт:\n- Улсын дугаар: 12-34 УБҮ\n- Марк, загвар: Toyota Land Cruiser Prado 150\n- Арлын дугаар (VIN): JTEBU5JR505123456\n- Гэрчилгээний дугаар: 01245678\n\nОлгож буй эрх хэмжээ:\n1. Тээврийн хэрэгслийг Монгол Улсын нутаг дэвсгэрт чөлөөтэй жолоодон замын хөдөлгөөнд оролцох;\n2. Жилийн техникийн хяналтын үзлэг оношилгоонд оруулах, агаарын бохирдол, зам ашиглалтын төлбөр төлөх;\n3. Албан журмын болон сайн дурын даатгалын гэрээ байгуулах, зам тээврийн осол гарсан тохиолдолд хохирол барагдуулах, нөхөн төлбөр авах;\n4. Тээврийн хэрэгслийг бусдад худалдах, шилжүүлэх эрхийг бүрэн олгож байна.\n\nЭнэхүү итгэмжлэл нь 3 (гурав) жилийн хугацаанд хүчин төгөлдөр байна.',
    officialStamp: false,
  },

  // ================= 3. БАЙГУУЛЛАГЫН ДОТООД БИЧИГ (INTERNAL CORPORATE) =================
  {
    id: 'internal-meeting-minutes',
    title: 'Хурлын тэмдэглэл',
    subtitle: 'Удирдлагын зөвлөл, төслийн багийн хурлын шийдвэр, үүрэг даалгавар',
    category: 'internal',
    categoryLabel: 'Дотоод бичиг',
    mode: 'corporate',
    docType: 'ХУРЛЫН ТЭМДЭГЛЭЛ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyRegister: '5412980',
    documentNumber: 'ХТ-26/18',
    recipient: 'Нийт багийн гишүүдэд',
    sender: 'Хурлын нарийн бичиг Э.Ундрах',
    meetingTitle: '2026 оны 4-р улирлын төсөв, төлөвлөгөө батлах удирдлагын хурал',
    meetingChairperson: 'Гүйцэтгэх захирал Б.Батбаяр',
    meetingSecretary: 'Захирлын туслах Э.Ундрах',
    meetingAttendees: 'Б.Батбаяр, Ц.Мөнхбат, Д.Болд, С.Уранбилэг, О.Наран (Нийт 5 гишүүн 100% ирцтэй)',
    meetingAgenda: '1. 3-р улирлын гүйцэтгэлийн тайлан сонсох; 2. 4-р улирлын борлуулалтын төлөвлөгөө батлах; 3. Шинэ оффисын нүүлтийн хуваарь.',
    meetingDecisions: '1. 3-р улирлын борлуулалтын төлөвлөгөө 108% биелсэн тул амжилттайд тооцов; 2. 4-р улиралд 1.2 тэрбум төгрөгийн орлогын зорилт батлав; 3. 11 дүгээр сарын 01-ний дотор шинэ оффисын засварыг дуусгахаар шийдвэрлэв.',
    signatoryTitle: 'Хурал даргалагч:',
    signatoryName: 'Б.Батбаяр',
    secondSignatoryTitle: 'Тэмдэглэл хөтөлсөн:',
    secondSignatoryName: 'Э.Ундрах',
    roughText: 'Удирдах зөвлөлийн хурал 10 цагт эхэлж 3-р улирлын тайлан, 4-р улирлын төсвийг баталлаа. Оффис нүүлтийг 11 сарын 1 гэхэд дуусгахаар тогтов.',
    formalizedText:
      'ХУРЛЫН ЯВЦ, ХЭЛЭЛЦСЭН АСУУДАЛ:\n\n1. Санхүүгийн албанаас 3 дугаар улирлын санхүү, борлуулалтын нэгдсэн гүйцэтгэлийг танилцуулав. Төлөвлөгөө 108%-ийн биелэлттэй гарсан тул багийн гүйцэтгэлийг сайн гэж үнэлэв.\n\n2. Маркетинг, борлуулалтын албанаас 4 дүгээр улирлын зорилтот төлөвлөгөөг танилцуулж, удирдлагын зөвлөлөөс санал нэгтэйгээр 1.2 тэрбум төгрөгийн төсвийг батлав.\n\n3. Захиргааны албанаас шинэ оффисын байрны засварын явцыг мэдээлж, 2026 оны 11 дүгээр сарын 01-ний өдрөөр тасалбар болгон нүүж дуусахаар тогтов.\n\nГАРСАН ШИЙДВЭР:\n1. 4-р улирлын төсвийг баталж, төсвийн хуваарилалтыг Санхүүгийн албанд үүрэг болгов.\n2. Нүүлтийн ажлын хэсгийн ахлагчаар Д.Болдыг томилж, ажлын явцыг долоо хоног бүр танилцуулахаар тогтов.',
    officialStamp: true,
    meetingActionItems: [
      {
        id: '1',
        task: '4-р улирлын төсвийн нарийвчилсан задаргааг батлуулах',
        assignee: 'С.Уранбилэг (Санхүү)',
        deadline: '2026.10.05',
      },
      {
        id: '2',
        task: 'Шинэ оффисын интернет сүлжээ, серверийн өрөө бэлтгэх',
        assignee: 'Д.Болд (МТ алба)',
        deadline: '2026.10.15',
      },
      {
        id: '3',
        task: 'Нүүлтийн ложистикийн компанийн гэрээ хийх',
        assignee: 'О.Наран (Захиргаа)',
        deadline: '2026.10.20',
      },
    ],
  },
  {
    id: 'internal-memo',
    title: 'Дотоод санамж бичиг (Memo)',
    subtitle: 'Хэлтэс хоорондын мэдээлэл солилцоо, мэдэгдэл',
    category: 'internal',
    categoryLabel: 'Дотоод бичиг',
    mode: 'corporate',
    docType: 'ДОТООД САНАМЖ БИЧИГ',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyRegister: '5412980',
    documentNumber: 'СБ-26/41',
    recipient: 'Бүх хэлтсийн дарга нар, нийт ажилтнуудад',
    sender: 'Хүний нөөцийн албаны дарга Б.Эрдэнэчимэг',
    memoSubject: 'Ажлын цагийн горим болон мэдээллийн аюулгүй байдлын тухай',
    memoAttachmentsCount: '1 файл (Журмын шинэчилсэн найруулга)',
    signatoryTitle: 'Хүний нөөцийн захирал:',
    signatoryName: 'Б.Эрдэнэчимэг',
    roughText: '10 сарын 1-нээс эхлээд өвлийн цагийн хуваарь 08:30-17:30 болж өөрчлөгдөнө. Мөн оффисоос гарахдаа ком-оо заавал унтрааж цоожилж байх шаардлагатайг сануулж байна.',
    formalizedText:
      'Энэхүү дотоод санамж бичгээр нийт ажилтнуудад дараах хоёр чухал асуудлыг анхааруулан мэдэгдэж байна.\n\n1. Өвлийн цагийн хуваарийн шилжилт:\nКомпанийн дотоод журмын 3.1-т заасны дагуу 2026 оны 10 дугаар сарын 01-ний өдрөөс эхлэн ажлын үндсэн цаг 08:30 - 17:30 болж өөрчлөгдөнө. Нийт ажилтнууд ажлын цагийг чанд мөрдөж, цаг бүртгэлийн хурууны хээгээ тогтмол бүртгүүлнэ үү.\n\n2. Мэдээллийн аюулгүй байдлын стандарт:\nСүүлийн үед дэлхий дахинд гарч буй кибер халдлагуудтай холбогдуулан ажлын байраа орхин явахдаа компьютероо заавал "Lock" хийх, нууц үгээ бусдад задруулахгүй байх, байгууллагын чухал баримт бичгийг ширээн дээр ил орхихгүй байх (Clean Desk Policy)-ийг хатуу мөрдөнө үү.\n\nДээрх зааврыг зөрчсөн тохиолдолд байгууллагын дотоод журмын дагуу хариуцлага тооцох болохыг мэдэгдье.',
    officialStamp: true,
  },
  {
    id: 'internal-disciplinary',
    title: 'Сахилгын шийтгэл / Сануулга мэдэгдэх хуудас',
    subtitle: 'Хөдөлмөрийн сахилгын зөрчил, албан сануулга өгөх',
    category: 'internal',
    categoryLabel: 'Дотоод бичиг',
    mode: 'corporate',
    docType: 'САХИЛГЫН ШИЙТГЭЛИЙН МЭДЭГДЭХ ХУУДАС',
    companyName: '«АРВИН ТЕХНОЛОГИ» ХХК',
    companyRegister: '5412980',
    documentNumber: 'СШ-26/05',
    recipient: 'Агуулахын ахлах ажилтан Т.Ганболд танаа',
    sender: 'Хүний нөөцийн алба',
    employeeName: 'Төмөр овогтой Ганболд',
    employeePosition: 'Агуулахын ахлах нярав',
    infractionDescription: '2026 оны 09 сарын 20 болон 22-ны өдрүүдэд хүндэтгэх шалтгаангүйгээр нийт 8 цаг ажил тасалж, эд хөрөнгийн хүлээлцэх үйл явцыг саатуулсан.',
    disciplinaryActionType: 'Сануулах сахилгын шийтгэл',
    legalBasis: 'Монгол Улсын Хөдөлмөрийн тухай хуулийн 123 дугаар зүйлийн 123.2.1, Хөдөлмөрийн дотоод журмын 8.2 дахь заалт',
    signatoryTitle: 'Гүйцэтгэх захирал:',
    signatoryName: 'Б.Батбаяр',
    secondSignatoryTitle: 'Танилцсан ажилтан:',
    secondSignatoryName: 'Т.Ганболд',
    secondSignatoryRegister: 'УШ89091012',
    roughText: 'Ажилтан Т.Ганболд 2 хоног хүндэтгэх шалтгаангүй ажил тасалсан тул Хөдөлмөрийн хуулийн дагуу сануулах сахилгын шийтгэл оногдуулж, давтан гаргавал ажлаас халахыг анхааруулж байна.',
    formalizedText:
      'Монгол Улсын Хөдөлмөрийн тухай хуулийн 123 дугаар зүйлийн 123.2.1 дэх заалт болон компанийн Хөдөлмөрийн дотоод журмын 8.2-ыг үндэслэн тус компанийн Агуулахын ахлах нярав албан тушаалтай Төмөр овогтой Ганболд (РД: УШ89091012)-д дараах үндэслэлээр сахилгын шийтгэл оногдуулж байна.\n\nЗөрчлийн агуулга:\nАжилтан Т.Ганболд нь 2026 оны 09 дүгээр сарын 20 болон 22-ны өдрүүдэд урьдчилан мэдэгдэлгүй, хүндэтгэх шалтгаангүйгээр нийт 8 цаг ажил тасалж, үйл ажиллагаанд хүндрэл учруулсан нь тогтоогдсон болно.\n\nОногдуулсан сахилгын шийтгэл: "САНУУЛАХ ШИЙТГЭЛ".\n\nЭнэхүү сахилгын шийтгэл нь ногдуулсан өдрөөс хойш 1 (нэг) жилийн хугацаанд хүчинтэй байх бөгөөд уг хугацаанд хөдөлмөрийн сахилгын зөрчил дахин гаргасан тохиолдолд Хөдөлмөрийн гэрээг шууд цуцлах (ажлаас халах) хүртэл арга хэмжээ авахыг хатуу анхааруулж байна.',
    officialStamp: true,
  },

  // ================= 4. БАТАЛГАА & ШААРДАХ БИЧИГ (GUARANTEES) =================
  {
    id: 'guarantee-payment',
    title: 'Төлбөр төлөх баталгааны хуудас',
    subtitle: 'Гэрээний төлбөр, үлдэгдлийг хугацаанд нь төлөх албан ёсны баталгаа',
    category: 'guarantee',
    categoryLabel: 'Баталгааны бичиг',
    mode: 'corporate',
    docType: 'ТӨЛБӨР ТӨЛӨХ БАТАЛГААНЫ ХУУДАС',
    companyName: '«МОНГОЛ БИЛДИНГ» ХХК',
    companyRegister: '4567890',
    documentNumber: 'БТ-26/09',
    recipient: '«Нью Проперти» ХХК-ийн Санхүүгийн албанд',
    sender: '«Монгол Билдинг» ХХК-ийн Гүйцэтгэх захирал Ч.Батсайхан',
    guarantorName: '«Монгол Билдинг» ХХК (РД: 4567890)',
    creditorName: '«Нью Проперти» ХХК',
    paymentAmountNumber: '85,000,000',
    paymentAmountWords: 'наян таван сая төгрөг',
    paymentDueDate: '2026 оны 10 дугаар сарын 25-ны өдөр',
    signatoryTitle: 'Баталгаа гаргасан Гүйцэтгэх захирал:',
    signatoryName: 'Ч.Батсайхан',
    secondSignatoryTitle: 'Баталгаа хүлээн авсан:',
    secondSignatoryName: 'С.Мөнхжаргал',
    roughText: 'Барилгын материалын үлдэгдэл 85 сая төгрөгийг 10 сарын 25 гэхэд бүрэн төлж дуусгана. Хэрэв хугацаа хоцорвол өдрийн 0.5 хувийн алданги тооцохыг зөвшөөрч байна.',
    formalizedText:
      'Хоёр талын хооронд 2026 оны 06 дугаар сарын 10-ны өдөр байгуулсан №БМ-26/18 тоот "Барилгын материал нийлүүлэх гэрээ"-ний дагуу манай компанийн төлөх төлбөрийн үлдэгдэл 85,000,000 (наян таван сая) төгрөгийг 2026 оны 10 дугаар сарын 25-ны өдрийн дотор танай байгууллагын дансанд бүрэн шилжүүлж дуусгахыг үүгээр үл маргах журмаар БАТЛАН ДААЖ байна.\n\nХэрэв заасан хугацаанд төлбөрийг бүрэн барагдуулаагүй тохиолдолд Монгол Улсын Иргэний хуулийн 232 дугаар зүйлийн 232.6-д заасны дагуу хугацаа хэтэрсэн хоног тутамд гүйцэтгээгүй үүргийн үнийн дүнгийн 0.5 (тэг аравны тав) хувийн алданги тооцож төлөх, мөн компанийн нэр дээрх үл хөдлөх хөрөнгө, дансны орлогоор үүргийн гүйцэтгэлийг хангуулахыг бүрэн зөвшөөрч байгаа болно.\n\nЭнэхүү баталгааны бичиг нь талуудын төлбөрийн тооцоо бүрэн дуусах хүртэл хуулийн дагуу хүчинтэй байна.',
    officialStamp: true,
  },

  // ================= 5. АЛБАН ТООТ & МЭДЭГДЭЛ (B2B CORPORATE) =================
  {
    id: 'corp-official-letter',
    title: 'Компанийн албан тоот',
    subtitle: 'Түнш эсвэл харилцагч байгууллагад албан тоот илгээх',
    category: 'corporate_letter',
    categoryLabel: 'Албан тоот',
    mode: 'corporate',
    docType: 'АЛБАН ТООТ',
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
    recipient: '«Монгол Шуудан» ХК-ийн Мэдээллийн технологийн газрын захирал Ц.Мөнхбат танаа',
    sender: '«Арвин Технологи» ХХК-ийн Гүйцэтгэх захирал Б.Батбаяр',
    senderPhone: '7711-0099',
    senderRegister: '5412980',
    duration: '',
    roughText: 'Манай хоёр байгууллагын хооронд цахим системийн интеграцчлалын ажил явагдаж байгаа. Туршилтын орчны холболт дууссан тул бодит орчны серверийн тохиргоо, API түлхүүрийг шилжүүлж өгөхийг хүсье.',
    formalizedText:
      'Энэхүү албан бичгээр танай хамт олонд энэ өдрийн мэндийг дэвшүүлж, цаашдын ажил үйлсэд тань өндөр амжилт хүсье.\n\nМанай хоёр байгууллагын хооронд байгуулсан 2026 оны хамтран ажиллах санамж бичгийн хүрээнд хийгдэж буй "Цахим үйлчилгээний нэгдсэн систем"-ийн туршилтын (Sandbox) орчны интеграцийн ажил бүрэн амжилттай хийгдэж дууссан болохыг мэдэгдэж байна.\n\nИймд систем хөгжүүлэлтийн дараагийн шат буюу бодит (Production) орчны серверийн тохиргоо, холболтын API түлхүүрүүд болон аюулгүй байдлын протоколыг 2026 оны 10 дугаар сарын 10-ны өдрийн дотор манай техникийн багт шилжүүлэн өгч хамтран ажиллана уу.\n\nЦаашид хамтын ажиллагаа улам бүр өргөжин хөгжинө гэдэгт гүнээ итгэж байна.',
    officialStamp: true,
  },
  {
    id: 'corp-payment-demand',
    title: 'Төлбөр барагдуулах шаардах бичиг',
    subtitle: 'Гэрээний дагуу хугацаа хэтэрсэн өр авлагыг шаардах',
    category: 'guarantee',
    categoryLabel: 'Шаардах бичиг',
    mode: 'corporate',
    docType: 'ШААРДАХ БИЧИГ',
    companyName: '«ГЭРЭЛ ИНВЕСТ» ХХК',
    companyNameEn: 'GEREL INVEST LLC',
    companyRegister: '5198762',
    companyAddress: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 8-р хороо, Бага тойруу 49',
    companyPhone: '7555-1212',
    companyEmail: 'finance@gerelinvest.mn',
    companyWebsite: 'www.gerelinvest.mn',
    documentNumber: '26/142',
    signatoryTitle: 'Гүйцэтгэх захирал',
    signatoryName: 'О.Наранбаатар',
    recipient: '«Болор Констракшн» ХХК-ийн Ерөнхий захирал С.Баяр танаа',
    sender: '«Гэрэл Инвест» ХХК-ийн Гүйцэтгэх захирал О.Наранбаатар',
    senderPhone: '7555-1212',
    senderRegister: '5198762',
    duration: 'Бичиг хүлээн авснаас хойш ажлын 5 өдрийн дотор',
    roughText: '2026 оны 05 сарын 12-ны гэрээний дагуу танай компани 48,000,000 төгрөгийн төлбөрийг өгөөгүй 60 хоног өнгөрлөө. 5 хоногийн дотор төлбөрөө барагдуулахгүй бол шүүхэд хандахыг мэдэгдье.',
    formalizedText:
      'Танай байгууллага болон манай компанийн хооронд байгуулсан 2026 оны 05 дугаар сарын 12-ны өдрийн №Г-26/45 тоот "Бараа нийлүүлэх гэрээ"-ний дагуу манай талаас нийлүүлсэн бараа материалыг бүрэн хүлээн авсан атлаа гэрээний 4.2-т заасан төлбөрийн хуваарийг ноцтой зөрчиж байгааг үүгээр мэдэгдэж байна.\n\nӨнөөдрийн байдлаар төлөгдөөгүй үлдсэн үндсэн төлбөр нь 48,000,000 (дөчин найман сая) төгрөг бөгөөд төлбөр төлөх хугацаа 60 хоногоор хэтэрсэн байна. Манай зүгээс удаа дараа утсаар болон албан бусаар сануулсан боловч бодит арга хэмжээ авагдсангүй.\n\nИймд энэхүү шаардах бичгийг хүлээн авсан өдрөөс хойш ажлын 5 (тав) хоногийн дотор дээрх төлбөрийг манай компанийн дансанд бүрэн шилжүүлж, тооцоог барагдуулахыг хатуу шаардаж байна.\n\nХэрэв заасан хугацаанд төлбөр төлөгдөөгүй тохиолдолд Монгол Улсын Иргэний хууль болон гэрээнд заасны дагуу хугацаа хэтрүүлсний алданги тооцож, шүүхийн байгууллагад нэхэмжлэл гарган шийдвэрлүүлэх болохыг мэдэгдье.',
    officialStamp: true,
  },

  // ================= 6. ИРГЭН / АЖИЛТНЫ ӨРГӨДӨЛ (APPLICATIONS) =================
  {
    id: 'leave-personal',
    title: 'Чөлөө авах өргөдөл',
    subtitle: 'Хувийн шалтгаанаар 2-3 хоногийн чөлөө хүсэх',
    category: 'application',
    categoryLabel: 'Өргөдөл',
    mode: 'personal',
    docType: 'ӨРГӨДӨЛ',
    recipient: 'Гүйцэтгэх захирал танаа',
    sender: 'Борлуулалтын хэлтсийн мэргэжилтэн Д.Болд',
    senderPhone: '9911-2345',
    senderRegister: 'УШ92051412',
    duration: '2026.10.01 - 2026.10.03 (3 хоног)',
    roughText: 'Би 10 сарын 1-нээс 3-ны хооронд ар гэрийн хувийн ажлаар хөдөө явах шаардлага гарсан тул 3 хоногийн чөлөө олгож өгнө үү.',
    formalizedText:
      'Миний бие Борлуулалтын хэлтсийн мэргэжилтэн Д.Болд нь ар гэрийн зайлшгүй хувийн шалтгааны улмаас 2026 оны 10 дугаар сарын 01-ний өдрөөс 10 дугаар сарын 03-ны өдрийг дуустал хугацаанд (ажлын 3 өдөр) түр хугацаагаар ажил үүргээсээ чөлөөлөгдөх шаардлагатай байна.\n\nЭнэ хугацаанд хариуцсан ажлын өдөр тутмын хэвийн үйл ажиллагааг тасалдуулахгүй байх үүднээс өөрийн үндсэн ажлыг хамт ажиллагч Б.Батбаатарт албан ёсоор хүлээлгэн өгсөн болно.\n\nИймд миний хүсэлтийг хүлээн авч, дурдсан хугацаанд цалингүй чөлөө олгож шийдвэрлэж өгнө үү.',
  },
  {
    id: 'resignation',
    title: 'Ажлаас чөлөөлөгдөх өргөдөл',
    subtitle: 'Өөрийн хүсэлтээр ажлаас чөлөөлөгдөх хүсэлт',
    category: 'application',
    categoryLabel: 'Өргөдөл',
    mode: 'personal',
    docType: 'ӨРГӨДӨЛ',
    recipient: 'Компанийн Ерөнхий захирал танаа',
    sender: 'Ахлах нягтлан бодогч С.Уранбилэг',
    senderPhone: '9512-7890',
    senderRegister: 'ХУ88031520',
    duration: '2026 оны 10 дугаар сарын 31-нээс эхлэн',
    roughText: 'Би өөр ажилд шилжих болсон тул намайг 10 сарын 31-нээр өөрийн хүсэлтээр ажлаас чөлөөлж өгнө үү. Тооцоо хийж дуусгана.',
    formalizedText:
      'Миний бие С.Уранбилэг нь хувийн болон гэр бүлийн шалтгаанаар өөр ажилд шилжин ажиллах болсон тул Монгол Улсын Хөдөлмөрийн тухай хуулийн холбогдох заалтын дагуу 2026 оны 10 дугаар сарын 31-ний өдрөөр тасалбар болгон өөрийн хүсэлтээр ажил үүргээсээ чөлөөлөгдөх хүсэлт гаргаж байна.\n\nАжиллах хугацаанд эрхэлсэн ажил үүрэг, эд хөрөнгө, санхүүгийн холбогдох тооцоог холбогдох журмын дагуу бүрэн хариуцан хүлээлгэн өгөх болно.\n\nИймд миний өргөдлийг хүлээн авч, зохих журмын дагуу шийдвэрлэж өгнө үү.',
  },
  {
    id: 'employment-verification',
    title: 'Ажлын газрын тодорхойлолт',
    subtitle: 'Банкны зээл, виз болон бусад байгууллагад гаргаж өгөх',
    category: 'application',
    categoryLabel: 'Тодорхойлолт',
    mode: 'personal',
    docType: 'ТОДОРХОЙЛОЛТ',
    recipient: 'Хаан банкны холбогдох салбарт',
    sender: 'Хүний нөөцийн алба',
    senderPhone: '7011-8899',
    senderRegister: 'Байгууллагын РД: 1234567',
    duration: '2024 оноос хойш өнөөг хүртэл',
    roughText: 'Ажилтан Т.Билгүүн манайд 2024 оноос хойш инженерээр үндсэн ажилтнаар ажиллаж байгаа нь үнэн болно. Сар бүр 3.5 сая төгрөгийн цалинтай.',
    formalizedText:
      'Тус компанийн Хүний нөөцийн албанаас Төмөр овогтой Билгүүн (РД: УШ93021518) нь тус байгууллагын Мэдээлэл технологийн газрын Ахлах инженер албан тушаалд 2024 оны 03 дугаар сарын 01-ний өдрөөс өнөөг хүртэл тасралтгүй, хөдөлмөрийн үндсэн гэрээгээр ажиллаж байгаа нь үнэн болохыг тодорхойлж байна.\n\nТ.Билгүүний сарын үндсэн цалин нь 3,500,000 (гурван сая таван зуун мянга) төгрөг бөгөөд нийгмийн даатгалын шимтгэл, хувь хүний орлогын албан татвар хуулийн дагуу тогтмол төлөгддөг болно.\n\nЭнэхүү тодорхойлолтыг банкны зээлийн хүсэлтэд хавсаргах зориулалтаар хүсэлтийн дагуу олгож баталгаажуулав.',
  },
];

import { AppSettings, OrgProfile } from '../types/document';

export const getFormattedMongolianDate = (
  dateInput?: Date | string,
  format: 'formal_full' | 'numeric' | 'formal_short' = 'formal_full'
): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) {
    return String(dateInput || '');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'numeric':
      return `${year}.${month}.${day}`;
    case 'formal_short':
      return `${year} оны ${month} сарын ${day}`;
    case 'formal_full':
    default:
      return `${year} оны ${month} дүгээр сарын ${day}`;
  }
};

export const generateDocNumber = (
  prefix: string = 'АБ',
  year: string = String(new Date().getFullYear()),
  counter: number = 1
): string => {
  const shortYear = year.slice(-2);
  const formattedCounter = String(counter).padStart(3, '0');
  // Formats like: АБ-2026-001 or АКТ-26/04
  if (prefix.includes('АКТ') || prefix.includes('ҮС') || prefix.includes('ИТ')) {
    return `${prefix}-${shortYear}/${String(counter).padStart(2, '0')}`;
  }
  return `${prefix}-${year}-${formattedCounter}`;
};

export const formatRecipientBlock = (
  org: string,
  title: string,
  name: string
): string => {
  const parts: string[] = [];
  if (org.trim()) {
    let formattedOrg = org.trim();
    if (!formattedOrg.endsWith('д') && !formattedOrg.endsWith('т') && !formattedOrg.includes('ХХК-ийн') && !formattedOrg.includes('ХК-ийн')) {
      formattedOrg = `${formattedOrg}-ийн`;
    }
    parts.push(formattedOrg);
  }
  if (title.trim()) {
    parts.push(title.trim());
  }
  if (name.trim()) {
    let formattedName = name.trim();
    if (!formattedName.endsWith('танаа') && !formattedName.endsWith('д') && !formattedName.endsWith('т')) {
      formattedName = `${formattedName} танаа`;
    }
    parts.push(formattedName);
  }
  return parts.join('\n');
};

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
  numberingYear: String(new Date().getFullYear()),
  numberingCounter: 1,
  dateFormat: 'formal_full',
  pageNumberStyle: 'none',
  lineSpacing: '1.6',
  textAlign: 'justify',
};

export const STORAGE_KEYS = {
  DOCUMENTS: 'alban_bichig_saved_documents_v2',
  ACTIVE_DOC: 'alban_bichig_active_document_v2',
  ORG_PROFILE: 'alban_bichig_org_profile_v2',
  SETTINGS: 'alban_bichig_settings_v2',
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
};

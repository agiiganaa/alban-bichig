import React, { useState } from 'react';
import { AppSettings } from '../types/document';
import { generateDocNumber, getFormattedMongolianDate } from '../utils/documentUtils';
import {
  Settings,
  Hash,
  Calendar,
  Layers,
  Save,
  CheckCircle2,
  FileDigit,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const sampleDocNumber = generateDocNumber(
    formData.numberingPrefix,
    formData.numberingYear,
    formData.numberingCounter
  );

  const sampleDate = getFormattedMongolianDate(new Date(), formData.dateFormat);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Системийн тохиргоо
        </h2>
        <p className="text-xs text-slate-500">
          Албан бичгийн авто дугаарлалт, огнооны формат, хуудасны дугаарлалтын тохиргоо
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. Document Numbering Settings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Hash className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Албан бичгийн дугаарлалт (Auto numbering)
              </h3>
              <p className="text-xs text-slate-500">
                Шинэ баримт үүсгэх үед автоматаар дараагийн дугаарыг тооцоолно
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Угтвар үг (Prefix)
              </label>
              <input
                type="text"
                value={formData.numberingPrefix}
                onChange={(e) =>
                  setFormData({ ...formData, numberingPrefix: e.target.value })
                }
                placeholder="АБ, АКТ, ИТ, ҮС"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">ж.нь: АБ, АКТ, ГР</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Он (Year)
              </label>
              <input
                type="text"
                value={formData.numberingYear}
                onChange={(e) =>
                  setFormData({ ...formData, numberingYear: e.target.value })
                }
                placeholder="2026"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">ж.нь: 2026 эсвэл 26</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Эхлэх тоолуур (Counter)
              </label>
              <input
                type="number"
                min="1"
                value={formData.numberingCounter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberingCounter: parseInt(e.target.value, 10) || 1,
                  })
                }
                placeholder="1"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Дараагийн дугаар</span>
            </div>
          </div>

          {/* Numbering Preview Card */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">
              Одоо үүсэх дугаарын хэлбэр:
            </span>
            <span className="font-mono font-bold text-base text-blue-900 bg-white px-3 py-1 rounded-md border border-blue-200 shadow-2xs">
              № {sampleDocNumber}
            </span>
          </div>
        </div>

        {/* 2. Date Format Settings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Огнооны стандарт формат
              </h3>
              <p className="text-xs text-slate-500">
                Баримт бичгийн толгой хэсэгт бичигдэх огнооны хэв загвар
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="formal_full"
                  checked={formData.dateFormat === 'formal_full'}
                  onChange={() =>
                    setFormData({ ...formData, dateFormat: 'formal_full' })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Стандарт бүтэн (Монгол хэлбэр)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Жил, сар, өдрийг үгээр бичих
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                2026 оны 09 дүгээр сарын 29
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="numeric"
                  checked={formData.dateFormat === 'numeric'}
                  onChange={() =>
                    setFormData({ ...formData, dateFormat: 'numeric' })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Тоон товч хэлбэр (Numeric)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Цэгээр тусгаарласан тоо
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                2026.09.29
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="dateFormat"
                  value="formal_short"
                  checked={formData.dateFormat === 'formal_short'}
                  onChange={() =>
                    setFormData({ ...formData, dateFormat: 'formal_short' })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Богино монгол хэлбэр
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Дүгээр дагаваргүй
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                2026 оны 09 сарын 29
              </span>
            </label>
          </div>
        </div>

        {/* 3. Page Numbering Settings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileDigit className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Хуудасны дугаарлалт (Page Numbering)
              </h3>
              <p className="text-xs text-slate-500">
                Олон хуудастай баримтын хөл хэсэгт байрлах хуудасны дугаарын хэлбэр
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label
              className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 ${
                formData.pageNumberStyle === 'none'
                  ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pageNumberStyle"
                  value="none"
                  checked={formData.pageNumberStyle === 'none'}
                  onChange={() =>
                    setFormData({ ...formData, pageNumberStyle: 'none' })
                  }
                />
                <span className="font-bold text-slate-800">Харуулахгүй</span>
              </div>
              <span className="text-[11px] text-slate-400">1 хуудастай баримтад</span>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 ${
                formData.pageNumberStyle === 'hyphen'
                  ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pageNumberStyle"
                  value="hyphen"
                  checked={formData.pageNumberStyle === 'hyphen'}
                  onChange={() =>
                    setFormData({ ...formData, pageNumberStyle: 'hyphen' })
                  }
                />
                <span className="font-bold text-slate-800">Зураастай</span>
              </div>
              <span className="font-mono font-bold text-slate-700 text-center py-1 bg-slate-50 rounded">
                - 1 -
              </span>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between space-y-2 ${
                formData.pageNumberStyle === 'fraction'
                  ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pageNumberStyle"
                  value="fraction"
                  checked={formData.pageNumberStyle === 'fraction'}
                  onChange={() =>
                    setFormData({ ...formData, pageNumberStyle: 'fraction' })
                  }
                />
                <span className="font-bold text-slate-800">Нийтээр харуулах</span>
              </div>
              <span className="font-mono font-bold text-slate-700 text-center py-1 bg-slate-50 rounded">
                1 / 1
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Тохиргоо амжилттай хадгалагдлаа!</span>
            </span>
          )}

          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Тохиргоог хадгалах</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { OrgProfile } from '../types/document';
import {
  Building2,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface OrganizationProfileViewProps {
  profile: OrgProfile;
  onSaveProfile: (profile: OrgProfile) => void;
  onApplyToCurrentDoc?: () => void;
}

export const OrganizationProfileView: React.FC<OrganizationProfileViewProps> = ({
  profile,
  onSaveProfile,
  onApplyToCurrentDoc,
}) => {
  const [formData, setFormData] = useState<OrgProfile>(profile);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, companyLogo: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Байгууллагын профайл & Албан хэвлэмэл хуудас
          </h2>
          <p className="text-xs text-slate-500">
            Энд оруулсан мэдээлэл бүх шинэ албан бичиг, албан тоотод автоматаар бөглөгдөнө
          </p>
        </div>

        {onApplyToCurrentDoc && (
          <button
            type="button"
            onClick={onApplyToCurrentDoc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Одоогийн баримтад хэрэглэх</span>
          </button>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5"
      >
        {/* Logo and Name header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {formData.companyLogo ? (
              <img
                src={formData.companyLogo}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {formData.companyName
                  ? formData.companyName.replace(/[^а-яөүёa-z0-9]/gi, '').charAt(0) || 'M'
                  : 'M'}
              </div>
            )}

            <div className="space-y-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Лого оруулах</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {formData.companyLogo && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, companyLogo: '' })}
                  className="block text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Лого устгах
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 sm:text-right">
            <span className="text-[11px] text-slate-400 font-mono">
              Албан хэвлэмэл хуудасны стандарт загвар
            </span>
          </div>
        </div>

        {/* Company Names & RD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Байгууллагын нэр (Монголоор)
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="«АРВИН ТЕХНОЛОГИ» ХХК"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Байгууллагын нэр (Англиар / Дэд гарчиг)
            </label>
            <input
              type="text"
              value={formData.companyNameEn}
              onChange={(e) =>
                setFormData({ ...formData, companyNameEn: e.target.value })
              }
              placeholder="ARVIN TECHNOLOGY LLC"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Регистрийн дугаар (РД)
            </label>
            <input
              type="text"
              value={formData.companyRegister}
              onChange={(e) =>
                setFormData({ ...formData, companyRegister: e.target.value })
              }
              placeholder="5412980"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Утас</label>
            <input
              type="text"
              value={formData.companyPhone}
              onChange={(e) =>
                setFormData({ ...formData, companyPhone: e.target.value })
              }
              placeholder="7711-0099, 9911-2233"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">И-мэйл</label>
            <input
              type="email"
              value={formData.companyEmail}
              onChange={(e) =>
                setFormData({ ...formData, companyEmail: e.target.value })
              }
              placeholder="contact@company.mn"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Албан ёсны хаяг
            </label>
            <input
              type="text"
              value={formData.companyAddress}
              onChange={(e) =>
                setFormData({ ...formData, companyAddress: e.target.value })
              }
              placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Вэбсайт</label>
            <input
              type="text"
              value={formData.companyWebsite}
              onChange={(e) =>
                setFormData({ ...formData, companyWebsite: e.target.value })
              }
              placeholder="www.company.mn"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Signatory Defaults */}
        <div className="pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            Удирдлага / Албан ёсны гарын үсэг зурагч
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Албан тушаал
              </label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) =>
                  setFormData({ ...formData, signatoryTitle: e.target.value })
                }
                placeholder="Гүйцэтгэх захирал"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Овог нэр</label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) =>
                  setFormData({ ...formData, signatoryName: e.target.value })
                }
                placeholder="Б.Батбаяр"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <div>
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Байгууллагын мэдээлэл амжилттай хадгалагдлаа!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Мэдээллийг хадгалах</span>
          </button>
        </div>
      </form>
    </div>
  );
};

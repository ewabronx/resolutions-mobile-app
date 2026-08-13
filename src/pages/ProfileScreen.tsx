import { Palette, SunMedium, MoonStar, Sparkles, Crown } from 'lucide-react';
import { updateMyProfile, updateMySettings } from '../lib/api';
import { useAppStore } from '../store';
import type { MBTIType } from '../types';

const mbtiOptions: MBTIType[] = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];

const themeMeta = {
  classic: { icon: SunMedium, label: 'Classic' },
  modern: { icon: Sparkles, label: 'Modern' },
  dark: { icon: MoonStar, label: 'Dark' },
  luxury: { icon: Crown, label: 'Luxury' }
} as const;

export default function ProfileScreen() {
  const profile = useAppStore((state) => state.profile);
  const theme = useAppStore((state) => state.theme);
  const user = useAppStore((state) => state.user);
  const token = useAppStore((state) => state.token);
  const setProfile = useAppStore((state) => state.setProfile);
  const setTheme = useAppStore((state) => state.setTheme);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);

  const persistProfile = async (nextProfile: typeof profile) => {
    setProfile(nextProfile);
    if (!token) return;

    await updateMyProfile(token, {
      mbti_type: nextProfile.mbtiType ?? null,
      theme
    });
  };

  const cardClass = theme === 'dark' ? 'border-[#374151] bg-[#1f2937]/95 text-[#f3f4f6]' : theme === 'modern' ? 'border border-[#7c6cff]/40 bg-[rgba(19,16,37,0.52)] backdrop-blur-xl shadow-[0_18px_45px_rgba(0,217,255,0.1)] text-[#f5f7ff]' : theme === 'luxury' ? 'border border-[#d4af6a]/35 bg-[rgba(31,21,14,0.72)] backdrop-blur-xl shadow-[0_18px_45px_rgba(212,175,106,0.12)] text-[#f7e8c7]' : 'border-[#F1E4CC] bg-[#fff8eb]/90 text-[#2C2725]';
  const inputClass = theme === 'dark' ? 'border-[#374151] bg-[#0f172a] text-[#f3f4f6]' : theme === 'modern' ? 'border border-[#7c6cff]/40 bg-[rgba(32,27,55,0.65)] text-[#f5f7ff] shadow-inner shadow-[#00d9ff]/10' : theme === 'luxury' ? 'border border-[#d4af6a]/35 bg-[rgba(43,29,18,0.72)] text-[#f7e8c7] shadow-inner shadow-[#d4af6a]/10' : 'border-[#F1E4CC] bg-[#fcf7ea] text-[#2C2725]';
  const ThemeIcon = themeMeta[theme].icon;

  return (
    <div className="space-y-4">
      <div className={`rounded-[24px] border p-4 shadow-[0_6px_18px_rgba(140,96,70,0.14)] ${cardClass}`}>
        <h2 className="font-serif text-2xl font-semibold">Profil</h2>
        <div className="mt-4 grid gap-3">
          <input value={profile.firstName} onChange={(event) => void persistProfile({ ...profile, firstName: event.target.value })} placeholder="Imię" className={`rounded-2xl border p-3 outline-none ${inputClass}`} />
          <input value={profile.lastName} onChange={(event) => void persistProfile({ ...profile, lastName: event.target.value })} placeholder="Nazwisko" className={`rounded-2xl border p-3 outline-none ${inputClass}`} />
          <select value={profile.mbtiType ?? ''} onChange={(event) => void persistProfile({ ...profile, mbtiType: (event.target.value || null) as MBTIType | null })} className={`rounded-2xl border p-3 outline-none ${inputClass}`}>
            <option value="">Wybierz typ MBTI</option>
            {mbtiOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>

      <div className={`rounded-[24px] border p-4 shadow-[0_6px_18px_rgba(140,96,70,0.14)] ${cardClass}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl">Motyw</h3>
          <div className={`flex items-center gap-2 rounded-full border px-2 py-1 text-sm ${theme === 'luxury' ? 'border-[#d4af6a]/40 bg-[#2b1b12] text-[#f7e8c7]' : theme === 'dark' ? 'border-[#374151] bg-[#111827] text-[#f3f4f6]' : theme === 'modern' ? 'border-[#7c6cff]/30 bg-[rgba(17,13,32,0.7)] text-[#f5f7ff]' : 'border-[#d7d2cb] bg-[#f8f4ef] text-[#2C2725]'}`}>
            <Palette size={14} />
            <ThemeIcon size={14} />
          </div>
        </div>
        <select value={theme} onChange={async (event) => {
          const nextTheme = event.target.value as 'classic' | 'modern' | 'dark' | 'luxury';
          setTheme(nextTheme);
          if (!token) return;
          await updateMySettings(token, { theme: nextTheme });
        }} className={`mt-3 w-full rounded-2xl border p-3 outline-none ${inputClass}`}>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="dark">Dark</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <div className={`rounded-[24px] border p-4 shadow-[0_6px_18px_rgba(140,96,70,0.14)] ${cardClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] opacity-70">Konto</p>
            <p className="mt-1 font-medium">{user?.full_name || user?.email || 'Użytkownik'}</p>
          </div>
          <button
            type="button"
            onClick={clearAuthSession}
            className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </div>
  );
}

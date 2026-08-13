import { useEffect, useMemo } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home, Radar, User, Bell } from 'lucide-react';
import { syncAppDataFromApi } from './lib/api';
import { useAppStore } from './store';
import AuthScreen from './pages/AuthScreen';
import HomeScreen from './pages/HomeScreen';
import CategoryDetailScreen from './pages/CategoryDetailScreen';
import RadarScreen from './pages/RadarScreen';
import ProfileScreen from './pages/ProfileScreen';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const categories = useAppStore((state) => state.categories);
  const theme = useAppStore((state) => state.theme);
  const token = useAppStore((state) => state.token);
  const setProfile = useAppStore((state) => state.setProfile);
  const setTheme = useAppStore((state) => state.setTheme);
  const setCategories = useAppStore((state) => state.setCategories);

  const progress = useMemo(() => {
    const total = categories.reduce((sum, category) => sum + category.goals.length, 0);
    const completed = categories.reduce((sum, category) => sum + category.goals.filter((goal) => goal.isCompleted).length, 0);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [categories]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const hydrate = async () => {
      try {
        const payload = await syncAppDataFromApi(token);
        if (!isMounted) return;
        setProfile(payload.profile);
        setTheme(payload.theme);
        setCategories(payload.categories);
      } catch (error) {
        console.error('Failed to hydrate app data from API', error);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [token, setProfile, setTheme, setCategories]);

  const handleBack = () => navigate(-1);

  const rootClasses = {
    classic: 'bg-[#F1E4CC] text-[#2C2725]',
    modern: 'theme-modern bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),_rgba(153,102,255,0.35)_18%,_rgba(0,217,255,0.22)_38%,_rgba(255,0,128,0.14)_62%,_rgba(17,24,39,0.96)_100%)] text-[#f5f7ff]',
    dark: 'bg-[#111827] text-[#F3F4F6]',
    luxury: 'theme-luxury bg-[radial-gradient(circle_at_top,_rgba(255,245,200,0.38),_rgba(120,79,17,0.2)_30%,_rgba(19,12,9,0.94)_100%)] text-[#f7e8c7]'
  }[theme];

  const surfaceClasses = {
    classic: 'border-[#e8c78d] bg-[#fdf1d8]/90 text-[#2C2725]',
    modern: 'border border-[#7c6cff]/40 bg-[rgba(20,18,42,0.46)] backdrop-blur-xl shadow-[0_20px_60px_rgba(22,163,74,0.12)] text-[#f5f7ff]',
    dark: 'border-[#2f3745] bg-[#1f2937]/95 text-[#f3f4f6]',
    luxury: 'border border-[#d4af6a]/30 bg-[rgba(24,18,12,0.62)] backdrop-blur-xl shadow-[0_20px_60px_rgba(212,175,106,0.15)] text-[#f7e8c7]'
  }[theme];

  const navClasses = {
    classic: 'border-[#e8c78d] bg-[#f8e7c2] text-[#2C2725]',
    modern: 'border-t border-[#7c6cff]/35 bg-[rgba(15,12,35,0.62)] backdrop-blur-xl text-[#f5f7ff] shadow-[0_-12px_30px_rgba(0,217,255,0.08)]',
    dark: 'border-[#2f3745] bg-[#111827] text-[#f3f4f6]',
    luxury: 'border-t border-[#d4af6a]/30 bg-[rgba(17,12,8,0.72)] backdrop-blur-xl text-[#f7e8c7] shadow-[0_-12px_30px_rgba(212,175,106,0.12)]'
  }[theme];

  const mutedText = {
    classic: 'text-[#8C6046]',
    modern: 'text-[#b9c7ff]',
    dark: 'text-[#d1d5db]',
    luxury: 'text-[#f6d79a]'
  }[theme];

  if (!token) {
    return <AuthScreen />;
  }

  return (
    <div className={`min-h-screen flex justify-center ${rootClasses}`}>
      <div className="w-full max-w-6xl px-3 py-4 pb-28 sm:px-6 lg:px-8">
        <header className={`mb-4 rounded-[24px] border p-4 shadow-[0_6px_20px_rgba(140,96,70,0.16)] ${surfaceClasses}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight">Resolutions</h1>
              <p className={`mt-1 text-[10px] uppercase tracking-[0.3em] ${mutedText}`}>TWOJE KATEGORIE CELÓW</p>
            </div>
            <button className={`rounded-full border p-2 ${theme === 'dark' ? 'border-[#374151] bg-[#111827] text-[#f3f4f6]' : theme === 'luxury' ? 'border-[#d4af6a]/50 bg-[#1a130f] text-[#f7e8c7]' : 'border-[#e8c78d] bg-[#fffbf2] text-[#2C2725]'}`} aria-label="Powiadomienia">
              <Bell size={18} />
            </button>
          </div>
          {location.pathname === '/' && (
            <div className={`mt-3 flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-[#374151] bg-[#0f172a]' : theme === 'luxury' ? 'border-[#d4af6a]/40 bg-[#2a1d12]' : theme === 'modern' ? 'border-[#9bd9ff]/40 bg-[rgba(15,23,42,0.52)]' : 'border-[#e8c78d] bg-[#fff6e6]'}`}>
              <span className={theme === 'modern' ? 'text-[#f5f7ff] drop-shadow-[0_0_8px_rgba(125,211,252,0.65)]' : theme === 'luxury' ? 'text-[#fdf3d2] drop-shadow-[0_0_10px_rgba(212,175,106,0.8)]' : mutedText}>Postęp ogólny</span>
              <span className={theme === 'modern' ? 'font-bold text-[#f4fbff] drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : theme === 'luxury' ? 'font-bold text-[#fff2c9] drop-shadow-[0_0_12px_rgba(212,175,106,0.9)]' : 'font-semibold'}>{progress}%</span>
            </div>
          )}
        </header>

        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/category/:id" element={<CategoryDetailScreen onBack={handleBack} />} />
          <Route path="/radar" element={<RadarScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </div>

      <nav className={`fixed bottom-0 left-0 right-0 z-20 border-t shadow-[0_-4px_18px_rgba(140,96,70,0.16)] ${navClasses}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
          <NavLink to="/radar" className={({ isActive }) => `flex flex-1 flex-col items-center px-3 py-2 ${isActive ? (theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'luxury' ? 'text-[#f7e8c7]' : 'text-[#2C2725]') : mutedText}`}>
            <Radar size={18} />
            <span className="mt-1 text-[11px]">Radar</span>
          </NavLink>
          <NavLink to="/" className={({ isActive }) => `flex flex-1 flex-col items-center px-3 py-2 ${isActive ? (theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'luxury' ? 'text-[#f7e8c7]' : 'text-[#2C2725]') : mutedText}`}>
            <Home size={18} />
            <span className="mt-1 text-[11px]">Główna</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-1 flex-col items-center px-3 py-2 ${isActive ? (theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'luxury' ? 'text-[#f7e8c7]' : 'text-[#2C2725]') : mutedText}`}>
            <User size={18} />
            <span className="mt-1 text-[11px]">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default App;

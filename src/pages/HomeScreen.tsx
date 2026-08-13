import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { categoryIcons } from '../utils/icons';

export default function HomeScreen() {
  const navigate = useNavigate();
  const categories = useAppStore((state) => state.categories);
  const theme = useAppStore((state) => state.theme);

  const metaTextClass = theme === 'modern'
    ? 'text-[#fdf7ff] drop-shadow-[0_0_8px_rgba(125,211,252,0.65)]'
    : theme === 'luxury'
      ? 'text-[#fff1c2] drop-shadow-[0_0_8px_rgba(212,175,106,0.8)]'
      : theme === 'dark'
        ? 'text-[#e5e7eb]'
        : 'text-[#8C6046]';

  const cardClass = theme === 'dark'
    ? 'border-[#374151] bg-[#1f2937]/95 text-[#f3f4f6]'
    : theme === 'modern'
      ? 'border-[#7c6cff]/30 bg-[rgba(22,18,42,0.7)] text-[#f5f7ff]'
      : theme === 'luxury'
        ? 'border-[#d4af6a]/35 bg-[rgba(31,21,14,0.76)] text-[#fff2c9]'
        : 'border-[#f0d9a7] bg-[#fff8eb]/90 text-[#2C2725]';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {categories.map((category) => {
          const completed = category.goals.filter((goal) => goal.isCompleted).length;
          const total = category.goals.length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
          const Icon = categoryIcons[category.iconName as keyof typeof categoryIcons] ?? categoryIcons.HeartPulse;

          return (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className={`rounded-[22px] border-2 p-3 text-left shadow-[0_6px_16px_rgba(140,96,70,0.14)] transition hover:-translate-y-0.5 ${cardClass}`}
              style={{ backgroundColor: theme === 'luxury' ? `${category.bgColor}18` : `${category.bgColor}22` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-2xl p-2 text-[#F1E4CC]" style={{ backgroundColor: category.bgColor }}>
                  <Icon size={16} />
                </div>
                <div className={`text-right text-[10px] leading-4 ${metaTextClass}`}>
                  <div className="font-semibold">{completed}/{total}</div>
                  <div>wykonane</div>
                </div>
              </div>
              <h2 className="mt-3 font-serif text-[15px] font-semibold uppercase leading-tight">{category.title}</h2>
              <div className="mt-3 h-2 rounded-full bg-[#f3e1bb]">
                <div className="h-2 rounded-full" style={{ width: `${progress}%`, backgroundColor: category.bgColor }} />
              </div>
              <div className={`mt-2 flex items-center justify-between text-[11px] ${metaTextClass}`}>
                <span className="font-bold">{progress}%</span>
                <span className="flex items-center gap-1 font-medium"><CheckCircle2 size={12} /> postęp</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

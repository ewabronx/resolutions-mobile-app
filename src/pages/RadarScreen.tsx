import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '../store';

export default function RadarScreen() {
  const categories = useAppStore((state) => state.categories);
  const theme = useAppStore((state) => state.theme);

  const data = categories.map((category) => {
    const total = category.goals.length;
    const completed = category.goals.filter((goal) => goal.isCompleted).length;
    return {
      name: category.title,
      value: total === 0 ? 0 : Math.round((completed / total) * 100),
      fill: category.bgColor
    };
  });

  return (
    <div className={`rounded-[24px] border p-4 shadow-[0_6px_18px_rgba(140,96,70,0.14)] ${theme === 'dark' ? 'border-[#374151] bg-[#1f2937]/95 text-[#f3f4f6]' : theme === 'modern' ? 'border border-[#7c6cff]/35 bg-[rgba(17,13,32,0.72)] text-[#f4f7ff]' : theme === 'luxury' ? 'border border-[#d4af6a]/35 bg-[rgba(31,21,14,0.76)] text-[#fff2c9]' : 'border-[#f0d9a7] bg-[#fff8eb]/90 text-[#2C2725]'}`}>
      <h2 className="font-serif text-2xl font-semibold">Radar postępu</h2>
      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#d1d5db]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f8e7b6]' : 'text-[#8C6046]'}`}>Każda oś pokazuje procent ukończonych celów w danej kategorii.</p>
      <div className="mt-4 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={theme === 'dark' ? '#94a3b8' : theme === 'modern' ? '#dfe7ff' : theme === 'luxury' ? '#f7d783' : '#8C6046'} strokeOpacity={theme === 'luxury' ? 0.8 : theme === 'dark' ? 0.6 : 0.4} />
            <PolarAngleAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#f3f4f6' : theme === 'modern' ? '#f4f7ff' : theme === 'luxury' ? '#fff3ce' : '#2C2725', fontSize: 10, fontWeight: 700 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={{ stroke: theme === 'dark' ? '#94a3b8' : theme === 'modern' ? '#dfe7ff' : theme === 'luxury' ? '#f7d783' : '#8C6046', strokeWidth: theme === 'luxury' ? 2 : 1 }} />
            <Radar name="Postęp" dataKey="value" stroke={theme === 'dark' ? '#f3f4f6' : theme === 'modern' ? '#a5c9ff' : theme === 'luxury' ? '#f7d783' : '#8C6046'} fill={theme === 'dark' ? '#f3f4f6' : theme === 'modern' ? '#a5c9ff' : theme === 'luxury' ? '#f7d783' : '#8C6046'} fillOpacity={theme === 'luxury' ? 0.52 : 0.38} />
            <Tooltip
              contentStyle={{
                background: theme === 'luxury' ? 'rgba(31, 23, 16, 0.95)' : '#fff',
                border: theme === 'luxury' ? '1px solid rgba(247, 215, 131, 0.5)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                color: theme === 'luxury' ? '#fff3ce' : '#2C2725',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

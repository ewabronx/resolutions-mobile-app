import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { categoryIcons } from '../utils/icons';

interface CategoryDetailScreenProps {
  onBack: () => void;
}

export default function CategoryDetailScreen({ onBack }: CategoryDetailScreenProps) {
  const { id } = useParams();
  const theme = useAppStore((state) => state.theme);
  const category = useAppStore((state) => state.categories.find((item) => item.id === id));
  const updateCategory = useAppStore((state) => state.updateCategory);
  const addGoal = useAppStore((state) => state.addGoal);
  const toggleGoal = useAppStore((state) => state.toggleGoal);
  const updateGoal = useAppStore((state) => state.updateGoal);
  const deleteGoal = useAppStore((state) => state.deleteGoal);

  const [description, setDescription] = useState(category?.description ?? '');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const Icon = category ? categoryIcons[category.iconName as keyof typeof categoryIcons] ?? categoryIcons.HeartPulse : categoryIcons.HeartPulse;

  const completed = useMemo(() => category?.goals.filter((goal) => goal.isCompleted).length ?? 0, [category]);

  const cardClass = theme === 'dark'
    ? 'border-[#374151] bg-[#1f2937]/95 text-[#f3f4f6]'
    : theme === 'modern'
      ? 'border border-[#7c6cff]/35 bg-[rgba(17,13,32,0.72)] text-[#f4f7ff] shadow-[0_18px_45px_rgba(0,217,255,0.08)]'
      : theme === 'luxury'
        ? 'border border-[#d4af6a]/35 bg-[rgba(31,21,14,0.72)] text-[#fff2c9] shadow-[0_18px_45px_rgba(212,175,106,0.12)]'
        : 'border-[#F1E4CC] bg-white/70 text-[#2C2725]';

  const mutedTextClass = theme === 'dark' ? 'text-[#d1d5db]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f4dca1]' : 'text-[#8C6046]';
  const fieldClass = theme === 'dark'
    ? 'border-[#374151] bg-[#0f172a] text-[#f3f4f6]'
    : theme === 'modern'
      ? 'border border-[#7c6cff]/30 bg-[rgba(27,22,48,0.75)] text-[#f4f7ff]'
      : theme === 'luxury'
        ? 'border border-[#d4af6a]/30 bg-[rgba(35,25,15,0.82)] text-[#fff2c9]'
        : 'border-[#F1E4CC] bg-[#fcf7ea] text-[#2C2725]';
  const goalTextClass = theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'modern' ? 'text-[#f4f7ff]' : theme === 'luxury' ? 'text-[#fff2c9]' : 'text-[#2C2725]';
  const disabledGoalTextClass = theme === 'dark' ? 'text-[#d1d5db] line-through' : theme === 'modern' ? 'text-[#cfe0ff] line-through' : theme === 'luxury' ? 'text-[#f0d08d] line-through' : 'text-[#8C6046] line-through';

  if (!category) {
    return null;
  }

  const handleSaveDescription = () => {
    updateCategory(category.id, { description });
  };

  const handleSubmitGoal = (event: FormEvent) => {
    event.preventDefault();
    if (!goalTitle.trim()) return;
    if (editingGoalId) {
      updateGoal(category.id, editingGoalId, { title: goalTitle.trim(), description: goalDescription.trim() || undefined });
      setEditingGoalId(null);
    } else {
      addGoal(category.id, goalTitle.trim(), goalDescription.trim() || undefined);
    }
    setGoalTitle('');
    setGoalDescription('');
  };

  const startEditingGoal = (goal: { id: string; title: string; description?: string }) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description ?? '');
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className={`flex items-center gap-2 text-sm ${theme === 'modern' ? 'text-[#edf6ff]' : theme === 'dark' ? 'text-[#e5e7eb]' : theme === 'luxury' ? 'text-[#f7e7b5]' : 'text-[#8C6046]'}`}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className={`rounded-[24px] border p-4 shadow-sm ${cardClass}`}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-2 text-[#F1E4CC]" style={{ backgroundColor: category.bgColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold uppercase">{category.title}</h2>
            <p className={`text-sm ${mutedTextClass}`}>{completed}/{category.goals.length} ukończonych</p>
          </div>
        </div>

        <div className="mt-4">
          <label className={`text-sm font-semibold ${mutedTextClass}`}>Opis kategorii</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`mt-2 w-full rounded-2xl border p-3 outline-none ${fieldClass}`}
            rows={3}
          />
          <button onClick={handleSaveDescription} className={`mt-2 rounded-full px-4 py-2 text-sm ${theme === 'dark' ? 'bg-[#f3f4f6] text-[#111827]' : theme === 'modern' ? 'bg-[#a5c9ff] text-[#111827]' : 'bg-[#2C2725] text-[#F1E4CC]'}`}>Zapisz opis</button>
        </div>
      </div>

      <div className={`rounded-[24px] border p-4 shadow-[0_6px_18px_rgba(140,96,70,0.14)] ${theme === 'dark' ? 'border-[#374151] bg-[#1f2937]/95 text-[#f3f4f6]' : theme === 'modern' ? 'border border-[#7c6cff]/35 bg-[rgba(17,13,32,0.72)] text-[#f4f7ff]' : theme === 'luxury' ? 'border border-[#d4af6a]/35 bg-[rgba(31,21,14,0.76)] text-[#fff2c9]' : 'border-[#f0d9a7] bg-[#fff8eb]/90 text-[#2C2725]'}`}>
        <h3 className="font-serif text-xl">Cele</h3>
        <form onSubmit={handleSubmitGoal} className="mt-3 space-y-2">
          <input value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} placeholder="Tytuł celu" className="w-full rounded-2xl border border-[#F1E4CC] bg-[#fcf7ea] p-3 outline-none" />
          <input value={goalDescription} onChange={(event) => setGoalDescription(event.target.value)} placeholder="Opis (opcjonalny)" className="w-full rounded-2xl border border-[#F1E4CC] bg-[#fcf7ea] p-3 outline-none" />
          <button className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${theme === 'dark' ? 'bg-[#f3f4f6] text-[#111827]' : theme === 'modern' ? 'bg-[#a5c9ff] text-[#111827]' : theme === 'luxury' ? 'bg-[#f4d38f] text-[#1a120d]' : 'bg-[#8C6046] text-white'}`}>
            <Plus size={16} /> {editingGoalId ? 'Zapisz zmianę' : 'Dodaj cel'}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {category.goals.map((goal) => (
            <div key={goal.id} className={`rounded-2xl border p-3 ${theme === 'dark' ? 'border-[#374151] bg-[#0f172a]' : theme === 'modern' ? 'border border-[#7c6cff]/30 bg-[rgba(27,22,48,0.72)]' : 'border-[#F1E4CC] bg-[#fcf7ea]'}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={goal.isCompleted} onChange={() => toggleGoal(category.id, goal.id)} className="mt-1 h-4 w-4 accent-[#798165]" />
                <div className="flex-1">
                  <p className={`font-medium ${goal.isCompleted ? disabledGoalTextClass : goalTextClass}`}>{goal.title}</p>
                  {goal.description ? <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#d1d5db]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f1d998]' : 'text-[#8C6046]'}`}>{goal.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditingGoal(goal)} className={`rounded-full p-2 ${theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f1d998]' : 'text-[#8C6046]'}`}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteGoal(category.id, goal.id)} className={`rounded-full p-2 ${theme === 'dark' ? 'text-[#fca5a5]' : theme === 'modern' ? 'text-[#ffc4d1]' : 'text-[#96584E]'}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

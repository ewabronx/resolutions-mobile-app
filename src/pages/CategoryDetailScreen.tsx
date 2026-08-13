import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { createGoal, deleteGoal as deleteGoalApi, updateGoal as updateGoalApi } from '../lib/api';
import { useAppStore } from '../store';
import { categoryIcons } from '../utils/icons';

interface CategoryDetailScreenProps {
  onBack: () => void;
}

export default function CategoryDetailScreen({ onBack }: CategoryDetailScreenProps) {
  const { id } = useParams();
  const theme = useAppStore((state) => state.theme);
  const category = useAppStore((state) => state.categories.find((item) => item.id === id));
  const token = useAppStore((state) => state.token);
  const addGoalLocal = useAppStore((state) => state.addGoal);
  const toggleGoalLocal = useAppStore((state) => state.toggleGoal);
  const updateGoalLocal = useAppStore((state) => state.updateGoal);
  const deleteGoalLocal = useAppStore((state) => state.deleteGoal);

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
  const goalTextClass = theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'modern' ? 'text-[#f4f7ff]' : theme === 'luxury' ? 'text-[#fff2c9]' : 'text-[#2C2725]';
  const disabledGoalTextClass = theme === 'dark' ? 'text-[#d1d5db] line-through' : theme === 'modern' ? 'text-[#cfe0ff] line-through' : theme === 'luxury' ? 'text-[#f0d08d] line-through' : 'text-[#8C6046] line-through';

  if (!category) {
    return null;
  }

  const handleSubmitGoal = async (event: FormEvent) => {
    event.preventDefault();
    if (!goalTitle.trim()) return;

    const trimmedTitle = goalTitle.trim();
    const trimmedDescription = goalDescription.trim() || undefined;

    if (editingGoalId) {
      updateGoalLocal(category.id, editingGoalId, { title: trimmedTitle, description: trimmedDescription });
      if (token) {
        const numericGoalId = Number(editingGoalId);
        if (!Number.isNaN(numericGoalId)) {
          await updateGoalApi(token, numericGoalId, {
            category_id: Number(category.id),
            title: trimmedTitle,
            description: trimmedDescription ?? null,
            is_completed: category.goals.find((goal) => goal.id === editingGoalId)?.isCompleted ?? false
          });
        }
      }
      setEditingGoalId(null);
    } else {
      if (token) {
        const created = await createGoal(token, {
          category_id: Number(category.id),
          title: trimmedTitle,
          description: trimmedDescription ?? null,
          is_completed: false,
          order_index: category.goals.length
        });
        addGoalLocal(category.id, trimmedTitle, trimmedDescription, String(created.id));
      } else {
        addGoalLocal(category.id, trimmedTitle, trimmedDescription);
      }
    }
    setGoalTitle('');
    setGoalDescription('');
  };

  const startEditingGoal = (goal: { id: string; title: string; description?: string }) => {
    setEditingGoalId(goal.id);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description ?? '');
  };

  const handleToggleGoal = async (goalId: string) => {
    toggleGoalLocal(category.id, goalId);
    if (!token) return;

    const numericGoalId = Number(goalId);
    if (Number.isNaN(numericGoalId)) return;

    const currentGoal = category.goals.find((goal) => goal.id === goalId);
    if (!currentGoal) return;

    await updateGoalApi(token, numericGoalId, {
      category_id: Number(category.id),
      title: currentGoal.title,
      description: currentGoal.description ?? null,
      is_completed: !currentGoal.isCompleted
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    deleteGoalLocal(category.id, goalId);
    if (!token) return;

    const numericGoalId = Number(goalId);
    if (!Number.isNaN(numericGoalId)) {
      await deleteGoalApi(token, numericGoalId);
    }
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

        <div className="mt-4 rounded-2xl border border-dashed border-current/20 px-3 py-2 text-sm opacity-80">
          <p className={mutedTextClass}>{category.description}</p>
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
                <input type="checkbox" checked={goal.isCompleted} onChange={() => void handleToggleGoal(goal.id)} className="mt-1 h-4 w-4 accent-[#798165]" />
                <div className="flex-1">
                  <p className={`font-medium ${goal.isCompleted ? disabledGoalTextClass : goalTextClass}`}>{goal.title}</p>
                  {goal.description ? <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#d1d5db]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f1d998]' : 'text-[#8C6046]'}`}>{goal.description}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditingGoal(goal)} className={`rounded-full p-2 ${theme === 'dark' ? 'text-[#f3f4f6]' : theme === 'modern' ? 'text-[#dfe7ff]' : theme === 'luxury' ? 'text-[#f1d998]' : 'text-[#8C6046]'}`}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => void handleDeleteGoal(goal.id)} className={`rounded-full p-2 ${theme === 'dark' ? 'text-[#fca5a5]' : theme === 'modern' ? 'text-[#ffc4d1]' : 'text-[#96584E]'}`}>
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

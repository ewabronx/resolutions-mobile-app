import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialCategories, initialProfile } from './data';
import type { Category, UserProfile } from './types';

export type ThemeMode = 'classic' | 'modern' | 'dark' | 'luxury';

interface AppState {
  categories: Category[];
  profile: UserProfile;
  theme: ThemeMode;
  setCategories: (categories: Category[]) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  addGoal: (categoryId: string, title: string, description?: string) => void;
  toggleGoal: (categoryId: string, goalId: string) => void;
  updateGoal: (categoryId: string, goalId: string, updates: Partial<{ title: string; description?: string; isCompleted: boolean }>) => void;
  deleteGoal: (categoryId: string, goalId: string) => void;
  setProfile: (profile: UserProfile) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      categories: initialCategories,
      profile: initialProfile,
      theme: 'classic',
      setCategories: (categories) => set({ categories }),
      updateCategory: (categoryId, updates) => set((state) => ({
        categories: state.categories.map((category) => category.id === categoryId ? { ...category, ...updates } : category)
      })),
      addGoal: (categoryId, title, description) => set((state) => ({
        categories: state.categories.map((category) => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            goals: [...category.goals, { id: crypto.randomUUID(), title, description, isCompleted: false }]
          };
        })
      })),
      toggleGoal: (categoryId, goalId) => set((state) => ({
        categories: state.categories.map((category) => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            goals: category.goals.map((goal) => goal.id === goalId ? { ...goal, isCompleted: !goal.isCompleted } : goal)
          };
        })
      })),
      updateGoal: (categoryId, goalId, updates) => set((state) => ({
        categories: state.categories.map((category) => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            goals: category.goals.map((goal) => goal.id === goalId ? { ...goal, ...updates } : goal)
          };
        })
      })),
      deleteGoal: (categoryId, goalId) => set((state) => ({
        categories: state.categories.map((category) => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            goals: category.goals.filter((goal) => goal.id !== goalId)
          };
        })
      })),
      setProfile: (profile) => set({ profile }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'resolutions-state',
      partialize: (state) => ({ categories: state.categories, profile: state.profile, theme: state.theme }),
      migrate: (persisted) => {
        const state = persisted as Partial<{ categories: Category[]; profile: UserProfile; theme: ThemeMode }> | null;

        if (!state) {
          return { categories: initialCategories, profile: initialProfile, theme: 'classic' };
        }

        const nextCategories = Array.isArray(state.categories) && state.categories.length >= initialCategories.length ? state.categories : initialCategories;
        const nextProfile = state.profile ?? initialProfile;
        const nextTheme = state.theme === 'modern' || state.theme === 'dark' || state.theme === 'classic' || state.theme === 'luxury' ? state.theme : 'classic';

        return {
          categories: nextCategories,
          profile: nextProfile,
          theme: nextTheme
        };
      }
    }
  )
);

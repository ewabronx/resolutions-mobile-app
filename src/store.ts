import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialCategories, initialProfile } from './data';
import type { Category, UserProfile } from './types';

export type ThemeMode = 'classic' | 'modern' | 'dark' | 'luxury';

interface AuthState {
  token: string | null;
  user: { id: number; email: string; full_name?: string | null; is_active: boolean } | null;
  setAuthSession: (token: string, user: { id: number; email: string; full_name?: string | null; is_active: boolean }) => void;
  clearAuthSession: () => void;
}

interface AppState extends AuthState {
  categories: Category[];
  profile: UserProfile;
  theme: ThemeMode;
  setCategories: (categories: Category[]) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  addGoal: (categoryId: string, title: string, description?: string, forcedId?: string) => void;
  toggleGoal: (categoryId: string, goalId: string) => void;
  updateGoal: (categoryId: string, goalId: string, updates: Partial<{ title: string; description?: string; isCompleted: boolean }>) => void;
  deleteGoal: (categoryId: string, goalId: string) => void;
  setProfile: (profile: UserProfile) => void;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = 'resolutions-state';
const defaultAppState = {
  categories: initialCategories,
  profile: initialProfile,
  theme: 'classic' as ThemeMode,
  token: null,
  user: null
};

const isValidTheme = (theme: unknown): theme is ThemeMode => theme === 'classic' || theme === 'modern' || theme === 'dark' || theme === 'luxury';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultAppState,
      setAuthSession: (token, user) => set({ token, user }),
      clearAuthSession: () => {
        set({ ...defaultAppState });
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      },
      setCategories: (categories) => set({ categories }),
      updateCategory: (categoryId, updates) => set((state) => ({
        categories: state.categories.map((category) => category.id === categoryId ? { ...category, ...updates } : category)
      })),
      addGoal: (categoryId, title, description, forcedId) => set((state) => ({
        categories: state.categories.map((category) => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            goals: [...category.goals, { id: forcedId ?? crypto.randomUUID(), title, description, isCompleted: false }]
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
      name: STORAGE_KEY,
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        token: state.token,
        user: state.user
      }),
      migrate: (persisted) => {
        const state = persisted as Partial<{ theme: ThemeMode; token: string | null; user: { id: number; email: string; full_name?: string | null; is_active: boolean } | null }> | null;

        if (!state) {
          return { ...defaultAppState };
        }

        const nextTheme = isValidTheme(state.theme) ? state.theme : 'classic';

        return {
          categories: initialCategories,
          profile: initialProfile,
          theme: nextTheme,
          token: state.token ?? null,
          user: state.user ?? null
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.categories = initialCategories;
        state.profile = initialProfile;
      }
    }
  )
);

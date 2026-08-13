const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

export interface AuthUser {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

export interface ProfileApiResponse {
  id: number;
  user_id: number;
  bio?: string | null;
  mbti_type?: string | null;
  avatar_url?: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryApiResponse {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  icon_name: string;
  color: string;
  order_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalApiResponse {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  order_index: number;
  target_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  updated_at: string;
}

export interface UserSettingsApiResponse {
  id: number;
  user_id: number;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  updated_at: string;
}

interface ApiErrorShape {
  detail?: string;
  message?: string;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorDetail = typeof data === 'object' && data !== null ? (data as ApiErrorShape).detail ?? (data as ApiErrorShape).message ?? 'Request failed' : String(data || 'Request failed');
    throw new Error(errorDetail);
  }

  return data as T;
}

function normalizeTheme(theme: string): 'classic' | 'modern' | 'dark' | 'luxury' {
  return theme === 'modern' || theme === 'dark' || theme === 'luxury' ? theme : 'classic';
}

export function mapCategoryFromApi(category: CategoryApiResponse) {
  return {
    id: String(category.id),
    title: category.name.toUpperCase(),
    description: category.description ?? '',
    iconName: category.icon_name,
    bgColor: category.color,
    goals: [] as Array<{ id: string; title: string; description?: string; isCompleted: boolean }>
  };
}

export function mapGoalFromApi(goal: GoalApiResponse) {
  return {
    id: String(goal.id),
    title: goal.title,
    description: goal.description ?? undefined,
    isCompleted: goal.is_completed
  };
}

export async function registerUser(email: string, password: string, fullName?: string) {
  return apiRequest<{ access_token: string; token_type: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName ?? '' })
  });
}

export async function loginUser(email: string, password: string) {
  return apiRequest<{ access_token: string; token_type: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<AuthUser>('/api/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getMyProfile(token: string) {
  return apiRequest<ProfileApiResponse>('/api/profiles/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateMyProfile(token: string, payload: { bio?: string; mbti_type?: string | null; avatar_url?: string | null; theme?: string }) {
  return apiRequest<ProfileApiResponse>('/api/profiles/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function getMyCategories(token: string) {
  return apiRequest<CategoryApiResponse[]>('/api/categories', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createCategory(token: string, payload: { name: string; description?: string; icon_name?: string; color?: string; order_index?: number; is_archived?: boolean }) {
  return apiRequest<CategoryApiResponse>('/api/categories', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateCategory(token: string, categoryId: number, payload: { name?: string; description?: string; icon_name?: string; color?: string; order_index?: number; is_archived?: boolean }) {
  return apiRequest<CategoryApiResponse>(`/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteCategory(token: string, categoryId: number) {
  return apiRequest<{ status: string }>(`/api/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getMyGoals(token: string) {
  return apiRequest<GoalApiResponse[]>('/api/goals', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createGoal(token: string, payload: { category_id: number; title: string; description?: string | null; is_completed?: boolean; order_index?: number; target_date?: string | null }) {
  return apiRequest<GoalApiResponse>('/api/goals', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateGoal(token: string, goalId: number, payload: { category_id?: number; title?: string; description?: string | null; is_completed?: boolean; order_index?: number; target_date?: string | null }) {
  return apiRequest<GoalApiResponse>(`/api/goals/${goalId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteGoal(token: string, goalId: number) {
  return apiRequest<{ status: string }>(`/api/goals/${goalId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getMySettings(token: string) {
  return apiRequest<UserSettingsApiResponse>('/api/settings', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateMySettings(token: string, payload: { theme?: string; language?: string; notifications_enabled?: boolean }) {
  return apiRequest<UserSettingsApiResponse>('/api/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function syncAppDataFromApi(token: string) {
  const [userResponse, profileResponse, settingsResponse, categoriesResponse, goalsResponse] = await Promise.all([
    getCurrentUser(token),
    getMyProfile(token),
    getMySettings(token),
    getMyCategories(token),
    getMyGoals(token)
  ]);

  const fullName = (userResponse.full_name ?? '').trim();
  const [firstName, ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);

  const categories = categoriesResponse
    .sort((a, b) => a.order_index - b.order_index)
    .map((category) => ({
      id: String(category.id),
      title: category.name.toUpperCase(),
      description: category.description ?? '',
      iconName: category.icon_name,
      bgColor: category.color,
      goals: goalsResponse
        .filter((goal) => goal.category_id === category.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map(mapGoalFromApi)
    }));

  return {
    profile: {
      firstName: firstName ?? '',
      lastName: lastNameParts.join(' '),
      mbtiType: (profileResponse.mbti_type as any) ?? null
    },
    theme: normalizeTheme(settingsResponse.theme),
    categories
  };
}

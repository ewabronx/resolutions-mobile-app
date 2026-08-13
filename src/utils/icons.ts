import type { ComponentType } from 'react';
import * as icons from 'lucide-react';

export const categoryIcons = icons as unknown as Record<string, ComponentType<{ size?: number; className?: string }>>;

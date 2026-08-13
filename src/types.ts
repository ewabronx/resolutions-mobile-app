export type MBTIType = 'INTJ'|'INTP'|'ENTJ'|'ENTP'|'INFJ'|'INFP'|'ENFJ'|'ENFP'|'ISTJ'|'ISFJ'|'ESTJ'|'ESFJ'|'ISTP'|'ISFP'|'ESTP'|'ESFP';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  iconName: string;
  bgColor: string;
  goals: Goal[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  mbtiType: MBTIType | null;
}

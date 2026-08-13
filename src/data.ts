import type { Category, UserProfile } from './types';

export const initialCategories: Category[] = [
  {
    id: 'health',
    title: 'ZDROWIE',
    description: 'Dbaj o równowagę ciała, snu i energii.',
    iconName: 'HeartPulse',
    bgColor: '#798165',
    goals: [
      { id: 'h1', title: 'Spacer 20 minut dziennie', isCompleted: true },
      { id: 'h2', title: 'Sen między 23:00 a 00:00', isCompleted: false }
    ]
  },
  {
    id: 'finance',
    title: 'FINANSE',
    description: 'Buduj bezpieczeństwo finansowe krok po kroku.',
    iconName: 'Wallet',
    bgColor: '#798165',
    goals: [
      { id: 'f1', title: 'Odłożyć 10% pensji', isCompleted: false },
      { id: 'f2', title: 'Przejrzeć miesięczne wydatki', isCompleted: true }
    ]
  },
  {
    id: 'work',
    title: 'PRACA',
    description: 'Skup się na jakości i konsekwencji.',
    iconName: 'Briefcase',
    bgColor: '#798165',
    goals: [
      { id: 'w1', title: 'Ukończyć jeden priorytet dziennie', isCompleted: false }
    ]
  },
  {
    id: 'hobby',
    title: 'HOBBY',
    description: 'Znajdź czas na przyjemność i ciekawość.',
    iconName: 'Palette',
    bgColor: '#96584E',
    goals: [
      { id: 'hh1', title: 'Czas na malowanie co tydzień', isCompleted: true }
    ]
  },
  {
    id: 'family',
    title: 'RODZINA',
    description: 'Buduj bliskość i wspólne chwile.',
    iconName: 'Home',
    bgColor: '#96584E',
    goals: [
      { id: 'fa1', title: 'Kolacja razem w weekend', isCompleted: false }
    ]
  },
  {
    id: 'travel',
    title: 'PODRÓŻE',
    description: 'Planuj nowe miejsca i doświadczenia.',
    iconName: 'Plane',
    bgColor: '#96584E',
    goals: [
      { id: 't1', title: 'Zapisać 3 miejsca do odwiedzenia', isCompleted: false }
    ]
  },
  {
    id: 'education',
    title: 'EDUKACJA',
    description: 'Rozwijaj umiejętności z cierpliwością.',
    iconName: 'BookOpen',
    bgColor: '#8C6046',
    goals: [
      { id: 'e1', title: 'Czytać 20 stron tygodniowo', isCompleted: true }
    ]
  },
  {
    id: 'sport',
    title: 'SPORT',
    description: 'Regularność jest ważniejsza niż intensywność.',
    iconName: 'Dumbbell',
    bgColor: '#8C6046',
    goals: [
      { id: 's1', title: 'Trening 3 razy w tygodniu', isCompleted: false }
    ]
  },
  {
    id: 'creativity',
    title: 'KREATYWNOŚĆ',
    description: 'Twórz coś każdego dnia przez chwilę.',
    iconName: 'Sparkles',
    bgColor: '#8C6046',
    goals: [
      { id: 'c1', title: 'Napisanie 10 zdań dziennie', isCompleted: false }
    ]
  },
  {
    id: 'home',
    title: 'DOM',
    description: 'Stwórz spokojne, uporządkowane środowisko.',
    iconName: 'House',
    bgColor: '#2C2725',
    goals: [
      { id: 'm1', title: 'Posprzątać stół wieczorem', isCompleted: true }
    ]
  },
  {
    id: 'community',
    title: 'SPOŁECZNOŚĆ',
    description: 'Zostawiaj po sobie pozytywny ślad.',
    iconName: 'Users',
    bgColor: '#2C2725',
    goals: [
      { id: 'u1', title: 'Pomoc w jednej inicjatywie', isCompleted: false }
    ]
  },
  {
    id: 'wellbeing',
    title: 'DOBROSTAN',
    description: 'Pielęgnuj spokój i wewnętrzną równowagę.',
    iconName: 'Leaf',
    bgColor: '#2C2725',
    goals: [
      { id: 'b1', title: 'Minuta medytacji rano', isCompleted: true }
    ]
  }
];

export const initialProfile: UserProfile = {
  firstName: 'Marta',
  lastName: 'Nowak',
  mbtiType: 'INFJ'
};

import type { Category, UserProfile } from './types';

export const initialCategories: Category[] = [
  {
    id: 'zdrowie',
    title: 'ZDROWIE',
    description: 'Dbaj o równowagę ciała, snu i energii.',
    iconName: 'HeartPulse',
    bgColor: '#798165',
    goals: [{ id: 'g-zdrowie', title: 'Spacer 20 minut dziennie', isCompleted: true }]
  },
  {
    id: 'finanse',
    title: 'FINANSE',
    description: 'Buduj bezpieczeństwo finansowe krok po kroku.',
    iconName: 'Wallet',
    bgColor: '#798165',
    goals: [{ id: 'g-finanse', title: 'Odłożyć 10% pensji', isCompleted: false }]
  },
  {
    id: 'praca',
    title: 'PRACA',
    description: 'Skup się na jakości i konsekwencji.',
    iconName: 'Briefcase',
    bgColor: '#798165',
    goals: [{ id: 'g-praca', title: 'Ukończyć jeden priorytet dziennie', isCompleted: false }]
  },
  {
    id: 'hobby',
    title: 'HOBBY',
    description: 'Znajdź czas na przyjemność i ciekawość.',
    iconName: 'Palette',
    bgColor: '#96584E',
    goals: [{ id: 'g-hobby', title: 'Czas na malowanie co tydzień', isCompleted: true }]
  },
  {
    id: 'rodzina',
    title: 'RODZINA',
    description: 'Buduj bliskość i wspólne chwile.',
    iconName: 'Home',
    bgColor: '#96584E',
    goals: [{ id: 'g-rodzina', title: 'Kolacja razem w weekend', isCompleted: false }]
  },
  {
    id: 'podroze',
    title: 'PODRÓŻE',
    description: 'Planuj nowe miejsca i doświadczenia.',
    iconName: 'Plane',
    bgColor: '#96584E',
    goals: [{ id: 'g-podroze', title: 'Zapisać 3 miejsca do odwiedzenia', isCompleted: false }]
  },
  {
    id: 'edukacja',
    title: 'EDUKACJA',
    description: 'Rozwijaj umiejętności z cierpliwością.',
    iconName: 'BookOpen',
    bgColor: '#8C6046',
    goals: [{ id: 'g-edukacja', title: 'Czytać 20 stron tygodniowo', isCompleted: true }]
  },
  {
    id: 'sport',
    title: 'SPORT',
    description: 'Regularność jest ważniejsza niż intensywność.',
    iconName: 'Dumbbell',
    bgColor: '#8C6046',
    goals: [{ id: 'g-sport', title: 'Trening 3 razy w tygodniu', isCompleted: false }]
  },
  {
    id: 'kreatywnosc',
    title: 'KREATYWNOŚĆ',
    description: 'Twórz coś każdego dnia przez chwilę.',
    iconName: 'Sparkles',
    bgColor: '#8C6046',
    goals: [{ id: 'g-kreatywnosc', title: 'Napisanie 10 zdań dziennie', isCompleted: false }]
  },
  {
    id: 'dom',
    title: 'DOM',
    description: 'Stwórz spokojne, uporządkowane środowisko.',
    iconName: 'House',
    bgColor: '#2C2725',
    goals: [{ id: 'g-dom', title: 'Posprzątać stół wieczorem', isCompleted: true }]
  },
  {
    id: 'spolecznosc',
    title: 'SPOŁECZNOŚĆ',
    description: 'Zostawiaj po sobie pozytywny ślad.',
    iconName: 'Users',
    bgColor: '#2C2725',
    goals: [{ id: 'g-spolecznosc', title: 'Pomoc w jednej inicjatywie', isCompleted: false }]
  },
  {
    id: 'dobrostan',
    title: 'DOBROSTAN',
    description: 'Pielęgnuj spokój i wewnętrzną równowagę.',
    iconName: 'Leaf',
    bgColor: '#2C2725',
    goals: [{ id: 'g-dobrostan', title: 'Minuta medytacji rano', isCompleted: true }]
  }
];

export const initialProfile: UserProfile = {
  firstName: 'Marta',
  lastName: 'Nowak',
  mbtiType: 'INFJ'
};

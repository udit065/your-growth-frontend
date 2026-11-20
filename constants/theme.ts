import { useColorScheme } from '@/hooks/useColorScheme';

const light = {
  background: '#F5F7F4',
  card: '#FFFFFF',
  cardAlt: '#EEF2EE',
  text: '#13201A',
  muted: '#66756C',
  border: '#E1E7E2',
  primary: '#2E9B5A',
  primaryText: '#FFFFFF',
  primarySoft: '#E2F3E8',
  warning: '#C97206',
  warningSoft: '#FCEFD9',
  danger: '#D14343',
  dangerSoft: '#FBE5E5',
};

const dark: typeof light = {
  background: '#0D1310',
  card: '#161F1A',
  cardAlt: '#1D2822',
  text: '#E8F0EB',
  muted: '#8E9E95',
  border: '#25312A',
  primary: '#4BC27D',
  primaryText: '#06130B',
  primarySoft: '#183324',
  warning: '#F0A33C',
  warningSoft: '#352611',
  danger: '#EF6B6B',
  dangerSoft: '#3A1B1B',
};

export const palettes = { light, dark };
export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

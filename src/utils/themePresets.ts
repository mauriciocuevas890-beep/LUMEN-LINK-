import { ThemePreferences } from '../types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: ThemePreferences;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clean-light',
    name: 'Minimal Clean',
    description: 'Crisp snow white canvas with sleek slate cards',
    theme: {
      presetId: 'clean-light',
      bgColor: '#f8fafc',
      cardBgColor: '#ffffff',
      cardTextColor: '#0f172a',
      cardBorderColor: '#e2e8f0',
      fontStyle: 'sans',
      buttonStyle: 'rounded-lg',
      buttonVariant: 'filled',
      accentColor: '#0f172a',
    },
  },
  {
    id: 'charcoal-midnight',
    name: 'Charcoal Midnight',
    description: 'Deep obsidian dark mode with subtle zinc accents',
    theme: {
      presetId: 'charcoal-midnight',
      bgColor: '#090d16',
      cardBgColor: '#161e2e',
      cardTextColor: '#f8fafc',
      cardBorderColor: '#253248',
      fontStyle: 'sans',
      buttonStyle: 'rounded-lg',
      buttonVariant: 'filled',
      accentColor: '#38bdf8',
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Glow',
    description: 'Warm evening gradient with elevated card styling',
    theme: {
      presetId: 'sunset-amber',
      bgColor: '#fff7ed',
      bgType: 'gradient',
      bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fecdd3 100%)',
      cardBgColor: '#ffffff',
      cardTextColor: '#7c2d12',
      cardBorderColor: '#ffedd5',
      fontStyle: 'rounded',
      buttonStyle: 'rounded-full',
      buttonVariant: 'filled',
      accentColor: '#ea580c',
    },
  },
  {
    id: 'emerald-sage',
    name: 'Matcha Sage',
    description: 'Refined botanical greens for organic, calm presence',
    theme: {
      presetId: 'emerald-sage',
      bgColor: '#f0fdf4',
      bgType: 'gradient',
      bgGradient: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
      cardBgColor: '#ffffff',
      cardTextColor: '#14532d',
      cardBorderColor: '#bbf7d0',
      fontStyle: 'sans',
      buttonStyle: 'rounded-lg',
      buttonVariant: 'filled',
      accentColor: '#16a34a',
    },
  },
  {
    id: 'editorial-serif',
    name: 'Editorial Luxe',
    description: 'Classic serif typography with ivory backdrop and subtle bronze',
    theme: {
      presetId: 'editorial-serif',
      bgColor: '#fafaf9',
      cardBgColor: '#ffffff',
      cardTextColor: '#1c1917',
      cardBorderColor: '#e7e5e4',
      fontStyle: 'serif',
      buttonStyle: 'rounded-none',
      buttonVariant: 'outline',
      accentColor: '#78350f',
    },
  },
  {
    id: 'electric-violet',
    name: 'Cyber Violet',
    description: 'Vibrant indigo-violet tones with modern contrast',
    theme: {
      presetId: 'electric-violet',
      bgColor: '#0f172a',
      bgType: 'gradient',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      cardBgColor: '#1e1b4b',
      cardTextColor: '#e0e7ff',
      cardBorderColor: '#3730a3',
      fontStyle: 'sans',
      buttonStyle: 'rounded-full',
      buttonVariant: 'filled',
      accentColor: '#818cf8',
    },
  },
  {
    id: 'brutalist-mono',
    name: 'Neo Brutalist',
    description: 'High contrast black borders, monospace font, hard shadow',
    theme: {
      presetId: 'brutalist-mono',
      bgColor: '#fef08a',
      cardBgColor: '#ffffff',
      cardTextColor: '#000000',
      cardBorderColor: '#000000',
      fontStyle: 'mono',
      buttonStyle: 'shadow-hard',
      buttonVariant: 'filled',
      accentColor: '#000000',
    },
  },
];

export const DEFAULT_THEME: ThemePreferences = THEME_PRESETS[0].theme;

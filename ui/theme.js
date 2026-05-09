import { colors } from './tokens';

export function getAccentColor(baby) {
  return baby?.gender === '男' ? '#7BCEEA' : '#F39AC3';
}

export function getTheme(baby) {
  return {
    colors: {
      ...colors,
      accent: getAccentColor(baby),
    },
  };
}


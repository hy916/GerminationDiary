import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightColors, darkColors } from './tokens';

export function getAccentColor(baby) {
  return baby?.gender === '男' ? '#7BCEEA' : '#F39AC3';
}

export function getTheme(baby) {
  const colors = lightColors;
  return {
    colors: {
      ...colors,
      accent: getAccentColor(baby),
    },
  };
}

export function useAppTheme(baby) {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: cs }) => {
      setColorScheme(cs || 'light');
    });
    return () => subscription.remove();
  }, []);

  const palette = colorScheme === 'dark' ? darkColors : lightColors;
  return {
    colors: {
      ...palette,
      accent: getAccentColor(baby),
    },
  };
}

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, space, fontSize, fontWeight } from '../tokens';

export default function Chip({ baby, label, selected, onPress, style, textStyle }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceSoft },
        style,
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#fff' : theme.colors.text }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});


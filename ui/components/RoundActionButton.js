import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { getTheme } from '../theme';
import { sizes, fontSize, fontWeight } from '../tokens';

export default function RoundActionButton({ baby, title, subtitle, onPress, style }) {
  const theme = getTheme(baby);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.colors.accent },
        style,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.roundAction,
    height: sizes.roundAction,
    borderRadius: sizes.roundAction / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});


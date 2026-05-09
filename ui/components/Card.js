import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getTheme } from '../theme';
import { radius, shadow, space } from '../tokens';

export default function Card({ baby, style, children }) {
  const theme = getTheme(baby);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: space.lg,
    ...shadow.card,
  },
});


import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, shadow, space, fontSize, fontWeight } from '../tokens';

export default function ModuleButton({ baby, label, onPress, style, fullWidth }) {
  const theme = useAppTheme(baby);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: theme.colors.surface },
        fullWidth ? styles.fullWidth : styles.halfWidth,
        style,
      ]}
    >
      <View style={styles.center}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    marginBottom: space.lg,
    ...shadow.card,
  },
  halfWidth: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});

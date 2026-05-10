import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, space, fontSize, fontWeight } from '../tokens';

export default function Button({ baby, label, onPress, variant = 'primary', size = 'lg', style, textStyle, disabled }) {
  const theme = useAppTheme(baby);
  const containerStyle = getContainerStyle(theme, variant, size, disabled);
  const labelStyle = getLabelStyle(theme, variant, size, disabled);

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[containerStyle, style]}>
      <Text style={[labelStyle, textStyle]}>{label}</Text>
    </Pressable>
  );
}

function getContainerStyle(theme, variant, size, disabled) {
  const base = {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.55 : 1,
  };

  const sizeStyle =
    size === 'sm'
      ? { paddingVertical: space.sm, paddingHorizontal: space.md }
      : size === 'md'
        ? { paddingVertical: 12, paddingHorizontal: space.lg }
        : { paddingVertical: 14, paddingHorizontal: space.xl };

  const variantStyle =
    variant === 'secondary'
      ? { backgroundColor: theme.colors.surfaceSoft }
      : variant === 'danger'
        ? { backgroundColor: theme.colors.danger }
        : variant === 'ghost'
          ? { backgroundColor: 'transparent' }
          : { backgroundColor: theme.colors.accent };

  return StyleSheet.flatten([base, sizeStyle, variantStyle]);
}

function getLabelStyle(theme, variant, size, disabled) {
  const base = {
    fontWeight: fontWeight.bold,
  };

  const sizeStyle =
    size === 'sm'
      ? { fontSize: fontSize.sm }
      : size === 'md'
        ? { fontSize: fontSize.md }
        : { fontSize: fontSize.lg };

  const variantStyle =
    variant === 'secondary' || variant === 'ghost'
      ? { color: theme.colors.text }
      : { color: '#fff' };

  return StyleSheet.flatten([base, sizeStyle, variantStyle, disabled ? { color: theme.colors.textSubtle } : null]);
}


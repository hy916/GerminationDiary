import React from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';
import { radius, space, fontSize, fontWeight } from '../tokens';

export default function ImageStrip({ baby, images, onPressImage, onRemoveImage, style }) {
  const theme = useAppTheme(baby);
  if (!images?.length) return null;

  return (
    <View style={[styles.row, style]}>
      {images.map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.item}>
          <Pressable onPress={() => onPressImage?.(uri)} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
          </Pressable>
          {onRemoveImage ? (
            <Pressable
              onPress={() => onRemoveImage(index)}
              style={[styles.remove, { backgroundColor: theme.colors.accent }]}
              hitSlop={10}
            >
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  item: {
    width: 72,
    height: 72,
  },
  thumbWrap: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    lineHeight: 16,
  },
});

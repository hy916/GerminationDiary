import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Platform, StatusBar } from 'react-native';
import { getTheme } from '../theme';
import { space, fontSize, fontWeight } from '../tokens';

export default function Screen({ baby, title, onBack, right, children, padded = true }) {
  const theme = getTheme(baby);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {(title || onBack || right) && (
        <View style={styles.header}>
          <View style={styles.headerSide}>
            {onBack ? (
              <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
                <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.headerCenter}>
            {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : null}
          </View>
          <View style={styles.headerSide}>{right || null}</View>
        </View>
      )}
      <View style={[styles.body, padded && styles.bodyPadded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  headerSide: {
    width: 84,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  backButton: {
    paddingVertical: space.xs,
    paddingHorizontal: space.xs,
  },
  backText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
  },
  body: {
    flex: 1,
  },
  bodyPadded: {
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
});

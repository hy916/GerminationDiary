import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../theme';
import { sizes, space, fontSize, fontWeight } from '../tokens';

export default function BottomTabBar({ baby, tabs, activeKey, onPressTab }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        return (
          <Pressable key={tab.key} onPress={() => onPressTab(tab.key)} style={styles.tab}>
            {tab.icon ? (
              <Text style={[styles.icon, { color: active ? theme.colors.accent : theme.colors.textSubtle }]}>
                {tab.icon}
              </Text>
            ) : null}
            <Text style={[styles.label, { color: active ? theme.colors.accent : theme.colors.textSubtle }]}>
              {tab.label}
            </Text>
            <View style={[styles.dot, { backgroundColor: active ? theme.colors.accent : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: sizes.tabBarHeight,
    paddingTop: space.sm,
    borderTopWidth: 1,
    // borderTopColor set dynamically via theme
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  dot: {
    marginTop: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});


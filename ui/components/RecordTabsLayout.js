import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppTheme } from '../theme';
import { space, fontSize, fontWeight, radius } from '../tokens';

export default function RecordTabsLayout({
  baby,
  addTitle = '新增记录',
  historyTitle = '历史记录',
  renderAdd,
  renderHistory,
}) {
  const theme = useAppTheme(baby);
  const pagerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('add');
  const [width, setWidth] = useState(0);

  const switchTab = (tab) => {
    setActiveTab(tab);
    pagerRef.current?.scrollTo({
      x: tab === 'add' ? 0 : width,
      animated: true,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Tab baby={baby} active={activeTab === 'add'} label={addTitle} onPress={() => switchTab('add')} />
          <Tab baby={baby} active={activeTab === 'history'} label={historyTitle} onPress={() => switchTab('history')} />
        </View>

        {width > 0 ? (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveTab(index === 0 ? 'add' : 'history');
            }}
          >
            <ScrollView
              style={{ width }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={styles.pageContent}
            >
              {renderAdd({ switchTab })}
            </ScrollView>

            <ScrollView
              style={{ width }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={styles.pageContent}
            >
              {renderHistory({ switchTab })}
            </ScrollView>
          </ScrollView>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

function Tab({ baby, active, label, onPress }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && { backgroundColor: theme.colors.surface }]}
    >
      <Text style={[styles.tabText, { color: active ? theme.colors.text : theme.colors.textSubtle }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    marginBottom: space.md,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: space.sm,
    marginBottom: space.lg,
    padding: 4,
    borderRadius: radius.pill,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  pageContent: {
    paddingHorizontal: space.sm,
    paddingBottom: 120,
  },
});
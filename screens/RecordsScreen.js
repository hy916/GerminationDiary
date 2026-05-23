import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Screen from '../ui/components/Screen';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

const MODULES = [
  { label: '喂奶', subtitle: '奶量 / 母乳 / 瓶喂', icon: '🍼', route: 'Feeding' },
  { label: '睡眠', subtitle: '入睡 / 醒来 / 时长', icon: '🌙', route: 'Sleep' },
  { label: '排便', subtitle: '尿布 / 便便 / 状态', icon: '🧷', route: 'Diaper' },
  { label: '生长', subtitle: '身高 / 体重 / 头围', icon: '🌱', route: 'Growth' },
  { label: '疫苗', subtitle: '接种时间 / 备注', icon: '💉', route: 'Vaccine' },
  { label: '生病', subtitle: '症状 / 用药 / 体温', icon: '🌡️', route: 'Illness' },
];

export default function RecordsScreen({ baby, onNavigate }) {
  const theme = useAppTheme(baby);

  return (
    <Screen baby={baby} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>今天要记录什么？</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            选择模块，快速记录宝宝成长点滴
          </Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}>
          <View>
            <Text style={styles.heroIcon}>✨</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>保持轻松记录</Text>
            <Text style={[styles.heroDesc, { color: theme.colors.textSubtle }]}>
              每一条小记录，都会慢慢组成宝宝的成长故事
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {MODULES.map((item) => (
            <ModuleCard
              key={item.route}
              baby={baby}
              icon={item.icon}
              label={item.label}
              subtitle={item.subtitle}
              onPress={() => onNavigate(item.route)}
            />
          ))}
        </View>

        <Pressable
          onPress={() => onNavigate('Fetal')}
          style={({ pressed }) => [
            styles.fullCard,
            { backgroundColor: theme.colors.surface, opacity: pressed ? 0.76 : 1 },
          ]}
        >
          <View style={[styles.fullIconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={styles.fullIcon}>🤰</Text>
          </View>

          <View style={styles.fullMain}>
            <Text style={[styles.fullTitle, { color: theme.colors.text }]}>孕检记录</Text>
            <Text style={[styles.fullDesc, { color: theme.colors.textSubtle }]}>
              产检、胎动、孕期重要事项
            </Text>
          </View>

          <Text style={[styles.arrow, { color: theme.colors.textSubtle }]}>›</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function ModuleCard({ baby, icon, label, subtitle, onPress }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.moduleCard,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.76 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View>
        <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.moduleSubtitle, { color: theme.colors.textSubtle }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.cardArrow, { color: theme.colors.textSubtle }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  header: {
    marginBottom: space.lg,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: space.sm,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  heroIcon: {
    fontSize: 30,
    marginBottom: space.sm,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginBottom: space.md,
  },
  moduleCard: {
    width: '47.8%',
    minHeight: 142,
    borderRadius: radius.xl,
    padding: space.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 21,
  },
  moduleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 19,
    fontWeight: fontWeight.medium,
  },
  cardArrow: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  fullCard: {
    borderRadius: radius.xl,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  fullIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullIcon: {
    fontSize: 24,
  },
  fullMain: {
    flex: 1,
  },
  fullTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  fullDesc: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  arrow: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
  },
});
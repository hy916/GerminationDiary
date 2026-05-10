import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

export default function MeScreen({ baby, onNavigate, onClearRecords }) {
  const theme = useAppTheme(baby);

  const ageLabel = useMemo(() => ageText(baby.birthday), [baby.birthday]);

  return (
    <Screen baby={baby} padded={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>我的</Text>

        <Card baby={baby} style={styles.profileCard}>
          <View style={styles.profileRow}>
            {baby.avatar ? (
              <Image source={{ uri: baby.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSoft }]} />
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{baby.name || '宝宝'}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                {baby.gender} · {ageLabel}
              </Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                {baby.birthInfo?.weight || '--'} · {baby.birthInfo?.length || '--'} · {baby.birthInfo?.delivery || '--'}
              </Text>
            </View>
          </View>

          <View style={styles.profileButtons}>
            <Button baby={baby} label="编辑档案" onPress={() => onNavigate('Profile')} />
            <Button baby={baby} label="进入记录模块" variant="secondary" onPress={() => onNavigate('Records')} style={styles.secondaryBtn} />
          </View>
        </Card>

        <Card baby={baby} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>数据管理</Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>
            清空当前宝宝的所有记录（档案信息保留）
          </Text>
          <Button baby={baby} label="清空记录" variant="danger" onPress={onClearRecords} style={styles.dangerBtn} />
        </Card>

        <Card baby={baby} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>关于</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textMuted }]}>版本：2.0.0</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textMuted }]}>萌芽日记 · 记录宝宝成长点滴</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ageText(birthday) {
  if (!birthday) return '--';
  const birth = new Date(birthday);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  const anchor = new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate());
  const days = Math.max(0, Math.floor((now - anchor) / (1000 * 60 * 60 * 24)));
  return `${months}个月 ${days}天`;
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: space.xl,
  },
  profileCard: {
    padding: space.xl,
    borderRadius: radius.xl,
    marginBottom: space.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginRight: space.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.xs,
  },
  meta: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  profileButtons: {
    gap: space.md,
  },
  secondaryBtn: {
    // backgroundColor handled by theme via variant
  },
  sectionCard: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  sectionDesc: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dangerBtn: {
    marginTop: space.lg,
  },
  aboutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginTop: 4,
  },
});


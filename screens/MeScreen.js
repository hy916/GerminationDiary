import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable,Linking } from 'react-native';
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>宝宝档案</Text>
        </View>

        <Card baby={baby} style={styles.profileCard}>
          <View style={styles.profileTop}>
            {baby.avatar ? (
              <Image source={{ uri: baby.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={styles.avatarEmoji}>👶</Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{baby.name || '宝宝'}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                {baby.gender || '--'}宝 · {ageLabel}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem baby={baby} label="出生体重" value={baby.birthInfo?.weight || '--'} />
            <InfoItem baby={baby} label="出生身长" value={baby.birthInfo?.length || '--'} />
            <InfoItem baby={baby} label="分娩方式" value={baby.birthInfo?.delivery || '--'} />
          </View>
        </Card>

        <View style={styles.menuGroup}>
          <MenuItem
            baby={baby}
            icon="🧸"
            title="编辑档案"
            desc="头像、生日、出生信息"
            onPress={() => onNavigate('Profile')}
          />
          <MenuItem
            baby={baby}
            icon="📒"
            title="记录中心"
            desc="喂奶、睡眠、排便、生长等"
            onPress={() => onNavigate('Records')}
          />
          <MenuItem
            baby={baby}
            icon="💾"
            title="数据管理"
            desc="导出备份或从备份恢复数据"
            onPress={() => onNavigate('DataBackup')}
          />
            <MenuItem
            baby={baby}
            icon="🗂️"
            title="清空数据"
            desc="清空当前宝宝的所有记录，档案信息会保留"
            onPress={() => onClearRecords()}
          />
            <MenuItem
            baby={baby}
            icon="👨"
            title="联系作者"
            desc="《萌芽日记》用简单、温柔的方式，记录宝宝成长中的每一个小瞬间。"
            onPress={() => Linking.openURL('https://github.com/hy916/GerminationDiary')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function InfoItem({ baby, label, value }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.infoItem, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.infoLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
}

function MenuItem({ baby, icon, title, desc, onPress }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.76 : 1 },
      ]}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>

      <View style={styles.menuCopy}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.menuDesc, { color: theme.colors.textSubtle }]}>{desc}</Text>
      </View>

      <Text style={[styles.menuArrow, { color: theme.colors.textSubtle }]}>›</Text>
    </Pressable>
  );
}

function ageText(birthday) {
  if (!birthday) return '--';

  const birth = new Date(birthday);
  const now = new Date();

  const rawMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  const months = Math.max(0, rawMonths);

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
  header: {
    marginBottom: space.lg,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
  },
  profileCard: {
    padding: space.xl,
    borderRadius: radius.xl,
    marginBottom: space.lg,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: space.lg,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  meta: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
  },
  infoItem: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.medium,
  },
  menuGroup: {
    gap: space.md,
    marginBottom: space.lg,
  },
  menuItem: {
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
  menuIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuCopy: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  menuArrow: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
  },
  sectionCard: {
    marginBottom: space.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 21,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },
  dangerBtn: {
    marginTop: space.lg,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  aboutIcon: {
    fontSize: 34,
  },
  aboutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  aboutDesc: {
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },
});
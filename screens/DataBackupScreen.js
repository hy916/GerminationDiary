import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

const RECORD_CATEGORIES = [
  { key: 'feedingRecords', label: '喂奶', icon: '🍼' },
  { key: 'sleepRecords', label: '睡眠', icon: '🌙' },
  { key: 'diaperRecords', label: '排便', icon: '🧷' },
  { key: 'growthRecords', label: '生长', icon: '🌱' },
  { key: 'vaccineRecords', label: '疫苗', icon: '💉' },
  { key: 'illnessRecords', label: '生病', icon: '🌡️' },
  { key: 'fetalRecords', label: '孕检', icon: '🤰' },
];

export default function DataBackupScreen({ baby, onBack, onExport, onImport }) {
  const theme = useAppTheme(baby);

  const [selectedCats, setSelectedCats] = useState(() => {
    const initial = {};
    RECORD_CATEGORIES.forEach((c) => { initial[c.key] = true; });
    return initial;
  });

  const allSelected = Object.values(selectedCats).every(Boolean);
  const anySelected = Object.values(selectedCats).some(Boolean);

  const toggleCat = (key) => {
    setSelectedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const next = {};
    RECORD_CATEGORIES.forEach((c) => { next[c.key] = !allSelected; });
    setSelectedCats(next);
  };

  return (
    <Screen baby={baby} title="数据导入导出" onBack={onBack}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Card baby={baby} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>导出数据</Text>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            选择要导出的记录类型，生成 JSON 备份文件，可通过分享保存到其他应用或 AirDrop。
          </Text>

          <View style={styles.toggleRow}>
            <Pressable
              onPress={toggleAll}
              style={[styles.toggleAllBtn, { backgroundColor: theme.colors.surfaceMuted }]}
            >
              <Text style={[styles.toggleAllText, { color: theme.colors.text }]}>
                {allSelected ? '取消全选' : '全选'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.catGrid}>
            {RECORD_CATEGORIES.map((cat) => {
              const count = (baby[cat.key] || []).length;
              const checked = selectedCats[cat.key];
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => toggleCat(cat.key)}
                  style={[
                    styles.catChip,
                    { backgroundColor: checked ? theme.colors.accent : theme.colors.surfaceMuted },
                  ]}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text style={[styles.catChipLabel, { color: checked ? '#fff' : theme.colors.text }]}>
                    {cat.label}
                  </Text>
                  <Text style={[styles.catChipCount, { color: checked ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted }]}>
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            baby={baby}
            label="导出选中数据"
            onPress={() => {
              if (!anySelected) {
                Alert.alert('提示', '请至少选择一项数据');
                return;
              }
              onExport(selectedCats);
            }}
          />
        </Card>

        <Card baby={baby} style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>导入数据</Text>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            选择之前导出的 JSON 备份文件，导入后将覆盖当前所有数据。建议导入前先导出一份备份。
          </Text>

          <Button
            baby={baby}
            label="选择备份文件导入"
            variant="secondary"
            onPress={onImport}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  card: {
    marginBottom: space.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  cardDesc: {
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
    marginBottom: space.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: space.md,
  },
  toggleAllBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 6,
  },
  toggleAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.lg,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 8,
  },
  catChipIcon: {
    fontSize: 14,
  },
  catChipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  catChipCount: {
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.medium,
  },
});
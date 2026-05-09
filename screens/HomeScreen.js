import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image } from 'react-native';
import { getTodayDateString, getWeekDateRange, getMonthDateRange, countRecordsInRange } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Chip from '../ui/components/Chip';
import { getTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

export default function HomeScreen({ baby, onNavigate }) {
  const theme = getTheme(baby);
  const [viewMode, setViewMode] = useState('today');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  const today = getTodayDateString();
  const todayRecords = (records = []) => records.filter((r) => (r.createdAt || '').startsWith(today));

  const { startOfWeek, endOfWeek } = getWeekDateRange();
  const { startOfMonth, endOfMonth } = getMonthDateRange();

  const summary = useMemo(() => {
    const feeding = viewMode === 'today'
      ? todayRecords(baby.feedingRecords).length
      : viewMode === 'week'
        ? countRecordsInRange(baby.feedingRecords, startOfWeek, endOfWeek)
        : countRecordsInRange(baby.feedingRecords, startOfMonth, endOfMonth);

    const sleep = viewMode === 'today'
      ? todayRecords(baby.sleepRecords).length
      : viewMode === 'week'
        ? countRecordsInRange(baby.sleepRecords, startOfWeek, endOfWeek)
        : countRecordsInRange(baby.sleepRecords, startOfMonth, endOfMonth);

    const diaper = viewMode === 'today'
      ? todayRecords(baby.diaperRecords).length
      : viewMode === 'week'
        ? countRecordsInRange(baby.diaperRecords, startOfWeek, endOfWeek)
        : countRecordsInRange(baby.diaperRecords, startOfMonth, endOfMonth);

    const growth = viewMode === 'today'
      ? todayRecords(baby.growthRecords).length
      : viewMode === 'week'
        ? countRecordsInRange(baby.growthRecords, startOfWeek, endOfWeek)
        : countRecordsInRange(baby.growthRecords, startOfMonth, endOfMonth);

    const title = viewMode === 'week' ? '周记录速览' : viewMode === 'month' ? '月记录速览' : '今日记录速览';

    return { feeding, sleep, diaper, growth, title };
  }, [
    baby.feedingRecords,
    baby.sleepRecords,
    baby.diaperRecords,
    baby.growthRecords,
    endOfMonth,
    endOfWeek,
    startOfMonth,
    startOfWeek,
    viewMode,
  ]);

  const allRecords = useMemo(() => {
    const merged = [
      ...withModule(baby.feedingRecords, 'feeding', '喂奶'),
      ...withModule(baby.sleepRecords, 'sleep', '睡眠'),
      ...withModule(baby.diaperRecords, 'diaper', '排便'),
      ...withModule(baby.growthRecords, 'growth', '生长'),
      ...withModule(baby.vaccineRecords, 'vaccine', '疫苗'),
      ...withModule(baby.illnessRecords, 'illness', '生病'),
    ]
      .filter((r) => !!r.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return merged.slice(0, 30);
  }, [
    baby.diaperRecords,
    baby.feedingRecords,
    baby.growthRecords,
    baby.illnessRecords,
    baby.sleepRecords,
    baby.vaccineRecords,
  ]);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return allRecords;
    return allRecords.filter((r) => r.module === filter);
  }, [allRecords, filter]);

  return (
    <Screen baby={baby} padded={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={[styles.appTitle, { color: theme.colors.text }]}>萌芽日记</Text>
          <Pressable onPress={() => onNavigate('Profile')} style={[styles.profilePill, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.profilePillText, { color: theme.colors.textMuted }]}>
              {baby.name || '宝宝'} · 档案
            </Text>
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          <View style={styles.quickRow}>
            <QuickEntry baby={baby} label="喂奶" onPress={() => onNavigate('Feeding')} />
            <QuickEntry baby={baby} label="睡眠" onPress={() => onNavigate('Sleep')} />
          </View>
          <View style={styles.quickRow}>
            <QuickEntry baby={baby} label="排便" onPress={() => onNavigate('Diaper')} />
            <QuickEntry baby={baby} label="生长" onPress={() => onNavigate('Growth')} />
          </View>
        </View>

        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{summary.title}</Text>
          <View style={styles.chipRow}>
            <Chip baby={baby} label="今日" selected={viewMode === 'today'} onPress={() => setViewMode('today')} style={styles.smallChip} />
            <Chip baby={baby} label="周" selected={viewMode === 'week'} onPress={() => setViewMode('week')} style={styles.smallChip} />
            <Chip baby={baby} label="月" selected={viewMode === 'month'} onPress={() => setViewMode('month')} style={styles.smallChip} />
          </View>
          <View style={styles.summaryRow}>
            <SummaryItem baby={baby} label="喂奶" value={summary.feeding} />
            <SummaryItem baby={baby} label="排便" value={summary.diaper} />
            <SummaryItem baby={baby} label="睡眠" value={summary.sleep} />
            <SummaryItem baby={baby} label="生长" value={summary.growth} />
          </View>
        </Card>

        <Card baby={baby} style={styles.cardSpacing}>
          <View style={styles.latestHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>最新记录</Text>
            <Pressable onPress={() => onNavigate('Records')} hitSlop={10}>
              <Text style={[styles.linkText, { color: theme.colors.textMuted }]}>查看全部</Text>
            </Pressable>
          </View>

          <View style={styles.filterRow}>
            {[
              { key: 'all', label: '全部' },
              { key: 'feeding', label: '喂奶' },
              { key: 'sleep', label: '睡眠' },
              { key: 'diaper', label: '排便' },
              { key: 'growth', label: '生长' },
            ].map((item) => (
              <Chip
                key={item.key}
                baby={baby}
                label={item.label}
                selected={filter === item.key}
                onPress={() => setFilter(item.key)}
                style={styles.filterChip}
              />
            ))}
          </View>

          {filteredRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>暂无记录</Text>
          ) : (
            filteredRecords.map((record) => (
              <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.surfaceMuted }]}>
                <View style={styles.recordMain}>
                  <Text style={[styles.recordTitle, { color: theme.colors.text }]}>{record.moduleLabel}</Text>
                  <Text style={[styles.recordTime, { color: theme.colors.textSubtle }]}>{record.createdAt}</Text>
                  <Text style={[styles.recordSummary, { color: theme.colors.textMuted }]} numberOfLines={2}>
                    {formatRecordSummary(record)}
                  </Text>
                  {record.note ? (
                    <Text style={[styles.recordNote, { color: theme.colors.textMuted }]} numberOfLines={2}>
                      备注：{record.note}
                    </Text>
                  ) : null}
                </View>
                {record.images?.[0] ? (
                  <Pressable onPress={() => setSelectedImage(record.images[0])} style={styles.recordThumbWrap}>
                    <Image source={{ uri: record.images[0] }} style={styles.recordThumb} />
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </Card>

        <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalClose} onPress={() => setSelectedImage(null)}>
              <Text style={[styles.modalCloseText, { color: theme.colors.text }]}>关闭</Text>
            </Pressable>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.modalImage} /> : null}
          </View>
        </Modal>
      </ScrollView>
    </Screen>
  );
}

function withModule(records, module, moduleLabel) {
  return (records || []).map((r) => ({
    ...r,
    module,
    moduleLabel,
  }));
}

function formatRecordSummary(record) {
  if (record.module === 'feeding') {
    const amount = record.amount ? `奶量：${record.amount}` : '';
    const duration = record.duration ? `时长：${record.duration}` : '';
    const type = record.type ? `${record.type}` : '';
    return [type, duration, amount].filter(Boolean).join('  ');
  }
  if (record.module === 'sleep') {
    const range = record.startTime && record.endTime ? `${record.startTime} - ${record.endTime}` : '';
    const duration = record.duration ? `· ${record.duration}` : '';
    return `${record.type || '睡眠'} · ${range} ${duration}`.trim();
  }
  if (record.module === 'diaper') {
    return `${record.type || '排便'}${record.note ? ` · ${record.note}` : ''}`.trim();
  }
  if (record.module === 'growth') {
    const w = record.weight ? `体重：${record.weight}` : '';
    const h = record.height ? `身高：${record.height}` : '';
    return [w, h].filter(Boolean).join('  ') || (record.note || '');
  }
  return record.note || '';
}

function SummaryItem({ baby, label, value }) {
  const theme = getTheme(baby);
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryNumber, { color: theme.colors.accent }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
}

function QuickEntry({ baby, label, onPress }) {
  const theme = getTheme(baby);
  return (
    <Pressable onPress={onPress} style={[styles.quickButton, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.quickText, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.xl,
  },
  appTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  profilePill: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  profilePillText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  quickGrid: {
    marginBottom: space.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: space.lg,
  },
  quickButton: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  quickText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  cardSpacing: {
    marginBottom: space.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
  },
  smallChip: {
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 30,
    fontWeight: fontWeight.bold,
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  linkText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.lg,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  recordItem: {
    borderRadius: radius.lg,
    padding: space.lg,
    flexDirection: 'row',
    marginBottom: space.md,
  },
  recordMain: {
    flex: 1,
    marginRight: space.md,
  },
  recordTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  recordTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: 6,
  },
  recordSummary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: 4,
  },
  recordNote: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  recordThumbWrap: {
    width: 86,
    height: 86,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  recordThumb: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: radius.lg,
  },
});

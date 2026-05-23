import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image } from 'react-native';
import { getTodayDateString, getWeekDateRange, getMonthDateRange, countRecordsInRange } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Chip from '../ui/components/Chip';
import ImageStrip from '../ui/components/ImageStrip';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

const QUICK_ACTIONS = [
  { key: 'feeding', label: '喂奶', subtitle: '快速记录', icon: '🍼', route: 'Feeding' },
  { key: 'sleep', label: '睡眠', subtitle: '作息追踪', icon: '🌙', route: 'Sleep' },
  { key: 'diaper', label: '排便', subtitle: '便便尿布', icon: '🧷', route: 'Diaper' },
  { key: 'growth', label: '生长', subtitle: '身高体重', icon: '🌱', route: 'Growth' },
];

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'feeding', label: '喂奶' },
  { key: 'sleep', label: '睡眠' },
  { key: 'diaper', label: '排便' },
  { key: 'growth', label: '生长' },
];

export default function HomeScreen({ baby, onNavigate }) {
  const theme = useAppTheme(baby);
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

    const title = viewMode === 'week' ? '周统计' : viewMode === 'month' ? '月统计' : '日统计';

    return { feeding, sleep, diaper, growth, title };
  }, [baby, endOfMonth, endOfWeek, startOfMonth, startOfWeek, viewMode]);

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
      .sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));

    return merged.slice(0, 30);
  }, [baby]);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return allRecords;
    return allRecords.filter((r) => r.module === filter);
  }, [allRecords, filter]);

  return (
    <Screen baby={baby} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <View style={styles.heroTopRow}>
              <Text style={[styles.appTitle, { color: theme.colors.text }]}>萌芽日记</Text>
            <Pressable
              onPress={() => onNavigate('Profile')}
              style={({ pressed }) => [
                styles.profilePill,
                { backgroundColor: theme.colors.surface, opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <Text style={styles.profileAvatar}>👶</Text>
              <Text style={[styles.profilePillText, { color: theme.colors.textMuted }]} numberOfLines={1}>
                {baby.name || '宝宝'}
              </Text>
            </Pressable>
          </View>
        <Card baby={baby} style={styles.cardSpacing}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{summary.title}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSubtle }]}>轻量统计，一眼掌握节奏</Text>
          </View>

          <View style={[styles.segmentedControl, { backgroundColor: theme.colors.surfaceMuted }]}>
            {[
              { key: 'today', label: '今日' },
              { key: 'week', label: '本周' },
              { key: 'month', label: '本月' },
            ].map((item) => {
              const selected = viewMode === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setViewMode(item.key)}
                  style={[styles.segmentItem, selected && { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.segmentText, { color: selected ? theme.colors.text : theme.colors.textSubtle }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryGrid}>
            <SummaryItem baby={baby} label="喂奶" value={summary.feeding} icon="🍼" />
            <SummaryItem baby={baby} label="排便" value={summary.diaper} icon="🧷" />
            <SummaryItem baby={baby} label="睡眠" value={summary.sleep} icon="🌙" />
            <SummaryItem baby={baby} label="生长" value={summary.growth} icon="🌱" />
          </View>
        </Card>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((item) => (
            <QuickEntry
              key={item.key}
              baby={baby}
              icon={item.icon}
              label={item.label}
              subtitle={item.subtitle}
              onPress={() => onNavigate(item.route)}
            />
          ))}
        </View>
        <Card baby={baby} style={styles.cardSpacing}>
          <View style={styles.latestHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>最新记录</Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.textSubtle }]}>最近 30 条动态</Text>
            </View>

            <Pressable onPress={() => onNavigate('Records')} hitSlop={10}>
              <Text style={[styles.linkText, { color: theme.colors.accent }]}>查看全部</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((item) => (
              <Chip
                key={item.key}
                baby={baby}
                label={item.label}
                selected={filter === item.key}
                onPress={() => setFilter(item.key)}
                style={styles.filterChip}
              />
            ))}
          </ScrollView>

          {filteredRecords.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Text style={styles.emptyIcon}>🫧</Text>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>暂无记录</Text>
              <Text style={[styles.emptyHint, { color: theme.colors.textSubtle }]}>从上方快捷入口开始记录吧</Text>
            </View>
          ) : (
            filteredRecords.map((record) => (
              <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.surfaceMuted }]}>
                <View style={styles.recordHeader}>
                  <View style={[styles.recordIcon, { backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.recordIconText}>{getRecordIcon(record.module)}</Text>
                  </View>

                  <View style={styles.recordMain}>
                    <View style={styles.recordTitleRow}>
                      <Text style={[styles.recordTitle, { color: theme.colors.text }]}>{record.moduleLabel}</Text>
                      <Text style={[styles.recordTime, { color: theme.colors.textSubtle }]}>
                        {formatRecordTime(record.createdAt)}
                      </Text>
                    </View>

                    <Text style={[styles.recordSummary, { color: theme.colors.textMuted }]} numberOfLines={2}>
                      {formatRecordSummary(record) || '暂无详情'}
                    </Text>
                  </View>
                </View>

                {record.note ? (
                  <Text style={[styles.recordNote, { color: theme.colors.textMuted }]} numberOfLines={2}>
                    备注：{record.note}
                  </Text>
                ) : null}

                {record.images?.length ? (
                  <View style={styles.imageStripWrap}>
                    <ImageStrip baby={baby} images={record.images} onPressImage={(uri) => setSelectedImage(uri)} />
                  </View>
                ) : null}
              </View>
            ))
          )}
        </Card>

        <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedImage(null)} />
            <Pressable style={styles.modalClose} onPress={() => setSelectedImage(null)}>
              <Text style={styles.modalCloseText}>关闭</Text>
            </Pressable>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.modalImage} /> : null}
          </View>
        </Modal>
      </ScrollView>
    </Screen>
  );
}

function parseCreatedAt(dateStr) {
  if (!dateStr) return 0;
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).getTime();
}

function withModule(records, module, moduleLabel) {
  return (records || []).map((r) => ({ ...r, module, moduleLabel }));
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
    return [w, h].filter(Boolean).join('  ') || record.note || '';
  }

  return record.note || '';
}

function formatRecordTime(createdAt) {
  if (!createdAt) return '';
  const [, timePart] = createdAt.split(' ');
  return timePart || createdAt;
}

function getRecordIcon(module) {
  const icons = {
    feeding: '🍼',
    sleep: '🌙',
    diaper: '🧷',
    growth: '🌱',
    vaccine: '💉',
    illness: '🌡️',
  };
  return icons[module] || '📝';
}

function SummaryItem({ baby, label, value, icon }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.summaryItem, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={[styles.summaryNumber, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
    </View>
  );
}

function QuickEntry({ baby, icon, label, subtitle, onPress }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickButton,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.78 : 1 },
      ]}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
        <Text style={styles.quickIcon}>{icon}</Text>
      </View>

      <View style={styles.quickCopy}>
        <Text style={[styles.quickText, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.quickSubText, { color: theme.colors.textSubtle }]}>{subtitle}</Text>
      </View>

      <Text style={[styles.quickArrow, { color: theme.colors.textSubtle }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },

  appTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
  },
  profilePill: {
    maxWidth: 138,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: space.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileAvatar: {
    fontSize: 17,
  },
  profilePillText: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginBottom: space.lg,
  },
  quickButton: {
    width: '48.5%',
    minHeight: 112,
    borderRadius: radius.xl,
    padding: space.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 1,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 20,
  },
  quickCopy: {
    marginTop: space.md,
  },
  quickText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 3,
  },
  quickSubText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  quickArrow: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  cardSpacing: {
    marginBottom: space.lg,
  },
  sectionHeader: {
    marginBottom: space.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    marginTop: 5,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: space.lg,
  },
  segmentItem: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  summaryItem: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 17,
    marginBottom: 5,
  },
  summaryNumber: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: fontWeight.bold,
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.medium,
  },
  latestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  linkText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  filterRow: {
    gap: space.sm,
    paddingRight: space.lg,
    marginBottom: space.lg,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  emptyState: {
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: space.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyHint: {
    marginTop: 5,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  recordItem: {
    borderRadius: radius.xl,
    padding: space.md,
    marginBottom: space.md,
  },
  recordHeader: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIconText: {
    fontSize: 18,
  },
  recordMain: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: 4,
  },
  recordTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  recordTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  recordSummary: {
    fontSize: fontSize.md,
    lineHeight: 21,
    fontWeight: fontWeight.medium,
  },
  recordNote: {
    marginTop: space.sm,
    paddingLeft: 52,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  imageStripWrap: {
    marginTop: space.md,
    paddingLeft: 52,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalClose: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modalCloseText: {
    color: '#111',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  modalImage: {
    width: '100%',
    height: '72%',
    resizeMode: 'contain',
    borderRadius: radius.lg,
  },
});

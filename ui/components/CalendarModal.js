import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { fontSize, fontWeight, radius, space } from '../tokens';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const jsDayIndex = new Date(year, month, 1).getDay();
  const firstDayIndex = (jsDayIndex + 6) % 7;
  const totalDays = getDaysInMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) days.push(null);
  for (let day = 1; day <= totalDays; day++) days.push(new Date(year, month, day));

  const tail = days.length % 7;
  if (tail) {
    for (let i = 0; i < 7 - tail; i++) days.push(null);
  }

  return days;
}

export default function CalendarModal({ baby, visible, value, onClose, onSelect }) {
  const theme = useAppTheme(baby);
  const initialMonth = useMemo(() => {
    if (value) {
      const dt = new Date(`${value}T00:00:00`);
      if (!Number.isNaN(dt.getTime())) return new Date(dt.getFullYear(), dt.getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [value]);

  const [monthDate, setMonthDate] = useState(initialMonth);
  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate]);

  useEffect(() => {
    if (!visible) return;
    setMonthDate(initialMonth);
  }, [visible, initialMonth]);

  const goMonth = (offset) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectedValue = value || '';

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Pressable style={styles.navButton} onPress={() => goMonth(-1)}>
              <Text style={[styles.navText, { color: theme.colors.accent }]}>‹</Text>
            </Pressable>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {monthDate.getFullYear()}年{monthDate.getMonth() + 1}月
            </Text>
            <Pressable style={styles.navButton} onPress={() => goMonth(1)}>
              <Text style={[styles.navText, { color: theme.colors.accent }]}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
              <Text key={label} style={[styles.weekText, { color: theme.colors.textMuted }]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {days.slice(rowIndex * 7, rowIndex * 7 + 7).map((date, cellIndex) => {
                  const dateStr = date ? formatLocalDate(date) : '';
                  const selected = !!dateStr && dateStr === selectedValue;
                  return (
                    <Pressable
                      key={`${rowIndex}-${cellIndex}`}
                      style={[
                        styles.cell,
                        selected ? { backgroundColor: theme.colors.accent } : null,
                      ]}
                      onPress={() => (date ? onSelect?.(dateStr) : null)}
                      disabled={!date}
                    >
                      <Text style={[styles.cellText, selected ? styles.cellTextSelected : null, { color: selected ? '#fff' : theme.colors.text }]}>
                        {date ? date.getDate() : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSoft }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.colors.text }]}>关闭</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  navButton: {
    padding: space.sm,
  },
  navText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: space.sm,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  grid: {},
  gridRow: {
    flexDirection: 'row',
    marginBottom: space.sm,
  },
  cell: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  cellTextSelected: {
    color: '#fff',
  },
  closeBtn: {
    marginTop: space.md,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  closeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

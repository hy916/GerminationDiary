import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image } from 'react-native';
import { getTodayDateString, getWeekDateRange, getMonthDateRange, countRecordsInRange } from '../utils/timeUtils';

export default function HomeScreen({ baby, onNavigate }) {
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'month'
  const [selectedImage, setSelectedImage] = useState(null);
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';

  // 今日数据
  const today = getTodayDateString();
  const todayRecords = (records = []) => records.filter(r => r.createdAt.startsWith(today));
  const todayFeeding = todayRecords(baby.feedingRecords).length;
  const todaySleep = todayRecords(baby.sleepRecords).length;
  const todayDiaper = todayRecords(baby.diaperRecords).length;
  const todayGrowth = todayRecords(baby.growthRecords).length;

  // 本周数据
  const { startOfWeek, endOfWeek } = getWeekDateRange();
  const weekFeeding = countRecordsInRange(baby.feedingRecords, startOfWeek, endOfWeek);
  const weekSleep = countRecordsInRange(baby.sleepRecords, startOfWeek, endOfWeek);
  const weekDiaper = countRecordsInRange(baby.diaperRecords, startOfWeek, endOfWeek);
  const weekGrowth = countRecordsInRange(baby.growthRecords, startOfWeek, endOfWeek);

  // 本月数据
  const { startOfMonth, endOfMonth } = getMonthDateRange();
  const monthFeeding = countRecordsInRange(baby.feedingRecords, startOfMonth, endOfMonth);
  const monthSleep = countRecordsInRange(baby.sleepRecords, startOfMonth, endOfMonth);
  const monthDiaper = countRecordsInRange(baby.diaperRecords, startOfMonth, endOfMonth);
  const monthGrowth = countRecordsInRange(baby.growthRecords, startOfMonth, endOfMonth);

  const allRecords = [
    ...baby.feedingRecords.map(r => ({ ...r, type: '喂奶' })),
    ...baby.diaperRecords.map(r => ({ ...r, type: '排便' })),
    ...baby.sleepRecords.map(r => ({ ...r, type: '睡眠' })),
    ...baby.growthRecords.map(r => ({ ...r, type: '生长' })),
    ...baby.vaccineRecords.map(r => ({ ...r, type: '疫苗' })),
    ...baby.illnessRecords.map(r => ({ ...r, type: '生病' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);

  const getSummaryData = () => {
    switch (viewMode) {
      case 'week':
        return { feeding: weekFeeding, sleep: weekSleep, diaper: weekDiaper, growth: weekGrowth, title: '周记录速览' };
      case 'month':
        return { feeding: monthFeeding, sleep: monthSleep, diaper: monthDiaper, growth: monthGrowth, title: '月记录速览' };
      default:
        return { feeding: todayFeeding, sleep: todaySleep, diaper: todayDiaper, growth: todayGrowth, title: '今日记录速览' };
    }
  };

  const summary = getSummaryData();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contentContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{summary.title}</Text>
          <View style={styles.modeButtonsContainer}>
            {[
              { key: 'today', label: '今日' },
              { key: 'week', label: '周' },
              { key: 'month', label: '月' },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setViewMode(item.key)}
                style={[styles.modeButton, viewMode === item.key && { ...styles.modeButtonActive, backgroundColor: themeColor }]}
              >
                <Text style={[styles.modeButtonText, viewMode === item.key && styles.modeButtonTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.feeding}</Text>
            <Text style={styles.summaryLabel}>喂奶</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.diaper}</Text>
            <Text style={styles.summaryLabel}>排便</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.sleep}</Text>
            <Text style={styles.summaryLabel}>睡眠</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.growth}</Text>
            <Text style={styles.summaryLabel}>生长</Text>
          </View>
        </View>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>最新记录</Text>
        {allRecords.length > 0 ? (
          allRecords.map((record, index) => (
            <View key={index} style={styles.recordRow}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordType}>{record.type}：</Text>
                <Text style={styles.recordTime}>{new Date(record.createdAt).toLocaleString()}</Text>
                <Text style={styles.recordNote}>{record.note || '无备注'}</Text>
              </View>
              {record.images && record.images.length > 0 && (
                <Pressable style={styles.thumbnailContainer} onPress={() => setSelectedImage(record.images[0])}>
                  <Image source={{ uri: record.images[0] }} style={styles.thumbnail} />
                  {record.images.length > 1 && (
                    <View style={styles.imageCountBadge}>
                      <Text style={styles.imageCountText}>+{record.images.length - 1}</Text>
                    </View>
                  )}
                </Pressable>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>暂无记录，点击上方快捷按钮开始记录。</Text>
        )}
      </View>
      <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Text style={styles.modalCloseText}>关闭</Text>
          </Pressable>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    marginTop:40,
    flex: 1,
    backgroundColor: '#F8F4EE',
  },
  contentContainer: {
    padding: 16,
  },
  quickContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#7D5A50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  quickText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 12,
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0ECE7',
  },
  modeButtonActive: {
    backgroundColor: '#7D5A50',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A403A',
  },
  modeButtonTextActive: {
    color: '#fff',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#7D5A50',
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#8B7C70',
  },
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4C44',
  },
  detailValue: {
    fontSize: 14,
    color: '#7A6B62',
  },
  emptyText: {
    fontSize: 14,
    color: '#9D8F86',
  },
  floatingButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    gap: 10,
  },
  floatingButton: {
    flex: 1,
    backgroundColor: '#7D5A50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F6F2',
    borderRadius: 8,
  },
  recordLeft: {
    flex: 1,
  },
  recordType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A403A',
  },
  recordTime: {
    fontSize: 12,
    color: '#8B7C70',
    marginTop: 2,
  },
  recordNote: {
    fontSize: 14,
    color: '#7A6B62',
    marginTop: 4,
  },
  thumbnailContainer: {
    marginLeft: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  imageCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modalCloseText: {
    color: '#4A403A',
    fontSize: 14,
    fontWeight: '600',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});

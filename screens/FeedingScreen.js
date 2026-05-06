import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {  formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';

export default function FeedingScreen({ baby, onAddFeeding, onUpdateFeeding, onDeleteFeeding, onSetPendingFeedingStart }) {
  const [feedingType, setFeedingType] = useState('母乳');
  const [startTime, setStartTime] = useState(baby.pendingFeedingStart || '');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';

  useEffect(() => {
    setStartTime(baby.pendingFeedingStart || '');
  }, [baby.pendingFeedingStart]);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setFeedingType('母乳');
    setStartTime(baby.pendingFeedingStart || '');
    setEndTime('');
    setDuration('');
    setAmount('');
    setNote('');
    setImages([]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFeedingType(item.type || '母乳');
    setStartTime(item.startTime || '');
    setEndTime(item.endTime || '');
    setDuration(item.duration || '');
    setAmount(item.amount || '');
    setNote(item.note || '');
    setImages(item.images || []);
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteFeeding(id) },
    ]);
  };

  const parseDate = (value) => {
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDuration = (start, end) => {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    if (!startDate || !endDate || endDate <= startDate) return '';
    const diff = Math.round((endDate - startDate) / 60000);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}小时${minutes}分钟`;
  };

  const feedingDuration = startTime
    ? formatDuration(startTime, endTime || formatDateTimeYYYYMMDDHHmm())
    : '';

  const handleRecordStart = () => {
    const now = formatDateTimeYYYYMMDDHHmm();
    if (startTime && !endTime) {
      Alert.alert('已存在开始时间', '是否覆盖当前开始时间？', [
        { text: '取消', style: 'cancel' },
        {
          text: '确认覆盖',
          onPress: () => {
            setStartTime(now);
            setEndTime('');
            setDuration('');
            onSetPendingFeedingStart?.(now);
            Alert.alert('已更新开始时间', now);
          },
        },
      ]);
      return;
    }
    setStartTime(now);
    setEndTime('');
    setDuration('');
    onSetPendingFeedingStart?.(now);
    Alert.alert('已记录喂养开始时间', now);
  };

  const handleRecordEnd = () => {
    if (!startTime) {
      Alert.alert('请先记录开始时间');
      return;
    }
    const now = formatDateTimeYYYYMMDDHHmm();
    const newDuration = formatDuration(startTime, now);
    setEndTime(now);
    setDuration(newDuration);
    if (!isEditing) {
      const payload = {
        type: feedingType,
        startTime,
        endTime: now,
        duration: newDuration,
        amount,
        note,
        images,
      };
      onAddFeeding({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '喂养' });
      onSetPendingFeedingStart?.('');
      Alert.alert('喂养记录已保存', newDuration || '已记录');
      resetForm();
      return;
    }
    Alert.alert('已记录结束时间', now);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('权限被拒绝', '需要相册权限才能选择图片');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImages((prev) => [...prev, uri]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('权限被拒绝', '需要相机权限才能拍照');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImages((prev) => [...prev, uri]);
    }
  };

  const selectImage = () => {
    Alert.alert(
      '添加图片',
      '请选择来源',
      [
        { text: '相册', onPress: pickImage },
        { text: '拍照', onPress: takePhoto },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const submit = () => {
    if (!isEditing) return;
    if (!startTime || !endTime) {
      Alert.alert('请先完成开始时间和结束时间');
      return;
    }
    const finalDuration = formatDuration(startTime, endTime);
    const payload = { type: feedingType, startTime, endTime, duration: finalDuration, amount, note, images };
    onUpdateFeeding(editId, payload);
    Alert.alert('成功', '记录已更新', [{ text: '确定' }]);
    resetForm();
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速记录喂养</Text>
        <View style={styles.row}> 
          {['母乳', '奶粉'].map((item) => (
            <Pressable
              key={item}
              onPress={() => setFeedingType(item)}
              style={[styles.chip, feedingType === item && { backgroundColor: themeColor }]}
            >
              <Text style={[styles.chipText, feedingType === item && styles.chipActiveText]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.recordButtonRow}>
          <Pressable style={[styles.recordButton, { backgroundColor: themeColor }]} onPress={handleRecordStart}>
            <Text style={styles.recordButtonText}>喂养开始</Text>
            <Text style={styles.recordButtonSub}>{startTime || '点击记录'}</Text>
          </Pressable>
          <View style={styles.durationBox}>
            <Text style={styles.durationLabel}>时长</Text>
            <Text style={styles.durationText}>{startTime ? feedingDuration : '待记录'}</Text>
          </View>
          <Pressable style={[styles.recordButton, { backgroundColor: themeColor }]} onPress={handleRecordEnd}>
            <Text style={styles.recordButtonText}>喂养结束</Text>
            <Text style={styles.recordButtonSub}>{endTime || '点击记录'}</Text>
          </Pressable>
        </View>
        {feedingType === '奶粉' && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>奶量</Text>
            <TextInput style={styles.fieldInput} value={amount} onChangeText={setAmount} placeholder="如 120ml" />
          </View>
        )}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>备注</Text>
          <View style={styles.noteRow}>
            <TextInput style={[styles.fieldInput, styles.textArea, styles.noteInput]} value={note} onChangeText={setNote} placeholder="如 夜奶、宝宝吃饱" multiline />
            <Pressable style={[styles.imageButton, { backgroundColor: themeColor }]} onPress={selectImage}>
              <Text style={styles.imageButtonText}>📷</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={submit}>
          <Text style={styles.saveText}>{isEditing ? '保存修改' : '保存喂养记录'}</Text>
        </Pressable>
        {isEditing && (
          <Pressable style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelText}>取消编辑</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>历史喂养记录</Text>
        {baby.feedingRecords.length === 0 ? (
          <Text style={styles.emptyText}>还没有记录，立即添加一条。</Text>
        ) : (
          baby.feedingRecords.map((item) => (
            <View key={item.id} style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>{item.type} · {item.startTime}</Text>
                  <Text style={styles.recordText}>时长：{item.duration || '未填'}  奶量：{item.amount || '--'}</Text>
                  <Text style={styles.recordNote}>{item.note || '暂无备注'}</Text>
                  {item.images && item.images.length > 0 && (
                    <Pressable style={styles.thumbnailContainer} onPress={() => setPreviewImage(item.images[0])}>
                      <Image source={{ uri: item.images[0] }} style={styles.recordThumbnail} />
                      {item.images.length > 1 && <Text style={styles.imageCount}>{item.images.length}张</Text>}
                    </Pressable>
                  )}
                </View>
                <View style={styles.recordActions}>
                  <Pressable style={[styles.actionButton, styles.editAction]} onPress={() => handleEdit(item)}>
                    <Text style={styles.actionButtonText}>编辑</Text>
                  </Pressable>
                  <Pressable style={[styles.actionButton, styles.deleteAction]} onPress={() => confirmDelete(item.id)}>
                    <Text style={styles.actionButtonText}>删除</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
        <Modal visible={!!previewImage} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Pressable style={styles.modalClose} onPress={() => setPreviewImage(null)}>
                <Text style={styles.modalCloseText}>关闭</Text>
              </Pressable>
              {previewImage && <Image source={{ uri: previewImage }} style={styles.modalImage} />}
            </View>
          </View>
        </Modal>
      </View>
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
  section: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#7D5A50',
  },
  chipText: {
    color: '#4A403A',
    fontWeight: '600',
  },
  chipActiveText: {
    color: '#fff',
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    color: '#6E5D52',
    fontSize: 13,
  },
  recordButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  recordButtonSub: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  durationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationLabel: {
    fontSize: 13,
    color: '#6E5D52',
    marginBottom: 4,
  },
  durationText: {
    color: '#4A403A',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  fieldInput: {
    backgroundColor: '#F3ECE4',
    borderRadius: 12,
    padding: 12,
    color: '#4A403A',
  },
  textArea: {
    minHeight: 80,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  noteInput: {
    flex: 1,
  },
  imageButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  imageButtonText: {
    fontSize: 20,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  recordContent: {
    flex: 3,
    marginRight: 12,
  },
  recordLeft: {
    flex: 1,
    marginRight: 10,
  },
  recordActions: {
    width: 72,
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 10,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: '#7BCEEA',
        marginBottom:5,

  },
  deleteAction: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#A08B7D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailContainer: {
    alignItems: 'center',
  },
  recordThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  imageCount: {
    marginTop: 6,
    fontSize: 12,
    color: '#7A6B62',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalCloseText: {
    color: '#4A403A',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#7D5A50',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: '#F7F2EE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 6,
  },
  recordText: {
    fontSize: 13,
    color: '#7A6B62',
    marginBottom: 6,
  },
  recordNote: {
    fontSize: 12,
    color: '#8D7F73',
  },
  emptyText: {
    color: '#9D8F86',
    fontSize: 14,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Chip from '../ui/components/Chip';
import Button from '../ui/components/Button';
import RoundActionButton from '../ui/components/RoundActionButton';
import ImageStrip from '../ui/components/ImageStrip';
import { getTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

export default function FeedingScreen({ baby, onBack, onAddFeeding, onUpdateFeeding, onDeleteFeeding, onSetPendingFeedingStart }) {
  const theme = getTheme(baby);
  const [feedingType, setFeedingType] = useState('母乳');
  const [startTime, setStartTime] = useState(baby.pendingFeedingStart || '');
  const [endTime, setEndTime] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setStartTime(baby.pendingFeedingStart || '');
  }, [baby.pendingFeedingStart]);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setFeedingType('母乳');
    setStartTime(baby.pendingFeedingStart || '');
    setEndTime('');
    setAmount('');
    setNote('');
    setImages([]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFeedingType(item.type || '母乳');
    setStartTime(item.startTime || '');
    setEndTime(item.endTime || '');
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
            onSetPendingFeedingStart?.(now);
            Alert.alert('已更新开始时间', now);
          },
        },
      ]);
      return;
    }
    setStartTime(now);
    setEndTime('');
    onSetPendingFeedingStart?.(now);
    Alert.alert('已记录喂养开始时间', now);
  };

  const handleRecordEnd = () => {
    if (!startTime) {
      Alert.alert('请先记录开始时间');
      return;
    }
    const now = formatDateTimeYYYYMMDDHHmm();
    setEndTime(now);
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
    if (!startTime || !endTime) {
      Alert.alert('请先完成开始时间和结束时间');
      return;
    }
    const duration = formatDuration(startTime, endTime);
    const payload = { type: feedingType, startTime, endTime, duration, amount, note, images };
    if (isEditing) {
      onUpdateFeeding(editId, payload);
      Alert.alert('成功', '记录已更新', [{ text: '确定' }]);
    } else {
      onAddFeeding({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '喂养' });
      onSetPendingFeedingStart?.('');
      Alert.alert('喂养记录已保存', duration || '已记录');
    }
    resetForm();
  };

  return (
    <Screen baby={baby} title="喂奶" onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>快速记录喂养</Text>
          <View style={styles.segmentRow}>
            {['母乳', '奶粉'].map((item) => (
              <Chip
                key={item}
                baby={baby}
                label={item}
                selected={feedingType === item}
                onPress={() => setFeedingType(item)}
                style={styles.segment}
              />
            ))}
          </View>

          <View style={styles.actionRow}>
            <RoundActionButton baby={baby} title="喂养开始" subtitle={startTime || '点击记录'} onPress={handleRecordStart} />
            <View style={styles.durationBox}>
              <Text style={[styles.durationLabel, { color: theme.colors.textMuted }]}>时长</Text>
              <Text style={[styles.durationText, { color: theme.colors.text }]}>{startTime ? feedingDuration : '待记录'}</Text>
            </View>
            <RoundActionButton baby={baby} title="喂养结束" subtitle={endTime || '点击记录'} onPress={handleRecordEnd} />
          </View>

          {feedingType === '奶粉' ? (
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>奶量</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="如 150ml"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
          ) : null}

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>备注</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="如 夜奶、宝宝吃饱"
              placeholderTextColor={theme.colors.placeholder}
              multiline
            />
          </View>

          <View style={styles.imageRow}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>图片</Text>
            <Button baby={baby} label="+ 添加" size="md" onPress={selectImage} style={styles.addImageBtn} />
          </View>
          <ImageStrip
            baby={baby}
            images={images}
            onPressImage={(uri) => setPreviewImage(uri)}
            onRemoveImage={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
          />

          <Button baby={baby} label={isEditing ? '保存修改' : '保存喂养记录'} onPress={submit} />
          {isEditing ? (
            <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
          ) : null}
        </Card>

        <Card baby={baby}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>历史喂养记录</Text>
          {baby.feedingRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>暂无喂养记录</Text>
          ) : (
            baby.feedingRecords.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  Alert.alert('记录操作', '请选择', [
                    { text: '取消', style: 'cancel' },
                    { text: '编辑', onPress: () => handleEdit(item) },
                    { text: '删除', style: 'destructive', onPress: () => confirmDelete(item.id) },
                  ])
                }
                style={[styles.recordItem, { backgroundColor: theme.colors.surfaceMuted }]}
              >
                <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                  {item.type} · {item.createdAt}
                </Text>
                <Text style={[styles.recordText, { color: theme.colors.textMuted }]}>
                  {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : ''}
                  {item.duration ? ` · ${item.duration}` : ''}
                  {item.amount ? ` · ${item.amount}` : ''}
                </Text>
                {item.note ? <Text style={[styles.recordNote, { color: theme.colors.textMuted }]}>备注：{item.note}</Text> : null}
                {item.images?.length ? <ImageStrip baby={baby} images={item.images} onPressImage={setPreviewImage} /> : null}
              </Pressable>
            ))
          )}

          <Modal visible={!!previewImage} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Pressable style={styles.modalClose} onPress={() => setPreviewImage(null)}>
                  <Text style={[styles.modalCloseText, { color: theme.colors.text }]}>关闭</Text>
                </Pressable>
                {previewImage ? <Image source={{ uri: previewImage }} style={styles.modalImage} /> : null}
              </View>
            </View>
          </Modal>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: space.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
  },
  cardSpacing: {
    marginBottom: space.lg,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  durationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  durationLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: space.xs,
  },
  durationText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  fieldBlock: {
    marginBottom: space.lg,
  },
  fieldLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: space.sm,
  },
  fieldInput: {
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
  },
  textArea: {
    minHeight: 80,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  addImageBtn: {
    paddingHorizontal: space.lg,
  },
  cancelBtn: {
    marginTop: space.md,
  },
  recordItem: {
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  recordTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  recordText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: 4,
  },
  recordNote: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  thumbWrap: {
    width: 120,
    height: 90,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: space.md,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: '#fff',
    padding: space.md,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: radius.lg,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: space.sm,
  },
  modalCloseText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

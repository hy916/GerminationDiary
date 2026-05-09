import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Chip from '../ui/components/Chip';
import Button from '../ui/components/Button';
import ImageStrip from '../ui/components/ImageStrip';
import { getTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

export default function DiaperScreen({ baby, onBack, onAddDiaper, onUpdateDiaper, onDeleteDiaper }) {
  const theme = getTheme(baby);
  const [diaperType, setDiaperType] = useState('大便');
  const [startTime, setStartTime] = useState('');
  const [color, setColor] = useState('金黄');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setDiaperType('大便');
    setStartTime('');
    setColor('金黄');
    setNote('');
    setImages([]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setDiaperType(item.type || '大便');
    setStartTime(item.startTime || '');
    setColor(item.color || '金黄');
    setNote(item.note || '');
    setImages(item.images || []);
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteDiaper(id) },
    ]);
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
    Alert.alert('添加图片', '请选择来源', [
      { text: '相册', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const submit = () => {
    if (!startTime) return;
    const payload = { type: diaperType, color, note, images, startTime };
    if (isEditing) {
      onUpdateDiaper(editId, payload);
      Alert.alert('成功', '记录已更新', [{ text: '确定' }]);
    } else {
      onAddDiaper({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '排便' });
      Alert.alert('成功', '记录添加成功', [{ text: '确定' }]);
    }
    resetForm();
  };

  const handleStartTimeFocus = () => {
    setStartTime(formatDateTimeYYYYMMDDHHmm());
  };

  return (
    <Screen baby={baby} title="排便" onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>排便记录</Text>
          <View style={styles.segmentRow}>
            {['大便', '小便'].map((item) => (
              <Chip
                key={item}
                baby={baby}
                label={item}
                selected={diaperType === item}
                onPress={() => setDiaperType(item)}
                style={styles.segment}
              />
            ))}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>记录时间</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={startTime}
              onChangeText={setStartTime}
              onFocus={handleStartTimeFocus}
              placeholder="点击自动填充当前时间"
              placeholderTextColor={theme.colors.placeholder}
              editable={true}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>颜色</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={color}
              onChangeText={setColor}
              placeholder="如 金黄"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>备注</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="如 有少量奶瓣"
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

          <Button baby={baby} label={isEditing ? '保存修改' : '保存排便记录'} onPress={submit} />
          {isEditing ? (
            <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
          ) : null}
        </Card>

        <Card baby={baby}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>排便历史</Text>
          {baby.diaperRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>暂无排便记录</Text>
          ) : (
            baby.diaperRecords.map((item) => (
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
                <Text style={[styles.recordTitle, { color: theme.colors.text }]}>{item.type} · {item.color}</Text>
                <Text style={[styles.recordText, { color: theme.colors.textMuted }]}>{item.startTime || item.createdAt}</Text>
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
  cardSpacing: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
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
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
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

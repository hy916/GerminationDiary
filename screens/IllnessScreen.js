import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import ImageStrip from '../ui/components/ImageStrip';
import { useAppTheme } from '../ui/theme';
import { fontSize, fontWeight, radius, space } from '../ui/tokens';

export default function IllnessScreen({ baby, onBack, onAddIllness, onUpdateIllness, onDeleteIllness }) {
  const theme = useAppTheme(baby);
  const [illnessType, setIllnessType] = useState('感冒');
  const [startTime, setStartTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medication, setMedication] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setIllnessType('感冒');
    setStartTime('');
    setSymptoms('');
    setMedication('');
    setNote('');
    setImages([]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setIllnessType(item.illnessType || '感冒');
    setStartTime(item.startTime || '');
    setSymptoms(item.symptoms || '');
    setMedication(item.medication || '');
    setNote(item.note || '');
    setImages(item.images || []);
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteIllness(id) },
    ]);
  };

  const handleTimeFocus = () => {
    setStartTime(formatDateTimeYYYYMMDDHHmm());
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
    if (!illnessType || !startTime) {
      Alert.alert('请填写症状类型和开始时间');
      return;
    }
    const payload = { illnessType, startTime, symptoms, medication, note, images };
    if (isEditing) {
      onUpdateIllness(editId, payload);
      Alert.alert('成功', '记录已更新', [{ text: '确定' }]);
    } else {
      onAddIllness({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '生病' });
      Alert.alert('成功', '生病记录已添加', [{ text: '确定' }]);
    }
    resetForm();
  };

  return (
    <Screen baby={baby} title="生病" onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>新增生病记录</Text>

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>症状类型</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={illnessType}
                onChangeText={setIllnessType}
                placeholder="如 发烧/咳嗽"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>开始时间</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={startTime}
                onChangeText={setStartTime}
                onFocus={handleTimeFocus}
                placeholder="点击自动填充当前时间"
                placeholderTextColor={theme.colors.placeholder}
                editable={true}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>症状</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder="如 发烧、流鼻涕"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>服药情况</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={medication}
                onChangeText={setMedication}
                placeholder="如 退烧药"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>备注</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="如 宝宝精神状态"
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

          <Button baby={baby} label={isEditing ? '保存修改' : '保存生病记录'} onPress={submit} />
          {isEditing ? (
            <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
          ) : null}
        </Card>

        <Card baby={baby}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>生病历史</Text>
          {baby.illnessRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>暂无生病记录</Text>
          ) : (
            baby.illnessRecords.map((item) => (
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
                  {item.illnessType} · {item.startTime}
                </Text>
                <Text style={[styles.recordText, { color: theme.colors.textMuted }]}>{item.symptoms || '症状未填写'}</Text>
                <Text style={[styles.recordText, { color: theme.colors.textMuted }]}>
                  {item.medication ? `服药：${item.medication}` : '未记录服药'}
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
  cardSpacing: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  formHalf: {
    width: '48%',
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

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

export default function VaccineScreen({ baby, onBack, onAddVaccine, onUpdateVaccine, onDeleteVaccine }) {
  const theme = useAppTheme(baby);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setVaccineName('');
    setVaccinationDate('');
    setLocation('');
    setNote('');
    setImages([]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setVaccineName(item.vaccineName || '');
    setVaccinationDate(item.vaccinationDate || '');
    setLocation(item.location || '');
    setNote(item.note || '');
    setImages(item.images || []);
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteVaccine(id) },
    ]);
  };

  const handleDateFocus = () => {
    setVaccinationDate(formatDateTimeYYYYMMDDHHmm());
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
    if (!vaccineName || !vaccinationDate) {
      Alert.alert('请填写疫苗名称和接种时间');
      return;
    }
    const payload = { vaccineName, vaccinationDate, location, note, images };
    if (isEditing) {
      onUpdateVaccine(editId, payload);
      Alert.alert('成功', '记录已更新', [{ text: '确定' }]);
    } else {
      onAddVaccine({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '疫苗' });
      Alert.alert('成功', '疫苗记录已添加', [{ text: '确定' }]);
    }
    resetForm();
  };

  return (
    <Screen baby={baby} title="疫苗" onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>新增疫苗记录</Text>

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>疫苗名称</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={vaccineName}
                onChangeText={setVaccineName}
                placeholder="如 百白破"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>接种时间</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={vaccinationDate}
                onChangeText={setVaccinationDate}
                onFocus={handleDateFocus}
                placeholder="点击自动填充当前时间"
                placeholderTextColor={theme.colors.placeholder}
                editable={true}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>接种地点</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="如 儿保站"
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
            <View style={styles.formHalf} />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>备注</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="如 宝宝当日表现良好"
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

          <Button baby={baby} label={isEditing ? '保存修改' : '保存疫苗记录'} onPress={submit} />
          {isEditing ? (
            <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
          ) : null}
        </Card>

        <Card baby={baby}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>疫苗历史</Text>
          {baby.vaccineRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>暂无疫苗记录</Text>
          ) : (
            baby.vaccineRecords.map((item) => (
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
                  {item.vaccineName} · {item.vaccinationDate}
                </Text>
                <Text style={[styles.recordText, { color: theme.colors.textMuted }]}>{item.location || '接种地点未填'}</Text>
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';

export default function VaccineScreen({ baby, onAddVaccine, onUpdateVaccine, onDeleteVaccine }) {
  const [vaccineName, setVaccineName] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';

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
    <ScrollView style={styles.page} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>新增疫苗记录</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>疫苗名称</Text>
          <TextInput style={styles.fieldInput} value={vaccineName} onChangeText={setVaccineName} placeholder="如 百白破" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>接种时间</Text>
          <TextInput
            style={styles.fieldInput}
            value={vaccinationDate}
            onChangeText={setVaccinationDate}
            onFocus={handleDateFocus}
            placeholder="点击自动填充当前时间"
            editable={true}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>接种地点</Text>
          <TextInput style={styles.fieldInput} value={location} onChangeText={setLocation} placeholder="如 儿保站" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>备注</Text>
          <View style={styles.noteRow}>
            <TextInput style={[styles.fieldInput, styles.textArea, styles.noteInput]} value={note} onChangeText={setNote} placeholder="如 宝宝当日表现良好" multiline />
            <Pressable style={[styles.imageButton, { backgroundColor: themeColor }]} onPress={selectImage}>
              <Text style={styles.imageButtonText}>📷</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={submit}>
          <Text style={styles.saveText}>{isEditing ? '保存修改' : '保存疫苗记录'}</Text>
        </Pressable>
        {isEditing && (
          <Pressable style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelText}>取消编辑</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>疫苗历史</Text>
        {baby.vaccineRecords.length === 0 ? (
          <Text style={styles.emptyText}>暂无疫苗记录。</Text>
        ) : (
          baby.vaccineRecords.map((item) => (
            <View key={item.id} style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View style={styles.recordContent}>
                  <Text style={styles.recordTitle}>{item.vaccineName} · {item.vaccinationDate}</Text>
                  <Text style={styles.recordText}>{item.location || '接种地点未填'}</Text>
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
    marginTop: 40,
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
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    color: '#6E5D52',
    fontSize: 13,
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
  },
  imageButtonText: {
    fontSize: 20,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9D8F86',
  },
  recordCard: {
    backgroundColor: '#F9F6F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 4,
  },
  recordText: {
    color: '#7A6B62',
    fontSize: 13,
    marginBottom: 4,
  },
  recordNote: {
    color: '#7A6B62',
    fontSize: 13,
  },
  thumbnailContainer: {
    alignItems: 'center',
  },
  recordThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  imageCount: {
    marginTop: 6,
    fontSize: 12,
    color: '#8B7C70',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    alignItems: 'center',
  },
  modalClose: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalCloseText: {
    color: '#4A403A',
    fontSize: 14,
    fontWeight: '600',
  },
  modalImage: {
    width: '100%',
    height: 320,
    resizeMode: 'contain',
    borderRadius: 12,
  },
});

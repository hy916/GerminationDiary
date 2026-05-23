import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import ImageStrip from '../ui/components/ImageStrip';
import RecordTabsLayout from '../ui/components/RecordTabsLayout';
import { useAppTheme } from '../ui/theme';
import { fontSize, fontWeight, radius, space } from '../ui/tokens';

export default function GrowthScreen({ baby, onBack, onAddGrowth, onUpdateGrowth, onDeleteGrowth }) {
  const theme = useAppTheme(baby);

  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [startTime, setStartTime] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [customFields, setCustomFields] = useState([]);

  const isEditing = !!editId;

  const resetForm = () => {
    setEditId(null);
    setWeight('');
    setLength('');
    setStartTime('');
    setHeadCircumference('');
    setNote('');
    setImages([]);
    setCustomFields([]);
  };

  const handleEdit = (item, switchTab) => {
    setEditId(item.id);
    setWeight(item.weight || '');
    setLength(item.length || '');
    setStartTime(item.startTime || '');
    setHeadCircumference(item.headCircumference || '');
    setNote(item.note || '');
    setImages(item.images || []);
    setCustomFields(item.customFields || []);
    switchTab('add');
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteGrowth(id) },
    ]);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限被拒绝', '需要相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('权限被拒绝', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const selectImage = () => {
    Alert.alert('添加图片', '请选择来源', [
      { text: '相册', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const fillNow = () => {
    setStartTime(formatDateTimeYYYYMMDDHHmm());
  };

  const submit = (switchTab) => {
    if (!weight || !length || !startTime) {
      Alert.alert('请完善信息', '请填写记录时间、体重和身长');
      return;
    }

    const payload = { startTime, weight, length, headCircumference, note, images, customFields };

    if (isEditing) {
      onUpdateGrowth(editId, payload);
      Alert.alert('成功', '记录已更新');
    } else {
      onAddGrowth({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '生长' });
      Alert.alert('成功', '生长记录已保存');
    }

    resetForm();
    switchTab('history');
  };

  return (
    <Screen baby={baby} title="生长" onBack={onBack}>
      <RecordTabsLayout
        baby={baby}
        title="生长"
        addTitle={isEditing ? '编辑记录' : '新增记录'}
        historyTitle="历史记录"
        renderAdd={({ switchTab }) => (
          <Card baby={baby}>
            <View style={styles.sectionHeader}>
              {isEditing ? (
                <View style={[styles.editBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={[styles.editBadgeText, { color: theme.colors.textMuted }]}>编辑中</Text>
                </View>
              ) : null}
            </View>

            <Field baby={baby} label="记录时间">
              <Pressable
                onPress={fillNow}
                style={[styles.input, styles.pressInput, { backgroundColor: theme.colors.surfaceMuted }]}
              >
                <Text style={[styles.inputText, { color: startTime ? theme.colors.text : theme.colors.placeholder }]}>
                  {startTime || '点击填充当前时间'}
                </Text>
              </Pressable>
            </Field>

            <View style={styles.doubleRow}>
              <Field baby={baby} label="体重" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="如 6.5kg"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </Field>

              <Field baby={baby} label="身长" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  value={length}
                  onChangeText={setLength}
                  placeholder="如 65cm"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </Field>
            </View>

            <Field baby={baby} label="头围">
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                value={headCircumference}
                onChangeText={setHeadCircumference}
                placeholder="如 40cm"
                placeholderTextColor={theme.colors.placeholder}
              />
            </Field>

            <CustomFieldsSection baby={baby} fields={customFields} onChange={setCustomFields} />

            <Field baby={baby} label="备注">
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                value={note}
                onChangeText={setNote}
                placeholder="如 体重增长良好"
                placeholderTextColor={theme.colors.placeholder}
                multiline
              />
            </Field>

            <View style={styles.imageHeader}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>图片</Text>
                <Text style={[styles.imageHint, { color: theme.colors.textSubtle }]}>可添加体检单或成长照片</Text>
              </View>

              <Button baby={baby} label="+ 添加" size="md" onPress={selectImage} style={styles.addImageBtn} />
            </View>

            <ImageStrip
              baby={baby}
              images={images}
              onPressImage={setPreviewImage}
              onRemoveImage={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
            />

            <Button baby={baby} label={isEditing ? '保存修改' : '保存生长记录'} onPress={() => submit(switchTab)} />

            {isEditing ? (
              <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
            ) : null}
          </Card>
        )}
        renderHistory={({ switchTab }) => (
          <Card baby={baby}>
            {baby.growthRecords.length === 0 ? (
              <EmptyState baby={baby} icon="🌱" title="暂无生长记录" desc="新增生长记录后会显示在这里" />
            ) : (
              baby.growthRecords.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    Alert.alert('记录操作', '请选择', [
                      { text: '取消', style: 'cancel' },
                      { text: '编辑', onPress: () => handleEdit(item, switchTab) },
                      { text: '删除', style: 'destructive', onPress: () => confirmDelete(item.id) },
                    ])
                  }
                  style={({ pressed }) => [
                    styles.recordItem,
                    { backgroundColor: theme.colors.surfaceMuted, opacity: pressed ? 0.76 : 1 },
                  ]}
                >
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordIcon, { backgroundColor: theme.colors.surface }]}>
                      <Text style={styles.recordEmoji}>🌱</Text>
                    </View>

                    <View style={styles.recordMain}>
                      <View style={styles.recordTitleRow}>
                        <Text style={[styles.recordTitle, { color: theme.colors.text }]}>生长记录</Text>
                        <Text style={[styles.recordTime, { color: theme.colors.textSubtle }]}>
                          {formatShortTime(item.createdAt || item.startTime)}
                        </Text>
                      </View>

                      <Text style={[styles.recordText, { color: theme.colors.textMuted }]} numberOfLines={2}>
                        体重：{item.weight || '--'}  身长：{item.length || '--'}  头围：{item.headCircumference || '--'}
                      </Text>
                    </View>
                  </View>

                  {item.customFields?.length ? (
                    <View style={styles.customFieldsWrap}>
                      {item.customFields.map((cf, i) => (
                        <Text key={i} style={[styles.customFieldText, { color: theme.colors.textMuted }]}>
                          {cf.label}：{cf.value}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  {item.note ? (
                    <Text style={[styles.recordNote, { color: theme.colors.textMuted }]} numberOfLines={2}>
                      备注：{item.note}
                    </Text>
                  ) : null}

                  {item.images?.length ? (
                    <View style={styles.imageStripWrap}>
                      <ImageStrip baby={baby} images={item.images} onPressImage={setPreviewImage} />
                    </View>
                  ) : null}
                </Pressable>
              ))
            )}
          </Card>
        )}
      />

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPreviewImage(null)} />
          <Pressable style={styles.modalClose} onPress={() => setPreviewImage(null)}>
            <Text style={styles.modalCloseText}>关闭</Text>
          </Pressable>
          {previewImage ? <Image source={{ uri: previewImage }} style={styles.modalImage} /> : null}
        </View>
      </Modal>
    </Screen>
  );
}

function CustomFieldsSection({ baby, fields, onChange }) {
  const theme = useAppTheme(baby);

  const addField = () => {
    onChange([...fields, { label: '', value: '' }]);
  };

  const updateField = (index, key, val) => {
    const next = fields.map((f, i) => (i === index ? { ...f, [key]: val } : f));
    onChange(next);
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.customSection}>
      <View style={styles.customSectionHeader}>
        <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>自定义字段</Text>
        <Button baby={baby} label="+ 添加" size="sm" variant="secondary" onPress={addField} />
      </View>
      {fields.map((f, i) => (
        <View key={i} style={styles.customRow}>
          <TextInput
            style={[styles.customLabelInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
            value={f.label}
            onChangeText={(v) => updateField(i, 'label', v)}
            placeholder="字段名"
            placeholderTextColor={theme.colors.placeholder}
          />
          <TextInput
            style={[styles.customValueInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
            value={f.value}
            onChangeText={(v) => updateField(i, 'value', v)}
            placeholder="值"
            placeholderTextColor={theme.colors.placeholder}
          />
          <Pressable onPress={() => removeField(i)} hitSlop={8} style={styles.customRemoveBtn}>
            <Text style={[styles.customRemoveText, { color: theme.colors.textSubtle }]}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function Field({ baby, label, children, style }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function EmptyState({ baby, icon, title, desc }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDesc, { color: theme.colors.textSubtle }]}>{desc}</Text>
    </View>
  );
}

function formatShortTime(value) {
  if (!value) return '';
  return value.split(' ')[1] || value;
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },
  editBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  editBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  halfField: {
    flex: 1,
  },
  field: {
    marginBottom: space.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  pressInput: {
    justifyContent: 'center',
  },
  inputText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  textArea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: space.md,
    marginBottom: space.md,
  },
  imageHint: {
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.medium,
  },
  addImageBtn: {
    paddingHorizontal: space.lg,
  },
  cancelBtn: {
    marginTop: space.md,
  },
  emptyState: {
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: space.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyDesc: {
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
  },
  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordEmoji: {
    fontSize: 20,
  },
  recordMain: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
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
  recordText: {
    fontSize: fontSize.md,
    lineHeight: 21,
    fontWeight: fontWeight.medium,
  },
  recordNote: {
    marginTop: space.sm,
    paddingLeft: 54,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  customFieldsWrap: { marginTop: space.sm, paddingLeft: 54 },
  customFieldText: { fontSize: fontSize.sm, lineHeight: 20, fontWeight: fontWeight.medium },
  customSection: { marginBottom: space.lg },
  customSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  customRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm, alignItems: 'center' },
  customLabelInput: { flex: 1, minHeight: 44, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: 10, fontSize: fontSize.md, fontWeight: fontWeight.medium },
  customValueInput: { flex: 2, minHeight: 44, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: 10, fontSize: fontSize.md, fontWeight: fontWeight.medium },
  customRemoveBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  customRemoveText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  imageStripWrap: {
    marginTop: space.md,
    paddingLeft: 54,
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
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Chip from '../ui/components/Chip';
import Button from '../ui/components/Button';
import ImageStrip from '../ui/components/ImageStrip';
import RecordTabsLayout from '../ui/components/RecordTabsLayout';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight, radius } from '../ui/tokens';

export default function FeedingScreen({
  baby,
  onBack,
  onAddFeeding,
  onUpdateFeeding,
  onDeleteFeeding,
  onSetPendingFeedingStart,
}) {
  const theme = useAppTheme(baby);

  const [feedingType, setFeedingType] = useState('母乳');
  const [startTime, setStartTime] = useState(baby.pendingFeedingStart || '');
  const [endTime, setEndTime] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [customFields, setCustomFields] = useState([]);

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
    setCustomFields([]);
  };

  const parseDate = (value) => {
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDuration = (start, end) => {
    const s = parseDate(start);
    const e = parseDate(end);
    if (!s || !e || e <= s) return '';

    const diff = Math.round((e - s) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
  };

  const feedingDuration = startTime ? formatDuration(startTime, endTime || formatDateTimeYYYYMMDDHHmm()) : '';

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
          },
        },
      ]);
      return;
    }

    setStartTime(now);
    setEndTime('');
    onSetPendingFeedingStart?.(now);
  };

  const handleRecordEnd = () => {
    if (!startTime) {
      Alert.alert('请先记录开始时间');
      return;
    }

    setEndTime(formatDateTimeYYYYMMDDHHmm());
  };

  const handleEdit = (item, switchTab) => {
    setEditId(item.id);
    setFeedingType(item.type || '母乳');
    setStartTime(item.startTime || '');
    setEndTime(item.endTime || '');
    setAmount(item.amount || '');
    setNote(item.note || '');
    setImages(item.images || []);
    setCustomFields(item.customFields || []);
    switchTab('add');
  };

  const confirmDelete = (id) => {
    Alert.alert('确认删除', '确认删除当前记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDeleteFeeding(id) },
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

  const submit = (switchTab) => {
    if (!startTime || !endTime) {
      Alert.alert('请先完成开始时间和结束时间');
      return;
    }

    const duration = formatDuration(startTime, endTime);
    const payload = { type: feedingType, startTime, endTime, duration, amount, note, images, customFields };

    if (isEditing) {
      onUpdateFeeding(editId, payload);
      Alert.alert('成功', '记录已更新');
    } else {
      onAddFeeding({ ...payload, createdAt: formatDateTimeYYYYMMDDHHmm(), recordType: '喂养' });
      onSetPendingFeedingStart?.('');
      Alert.alert('成功', '喂养记录已保存');
    }

    resetForm();
    switchTab('history');
  };

  return (
    <Screen baby={baby} title="喂奶" onBack={onBack}>
      <RecordTabsLayout
        baby={baby}
        title="喂奶"
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

            <View style={[styles.segmentBox, { backgroundColor: theme.colors.surfaceMuted }]}>
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

            <View style={[styles.timerCard, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Text style={[styles.timerLabel, { color: theme.colors.textSubtle }]}>喂养时长</Text>
              <Text style={[styles.timerValue, { color: theme.colors.text }]}>
                {startTime ? feedingDuration || '计算中' : '待开始'}
              </Text>

              <View style={styles.timeRow}>
                <TimeMeta baby={baby} label="开始" value={startTime || '--'} />
                <View style={[styles.divider, { backgroundColor: theme.colors.textSubtle }]} />
                <TimeMeta baby={baby} label="结束" value={endTime || '--'} />
              </View>
            </View>

            <View style={styles.actionRow}>
              <ActionCard baby={baby} active label="喂养开始" value={startTime || '点击记录'} icon="▶︎" onPress={handleRecordStart} />
              <ActionCard baby={baby} label="喂养结束" value={endTime || '点击记录'} icon="■" onPress={handleRecordEnd} />
            </View>

            {feedingType === '奶粉' ? (
              <Field baby={baby} label="奶量">
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="如 150ml"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </Field>
            ) : null}

            <CustomFieldsSection baby={baby} fields={customFields} onChange={setCustomFields} />

            <Field baby={baby} label="备注">
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                value={note}
                onChangeText={setNote}
                placeholder="如 夜奶、宝宝吃饱、左侧 15 分钟"
                placeholderTextColor={theme.colors.placeholder}
                multiline
              />
            </Field>

            <View style={styles.imageHeader}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>图片</Text>
                <Text style={[styles.imageHint, { color: theme.colors.textSubtle }]}>可添加喂养照片或备注图片</Text>
              </View>
              <Button baby={baby} label="+ 添加" size="md" onPress={selectImage} style={styles.addImageBtn} />
            </View>

            <ImageStrip
              baby={baby}
              images={images}
              onPressImage={setPreviewImage}
              onRemoveImage={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
            />

            <Button baby={baby} label={isEditing ? '保存修改' : '保存喂养记录'} onPress={() => submit(switchTab)} />

            {isEditing ? (
              <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
            ) : null}
          </Card>
        )}
        renderHistory={({ switchTab }) => (
          <Card baby={baby}>
            {baby.feedingRecords.length === 0 ? (
              <EmptyState baby={baby} icon="🍼" title="暂无喂养记录" desc="新增喂养记录后会显示在这里" />
            ) : (
              baby.feedingRecords.map((item) => (
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
                      <Text style={styles.recordEmoji}>{item.type === '奶粉' ? '🍼' : '🤱'}</Text>
                    </View>

                    <View style={styles.recordMain}>
                      <View style={styles.recordTitleRow}>
                        <Text style={[styles.recordTitle, { color: theme.colors.text }]}>{item.type}</Text>
                        <Text style={[styles.recordTime, { color: theme.colors.textSubtle }]}>
                          {formatShortTime(item.createdAt)}
                        </Text>
                      </View>

                      <Text style={[styles.recordText, { color: theme.colors.textMuted }]} numberOfLines={2}>
                        {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : ''}
                        {item.duration ? ` · ${item.duration}` : ''}
                        {item.amount ? ` · ${item.amount}` : ''}
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

function Field({ baby, label, children }) {
  const theme = useAppTheme(baby);

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function TimeMeta({ baby, label, value }) {
  const theme = useAppTheme(baby);

  return (
    <View style={styles.timeMeta}>
      <Text style={[styles.timeLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.timeValue, { color: theme.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionCard({ baby, active, icon, label, value, onPress }) {
  const theme = useAppTheme(baby);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: active ? theme.colors.accent : theme.colors.surfaceMuted,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text style={[styles.actionIcon, { color: active ? '#fff' : theme.colors.text }]}>{icon}</Text>
      <Text style={[styles.actionTitle, { color: active ? '#fff' : theme.colors.text }]}>{label}</Text>
      <Text style={[styles.actionValue, { color: active ? 'rgba(255,255,255,0.85)' : theme.colors.textSubtle }]}>
        {value}
      </Text>
    </Pressable>
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
  segmentBox: {
    flexDirection: 'row',
    gap: space.sm,
    borderRadius: radius.lg,
    padding: 5,
    marginBottom: space.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
  },
  timerCard: {
    borderRadius: radius.xl,
    padding: space.lg,
    alignItems: 'center',
    marginBottom: space.lg,
  },
  timerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
  },
  timerValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
  },
  timeRow: {
    marginTop: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timeMeta: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: 5,
  },
  timeValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  divider: {
    width: 1,
    height: 28,
    opacity: 0.18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.lg,
  },
  actionCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: radius.xl,
    padding: space.md,
    justifyContent: 'space-between',
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
  },
  actionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  actionValue: {
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.medium,
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
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { calculateFetalWeight, classifyFetalWeight } from '../utils/fetalCalculator';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import CalendarModal from '../ui/components/CalendarModal';
import ImageStrip from '../ui/components/ImageStrip';
import RecordTabsLayout from '../ui/components/RecordTabsLayout';
import { useAppTheme } from '../ui/theme';
import { fontSize, fontWeight, radius, space } from '../ui/tokens';

export default function FetalScreen({ baby, onBack, onAddFetal, onUpdateFetal, onDeleteFetal }) {
  const theme = useAppTheme(baby);

  const [records, setRecords] = useState(baby.fetalRecords || []);
  const [editingId, setEditingId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calculatedWeight, setCalculatedWeight] = useState(null);

  const [formData, setFormData] = useState({
    date: getInitialDate(),
    gestationalWeek: '',
    bpd: '',
    hc: '',
    ac: '',
    fl: '',
    fhr: '',
    bloodPressure: '',
    weight: '',
    fetalHeartMonitoring: '',
    notes: '',
    images: [],
    customFields: [],
  });

  useEffect(() => {
    setRecords(baby.fetalRecords || []);
  }, [baby.fetalRecords]);

  const isEditing = !!editingId;

  const resetForm = () => {
    setEditingId(null);
    setCalculatedWeight(null);
    setFormData({
      date: getInitialDate(),
      gestationalWeek: '',
      bpd: '',
      hc: '',
      ac: '',
      fl: '',
      fhr: '',
      bloodPressure: '',
      weight: '',
      fetalHeartMonitoring: '',
      notes: '',
      images: [],
      customFields: [],
    });
  };

  const handleEdit = (record, switchTab) => {
    setFormData({
      date: record.date || getInitialDate(),
      gestationalWeek: record.gestationalWeek || '',
      bpd: record.bpd || '',
      hc: record.hc || '',
      ac: record.ac || '',
      fl: record.fl || '',
      fhr: record.fhr || '',
      bloodPressure: record.bloodPressure || '',
      weight: record.weight || '',
      fetalHeartMonitoring: record.fetalHeartMonitoring || '',
      notes: record.notes || '',
      images: record.images || [],
      customFields: record.customFields || [],
    });

    setEditingId(record.id);

    if (record.estimatedWeight) {
      setCalculatedWeight({
        weight: record.estimatedWeight,
        formula: record.weightFormula,
        classification: record.weightClassification,
        reference: record.reference,
      });
    } else {
      setCalculatedWeight(null);
    }

    switchTab('add');
  };

  const handleDeleteConfirm = (id) => {
    Alert.alert('删除记录', '确定要删除这条孕检记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          onDeleteFetal(id);
          setRecords((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  const handleCalculateWeight = () => {
    const params = {
      bpd: formData.bpd ? parseFloat(formData.bpd) : null,
      hc: formData.hc ? parseFloat(formData.hc) : null,
      ac: formData.ac ? parseFloat(formData.ac) : null,
      fl: formData.fl ? parseFloat(formData.fl) : null,
    };

    const result = calculateFetalWeight(params);

    if (result.error) {
      Alert.alert('计算提示', result.error);
      return null;
    }

    const gestationalWeek = parseInt(formData.gestationalWeek, 10);
    const classification = classifyFetalWeight(result.weight, gestationalWeek);
    const finalResult = { ...result, ...classification };

    setCalculatedWeight(finalResult);
    return finalResult;
  };

  const handleSaveRecord = (switchTab) => {
    if (!formData.gestationalWeek || !formData.hc || !formData.ac || !formData.fl) {
      Alert.alert('请完善信息', '请填写孕周、头围、腹围和股骨径');
      return;
    }

    const weightResult = calculatedWeight || handleCalculateWeight();
    if (!weightResult) return;

    const newRecord = {
      ...formData,
      id: editingId || `fetal-${Date.now()}`,
      estimatedWeight: weightResult.weight,
      weightFormula: weightResult.formula,
      weightClassification: weightResult.classification,
      reference: weightResult.reference,
    };

    if (editingId) {
      onUpdateFetal(editingId, newRecord);
      Alert.alert('成功', '孕检记录已更新');
    } else {
      onAddFetal(newRecord);
      Alert.alert('成功', '孕检记录已保存');
    }

    resetForm();
    switchTab('history');
  };

  const handleShowDetail = (record) => {
    setSelectedRecord(record);
    setShowDetail(true);
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
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), result.assets[0].uri],
      }));
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
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), result.assets[0].uri],
      }));
    }
  };

  const handleSelectImage = () => {
    Alert.alert('添加图片', '请选择来源', [
      { text: '相册', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Screen baby={baby} title="孕检记录" onBack={onBack}>
      <RecordTabsLayout
        baby={baby}
        title="孕检记录"
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

            <View style={styles.doubleRow}>
              <Field baby={baby} label="日期" style={styles.halfField}>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, styles.pressInput, { backgroundColor: theme.colors.surfaceMuted }]}
                >
                  <Text style={[styles.inputText, { color: theme.colors.text }]}>{formData.date}</Text>
                </Pressable>
              </Field>

              <Field baby={baby} label="孕周" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="如 28"
                  keyboardType="number-pad"
                  value={formData.gestationalWeek}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, gestationalWeek: text })}
                />
              </Field>
            </View>

            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>超声测量数据</Text>

            <View style={styles.doubleRow}>
              <Field baby={baby} label="双顶径 BPD / mm" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="选填"
                  keyboardType="decimal-pad"
                  value={formData.bpd}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, bpd: text })}
                />
              </Field>

              <Field baby={baby} label="头围 HC / mm" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="必填"
                  keyboardType="decimal-pad"
                  value={formData.hc}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, hc: text })}
                />
              </Field>
            </View>

            <View style={styles.doubleRow}>
              <Field baby={baby} label="腹围 AC / mm" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="必填"
                  keyboardType="decimal-pad"
                  value={formData.ac}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, ac: text })}
                />
              </Field>

              <Field baby={baby} label="股骨径 FL / mm" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="必填"
                  keyboardType="decimal-pad"
                  value={formData.fl}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, fl: text })}
                />
              </Field>
            </View>

            <Field baby={baby} label="胎心率 FHR / bpm">
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                placeholder="如 145"
                keyboardType="number-pad"
                value={formData.fhr}
                placeholderTextColor={theme.colors.placeholder}
                onChangeText={(text) => setFormData({ ...formData, fhr: text })}
              />
            </Field>

            <View style={styles.doubleRow}>
              <Field baby={baby} label="血压 / mmHg" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="如 120/80"
                  value={formData.bloodPressure}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, bloodPressure: text })}
                />
              </Field>

              <Field baby={baby} label="体重 / kg" style={styles.halfField}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                  placeholder="如 65"
                  keyboardType="decimal-pad"
                  value={formData.weight}
                  placeholderTextColor={theme.colors.placeholder}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                />
              </Field>
            </View>

            <Field baby={baby} label="胎心监护 NST">
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                placeholder="如 反应型、无反应型"
                value={formData.fetalHeartMonitoring}
                placeholderTextColor={theme.colors.placeholder}
                onChangeText={(text) => setFormData({ ...formData, fetalHeartMonitoring: text })}
              />
            </Field>

            <CustomFieldsSection baby={baby} fields={formData.customFields} onChange={(fields) => setFormData({ ...formData, customFields: fields })} />

            <Field baby={baby} label="备注">
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
                placeholder="医生建议、其他注意事项等"
                multiline
                value={formData.notes}
                placeholderTextColor={theme.colors.placeholder}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
              />
            </Field>

            <View style={styles.imageHeader}>
              <View>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>图片</Text>
                <Text style={[styles.imageHint, { color: theme.colors.textSubtle }]}>可添加 B 超单或检查报告</Text>
              </View>

              <Button baby={baby} label="+ 添加" size="md" onPress={handleSelectImage} style={styles.addImageBtn} />
            </View>

            <ImageStrip
              baby={baby}
              images={formData.images}
              onPressImage={setPreviewImage}
              onRemoveImage={removeImage}
            />

            {calculatedWeight ? (
              <View style={[styles.resultBox, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[styles.resultTitle, { color: theme.colors.text }]}>估算结果</Text>
                <Text style={[styles.weightValue, { color: theme.colors.accent }]}>{calculatedWeight.weight}g</Text>
                <Text style={[styles.resultText, { color: theme.colors.textMuted }]}>
                  {calculatedWeight.formula}公式 · {calculatedWeight.classification}
                </Text>

                {calculatedWeight.reference ? (
                  <View style={styles.referenceGrid}>
                    <ReferenceItem baby={baby} label="P10" value={`${calculatedWeight.reference.p10}g`} />
                    <ReferenceItem baby={baby} label="P50" value={`${calculatedWeight.reference.p50}g`} />
                    <ReferenceItem baby={baby} label="P90" value={`${calculatedWeight.reference.p90}g`} />
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <Button baby={baby} label="计算体重" variant="secondary" onPress={handleCalculateWeight} style={styles.flexButton} />
              <Button baby={baby} label={isEditing ? '保存修改' : '保存记录'} onPress={() => handleSaveRecord(switchTab)} style={styles.flexButton} />
            </View>

            {isEditing ? (
              <Button baby={baby} label="取消编辑" variant="secondary" onPress={resetForm} style={styles.cancelBtn} />
            ) : null}
          </Card>
        )}
        renderHistory={({ switchTab }) => (
          <Card baby={baby}>
            {records.length === 0 ? (
              <EmptyState baby={baby} icon="🤰" title="暂无孕检记录" desc="新增孕检记录后会显示在这里" />
            ) : (
              records.map((record) => (
                <Pressable
                  key={record.id}
                  onPress={() => handleShowDetail(record)}
                  style={({ pressed }) => [
                    styles.recordItem,
                    { backgroundColor: theme.colors.surfaceMuted, opacity: pressed ? 0.76 : 1 },
                  ]}
                >
                  <View style={styles.recordHeader}>
                    <View style={[styles.recordIcon, { backgroundColor: theme.colors.surface }]}>
                      <Text style={styles.recordEmoji}>🤰</Text>
                    </View>

                    <View style={styles.recordMain}>
                      <View style={styles.recordTitleRow}>
                        <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                          孕周 {record.gestationalWeek} 周
                        </Text>
                        <Text style={[styles.recordTime, { color: theme.colors.textSubtle }]}>{record.date}</Text>
                      </View>

                      <Text style={[styles.recordText, { color: theme.colors.textMuted }]} numberOfLines={2}>
                        HC：{record.hc || '--'}mm  AC：{record.ac || '--'}mm  FL：{record.fl || '--'}mm
                      </Text>

                      {record.bloodPressure || record.weight || record.fetalHeartMonitoring ? (
                        <Text style={[styles.recordSubText, { color: theme.colors.textMuted }]}>
                          {record.bloodPressure ? `血压：${record.bloodPressure}  ` : ''}
                          {record.weight ? `体重：${record.weight}kg  ` : ''}
                          {record.fetalHeartMonitoring ? `NST：${record.fetalHeartMonitoring}` : ''}
                        </Text>
                      ) : null}

                      {record.estimatedWeight ? (
                        <Text style={[styles.recordWeight, { color: theme.colors.accent }]}>
                          估重：{record.estimatedWeight}g · {record.weightClassification || '--'}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {record.customFields?.length ? (
                    <View style={styles.customFieldsWrap}>
                      {record.customFields.map((cf, i) => (
                        <Text key={i} style={[styles.customFieldText, { color: theme.colors.textMuted }]}>
                          {cf.label}：{cf.value}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  {record.notes ? (
                    <Text style={[styles.recordNote, { color: theme.colors.textMuted }]} numberOfLines={2}>
                      备注：{record.notes}
                    </Text>
                  ) : null}

                  {record.images?.length ? (
                    <View style={styles.imageStripWrap}>
                      <ImageStrip baby={baby} images={record.images} onPressImage={setPreviewImage} />
                    </View>
                  ) : null}

                  <View style={styles.recordActions}>
                    <Button baby={baby} label="详情" variant="secondary" size="sm" onPress={() => handleShowDetail(record)} />
                    <Button baby={baby} label="编辑" variant="secondary" size="sm" onPress={() => handleEdit(record, switchTab)} />
                    <Button baby={baby} label="删除" variant="danger" size="sm" onPress={() => handleDeleteConfirm(record.id)} />
                  </View>
                </Pressable>
              ))
            )}
          </Card>
        )}
      />

      <CalendarModal
        baby={baby}
        visible={showDatePicker}
        value={formData.date}
        onClose={() => setShowDatePicker(false)}
        onSelect={(dateStr) => {
          setFormData((prev) => ({ ...prev, date: dateStr }));
          setShowDatePicker(false);
        }}
      />

      <Modal visible={showDetail} animationType="slide" transparent onRequestClose={() => setShowDetail(false)}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                孕周 {selectedRecord?.gestationalWeek || '--'} 详情
              </Text>
              <Pressable onPress={() => setShowDetail(false)} hitSlop={10}>
                <Text style={[styles.sheetClose, { color: theme.colors.textMuted }]}>关闭</Text>
              </Pressable>
            </View>

            {selectedRecord ? (
              <View>
                <View style={[styles.detailCard, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <DetailRow baby={baby} label="双顶径 BPD" value={selectedRecord.bpd ? `${selectedRecord.bpd}mm` : '未测'} />
                  <DetailRow baby={baby} label="头围 HC" value={`${selectedRecord.hc || '--'}mm`} />
                  <DetailRow baby={baby} label="腹围 AC" value={`${selectedRecord.ac || '--'}mm`} />
                  <DetailRow baby={baby} label="股骨径 FL" value={`${selectedRecord.fl || '--'}mm`} />
                  <DetailRow baby={baby} label="胎心率 FHR" value={selectedRecord.fhr ? `${selectedRecord.fhr} bpm` : '未填'} />
                  <DetailRow baby={baby} label="血压" value={selectedRecord.bloodPressure ? `${selectedRecord.bloodPressure} mmHg` : '未填'} />
                  <DetailRow baby={baby} label="体重" value={selectedRecord.weight ? `${selectedRecord.weight}kg` : '未填'} />
                  <DetailRow baby={baby} label="胎心监护 NST" value={selectedRecord.fetalHeartMonitoring || '未填'} />
                </View>

                {selectedRecord.estimatedWeight ? (
                  <View style={[styles.detailCard, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>体重估算</Text>
                    <Text style={[styles.weightValue, { color: theme.colors.accent }]}>
                      {selectedRecord.estimatedWeight}g
                    </Text>
                    <Text style={[styles.resultText, { color: theme.colors.textMuted }]}>
                      {selectedRecord.weightFormula}公式 · {selectedRecord.weightClassification}
                    </Text>
                  </View>
                ) : null}

                {selectedRecord.notes ? (
                  <View style={[styles.detailCard, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[styles.resultTitle, { color: theme.colors.text }]}>备注</Text>
                    <Text style={[styles.resultText, { color: theme.colors.textMuted }]}>{selectedRecord.notes}</Text>
                  </View>
                ) : null}

                <Text style={[styles.infoText, { color: theme.colors.textSubtle }]}>
                  胎儿体重为估算值，仅供记录参考，具体判断请以医生建议为准。
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

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

function Field({ baby, label, children, style }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function ReferenceItem({ baby, label, value }) {
  const theme = useAppTheme(baby);

  return (
    <View style={[styles.referenceItem, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.referenceLabel, { color: theme.colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.referenceValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

function DetailRow({ baby, label, value }) {
  const theme = useAppTheme(baby);

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
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

function getInitialDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  groupTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
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
  resultBox: {
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.lg,
  },
  resultTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  weightValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
  },
  resultText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  referenceGrid: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  referenceItem: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: fontSize.xs || 12,
    fontWeight: fontWeight.bold,
    marginBottom: 3,
  },
  referenceValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  flexButton: {
    flex: 1,
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
  recordSubText: {
    marginTop: 3,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  recordWeight: {
    marginTop: 5,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
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
  recordActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
    paddingLeft: 54,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    maxHeight: '86%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.16)',
    marginBottom: space.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  sheetClose: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  detailCard: {
    borderRadius: radius.xl,
    padding: space.lg,
    marginBottom: space.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  infoText: {
    marginTop: space.sm,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
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
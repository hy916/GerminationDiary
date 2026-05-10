import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert, Modal, FlatList, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { calculateFetalWeight, classifyFetalWeight, getFetalWeightReference } from '../utils/fetalCalculator';
import Screen from '../ui/components/Screen';
import Button from '../ui/components/Button';
import CalendarModal from '../ui/components/CalendarModal';
import { useAppTheme } from '../ui/theme';
import { colors, fontSize, fontWeight, radius, shadow, space } from '../ui/tokens';

export default function FetalScreen({ baby, onBack, onAddFetal, onUpdateFetal, onDeleteFetal }) {
  const theme = useAppTheme(baby);
  const themeColor = theme.colors.accent;
  const [records, setRecords] = useState(baby.fetalRecords || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getInitialDate = () => formatLocalDate(new Date());

  const [formData, setFormData] = useState({
    date: getInitialDate(),
    gestationalWeek: '',
    bpd: '', // 双顶径
    hc: '', // 头围
    ac: '', // 腹围
    fl: '', // 股骨径
    fhr: '', // 胎心率
    notes: '',
    images: [],
  });

  const [calculatedWeight, setCalculatedWeight] = useState(null);

  useEffect(() => {
    setRecords(baby.fetalRecords || []);
  }, [baby.fetalRecords]);

  const resetForm = () => {
    setFormData({
      date: getInitialDate(),
      gestationalWeek: '',
      bpd: '',
      hc: '',
      ac: '',
      fl: '',
      fhr: '',
      notes: '',
      images: [],
    });
    setEditingId(null);
    setCalculatedWeight(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (record) => {
    setFormData(record);
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDeleteConfirm = (id) => {
    Alert.alert('删除记录', '确定要删除这条胎儿记录吗？', [
      { text: '取消', onPress: () => {}, style: 'cancel' },
      {
        text: '删除',
        onPress: () => {
          onDeleteFetal(id);
          setRecords((prev) => prev.filter((r) => r.id !== id));
        },
        style: 'destructive',
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
      return;
    }

    const gestationalWeek = parseInt(formData.gestationalWeek);
    const classification = classifyFetalWeight(result.weight, gestationalWeek);

    setCalculatedWeight({
      ...result,
      ...classification,
    });
  };

  const handleSaveRecord = () => {
    if (!formData.gestationalWeek || !formData.hc || !formData.ac || !formData.fl) {
      Alert.alert('提示', '请填写孕周、头围、腹围和股骨径（至少这4项）');
      return;
    }

    // 重新计算一次以保存
    if (!calculatedWeight) {
      handleCalculateWeight();
      return;
    }

    const newRecord = {
      ...formData,
      id: editingId || `fetal-${Date.now()}`,
      estimatedWeight: calculatedWeight.weight,
      weightFormula: calculatedWeight.formula,
      weightClassification: calculatedWeight.classification,
    };

    if (editingId) {
      onUpdateFetal(editingId, newRecord);
    } else {
      onAddFetal(newRecord);
    }

    setShowForm(false);
    resetForm();
  };

  const handleShowCalculator = (record) => {
    setSelectedRecord(record);
    setShowCalculator(true);
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
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), uri],
      }));
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
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), uri],
      }));
    }
  };

  const handleSelectImage = () => {
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

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Screen
      baby={baby}
      title="孕胎记录"
      onBack={onBack}
      right={(
        <Button baby={baby} label="+ 新建" size="md" onPress={handleAddNew} />
      )}
      padded={false}
    >
      <ScrollView contentContainerStyle={styles.container}>

      {/* 记录列表 */}
      {records.length > 0 ? (
        <View style={styles.recordsList}>
          {records.map((record) => (
            <View
              key={record.id}
              style={[
                styles.recordCard,
                { borderLeftColor: themeColor, backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.recordHeader}>
                <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                  孕周 {record.gestationalWeek} 周 · {record.date}
                </Text>
              </View>

              <View style={styles.recordContent}>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: theme.colors.textMuted }]}>双顶径 (BPD):</Text>
                  <Text style={[styles.value, { color: theme.colors.text }]}>{record.bpd}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: theme.colors.textMuted }]}>头围 (HC):</Text>
                  <Text style={[styles.value, { color: theme.colors.text }]}>{record.hc}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: theme.colors.textMuted }]}>腹围 (AC):</Text>
                  <Text style={[styles.value, { color: theme.colors.text }]}>{record.ac}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, { color: theme.colors.textMuted }]}>股骨径 (FL):</Text>
                  <Text style={[styles.value, { color: theme.colors.text }]}>{record.fl}mm</Text>
                </View>
                {record.fhr && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.label, { color: theme.colors.textMuted }]}>胎心率:</Text>
                    <Text style={[styles.value, { color: theme.colors.text }]}>{record.fhr} bpm</Text>
                  </View>
                )}

                {record.estimatedWeight && (
                  <View style={[styles.infoRow, styles.weightRow, { borderTopColor: colors.border }]}>
                    <View>
                      <Text style={[styles.label, { color: theme.colors.textMuted }]}>估计体重:</Text>
                      <Text style={[styles.weightValue, { color: themeColor }]}>{record.estimatedWeight}g</Text>
                      <Text style={[styles.weightFormula, { color: theme.colors.textSubtle }]}>
                        ({record.weightFormula}公式)
                      </Text>
                    </View>
                    <View style={[styles.classificationBadge, { backgroundColor: theme.colors.surfaceSoft }]}>
                      <Text style={[styles.classificationText, { color: theme.colors.textMuted }]}>
                        {record.weightClassification}
                      </Text>
                    </View>
                  </View>
                )}

                {record.images && record.images.length > 0 && (
                  <View style={styles.recordImagesContainer}>
                    {record.images.map((imageUri, index) => (
                      <Pressable key={index} onPress={() => setPreviewImage(imageUri)}>
                        <Image source={{ uri: imageUri }} style={styles.recordImageThumbnail} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {record.notes && (
                  <View style={styles.notesRow}>
                    <Text style={[styles.label, { color: theme.colors.textMuted }]}>备注:</Text>
                    <Text style={[styles.notes, { color: theme.colors.textMuted }]}>{record.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.recordActions}>
                <Button baby={baby} label="📊 查看详情" variant="secondary" size="sm" onPress={() => handleShowCalculator(record)} />
                <Button baby={baby} label="✏️ 编辑" variant="secondary" size="sm" onPress={() => handleEdit(record)} />
                <Button baby={baby} label="🗑️ 删除" variant="danger" size="sm" onPress={() => handleDeleteConfirm(record.id)} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暂无胎儿记录</Text>
          <Text style={styles.emptySubText}>点击"新建记录"添加孕期胎儿超声数据</Text>
        </View>
      )}

      {/* 新增/编辑表单 */}
      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{editingId ? '编辑胎儿记录' : '新增胎儿记录'}</Text>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>
                    日期 <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <Pressable style={styles.formInput} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{formData.date}</Text>
                  </Pressable>
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>孕周</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="请输入孕周数"
                    keyboardType="number-pad"
                    value={formData.gestationalWeek}
                    onChangeText={(text) => setFormData({ ...formData, gestationalWeek: text })}
                  />
                </View>
              </View>

              <View style={styles.separator} />

              <Text style={styles.sectionTitle}>超声测量数据 (毫米)</Text>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>双顶径 (BPD)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="双顶径 (mm)"
                    keyboardType="decimal-pad"
                    value={formData.bpd}
                    onChangeText={(text) => setFormData({ ...formData, bpd: text })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>
                    头围 (HC) <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="头围 (mm)"
                    keyboardType="decimal-pad"
                    value={formData.hc}
                    onChangeText={(text) => setFormData({ ...formData, hc: text })}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>
                    腹围 (AC) <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="腹围 (mm)"
                    keyboardType="decimal-pad"
                    value={formData.ac}
                    onChangeText={(text) => setFormData({ ...formData, ac: text })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>
                    股骨径 (FL) <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="股骨径 (mm)"
                    keyboardType="decimal-pad"
                    value={formData.fl}
                    onChangeText={(text) => setFormData({ ...formData, fl: text })}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>胎心率 (FHR)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="胎心率 (bpm)"
                    keyboardType="number-pad"
                    value={formData.fhr}
                    onChangeText={(text) => setFormData({ ...formData, fhr: text })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>拍照</Text>
                  <View style={styles.photoRowInline}>
                    <Pressable
                      style={[styles.photoInputButton, { backgroundColor: themeColor }]}
                      onPress={handleSelectImage}
                    >
                      <Text style={styles.photoButtonText}>📷</Text>
                    </Pressable>
                    {formData.images && formData.images.length > 0 && (
                      <View style={styles.imagesContainerHorizontal}>
                        {formData.images.map((imageUri, index) => (
                          <View key={index} style={styles.imageThumbnailWrapper}>
                            <Pressable onPress={() => setPreviewImage(imageUri)}>
                              <Image source={{ uri: imageUri }} style={styles.imageThumbnailSmall} />
                            </Pressable>
                            <Pressable
                              style={styles.deleteImageButton}
                              onPress={() => removeImage(index)}
                            >
                              <Text style={styles.deleteImageButtonText}>✕</Text>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>备注</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="医生建议、其他注意事项等"
                  multiline={true}
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </View>

              {/* 计算结果显示 */}
              {calculatedWeight && (
                <View style={[styles.calculationResultBox, { borderLeftColor: themeColor }]}>
                  <Text style={styles.calculationTitle}>🎯 胎儿体重估算结果</Text>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>估计体重:</Text>
                    <Text style={styles.resultValue}>{calculatedWeight.weight} 克</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>计算公式:</Text>
                    <Text style={styles.resultValue}>{calculatedWeight.formula}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>精度范围:</Text>
                    <Text style={styles.resultValue}>{calculatedWeight.accuracy}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>发育水平:</Text>
                    <Text style={[styles.resultValue, styles.classificationHighlight]}>
                      {calculatedWeight.classification}
                    </Text>
                  </View>

                  {calculatedWeight.reference && (
                    <View style={styles.referenceBox}>
                      <Text style={styles.referenceTitle}>孕周 {formData.gestationalWeek} 周参考范围：</Text>
                      <View style={styles.referenceRow}>
                        <Text style={styles.referenceLabel}>P10:</Text>
                        <Text style={styles.referenceValue}>
                          {calculatedWeight.reference.p10}g
                        </Text>
                      </View>
                      <View style={styles.referenceRow}>
                        <Text style={styles.referenceLabel}>P50(中位数):</Text>
                        <Text style={styles.referenceValue}>
                          {calculatedWeight.reference.p50}g
                        </Text>
                      </View>
                      <View style={styles.referenceRow}>
                        <Text style={styles.referenceLabel}>P90:</Text>
                        <Text style={styles.referenceValue}>
                          {calculatedWeight.reference.p90}g
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.formButtonsRow}>
                <Pressable
                  style={[styles.formButtonThird, styles.calculateBtn, { backgroundColor: themeColor }]}
                  onPress={handleCalculateWeight}
                >
                  <Text style={styles.formButtonText}>🧮 计算</Text>
                </Pressable>
                <Pressable
                  style={[styles.formButtonThird,  { backgroundColor: themeColor }]}
                  onPress={handleSaveRecord}
                >
                  <Text style={styles.formButtonText}>💾 保存</Text>
                </Pressable>
    
              </View>
                 <Pressable
                  style={[styles.formButtonThird, styles.cancelBtn, { backgroundColor: theme.colors.surfaceSoft }]}
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.formButtonText, { color: theme.colors.text }]}>❌ 取消</Text>
                </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

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

      {/* 详情查看Modal */}
      <Modal visible={showCalculator} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>胎儿发育详情 - 孕周 {selectedRecord?.gestationalWeek}</Text>
              </View>

              {selectedRecord && (
                <>
                  <View style={styles.detailBox}>
                    <Text style={styles.sectionTitle}>测量数据</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>双顶径 (BPD):</Text>
                      <Text style={styles.detailValue}>
                        {selectedRecord.bpd ? `${selectedRecord.bpd}mm` : '未测'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>头围 (HC):</Text>
                      <Text style={styles.detailValue}>{selectedRecord.hc}mm</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>腹围 (AC):</Text>
                      <Text style={styles.detailValue}>{selectedRecord.ac}mm</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>股骨径 (FL):</Text>
                      <Text style={styles.detailValue}>{selectedRecord.fl}mm</Text>
                    </View>
                    {selectedRecord.fhr && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>胎心率 (FHR):</Text>
                        <Text style={styles.detailValue}>{selectedRecord.fhr} bpm</Text>
                      </View>
                    )}
                  </View>

                  {selectedRecord.estimatedWeight && (
                    <View style={styles.detailBox}>
                      <Text style={styles.sectionTitle}>体重估算</Text>
                      <View style={styles.weightDetailBox}>
                        <Text style={styles.weightDetailValue}>
                          {selectedRecord.estimatedWeight}g
                        </Text>
                        <Text style={styles.weightDetailLabel}>
                          使用{selectedRecord.weightFormula}公式计算
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>发育水平:</Text>
                        <Text style={[styles.detailValue, styles.classificationHighlight]}>
                          {selectedRecord.weightClassification}
                        </Text>
                      </View>

                      {selectedRecord.reference && (
                        <View style={styles.referenceDetailBox}>
                          <Text style={styles.referenceDetailTitle}>
                            孕周 {selectedRecord.gestationalWeek} 周参考范围:
                          </Text>
                          <View style={styles.referenceDetailRow}>
                            <Text style={styles.referenceDetailLabel}>P10 (10%):</Text>
                            <Text style={styles.referenceDetailValue}>
                              {selectedRecord.reference.p10}g
                            </Text>
                          </View>
                          <View style={styles.referenceDetailRow}>
                            <Text style={styles.referenceDetailLabel}>P50 (50% 中位数):</Text>
                            <Text style={styles.referenceDetailValue}>
                              {selectedRecord.reference.p50}g
                            </Text>
                          </View>
                          <View style={styles.referenceDetailRow}>
                            <Text style={styles.referenceDetailLabel}>P90 (90%):</Text>
                            <Text style={styles.referenceDetailValue}>
                              {selectedRecord.reference.p90}g
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {selectedRecord.notes && (
                    <View style={styles.detailBox}>
                      <Text style={styles.sectionTitle}>备注</Text>
                      <Text style={styles.detailNotes}>{selectedRecord.notes}</Text>
                    </View>
                  )}

                  {selectedRecord.images && selectedRecord.images.length > 0 && (
                    <View style={styles.detailBox}>
                      <Text style={styles.sectionTitle}>图片</Text>
                      <View style={styles.detailImagesContainer}>
                        {selectedRecord.images.map((imageUri, index) => (
                          <Pressable key={index} onPress={() => setPreviewImage(imageUri)}>
                            <Image source={{ uri: imageUri }} style={styles.detailImageThumbnail} />
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>⚠️ 重要提示</Text>
                    <Text style={styles.infoText}>
                      • 胎儿体重是根据Hadlock权威公式估算，误差范围为±10-15%
                      {'\n\n'}
                      • 该数据仅供参考，不能作为医学诊断依据
                      {'\n\n'}
                      • 不同个体胎儿体重存在差异，应定期复查并咨询医生
                      {'\n\n'}
                      • 胎心率正常范围：120-160 bpm
                    </Text>
                  </View>

                  <Pressable
                    style={[styles.formButton, styles.closeBtn, { backgroundColor: themeColor }]}
                    onPress={() => setShowCalculator(false)}
                  >
                    <Text style={styles.formButtonText}>关闭</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 图片预览Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <View style={styles.previewModalContent}>
            <Pressable style={styles.modalClose} onPress={() => setPreviewImage(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
            {previewImage && <Image source={{ uri: previewImage }} style={styles.modalImage} />}
          </View>
        </View>
      </Modal>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.lg,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.textMuted,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  recordsList: {
    paddingHorizontal: 0,
    paddingTop: space.md,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: space.lg,
    padding: space.lg,
    borderLeftWidth: 4,
    ...shadow.card,
  },
  recordHeader: {
    marginBottom: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recordTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  recordContent: {
    marginBottom: space.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  weightRow: {
    flexDirection: 'column',
    borderTopWidth: 2,
    borderTopColor: colors.border,
    marginTop: space.sm,
    paddingTop: space.md,
    borderBottomWidth: 0,
  },
  weightValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: 4,
  },
  weightFormula: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    fontStyle: 'italic',
  },
  classificationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    marginTop: space.sm,
  },
  classificationText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  notesRow: {
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  recordActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: space.xs,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  calculateButton: {
    backgroundColor: colors.surfaceSoft,
  },
  editButton: {
    backgroundColor: colors.surfaceSoft,
  },
  deleteButton: {
    backgroundColor: colors.surfaceSoft,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl * 2.5,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    marginBottom: space.sm,
  },
  emptySubText: {
    fontSize: fontSize.sm,
    color: colors.textSubtle,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '95%',
    paddingTop: space.xl,
  },
  formScrollView: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
  },
  formHeader: {
    marginBottom: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: space.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: space.lg,
    marginBottom: space.md,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  formHalf: {
    width: '48%',
  },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: space.sm,
  },
  requiredMark: {
    color: colors.danger,
    fontWeight: fontWeight.bold,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 10,
    fontSize: fontSize.md,
    backgroundColor: colors.surfaceSoft,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  datePickerContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  calendarNavButton: {
    padding: space.sm,
  },
  calendarNavText: {
    fontSize: 22,
    color: colors.textMuted,
  },
  calendarTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.bold,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateCell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  dateCellText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  dateCellSelected: {
    backgroundColor: colors.textMuted,
  },
  dateCellSelectedText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  closeDateBtn: {
    marginTop: space.md,
    backgroundColor: colors.textMuted,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  closeDateBtnText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
  },
  calculationResultBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.lg,
    marginBottom: space.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.textMuted,
  },
  calculationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: space.md,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  resultValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  classificationHighlight: {
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  referenceBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: space.sm,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  referenceLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  referenceValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.xl,
  },
  formButton: {
    paddingVertical: space.md,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },

  formButtonThird: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',

  },
  calculateBtn:{
    marginRight: space.md,
  },
  formButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },

  cancelBtn: {
    backgroundColor: colors.textSubtle,
    marginTop: space.md,
  },
  closeBtn: {
    backgroundColor: colors.textMuted,
    marginTop: space.xl,
  },
  // Detail view styles
  detailBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.textMuted,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  detailNotes: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  weightDetailBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightDetailValue: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  weightDetailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSubtle,
    marginTop: space.xs,
  },
  referenceDetailBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceDetailTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: space.sm,
  },
  referenceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  referenceDetailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  referenceDetailValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  infoBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.textMuted,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: space.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  labelWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  photoButton: {
    backgroundColor: colors.textMuted,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.md,
  },
  photoInputButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  photoRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  imagesContainer: {
    flexDirection: 'column',
    gap: space.md,
    marginTop: space.md,
  },
  imagesContainerHorizontal: {
    flexDirection: 'row',
    gap: space.sm,
    flex: 1,
    alignItems: 'flex-start',
  },
  imageThumbnailWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  imageThumbnail: {
    width: '100%',
    height: 40,
    borderRadius: radius.md,
  },
  imageThumbnailSmall: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.textMuted,
    borderRadius: radius.pill,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageButtonText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: 16,
  },
  recordImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.sm,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recordImageThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  detailImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailImageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 500,
    borderRadius: 12,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

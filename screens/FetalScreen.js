import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert, Modal, FlatList, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { calculateFetalWeight, classifyFetalWeight, getFetalWeightReference } from '../utils/fetalCalculator';

export default function FetalScreen({ baby, onAddFetal, onUpdateFetal, onDeleteFetal }) {
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';
  const [records, setRecords] = useState(baby.fetalRecords || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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
    setCalendarMonth(new Date());
  };

  const selectDate = (value) => {
    setFormData((prev) => ({ ...prev, date: formatLocalDate(value) }));
    setCalendarMonth(value);
    setShowDatePicker(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = getDaysInMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const changeCalendarMonth = (offset) => {
    setCalendarMonth((current) => {
      const year = current.getFullYear();
      const month = current.getMonth();
      return new Date(year, month + offset, 1);
    });
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>孕期胎儿记录</Text>
        <Pressable style={[styles.addButton, { backgroundColor: themeColor }]} onPress={handleAddNew}>
          <Text style={styles.addButtonText}>+ 新建记录</Text>
        </Pressable>
      </View>

      {/* 记录列表 */}
      {records.length > 0 ? (
        <View style={styles.recordsList}>
          {records.map((record) => (
            <View key={record.id} style={[styles.recordCard, { borderLeftColor: themeColor }]}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordTitle}>
                  孕周 {record.gestationalWeek} 周 · {record.date}
                </Text>
              </View>

              <View style={styles.recordContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>双顶径 (BPD):</Text>
                  <Text style={styles.value}>{record.bpd}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>头围 (HC):</Text>
                  <Text style={styles.value}>{record.hc}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>腹围 (AC):</Text>
                  <Text style={styles.value}>{record.ac}mm</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>股骨径 (FL):</Text>
                  <Text style={styles.value}>{record.fl}mm</Text>
                </View>
                {record.fhr && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>胎心率:</Text>
                    <Text style={styles.value}>{record.fhr} bpm</Text>
                  </View>
                )}

                {record.estimatedWeight && (
                  <View style={[styles.infoRow, styles.weightRow]}>
                    <View>
                      <Text style={styles.label}>估计体重:</Text>
                      <Text style={styles.weightValue}>{record.estimatedWeight}g</Text>
                      <Text style={styles.weightFormula}>({record.weightFormula}公式)</Text>
                    </View>
                    <View style={styles.classificationBadge}>
                      <Text style={styles.classificationText}>
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
                    <Text style={styles.label}>备注:</Text>
                    <Text style={styles.notes}>{record.notes}</Text>
                  </View>
                )}
              </View>

              <View style={styles.recordActions}>
                <Pressable
                  style={[styles.actionButton, styles.calculateButton]}
                  onPress={() => handleShowCalculator(record)}
                >
                  <Text style={styles.actionButtonText}>📊 查看详情</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(record)}
                >
                  <Text style={styles.actionButtonText}>✏️ 编辑</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteConfirm(record.id)}
                >
                  <Text style={styles.actionButtonText}>🗑️ 删除</Text>
                </Pressable>
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
                <View style={styles.calculationResultBox}>
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
                  style={[styles.formButtonThird, styles.cancelBtn, { backgroundColor: '#D0D0D0' }]}
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.formButtonText}>❌ 取消</Text>
                </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDatePicker} animationType="fade" transparent={true}>
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.calendarHeader}>
              <Pressable style={styles.calendarNavButton} onPress={() => changeCalendarMonth(-1)}>
                <Text style={styles.calendarNavText}>‹</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {calendarMonth.getFullYear()}年{calendarMonth.getMonth() + 1}月
              </Text>
              <Pressable style={styles.calendarNavButton} onPress={() => changeCalendarMonth(1)}>
                <Text style={styles.calendarNavText}>›</Text>
              </Pressable>
            </View>
            <View style={styles.weekDaysRow}>
              {['日','一','二','三','四','五','六'].map((label) => (
                <Text key={label} style={styles.weekDayText}>{label}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {getCalendarDays().map((date, index) => {
                const selected = date && formatLocalDate(date) === formData.date;
                return (
                  <Pressable
                    key={`${index}-${date?.toString()}`}
                    style={[styles.dateCell, selected && { backgroundColor: themeColor }]}
                    onPress={() => date && selectDate(date)}
                    disabled={!date}
                  >
                    <Text style={[styles.dateCellText, selected && styles.dateCellSelectedText]}>
                      {date ? date.getDate() : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={[styles.closeDateBtn, { backgroundColor: themeColor }]} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.closeDateBtnText}>取消</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40,
    backgroundColor: '#F8F4EE',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#7D5A50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  recordsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  weightRow: {
    flexDirection: 'column',
    borderTopWidth: 2,
    borderTopColor: '#E8F1EA',
    marginTop: 8,
    paddingTop: 12,
    borderBottomWidth: 0,
  },
  weightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7D5A50',
    marginVertical: 4,
  },
  weightFormula: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  classificationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F1EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  classificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C6B46',
  },
  notesRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  calculateButton: {
    backgroundColor: '#F3F5F2',
  },
  editButton: {
    backgroundColor: '#F3F5F2',
  },
  deleteButton: {
    backgroundColor: '#F8E8E8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#ccc',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    paddingTop: 20,
  },
  formScrollView: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F1EA',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#E63946',
    fontWeight: '700',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
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
    padding: 20,
  },
  datePickerContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarNavText: {
    fontSize: 22,
    color: '#7D5A50',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateCellText: {
    color: '#333',
    fontSize: 12,
  },
  dateCellSelected: {
    backgroundColor: '#7D5A50',
  },
  dateCellSelectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  closeDateBtn: {
    marginTop: 12,
    backgroundColor: '#7D5A50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeDateBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  calculationResultBox: {
    backgroundColor: '#E8F1EA',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7D5A50',
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE6DE',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
  },
  resultValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  classificationHighlight: {
    color: '#3C6B46',
    fontWeight: 'bold',
  },
  referenceBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDE6DE',
  },
  referenceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  referenceLabel: {
    fontSize: 11,
    color: '#666',
  },
  referenceValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formButton: {
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  formButtonThird: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',

  },
  calculateBtn:{
marginRight:10,
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },

  cancelBtn: {
    backgroundColor: '#999',
    marginTop: 10,
  },
  closeBtn: {
    backgroundColor: '#7D5A50',
    marginTop: 20,
  },
  // Detail view styles
  detailBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#7D5A50',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  detailNotes: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  weightDetailBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#7D5A50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightDetailValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7D5A50',
  },
  weightDetailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  referenceDetailBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8F1EA',
  },
  referenceDetailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  referenceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  referenceDetailLabel: {
    fontSize: 11,
    color: '#666',
  },
  referenceDetailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7D5A50',
  },
  infoBox: {
    backgroundColor: '#F3F5F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7D5A50',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3C6B46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#4A4A4A',
    lineHeight: 18,
  },
  labelWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  photoButton: {
    backgroundColor: '#7D5A50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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
    fontWeight: '600',
    fontSize: 16,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  photoRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imagesContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
  imagesContainerHorizontal: {
    flexDirection: 'row',
    gap: 8,
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
    borderRadius: 8,
  },
  imageThumbnailSmall: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#7D5A50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recordImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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

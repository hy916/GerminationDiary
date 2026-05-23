import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CalendarModal from '../ui/components/CalendarModal';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import Chip from '../ui/components/Chip';
import { useAppTheme } from '../ui/theme';
import { fontSize, fontWeight, radius, space } from '../ui/tokens';

const REQUIRED = ' *';

export default function BabyProfileScreen({ baby, babies, onSwitchBaby, onAddBaby, onUpdateBaby, onBack }) {
  const theme = useAppTheme(baby);
  const hasExistingBaby = !!baby?.id;

  const [name, setName] = useState('');
  const [gender, setGender] = useState('女');
  const [birthday, setBirthday] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [delivery, setDelivery] = useState('顺产');
  const [newBabyMode, setNewBabyMode] = useState(!hasExistingBaby);
  const [avatar, setAvatar] = useState('');
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  useEffect(() => {
    setName(baby.name || '');
    setGender(baby.gender || '女');
    setBirthday(baby.birthday || '');
    setWeight(baby.birthInfo?.weight || '');
    setLength(baby.birthInfo?.length || '');
    setDelivery(baby.birthInfo?.delivery || '顺产');
    setAvatar(baby.avatar || '');
  }, [baby]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('权限被拒绝', '需要相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('权限被拒绝', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const selectAvatar = () => {
    Alert.alert('选择头像', '请选择头像来源', [
      { text: '相册', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const validate = () => {
    if (!name.trim()) return '请输入宝宝姓名';
    if (!gender) return '请选择性别';
    if (!birthday) return '请选择出生日期';
    if (!weight.trim()) return '请输入出生体重';
    if (!length.trim()) return '请输入出生身长';
    if (!delivery.trim()) return '请输入出生方式';
    return null;
  };

  const saveProfile = () => {
    const err = validate();

    if (err) {
      Alert.alert('请完善信息', err);
      return;
    }

    onUpdateBaby({
      id: baby.id,
      name: name.trim(),
      gender,
      birthday,
      avatar,
      birthInfo: {
        weight: weight.trim(),
        length: length.trim(),
        headCircumference: baby.birthInfo?.headCircumference || '34cm',
        delivery: delivery.trim(),
      },
    });

    Alert.alert('成功', '档案更新成功', [{ text: '确定' }]);
  };

  const saveNewBaby = () => {
    const err = validate();

    if (err) {
      Alert.alert('请完善信息', err);
      return;
    }

    onAddBaby({
      name: name.trim(),
      gender,
      birthday,
      avatar,
      birthInfo: {
        weight: weight.trim(),
        length: length.trim(),
        delivery: delivery.trim(),
      },
    });

    setName('');
    setBirthday('');
    setWeight('');
    setLength('');
    setDelivery('顺产');
    setAvatar('');
    setGender('女');
    setNewBabyMode(false);
  };

  const formFields = (
    <View>
      <View style={styles.avatarSection}>
        <Pressable onPress={selectAvatar} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Text style={styles.avatarEmoji}>👶</Text>
            </View>
          )}

          <View style={[styles.avatarBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.avatarBadgeText}>编辑</Text>
          </View>
        </Pressable>

        <Text style={[styles.avatarHint, { color: theme.colors.textSubtle }]}>点击更换宝宝头像</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.groupTitle, { color: theme.colors.text }]}>基础信息</Text>

        <Field label={`姓名${REQUIRED}`} baby={baby}>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="宝宝昵称"
            placeholderTextColor={theme.colors.placeholder}
          />
        </Field>

        <Field label={`性别${REQUIRED}`} baby={baby}>
          <View style={[styles.genderBox, { backgroundColor: theme.colors.surfaceMuted }]}>
            {['女', '男'].map((g) => (
              <Chip
                key={g}
                baby={baby}
                label={g}
                selected={gender === g}
                onPress={() => setGender(g)}
                style={styles.segment}
              />
            ))}
          </View>
        </Field>

        <Field label={`出生日期${REQUIRED}`} baby={baby}>
          <Pressable
            style={[styles.fieldInput, styles.dateInput, { backgroundColor: theme.colors.surfaceMuted }]}
            onPress={() => setShowBirthdayPicker(true)}
          >
            <Text style={[styles.dateText, { color: birthday ? theme.colors.text : theme.colors.placeholder }]}>
              {birthday || '请选择日期'}
            </Text>
            <Text style={[styles.dateArrow, { color: theme.colors.textSubtle }]}>›</Text>
          </Pressable>
        </Field>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.groupTitle, { color: theme.colors.text }]}>出生信息</Text>

        <View style={styles.doubleRow}>
          <Field label={`出生体重${REQUIRED}`} baby={baby} style={styles.halfField}>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="如 3200g"
              placeholderTextColor={theme.colors.placeholder}
            />
          </Field>

          <Field label={`出生身长${REQUIRED}`} baby={baby} style={styles.halfField}>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
              value={length}
              onChangeText={setLength}
              placeholder="如 50cm"
              placeholderTextColor={theme.colors.placeholder}
            />
          </Field>
        </View>

        <Field label={`出生方式${REQUIRED}`} baby={baby}>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text }]}
            value={delivery}
            onChangeText={setDelivery}
            placeholder="顺产 / 剖腹产"
            placeholderTextColor={theme.colors.placeholder}
          />
        </Field>
      </View>
    </View>
  );

  return (
    <Screen baby={baby} title={hasExistingBaby ? '宝宝档案' : '创建宝宝档案'} onBack={onBack}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {hasExistingBaby && babies.length > 1 ? (
          <Card baby={baby} style={styles.cardSpacing}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>宝宝切换</Text>
                <Text style={[styles.sectionDesc, { color: theme.colors.textSubtle }]}>选择当前要记录的宝宝</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.babyList}>
              {babies.map((item) => {
                const active = item.id === baby.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onSwitchBaby(item.id)}
                    style={({ pressed }) => [
                      styles.babyCard,
                      {
                        backgroundColor: active ? theme.colors.accent : theme.colors.surfaceMuted,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.babyEmoji}>👶</Text>
                    <Text style={[styles.babyName, { color: active ? '#fff' : theme.colors.text }]}>
                      {item.name || '宝宝'}
                    </Text>
                    <Text style={[styles.babySubtitle, { color: active ? 'rgba(255,255,255,0.82)' : theme.colors.textMuted }]}>
                      {item.gender || '--'} · {item.birthday || '--'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        ) : null}

        {hasExistingBaby ? (
          <Card baby={baby} style={styles.cardSpacing}>
            {formFields}
            <Button baby={baby} label="保存档案" onPress={saveProfile} />
          </Card>
        ) : null}

        {hasExistingBaby ? (
          <Card baby={baby} style={styles.cardSpacing}>
            <View style={styles.addHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>添加新宝宝</Text>
                <Text style={[styles.sectionDesc, { color: theme.colors.textSubtle }]}>为另一个宝宝创建独立档案</Text>
              </View>
            </View>

            <Button
              baby={baby}
              label={newBabyMode ? '取消添加' : '添加宝宝档案'}
              variant="secondary"
              onPress={() => setNewBabyMode(!newBabyMode)}
              style={styles.cardSpacingInner}
            />

            {newBabyMode ? (
              <View>
                {formFields}
                <Button baby={baby} label="保存新宝宝" onPress={saveNewBaby} />
              </View>
            ) : null}
          </Card>
        ) : (
          <Card baby={baby} style={styles.cardSpacing}>
            {formFields}
            <Button baby={baby} label="创建档案并开始使用" onPress={saveNewBaby} />
          </Card>
        )}

        <CalendarModal
          baby={baby}
          visible={showBirthdayPicker}
          value={birthday}
          onClose={() => setShowBirthdayPicker(false)}
          onSelect={(dateStr) => {
            setBirthday(dateStr);
            setShowBirthdayPicker(false);
          }}
        />
      </ScrollView>
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

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: space.xxl,
  },
  header: {
    paddingTop: space.sm,
    marginBottom: space.lg,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
  },
  title: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: space.sm,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },
  cardSpacing: {
    marginBottom: space.lg,
  },
  cardSpacingInner: {
    marginBottom: space.lg,
  },
  sectionHeader: {
    marginBottom: space.lg,
  },
  addHeader: {
    marginBottom: space.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  sectionDesc: {
    marginTop: 5,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: fontWeight.medium,
  },
  babyList: {
    gap: space.md,
    paddingRight: space.lg,
  },
  babyCard: {
    width: 148,
    borderRadius: radius.xl,
    padding: space.md,
  },
  babyEmoji: {
    fontSize: 26,
    marginBottom: space.sm,
  },
  babyName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  babySubtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: space.xl,
  },
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 42,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  avatarBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  avatarHint: {
    marginTop: space.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  formGroup: {
    marginBottom: space.lg,
  },
  groupTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
  },
  field: {
    marginBottom: space.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  fieldInput: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  dateArrow: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  genderBox: {
    flexDirection: 'row',
    gap: space.sm,
    borderRadius: radius.lg,
    padding: 5,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  halfField: {
    flex: 1,
  },
});
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
    if (err) { Alert.alert('请完善信息', err); return; }
    onUpdateBaby({
      id: baby.id,
      name: name.trim(),
      gender,
      birthday,
      avatar,
      birthInfo: { weight: weight.trim(), length: length.trim(), headCircumference: baby.birthInfo?.headCircumference || '34cm', delivery: delivery.trim() },
    });
    Alert.alert('成功', '档案更新成功', [{ text: '确定' }]);
  };

  const saveNewBaby = () => {
    const err = validate();
    if (err) { Alert.alert('请完善信息', err); return; }
    onAddBaby({ name: name.trim(), gender, birthday, avatar, birthInfo: { weight: weight.trim(), length: length.trim(), delivery: delivery.trim() } });
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
      <View style={styles.avatarRow}>
        <Pressable onPress={selectAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Text style={[styles.defaultAvatarText, { color: theme.colors.textMuted }]}>选择头像</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>姓名{REQUIRED}</Text>
          <TextInput style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]} value={name} onChangeText={setName} placeholder="宝宝昵称" placeholderTextColor={theme.colors.placeholder} />
        </View>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>性别{REQUIRED}</Text>
          <View style={styles.segmentRow}>
            {['女', '男'].map((g) => (
              <Chip key={g} baby={baby} label={g} selected={gender === g} onPress={() => setGender(g)} style={styles.segment} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生日期{REQUIRED}</Text>
          <Pressable style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft }]} onPress={() => setShowBirthdayPicker(true)}>
            <Text style={[styles.dateText, { color: birthday ? theme.colors.text : theme.colors.placeholder }]}>{birthday || '请选择日期'}</Text>
          </Pressable>
        </View>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生体重{REQUIRED}</Text>
          <TextInput style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]} value={weight} onChangeText={setWeight} placeholder="如 3200g" placeholderTextColor={theme.colors.placeholder} />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生身长{REQUIRED}</Text>
          <TextInput style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]} value={length} onChangeText={setLength} placeholder="如 50cm" placeholderTextColor={theme.colors.placeholder} />
        </View>
        <View style={styles.formHalf}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生方式{REQUIRED}</Text>
          <TextInput style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]} value={delivery} onChangeText={setDelivery} placeholder="顺产 / 剖腹产" placeholderTextColor={theme.colors.placeholder} />
        </View>
      </View>
    </View>
  );

  return (
    <Screen baby={baby} title={hasExistingBaby ? '宝宝档案' : '创建宝宝档案'} onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {hasExistingBaby && babies.length > 1 ? (
          <Card baby={baby} style={styles.cardSpacing}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>宝宝切换</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.babyList}>
              {babies.map((item) => {
                const active = item.id === baby.id;
                return (
                  <Pressable key={item.id} onPress={() => onSwitchBaby(item.id)} style={[styles.babyCard, { backgroundColor: active ? theme.colors.accent : theme.colors.surfaceSoft }]}>
                    <Text style={[styles.babyName, { color: active ? '#fff' : theme.colors.text }]}>{item.name || '宝宝'}</Text>
                    <Text style={[styles.babySubtitle, { color: active ? '#fff' : theme.colors.textMuted }]}>{item.gender} · {item.birthday || '--'}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        ) : null}

        {hasExistingBaby ? (
          <Card baby={baby} style={styles.cardSpacing}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>编辑当前档案</Text>
            {formFields}
            <Button baby={baby} label="保存档案" onPress={saveProfile} />
          </Card>
        ) : null}

        {hasExistingBaby ? (
          <Card baby={baby}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>添加新宝宝</Text>
            <Button baby={baby} label={newBabyMode ? '取消添加' : '添加宝宝档案'} variant="secondary" onPress={() => setNewBabyMode(!newBabyMode)} style={styles.cardSpacingInner} />
            {newBabyMode ? (
              <View>
                {formFields}
                <Button baby={baby} label="保存新宝宝" onPress={saveNewBaby} />
              </View>
            ) : null}
          </Card>
        ) : (
          <Card baby={baby}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>首次使用，请创建宝宝档案</Text>
            {formFields}
            <Button baby={baby} label="创建档案并开始使用" onPress={saveNewBaby} />
          </Card>
        )}

        <CalendarModal baby={baby} visible={showBirthdayPicker} value={birthday} onClose={() => setShowBirthdayPicker(false)} onSelect={(dateStr) => { setBirthday(dateStr); setShowBirthdayPicker(false); }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: { paddingBottom: space.xxl },
  cardSpacing: { marginBottom: space.lg },
  cardSpacingInner: { marginBottom: space.lg },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: space.md },
  babyList: { paddingRight: space.lg },
  babyCard: { borderRadius: radius.xl, paddingVertical: space.md, paddingHorizontal: space.lg, marginRight: space.md, minWidth: 140 },
  babyName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 4 },
  babySubtitle: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  avatarRow: { alignItems: 'center', marginBottom: space.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  defaultAvatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.lg },
  formHalf: { width: '48%' },
  fieldLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, marginBottom: space.sm },
  fieldInput: { borderRadius: radius.lg, paddingHorizontal: space.lg, paddingVertical: 14, fontSize: fontSize.md },
  dateText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  segmentRow: { flexDirection: 'row', gap: space.md },
  segment: { flex: 1, paddingVertical: 12 },
});

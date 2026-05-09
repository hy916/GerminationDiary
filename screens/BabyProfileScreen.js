import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';
import Screen from '../ui/components/Screen';
import Card from '../ui/components/Card';
import Button from '../ui/components/Button';
import Chip from '../ui/components/Chip';
import { getTheme } from '../ui/theme';
import { fontSize, fontWeight, radius, space } from '../ui/tokens';

export default function BabyProfileScreen({ baby, babies, onSwitchBaby, onAddBaby, onUpdateBaby, onBack }) {
  const theme = getTheme(baby);
  const [name, setName] = useState(baby.name || '');
  const [gender, setGender] = useState(baby.gender || '女');
  const [birthday, setBirthday] = useState(baby.birthday || '');
  const [weight, setWeight] = useState(baby.birthInfo.weight || '');
  const [length, setLength] = useState(baby.birthInfo.length || '');
  const [delivery, setDelivery] = useState(baby.birthInfo.delivery || '顺产');
  const [newBabyMode, setNewBabyMode] = useState(false);
  const [avatar, setAvatar] = useState(baby.avatar || '');

  useEffect(() => {
    setName(baby.name || '');
    setGender(baby.gender || '女');
    setBirthday(baby.birthday || '');
    setWeight(baby.birthInfo.weight || '');
    setLength(baby.birthInfo.length || '');
    setDelivery(baby.birthInfo.delivery || '顺产');
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

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
    }
  };

  const selectAvatar = () => {
    Alert.alert('选择头像', '请选择头像来源', [
      { text: '相册', onPress: pickImage },
      { text: '拍照', onPress: takePhoto },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const fillBirthdayNow = () => {
    setBirthday(formatDateTimeYYYYMMDDHHmm());
  };

  const saveProfile = () => {
    const payload = {
      id: baby.id,
      name,
      gender,
      birthday,
      avatar,
      birthInfo: {
        weight,
        length,
        headCircumference: baby.birthInfo.headCircumference || '34cm',
        delivery,
      },
    };
    onUpdateBaby(payload);
    Alert.alert('成功', '档案更新成功', [{ text: '确定' }]);
  };

  const saveNewBaby = () => {
    if (!name || !birthday) return;
    onAddBaby({ name, gender, birthday, avatar, birthInfo: { weight, length, delivery } });
    Alert.alert('成功', '新宝宝添加成功', [{ text: '确定' }]);
    setName('');
    setBirthday('');
    setWeight('');
    setLength('');
    setDelivery('顺产');
    setAvatar('');
    setGender('女');
    setNewBabyMode(false);
  };

  return (
    <Screen baby={baby} title="宝宝档案" onBack={onBack}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>宝宝切换</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.babyList}>
            {babies.map((item) => {
              const active = item.id === baby.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSwitchBaby(item.id)}
                  style={[
                    styles.babyCard,
                    { backgroundColor: active ? theme.colors.accent : theme.colors.surfaceSoft },
                  ]}
                >
                  <Text style={[styles.babyName, { color: active ? '#fff' : theme.colors.text }]}>{item.name || '宝宝'}</Text>
                  <Text style={[styles.babySubtitle, { color: active ? '#fff' : theme.colors.textMuted }]}>
                    {item.gender} · {item.birthday || '--'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>

        <Card baby={baby} style={styles.cardSpacing}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>编辑当前档案</Text>
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

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>姓名</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="宝宝昵称"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>性别</Text>
            <View style={styles.segmentRow}>
              {['女', '男'].map((g) => (
                <Chip key={g} baby={baby} label={g} selected={gender === g} onPress={() => setGender(g)} style={styles.segment} />
              ))}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生日期</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={birthday}
              onChangeText={setBirthday}
              onFocus={fillBirthdayNow}
              placeholder="点击自动填充当前日期"
              placeholderTextColor={theme.colors.placeholder}
              editable={true}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生体重</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="如 3200g"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生身长</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={length}
              onChangeText={setLength}
              placeholder="如 50cm"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生方式</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
              value={delivery}
              onChangeText={setDelivery}
              placeholder="顺产 / 剖腹产"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <Button baby={baby} label="保存档案" onPress={saveProfile} />
        </Card>

        <Card baby={baby}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>添加新宝宝</Text>
          <Button
            baby={baby}
            label={newBabyMode ? '取消添加' : '添加宝宝档案'}
            variant="secondary"
            onPress={() => setNewBabyMode(!newBabyMode)}
            style={styles.cardSpacingInner}
          />
          {newBabyMode ? (
            <View>
              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>姓名</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="宝宝昵称"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>性别</Text>
                <View style={styles.segmentRow}>
                  {['女', '男'].map((g) => (
                    <Chip key={`new-${g}`} baby={baby} label={g} selected={gender === g} onPress={() => setGender(g)} style={styles.segment} />
                  ))}
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生日期</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                  value={birthday}
                  onChangeText={setBirthday}
                  onFocus={fillBirthdayNow}
                  placeholder="点击自动填充当前日期"
                  placeholderTextColor={theme.colors.placeholder}
                  editable={true}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生体重</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="如 3200g"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生身长</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                  value={length}
                  onChangeText={setLength}
                  placeholder="如 50cm"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>出生方式</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.text }]}
                  value={delivery}
                  onChangeText={setDelivery}
                  placeholder="顺产 / 剖腹产"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <Button baby={baby} label="保存新宝宝" onPress={saveNewBaby} />
            </View>
          ) : null}
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
  cardSpacingInner: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: space.md,
  },
  babyList: {
    paddingRight: space.lg,
  },
  babyCard: {
    borderRadius: radius.xl,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginRight: space.md,
    minWidth: 140,
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
  avatarRow: {
    alignItems: 'center',
    marginBottom: space.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
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
  segmentRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
  },
});

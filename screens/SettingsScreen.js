import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen({ baby, onClearRecords, onUpdateBaby,onNavigate }) {
  const [avatar, setAvatar] = useState(baby.avatar || null);
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';

    const ageText = (birthday) => {
         if (!birthday) return '--';
        const birth = new Date(birthday);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
        const days = Math.max(0, Math.floor((now - new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate())) / (1000 * 60 * 60 * 24)));
  return `${months}个月 ${days}天`;
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      // 更新宝宝数据
      onUpdateBaby({ ...baby, avatar: uri });
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
      // 更新宝宝数据
      onUpdateBaby({ ...baby, avatar: uri });
    }
  };

  const selectAvatar = () => {
    Alert.alert(
      '选择头像',
      '请选择头像来源',
      [
        { text: '相册', onPress: pickImage },
        { text: '拍照', onPress: takePhoto },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const handleClearRecords = () => {
    Alert.alert(
      '确认清空',
      '确认要清空所有记录吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: onClearRecords 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contentContainer}>
      <View style={styles.avatarContainer}>
        <Pressable onPress={selectAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.defaultAvatarText}>选择头像</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{baby.name || '宝宝'}</Text>
            <Text style={styles.headerSubtitle}>{baby.gender} | {ageText(baby.birthday)}</Text>
            <Text style={styles.headerSecondary}>出生信息：{baby.birthInfo.weight} · {baby.birthInfo.length} · {baby.birthInfo.delivery}</Text>
          </View>
          <Pressable style={[styles.editButton, { backgroundColor: themeColor }]} onPress={() => onNavigate('Profile')}>
            <Text style={styles.editButtonText}>编辑</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能管理</Text>
        <View style={styles.navList}>
          {[
            { label: '孕期胎儿记录', page: 'Fetal' },
            { label: '喂奶', page: 'Feeding' },
            { label: '排便', page: 'Diaper' },
            { label: '睡眠', page: 'Sleep' },
            { label: '生长', page: 'Growth' },
            { label: '疫苗', page: 'Vaccine' },
            { label: '生病', page: 'Illness' },
          ].map((item) => (
            <Pressable key={item.page} style={styles.navItem} onPress={() => onNavigate(item.page)}>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Text style={styles.navArrow}>›</Text>
            </Pressable>
          ))}
        </View>

      </View>

      <View style={styles.section}>
              <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>本地数据清理</Text>
          <Text style={styles.settingDescription}>清空当前宝宝的所有记录。档案信息保留。</Text>
        </View>
        <Pressable style={styles.dangerButton} onPress={handleClearRecords}>
          <Text style={styles.dangerText}>清空记录</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于 APP</Text>
        <Text style={styles.fieldText}>版本：1.0.0</Text>
        <Text style={styles.fieldText}>功能覆盖：基础宝宝档案、喂养、睡眠、排便、生长记录。</Text>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  defaultAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#666',
    fontSize: 14,
  },
    headerCard: {
    backgroundColor: '#FFF6F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#7D5A50',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A403A',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#7A6B62',
  },
  headerSecondary: {
    marginTop: 10,
    fontSize: 13,
    color: '#A08B7D',
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
  fieldText: {
    fontSize: 14,
    color: '#6E5D52',
    lineHeight: 22,
  },
  navList: {
    marginBottom: 12,
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3ECE4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  navLabel: {
    fontSize: 15,
    color: '#4A403A',
    fontWeight: '600',
  },
  navArrow: {
    fontSize: 18,
    color: '#A08B7D',
  },
  settingItem: {
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A403A',
  },
  settingDescription: {
    fontSize: 13,
    color: '#7A6B62',
    marginTop: 6,
  },
  dangerButton: {
    backgroundColor: '#C84B31',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

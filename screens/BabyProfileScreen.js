import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { formatDateTimeYYYYMMDDHHmm } from '../utils/timeUtils';

export default function BabyProfileScreen({ baby, babies, onSwitchBaby, onAddBaby, onUpdateBaby }) {
  const [name, setName] = useState(baby.name || '');
  const [gender, setGender] = useState(baby.gender || '男');
  const [birthday, setBirthday] = useState(baby.birthday || '');
  const [weight, setWeight] = useState(baby.birthInfo.weight || '');
  const [length, setLength] = useState(baby.birthInfo.length || '');
  const [delivery, setDelivery] = useState(baby.birthInfo.delivery || '顺产');
  const [newBabyMode, setNewBabyMode] = useState(false);
  const themeColor = baby.gender === '女' ? '#F39AC3' : '#7BCEEA';

  const handleBirthdayFocus = () => {
    setBirthday(formatDateTimeYYYYMMDDHHmm());
  };

  const handleNewBabyBirthdayFocus = () => {
    setBirthday(formatDateTimeYYYYMMDDHHmm());
  };

  useEffect(() => {
    setName(baby.name || '');
    setGender(baby.gender || '男');
    setBirthday(baby.birthday || '');
    setWeight(baby.birthInfo.weight || '');
    setLength(baby.birthInfo.length || '');
    setDelivery(baby.birthInfo.delivery || '顺产');
  }, [baby]);

  const saveProfile = () => {
    const payload = {
      id: baby.id,
      name,
      gender,
      birthday,
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
    onAddBaby({ name, gender, birthday, birthInfo: { weight, length, delivery } });
    Alert.alert('成功', '新宝宝添加成功', [{ text: '确定' }]);
    setName('');
    setBirthday('');
    setWeight('');
    setLength('');
    setDelivery('顺产');
    setNewBabyMode(false);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>宝宝切换</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.babyList}>
          {babies.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSwitchBaby(item.id)}
              style={[styles.babyCard, item.id === baby.id && { backgroundColor: themeColor }]}
            >
              <Text style={[styles.babyName, item.id === baby.id && styles.babyNameActive]}>{item.name}</Text>
              <Text style={styles.babySubtitle}>{item.gender} · {item.birthday}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>编辑当前档案</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>姓名</Text>
          <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholder="宝宝昵称" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>性别</Text>
          <TextInput style={styles.fieldInput} value={gender} onChangeText={setGender} placeholder="男/女" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生日期</Text>
          <TextInput
            style={styles.fieldInput}
            value={birthday}
            onChangeText={setBirthday}
            onFocus={handleBirthdayFocus}
            placeholder="点击自动填充当前日期"
            editable={true}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生体重</Text>
          <TextInput style={styles.fieldInput} value={weight} onChangeText={setWeight} placeholder="如 3200g" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生身长</Text>
          <TextInput style={styles.fieldInput} value={length} onChangeText={setLength} placeholder="如 50cm" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生方式</Text>
          <TextInput style={styles.fieldInput} value={delivery} onChangeText={setDelivery} placeholder="顺产 / 剖腹产" />
        </View>
        <Pressable style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={saveProfile}>
          <Text style={styles.saveText}>保存档案</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>添加新宝宝</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setNewBabyMode(!newBabyMode)}>
          <Text style={styles.secondaryButtonText}>{newBabyMode ? '取消添加' : '添加宝宝档案'}</Text>
        </Pressable>
        {newBabyMode && (
          <View style={styles.newBabyForm}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>姓名</Text>
              <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholder="宝宝昵称" />
            </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>性别</Text>
          <TextInput style={styles.fieldInput} value={gender} onChangeText={setGender} placeholder="男/女" />
        </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>出生日期</Text>
              <TextInput
                style={styles.fieldInput}
                value={birthday}
                onChangeText={setBirthday}
                onFocus={handleNewBabyBirthdayFocus}
                placeholder="点击自动填充当前日期"
                editable={true}
              />
            </View>
                    <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生体重</Text>
          <TextInput style={styles.fieldInput} value={weight} onChangeText={setWeight} placeholder="如 3200g" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生身长</Text>
          <TextInput style={styles.fieldInput} value={length} onChangeText={setLength} placeholder="如 50cm" />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>出生方式</Text>
          <TextInput style={styles.fieldInput} value={delivery} onChangeText={setDelivery} placeholder="顺产 / 剖腹产" />
        </View>
            <Pressable style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={saveNewBaby}>
              <Text style={styles.saveText}>保存新宝宝</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    marginTop:40,
    flex: 1,
    backgroundColor: '#F8F4EE',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 18,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A403A',
    marginBottom: 12,
  },
  babyList: {
    marginTop: 8,
  },
  babyCard: {
    padding: 12,
    backgroundColor: '#F7F2EE',
    borderRadius: 12,
    marginRight: 10,
    minWidth: 120,
  },
  babyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A403A',
  },
  babyNameActive: {
    color: '#fff',
  },
  babySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#7A6B62',
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
    borderRadius: 10,
    padding: 12,
    color: '#4A403A',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F0ECE7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A403A',
    fontSize: 14,
    fontWeight: '600',
  },
  newBabyForm: {
    marginTop: 14,
  },
});

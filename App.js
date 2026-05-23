import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import HomeScreen from './screens/HomeScreen';
import RecordsScreen from './screens/RecordsScreen';
import MeScreen from './screens/MeScreen';
import BabyProfileScreen from './screens/BabyProfileScreen';
import FeedingScreen from './screens/FeedingScreen';
import SleepScreen from './screens/SleepScreen';
import DiaperScreen from './screens/DiaperScreen';
import GrowthScreen from './screens/GrowthScreen';
import VaccineScreen from './screens/VaccineScreen';
import IllnessScreen from './screens/IllnessScreen';
import FetalScreen from './screens/FetalScreen';
import DataBackupScreen from './screens/DataBackupScreen';
import BottomTabBar from './ui/components/BottomTabBar';
import { formatDateTimeYYYYMMDDHHmm } from './utils/timeUtils';
import {
  clearRecordsForBabyFromDb,
  deleteRecordFromDb,
  exportAllData,
  getBabiesFromDb,
  importAllData,
  initDb,
  insertRecordToDb,
  updateRecordToDb,
  upsertBabyToDb,
} from './data/db';

const emptyBaby = {
  id: '',
  name: '',
  gender: '',
  birthday: '',
  avatar: '',
  createdAt: '',
  birthInfo: { weight: '', length: '', headCircumference: '', delivery: '' },
  feedingRecords: [],
  sleepRecords: [],
  diaperRecords: [],
  growthRecords: [],
  vaccineRecords: [],
  illnessRecords: [],
  fetalRecords: [],
  pendingSleepStart: '',
  pendingFeedingStart: '',
};

const tabs = [
  { key: 'Home', label: '首页', icon: '⌂' },
  { key: 'Records', label: '记录', icon: '≡' },
  { key: 'Me', label: '我的', icon: '◯' },
];

export default function App() {
  const [stack, setStack] = useState([{ name: 'Home' }]);
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [ready, setReady] = useState(false);

  const route = stack[stack.length - 1];
  const activeTabKey = stack[0]?.name || 'Home';
  const hasBaby = babies.length > 0;
  const showTabBar = hasBaby && tabs.some((t) => t.key === route.name);

  const currentBaby = useMemo(() => {
    if (!hasBaby) return emptyBaby;
    return babies.find((item) => item.id === selectedBabyId) || babies[0] || emptyBaby;
  }, [babies, selectedBabyId, hasBaby]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initDb();
      const loaded = await getBabiesFromDb();
      if (cancelled) return;
      setBabies(loaded);
      if (loaded.length) setSelectedBabyId(loaded[0].id);
      setReady(true);
    })().catch((err) => {
      if (!cancelled) {
        Alert.alert('数据库初始化失败', err?.message || String(err));
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = (name) => {
    if (tabs.some((t) => t.key === name)) {
      setStack([{ name }]);
      return;
    }
    setStack((prev) => [...prev, { name }]);
  };

  const goBack = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const updateSelectedBaby = async (partial) => {
    const babyId = selectedBabyId || currentBaby.id;
    if (!selectedBabyId) setSelectedBabyId(babyId);

    let next = null;
    setBabies((prev) => {
      const list = prev.length ? prev : [currentBaby];
      const hasTarget = list.some((b) => b.id === babyId);
      if (!hasTarget) {
        next = { ...currentBaby, ...partial, id: babyId };
        return list;
      }
      return list.map((b) => {
        if (b.id !== babyId) return b;
        next = { ...b, ...partial };
        return next;
      });
    });

    await upsertBabyToDb(next || { ...currentBaby, ...partial, id: babyId });
  };

  const updateBaby = async (updated) => {
    await updateSelectedBaby(updated);
  };

  const addBaby = async (baby) => {
    const newBaby = {
      ...baby,
      id: `baby-${Date.now()}`,
      createdAt: new Date().toISOString(),
      avatar: baby.avatar || '',
      feedingRecords: [],
      sleepRecords: [],
      diaperRecords: [],
      growthRecords: [],
      vaccineRecords: [],
      illnessRecords: [],
      fetalRecords: [],
      pendingSleepStart: '',
      pendingFeedingStart: '',
      birthInfo: baby.birthInfo || {},
    };
    await upsertBabyToDb(newBaby);
    setBabies((prev) => [...prev, newBaby]);
    setSelectedBabyId(newBaby.id);
    setStack([{ name: 'Home' }]);
  };

  const addRecord = async (module, record) => {
    const babyId = selectedBabyId || currentBaby.id;
    if (!selectedBabyId) setSelectedBabyId(babyId);

    const id = `${module}-${Date.now()}`;
    const createdAt = record.createdAt || formatDateTimeYYYYMMDDHHmm();
    const full = { ...record, id, createdAt };

    setBabies((prev) =>
      (prev.length ? prev : [currentBaby]).map((baby) => {
        if (baby.id !== babyId) return baby;
        const key = `${module}Records`;
        return { ...baby, [key]: [full, ...(baby[key] || [])] };
      }),
    );

    await insertRecordToDb({ babyId, type: module, record: full });
  };

  const updateRecord = async (module, recordId, updatedFields) => {
    const babyId = selectedBabyId || currentBaby.id;
    if (!selectedBabyId) setSelectedBabyId(babyId);
    setBabies((prev) =>
      (prev.length ? prev : [currentBaby]).map((baby) => {
        if (baby.id !== babyId) return baby;
        const key = `${module}Records`;
        return {
          ...baby,
          [key]: (baby[key] || []).map((r) => (r.id === recordId ? { ...r, ...updatedFields } : r)),
        };
      }),
    );
    await updateRecordToDb({ recordId, babyId, type: module, updatedFields });
  };

  const deleteRecord = async (module, recordId) => {
    const babyId = selectedBabyId || currentBaby.id;
    if (!selectedBabyId) setSelectedBabyId(babyId);
    setBabies((prev) =>
      (prev.length ? prev : [currentBaby]).map((baby) => {
        if (baby.id !== babyId) return baby;
        const key = `${module}Records`;
        return { ...baby, [key]: (baby[key] || []).filter((r) => r.id !== recordId) };
      }),
    );
    await deleteRecordFromDb({ recordId, babyId });
  };

  const setPendingSleepStart = async (value) => {
    await updateSelectedBaby({ pendingSleepStart: value });
  };

  const setPendingFeedingStart = async (value) => {
    await updateSelectedBaby({ pendingFeedingStart: value });
  };

  const clearRecords = async () => {
    Alert.alert('确认清空', '确认要清空所有记录吗？此操作不可撤销。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await clearRecordsForBabyFromDb(selectedBabyId);
          setBabies((prev) =>
            prev.map((baby) =>
              baby.id === selectedBabyId
                ? {
                    ...baby,
                    feedingRecords: [],
                    sleepRecords: [],
                    diaperRecords: [],
                    growthRecords: [],
                    vaccineRecords: [],
                    illnessRecords: [],
                    fetalRecords: [],
                    pendingSleepStart: '',
                    pendingFeedingStart: '',
                  }
                : baby,
            ),
          );
        },
      },
    ]);
  };

  const handleExport = async (selectedCategories) => {
    try {
      const allData = await exportAllData();
      const { babies, records } = allData;

      const exportObj = {
        version: allData.version,
        exportDate: allData.exportDate,
        babies: babies.filter((b) => b.id === (selectedBabyId || currentBaby.id)),
        records: {},
      };

      const babyId = selectedBabyId || currentBaby.id;
      const allRecs = records[babyId] || [];
      const categoryMap = {
        feeding: 'feedingRecords',
        sleep: 'sleepRecords',
        diaper: 'diaperRecords',
        growth: 'growthRecords',
        vaccine: 'vaccineRecords',
        illness: 'illnessRecords',
        fetal: 'fetalRecords',
      };

      const filtered = allRecs.filter((r) => {
        const cat = categoryMap[r.module];
        return cat ? selectedCategories[cat] : true;
      });

      exportObj.records[babyId] = filtered;

      const jsonStr = JSON.stringify(exportObj, null, 2);
      const fileName = `SproutDiary_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonStr);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '导出萌芽日记备份',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('导出成功', `备份文件已保存到：${filePath}`);
      }
    } catch (err) {
      Alert.alert('导出失败', err?.message || String(err));
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0] || result;
      if (!file?.uri) {
        Alert.alert('导入失败', '无法读取选择的文件');
        return;
      }

      let jsonStr;
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        jsonStr = await response.text();
      } else {
        jsonStr = await FileSystem.readAsStringAsync(file.uri);
      }

      const data = JSON.parse(jsonStr);

      if (!data.babies || !data.records) {
        Alert.alert('导入失败', '无效的备份文件格式');
        return;
      }

      Alert.alert(
        '确认导入',
        `即将导入 ${data.babies.length} 个宝宝的数据。\n导入将覆盖当前所有数据，是否继续？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定导入',
            onPress: async () => {
              await importAllData(data);
              const loaded = await getBabiesFromDb();
              setBabies(loaded);
              if (loaded.length && !loaded.some((b) => b.id === selectedBabyId)) {
                setSelectedBabyId(loaded[0].id);
              }
              Alert.alert('导入成功', '数据已成功恢复，请重启应用以确保数据完全加载。');
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert('导入失败', err?.message || String(err));
    }
  };

  const renderScreen = () => {
    const name = !hasBaby ? 'Profile' : route.name;
    switch (name) {
      case 'Home':
        return <HomeScreen baby={currentBaby} onNavigate={navigate} />;
      case 'Records':
        return <RecordsScreen baby={currentBaby} onNavigate={navigate} />;
      case 'Me':
        return <MeScreen baby={currentBaby} onNavigate={navigate} onClearRecords={clearRecords} />;
      case 'Profile':
        return (
          <BabyProfileScreen
            baby={currentBaby}
            babies={babies}
            onSwitchBaby={setSelectedBabyId}
            onAddBaby={addBaby}
            onUpdateBaby={updateBaby}
            onBack={hasBaby ? goBack : undefined}
          />
        );
      case 'Feeding':
        return <FeedingScreen
          baby={currentBaby}
          onBack={goBack}
          onAddFeeding={(record) => addRecord('feeding', record)}
          onUpdateFeeding={(id, record) => updateRecord('feeding', id, record)}
          onDeleteFeeding={(id) => deleteRecord('feeding', id)}
          onSetPendingFeedingStart={setPendingFeedingStart}
        />;
      case 'Sleep':
        return <SleepScreen
          baby={currentBaby}
          onBack={goBack}
          onAddSleep={(record) => addRecord('sleep', record)}
          onUpdateSleep={(id, record) => updateRecord('sleep', id, record)}
          onDeleteSleep={(id) => deleteRecord('sleep', id)}
          onSetPendingSleepStart={setPendingSleepStart}
        />;
      case 'Diaper':
        return <DiaperScreen
          baby={currentBaby}
          onBack={goBack}
          onAddDiaper={(record) => addRecord('diaper', record)}
          onUpdateDiaper={(id, record) => updateRecord('diaper', id, record)}
          onDeleteDiaper={(id) => deleteRecord('diaper', id)}
        />;
      case 'Growth':
        return <GrowthScreen
          baby={currentBaby}
          onBack={goBack}
          onAddGrowth={(record) => addRecord('growth', record)}
          onUpdateGrowth={(id, record) => updateRecord('growth', id, record)}
          onDeleteGrowth={(id) => deleteRecord('growth', id)}
        />;
      case 'Vaccine':
        return <VaccineScreen
          baby={currentBaby}
          onBack={goBack}
          onAddVaccine={(record) => addRecord('vaccine', record)}
          onUpdateVaccine={(id, record) => updateRecord('vaccine', id, record)}
          onDeleteVaccine={(id) => deleteRecord('vaccine', id)}
        />;
      case 'Illness':
        return <IllnessScreen
          baby={currentBaby}
          onBack={goBack}
          onAddIllness={(record) => addRecord('illness', record)}
          onUpdateIllness={(id, record) => updateRecord('illness', id, record)}
          onDeleteIllness={(id) => deleteRecord('illness', id)}
        />;
      case 'Fetal':
        return <FetalScreen
          baby={currentBaby}
          onBack={goBack}
          onAddFetal={(record) => addRecord('fetal', record)}
          onUpdateFetal={(id, record) => updateRecord('fetal', id, record)}
          onDeleteFetal={(id) => deleteRecord('fetal', id)}
        />;
      case 'DataBackup':
        return <DataBackupScreen
          baby={currentBaby}
          onBack={goBack}
          onExport={handleExport}
          onImport={handleImport}
        />;
      default:
        return <HomeScreen baby={currentBaby} onNavigate={navigate} />;
    }
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {showTabBar ? (
        <BottomTabBar baby={currentBaby} tabs={tabs} activeKey={activeTabKey} onPressTab={navigate} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EE',
  },
  screenContainer: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F4EE',
  },
});

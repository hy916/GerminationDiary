import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
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
import BottomTabBar from './ui/components/BottomTabBar';
import { formatDateTimeYYYYMMDDHHmm } from './utils/timeUtils';
import {
  clearRecordsForBabyFromDb,
  deleteRecordFromDb,
  getBabiesFromDb,
  initDb,
  insertRecordToDb,
  updateRecordToDb,
  upsertBabyToDb,
} from './data/db';

const initialBaby = {
  id: 'baby-1',
  name: '宝宝',
  gender: '女',
  birthday: '2025-12-01',
  avatar: '',
  createdAt: new Date().toISOString(),
  birthInfo: {
    weight: '3200g',
    length: '50cm',
    headCircumference: '34cm',
    delivery: '顺产',
  },
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
  { key: 'Me', label: '我的', icon: '☺' },
];

export default function App() {
  const [stack, setStack] = useState([{ name: 'Home' }]);
  const [babies, setBabies] = useState([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [ready, setReady] = useState(false);

  const route = stack[stack.length - 1];
  const activeTabKey = stack[0]?.name || 'Home';
  const showTabBar = true;

  const currentBaby = useMemo(() => {
    if (!babies.length) return initialBaby;
    return babies.find((item) => item.id === selectedBabyId) || babies[0] || initialBaby;
  }, [babies, selectedBabyId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initDb();
      const loaded = await getBabiesFromDb();
      if (cancelled) return;
      if (!loaded.length) {
        await upsertBabyToDb(initialBaby);
        setBabies([initialBaby]);
        setSelectedBabyId(initialBaby.id);
      } else {
        setBabies(loaded);
        setSelectedBabyId(loaded[0].id);
      }
      setReady(true);
    })().catch((err) => {
      if (!cancelled) {
        Alert.alert('数据库初始化失败', err?.message || String(err));
        setBabies([initialBaby]);
        setSelectedBabyId(initialBaby.id);
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

  const renderScreen = () => {
    switch (route.name) {
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
            onBack={goBack}
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

import React, { useState } from 'react';
import {  StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import BabyProfileScreen from './screens/BabyProfileScreen';
import FeedingScreen from './screens/FeedingScreen';
import SleepScreen from './screens/SleepScreen';
import DiaperScreen from './screens/DiaperScreen';
import GrowthScreen from './screens/GrowthScreen';
import VaccineScreen from './screens/VaccineScreen';
import IllnessScreen from './screens/IllnessScreen';
import FetalScreen from './screens/FetalScreen';
import SettingsScreen from './screens/SettingsScreen';

const initialBaby = {
  id: 'baby-1',
  name: '宝宝',
  gender: '女',
  birthday: '2025-12-01',
  avatar: '',
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

const pages = [
  { key: 'Home', label: '首页' },
  { key: 'Settings', label: '我的' },
];

export default function App() {
  const [page, setPage] = useState('Home');
  const [babies, setBabies] = useState([initialBaby]);
  const [selectedBabyId, setSelectedBabyId] = useState(initialBaby.id);

  const currentBaby = babies.find((item) => item.id === selectedBabyId) || babies[0];
  const themeColor = currentBaby.gender === '女' ? '#F39AC3' : '#7BCEEA';

  const updateBaby = (updated) => {
    setBabies((prev) => prev.map((baby) => (baby.id === updated.id ? { ...baby, ...updated } : baby)));
  };

  const addBaby = (baby) => {
    const newBaby = {
      ...baby,
      id: `baby-${Date.now()}`,
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
    setBabies((prev) => [...prev, newBaby]);
    setSelectedBabyId(newBaby.id);
  };

  const addRecord = (type, record) => {
    setBabies((prev) =>
      prev.map((baby) => {
        if (baby.id !== selectedBabyId) return baby;
        const updated = { ...baby };
        updated[`${type}Records`] = [{ id: `${type}-${Date.now()}`, ...record }, ...(baby[`${type}Records`] || [])];
        return updated;
      }),
    );
  };

  const updateRecord = (type, recordId, updatedFields) => {
    setBabies((prev) =>
      prev.map((baby) => {
        if (baby.id !== selectedBabyId) return baby;
        const updated = { ...baby };
        updated[`${type}Records`] = (baby[`${type}Records`] || []).map((record) =>
          record.id === recordId ? { ...record, ...updatedFields } : record,
        );
        return updated;
      }),
    );
  };

  const deleteRecord = (type, recordId) => {
    setBabies((prev) =>
      prev.map((baby) => {
        if (baby.id !== selectedBabyId) return baby;
        const updated = { ...baby };
        updated[`${type}Records`] = (baby[`${type}Records`] || []).filter((record) => record.id !== recordId);
        return updated;
      }),
    );
  };

  const setPendingSleepStart = (value) => {
    setBabies((prev) =>
      prev.map((baby) =>
        baby.id === selectedBabyId ? { ...baby, pendingSleepStart: value } : baby,
      ),
    );
  };

  const setPendingFeedingStart = (value) => {
    setBabies((prev) =>
      prev.map((baby) =>
        baby.id === selectedBabyId ? { ...baby, pendingFeedingStart: value } : baby,
      ),
    );
  };

  const clearRecords = () => {
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
  };

  const renderScreen = () => {
    switch (page) {
      case 'Home':
        return <HomeScreen baby={currentBaby} onNavigate={setPage} />;
      case 'Profile':
        return (
          <BabyProfileScreen
            baby={currentBaby}
            babies={babies}
            onSwitchBaby={setSelectedBabyId}
            onAddBaby={addBaby}
            onUpdateBaby={updateBaby}
          />
        );
      case 'Feeding':
        return <FeedingScreen
          baby={currentBaby}
          onAddFeeding={(record) => addRecord('feeding', record)}
          onUpdateFeeding={(id, record) => updateRecord('feeding', id, record)}
          onDeleteFeeding={(id) => deleteRecord('feeding', id)}
          onSetPendingFeedingStart={setPendingFeedingStart}
        />;
      case 'Sleep':
        return <SleepScreen
          baby={currentBaby}
          onAddSleep={(record) => addRecord('sleep', record)}
          onUpdateSleep={(id, record) => updateRecord('sleep', id, record)}
          onDeleteSleep={(id) => deleteRecord('sleep', id)}
          onSetPendingSleepStart={setPendingSleepStart}
        />;
      case 'Diaper':
        return <DiaperScreen
          baby={currentBaby}
          onAddDiaper={(record) => addRecord('diaper', record)}
          onUpdateDiaper={(id, record) => updateRecord('diaper', id, record)}
          onDeleteDiaper={(id) => deleteRecord('diaper', id)}
        />;
      case 'Growth':
        return <GrowthScreen
          baby={currentBaby}
          onAddGrowth={(record) => addRecord('growth', record)}
          onUpdateGrowth={(id, record) => updateRecord('growth', id, record)}
          onDeleteGrowth={(id) => deleteRecord('growth', id)}
        />;
      case 'Vaccine':
        return <VaccineScreen
          baby={currentBaby}
          onAddVaccine={(record) => addRecord('vaccine', record)}
          onUpdateVaccine={(id, record) => updateRecord('vaccine', id, record)}
          onDeleteVaccine={(id) => deleteRecord('vaccine', id)}
        />;
      case 'Illness':
        return <IllnessScreen
          baby={currentBaby}
          onAddIllness={(record) => addRecord('illness', record)}
          onUpdateIllness={(id, record) => updateRecord('illness', id, record)}
          onDeleteIllness={(id) => deleteRecord('illness', id)}
        />;
      case 'Fetal':
        return <FetalScreen
          baby={currentBaby}
          onAddFetal={(record) => addRecord('fetal', record)}
          onUpdateFetal={(id, record) => updateRecord('fetal', id, record)}
          onDeleteFetal={(id) => deleteRecord('fetal', id)}
        />;
      case 'Settings':
        return <SettingsScreen baby={currentBaby} onClearRecords={clearRecords} onUpdateBaby={updateBaby} onNavigate={setPage}/>;
      default:
        return <HomeScreen baby={currentBaby} onNavigate={setPage} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <View style={[styles.tabBar, { backgroundColor: themeColor }]}> 
          {pages.map((item) => (
            <Pressable key={item.key} onPress={() => setPage(item.key)} style={[styles.tabItem, page === item.key && styles.activeTab]}>
              <Text style={[styles.tabLabel, page === item.key && styles.activeTabLabel]}>{item.label}</Text>
            </Pressable>
          ))}
      </View>
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
  tabBar: {
    borderTopWidth: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    height: 60,
  },
  tabScroll: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  tabLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#fff',
  },
});

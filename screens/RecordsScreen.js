import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Screen from '../ui/components/Screen';
import ModuleButton from '../ui/components/ModuleButton';
import { useAppTheme } from '../ui/theme';
import { space, fontSize, fontWeight } from '../ui/tokens';

export default function RecordsScreen({ baby, onNavigate }) {
  const theme = useAppTheme(baby);

  return (
    <Screen baby={baby} padded={false}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>记录</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>选择模块开始记录或查看历史</Text>

        <View style={styles.grid}>
          <View style={styles.row}>
            <ModuleButton baby={baby} label="喂奶" onPress={() => onNavigate('Feeding')} style={styles.halfLeft} />
            <ModuleButton baby={baby} label="睡眠" onPress={() => onNavigate('Sleep')} style={styles.halfRight} />
          </View>
          <View style={styles.row}>
            <ModuleButton baby={baby} label="排便" onPress={() => onNavigate('Diaper')} style={styles.halfLeft} />
            <ModuleButton baby={baby} label="生长" onPress={() => onNavigate('Growth')} style={styles.halfRight} />
          </View>
          <View style={styles.row}>
            <ModuleButton baby={baby} label="疫苗" onPress={() => onNavigate('Vaccine')} style={styles.halfLeft} />
            <ModuleButton baby={baby} label="生病" onPress={() => onNavigate('Illness')} style={styles.halfRight} />
          </View>
          <View style={styles.row}>
            <ModuleButton baby={baby} label="孕胎记录" onPress={() => onNavigate('Fetal')} fullWidth />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: space.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: space.xl,
  },
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: space.lg,
  },
  halfLeft: {
    marginRight: 0,
  },
  halfRight: {
    marginLeft: 0,
  },
});


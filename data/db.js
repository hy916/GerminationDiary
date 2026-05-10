import { Platform } from 'react-native';

const STORAGE_KEYS = {
  babies: 'sproutdiary_babies_v1',
  records: 'sproutdiary_records_v1',
};

let dbPromise = null;

async function getDbAsync() {
  if (Platform.OS === 'web') return null;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const mod = require('expo-sqlite');
    const SQLite = mod?.default ?? mod;
    const openDatabaseAsync = SQLite?.openDatabaseAsync ?? mod?.openDatabaseAsync;
    if (typeof openDatabaseAsync === 'function') {
      return await openDatabaseAsync('sproutdiary.db');
    }

    const openDatabase = SQLite?.openDatabase ?? mod?.openDatabase;
    if (typeof openDatabase === 'function') {
      return openDatabase('sproutdiary.db');
    }

    throw new Error('expo-sqlite database open function not available');
  })();

  return dbPromise;
}

async function execute(sql, params = []) {
  const handle = await getDbAsync();
  if (!handle) throw new Error('SQLite not available');

  if (typeof handle.transaction === 'function') {
    return await executeLegacy(handle, sql, params);
  }

  const isRead = /^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql);
  const bindParams = Array.isArray(params) ? params : [params];
  if (isRead) {
    const rows = await handle.getAllAsync(sql, ...bindParams);
    return { rows: { _array: rows } };
  }

  await handle.runAsync(sql, ...bindParams);
  return { rows: { _array: [] } };
}

function executeLegacy(handle, sql, params) {
  return new Promise((resolve, reject) => {
    handle.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          },
        );
      },
      (error) => reject(error),
    );
  });
}

export async function initDb() {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(STORAGE_KEYS.babies);
    window.localStorage.removeItem(STORAGE_KEYS.records);
    return;
  }
  await execute('DROP TABLE IF EXISTS records;');
  await execute('DROP TABLE IF EXISTS babies;');
  await execute(
    `CREATE TABLE IF NOT EXISTS babies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      gender TEXT,
      birthday TEXT,
      avatar TEXT,
      birthInfo TEXT,
      pendingSleepStart TEXT,
      pendingFeedingStart TEXT,
      createdAt TEXT
    );`,
  );

  await execute(
    `CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY NOT NULL,
      babyId TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );`,
  );
}

export async function getBabiesFromDb() {
  if (Platform.OS === 'web') {
    const babies = readWebBabies();
    const records = readWebRecords();
    return babies.map((baby) => ({
      ...baby,
      ...recordsToBuckets((records[baby.id] || []).map((r) => ({ ...r }))),
    }));
  }
  const result = await execute('SELECT * FROM babies ORDER BY createdAt ASC');
  const babies = (result.rows?._array || []).map((row) => ({
    id: row.id,
    name: row.name || '',
    gender: row.gender || '女',
    birthday: row.birthday || '',
    avatar: row.avatar || '',
    birthInfo: safeParseJson(row.birthInfo, {}),
    pendingSleepStart: row.pendingSleepStart || '',
    pendingFeedingStart: row.pendingFeedingStart || '',
    feedingRecords: [],
    sleepRecords: [],
    diaperRecords: [],
    growthRecords: [],
    vaccineRecords: [],
    illnessRecords: [],
    fetalRecords: [],
  }));

  const babiesWithRecords = [];
  for (const baby of babies) {
    const records = await getRecordsForBaby(baby.id);
    babiesWithRecords.push({
      ...baby,
      ...recordsToBuckets(records),
    });
  }

  return babiesWithRecords;
}

export async function upsertBabyToDb(baby) {
  if (Platform.OS === 'web') {
    const babies = readWebBabies();
    const next = babies.filter((b) => b.id !== baby.id).concat([normalizeBaby(baby)]);
    writeWebBabies(next);
    return;
  }
  const payload = {
    id: baby.id,
    name: baby.name || '',
    gender: baby.gender || '女',
    birthday: baby.birthday || '',
    avatar: baby.avatar || '',
    birthInfo: JSON.stringify(baby.birthInfo || {}),
    pendingSleepStart: baby.pendingSleepStart || '',
    pendingFeedingStart: baby.pendingFeedingStart || '',
    createdAt: baby.createdAt || baby.birthday || new Date().toISOString(),
  };

  await execute(
    `INSERT OR REPLACE INTO babies
      (id, name, gender, birthday, avatar, birthInfo, pendingSleepStart, pendingFeedingStart, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      payload.id,
      payload.name,
      payload.gender,
      payload.birthday,
      payload.avatar,
      payload.birthInfo,
      payload.pendingSleepStart,
      payload.pendingFeedingStart,
      payload.createdAt,
    ],
  );
}

export async function insertRecordToDb({ babyId, type, record }) {
  if (Platform.OS === 'web') {
    const records = readWebRecords();
    const id = record.id || `${type}-${Date.now()}`;
    const createdAt = record.createdAt || new Date().toISOString();
    const stored = { id, module: type, createdAt, ...stripRecordFields(record) };
    records[babyId] = [stored, ...(records[babyId] || []).filter((r) => r.id !== id)];
    writeWebRecords(records);
    return { id, createdAt };
  }
  const id = record.id || `${type}-${Date.now()}`;
  const createdAt = record.createdAt || new Date().toISOString();
  const payload = JSON.stringify(stripRecordFields(record));
  await execute(
    'INSERT OR REPLACE INTO records (id, babyId, type, payload, createdAt) VALUES (?, ?, ?, ?, ?);',
    [id, babyId, type, payload, createdAt],
  );
  return { id, createdAt };
}

export async function updateRecordToDb({ recordId, babyId, type, updatedFields }) {
  if (Platform.OS === 'web') {
    const records = readWebRecords();
    const next = (records[babyId] || []).map((r) =>
      r.id === recordId ? { ...r, ...stripRecordFields(updatedFields) } : r,
    );
    records[babyId] = next;
    writeWebRecords(records);
    return;
  }
  const existing = await execute('SELECT * FROM records WHERE id = ? AND babyId = ? LIMIT 1;', [recordId, babyId]);
  const row = existing.rows?._array?.[0];
  if (!row) return;
  const payload = safeParseJson(row.payload, {});
  const merged = { ...payload, ...stripRecordFields(updatedFields) };
  await execute('UPDATE records SET payload = ? WHERE id = ? AND babyId = ?;', [JSON.stringify(merged), recordId, babyId]);
}

export async function deleteRecordFromDb({ recordId, babyId }) {
  if (Platform.OS === 'web') {
    const records = readWebRecords();
    records[babyId] = (records[babyId] || []).filter((r) => r.id !== recordId);
    writeWebRecords(records);
    return;
  }
  await execute('DELETE FROM records WHERE id = ? AND babyId = ?;', [recordId, babyId]);
}

export async function clearRecordsForBabyFromDb(babyId) {
  if (Platform.OS === 'web') {
    const records = readWebRecords();
    records[babyId] = [];
    writeWebRecords(records);
    const babies = readWebBabies().map((b) =>
      b.id === babyId ? { ...b, pendingSleepStart: '', pendingFeedingStart: '' } : b,
    );
    writeWebBabies(babies);
    return;
  }
  await execute('DELETE FROM records WHERE babyId = ?;', [babyId]);
  await execute('UPDATE babies SET pendingSleepStart = ?, pendingFeedingStart = ? WHERE id = ?;', ['', '', babyId]);
}

async function getRecordsForBaby(babyId) {
  const result = await execute('SELECT * FROM records WHERE babyId = ? ORDER BY datetime(createdAt) DESC;', [babyId]);
  return (result.rows?._array || []).map((row) => {
    const payload = safeParseJson(row.payload, {});
    return {
      id: row.id,
      module: row.type,
      createdAt: row.createdAt,
      ...payload,
    };
  });
}

function recordsToBuckets(records) {
  const buckets = {
    feedingRecords: [],
    sleepRecords: [],
    diaperRecords: [],
    growthRecords: [],
    vaccineRecords: [],
    illnessRecords: [],
    fetalRecords: [],
  };

  for (const item of records) {
    if (item.module === 'feeding') buckets.feedingRecords.push(item);
    else if (item.module === 'sleep') buckets.sleepRecords.push(item);
    else if (item.module === 'diaper') buckets.diaperRecords.push(item);
    else if (item.module === 'growth') buckets.growthRecords.push(item);
    else if (item.module === 'vaccine') buckets.vaccineRecords.push(item);
    else if (item.module === 'illness') buckets.illnessRecords.push(item);
    else if (item.module === 'fetal') buckets.fetalRecords.push(item);
  }

  return buckets;
}

function stripRecordFields(record) {
  const { id, createdAt, babyId, module, ...rest } = record || {};
  return rest;
}

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeBaby(baby) {
  return {
    id: baby.id,
    name: baby.name || '',
    gender: baby.gender || '女',
    birthday: baby.birthday || '',
    avatar: baby.avatar || '',
    birthInfo: baby.birthInfo || {},
    pendingSleepStart: baby.pendingSleepStart || '',
    pendingFeedingStart: baby.pendingFeedingStart || '',
    createdAt: baby.createdAt || baby.birthday || new Date().toISOString(),
    feedingRecords: [],
    sleepRecords: [],
    diaperRecords: [],
    growthRecords: [],
    vaccineRecords: [],
    illnessRecords: [],
    fetalRecords: [],
  };
}

function readWebBabies() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.babies);
  const list = safeParseJson(raw, []);
  return Array.isArray(list) ? list.map((b) => normalizeBaby(b)) : [];
}

function writeWebBabies(babies) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.babies, JSON.stringify(babies));
}

function readWebRecords() {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEYS.records);
  const value = safeParseJson(raw, {});
  return value && typeof value === 'object' ? value : {};
}

function writeWebRecords(records) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

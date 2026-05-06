// 格式化完整日期时间为 YYYY-M-D HH:mm 格式
export const formatDateTimeYYYYMMDDHHmm = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 格式化时间为 HH:mm 格式
export const formatTimeHHmm = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 格式化完整日期为 YYYY-M-D 格式
export const formatDateYYYYMMDD = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

// 获取今天的日期字符串（YYYY-M-D）
export const getTodayDateString = () => {
  const now = new Date();
  return formatDateYYYYMMDD(now);
};

// 获取本周的开始和结束日期（周一到周日）
export const getWeekDateRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 是周日，1 是周一
  const startOfWeek = new Date(now);
  const endOfWeek = new Date(now);
  
  // 计算周一
  const day = startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  startOfWeek.setDate(day);
  
  // 计算周日
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return { startOfWeek, endOfWeek };
};

// 获取本月的开始和结束日期
export const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return { startOfMonth, endOfMonth };
};

// 检查记录是否在指定日期范围内
export const isRecordInRange = (record, startDate, endDate) => {
  const recordDate = new Date(record.createdAt);
  return recordDate >= startDate && recordDate <= endDate;
};

// 统计指定范围内的记录数
export const countRecordsInRange = (records = [], startDate, endDate) => {
  return records.filter(record => isRecordInRange(record, startDate, endDate)).length;
};

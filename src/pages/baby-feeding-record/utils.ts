import moment from 'moment';

export const intervalTime = (timestamp1, timestamp2) => {
  // 使用 Moment.js 计算时间差
  const duration = moment.duration(timestamp2 - timestamp1);
  const hours = Math.floor(duration.asHours()); // 获取小时数
  const minutes = duration.minutes(); // 获取分钟数
  return `距离上次，相差 ${hours} 小时 ${minutes} 分`;
};

import { NationZqCode } from '@/constants';
import { getUserInfo } from '@mapzone/utils';

export type ZqParams = Partial<{
  sheng: string;
  shi: string;
  xian: string;
  xiang: string;
  cun: string;
}>;

export const getUserZqCode = (): string => {
  const zqCode: string = getUserInfo().original.zqCode || '';
  return zqCode;
};

export const isNationZqCode = (zqCode: string) => zqCode === NationZqCode;

/** 政区编码 对应关系 */
export const districtCodes: Record<number, 'sheng' | 'shi' | 'xian' | 'xiang' | 'cun'> = {
  2: 'sheng',
  4: 'shi',
  6: 'xian',
  9: 'xiang',
  12: 'cun',
};

export const substrZqCode = (code: string) => {
  let zqCodeObj: ZqParams = {};
  if (!code || code === NationZqCode) {
    return zqCodeObj;
  }
  // eslint-disable-next-line guard-for-in
  for (const key in districtCodes) {
    if (Number(key) > code.length) {
      break;
    }
    const newKey = districtCodes[key];
    zqCodeObj = {
      ...zqCodeObj,
      [newKey]: code.substring(0, +key),
    };
  }
  return zqCodeObj;
};

/** 获取用户政区过滤条件 */
export const getUserZqFilter = () => {
  const zqCode = getUserZqCode();
  if (isNationZqCode(zqCode)) {
    return {};
  }
  const zqParams = substrZqCode(zqCode);
  return zqParams;
};

const isFiltered = (filterStr: string, key: string) => {
  const fieldKey = filterStr.split(' ')[0];
  return fieldKey === key;
};

/** 过滤条件拼接用户的政区 */
export const getFilterByZq = (filter: string = ''): string => {
  const items = filter.split('and');
  for (let i = 0; i < items.length; i++) {
    items[i] = items[i].trim();
  }

  const userZqFilterParams: Record<string, string> = getUserZqFilter();
  // 强制覆盖用户政区
  Object.keys(userZqFilterParams).forEach((key) => {
    const keyUpper = key.toUpperCase();
    const index = items.findIndex((c) => isFiltered(c, keyUpper));
    if (index === -1) {
      items.push(`${keyUpper} = '${userZqFilterParams[key]}'`);
    } else {
      items.splice(index, 1, `${keyUpper} = '${userZqFilterParams[key]}'`);
    }
  });
  return items.filter(Boolean).join(' and ');
};

/** 根据政区，更新filter过滤条件 */
export const getNewFilterByZq = (filter: string = '', zqCode: string) => {
  const items = filter.split('and');
  const zqParams: Record<string, any> = substrZqCode(zqCode);
  for (let i = 0; i < items.length; i++) {
    items[i] = items[i].trim();
  }

  // 用户选择的政区
  Object.keys(zqParams).forEach((key) => {
    const keyUpper = key.toUpperCase();
    const index = items.findIndex((c) => isFiltered(c, keyUpper));
    if (index === -1) {
      items.push(`${keyUpper} = '${zqParams[key]}'`);
    } else {
      items.splice(index, 1, `${keyUpper} = '${zqParams[key]}'`);
    }
  });

  return items.filter(Boolean).join(' and ');
};

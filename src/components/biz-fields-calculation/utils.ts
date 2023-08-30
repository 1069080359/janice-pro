import type { FunTypeRadioItem } from './types';

export const FIELDS_CALCULATION_UPDATETYPE = '_fields-calculation-updateType';

export const funTypeRadioList: FunTypeRadioItem[] = [
  {
    title: '数值',
    value: 'num',
  },
  {
    title: '文本',
    value: 'text',
  },
  {
    title: '日期',
    value: 'date',
  },
  {
    title: '从几何字段计算',
    value: 'fields',
  },
];

/**
 * 函数方法列表
 */
export const functionMethodList: Record<string, { title: string; key: string }[]> = {
  num: [],
  date: [],
  text: [
    {
      title: 'CONCAT() - 字符串连接',
      key: 'CONCAT()',
    },
    {
      title: 'LOWER() - 转换为小写',
      key: 'LOWER()',
    },
    {
      title: 'UPPER() - 转换为大写',
      key: 'UPPER()',
    },
  ],
  fields: [
    {
      title: 'GEOM.m2 - 获取面积（平方米）',
      key: 'GEOM.m2',
    },
    {
      title: 'GEOM.ha - 获取面积（亩）',
      key: 'GEOM.ha',
    },
    {
      title: 'GEOM.hm2 - 获取面积（公顷）',
      key: 'GEOM.hm2',
    },
    {
      title: 'GEOM.km2 - 获取面积（平方公里）',
      key: 'GEOM.km2',
    },
    {
      title: 'GEOM.m - 获取长度（米）',
      key: 'GEOM.m',
    },
    {
      title: 'GEOM.km - 获取长度（公里）',
      key: 'GEOM.km',
    },
    {
      title: 'GEOM.labelx - 获取标注点x坐标',
      key: 'GEOM.labelx',
    },
    {
      title: 'GEOM.labely - 获取标注点y坐标',
      key: 'GEOM.labely',
    },
  ],
};

export const FIELD_TYPE: Record<string, string> = {
  SINGLE8: '数值',
  INT32: '数值',
  INT64: '数值',
  INT16: '数值',
  DOUBLE: '数值',
  DATE: '日期',
  DATETIME: '日期',
  TEXT: '文本',
  STRING: '文本',
};

export const checkValueSymbol = (value: string) => {
  if (!value) {
    return;
  }
  let flag = false;
  const quotationMarksList = ['“', '”', '‘', '’'];
  quotationMarksList.forEach((v) => {
    if (value.includes(v)) {
      flag = true;
    }
  });
  return flag;
};

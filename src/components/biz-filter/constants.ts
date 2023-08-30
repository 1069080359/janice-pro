import type { FieldSymbolOption } from './types';

/** 数值，字典等 */
export const SYMBOL: FieldSymbolOption[] = [
  {
    value: '=',
    label: '=',
  },
  {
    value: 'and',
    label: '介于',
  },
  {
    value: '>',
    label: '>',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '<',
    label: '<',
  },
  {
    value: '<=',
    label: '<=',
  },
];

/** 字符串类型 */
export const STRING_SYMBOL: FieldSymbolOption[] = [
  {
    value: '=',
    label: '=',
  },
  {
    value: '包含',
    label: '包含',
  },
];

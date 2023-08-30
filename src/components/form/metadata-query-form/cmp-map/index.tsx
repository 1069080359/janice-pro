import { BizInput } from './input';
import { BizInputNumber } from './input-number';
import { BizCascader } from './cascader';
import { BizSelect } from './select';
import { BizTreeSelect } from './tree-select';
import { BizCheckbox } from './checkbox';
import { BizRadio } from './radio';
import { BizDatePicker } from './date-picker';
import { BizDateRangePicker } from './date-range-picker';
import { BizInputNumberRange } from './biz-input-number-range';
import type { FsFC } from '@mapzone/types';

export type { BizRequestOptionsType, BizFieldProps, BizFieldRequestData } from './types';

export type CmpMapKEyType =
  | 'Input'
  | 'InputNumber'
  | 'InputNumberRange'
  | 'Select'
  | 'TreeSelect'
  | 'Cascader'
  | 'Checkbox'
  | 'Radio'
  | 'Date'
  | 'DateTime'
  | 'DateRangePicker';

// 组件映射关系
export const bizCmpMap: Record<CmpMapKEyType, FsFC> = {
  Input: BizInput,
  InputNumber: BizInputNumber,
  Select: BizSelect,
  TreeSelect: BizTreeSelect,
  Cascader: BizCascader,
  Checkbox: BizCheckbox,
  Radio: BizRadio,
  Date: BizDatePicker,
  DateTime: BizDatePicker,
  DateRangePicker: BizDateRangePicker,
  InputNumberRange: BizInputNumberRange,
};

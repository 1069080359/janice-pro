import type { CommonGetDictionaryRecord } from '@mapzone/map-services';
import type { DictOption, MetadataFieldConfig } from './types';

/** 格式化字典 */
export const formatDictList = (list: CommonGetDictionaryRecord[] = [], displayCode: boolean = false): DictOption[] => {
  return list.map((item) => {
    const { caption = '', code = '' } = item;
    let children: DictOption[] | undefined;
    if (item.children && item.children.length) {
      children = formatDictList(item.children, displayCode);
    }

    return {
      ...item,
      label: caption,
      value: code,
      children,
      caption: displayCode && code !== caption ? `${code}-${caption}` : caption,
      searchValue: `${(caption + code).toLowerCase()}`,
    };
  });
};

/**
 * 筛选过滤方法
 */
export const dictFilterOption = (value: string, option: DictOption) => {
  if (!value) {
    return true;
  }
  if (option.searchValue && option.searchValue.includes(value.toLowerCase())) {
    return true;
  }
  return false;
};

export const getEmptySelectValue = () => ({ label: '', value: '', code: '' });

export const inputTypes: MetadataFieldConfig['TYPE'][] = ['Input', 'InputNumber'];

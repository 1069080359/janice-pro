import type { TableColumnType } from 'antd';
import type { TMetadata } from '@mapzone/types';
import type { CheckedMetadataValue, BizFilterProps, SelectedFieldItem } from './types';
import { STRING_SYMBOL, SYMBOL } from './constants';

export const prefixCls = 'biz-filter';

export const cloumns: TableColumnType<TMetadata>[] = [
  {
    title: '字段',
    dataIndex: 'fieldAliasName',
    ellipsis: true,
  },
];

/** 格式化id */
export const formatId = (checkedValues?: CheckedMetadataValue[]) => {
  if (!checkedValues || checkedValues.length === 0) {
    return '';
  }
  const idsStr = checkedValues
    .map((c) => c.id)
    .filter(Boolean)
    .join();
  return idsStr;
};

/** 获取父级id */
export const getParentId = (arr: SelectedFieldItem[], parentFieldName: string) => {
  let parentId = '';
  if (parentFieldName) {
    const parentItem = arr.find((c) => c.key === parentFieldName);
    if (parentItem && parentItem.checkedMetadataValue) {
      parentId = formatId(parentItem.checkedMetadataValue);
    }
  }
  return parentId;
};

export const getParentIdAndMetadateByValue = (str: string, sList: SelectedFieldItem[], groupData: Record<string, TMetadata[]>) => {
  try {
    const metadata = JSON.parse(str) as TMetadata;
    if (Array.isArray(groupData.ZQ) && metadata && typeof metadata.relationIndex === 'number') {
      const parentMetadata = groupData.ZQ[metadata.relationIndex - 1];
      if (!parentMetadata) {
        return;
      }
      const parentItem = sList.find((v) => v.key === parentMetadata.fieldname)?.checkedMetadataValue?.[0];
      if (!parentItem || !parentItem.id || !parentItem.code) {
        return;
      }
      return { parentId: String(parentItem.id), parentCode: parentItem.code, metadata: parentMetadata };
    }
  } catch (e) {}
};

const join = (dataType: string, value?: string) => {
  if (!value) return '';
  return !dataType.startsWith('INT') && dataType !== 'DOUBLE' && dataType !== 'FLOAT' ? `'${value}'` : value;
};

/** 格式化过滤条件 */
export const getFilter = (selectedItemList: SelectedFieldItem[]) => {
  const filterStr = selectedItemList.reduce((str: string, item, index) => {
    let resStr = str;
    const { checkedMetadataValue, otherData, metadataItem } = item;
    const { fieldname, dataType } = metadataItem;
    if (checkedMetadataValue && checkedMetadataValue.length) {
      const codeString = checkedMetadataValue
        .reduce((acc: (string | number)[], cur) => {
          acc.push(cur.code!);
          return acc;
        }, [])
        .join("','");
      const and = resStr ? ' and ' : '';
      if (checkedMetadataValue.length > 1) {
        resStr += and + fieldname + " in ('" + codeString + "')";
      } else {
        resStr += and + fieldname + " = '" + codeString + "'";
      }
    }
    if (otherData) {
      const and =
        (index && selectedItemList[index - 1].otherData && selectedItemList[index - 1].otherData?.after) || resStr.length > 0
          ? ' and '
          : '';
      const { symbol } = otherData;
      let before = (otherData.before || '').trim();
      let after = (otherData.after || '').trim();
      if (after) {
        if (symbol === '包含') {
          resStr += `${and} ${fieldname} like '%${after}%'`;
          return resStr;
        }
        after = join(dataType, after);
        before = join(dataType, before);
        if (symbol === 'and') {
          resStr += `${and} ${fieldname} < ${after}`;
          if (before) resStr = `${resStr} and ${fieldname} > ${before}`;
          return resStr;
        }
        resStr += `${and} ${fieldname} ${symbol} ${after}`;
      }
    }
    return resStr;
  }, '');

  return filterStr;
};

/** 默认获取字段的规则列表 */
export const defaultGetFieldSymbol: Required<BizFilterProps>['getFieldSymbol'] = (fieldMetadata) => {
  return fieldMetadata.dataType === 'STRING' ? STRING_SYMBOL : SYMBOL;
};

export const defaultZQGroupName = 'ZQ';

/** 因子过滤条件转 json */
export const filterFieldsToJson = (filterField: string) => {
  try {
    return JSON.parse(filterField);
  } catch (error) {
    console.log('error', error);
    return null;
  }
};

/** 因子过滤条件转 string */
export const filterFieldsToString = (filterField: { name: string; field: string }) => {
  try {
    return JSON.stringify(filterField);
  } catch (error) {
    console.log('error', error);
    return '';
  }
};

import { valiatorDecimals, validatorPhone } from './validator';
import type { RuleObject, StoreValue } from 'rc-field-form/lib/interface';
import type { TMetadata } from '@mapzone/types';
import type { TCheckedMetadataValue, SelectItem } from './types';

export const formatId = (checkedValues?: TCheckedMetadataValue) => {
  return checkedValues?.id ? String(checkedValues.id) : '';
};

/**
 * 有关联关系的字段，获取上一级的id
 * @param arr 表单列表
 * @param parentFieldName 上一级字段名
 * @returns id
 */
export const getParentId = (arr: SelectItem[], parentFieldName: string) => {
  let parentId = '';
  if (parentFieldName) {
    const parentItem = arr.find((c) => c.key === parentFieldName);
    if (parentItem && parentItem.tablePk && parentItem.otherData) {
      parentId = formatId(parentItem.otherData);
    }
  }
  return parentId;
};

/**
 * 从列表中获取批量更新时的 key：字段名 value：值 对象
 * @param selectItemList 表单列表
 * @returns key：字段名 value：值 对象
 */
export const getUpdateFields = (selectItemList: SelectItem[]) => {
  return selectItemList
    .filter((item) => item.otherData?.value || item.disabled)
    .map((item) => {
      return {
        key: item.key,
        value: item.otherData?.value ?? '',
      };
    });
};

/**
 * 从表单列表中获取用于更新图斑列表的 key(字段名) -> value(值)和_DESC -> 描述信息 对象。
 * @param selectItemList 表单列表
 * @returns  key(字段名) -> value(值)和_DESC -> 描述信息 对象
 */
export const getUpdateDatas = (selectItemList: SelectItem[]): Record<string, string> => {
  return selectItemList
    .filter((item) => item.otherData?.value || item.disabled)
    .reduce((prev, cur) => {
      const { key = '', tablePk = '', otherData } = cur;
      if (tablePk) {
        return {
          ...prev,
          [key]: otherData?.value ?? null,
          [`${key}_DESC`]: otherData?.label ?? null,
        };
      }
      return {
        ...prev,
        [key]: otherData?.value ?? null,
      };
    }, {});
};

/**
 * 获取当前数据类型的最大值
 * @param fieldInfo 元数据
 * @returns 最大值
 */
export const getMaxNumber = (fieldInfo: TMetadata) => {
  if (fieldInfo.dataType.startsWith('INT')) {
    const { len = 0 } = fieldInfo.rule;
    const maxNumber = Math.pow(2, len - 1);
    return maxNumber - 1;
  }
  return Number.MAX_VALUE;
};

export const getRules = (fieldInfo: TMetadata) => {
  const { rule } = fieldInfo;
  if (!rule) {
    return undefined;
  }
  const isPhone = rule.type === 'telephone' || rule.type === 'cellphone';
  const rules: RuleObject[] = [];
  const rulesItem: RuleObject = {
    type: 'string',
  };
  if (isPhone) {
    rules.push({ validator: validatorPhone, message: '请输入正确的手机号' });
  }

  if (rule.type !== 'telephone' && rule.type !== 'cellphone') {
    if (rule.type === 'float') {
      rulesItem.type = 'number';
    } else {
      rulesItem.type = rule.type;
    }
  }
  if (fieldInfo.type === 'select' || fieldInfo.type === 'treeSelect') {
    rulesItem.type = 'object';
    rulesItem.validator = (r, value) => {
      const valueLen = Object.values(value || {}).filter(Boolean).length;
      if (r.required && !valueLen) {
        return Promise.reject(r.message);
      }
      return Promise.resolve();
    };
  }
  if (typeof rule.len === 'number' && fieldInfo.type === 'input' && !(rule.type === 'number' || rule.type === 'float')) {
    rules.push({ type: 'string', max: rule.len, message: `${fieldInfo.fieldAliasName}最大长度为 ${rule.len}` });
  }
  if (rule.type === 'number' || rule.type === 'float') {
    const maxNumber = getMaxNumber(fieldInfo);
    rules.push(
      {
        type: 'number',
        decimals: rule.float,
        validator: (...rest: [RuleObject, StoreValue, (error?: string) => void]) => {
          return valiatorDecimals(...rest, rule.len);
        },
      } as any,
      {
        type: 'number',
        max: maxNumber,
        message: `${fieldInfo.fieldAliasName}最大值为 ${maxNumber}`,
      },
    );
  }

  if (typeof rule.message === 'string') {
    rulesItem.message = rule.message;
  }
  if (typeof rule.required === 'boolean') {
    rulesItem.required = rule.required;
    if (rule.type === 'string') {
      rulesItem.whitespace = true;
      rulesItem.transform = (value: any) => {
        if (typeof value === 'string' && value) {
          return value.trim();
        }
        return value;
      };
    }
    rulesItem.message =
      fieldInfo.type === 'input' || fieldInfo.type === 'inputNumber'
        ? `请输入${fieldInfo.fieldAliasName}`
        : `请选择${fieldInfo.fieldAliasName}`;
  }
  const isEmpty = !Object.values(rulesItem).length;
  if (!isEmpty) {
    rules.unshift(rulesItem);
  }
  if (rules.length) {
    return rules;
  }
  return undefined;
};

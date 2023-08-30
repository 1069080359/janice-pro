import { isJSON, JsonParse } from '@mapzone/utils';
import type {
  QualityCheckFieldNamesType,
  FormatQualityCheckRulesReturnType,
  QualityCheckRuleRecord,
  QualityCheckWorkScopeItem,
  DistrictRecord,
} from '@mapzone/types';
import type { StatusRecord, QualityCheckRule, DataDermissionsRecord } from './types';

export const prefixCls = 'mz-cmp-quality-check';

export const displayName = 'quality-check';

export const defaultFieldNames: QualityCheckFieldNamesType = {
  number: 'number',
  errorState: 'errorState',
  qualityCheckType: {
    label: 'label',
    value: 'value',
  },
  qualityCheckRuleName: 'qualityCheckRuleName',
  errorAmount: 'errorAmount',
  rowKey: 'number',
  priorityDisplayFields: 'priorityDisplayFields',
  highLightFields: 'highLightFields',
  filter: 'filter',
};

export const fieldNames: QualityCheckFieldNamesType = {
  number: 'I_BH',
  qualityCheckType: {
    label: 'qualityCheckTypeLabel',
    value: 'I_DATACHECTITEMID',
  },
  qualityCheckRuleName: 'C_DATACHECTITEMNAME',
  errorAmount: 'I_ERRORCOUNT',
  errorState: 'I_ERRORSTATE',
  rowKey: 'OBJECTID',
  priorityDisplayFields: 'priorityDisplayFields',
  highLightFields: 'highLightFields',
  filter: 'TJSQL',
};

export const defaultStatusList: StatusRecord[] = [
  { label: '全部', errorState: -1 },
  { label: '已通过', errorState: 0 },
  { label: '未通过', errorState: 1 },
];

export const formatQualityCheckRules = <T extends QualityCheckRuleRecord = QualityCheckRuleRecord>(
  qcFieldNames: QualityCheckFieldNamesType,
  data: Record<string, any>[],
): FormatQualityCheckRulesReturnType<T> => {
  return data.map((v) => {
    const d = Object.keys(qcFieldNames).reduce((acc: any, key) => {
      const valueKey = (qcFieldNames as any)[key];
      if (valueKey && typeof valueKey === 'object') {
        acc[key] = {
          label: v[valueKey.label],
          value: v[valueKey.value],
        };
      } else if (key === 'rowKey') {
        acc.rowKey = qcFieldNames[key];
      } else {
        acc[key] = v[(qcFieldNames as any)[key]];
      }
      return { ...v, ...acc };
    }, {} as T);
    return d;
  });
};

export const formatDataByResultDisplaySetting = <T extends QualityCheckRule = QualityCheckRule>(data: T | T[]) => {
  return (!Array.isArray(data) ? [data] : data).map((v) => {
    v.priorityDisplayFields = [];
    v.highLightFields = [];
    if (v.C_RESULTDISPLAY_SETTING && isJSON(v.C_RESULTDISPLAY_SETTING)) {
      const d = JsonParse(v.C_RESULTDISPLAY_SETTING);
      if (d && typeof d === 'object') {
        v.priorityDisplayFields = d.priorityDisplayFields || [];
        v.highLightFields = d.highLightFields || [];
      }
    }
    return v;
  });
};

export const formatDistrict = (data: QualityCheckWorkScopeItem[]): DistrictRecord[] => {
  return data.map((v) => ({ value: v.L_ID, label: v.C_ZQNAME, id: v.L_ID, pId: v.L_PARID, original: v }));
};

const districtLevel: Record<number, 'SHENG' | 'SHI' | 'XIAN' | 'XIANG' | 'CUN'> = {
  2: 'SHENG',
  4: 'SHI',
  6: 'XIAN',
  9: 'XIANG',
  12: 'CUN',
};

export const getFieldNameByCodes = (ids: number[], data: DistrictRecord[], dataDermissions?: DataDermissionsRecord) => {
  if (ids.includes(200000)) {
    return [];
  }
  const idMap = data.reduce((acc, cur) => ({ ...acc, [cur.id!]: cur }), {} as Record<number, DistrictRecord>);
  return ids
    .map((id) => idMap[id])
    .reduce(
      (acc, cur) => {
        const { C_ZQCODE, C_ZQNAME } = cur.original;
        const fieldName = dataDermissions?.C_TAGCONTENT?.[districtLevel[C_ZQCODE.length]];
        if (fieldName) {
          acc.push({
            fieldName,
            code: C_ZQCODE,
            name: C_ZQNAME,
          });
        }

        return acc;
      },
      [] as { fieldName: string; code: string; name: string }[],
    );
};

export const defaultSrcWhereString = (zqCode: string = '') => {
  if (zqCode === '200000') return undefined;
  return `${districtLevel[zqCode.length]} = '${zqCode}'`;
};

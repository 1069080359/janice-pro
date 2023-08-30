import type { TMetadata } from '@mapzone/types';
import type { FieldItem } from './types';

const transformMetaDatas = (metadatas: TMetadata[]) => {
  const metadatasMap = new Map<string, TMetadata>();
  if (metadatas && metadatas.length > 0) {
    metadatas.forEach((metadata) => {
      metadatasMap.set(metadata.fieldname, metadata);
    });
  }
  return metadatasMap;
};

const getFieldValue = (values: Record<string, any>, metadata: TMetadata) => {
  const { fieldname } = metadata;
  if (!fieldname || typeof fieldname !== 'string') {
    return values[fieldname];
  }
  const lower = fieldname.toLocaleLowerCase();
  const upper = fieldname.toLocaleUpperCase();
  const map: any = { MZAREA: 'area', MZLENGTH: 'lineLength' };
  const isSystemAreaFieldnames = ['MZAREA', 'MZLENGTH'].includes(fieldname);
  const value = isSystemAreaFieldnames ? values[fieldname] || values[map[fieldname]] : values[lower] || values[upper];
  if (typeof value === 'number' && typeof metadata.rule.float === 'number' && value.toString().includes('.')) {
    const p = value.toString().split('.')[1].length;
    const { float } = metadata.rule;
    if (p > float) {
      return +value.toFixed(metadata.rule.float);
    }
  }
  return value;
};

/**
 * 通过 row data 和 metadatas 格式化详情数据
 */
export const transformInitialValues = (values: Record<string, any>, metadatas: TMetadata[]) => {
  const detailsList: FieldItem[] = [];
  const metadatasMap: Map<string, TMetadata> = transformMetaDatas(metadatas);
  Object.keys(values).forEach((key) => {
    const metadata = metadatasMap.get(key);
    if (metadata) {
      const { fieldname, fieldAliasName, tablePk, type, display } = metadata;
      if (display !== 'none' && fieldname !== 'PK_UID') {
        const span = type === 'FsFile' ? 2 : 1;
        const value = tablePk ? values[`${fieldname}_DESC`] || values[fieldname] : getFieldValue(values, metadata);
        const item: FieldItem = {
          fieldName: fieldname,
          value,
          span,
          label: fieldAliasName,
          metadata,
        };
        detailsList.push(item);
      }
    }
  });
  const detailsListSort = detailsList.sort((x, y) => x.metadata.fieldId - y.metadata.fieldId);
  return detailsListSort;
};

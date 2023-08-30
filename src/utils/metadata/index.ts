import { getWebAppConfig } from '../utils';
import type { BizMetadataItem } from '@/types';

/** 基于元数据列表获取元数据的分组配置 */
export const getGroupConfigByMetadataList = (metadataList: BizMetadataItem[]) => {
  if (metadataList.length === 0) {
    return undefined;
  }
  const groupConfig: Record<string, string[]> = {};
  metadataList
    .sort((x, y) => x.fieldId - y.fieldId)
    .forEach((item) => {
      const { group, fieldname } = item;
      if (group) {
        if (!groupConfig[group]) {
          groupConfig[group] = [];
        }
        groupConfig[group].push(fieldname);
      }
    });

  if (Object.keys(groupConfig).length === 0) {
    return undefined;
  }

  return groupConfig;
};

/** 获取字段的宽度，如未设置，则使用默认宽度 */
export const getFieldWidth = (fieldName: string) => {
  const { appSettings } = getWebAppConfig();
  const { defaultFieldWidth, fieldWidthConfig = {} } = appSettings;
  const width = fieldWidthConfig[fieldName] || defaultFieldWidth;
  return width;
};

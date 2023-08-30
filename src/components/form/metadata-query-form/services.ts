import { commonGetDictionary, commonGetMetadataInfo } from '@mapzone/map-services';
import { formatDictList } from './utils';
import type { CommonGetDictionaryParams } from '@mapzone/map-services';
import type { ApiRes, TMetadata } from '@mapzone/types';
import type { DictOption, MetadataFieldConfig } from './types';
import { appRequest } from '@mapzone/request';

/**
 * 根据表名查询元数据
 * @param dataName
 * @returns
 */
export const queryMetadataList = async (dataName: string): Promise<TMetadata[]> => {
  const res = await commonGetMetadataInfo(dataName);
  if (!res || !res.success) {
    return [];
  }
  return res.datas ?? [];
};

/** 查询字典 */
export const queryDictList = async (params: CommonGetDictionaryParams): Promise<DictOption[]> => {
  const res = await commonGetDictionary(params);
  if (!res || !res.success) {
    return [];
  }
  const optionsList = formatDictList(res.datas);
  return optionsList;
};

/** 查询字典 */
export const queryTableQueryConfig = async (dataName: string) => {
  //TODO: 获取
  const res = await appRequest.post<ApiRes<MetadataFieldConfig[]>>('/tableWhere/getFieldByTableName', { data: { tableName: dataName } });
  if (!res || !res.success) {
    return [];
  }
  return res.datas ?? [];
};

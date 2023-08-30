import { BizMetadataItem } from '@/types';
import { queryGeoAndAttrs, queryGeoConut, queryById } from '@mapzone/map-services';
import type { QueryGeoAndAttrsParams, QueryGeoAndAttrsCountParams, QueryByIdParams } from '@mapzone/types';

export type QueryGeoAndAttrListParams = QueryGeoAndAttrsParams;
/** 获取图属列表 */
export const queryGeoAndAttrList = async (params: QueryGeoAndAttrsParams): Promise<BizMetadataItem[]> => {
  const res = await queryGeoAndAttrs.fetch(params);
  if (!res || !res.success) {
    return [];
  }
  return res.datas ?? [];
};

export type QueryGeoAndAttrCountParams = QueryGeoAndAttrsCountParams;
/** 获取图属数量 */
export const queryGeoAndAttrCount = async (params: QueryGeoAndAttrCountParams): Promise<number> => {
  const res = await queryGeoConut.fetch(params);
  if (!res || !res.success) {
    return 0;
  }
  return res.datas.count || 0;
};

export type QueryGeoAndAttrByIdParams = QueryByIdParams;
/** 获取图属信息 */
export const queryGeoAndAttrById = async (params: QueryByIdParams): Promise<Record<string, any> | undefined> => {
  const res = await queryById.fetch(params);
  if (!res || !res.success) {
    return undefined;
  }
  return res.datas;
};

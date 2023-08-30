import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';
import type { CompanyInfo, RegionInfo } from '@/types';

export type QueryCompanyListParams = {
  /** 单位编号 初始加载时传递用户所属政区 */
  dwCode?: string;
  /** 上级单位编号 */
  pid?: string;
};

/** 获取公司/单位列表 */
export const queryCompanyList = async (params: QueryCompanyListParams) => {
  const res = await appRequest.post<ApiRes<CompanyInfo[]>>(`/lazy/dict/dw`, {
    data: params,
  });
  if (res && res.success) {
    return res.datas;
  }
  return [];
};

/** 政区字典树形列表 */
export const getChildrenRegionList = async (data: any) => {
  const res = await appRequest.post<ApiRes<RegionInfo[]>>(`/lazy/dict/zq`, {
    data,
  });
  if (res && res.success) {
    return res.datas;
  }
  return [];
};

import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';
import type { GetTbxxTjParams, GetTbxxUpInfoParams } from './types';

/** 填报信息 获取上次填报信息 */
export const getTbxxUpInfo = async (data: GetTbxxUpInfoParams) => {
  return appRequest.post<ApiRes<any>>('/xxtb/getUpInfo', {
    data,
  });
};

/** 填报信息 获取资源汇总统计 */
export const getTbxxTj = async (data: GetTbxxTjParams) => {
  return appRequest.post<ApiRes<any>>('/xxtb/tj', {
    data,
  });
};

import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';
import type { ThyzAddParams, ThyzEditParams, ThyzSearchParams, ThyzSearchRes } from './types';

/** 因子 添加 */
export const thyzAdd = async (data: ThyzAddParams) => {
  return appRequest.post<ApiRes<boolean>>('/tjyz/add', {
    data,
  });
};

/** 因子 查询 */
export const thyzSearch = async (data: ThyzSearchParams) => {
  return appRequest.post<ApiRes<ThyzSearchRes[]>>('/tjyz/search', {
    data,
  });
};

/** 因子 修改 */
export const thyzEdit = async (data: ThyzEditParams) => {
  return appRequest.post<ApiRes<boolean>>('/tjyz/edit', {
    data,
  });
};

import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';

/**
 * shape导入接口
 */
export const shapeImport = async (data: FormData) => {
  return appRequest.post<ApiRes<any>>('/shp/impDataToLayer', {
    data,
  });
};

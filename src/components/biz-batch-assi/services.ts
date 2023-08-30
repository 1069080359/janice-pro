import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';

export type BizBatchAssiParams = {
  tableName: string;
  fields: { key: string; value: string | number }[];
  ids?: (string | number)[];
  filterCondition?: string;
};

export const batchAssi = async (params: BizBatchAssiParams) => {
  return appRequest.post<ApiRes<number>>(`/attribute/batchUpdate`, {
    data: params,
  });
};

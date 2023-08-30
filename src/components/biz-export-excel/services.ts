import { ApiRes } from '@mapzone/types';
import { excelExcelProps } from './types';
import { appRequest } from '@mapzone/request';

export const excelExport = (data: excelExcelProps) => {
  return appRequest.post<ApiRes<any>>(`/excel/export`, {
    data: data,
  });
};

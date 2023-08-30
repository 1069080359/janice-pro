import { message } from 'antd';
import { saveAs } from 'file-saver';
import { formdataify } from '@/utils';
import { getSessionStorageItem, paramEncryption, setSessionStorageItem } from '@mapzone/utils';
import {
  commonGetMetadataInfo,
  commonFindByPaging,
  commonCount,
  commonDeleteByIds,
  commonAdd,
  commonUpdateById,
} from '@mapzone/map-services';
import { appRequest } from '@mapzone/request';
import type {
  CommonCountParams,
  CommonFindByPagingParams,
  CommonDeleteByIdsParams,
  CommonAddParams,
  CommonDataKey,
} from '@mapzone/map-services';
import type { BizMetadataItem, DictOptionItem } from '@/types';
import type { ApiRes, DefaultDbFieldInfo } from '@mapzone/types';
import type { ExcelImportProps } from './types';

/** 获取元数据 */
export const queryMetadataList = async (dataName: string): Promise<BizMetadataItem[]> => {
  // 获取图层配置的元数据
  const res = await commonGetMetadataInfo(dataName);
  if (!res || !res.success) {
    console.error(`${dataName} 获取元数据错误：${res?.msg}`);
    return [];
  }
  const metadataList = res.datas || [];
  return metadataList.sort((a, b) => a.fieldId - b.fieldId);
};

export type QueryDataListParams = CommonFindByPagingParams;
/** 获取分页数据 */
export const queryDataList = async <T = Record<string, any>>(params: QueryDataListParams) => {
  const res = await commonFindByPaging<T>(params);
  let dataList: T[] = [];
  if (res && res.success) {
    dataList = res.datas;
  }
  return dataList;
};

export type QueryConutParams = CommonCountParams;
/** 获取分页数量 */
export const queryConut = async (params: QueryConutParams) => {
  const countRes = await commonCount(params);
  let total = 0;
  if (countRes && countRes.success) {
    total = countRes.datas || 0;
  }
  return total;
};

/** 根据id数组，删除数据 */
export const deleteByIds = async (params: CommonDeleteByIdsParams) => {
  const res = await commonDeleteByIds(params);
  if (res && res.success) {
    return true;
  }
  return false;
};

/** 根据字典域，获取字典 */
export const queryDictOptionList = async (domainName: string) => {
  const res = await appRequest.post<ApiRes<DictOptionItem[]>>(`/zl/common/getDictionary`, {
    data: paramEncryption({ c_domainname: domainName }),
  });
  if (res && res.success) {
    return res.datas;
  }
  return [];
};

/** 元数据表格 添加或新增 */
export const insertOrUpdateRecord = async (params: CommonAddParams, isAdd: boolean) => {
  let res: ApiRes<CommonDataKey>;
  if (isAdd) {
    res = await commonAdd(params);
  } else {
    res = await commonUpdateById(params);
  }
  return res;
};

type CommonExportParams = {
  tableName: string;
  filter?: string;
};

/** 元数据表格 添加或新增 */
export const commonExport = async (params: CommonExportParams) => {
  await appRequest
    .post('/excel/export', {
      data: params,
      responseType: 'blob',
      getResponse: true,
      customPreventCatchResponseInterceptor: true,
    })
    .then(({ data, response }) => {
      if (!data.type.includes('application/json')) {
        const content = response.headers.get('content-disposition');
        let fileName = (content && content.split(`filename`)[1]) || '';
        fileName = decodeURIComponent(fileName);
        if (fileName.indexOf(`utf-8`) > -1) {
          fileName = fileName.substring(`*=utf-8''`.length);
        } else {
          fileName = fileName.substring(1);
        }
        saveAs(data, fileName);
      } else {
        response.json().then((res) => {
          // 当错误数据导致问题时没有错误提示 需要扩展提示 待提供话术
          message.error(res.msg || '数据导出失败。');
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getSystemFields = async (): Promise<string[]> => {
  const cacheKey = '-systemFields';
  const cacheValue = getSessionStorageItem(cacheKey);
  if (cacheValue) {
    return JSON.parse(cacheValue);
  }
  const res = await appRequest
    .get<ApiRes<DefaultDbFieldInfo[]>>('/data/metadata/queryDefaultDbFields', {
      cache: 'default',
    })
    .catch(() => undefined);
  if (res && res.success) {
    const systemFields = res.datas.map((field) => field.name);
    setSessionStorageItem(cacheKey, JSON.stringify(systemFields));
  }
  return [];
};

/** EXCEL导入 */
export const excelImport = (data: ExcelImportProps) => {
  return appRequest.post<ApiRes<any>>(`/excel/import`, {
    requestType: 'form',
    data: formdataify(data),
  });
};

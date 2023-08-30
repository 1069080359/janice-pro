import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';
import type { TCloudLayer, TMyLayer } from '../types';

type CloudLayerListData = {
  list: TCloudLayer[];
  totalSpace: string;
  usedSpace: string;
};

/**
 * 获取云图层列表
 * @returns
 */
export const getCloudLayerList = async () => {
  return appRequest.post<ApiRes<CloudLayerListData>>('/userOwnedDataCloud/getList.do');
};

/**
 * 添加云图层
 * @returns
 */
export const addCloudLayer = async (data: FormData) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataCloud/upload.do', {
    data,
  });
};

/**
 * 删除云图层
 * @returns
 */
export const deleteCloudLayer = async (data: { id: number }) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataCloud/delete.do', {
    data,
  });
};

/**
 * 下载我的云图层数据
 * @returns
 */
export const downloadCloudLayerData = async (data: { cloudId: number; type: 1 | 2 }) => {
  return appRequest.post<Blob>('/userOwnedDataCloud/download.do', {
    data,
    responseType: 'blob',
  });
};

/**
 * 更新我的云图层数据-图层样式
 * @returns
 */
export const updateCloudLayerStyle = async (data: { cloudId: number; style: Record<string, any> }) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataCloud/updateStyle.do', {
    data,
  });
};

/**
 * 查询我的数据
 * @returns
 */
export const getMyLayerList = async () => {
  return appRequest.post<ApiRes<TMyLayer[]>>('/userOwnedDataInApp/getList.do');
};

/**
 * 新增我的数据
 * @returns
 */
export const addMyLayer = async (data: { cloudIds: (number | string)[] }) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataInApp/add.do', {
    data,
  });
};

/**
 * 删除我的数据
 * @returns
 */
export const deleteMyLayer = async (data: { id: number }) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataInApp/delete.do', {
    data,
  });
};

/**
 * 更新我的数据(更新排序)
 * @returns
 */
export const updateMyLayerOrder = async (data: { nodes: { id: number; order: number }[] }) => {
  return appRequest.post<ApiRes<any>>('/userOwnedDataInApp/updateOrder.do', {
    data,
  });
};

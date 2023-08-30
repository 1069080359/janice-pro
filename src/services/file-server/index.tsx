import saveAs from 'file-saver';
import { formdataify, getWebAppConfig } from '@/utils';
import { request } from '@mapzone/request';
import { message } from 'antd';
import type { ImguploadFileServletParams } from './types';
export * from './types';

/** 删除 file  */
export const delFileServlet = async (filePkUid: string) => {
  const { serviceSettings } = getWebAppConfig();
  const formData = new FormData();
  formData.append('PK_UID', filePkUid);
  const url = `${serviceSettings.fileServer.url}/newUpload/delFileServlet`;
  return request(url, {
    method: 'POST',
    requestType: 'form',
    data: formData,
  });
};

/**
 * 图片 上传
 */
export const imguploadFileServlet = async (params: ImguploadFileServletParams) => {
  const { serviceSettings } = getWebAppConfig();
  const url = `${serviceSettings.fileServer.url}/newImgfile/imgupload.do`;
  const data = {
    ...params,
    tableName: 'LYJY',
  };
  return request(url, {
    method: 'POST',
    requestType: 'form',
    data: formdataify(data),
  });
};

/**
 * 文件 上传
 */
export const uploadFileServlet = async (params: ImguploadFileServletParams) => {
  const { serviceSettings } = getWebAppConfig();
  const url = `${serviceSettings.fileServer.url}/newUpload/uploader`;
  const data = {
    ...params,
    tableName: 'LYJY',
  };
  return request(url, {
    method: 'POST',
    requestType: 'form',
    data: formdataify(data),
  });
};

/** 文件 上传后 预览 操作 */
export const uploadPreview = (path: string, esName: string, chName: string) => {
  const { serviceSettings } = getWebAppConfig();
  const params = {
    filePath: `${path}/${esName}`,
    fileName: chName,
  };
  const url = `${serviceSettings.fileServer.url}/newUpload/fileDownLoadServlet`;
  request(url, {
    method: 'POST',
    requestType: 'form',
    data: params,
    responseType: 'blob',
    getResponse: true,
  })
    .then(({ data }) => {
      if (data.size === 0) {
        return message.error('文件不存在！');
      }
      saveAs(data, chName);
    })
    .catch((error) => {
      console.error(error);
    });
};

import { getAppConfig } from '@mapzone/utils';
import type { FileItem, PreviewType } from './types';

/** pdf 下载地址不是这个，只是为了将样式修改，增加的 url 拼接 */
export const downloadFileUrl = () => {
  const url = (getAppConfig() || {}).proxyFileServerUrl;
  return `${url}/newUpload/fileDownLoadServlet`;
};

/** 预览图 */
const defaultFileThumbUrl = () => {
  const url = (getAppConfig() || {}).proxyFileServerUrl;
  return `${url}/upload-img/thumb`;
};
/** 原图 */
const defaultFileOriginalUrl = () => {
  const url = (getAppConfig() || {}).proxyFileServerUrl;
  return `${url}/upload-img/original`;
};

/**
 * 图片预览
 * @param {string} adjunctName 图片名称
 * @param {string} adjunctPath 图片前缀
 * @param {PreviewType} previewType 预览类型 thumb 预览缩略图，original 原图
 * @returns {string} 完整路径，默认 原路径(文件预览原路径)
 */
export const getPicturePreviewPath = (adjunctName: string, adjunctPath?: string, previewType: PreviewType = 'original') => {
  const url = `${adjunctPath ? `/${adjunctPath}/` : ''}${adjunctName}`;
  const pathUrl: Record<PreviewType, string> = {
    thumb: `${defaultFileThumbUrl()}${url}`, // 预览图 路径
    original: `${defaultFileOriginalUrl()}${url}`, // 原图 路径
  };
  return pathUrl[previewType];
};

/** 组装 上传后回显预览的 files list */
export const getPrviewFiles = (fileList: FileItem[]) => {
  const files = fileList.map((i) => {
    const originalUrl = getPicturePreviewPath(i.ADJUNCT_PATH);
    const thumbUrl = getPicturePreviewPath(i.ADJUNCT_PATH, undefined, 'thumb');
    return {
      uid: String(i.PK_UID),
      name: i.FILE_NAME,
      url: originalUrl,
      thumbUrl,
      ADJUNCT_PATH: i.ADJUNCT_PATH,
      PK_UID: String(i.PK_UID),
    };
  });
  return files;
};

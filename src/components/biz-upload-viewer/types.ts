import type { ReactElement } from 'react';
import type { UploadFile, UploadProps } from 'antd';
import type { GetPreviewAttribute } from '@mapzone/hooks';

export type UploadAction = {
  download?: () => void;
  preview: () => void;
  remove?: () => void;
};

export type ItemRenderProps = {
  originNode: ReactElement;
  file: UploadFile;
  fileList: UploadFile[];
  actions: UploadAction;
  type: 'FsImgFile' | 'upload';
  status: 'done';
  getPreviewAttribute: GetPreviewAttribute;
};

export type BizUploadViewerProps = UploadProps;

export type PreviewType = 'thumb' | 'original';

export type FileItem = {
  PK_UID: number;
  FILE_NAME: string;
  ADJUNCT_PATH: string;
  MAIN_BODY_GUID: string;
};

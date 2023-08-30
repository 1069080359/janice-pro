import { ActionType } from '@mapzone/types';
import type { UploadFile, UploadProps } from 'antd';
import { MutableRefObject } from 'react';
export type ItemRenderProps = {
  file: UploadFile;
  fileList: UploadFile[];
};

type otherUploadButtonProps = {
  dataName: string;
  inStorage?: boolean;
  tableRef?: MutableRefObject<ActionType | undefined>;
};

export type BizUploadButtonProps = UploadProps & otherUploadButtonProps;

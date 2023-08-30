import type { UploadFile } from 'antd';

export type ImguploadFileServletParams = { mzguid: string; file: Blob | string };

export type BizUploadFile = UploadFile &
  File & {
    ADJUNCT_NAME: string;
    ADJUNCT_PATH: string;
    PK_UID: string;
  };

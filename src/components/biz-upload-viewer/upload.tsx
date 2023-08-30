import React from 'react';
import { Upload } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { UploadProps } from 'antd';

export const uploadAccept = '.png,.jpg,.jpeg,.PNG,.JPG,.JPEG';

/** 定制 上传组件
 * 默认 上传 图片类型，可传入 props 覆盖
 */
const BizUpload: FsFC<UploadProps> = (props) => {
  const uploadConfig: UploadProps = {
    name: 'file',
    listType: 'picture-card',
    multiple: false,
    accept: uploadAccept,
    ...props,
  };

  return <Upload {...uploadConfig} />;
};

export default BizUpload;

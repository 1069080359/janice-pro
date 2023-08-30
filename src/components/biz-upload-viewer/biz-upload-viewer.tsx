import React from 'react';
import { useViewer } from '@mapzone/hooks';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { uploadPreview } from '@/services';
import BizUpload from './upload';
import type { UploadFile, UploadProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { BizUploadFile } from '@/services';
import type { BizUploadViewerProps, ItemRenderProps } from './types';

/**
 * 图片、文件 上传组件
 * 上传后 渲染上传内容
 * listType 如果是 text 则是 文件上传形式(如PDF)，不传则是 图片上传形式
 */
export const renderUploadFileItem = (originNode: React.ReactElement, file: UploadFile) => {
  const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
  return <div>{file.status === 'error' ? errorNode : originNode}</div>;
};

const renderImageItemRender = ({ originNode, file, actions, getPreviewAttribute, status, type }: ItemRenderProps) => {
  if (status === 'done' && (type === 'FsImgFile' || type === 'upload')) {
    return (
      <div className="ant-upload-list-item">
        <div className="ant-upload-list-item-info">
          <span className="ant-upload-span">
            <a className="ant-upload-list-item-thumbnail" href={file.url} target="_blank" rel="noopener noreferrer">
              <img
                {...getPreviewAttribute({
                  file: { url: file.url, thumbUrl: file.thumbUrl },
                  attribute: ['alt', 'src', 'data-original'],
                })}
                className="ant-upload-list-item-image"
              />
            </a>
          </span>
        </div>
        <span className="ant-upload-list-item-actions">
          {actions.preview && <Button size="small" onClick={actions.preview} type="text" icon={<EyeOutlined />} />}
          {actions.remove && <Button size="small" onClick={actions.remove} type="text" icon={<DeleteOutlined />} />}
        </span>
      </div>
    );
  }
  return originNode;
};

const BizUploadViewer: FsFC<BizUploadViewerProps> = (props) => {
  const { Viewer, onPreview: onUploadPreview, getPreviewAttribute } = useViewer();
  const onPreview: UploadProps['onPreview'] = (...argus) => {
    const previewIndex = (props.fileList || []).findIndex((value) => value.uid === argus[0]?.uid);
    onUploadPreview(previewIndex);
  };
  // 图片上传
  const imageProps: UploadProps = {
    onPreview,
    ...props,
    itemRender: (originNode, file, fileList, actions) =>
      renderImageItemRender({ originNode, file, fileList, actions, getPreviewAttribute, status: 'done', type: 'FsImgFile' }),
  };
  // 文件上传
  const fileProps: UploadProps = {
    ...props,
    onPreview: (file: UploadFile) => {
      const newFile = file as BizUploadFile;
      if (newFile.ADJUNCT_NAME && newFile.ADJUNCT_NAME.length > 0) {
        return uploadPreview(newFile.ADJUNCT_PATH, newFile.ADJUNCT_NAME, newFile.name);
      }
    },
    itemRender: (originNode: React.ReactElement, file: UploadFile) => renderUploadFileItem(originNode, file),
  };
  const internalUploadProps = props.listType === 'text' ? fileProps : imageProps;
  return (
    <Viewer>
      <BizUpload {...internalUploadProps}>
        {props.listType === 'text' ? <Button icon={<UploadOutlined />}>上传文件</Button> : <PlusOutlined />}
      </BizUpload>
    </Viewer>
  );
};

export default BizUploadViewer;

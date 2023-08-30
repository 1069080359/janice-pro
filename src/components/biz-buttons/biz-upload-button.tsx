import classNames from 'classnames';
import { UploadOutlined } from '@ant-design/icons';
import { BizAuthButton } from './biz-auth-button';
import type { FsFC } from '@mapzone/types';
import type { BizAuthButtonProps } from './biz-auth-button';

/** 上传按钮 */
export const BizUploadButton: FsFC<BizAuthButtonProps> = (props) => {
  const { className, ...restProps } = props;
  return <BizAuthButton icon={<UploadOutlined />} className={classNames('biz-upload-button', className)} {...restProps} />;
};

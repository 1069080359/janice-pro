import classNames from 'classnames';
import { AuditOutlined } from '@ant-design/icons';
import { BizAuthButton } from './biz-auth-button';
import type { FsFC } from '@mapzone/types';
import type { BizAuthButtonProps } from './biz-auth-button';

/** 审核按钮 */
export const BizAuditButton: FsFC<BizAuthButtonProps> = (props) => {
  const { className, ...restProps } = props;
  return <BizAuthButton icon={<AuditOutlined />} className={classNames('biz-audit-button', className)} {...restProps} />;
};

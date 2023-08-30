import { Button } from 'antd';
import { ButtonProps } from 'antd/es/button';
import { isAuth } from '@mapzone/utils';
import type { FsFC } from '@mapzone/types';

export type BizAuthButtonProps = ButtonProps & {
  /** 按钮权限 */
  permission?: string;
};

/**
 * 权限按钮
 */
export const BizAuthButton: FsFC<BizAuthButtonProps> = (props) => {
  const { permission = '', ...restProps } = props;

  if (permission && !isAuth(permission)) {
    return null;
  }
  return <Button {...restProps} />;
};

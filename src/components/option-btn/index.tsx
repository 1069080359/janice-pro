import { isAuth } from '@mapzone/utils';
import classNames from 'classnames';
import type { DetailedHTMLProps, ReactNode } from 'react';
import type { FsFC } from '@mapzone/types';
import './index.less';

export type OptionBtnProps = DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  icon: ReactNode;
  btnText: string;
  disabled?: boolean;
  /** 按钮权限 */
  permission?: string;
};

/** 按钮 */
export const OptionBtn: FsFC<OptionBtnProps> = (props) => {
  const { icon, btnText, className, permission, disabled, onClick, ...restProps } = props;

  const onInternalClick = (e: any) => {
    if (disabled || !onClick) {
      return;
    }
    onClick(e);
  };

  if (permission && !isAuth(permission)) {
    return null;
  }

  return (
    <div className={classNames('option-item', { disabled }, className)} onClick={onInternalClick} {...restProps}>
      {icon}
      <span>{btnText}</span>
    </div>
  );
};

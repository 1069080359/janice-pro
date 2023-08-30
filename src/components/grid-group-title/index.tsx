import React from 'react';
import classNames from 'classnames';
import type { FsFC } from '@mapzone/types';
import './index.less';

const prefixCls = 'grid-group';

type GridGroupTitleProps = {
  type?: 'group' | 'card';
  title: string;
  className?: string;
  mt?: boolean;
  mb?: boolean;
};

const GridGroupTitle: FsFC<GridGroupTitleProps> = (props) => {
  const { type = 'card', title, className, mt = true, mb = true } = props;
  return (
    <div
      className={classNames(className, prefixCls, `${prefixCls}-${type}`, {
        [`${prefixCls}-${type}-margin-top`]: mt,
        [`${prefixCls}-${type}-margin-bottom`]: mb,
      })}
    >
      <div className={`${prefixCls}-title`}>
        {type === 'card' && <div className={`${prefixCls}-title-icon`} />}
        {title}
      </div>
    </div>
  );
};

export { GridGroupTitle };

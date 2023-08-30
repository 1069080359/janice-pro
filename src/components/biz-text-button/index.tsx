import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import type { ButtonProps } from 'antd';
import type { FsFC } from '@mapzone/types';

const BizTextButton: FsFC<ButtonProps> = (props) => {
  return <Button size="small" type="text" {...props} className={classNames('mz-text-button', props.className)} />;
};

export { BizTextButton };

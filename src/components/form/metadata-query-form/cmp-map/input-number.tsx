import { InputNumber } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { InputNumberProps } from 'antd';
import type { BaseCmpProps } from './types';

export type BizInputNumberProps = BaseCmpProps & InputNumberProps;

export const BizInputNumber: FsFC<BizInputNumberProps> = (props) => {
  const { range } = props;

  if (range) {
  }

  return <InputNumber {...props} />;
};

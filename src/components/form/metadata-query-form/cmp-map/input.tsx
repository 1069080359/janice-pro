import { Input } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { InputProps } from 'antd';

export type BizInputProps = InputProps;

export const BizInput: FsFC<BizInputProps> = (props) => {
  return <Input allowClear {...props} />;
};

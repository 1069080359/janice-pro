import { Cascader } from 'antd';
import { useFieldFetchData } from './hooks';
import type { FsFC } from '@mapzone/types';
import type { CascaderProps } from 'antd';
import type { BizFieldProps } from './types';

export type BizCascaderProps = BizFieldProps & CascaderProps;

export const BizCascader: FsFC<BizCascaderProps> = (props) => {
  const { request, fieldKey, options, ...restProps } = props;
  const [loading, reqOptions] = useFieldFetchData({ request, fieldKey });

  return <Cascader allowClear loading={loading} options={options || reqOptions} {...restProps} />;
};

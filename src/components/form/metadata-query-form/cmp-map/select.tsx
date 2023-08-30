import { Select } from 'antd';
import { useFieldFetchData } from './hooks';
import type { FsFC } from '@mapzone/types';
import type { SelectProps } from 'antd';
import type { BizFieldProps } from './types';

export type BizSelectProps = BizFieldProps & SelectProps;

export const BizSelect: FsFC<BizSelectProps> = (props) => {
  const { request, fieldKey, options, ...restProps } = props;
  const [loading, reqOptions] = useFieldFetchData({ request, fieldKey });

  return <Select dropdownMatchSelectWidth={false} allowClear loading={loading} options={options || reqOptions} {...restProps} />;
};

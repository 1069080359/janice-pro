import { Checkbox } from 'antd';
import { useFieldFetchData } from './hooks';
import type { FsFC } from '@mapzone/types';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import type { BizFieldProps } from './types';

export type BizCheckboxProps = BizFieldProps & CheckboxGroupProps;

export const BizCheckbox: FsFC<BizCheckboxProps> = (props) => {
  const { request, fieldKey, options, ...restProps } = props;
  const [, reqOptions] = useFieldFetchData({ request, fieldKey });

  return <Checkbox.Group options={options || reqOptions} {...restProps} />;
};

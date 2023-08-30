import { Radio } from 'antd';
import { useFieldFetchData } from './hooks';
import type { FsFC } from '@mapzone/types';
import type { RadioGroupProps } from 'antd/es/radio';
import type { BizFieldProps } from './types';

export type BizRadioProps = BizFieldProps & RadioGroupProps;

export const BizRadio: FsFC<BizRadioProps> = (props) => {
  const { request, fieldKey, options, ...restProps } = props;
  const [, reqOptions] = useFieldFetchData({ request, fieldKey });

  return <Radio.Group options={options || reqOptions} {...restProps} />;
};

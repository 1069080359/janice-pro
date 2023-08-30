import { DatePicker } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { DatePickerProps } from 'antd';

export type BizDatePickerProps = Omit<DatePickerProps, 'onChange'> & { showTime?: boolean; onChange: (value: string) => void };

export const BizDatePicker: FsFC<BizDatePickerProps> = (props) => {
  const { onChange } = props;
  const showTime = props.showTime ? { format: 'HH:mm' } : false;

  return <DatePicker allowClear {...props} showTime={showTime} onChange={(_, valueStr) => onChange(valueStr)} />;
};

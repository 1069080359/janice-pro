import { DatePicker } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;

export type BizDateRangePickerProps = Omit<RangePickerProps, 'onChange'> & { showTime?: boolean; onChange: (values: string[]) => void };

export const BizDateRangePicker: FsFC<BizDateRangePickerProps> = (props) => {
  const { onChange } = props;
  const showTime = props.showTime ? { format: 'HH:mm' } : false;

  return <RangePicker allowClear {...props} showTime={showTime} onChange={(_, valueStrs) => onChange(valueStrs)} />;
};

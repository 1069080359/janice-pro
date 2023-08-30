import { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import type { DatePickerProps } from 'antd/lib/date-picker';
import type { FsFC } from '@mapzone/types';
import type { Moment } from 'moment';
import type { RendererProps } from '../types';

const InternalDatePicker: any = DatePicker;

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const getFormatByType = (type: string) => {
  switch (type) {
    case 'dateTimePicker':
      return DATETIME_FORMAT;
    case 'yearPicker':
      return 'YYYY';
    case 'monthPicker':
      return 'YYYY-MM';
    default:
      return DATE_FORMAT;
  }
};

const getPickerType = (type: string): Required<DatePickerProps>['picker'] => {
  switch (type) {
    case 'yearPicker':
      return 'year';
    case 'monthPicker':
      return 'month';
    default:
      return 'date';
  }
};

const RenderDate: FsFC<RendererProps> = (props) => {
  const { onChange, type, disabled, data } = props;
  const { otherData } = data;
  const [value, setValue] = useState<Moment | undefined>(otherData?.value ? moment(otherData.value) : undefined);

  const format = getFormatByType(type);
  const showTime = 'dateTimePicker' === type;
  const picker = getPickerType(type);

  const innerOnChange = (_: Moment, dateString: string) => {
    setValue(_);
    // if (year.includes(dataType)) {
    //   onChange(+dateString);
    //   return;
    // }
    onChange(dateString);
  };

  useEffect(() => {
    if (!otherData) {
      setValue(undefined);
    }
  }, [otherData]);

  const datePickerProps = {
    placeholder: '请选择值',
    disabled: disabled,
    value: value,
    onChange: innerOnChange,
  };

  return <InternalDatePicker showTime={showTime} picker={picker} {...datePickerProps} format={format} {...datePickerProps} />;
};
export default RenderDate;

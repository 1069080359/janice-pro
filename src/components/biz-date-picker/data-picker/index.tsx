import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import classNames from 'classnames';
import type { DatePickerProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import './styles.less';

export type BizDatePickerProps = Omit<DatePickerProps, 'onChange'> & {
  pickerType?: string;
  onChange?: (value: string) => void;
};

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

const getPickerType = (dataType: string): Required<DatePickerProps>['picker'] => {
  switch (dataType) {
    case 'yearPicker':
      return 'year';
    case 'monthPicker':
      return 'month';
    default:
      return 'date';
  }
};

export const BizDatePicker: FsFC<BizDatePickerProps> = (props) => {
  const { className, value, onChange, pickerType = 'datePicker', ...restProps } = props;

  const format = getFormatByType(pickerType);
  const showTime = 'dateTimePicker' === pickerType;
  const picker = getPickerType(pickerType);

  const internalOnChange = (valueStr: string) => {
    if (onChange) {
      onChange(valueStr);
    }
  };

  return (
    <DatePicker
      value={value ? moment(value, format) : null}
      showTime={showTime}
      picker={picker}
      format={format}
      onChange={(_v, valueStr) => internalOnChange(valueStr)}
      {...restProps}
      className={classNames(className, 'mz-date-picker')}
    />
  );
};

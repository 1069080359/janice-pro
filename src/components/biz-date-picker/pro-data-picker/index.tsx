import { ProFormDatePicker } from '@ant-design/pro-components';
import moment from 'moment';
import classNames from 'classnames';
import type { DatePickerProps } from 'antd';
import type { ProFormFieldProps } from '@ant-design/pro-components';
import type { FsFC } from '@mapzone/types';
import './styles.less';

export type BizProDatePickerProps = Omit<ProFormFieldProps<DatePickerProps>, 'onChange'> & {
  value?: string;
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

export const BizProDatePicker: FsFC<BizProDatePickerProps> = (props) => {
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
    <ProFormDatePicker
      // @ts-ignore
      value={value ? moment(value, format) : null}
      showTime={showTime}
      picker={picker}
      format={format}
      onChange={(_v: any, valueStr: string) => internalOnChange(valueStr)}
      {...restProps}
      className={classNames(className, 'mz-pro-date-picker')}
    />
  );
};

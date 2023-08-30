import React, { useEffect, useMemo, useState } from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';
import FieldLabel from './field-label';
import type { DatePickerProps } from 'antd';
import type { FsFC, AttrFilterConditionItem, AttrFilterConditionSymbol } from '@mapzone/types';
import type { RenderDateProps } from '../types';

const DatePickers: any = DatePicker;
const { RangePicker } = DatePickers;
const InternalDataPicker: any = DatePickers;
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

const RenderDate: FsFC<RenderDateProps> = (props) => {
  const { data, onChange, getFieldSymbol } = props;
  const { metadataItem } = data;
  const { type, fieldAliasName } = metadataItem;
  const [symbol, setSymbol] = useState<AttrFilterConditionSymbol>(data.otherData?.symbol || '=');
  const [before, setBefore] = useState<AttrFilterConditionItem['before']>(data.otherData?.before);
  const [after, setAfter] = useState<AttrFilterConditionItem['after']>(data.otherData?.after);

  const options = useMemo(() => getFieldSymbol(metadataItem), [getFieldSymbol, metadataItem]);

  const format = getFormatByType(type);
  const showTime = 'dateTimePicker' === type;
  const picker = getPickerType(type);

  const onSymbolChange = (v: AttrFilterConditionSymbol) => {
    setSymbol(v);
    const otherData = {
      symbol: v,
    };
    const newData = { ...data, otherData };
    onChange(newData);
  };

  const dateChange = (value: string[]) => {
    setBefore(value[0]);
    setAfter(value[1]);
    const otherData = {
      symbol,
      before: value[0],
      after: value[1],
    };
    const newData = { ...data, otherData };
    onChange(newData);
  };

  useEffect(() => {
    if (!symbol && options.length > 0) {
      setSymbol(options[0].value);
    }
  }, [options, symbol]);

  return (
    <div className="select-item">
      <FieldLabel className="select-item-label" label={fieldAliasName} />
      <div className="list-item">
        <Select className="symbol-select" onChange={onSymbolChange} value={symbol} options={options} />
        {symbol === 'and' ? (
          <RangePicker
            className="item"
            showTime={showTime}
            picker={picker}
            value={after && before ? [moment(before, format), moment(after, format)] : undefined}
            format={format}
            onChange={(_: any, dateString: [string, string]) => dateChange(dateString)}
          />
        ) : (
          <InternalDataPicker
            className="item"
            showTime={showTime}
            picker={picker}
            format={format}
            value={after ? moment(after, format) : undefined}
            onChange={(_: any, dateString: string) => dateChange(['', dateString])}
          />
        )}
      </div>
    </div>
  );
};

export default RenderDate;

import { useEffect, useState } from 'react';
import { Input, InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import './index.less';

export type BizInputNumberRangeProps = Omit<InputNumberProps, 'value' | 'onChange'> & {
  value?: string[];
  onChange?: (value: (number | string | null)[]) => void;
};

export const BizInputNumberRange: FsFC<BizInputNumberRangeProps> = (props) => {
  const { value, onChange, ...restProps } = props;
  const [minValue, setMinValue] = useState<number | string | null>(null);
  const [maxValue, setMaxValue] = useState<number | string | null>(null);

  const onInternalChange = (values: (number | string | null)[]) => {
    if (!onChange) {
      return;
    }
    onChange(values);
  };

  const onMinChange: InputNumberProps['onChange'] = (newValue) => {
    setMinValue(newValue);
    const values = [newValue, maxValue];
    onInternalChange(values);
  };

  const onMaxChange: InputNumberProps['onChange'] = (newValue) => {
    setMaxValue(newValue);
    const values = [minValue, newValue];
    onInternalChange(values);
  };

  useEffect(() => {
    if (value) {
      setMinValue(value[0]);
      setMaxValue(value[1]);
    } else {
      setMinValue('');
      setMaxValue('');
    }

    return () => {
      setMinValue('');
      setMaxValue('');
    };
  }, [value]);

  return (
    <Input.Group compact className="biz-input-number-range">
      <InputNumber value={minValue} onChange={onMinChange} {...restProps} />
      <Input className="range-input-split" placeholder="~" disabled />

      <InputNumber value={maxValue} onChange={onMaxChange} {...restProps} />
    </Input.Group>
  );
};

/**
 * 渲染文本
 */
import React, { useEffect, useState } from 'react';
import { Input, InputNumber } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { RendererProps } from '../types';

const placeholder = '请输入值';

const RenderInput: FsFC<RendererProps> = (props) => {
  const { type, onChange, disabled, data } = props;
  const { otherData } = data;
  const [internalValue, setInternalValue] = useState<string | number | undefined>(otherData?.value);

  const onBlur = () => {
    if (typeof internalValue === 'number') {
      const formatValue = Math.floor(internalValue * 10000) / 10000;
      setInternalValue(formatValue);
      onChange(formatValue);
    }
  };

  const innerOnChange = (value: string | number | null) => {
    setInternalValue(value || undefined);
    onChange(value || '');
  };

  useEffect(() => {
    if (!otherData) {
      setInternalValue(undefined);
    }
  }, [otherData]);

  if (type === 'inputNumber') {
    return <InputNumber disabled={disabled} value={internalValue} placeholder={placeholder} onChange={innerOnChange} controls={false} />;
  }

  if (type === 'textArea') {
    return (
      <Input.TextArea
        disabled={disabled}
        value={internalValue}
        placeholder={placeholder}
        onChange={(e) => innerOnChange(e.target.value)}
        onBlur={onBlur}
      />
    );
  }

  return (
    <Input disabled={disabled} placeholder={placeholder} value={internalValue} onChange={(e) => innerOnChange(e.currentTarget.value)} />
  );
};
export default RenderInput;

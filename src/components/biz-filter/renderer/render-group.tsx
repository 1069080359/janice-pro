import React, { useEffect, useMemo, useState } from 'react';
import { Select, Input, InputNumber } from 'antd';
import FieldLabel from './field-label';
import type { FsFC, AttrFilterConditionItem, AttrFilterConditionSymbol } from '@mapzone/types';
import type { RenderGroupProps } from '../types';

const RenderGroup: FsFC<RenderGroupProps> = (props) => {
  const { data, onChange, getFieldSymbol } = props;
  const { metadataItem } = data;
  const { fieldAliasName } = metadataItem;
  const [symbol, setSymbol] = useState<AttrFilterConditionSymbol>(data.otherData?.symbol || '=');
  const [before, setBefore] = useState<AttrFilterConditionItem['before']>(data.otherData?.before);
  const [after, setAfter] = useState<AttrFilterConditionItem['after']>(data.otherData?.after);

  const options = useMemo(() => getFieldSymbol(metadataItem), [getFieldSymbol, metadataItem]);

  const onSymbolChange = (v: AttrFilterConditionSymbol) => {
    setSymbol(v);
    const otherData = {
      ...data.otherData,
      symbol: v,
    };
    const newData = { ...data, otherData };
    onChange(newData);
  };

  const internalOnChange = (nValue: string = '', type: 'after' | 'before') => {
    const otherData = {
      symbol,
      before,
      after,
    };
    if (type === 'after') {
      setAfter(nValue);
      otherData.after = nValue;
    } else {
      setBefore(nValue);
      otherData.before = nValue;
    }
    const newData = { ...data, otherData };
    onChange(newData);
  };

  useEffect(() => {
    if (!symbol && options.length > 0) {
      setSymbol(options[0].value);
    }
  }, [options, symbol]);

  useEffect(() => {
    if (!data?.otherData) {
      setBefore(undefined);
      setAfter(undefined);
    }
  }, [data?.otherData]);

  if (metadataItem.type === 'inputNumber') {
    return (
      <div className="select-item">
        <FieldLabel className="select-item-label" label={fieldAliasName} />
        <div className="list-item">
          {symbol === 'and' ? (
            <InputNumber
              className="item item-symbol-mr6px"
              value={before}
              placeholder={`请输入${data.label}`}
              onChange={(value) => internalOnChange(`${value || ''}`, 'before')}
            />
          ) : null}
          <Select className="symbol-select" onChange={onSymbolChange} options={options} value={symbol} />
          <InputNumber
            className="item"
            value={after}
            placeholder={`请输入${data.label}`}
            onChange={(value) => internalOnChange(`${value || ''}`, 'after')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="select-item">
      <FieldLabel className="select-item-label" label={fieldAliasName} />
      <div className="list-item">
        {symbol === 'and' ? (
          <Input
            className="item item-symbol-mr6px"
            value={before}
            placeholder={`请输入${data.label}`}
            onChange={(e) => internalOnChange(e.target.value, 'before')}
          />
        ) : null}
        <Select className="symbol-select" onChange={onSymbolChange} options={options} value={symbol} />
        <Input
          className="item"
          value={after}
          placeholder={`请输入${data.label}`}
          onChange={(e) => internalOnChange(e.target.value, 'after')}
        />
      </div>
    </div>
  );
};

export default RenderGroup;

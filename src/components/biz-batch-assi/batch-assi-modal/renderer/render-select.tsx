/**
 * 渲染字典项
 */
import React, { useState, useEffect } from 'react';
import { Select, TreeSelect, message } from 'antd';
import { getRegisterDict } from '@mapzone/map-services';
import type { FsFC, RegisterDictDatas } from '@mapzone/types';
import type { SelectProps } from 'antd';
import type { RendererProps } from '../types';

type OptionItem = {
  label: string;
  value: string;
  children?: OptionItem[];
  original: RegisterDictDatas;
};

const RenderSelect: FsFC<RendererProps> = (props) => {
  const { tableName, fieldname, type, data, disabled } = props;
  const { parentLabel, parentId, otherData, relationGroup } = data;
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [selectValue, setSelectValue] = useState<SelectProps['value']>(otherData);

  const format = (dataList: Record<string, any>[]): OptionItem[] => {
    return dataList.map((v) => ({
      label: v.caption,
      value: v.code,
      children: Array.isArray(v.children) ? format(v.children) : undefined,
      original: v,
    }));
  };

  const getTreeData = async () => {
    if (relationGroup && parentLabel && !parentId) {
      message.warning(`请选择${parentLabel}`);
      return [];
    }
    const res = await getRegisterDict.fetch({ tableName, fieldName: fieldname, format: '1', parentId });
    if (res.success && Array.isArray(res.datas)) {
      return format(res.datas);
    }
    return [];
  };

  const onFocus = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const res = await getTreeData();
      setOptions(res);
    } finally {
      setLoading(false);
    }
  };

  const innerOnChange = (v: any, n: any) => {
    setSelectValue(v);
    props.onChange(v, n);
  };

  useEffect(() => {
    if (!otherData) {
      setSelectValue(undefined);
      setOptions([]);
    }
  }, [parentId, otherData]);

  if (type === 'treeSelect') {
    return (
      <TreeSelect
        loading={loading}
        treeData={options}
        placeholder="请选择值"
        disabled={disabled}
        value={selectValue}
        onChange={(v, n: any) => innerOnChange(v, n)}
        onFocus={onFocus}
      />
    );
  }

  return (
    <Select
      placeholder="请选择值"
      options={options}
      onFocus={onFocus}
      loading={loading}
      value={selectValue}
      disabled={disabled}
      onChange={(v, option: any) => innerOnChange(v, option)}
    />
  );
};

export default RenderSelect;

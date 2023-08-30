import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { queryDictOptionList } from '@/services';
import type { SelectProps } from 'antd';
import type { DictOptionItem } from '@/types';
import type { FsFC } from '@mapzone/types';

export type BizDictSelectProps = SelectProps<string, DictOptionItem> & {
  /** 字典域 */
  dictDomain: string;
};

const fieldNames = { label: 'C_NAME', value: 'C_CODE' };

/** 通用字典下拉 */
export const BizDictSelect: FsFC<BizDictSelectProps> = (props) => {
  const { dictDomain, ...restProps } = props;
  const [options, setOptions] = useState<DictOptionItem[]>([]);

  const getDictOptionList = async (domainName: string) => {
    const dictList = await queryDictOptionList(domainName);
    setOptions(dictList);
  };

  useEffect(() => {
    getDictOptionList(dictDomain);
  }, [dictDomain]);

  return <Select<string, DictOptionItem> fieldNames={fieldNames} {...restProps} options={options} />;
};

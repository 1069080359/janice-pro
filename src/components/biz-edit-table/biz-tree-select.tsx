import { MzDictTreeSelect } from '@mapzone/kit';
import { FsFC } from '@mapzone/types';
import { useEffect, useRef, useState } from 'react';
import type { MzDictTreeSelectProps } from '@mapzone/kit';
import type { CommonGetDictionaryRecord } from '@mapzone/map-services';

const persistenceConfig = { persistenceKey: 'biz-tree-select' };

export const BizTreeSelect: FsFC<MzDictTreeSelectProps> = (props) => {
  const { value, onChange, ...restProps } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [dictList, setDictList] = useState<Required<CommonGetDictionaryRecord[]>>([]);

  useEffect(() => {
    const item = dictList.find((d) => d.caption === value);
    if (item && onChangeRef.current) {
      //@ts-ignore
      onChangeRef.current(item.code!, [item.caption], { preValue: [], triggerValue: 'onChange' });
    }
  }, [value, dictList]);

  return (
    <MzDictTreeSelect
      persistenceConfig={persistenceConfig}
      value={value}
      onTreeDataChange={setDictList}
      onChange={onChangeRef.current}
      {...restProps}
    />
  );
};

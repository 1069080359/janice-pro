import { MzDictSelect } from '@mapzone/kit';
import { FsFC } from '@mapzone/types';
import { useEffect, useRef, useState } from 'react';
import type { MzDictSelectProps } from '@mapzone/kit';
import type { CommonGetDictionaryRecord } from '@mapzone/map-services';

const persistenceConfig = { persistenceKey: 'biz-select' };

export const BizSelect: FsFC<MzDictSelectProps> = (props) => {
  const { value, onChange, ...restProps } = props;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [dictList, setDictList] = useState<Required<CommonGetDictionaryRecord[]>>([]);

  useEffect(() => {
    const item = dictList.find((d) => d.caption === value);
    if (item && onChangeRef.current) {
      onChangeRef.current(item.code!, item);
    }
  }, [value, dictList]);

  return (
    <MzDictSelect
      persistenceConfig={persistenceConfig}
      value={value}
      onOptionsChange={setDictList}
      onChange={onChangeRef.current}
      {...restProps}
    />
  );
};

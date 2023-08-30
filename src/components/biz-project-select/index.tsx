import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { commonFindByPaging } from '@mapzone/map-services';
import type { SelectProps } from 'antd';
import type { CommonDataRecord } from '@mapzone/map-services';
import type { FsFC } from '@mapzone/types';

export type BizDictSelectProps = SelectProps<string, CommonDataRecord>;
const dataName = 'XM_XMLX_TB';
const fieldNames = { label: 'XMMC', value: 'XMID' };

const BizProjectSelect: FsFC<BizDictSelectProps> = (props) => {
  const { ...restProps } = props;
  const [options, setOptions] = useState<CommonDataRecord[]>([]);

  useEffect(() => {
    commonFindByPaging({ dataName: dataName, pageIndex: 1, pageSize: 1000 }).then((data) => {
      if (data.code === '1000') {
        if (!data.datas) {
          return;
        }
        setOptions(data.datas);
      }
    });
  }, []);

  return <Select<string, CommonDataRecord> fieldNames={fieldNames} {...restProps} options={options} />;
};

export default BizProjectSelect;

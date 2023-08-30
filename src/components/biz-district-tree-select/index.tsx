import React, { useEffect, useState } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import { getUserInfo } from '@mapzone/utils';
import { updateTreeData } from '@/utils';
import { getChildrenRegionList } from '@/services';
import type { FsFC } from '@mapzone/types';
import type { RegionInfo } from '@/types';

export type BizDistrictTreeSelectProps = TreeSelectProps<string, RegionInfo>;

const fieldNames = { label: 'C_ZQNAME', value: 'C_ZQCODE' };

const BizDistrictTreeSelect: FsFC<BizDistrictTreeSelectProps> = (props) => {
  const [treeData, setTreeData] = useState<RegionInfo[]>([]);

  const loadData = async (node: any) => {
    const { C_ZQCODE } = node;
    const children = await getChildrenRegionList({ pid: C_ZQCODE });
    if (children.length > 0) {
      const newTreeData = updateTreeData(treeData, C_ZQCODE, children, { id: 'C_ZQCODE' });
      setTreeData([...newTreeData]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const { zqCode } = getUserInfo().original;
      getChildrenRegionList({ zqCode }).then((comList) => {
        setTreeData(comList);
      });
    }, 500);
  }, []);
  return (
    <TreeSelect<string, RegionInfo> fieldNames={fieldNames} treeData={treeData} loadData={loadData} placeholder="请选择单位" {...props} />
  );
};

export { BizDistrictTreeSelect };

import { useEffect, useRef, useState } from 'react';
import { TreeSelect } from 'antd';
import { queryCompanyList } from '@/services';
import { updateTreeData } from '@/utils';
import type { TreeSelectProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { CompanyInfo } from '@/types';
import { useModel } from '@umijs/max';

export type BizCompanyTreeSelectProps = TreeSelectProps<string, CompanyInfo> & {
  getTreeData?: (data: any[]) => void;
};

const fieldNames = { label: 'C_DWNAME', value: 'C_DWCODE' };

/** 公司/单位树形下拉选择 */
export const BizCompanyTreeSelect: FsFC<BizCompanyTreeSelectProps> = (props) => {
  const { onChange, getTreeData } = props;
  const [treeData, setTreeData] = useState<any[]>([]);
  const { initialState = {} } = useModel('@@initialState');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const { userInfo } = initialState;

  const loadData = async (node: any) => {
    const { L_ID, C_DWCODE } = node;
    const children = await queryCompanyList({ pid: L_ID });
    if (children.length > 0) {
      const newTreeData = updateTreeData(treeData, C_DWCODE, children, { id: 'C_DWCODE' });
      if (typeof getTreeData === 'function') {
        getTreeData(newTreeData);
      }
      setTreeData([...newTreeData]);
    }
  };

  useEffect(() => {
    if (userInfo) {
      const { dwCode } = userInfo.original;
      queryCompanyList({ dwCode }).then((comList) => {
        setTreeData(comList);
      });
    }
  }, [userInfo]);

  return (
    <TreeSelect<string, CompanyInfo>
      fieldNames={fieldNames}
      treeData={treeData}
      loadData={loadData}
      placeholder="请选择单位"
      onChange={onChange}
      {...props}
    />
  );
};

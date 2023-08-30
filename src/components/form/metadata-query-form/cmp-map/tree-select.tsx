import { TreeSelect } from 'antd';
import { useFieldFetchData } from './hooks';
import type { FsFC } from '@mapzone/types';
import type { TreeSelectProps } from 'antd';
import type { BizFieldProps } from './types';

export type BizTreeSelectProps = BizFieldProps & TreeSelectProps;

export const BizTreeSelect: FsFC<BizTreeSelectProps> = (props) => {
  const { request, fieldKey, treeData, ...restProps } = props;
  const [loading, reqOptions] = useFieldFetchData({ request, fieldKey });
  return <TreeSelect allowClear dropdownMatchSelectWidth={false} loading={loading} treeData={treeData || reqOptions} {...restProps} />;
};

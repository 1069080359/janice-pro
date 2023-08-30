import { Tree } from 'antd';
import classNames from 'classnames';
import { treePrefixCls } from './constants';
import type { ReactElement } from 'react';
import type { BasicDataNode } from 'rc-tree';
import type { DataNode } from 'antd/es/tree';
import type { BizDirectoryTreeProps } from './types';
import './index.less';

const { DirectoryTree } = Tree;

/**
 * ## 二次封装 [antd tree](https://ant-design.antgroup.com/components/tree-cn/#API)
 * - 支持 antd tree 所有属性
 */
const BizDirectoryTree = <T extends BasicDataNode = DataNode>(props: BizDirectoryTreeProps<T>): ReactElement => {
  const { className, ...treeProps } = props;

  return (
    <div className={`${treePrefixCls}-wrap mz-tree-auto-scroll-container`}>
      <DirectoryTree<T> className={classNames('mz-tree-auto-scroll', treePrefixCls, className)} {...treeProps} />
    </div>
  );
};

export default BizDirectoryTree;

import type { BasicDataNode } from 'rc-tree';
import type { DirectoryTreeProps, DataNode } from 'antd/es/tree';

export type { BasicDataNode };

export type BizDirectoryTreeProps<T extends BasicDataNode = DataNode> = DirectoryTreeProps<T>;

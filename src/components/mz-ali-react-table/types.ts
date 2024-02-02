import type { BaseTableProps, } from 'ali-react-table';

export type MzAliReactTableProps<RecordType = Record<string, any>> = Omit<BaseTableProps, 'primaryKey'> & {
  primaryKey: string;
  /** 滚动高度，用于设置在 modal 中不设置高度不出现滚动条 */
  scrollY?: number
  /** 选中的 keys */
  selectedKeys: React.Key[]
  /** 行选中 */
  onRow: (row: RecordType) => void
}

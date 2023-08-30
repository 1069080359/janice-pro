import type { BizMetadataItem } from '@/types';
import type { BizProTableProps } from '../pro-table';

export type DataItem = Record<string, any>;

export type BizEditTableProps<T extends Record<string, any> = DataItem> = Omit<BizProTableProps<T>, 'columns' | 'rowKey'> & {
  tableTitle?: string;
  hideTj?: boolean;
  dataName: string;
  tbqs?: string; // 获取资源汇总统计 查询 年度条件
  nd?: string; // 获取资源汇总统计 查询 年度条件
  tjType: string; // 获取资源汇总统计 查询类型
  dbDw?: string; // 填报单位 用于获取上次填报数据接口
  hideHeaderOperate?: boolean; // 隐藏表头 操作功能
  filter?: string; // 过滤条件
  /** 主键 */
  rowKey?: string;
  /** 数据列表变更 */
  onDataSourceChange?: (dataList: T[]) => void;
  /** 元数据列表 */
  metadataList?: BizMetadataItem[];
};

export type GetTbxxUpInfoParams = {
  type: string; // 用于区别表名
  dw_bh: string; // 填报单位
};

export type GetTbxxTjParams = {
  filter: string;
  type: string; // 查询类型 1-表2 ，2-表三....
};

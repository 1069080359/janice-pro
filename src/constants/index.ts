import type { MzColumnType } from '@mapzone/types';

export const defaultPaginationInfo = {
  pageIndex: 1,
  pageSize: 10,
};

export const NationZqCode = '200000';

/** 业务数据Key */
export const ywshLayerGroupKey = 'YWSJ';

/** 操作 列，统一 ，前端导出不需要 导出 操作 一栏，导出时过滤使用 */
export const getTableActions = <T extends Record<string, any> = Record<string, any>>({ width = 150 } = {}): MzColumnType<T> => {
  return {
    width,
    title: '操作',
    valueType: 'option',
    dataIndex: 'option',
    key: 'option',
    align: 'center',
    fixed: 'right',
    show: true,
  };
};

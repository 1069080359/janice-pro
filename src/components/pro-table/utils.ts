import type { MzProTableProps } from '@mapzone/types';

export const prefixCls = 'mz-pro-table';

export const defaultTableProps: Partial<Omit<MzProTableProps<any>, 'columns'>> = {
  bordered: true,
  autoEllipsis: true,
  dragColumn: false,
  resizableColumn: false,
  size: 'small',
  pagination: {
    className: 'mz-pagination',
    showSizeChanger: true,
    showQuickJumper: true,
    position: ['bottomLeft'],
  },
};

export const defailtOptionsConfig: Required<MzProTableProps<any>>['options'] = { density: false, setting: { listsHeight: 440 } };

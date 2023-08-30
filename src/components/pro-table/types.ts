import type { MzProTableProps } from '@mapzone/types';

export type BizProTableProps<T extends Record<string, any> = Record<string, any>> = MzProTableProps<T> & {
  /** 自适应滚动 */
  autoScroll?: boolean;
};

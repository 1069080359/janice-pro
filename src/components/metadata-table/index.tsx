import { useMemo } from 'react';
import { MzMetadataTable } from './metadata-table';
import classNames from 'classnames';
import { defailtOptionsConfig, defaultTableProps, prefixCls } from './utils';
import type { BizMzMetadataTableProps } from './types';
import './index.less';

export { transformColumns } from './utils';

export type BizMetadataTableProps<T extends Record<string, any> = Record<string, any>> = BizMzMetadataTableProps<T> & {
  /** 自适应滚动 */
  autoScroll?: boolean;
};

/** 元数据表格 */
export const BizMetadataTable = <T extends Record<string, any> = Record<string, any>>(props: BizMetadataTableProps<T>) => {
  const { dataName, autoScroll = true, options, className, pagination, ...restProps } = props;

  const internalPagination = useMemo(() => {
    if (pagination === false) {
      return false;
    }
    return { ...defaultTableProps.pagination, ...pagination };
  }, [pagination]);

  const optionsConifg = options === false ? false : { ...defailtOptionsConfig, ...options };

  return (
    <div
      className={classNames(`${prefixCls}-container`, {
        'mz-table-auto-scroll-container': autoScroll,
      })}
    >
      <MzMetadataTable<T>
        dataName={dataName}
        className={classNames(prefixCls, className, { 'mz-table-auto-scroll': autoScroll })}
        scroll={{ scrollToFirstRowOnChange: true, ...scroll }}
        options={optionsConifg}
        pagination={internalPagination}
        {...restProps}
      />
    </div>
  );
};

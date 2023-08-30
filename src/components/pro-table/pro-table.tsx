import { useMemo } from 'react';
import classNames from 'classnames';
import { MzProTable } from '@mapzone/table';
import { prefixCls, defaultTableProps, defailtOptionsConfig } from './utils';
import type { ReactElement } from 'react';
import type { BizProTableProps } from './types';
import './style.less';

const BizProTable = <T extends Record<string, any> = Record<string, any>>(props: BizProTableProps<T>): ReactElement => {
  const { className, pagination, scroll, autoScroll = true, options, ...restProps } = props;

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
      <MzProTable<T>
        {...defaultTableProps}
        className={classNames(prefixCls, className, {
          'mz-table-auto-scroll': autoScroll,
          [`${prefixCls}-has-colspan`]: !!(restProps.columns || []).find((v) => ((v as any).children || []).length),
        })}
        scroll={{ scrollToFirstRowOnChange: true, ...scroll }}
        pagination={internalPagination}
        options={optionsConifg}
        {...restProps}
      />
    </div>
  );
};

export default BizProTable;

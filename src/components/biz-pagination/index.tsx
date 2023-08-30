import React from 'react';
import { Pagination } from 'antd';

import type { PaginationProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import './index.less';

type BizPaginationProps = {
  defaultValue: Record<string, any>;
} & PaginationProps;

const prefixCls = 'biz-pagination';

const BizPagination: FsFC<BizPaginationProps> = (props) => {
  const { defaultValue, ...restProps } = props;
  const showTotal = (total: number) => {
    return <span className={`${prefixCls}-total-text`}>共{total}条</span>;
  };
  return (
    <Pagination
      className={prefixCls}
      total={defaultValue.total}
      current={defaultValue.currentPage}
      pageSize={defaultValue.pageSize}
      showSizeChanger
      showQuickJumper
      hideOnSinglePage
      showTotal={showTotal}
      pageSizeOptions={[10, 20, 50, 100]}
      {...restProps}
    />
  );
};

export { BizPagination };

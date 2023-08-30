import React from 'react';
import { BizPageContainer, BizPageContainerProps } from '@/components';
import StatisticsTable from './statistics-table';

const TableExcel = () => {
  const tabList: BizPageContainerProps['tabList'] = [
    {
      tab: '表格统计功能',
      key: '1',
      children: <StatisticsTable />,
    },
    {
      tab: '表格统计功能-说明',
      key: '2',
      children: '表格统计功能-说明',
    },
  ];
  return <BizPageContainer tabList={tabList} />;
};

export default TableExcel;

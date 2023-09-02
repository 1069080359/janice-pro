import { Space, Button } from 'antd';
import { BizPageContainer, BizPageContainerProps } from '@/components';
import StatisticsTable from './statistics-table';
import './index.less';

const TableExcel = () => {
  const openWindow1 = () => {
    window.open('https://1069080359.github.io/Janice/#/', '_blank');
  };

  const OperationsSlot: any = {
    left: null,
    right: (
      <Space>
        <Button key="dr" size="small" type="primary" onClick={openWindow1}>
          原表格统计网站
        </Button>
      </Space>
    ),
  };
  const tabList: BizPageContainerProps['tabList'] = [
    {
      tab: '表格统计功能',
      key: '1',
      children: <StatisticsTable />,
    },
  ];
  return <BizPageContainer tabList={tabList} tabBarExtraContent={OperationsSlot} />;
};

export default TableExcel;

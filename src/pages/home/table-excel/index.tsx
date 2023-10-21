import { useEffect } from 'react';
import { Space, Button } from 'antd';
import { BizPageContainer, BizPageContainerProps } from '@/components';
import StatisticsTable from './statistics-table';
import './index.less';
import { listenMsg } from '@/utils/cross-tag-msg';

const TableExcel = () => {
  const openWindow1 = () => {
    window.open('http://172.16.1.74:8170/#/home/test-tag-msg', '_blank');
    // window.open('https://1069080359.github.io/Janice/#/', '_blank');
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

  useEffect(() => {}, []);

  useEffect(() => {
    const unListen = listenMsg((info) => {
      console.log(info);
    });
    return () => {
      unListen();
    };
  }, []);

  return <BizPageContainer tabList={tabList} tabBarExtraContent={OperationsSlot} />;
};

export default TableExcel;

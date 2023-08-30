import { useState } from 'react';
import { Button, Table, Alert } from 'antd';
import { BizModal } from '@/components';
import QualityCheckErrorDetailModal from './quality-check-error-detail-modal';
import { prefixCls } from './utils';
import type { ColumnType } from 'antd/es/table';
import type { FsFC, ErrorInfoItem, RndModalProps } from '@mapzone/types';
import './style.less';

export type QualityCheckErrorResultModalProps = Omit<RndModalProps, 'onOk'> & {
  errorList: ErrorInfoItem[];
};

const QualityCheckErrorResultModal: FsFC<QualityCheckErrorResultModalProps> = (props) => {
  const { errorList, ...restProps } = props;
  const [selectErrorItem, setSelectErrorItem] = useState<ErrorInfoItem>();

  const onViewDetailClick = (errorInfo: ErrorInfoItem) => {
    setSelectErrorItem(errorInfo);
  };

  const onViewDetailModalCancel = () => {
    setSelectErrorItem(undefined);
  };

  const columns: ColumnType<ErrorInfoItem>[] = [
    {
      title: '编号',
      dataIndex: 'index',
      width: '50px',
      render: (_, __, index) => index + 1,
    },
    {
      title: '检查规则名称',
      dataIndex: 'name',
    },
    {
      title: '错误原因',
      dataIndex: 'options',
      width: '80px',
      align: 'center',
      render: (_, record) => {
        return (
          <Button type="text" size="small" onClick={() => onViewDetailClick(record)}>
            查看
          </Button>
        );
      },
    },
  ];

  return (
    <BizModal
      mask={false}
      title="检测结果提示"
      width={600}
      belowClickable
      className={`${prefixCls}-error-result-modal`}
      footer={false}
      {...restProps}
    >
      <Alert className={`${prefixCls}-error-result-tips`} message="请查询检测规则执行失败的错误原因" type="error" showIcon />
      <Table size="small" rowKey="name" columns={columns} pagination={false} dataSource={errorList} scroll={{ y: 'auto' }} bordered />
      <QualityCheckErrorDetailModal open={!!selectErrorItem} errorInfo={selectErrorItem} onCancel={onViewDetailModalCancel} />
    </BizModal>
  );
};

export default QualityCheckErrorResultModal;

import React, { useState } from 'react';
import { Table, Input, Button, Space, Affix, Tooltip, Upload, UploadProps } from 'antd';
import moment from 'moment';
import { InboxOutlined } from '@ant-design/icons';
import { parseFile } from 'table-xlsx';
import { formatBytes } from '../utils';
import './index.less';
import { transformColumns } from './utils';

const prefixCls = 'statistics-table';

const StatisticsTable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [bfExcelData, setBfExcelData] = useState<any[]>([]);
  const [afExcelData, setAfExcelData] = useState<any[]>([]);
  const [filesInfo, setFilesInfo] = useState<any>();

  /** 导入表格 */
  const importUploadConfig: UploadProps = {
    name: '导入表格',
    multiple: false,
    accept: '.xlsx,.xls',
    fileList: [],
    beforeUpload: async (file) => {
      setLoading(true);
      parseFile({ file }).then((result) => {
        const { dataSource, columns } = (result as any).tables[0];
        const { newCols, tableDatas } = transformColumns(columns, dataSource);
        setColumns(newCols);
        setAfExcelData(tableDatas);
        setFilesInfo(file);
        setLoading(false);
      });
    },
  };

  const renderTableFooter = () => {
    return (
      <Space>
        <span>
          上传文档中，数据总数：<span>{bfExcelData.length}</span> 条
        </span>
        <span>
          上传文档中，汇总后总数：<span>{afExcelData.length}</span> 条
        </span>
        <span>
          上传文件名称：<span>{filesInfo?.name}</span>
        </span>
        <span>
          上传文件大小：<span>{formatBytes(filesInfo?.size)}</span>
        </span>
        <span>
          上传的文档，最后的修改时间：<span>{moment(filesInfo?.lastModified).format('YYYY-MM-DD HH:mm:ss')}</span>
        </span>
      </Space>
    );
  };

  return (
    <div className={prefixCls}>
      <Space>
        <Space>
          <Upload key="import" {...importUploadConfig}>
            <Button key="dr" icon={<InboxOutlined />}>
              导入表格
            </Button>
          </Upload>
        </Space>
      </Space>
      <Table columns={columns} dataSource={afExcelData} bordered loading={loading} size="middle" footer={renderTableFooter} />
    </div>
  );
};

export default StatisticsTable;

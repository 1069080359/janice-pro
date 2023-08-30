import React, { useRef, useState } from 'react';
import { Table, Input, Button, Space, Affix, Tooltip, Upload, UploadProps } from 'antd';
import moment from 'moment';
import Highlighter from 'react-highlight-words';
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';
import { parseFile } from 'table-xlsx';
import { formatBytes } from '../utils';
import { transformColumns } from './utils';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { InputRef } from 'antd';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import './index.less';

const prefixCls = 'statistics-table';

const StatisticsTable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [bfExcelData, setBfExcelData] = useState<any[]>([]);
  const [afExcelData, setAfExcelData] = useState<any[]>([]);
  const [filesInfo, setFilesInfo] = useState<any>();

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (recordItem: any): ColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`搜索 ${recordItem.title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, recordItem.dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, recordItem.dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            重置
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(recordItem.dataIndex);
            }}
          >
            过滤
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            关闭
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'red' : undefined }} />,
    onFilter: (value, record) =>
      record[recordItem.dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === recordItem.dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

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
        const colsFilters = newCols.map((item) => ({
          ...item,
          ...getColumnSearchProps(item),
        }));
        setColumns(colsFilters);
        setAfExcelData(tableDatas);
        setFilesInfo(file);
        setLoading(false);
      });
    },
  };

  const onExportExcel = () => {
    console.log(afExcelData);
    console.log('searchedColumn', searchedColumn);
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
          <Button key="dc" icon={<InboxOutlined />} onClick={onExportExcel}>
            当前页表格导出
          </Button>
          <Button key="all-dc" icon={<InboxOutlined />}>
            全部数据表格导出
          </Button>
        </Space>
      </Space>
      <Table columns={columns} dataSource={afExcelData} bordered loading={loading} size="middle" footer={renderTableFooter} />
    </div>
  );
};

export default StatisticsTable;

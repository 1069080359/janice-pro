import React, { useRef, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Affix,
  Tooltip,
  Typography,
  Upload,
  UploadProps,
  message,
  Tabs,
  notification,
  Dropdown,
  Drawer,
  List,
} from 'antd';
import copy from 'clipboard-copy';
import moment from 'moment';
import Highlighter from 'react-highlight-words';
import ExportJsonExcel from 'js-export-excel';
// import { exportFile } from 'table-xlsx';
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';
import { parseFile } from 'table-xlsx';
import { formatBytes, trim } from '../utils';
import { transformColumns, uploadHeaderRestrictions } from './utils';
import { statisticalCols, sheetFilterHeader, sheetColumnWidths, xuhao, shuomingInfo } from './const';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { InputRef } from 'antd';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import './index.less';

const { Text, Title } = Typography;
const prefixCls = 'statistics-table';

const StatisticsTable = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [bfColumns, setBfColumns] = useState<any[]>([]);
  const [bfExcelData, setBfExcelData] = useState<any[]>([]);
  const [afExcelData, setAfExcelData] = useState<any[]>([]);
  const [filesInfo, setFilesInfo] = useState<any>();
  const [activeKey, setActiveKey] = useState<string>('1');

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

  const handleCopy = (text) => {
    copy(text);
    notification['success']({
      message: '复制成功',
      description: text,
    });
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
    onFilter: (value, record) => {
      if (record[recordItem.dataIndex]) {
        return record[recordItem.dataIndex]
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase());
      }
    },
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
        <Tooltip title="点击复制" onClick={() => handleCopy(text)}>
          {text}
        </Tooltip>
      ),
  });

  // 对表格中的数据进行处理
  const statisticalCalculation = (cols, data) => {
    // 数据的整理筛选
    const list = data.reduce((listArr, item, index) => {
      // // 将列表数据的 key 替换
      let obj = {
        key: index.toString(),
      };
      for (let i = 0; i < sheetFilterHeader.length; i++) {
        if (sheetFilterHeader[i].key === 'frequency') {
          obj = {
            ...obj,
            [sheetFilterHeader[i].key]: 1,
          };
        } else {
          const colsItem = cols.find((v) => trim(v.title || '') === sheetFilterHeader[i].title);
          obj = {
            ...obj,
            [sheetFilterHeader[i].key]: colsItem ? item[colsItem.dataIndex] : '',
          };
        }
      }
      // 只统计有型号的数据，没有则不统计，过滤掉
      if (obj.model) {
        // 判断 替换中的 数据中的 型号是否和 listArr 的型号是否有相同
        let find = listArr.find((i) => obj.number && i.model === obj.model);

        // 需要对替换的数据中的 数量 进行判断 如果是 undefined 则改为 0 否则会对排序有影响
        if (!obj.number) {
          obj.number = 0;
        }
        // 最后 如果有相同的则 相加 数量，如果没有相同的 则 push 到 listArr
        // eslint-disable-next-line no-unused-expressions
        find ? ((find.number += obj.number), find.frequency++) : listArr.push(obj);
      }
      return listArr;
    }, []);
    return list;
  };

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

        const uploadHeaderSuccess = uploadHeaderRestrictions(newCols);
        if (!uploadHeaderSuccess) {
          message.info(
            `上传表头必须包含${sheetFilterHeader
              .slice(0, 4)
              .map((s) => s.title)
              .join()}`,
          );
          setLoading(false);
          return;
        }

        const colsFilters = newCols.map((item) => ({
          ...item,
          ...getColumnSearchProps(item),
        }));
        const statisticalColsFilters = statisticalCols.map((item) => ({
          ...item,
          ...getColumnSearchProps(item),
          sorter: (a, b) => a[item.key] - b[item.key],
        }));
        const mergeData = statisticalCalculation(colsFilters, tableDatas);
        setBfColumns(statisticalColsFilters);
        setColumns(colsFilters);
        setAfExcelData(tableDatas);
        setBfExcelData(mergeData);
        setFilesInfo(file);
        setLoading(false);

        message.success('文件上传解析成功');
      });
    },
  };

  /** 汇总统计表格导出 */
  const onExportExcel = (sort?: Record<string>) => {
    let option = {};
    let dataTable = [];
    let sortData = [...bfExcelData];
    if (sort) {
      if (sort.sortType === 'rise') {
        // 升序
        sortData = [...bfExcelData.sort((x, y) => x[sort.type] - y[sort.type])];
      } else if (sort.sortType === 'drop') {
        // 降序
        sortData = [...bfExcelData.sort((x, y) => y[sort.type] - x[sort.type])];
      } else {
        sortData = [...bfExcelData];
      }
    }
    // 遍历原始数据
    for (const item of sortData) {
      // 创建新的对象
      const mergedItem: any = {};

      // 遍历原始对象的键值对
      for (const [key, value] of Object.entries(item)) {
        // 在新的对象中添加新的键值对，键名为对应的标题，键值为原始对象中对应键名的值
        const title = sheetFilterHeader.find((title) => title.key === key);
        if (title) {
          mergedItem[title.title] = value;
        }
      }

      // 将新创建的对象添加到数组中
      dataTable.push(mergedItem);
    }

    const sheetFilter = sheetFilterHeader.map((ite) => ite.title);
    option.fileName = `统计后 - ${filesInfo.name.split('.')[0]}`;
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: sheetFilter,
        sheetHeader: sheetFilter,
        columnWidths: sheetColumnWidths,
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  const renderTableFooter = () => {
    return (
      <Space>
        <Tooltip title="文件">
          <Text type="success">
            数据总数：<Text type="danger">{afExcelData.length}</Text> 条
          </Text>
        </Tooltip>
        <Text type="success">
          汇总后总数：<Text type="danger">{bfExcelData.length}</Text> 条
        </Text>
        <Text type="success">
          上传文件名称：<Text type="danger">{filesInfo?.name}</Text>
        </Text>
        <Text type="success">
          上传文件大小：<Text type="danger">{formatBytes(filesInfo?.size)}</Text>
        </Text>
        <Text type="success">
          上传的文档，最后的修改时间：<Text type="danger">{moment(filesInfo?.lastModified).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </Text>
      </Space>
    );
  };

  const btnitems = [
    {
      key: '1',
      label: '按数量升序导出',
      sortType: 'rise',
      type: 'number',
    },
    {
      key: '2',
      label: '按数量降序导出',
      sortType: 'drop',
      type: 'number',
    },
    {
      key: '3',
      label: '按重复次数升序导出',
      sortType: 'rise',
      type: 'frequency',
    },
    {
      key: '4',
      label: '按重复次数降序导出',
      sortType: 'drop',
      type: 'frequency',
    },
  ];

  const onMenuClick = (e) => {
    const curItem = btnitems.find((i) => i.key === e.key);
    onExportExcel(curItem);
  };

  const btnOp = {
    '1': null,
    '2': (
      <Dropdown.Button
        size="small"
        type="primary"
        disabled={!bfExcelData.length}
        onClick={onExportExcel}
        menu={{ items: btnitems, onClick: onMenuClick }}
      >
        汇总统计表格数据导出
      </Dropdown.Button>
    ),
  };

  const OperationsSlot: any = {
    left: null,
    right: (
      <Space>
        <Upload key="import" {...importUploadConfig}>
          <Button key="dr" size="small" icon={<InboxOutlined />} type="primary">
            导入表格
          </Button>
        </Upload>
        {btnOp[activeKey]}
        <Button key="dr-sm" size="small" icon={<InboxOutlined />} type="primary" onClick={() => setOpen(true)}>
          表格统计功能-说明
        </Button>
      </Space>
    ),
  };

  const tableProps: any = {
    bordered: true,
    loading: loading,
    size: 'middle',
    scroll: { y: 620 },
    pagination: false,
    footer: renderTableFooter,
  };

  const items = [
    {
      label: '上传表格数据',
      key: '1',
      children: <Table {...tableProps} columns={[xuhao, ...columns]} dataSource={afExcelData} />,
    },
    {
      label: '汇总统计表格数据',
      key: '2',
      children: <Table {...tableProps} columns={[xuhao, ...bfColumns]} dataSource={bfExcelData} />,
    },
  ];
  return (
    <>
      <Tabs
        className={`${prefixCls}-tabs`}
        activeKey={activeKey}
        onChange={setActiveKey}
        items={items}
        tabBarExtraContent={OperationsSlot}
      />
      <Drawer title="表格统计功能-说明" placement="right" onClose={() => setOpen(false)} open={open}>
        <List
          size="large"
          header={<Title level={3}>表格统计功能使用方法</Title>}
          bordered
          dataSource={shuomingInfo}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Drawer>
    </>
  );
};

export default StatisticsTable;

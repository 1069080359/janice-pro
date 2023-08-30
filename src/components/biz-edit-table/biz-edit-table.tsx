import { Button, Input, InputNumber, message, notification, Upload } from 'antd';
import { Fragment, useEffect, useRef, useState } from 'react';
import { uuidV4 } from '@mapzone/utils';
import { excelImport, queryDataList, queryMetadataList } from '@/services';
import { exportExcel } from '@/utils';
import { getTableActions } from '@/constants';
import { BizProTable } from '../pro-table';
import { BizMetadataItem } from '@/types';
import { transformColumns } from '../metadata-table';
import { BizSelect } from './biz-select';
import { BizTreeSelect } from './biz-tree-select';
import { prefixCls } from './const';
import { getTbxxTj, getTbxxUpInfo } from './services';
import type { UploadProps } from 'antd';
import type { ActionType, FsFC, MzProTableColumnType } from '@mapzone/types';
import type { BizEditTableProps, DataItem } from './types';
import type { BizProTableProps } from '../pro-table';
import './style.less';

const BizEditTable: FsFC<BizEditTableProps> = (props) => {
  const {
    dataName,
    dbDw,
    nd = '',
    tbqs = '',
    tjType,
    rowKey = 'PK_UID',
    tableTitle = '统计表格',
    filter,
    hideTj,
    hideHeaderOperate,
    onDataSourceChange,
    metadataList: propsMetadataList,
    ...restProps
  } = props;
  const [metadataList, setMetadataList] = useState<BizMetadataItem[]>([]);
  const [columns, setColumns] = useState<BizProTableProps<DataItem>['columns']>([]);
  const [dataSource, setDataSource] = useState<DataItem[]>([]);
  const actionRef = useRef<ActionType>();
  const dataSourceRef = useRef<DataItem[]>(dataSource);

  const updateDataSource = (datas: DataItem[]) => {
    if (typeof onDataSourceChange === 'function') {
      onDataSourceChange(datas);
    }
    dataSourceRef.current = datas;
    setDataSource(datas);
  };

  const handleDelete = (record: DataItem) => {
    const newData = dataSourceRef.current.filter((item) => {
      return item[rowKey] !== record[rowKey];
    });
    updateDataSource(newData);
  };

  const handleAdd = () => {
    const newData = {
      [rowKey]: uuidV4().substring(0, 6),
    };
    updateDataSource([...dataSource, newData]);
  };

  const onClearData = () => {
    updateDataSource([]);
  };

  /** 导入表格 */
  const importUploadConfig: UploadProps = {
    name: '导入表格',
    multiple: false,
    accept: '.xlsx,.xls',
    fileList: [],
    beforeUpload: async (file) => {
      const params = {
        tableName: dataName,
        inStorage: false,
      };
      const param = { param: JSON.stringify(params), file };
      const res = await excelImport(param);
      if (!res.success) {
        notification['error']({
          message: res.msg,
          description: (
            <>
              {res.datas.map((item: string, index: number) => {
                return <p key={index}>{item}</p>;
              })}
            </>
          ),
        });
        return;
      }
      updateDataSource(res.datas);
    },
  };

  /** 导出表格 */
  const excelExport = () => {
    if (!columns) {
      return;
    }
    exportExcel(columns, dataSource, tableTitle);
  };

  const getDataList = async () => {
    const datas = await queryDataList({ dataName, pageIndex: 1, pageSize: 9999, filter });
    updateDataSource(datas);
  };

  const getUpInfo = async () => {
    if (!dbDw) {
      message.info('请选择填报单位');
      return;
    }
    const params = {
      type: dataName,
      dw_bh: dbDw,
    };
    const res = await getTbxxUpInfo(params);
    if (!res.success) {
      message.error(res.msg);
      return;
    }
    if (!res.datas.length) {
      message.info('暂无上次填报数据');
      return;
    }
    updateDataSource(res.datas);
  };

  const getTj = async () => {
    const params = {
      type: tjType,
      filter: `nd='${nd}' and tbqs = '${tbqs}' `,
    };
    const res = await getTbxxTj(params);
    if (!res.success) {
      message.error(res.msg);
      return;
    }
    if (!res.datas.length) {
      message.info('暂无资源小班统计信息');
      return;
    }
    updateDataSource(res.datas);
  };

  const onFieldChange = (index: number, fieldName: string, value: any) => {
    dataSourceRef.current[index] = { ...dataSourceRef.current[index], [fieldName]: value };
    updateDataSource([...dataSourceRef.current]);
  };

  useEffect(() => {
    const columnConfigs: Record<string, MzProTableColumnType<DataItem>> = {};
    metadataList.forEach((item) => {
      const fieldName = item.fieldname;
      columnConfigs[fieldName] = {};
      if (item.tablePk) {
        if (item.type === 'select') {
          columnConfigs[fieldName].render = (val, _record, index) => (
            <BizSelect
              dataName={dataName}
              fieldName={fieldName}
              value={val}
              onChange={(newVal) => onFieldChange(index, fieldName, newVal)}
            />
          );
        } else {
          columnConfigs[item.fieldname].render = (val, _record, index) => (
            <BizTreeSelect
              dataName={dataName}
              fieldName={item.fieldname}
              value={val}
              onChange={(newVal) => onFieldChange(index, fieldName, newVal)}
            />
          );
        }
      } else if (item.type === 'inputNumber') {
        columnConfigs[item.fieldname].render = (val, _record, index) => (
          <InputNumber value={val} onChange={(newVal) => onFieldChange(index, fieldName, newVal)} />
        );
      } else {
        columnConfigs[item.fieldname].render = (val, _record, index) => (
          <Input value={val} onChange={(e) => onFieldChange(index, fieldName, e.target.value)} />
        );
      }
    });
    const cols = transformColumns<DataItem>(metadataList, columnConfigs);
    cols.push({
      ...getTableActions({ width: 80 }),
      render: (text: string, record: DataItem) => {
        return (
          <a key="delete" onClick={() => handleDelete(record)}>
            删除
          </a>
        );
      },
    });
    setColumns(cols);
  }, [metadataList]);

  useEffect(() => {
    if (propsMetadataList && propsMetadataList.length > 0) {
      setMetadataList(propsMetadataList);
    } else if (dataName) {
      queryMetadataList(dataName).then((dataList) => {
        setMetadataList(dataList);
      });
    }
    getDataList();
    return () => {};
  }, [dataName]);

  const toolBarRender: Required<BizEditTableProps<DataItem>>['toolBarRender'] = () => {
    if (hideHeaderOperate) {
      return [];
    }
    return [
      <Fragment key="zyxb">
        {!hideTj && (
          <Button key="zyxb" onClick={getTj}>
            获取资源小班统计信息
          </Button>
        )}
      </Fragment>,
      <Button key="tbsj" onClick={getUpInfo}>
        获取上次填报数据
      </Button>,
      <Button key="add" onClick={handleAdd}>
        新增
      </Button>,
      <Button key="all-delete" onClick={onClearData}>
        清空
      </Button>,
      <Upload key="import" {...importUploadConfig}>
        <Button key="dr">导入表格</Button>
      </Upload>,
      <Button key="dc" onClick={excelExport} disabled={!dataSource.length}>
        导出表格
      </Button>,
    ];
  };

  return (
    <BizProTable
      actionRef={actionRef}
      scroll={{ y: 380 }}
      className={prefixCls}
      autoScroll={false}
      size="small"
      rowKey={rowKey}
      toolBarRender={toolBarRender}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      {...restProps}
    />
  );
};

export default BizEditTable;

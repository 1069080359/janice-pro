import { ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Space, Popconfirm, message, Button } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { MzAdvancedSort } from '@mapzone/kit';
import RndModal from '@mapzone/modal';
import { useMzDynamicForm } from '@mapzone/form';
import { MzProTable } from '@mapzone/table';
import { BizMetadataQueryForm } from '../form';
import { queryConut, queryDataList, queryMetadataList, deleteByIds, insertOrUpdateRecord } from '@/services';
import { getGroupConfigByMetadataList } from '@/utils';
import { ModalTips } from '@/utils/modal-tips';
import { BizDetailModal } from '../biz-detail-modal';
import { transformColumns } from './utils';
import type { SortOrder } from 'antd/es/table/interface';
import type { MzProTableProps, ActionType, MzProTableColumnType, TMetadata } from '@mapzone/types';
import type { OrderByType } from '@mapzone/kit';
import type { CommonDataKey } from '@mapzone/map-services';
import type { BizMzMetadataTableProps } from './types';
import type { BizMetadataQueryFormProps } from '../form';
import { getTableActions } from '@/constants';

/** 元数据表格 */
export const MzMetadataTable = <T extends Record<string, any>>(props: BizMzMetadataTableProps<T>) => {
  const {
    dataName,
    dataTitle = '',
    primaryKey = 'PK_UID',
    metadataList: propsMetadataList,
    params: propsParams,
    toolBarRender,
    tableColumnConfigs,
    optionColumnConfig,
    hideSort = true,
    hideAdd,
    hideMultipleDelete,
    addInitialValues,
    hideDetails,
    hideEdit,
    hideDelete,
    hideQueryForm,
    hideRecordOptions,
    formProps,
    filter,
    customInsertOrUpdateRecord,
    customDeleteByIds,
    queryFormProps,
    hideInTableFieldNames,
    actionRef: propsActionRef,
    renderExtraContent,
    ...restProps
  } = props;
  const [metadataList, setMetadataList] = useState<TMetadata[]>([]);
  const [columns, setColumns] = useState<MzProTableProps<T>['columns']>([]);
  const [addOrEditFormOpen, setAddOrEditFormOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpenVisible] = useState<boolean>(false);
  const [editRecord, setEditRecord] = useState<Partial<T>>();
  const [defaultGroupConfig, setDefaultGroupConfig] = useState<Record<string, string[]>>();
  const orderByRef = useRef<OrderByType>();
  const filterRef = useRef<string>();
  const [updateFilter, setUpdateFilter] = useState<string | undefined>(filterRef.current);
  const actionRef = useRef<ActionType>();
  const { dynamicFormRef, MzDynamicForm } = useMzDynamicForm();
  const columnsRef = useRef<MzProTableProps<T>['columns']>([]);
  columnsRef.current = columns;

  /** 查询数据 */
  const queryData: Required<MzProTableProps<T>>['request'] = async (params = {}) => {
    const { pageSize = 10, current = 1, queryProps, ...restParams } = params;
    const dataList = await queryDataList<T>({
      dataName,
      pageIndex: current,
      pageSize,
      ...restParams,
      ...propsParams,
      filter: filterRef.current,
      orderBy: orderByRef.current?.orderByStr || primaryKey,
    });
    const count = await queryConut({ dataName, filter: filterRef.current });

    return {
      data: dataList,
      success: true,
      total: count,
    };
  };

  const setFilter = (filter?: string) => {
    filterRef.current = filter;
    setUpdateFilter(filter);
  };

  /** query form 查询 */
  const onFinish: Required<BizMetadataQueryFormProps>['onFinish'] = async (newFilter: string = '') => {
    let filterStr = filter;
    if (!filterStr) {
      filterStr = newFilter;
    } else if (newFilter) {
      filterStr += ` and ${newFilter}`;
    }
    setFilter(filterStr);
    actionRef.current?.reload();
  };

  /** query form 重置 */
  const onReset = () => {
    onFinish(filter || '', {});
  };

  /** 排序 */
  const onSortChange = (orderBy: OrderByType) => {
    if (!orderByRef.current || orderByRef.current.orderByStr !== orderBy.orderByStr) {
      orderByRef.current = orderBy;
      const { orderByArr } = orderBy;
      if (orderByArr && orderByArr.length > 0) {
        const newColumns = columnsRef.current.map((c) => {
          const sortConfig = orderByArr.find((s) => c.dataIndex === s.fieldname);
          const sortOrder: SortOrder | undefined = sortConfig ? (sortConfig.sort === 'ASC' ? 'ascend' : 'descend') : undefined;
          return { ...c, sortOrder, sorter: !sortConfig ? undefined : { multiple: -1 } };
        });
        setColumns(newColumns);
      }

      actionRef.current?.reload();
    }
  };

  const onTableChange: Required<BizMzMetadataTableProps<T>>['onChange'] = (pageInfo, _filter, sorter) => {
    orderByRef.current = {
      orderByStr: '',
      orderByArr: [],
    };
    if (sorter) {
      let sortConfig = sorter as any;
      if (Array.isArray(sortConfig)) {
        sortConfig = sortConfig[0];
      }
      const { field, order } = sortConfig;
      const fieldname = field;
      if (order) {
        const sortType = order === 'ascend' ? 'ASC' : 'DESC';
        orderByRef.current = {
          orderByStr: `${fieldname} ${sortType}`,
          orderByArr: [{ fieldname, sort: sortType }],
        };
      }
    }

    actionRef.current?.reload();
  };

  /** 添加 */
  const onAddClick = () => {
    setAddOrEditFormOpen(true);
    const temp: Partial<T> = addInitialValues || {};
    setEditRecord({ ...temp });
  };

  /** 详情 */
  const onDetailsClick = (record: T) => {
    setDetailsModalOpenVisible(true);
    setEditRecord(record);
  };

  /** 编辑 */
  const onEditClick = (record: T) => {
    setAddOrEditFormOpen(true);
    setEditRecord(record);
  };

  /** 关闭表单弹层 */
  const onAddOrEditFormModalCancel = () => {
    setAddOrEditFormOpen(false);
  };

  const addOrEditCallback = (success: boolean, text: string) => {
    if (success) {
      onAddOrEditFormModalCancel();
      message.success(`${text}成功`);
      actionRef.current?.reload();
    } else {
      message.error(`${text}失败`);
    }
  };

  /** 添加或保存 确定 */
  const onAddOrEditFormModalOk = async () => {
    const fomValues = await dynamicFormRef.current.validateFields();
    if (!fomValues) {
      return;
    }
    const isAdd = !editRecord![primaryKey];
    const optionText = isAdd ? '新增' : '更新';
    /** 自定义请求方式 */
    if (typeof customInsertOrUpdateRecord === 'function') {
      const { success } = await customInsertOrUpdateRecord({ dataName, data: { ...editRecord, ...fomValues } }, isAdd);
      addOrEditCallback(success, optionText);
    } else {
      const { success } = await insertOrUpdateRecord({ dataName, data: { ...editRecord, ...fomValues } }, isAdd);
      addOrEditCallback(success, optionText);
    }
  };

  const deleteCallback = (success: boolean) => {
    if (success) {
      message.success('删除成功');
      actionRef.current?.reload();
    } else {
      message.error('');
    }
  };

  const onDelete = async (ids: CommonDataKey[]) => {
    if (typeof customDeleteByIds === 'function') {
      const deleted = await customDeleteByIds({ dataName, ids });
      deleteCallback(deleted);
    } else {
      const deleted = await deleteByIds({ dataName, ids });
      deleteCallback(deleted);
    }
  };

  /** 删除 */
  const onDeleteRecordClick = async (record: T) => {
    onDelete([record[primaryKey]]);
  };

  /** 多选删除 */
  const onMultipleDeleteClick = async (rows: { selectedRowKeys?: (string | number)[] | undefined; selectedRows?: T[] | undefined }) => {
    ModalTips({
      title: '确定删除当前选中字典吗？',
      onOk: async () => onDelete(rows.selectedRowKeys || []),
    });
  };

  const internalToolBarRender = useCallback(
    (
      action: ActionType | undefined,
      params: {
        selectedRowKeys?: (string | number)[] | undefined;
        selectedRows?: T[] | undefined;
      },
    ) => {
      let toolItems: ReactNode[] = [];
      if (toolBarRender) {
        toolItems = toolBarRender(action, { ...params }, metadataList);
      }
      if (!hideAdd) {
        toolItems.push(
          <Button key="add" type="primary" icon={<PlusCircleOutlined />} onClick={onAddClick}>
            新增
          </Button>,
        );
      }
      if (!hideMultipleDelete) {
        toolItems.push(
          <Button
            key="all-delete"
            danger
            type="primary"
            disabled={!(params.selectedRowKeys || []).length}
            icon={<DeleteOutlined />}
            onClick={() => onMultipleDeleteClick(params)}
          >
            删除
          </Button>,
        );
      }
      if (!hideSort) {
        toolItems.push(<MzAdvancedSort key="mz-sort" fieldList={metadataList} onChange={onSortChange} />);
      }
      return toolItems;
    },
    [toolBarRender, hideSort, metadataList, hideAdd],
  );

  useEffect(() => {
    setFilter(filter);
    actionRef.current?.reload();
  }, [filter]);

  useEffect(() => {
    // 获取默认分组信息
    const groupConfig = getGroupConfigByMetadataList(metadataList);
    setDefaultGroupConfig(groupConfig);
  }, [metadataList]);

  useEffect(() => {
    const cols = transformColumns<T>(metadataList, tableColumnConfigs, hideInTableFieldNames);
    if (!hideDetails || !hideEdit || !hideDelete || optionColumnConfig) {
      const defaultRender: Required<MzProTableColumnType<T>>['render'] = (_, record, index) => (
        <Space onClick={(e) => e.stopPropagation()} className="options-column">
          {optionColumnConfig?.render?.(record, index)}
          {!hideDetails && (
            <Button size="small" type="link" onClick={() => onDetailsClick(record)}>
              详情
            </Button>
          )}
          {!hideEdit && (
            <Button size="small" type="link" onClick={() => onEditClick(record)}>
              编辑
            </Button>
          )}
          {!hideDelete && (
            <Popconfirm title="确认删除此数据吗？" onConfirm={() => onDeleteRecordClick(record)}>
              <Button size="small" type="link">
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      );

      if (!hideRecordOptions) {
        cols.push({
          ...getTableActions({ width: 180 }),
          ...optionColumnConfig,
          render: defaultRender,
        });
      }
    }
    setColumns(cols);
  }, [metadataList, tableColumnConfigs, hideDetails, hideEdit, hideDelete, hideInTableFieldNames]);

  useImperativeHandle(propsActionRef, () => actionRef.current);

  useEffect(() => {
    if (propsMetadataList && propsMetadataList.length > 0) {
      setMetadataList(propsMetadataList);
    } else if (dataName) {
      queryMetadataList(dataName).then((dataList) => {
        setMetadataList(dataList);
      });
    }
    actionRef.current?.reload();

    return () => {};
  }, [dataName]);

  if (!dataName) {
    return null;
  }

  return (
    <>
      {(!hideAdd || !hideEdit) && addOrEditFormOpen && (
        <RndModal
          title={`${dataTitle} ${!editRecord![primaryKey] ? '新增' : '编辑'}`}
          open={addOrEditFormOpen}
          width={900}
          onCancel={onAddOrEditFormModalCancel}
          onOk={onAddOrEditFormModalOk}
        >
          <MzDynamicForm metadataList={metadataList} groupConfig={defaultGroupConfig} initialValues={editRecord} {...formProps} />
        </RndModal>
      )}
      {!hideDetails && detailsModalOpen && (
        <BizDetailModal
          title={`${dataTitle} 详情`}
          metadataList={metadataList}
          detail={editRecord}
          open={detailsModalOpen}
          onCancel={() => setDetailsModalOpenVisible(false)}
        />
      )}
      {!hideQueryForm && (
        <BizMetadataQueryForm
          metadataList={metadataList}
          tableName={dataName}
          onFinish={onFinish}
          onResetMethod={onReset}
          {...queryFormProps}
        />
      )}
      {typeof renderExtraContent === 'function' ? renderExtraContent(updateFilter) : null}
      <MzProTable
        rowKey={primaryKey}
        actionRef={actionRef}
        rowSelection={{}}
        columns={columns}
        request={queryData}
        toolBarRender={internalToolBarRender}
        useExtendsSorter={!hideSort}
        onChange={onTableChange}
        {...restProps}
      />
    </>
  );
};

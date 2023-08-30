import { useEffect, useMemo, useRef, useState } from 'react';
import { Space, Tooltip } from 'antd';
import classNames from 'classnames';
import { RndProvider } from '@mapzone/rnd-provider';
import { CloseOutlined, DoubleLeftOutlined, MinusOutlined } from '@ant-design/icons';
import { SxbBase } from '@mapzone/icons';
import { FsFeature, wktFormat } from '@mapzone/map-kit';
import { useSelectionsEventListener } from '@mapzone/hooks';
import { BizBatchAssiButton, BizFilter, BizProTable, BizShapeImport, BizSummaryStatistics, transformColumns } from '@/components';
import { BizFieldsCalculation } from '../biz-fields-calculation';
import { queryGeoAndAttrList, queryMetadataList, queryGeoAndAttrCount } from '@/services';
import { defaultPaginationInfo } from '@/constants';
import { getNewFilterByZq } from '@/utils';
import type { Key, ReactNode } from 'react';
import type { BizMetadataItem, PaginationInfo } from '@/types';
import type { QueryGeoAndAttrListParams, QueryGeoAndAttrCountParams } from '@/services';
import type { FsFC, QueryGeoAndAttrsParams } from '@mapzone/types';
import type { BizProTableProps, BizFilterProps } from '@/components';
import type { AttributeTableDataItem } from './types';
import type { IFsMap } from '@mapzone/map-kit';
import './index.less';

type ActionRenderParams = {
  selectedRowKeys?: Key[];
  selectedRows?: Record<string, any>[];
};

const fitPadding = [20, 20, 20, 20];

export type BizAttributeTableProps = Omit<BizProTableProps<AttributeTableDataItem>, 'columns' | 'title'> &
  Pick<QueryGeoAndAttrListParams, 'tableName' | 'layerId' | 'filter' | 'geometry'> & {
    /** 打开属性表类型 */
    querySourceType?: string;
    /** 获取元数据请求,获取表头 */
    getMetadataList?: (dataName: string) => Promise<BizMetadataItem[]>;
    /** 获取表格数据  */
    getDataSource?: (params: QueryGeoAndAttrsParams) => Promise<Record<string, any>[]>;
    /** 获取记录数量 */
    getCount?: (params: QueryGeoAndAttrCountParams) => Promise<number>;
    /**
     * 主键
     * @default `PK_UID`
     */
    rowKey?: string;
    reloadFlag?: string;
    className?: string;
    /** 元数据改变 */
    onMetadataListChange?: (metadataList: BizMetadataItem[]) => void;
    /** 总数量变更 */
    onTotalChange?: (total: number) => void;
    /** 数据列表变更 */
    onDataSourceChange?: (dataList: AttributeTableDataItem[]) => void;

    /** 隐藏 批量赋值 */
    hideBatchAssign?: boolean;
    /** 隐藏 字段值计算 */
    hideFieldsCalculation?: boolean;
    /** 隐藏 shape 导入 */
    hideShapeImport?: boolean;
    /** 隐藏 汇总统计 */
    hideSummaryStatistics?: boolean;

    fsMap: IFsMap;
    /** 标题 */
    title?: string;

    /** 自定义扩展菜单 */
    extraActionsRender?: (params: ActionRenderParams) => ReactNode[];
    open: boolean;
    onOpenChange: (open: boolean) => void;

    /** 是否隐藏筛选 */
    hideFilter?: boolean;

    /** 政区code */
    zqCode?: string;
  };

const prefixCls = 'biz-attribute-table';

/** 业务属性表 */
const BizAttributeTable: FsFC<BizAttributeTableProps> = (props) => {
  const {
    tableName,
    rowKey = 'PK_UID',
    title = '属性表',
    className,
    layerId,
    filter,
    reloadFlag,
    onMetadataListChange,
    onTotalChange,
    onDataSourceChange,
    dataSource,
    extraActionsRender,
    fsMap,
    open,
    onOpenChange,
    getCount,
    getDataSource,
    getMetadataList,
    hideFilter = false,
    hideBatchAssign = false,
    hideFieldsCalculation = false,
    hideShapeImport = false,
    hideSummaryStatistics = false,
    zqCode,
    querySourceType,
    ...restProps
  } = props;

  const [metadataList, setMetadataList] = useState<BizMetadataItem[]>([]);
  const [columns, setColumns] = useState<BizProTableProps<AttributeTableDataItem>['columns']>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<readonly AttributeTableDataItem[]>([]);
  const paramsRef = useRef<Partial<QueryGeoAndAttrListParams>>({ tableName });
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPaginationInfo);
  const [total, setTotal] = useState<number>(0);
  const [minus, setMinus] = useState<boolean>(false);
  const [filterCollapsed, setFilterCollapsed] = useState<boolean>(false);
  /** 是否已同步选择集 */
  const isSyncSectionsRef = useRef<boolean>();

  const extraActions = useMemo(() => {
    let extraActions: ReactNode[] = [];
    if (extraActionsRender) {
      extraActions = [...extraActionsRender({ selectedRowKeys, selectedRows }), ...extraActions];
      return extraActions;
    }
    return [];
  }, [extraActionsRender, selectedRowKeys, selectedRows]);

  const onMetadataListChangeRef = useRef(onMetadataListChange);
  onMetadataListChangeRef.current = onMetadataListChange;
  const onTotalChangeRef = useRef(onTotalChange);
  onTotalChangeRef.current = onTotalChange;
  const onDataSourceChangeRef = useRef(onDataSourceChange);
  onDataSourceChangeRef.current = onDataSourceChange;

  /** 查询元数据 */
  const internalGetMetadataList = async (tableName: string) => {
    let metadataList: BizMetadataItem[];
    /** 自定义请求元数据  */
    if (getMetadataList) {
      metadataList = await getMetadataList(tableName);
    } else {
      metadataList = await queryMetadataList(tableName);
    }
    if (onMetadataListChangeRef.current) {
      onMetadataListChangeRef.current(metadataList);
    }
    setMetadataList(metadataList);
  };

  /* 根据条件 查询数据 */
  const queryDataList = async (parms: QueryGeoAndAttrListParams) => {
    let newDataList: Record<string, any>[];
    /** 自定义查询数据列表  */
    if (getDataSource) {
      newDataList = await getDataSource(parms);
    } else {
      newDataList = await queryGeoAndAttrList(parms);
    }
    return newDataList;
  };

  /* 获取数据 */
  const getDataList = async (parms: QueryGeoAndAttrListParams) => {
    setLoading(true);
    const newParams = { ...paramsRef.current, ...parms };
    paramsRef.current = newParams;
    const newDataList = await queryDataList(newParams);
    setLoading(false);
    if (onDataSourceChangeRef.current) {
      onDataSourceChangeRef.current(newDataList);
    }
    setDataList(newDataList);
  };

  /** 查询数量 */
  const getDataCount = async (params: QueryGeoAndAttrCountParams) => {
    let newTotal: number;
    /** 自定义查询数量  */
    if (getCount) {
      newTotal = await getCount(params);
    } else {
      newTotal = await queryGeoAndAttrCount(params);
    }
    if (onTotalChangeRef.current) {
      onTotalChangeRef.current(newTotal);
    }
    setTotal(newTotal);
  };

  const onFilterChange: BizFilterProps['onChange'] = (params) => {
    const newPageInfo = defaultPaginationInfo;
    const queryParams = {
      ...paramsRef.current,
      tableName,
      filter: params.filter,
      geometry: params.geometry,
      ...newPageInfo,
    };
    setPagination(defaultPaginationInfo);
    getDataList(queryParams);
    getDataCount({ tableName, filter });
  };

  const onTableChange: Required<BizProTableProps<AttributeTableDataItem>>['onChange'] = (pageInfo, _filter, sorter) => {
    let sorterStr = '';
    if (sorter) {
      let sortConfig = sorter as any;
      if (Array.isArray(sortConfig)) {
        sortConfig = sortConfig[0];
      }
      const { field, order } = sortConfig;
      const fieldname = field;
      if (order) {
        const sortType = order === 'ascend' ? 'ASC' : 'DESC';
        sorterStr = `${fieldname} ${sortType}`;
      }
    }

    const newPageInfo = {
      pageIndex: pageInfo.current || defaultPaginationInfo.pageIndex,
      pageSize: pageInfo.pageSize || defaultPaginationInfo.pageSize,
    };
    setPagination(newPageInfo);
    getDataList({
      ...paramsRef.current,
      tableName,
      orderBy: sorterStr,
      ...newPageInfo,
    });
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  /** 定位当前选择集 */
  const locationSelection = () => {
    if (fsMap.selections.getSelections().length > 0) {
      const extent = fsMap.selections.highlightLayer.getSource()!.getExtent();
      fsMap.olMap.getView().fit(extent, { padding: fitPadding });
    }
  };

  /** 批量添加高亮 */
  const batchAddSelections = async (rows: AttributeTableDataItem[]) => {
    if (querySourceType !== 'my-network') {
      const noShapeRecords = rows.filter((v) => !v.SHAPE);
      if (noShapeRecords.length) {
        const primaryKeyFilter =
          noShapeRecords.length === 1
            ? `${rowKey}=${noShapeRecords[0][rowKey]}`
            : `${rowKey} in (${noShapeRecords.map((v) => v[rowKey]).join()})`;
        const newFilter = getNewFilterByZq(primaryKeyFilter, zqCode || '');
        const dataList = await queryDataList({
          tableName,
          filter: newFilter,
          pageIndex: 1,
          pageSize: noShapeRecords.length,
          selectType: 1,
          type: 1,
          resultGeoByWkt: 1,
        });
        dataList.forEach((item) => {
          const key = item[rowKey];
          const index = rows.findIndex((c) => c[rowKey] === key);
          if (index > -1) {
            rows[index].SHAPE = item.SHAPE;
          }
        });
      }

      const features: FsFeature[] = [];
      rows.forEach((item) => {
        let geomData = item.SHAPE;
        if (geomData) {
          const feature = wktFormat.readFeature(geomData);
          const fsFeature = new FsFeature(feature);
          fsFeature.setId(`${item[rowKey]}${layerId}`);
          fsFeature.set('layerId', layerId);
          fsFeature.set(rowKey, rowKey);
          fsFeature.layerId = layerId || '';
          features.push(fsFeature);
        }
      });
      if (features.length > 0) {
        fsMap.selections.addSelectionByFeatures(features);
      }
    } else {
      const layer = fsMap.getLayerById(layerId!);
      const ids = rows.map((s) => s.featureId);
      const features = await layer.getFeatureByIds(ids);
      fsMap.selections.addSelectionByFeatures(features);
    }
    isSyncSectionsRef.current = true;

    locationSelection();
  };

  const onTableSelectionChange = (keys: Key[], rows: AttributeTableDataItem[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
    const ids: string[] = [];
    dataList.forEach((item) => {
      const itemKey = item[rowKey];
      if (!keys.includes(itemKey)) {
        ids.push(`${item[rowKey]}${layerId}`);
      }
    });
    fsMap.selections.removeSelectionByIds(ids);
    if (rows.length > 0) {
      batchAddSelections(rows);
    }
  };

  const queryDataAndCount = () => {
    const newPageInfo = defaultPaginationInfo;
    setPagination(defaultPaginationInfo);
    getDataList({
      ...paramsRef.current,
      tableName,
      filter,
      ...newPageInfo,
    });
    getDataCount({ tableName, filter });
  };

  /** 批量赋值成功 */
  const refreshTable = () => {
    const queryParams = {
      ...paramsRef.current,
      tableName,
    };
    getDataList(queryParams);
  };

  const getDefaultSizeAndPosition = () => {
    const mapContainer = document.querySelector('.biz-base-map-container');
    let y = 500;
    if (mapContainer) {
      const { height } = mapContainer.getBoundingClientRect();
      y = height - 440;
    }
    return { position: { x: 330, y }, size: { width: '75%', height: 400 } };
  };

  // 同步选择集变更
  useSelectionsEventListener(fsMap.selections.event, 'selectionsChange', (params) => {
    if (isSyncSectionsRef.current) {
      isSyncSectionsRef.current = false;
      return;
    }
    const { selections, length } = params;
    if (length === 0) {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    } else {
      const sKeys = selections.map((f) => f.get(rowKey));
      const newRows = dataList.filter((f) => sKeys.includes(f[rowKey]));
      const newKeys = newRows.map((f) => f[rowKey]);
      setSelectedRows(newRows);
      setSelectedRowKeys(newKeys);
    }
  });

  useEffect(() => {
    paramsRef.current.tableName = tableName;
    internalGetMetadataList(tableName);
    fsMap.selections.clear();
    isSyncSectionsRef.current = true;
  }, [tableName, layerId]);

  useEffect(() => {
    queryDataAndCount();
  }, [tableName, filter, reloadFlag, layerId]);

  useEffect(() => {
    const columns = transformColumns<AttributeTableDataItem>(metadataList);
    setColumns(columns);
  }, [metadataList]);

  useEffect(() => {
    if (typeof dataSource !== 'undefined') {
      setDataList(dataSource);
    }
  }, [dataSource]);

  useEffect(() => {
    if (open) {
      setMinus(false);
    }
    fsMap.selections.clear();
  }, [open]);

  return (
    <>
      <RndProvider
        bounds=".biz-map-container"
        getDefaultSizeAndPosition={getDefaultSizeAndPosition}
        className={classNames(`${prefixCls}-rnd-provider`, {
          'animate-fadeOutDown': minus,
          'animate-fadeInUp': !minus,
          hidden: !open,
        })}
        dragHandleClassName="attr-table-drag-handle"
        minHeight={260}
        minWidth={800}
      >
        <div className={classNames(`${prefixCls}-wrapper`, className)}>
          <div className="header attr-table-drag-handle">
            <span className="title">{title}</span>
            <div className="extra-content">
              <Space key="extra">
                {extraActions}
                {!hideBatchAssign && (
                  <BizBatchAssiButton
                    key="batch-assign"
                    tableName={tableName}
                    selectedKeys={selectedRowKeys}
                    recordCount={total}
                    onOk={refreshTable}
                  />
                )}
                {!hideFieldsCalculation && (
                  <BizFieldsCalculation
                    fsMap={fsMap}
                    key="field-calculation"
                    tableName={tableName}
                    selectedRowKeys={selectedRowKeys}
                    recordCount={total}
                    onOk={refreshTable}
                  />
                )}
                {!hideShapeImport && <BizShapeImport key="shape-import" tableName={tableName} onImportSuccess={queryDataAndCount} />}
                {!hideSummaryStatistics && layerId && (
                  <BizSummaryStatistics
                    key="summary-statistics"
                    fsMap={fsMap}
                    tableName={tableName}
                    layerId={layerId}
                    metadataList={metadataList}
                  />
                )}
              </Space>
              <div className="option-item minus" onClick={() => setMinus(!minus)}>
                <MinusOutlined />
              </div>
              <div className="option-item close" onClick={() => onOpenChange(!open)}>
                <CloseOutlined />
              </div>
            </div>
          </div>
          <div className="body">
            {!hideFilter && (
              <>
                <span
                  className={classNames('filter-collapsed-icon', { collapsed: filterCollapsed })}
                  onClick={() => setFilterCollapsed(!filterCollapsed)}
                >
                  <Tooltip title={`${filterCollapsed ? '展开' : '收起'}筛选`}>
                    <DoubleLeftOutlined />
                  </Tooltip>
                </span>
                <div className={classNames('sidebar', { hidden: filterCollapsed })}>
                  <BizFilter tableName={tableName} fsMap={fsMap} metadataList={metadataList} onChange={onFilterChange} />
                </div>
              </>
            )}
            <BizProTable<AttributeTableDataItem>
              options={false}
              columns={columns}
              dataSource={dataList}
              rowKey={rowKey}
              onChange={onTableChange}
              loading={loading}
              pagination={{
                current: pagination.pageIndex,
                pageSize: pagination.pageSize,
                total,
                showLessItems: true,
              }}
              rowSelection={{
                selectedRowKeys,
                onChange: onTableSelectionChange,
              }}
              onRow={() => ({
                onClick: () => {
                  fsMap.selections.clear();
                },
              })}
              className={classNames(prefixCls, className)}
              {...restProps}
            />
          </div>
        </div>
      </RndProvider>
      <div className={classNames(`${prefixCls}-minus-icon`, className, { hidden: !minus || !open })} onClick={() => setMinus(false)}>
        <Tooltip title="属性表">
          <SxbBase />
        </Tooltip>
      </div>
    </>
  );
};

export { BizAttributeTable };

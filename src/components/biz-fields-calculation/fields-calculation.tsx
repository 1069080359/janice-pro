import React, { useEffect, useReducer, useRef } from 'react';
import { Button, Input, Modal, Radio, Select, Space, Table, Tree, message } from 'antd';
import { queryModelList } from '@mapzone/map-services';
import { ExclamationCircleFilled } from '@ant-design/icons';
import RndModal from '@mapzone/modal';
import { debounce, getLocalStorageItem, getSessionStorageItem, setLocalStorageItem, setSessionStorageItem } from '@mapzone/utils';
import { ZdzjsMap, WbMap, RqMap, SzMap } from '@mapzone/icons';
import { useScaleSizeAndScale } from '@mapzone/hooks';
import { getWebAppConfig } from '@/utils';
import { getSystemFields, queryMetadataList } from '@/services';
import { initialState, reducer } from './reducer';
import { checkValueSymbol, FIELD_TYPE, functionMethodList, funTypeRadioList } from './utils';
import { attributeCheckExpression, attributeUpdateField } from './services';
import type { TableColumnProps } from 'antd';
import type { FsFC, PermissionRuleModelInfo, TMetadata } from '@mapzone/types';
import type { FieldCheckExpressionParams, BizFieldsCalculationPorps, State } from './types';
import './index.less';

const prefixCls = 'biz-field-calculation';

const INPUTDOMID = 'sql-input';

const { confirm } = Modal;

const renderTableIcon = (type: string) => {
  switch (type) {
    case '文本':
      return <WbMap />;
    case '日期':
      return <RqMap />;
    case '数值':
      return <SzMap />;
  }
};

/** 字段值计算 */
export const BizFieldsCalculation: FsFC<BizFieldsCalculationPorps> = (props) => {
  const { layerId, tableName, fsMap, selectedRowKeys, recordCount, filter, persistence, onOk } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const filedsTableDataRef = useRef<TMetadata[]>([]);
  const filedsSelectDataRef = useRef<TMetadata[]>([]);
  const { open, filedsTableData, funType, sqlValue, filedsSelectData, targetField, updateType, loading } = state;
  const { scaledSize: tableScrollY } = useScaleSizeAndScale(250);
  const cacheKey = `-field-calc-${tableName}`;

  /**
   * 获取字段列表
   * @param layer
   */
  const getFiledList = async (dataName: string) => {
    const {
      appSettings: { fieldCalcConfig = {} },
    } = getWebAppConfig();
    dispatch({ type: 'update', loading: true });
    let newFieldList = await queryMetadataList(dataName);
    dispatch({ type: 'update', loading: false });
    const systemFields = await getSystemFields();
    newFieldList = newFieldList.filter((v) => !v.disabled && !systemFields.includes(v.fieldname));
    const calcFields = fieldCalcConfig[dataName];
    if (calcFields) {
      newFieldList = newFieldList.filter((v) => calcFields.includes(v.fieldname));
    }
    const tableData = [...newFieldList];
    const res = await queryModelList(dataName).catch(() => undefined);
    let modelList: PermissionRuleModelInfo[] = [];
    if (res && res.success) {
      modelList = res.datas || [];
    }
    const model = modelList.find((v) => v.isChecked);
    if (model) {
      newFieldList = newFieldList.filter((v) => !model.c_fields.includes(v.fieldname));
    }
    dispatch({ type: 'update', filedsTableData: tableData, filedsSelectData: newFieldList });
    filedsTableDataRef.current = tableData;
    filedsSelectDataRef.current = newFieldList;
  };

  const onCancel = () => {
    dispatch({
      type: 'update',
      open: false,
      targetField: undefined,
      sqlValue: undefined,
      updateType: undefined,
      loading: false,
      filedsTableData: [],
      filedsSelectData: [],
    });
  };

  const columns: TableColumnProps<TMetadata>[] = [
    {
      title: '字段',
      dataIndex: 'fieldAliasName',
      ellipsis: true,
      render: (_text, record) => <span>{`${record.fieldAliasName}(${record.fieldname})`}</span>,
    },
    {
      title: '类型',
      dataIndex: 'dataType',
      width: 80,
      render: (_text, record) => (
        <>
          {renderTableIcon(FIELD_TYPE[record.dataType])}
          <span>{FIELD_TYPE[record.dataType]}</span>
        </>
      ),
    },
  ];

  const errConfirm = (msg: string) => {
    return confirm({
      title: '语句执行验证失败',
      className: 'sql-confirm',
      icon: <ExclamationCircleFilled />,
      content: msg,
      okText: '知道了',
      cancelButtonProps: {
        className: 'cancel-btn',
      },
    });
  };

  const getCheckAndSubmitParams = () => {
    const filterCondition = filter;
    const params: FieldCheckExpressionParams = {
      expression: sqlValue!,
      tableName: tableName,
      updateField: targetField!,
    };
    if (updateType === 'all') {
      params.filterCondition = filterCondition;
    } else if (selectedRowKeys?.length > 0) {
      params.ids = selectedRowKeys;
    }
    return params;
  };

  /**
   * sql语句检查
   */
  const onCheckFieldSql = async (callback?: () => void) => {
    const isCnSymbol = checkValueSymbol(sqlValue!);
    if (isCnSymbol) {
      errConfirm('语句中不允许输入中文单引号或者双引号');
      return;
    }
    const params = getCheckAndSubmitParams();
    const res = await attributeCheckExpression(params);
    if (res?.datas) {
      if (typeof callback === 'function') {
        callback();
      } else {
        message.success('语句检查成功');
      }
    } else {
      errConfirm(res?.msg || '');
    }
  };

  /**
   * 更新计算的小斑
   */
  const onUpdateFeture = () => {
    if (layerId) {
      fsMap.event.emit('refreshLayerFeatureByIds', {
        layerId,
        addOrEditIds: selectedRowKeys,
      });
    }
  };

  /**
   * 执行
   */
  const onSubmit = () => {
    if (updateType === 'selected' && selectedRowKeys.length === 0) {
      message.warning('列表选择记录为0，请至少勾选一条记录');
      return;
    }
    onCheckFieldSql(() => {
      return confirm({
        title: '字段值计算执行后无法撤销，您确定要执行吗？',
        icon: <ExclamationCircleFilled />,
        onOk: async () => {
          const params = getCheckAndSubmitParams();
          const res = await attributeUpdateField(params);
          if (res?.success) {
            message.success('字段值计算更新成功');
            onUpdateFeture();
            if (onOk) {
              onOk();
            }
            if (persistence) {
              if (persistence.persistenceType === 'localStorage') {
                setLocalStorageItem(cacheKey, updateType);
              } else {
                setSessionStorageItem(cacheKey, updateType);
              }
            }
            onCancel();
          } else {
            message.error(res?.msg);
          }
        },
      });
    });
  };

  /**
   * 表格搜索
   */
  const onSearch = debounce((value: string, type: 'table' | 'select') => {
    const searchValue = value.replace(/\s*/g, '');
    let searchFiledList = [];
    const data = type === 'table' ? filedsTableDataRef.current : filedsSelectDataRef.current;
    if (searchValue) {
      searchFiledList = data.filter(
        (v) => v.fieldAliasName.includes(searchValue) || v.fieldname.toUpperCase().includes(searchValue.toUpperCase()),
      );
    } else {
      searchFiledList = data;
    }
    if (type === 'table') {
      dispatch({ type: 'update', filedsTableData: [...searchFiledList] });
    } else if (type === 'select') {
      dispatch({ type: 'update', filedsSelectData: [...searchFiledList] });
    }
  }, 500);

  /**
   * 在光标处插入值
   * @param selectFiledName
   */
  const insert = (value: string, type: 'field' | 'method') => {
    const inputDom = document.getElementById(INPUTDOMID);
    if (inputDom) {
      // @ts-ignore
      const selectionStart = inputDom?.selectionStart;
      // @ts-ignore
      const selectionEnd = inputDom?.selectionEnd;
      const insertValue = type === 'field' ? `[${value}]` : value;
      let inputValue = sqlValue ? sqlValue + insertValue : insertValue;
      if (selectionStart && sqlValue) {
        inputValue = sqlValue.substring(0, selectionStart) + insertValue + sqlValue.substring(selectionEnd);
      }
      dispatch({ type: 'update', sqlValue: inputValue });
    }
  };

  /**
   * 表格行双击选择
   * @param record
   */
  const onRowSelect = (record: TMetadata) => {
    const selectFiledName = record.fieldname;
    insert(selectFiledName, 'field');
  };

  /**
   * 选择函数方法
   * @param value
   */
  const onfunMethodSelect = (value: React.Key[]) => {
    const methodValue = value[0] as string;
    if (methodValue) {
      insert(methodValue, 'method');
    }
  };

  const renderFooter = () => {
    return (
      <div className="modal-footer">
        <Radio.Group value={updateType} onChange={(e) => dispatch({ type: 'update', updateType: e.target.value })}>
          <Radio value="selected" disabled={selectedRowKeys.length === 0}>
            对列表选择记录操作（<span className="highlight-txt">{selectedRowKeys.length}</span>条记录）
          </Radio>
          <Radio value="all">
            对列表结果操作<span className="highlight-txt">{recordCount}</span>条记录）
          </Radio>
        </Radio.Group>
        <div className="right-btn">
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={onSubmit} disabled={!sqlValue || !targetField} type="primary">
            执行
          </Button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (fsMap && tableName && open) {
      getFiledList(tableName);
    }
  }, [fsMap, tableName, open]);

  useEffect(() => {
    if (persistence) {
      let catchUpdatType: string;
      if (persistence.persistenceType === 'localStorage') {
        catchUpdatType = getLocalStorageItem(cacheKey);
      } else {
        catchUpdatType = getSessionStorageItem(cacheKey);
      }
      let selectType;
      if (catchUpdatType) {
        selectType = catchUpdatType === 'selected' && selectedRowKeys.length === 0 ? 'all' : catchUpdatType;
      } else {
        selectType = selectedRowKeys.length > 0 ? 'selected' : 'all';
      }
      dispatch({ type: 'update', updateType: selectType as State['updateType'] });
    } else {
      const selectType = selectedRowKeys.length > 0 ? 'selected' : 'all';
      dispatch({ type: 'update', updateType: selectType });
    }
  }, [open, tableName, selectedRowKeys]);

  return (
    <>
      <div className={`${prefixCls}-btn`}>
        <Button icon={<ZdzjsMap />} onClick={() => dispatch({ type: 'update', open: true })}>
          字段值计算
        </Button>
      </div>
      <RndModal
        title="字段值计算"
        open={open}
        width={862}
        onCancel={onCancel}
        className={`${prefixCls}-modal`}
        onOk={onSubmit}
        footer={renderFooter()}
      >
        <div className="modal-container">
          <div className="field-list">
            <div className="header">
              字段列表
              <span className="desc">（双击字段快速填写字段名）</span>
            </div>
            <Input placeholder="搜索字段" allowClear onChange={(e) => onSearch(e.target.value, 'table')} />
            <Table
              dataSource={filedsTableData}
              bordered
              rowKey={(record) => record.fieldname}
              size="small"
              loading={loading}
              columns={columns}
              pagination={false}
              scroll={{ y: tableScrollY }}
              onRow={(record) => ({
                onDoubleClick: () => onRowSelect(record),
              })}
            />
          </div>
          <div className="field-type">
            <div className="header">函数类型</div>
            <Radio.Group onChange={(e) => dispatch({ type: 'update', funType: e.target.value })} value={funType}>
              <Space direction="vertical">
                {funTypeRadioList.map((v) => {
                  return (
                    <Radio key={v.value} value={v.value}>
                      {v.title}
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>
          <div className="field-fun">
            <div className="header">函数列表</div>
            <Tree treeData={functionMethodList[funType]} onSelect={onfunMethodSelect} />
          </div>
        </div>
        <div className="modal-bottom">
          <div className="title">
            更新目标字段：
            <Select
              showSearch
              className="target-filed-select"
              filterOption={false}
              placeholder="请选择更新目标字段"
              onSearch={(value) => onSearch(value, 'select')}
              onSelect={(value) => dispatch({ type: 'update', targetField: value, sqlValue: undefined })}
            >
              {filedsSelectData.map((v) => {
                return <Select.Option key={v.fieldname}>{`${v.fieldAliasName}(${v.fieldname})`}</Select.Option>;
              })}
            </Select>
            <span style={{ margin: ' 0 5px' }}>=</span>
          </div>
          <div className="input-wrap">
            <Input
              allowClear
              id="sql-input"
              value={sqlValue || undefined}
              onChange={(e) => dispatch({ type: 'update', sqlValue: e.target.value })}
            />
            <Button type="primary" ghost disabled={!sqlValue || !targetField} onClick={() => onCheckFieldSql()}>
              验证
            </Button>
          </div>
        </div>
      </RndModal>
    </>
  );
};

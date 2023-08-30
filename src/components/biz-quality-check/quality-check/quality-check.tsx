import { useReducer, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Table, Tooltip, Form, Select, message, Row, Col, Space, Input } from 'antd';
import { CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSyncReference } from '@mapzone/utils';
import QualityCheckErrorResultModal from './quality-check-error-result-modal';
import { reducer, initialState } from './reducer';
import { prefixCls, defaultFieldNames, formatQualityCheckRules, displayName, fieldNames, defaultSrcWhereString } from './utils';
import { queryQualityCheckRuleResult, executeQualityCheckRule, queryQualityCheckRuleSetting } from './services';
import type { ColumnType } from 'antd/es/table';
import type { QualityCheckRuleRecord, QualityCheckProps, QualityFilterInfo, QueryEventData } from '@mapzone/types';
import type { BizQualityCheckProps, LayerItem } from './types';
import './style.less';

const QualityCheck = (props: BizQualityCheckProps) => {
  const {
    formProps,
    openAttributeTable,
    closeAttributeTable,
    getQualityCheckRules,
    onCheck,
    selectedInfo: propSelectedInfo,
    layerList,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    statusList,
    editableLayerList,
    dataSource,
    btnLoading,
    tableLoading,
    errorItemList,
    errorResultModalOpen,
    execBtnDisabled,
    selectedRowKeys,
    selectLyaer,
  } = state;

  const rowKey = useMemo(() => (dataSource[0] || {}).rowKey, [dataSource]);
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();
  const layerId = Form.useWatch('layerId', form);
  const status = Form.useWatch('status', form);
  const selectedInfoRef = useSyncReference(propSelectedInfo);

  const filterInfo = useMemo(() => {
    const result: QualityFilterInfo = {};
    if (typeof status === 'number' && status !== -1) {
      result.itemWhereString = `i_errorstate = ${status}`;
    }
    return result;
  }, [status]);

  const onErrorAmountBtnClick = (params: Required<QueryEventData>['qualityCheckProps'], rKey: string, qualityCheckRuleName: string) => {
    if (typeof openAttributeTable === 'function' && layerId && selectLyaer!.tableName) {
      dispatch({ type: 'update', selectedRowKeys: [rKey] });
      const filterMap = [params.filter || '', filterInfo.srcWhereString].filter(Boolean);
      openAttributeTable({
        layerId,
        tableName: selectLyaer!.layerName,
        title: `${selectLyaer?.layerName}`,
        qualityCheckProps: {
          ...params,
          filter: filterMap.length ? `(${filterMap.join(') and (')})` : '',
          qualityCheckRuleName: `检查规则：${qualityCheckRuleName}`,
        },
        toolbarProps: {
          hideSummaryStatistics: true,
          hideCustomStatistics: true,
          hideExport: true,
        },
      });
    }
  };

  const closeAttributeTableAndClearSelectedRows = () => {
    dispatch({ type: 'update', selectedRowKeys: [] });
    if (typeof closeAttributeTable === 'function') closeAttributeTable();
  };

  /** 切换工作范围或者质检图层，判断是否关闭属性表 */
  const closeOrUpdateAttribute = (qualityResultDatas: QualityCheckRuleRecord[]) => {
    const item = selectedRowKeys.length ? qualityResultDatas.find((i: Record<string, any>) => i[i.rowKey] === selectedRowKeys[0]) : null;
    if (!item) {
      closeAttributeTableAndClearSelectedRows();
    } else {
      const { priorityDisplayFields, highLightFields, errorAmount, filter: f, ...restRecord } = item as Record<string, any>;
      const selectedRow = dataSource.find((v: Record<string, any>) => v[v.rowKey] === selectedRowKeys[0]);
      if (!selectedRow || !errorAmount) {
        closeAttributeTableAndClearSelectedRows();
      } else if (errorAmount !== selectedRow.errorAmount) {
        onErrorAmountBtnClick(
          {
            priorityDisplayFields,
            highLightFields,
            errorAmount,
            filter: f,
            qualityCheckRuleName: defaultFieldNames.qualityCheckRuleName,
          },
          restRecord[rowKey],
          restRecord[defaultFieldNames.qualityCheckRuleName],
        );
      }
    }
  };

  const internalQueryQualityCheckRules = async (p?: { filterInfo?: QualityFilterInfo; layer?: LayerItem }) => {
    const f = p?.filterInfo || filterInfo;
    const params = {
      ...f,
      layerId: p?.layer?.layerId ?? layerId,
      tableName: p?.layer?.tableName ?? selectLyaer!.tableName,
      format: formatQualityCheckRules,
    };
    if (typeof getQualityCheckRules === 'function') {
      const res = await getQualityCheckRules(params);
      if (res) closeOrUpdateAttribute(res);
      return res;
    }
    const srcWhereString = defaultSrcWhereString(selectedInfoRef.current.zqCode);
    const res = await queryQualityCheckRuleResult({
      srcTable: params.tableName as string,
      schemeId: params.layerId,
      srcWhereString,
      ...f,
    });
    if (res.success) {
      const data = formatQualityCheckRules(fieldNames, res.datas);
      closeOrUpdateAttribute(data);
      return data;
    }
  };

  const internalCheck = async () => {
    const params: Parameters<Required<QualityCheckProps>['onCheck']>[0] = {
      layerId,
      tableName: selectLyaer!.tableName,
      dataSource,
      ...filterInfo,
      format: formatQualityCheckRules,
    };
    if (typeof onCheck === 'function') {
      const errorList = await onCheck(JSON.parse(JSON.stringify(params)));
      return errorList;
    }
    const res = await executeQualityCheckRule({
      schemeId: layerId,
      srcTable: selectLyaer!.tableName,
      ...filterInfo,
    });

    if (res.success) {
      message.success('执行检查成功');
      return !Array.isArray(res.datas.errorItemList) ? [] : res.datas.errorItemList;
    } else {
      message.error(`执行检查失败${res.msg ? `: ${res.msg}` : ''}`);
      return [];
    }
  };

  const queryQualityCheckRules = async (params?: { filterInfo?: QualityFilterInfo; layer?: LayerItem }) => {
    try {
      dispatch({ type: 'update', tableLoading: true, btnLoading: true });
      const res = await internalQueryQualityCheckRules(params);
      if (Array.isArray(res)) {
        dispatch({
          type: 'update',
          dataSource: JSON.parse(JSON.stringify(res)),
          tableLoading: false,
          btnLoading: false,
        });
      } else {
        dispatch({ type: 'update', tableLoading: false, btnLoading: false });
      }
    } catch (e) {
      dispatch({ type: 'update', tableLoading: false, btnLoading: false });
    }
  };

  const queryQualityCheckRulesRef = useRef(queryQualityCheckRules);
  queryQualityCheckRulesRef.current = queryQualityCheckRules;

  const onExecuteCheck = async () => {
    try {
      dispatch({ type: 'update', btnLoading: true });
      const res = await queryQualityCheckRuleSetting({
        pageSize: 1,
        pageIndex: 1,
        srcTable: selectLyaer!.tableName,
        schemeId: +layerId,
      });
      if (Array.isArray(res?.datas?.data) && res.datas.data.length === 0) {
        dispatch({ type: 'update', btnLoading: false });
        modal.info({
          title: '提示',
          content: `${selectLyaer?.layerName} 图层没有配置质检规则，请先在”质检规则配置“中添加检查规则，再执行检查`,
        });
        return;
      }
      const errorList = await internalCheck();
      if (errorList.length > 0) {
        dispatch({ type: 'update', errorItemList: errorList, errorResultModalOpen: true });
      }
      if (errorList) {
        queryQualityCheckRulesRef.current();
      }
      dispatch({ type: 'update', btnLoading: false });
    } catch (e) {
      dispatch({ type: 'update', btnLoading: false });
    }
  };

  const onErrorResultModalCancel = () => {
    dispatch({ type: 'update', errorResultModalOpen: false });
  };

  const onLayerSelect = (_key: React.Key, info: LayerItem) => {
    dispatch({ type: 'update', selectLyaer: info });
  };

  const onReset = () => {
    form.setFieldValue('status', -1);
  };

  const columns: ColumnType<any>[] = [
    {
      title: '质检方案',
      dataIndex: defaultFieldNames.qualityCheckRuleName,
      width: 300,
      render: (value) => (
        <div className="check-rule-name">
          <Tooltip title={value}>{value}</Tooltip>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: defaultFieldNames.errorState,
      className: `${prefixCls}-error-state`,
      width: 50,
      render: (value) => {
        return value === 0 ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : value === 1 ? (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        ) : (
          ''
        );
      },
    },
    {
      title: '错误(个)',
      dataIndex: defaultFieldNames.errorAmount,
      width: '75px',
      render: (value, record) => {
        if (!value) {
          return value ?? 0;
        }
        const { priorityDisplayFields, highLightFields, errorAmount, filter: f, ...restRecord } = record as Record<string, any>;
        return (
          <Button
            danger
            type="text"
            size="small"
            className={`${prefixCls}-error-amount-btn`}
            onClick={() => {
              onErrorAmountBtnClick(
                {
                  priorityDisplayFields,
                  highLightFields,
                  errorAmount,
                  filter: f,
                  qualityCheckRuleName: defaultFieldNames.qualityCheckRuleName,
                },
                restRecord[rowKey],
                restRecord[defaultFieldNames.qualityCheckRuleName],
              );
            }}
          >
            {value}
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    if (Array.isArray(layerList)) {
      form.setFieldsValue({ status: -1, layerId: layerList[0].layerId });
      dispatch({ type: 'update', execBtnDisabled: false, editableLayerList: layerList, selectLyaer: layerList[0] });
      queryQualityCheckRulesRef.current({ layer: layerList[0] });
    } else {
      dispatch({ type: 'update', execBtnDisabled: true });
    }
  }, [layerList]);

  return (
    <div className={prefixCls}>
      {contextHolder}
      <Form form={form} onFinish={onExecuteCheck} {...formProps}>
        <Row>
          <Col span={12}>
            <Form.Item label="质检图层" name="layerId">
              <Select
                placeholder="请选择质检图层"
                options={editableLayerList}
                onSelect={onLayerSelect}
                disabled={layerList.length <= 1}
                fieldNames={{ label: 'layerName', value: 'layerId' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item wrapperCol={{ span: 24 }} className={`${prefixCls}-submit`}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={execBtnDisabled}
                loading={
                  btnLoading
                    ? {
                        delay: 300,
                      }
                    : false
                }
              >
                执行检查
              </Button>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={6}>
            <Form.Item name="status">
              <Select options={statusList} fieldNames={{ value: 'errorState' }} placeholder="状态" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item>
              <Input placeholder="按字段名称搜索"></Input>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Space>
              <Button onClick={() => queryQualityCheckRulesRef.current()} type="primary">
                查询
              </Button>
              <Button type="primary" onClick={onReset}>
                重置
              </Button>
              <Button type="primary">导出</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        size="small"
        rowKey={rowKey}
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        bordered
        scroll={{ y: 'auto' }}
        loading={
          tableLoading
            ? {
                spinning: true,
                delay: 1000,
              }
            : false
        }
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => dispatch({ type: 'update', selectedRowKeys: newSelectedRowKeys as string[] }),
          type: 'radio',
          renderCell: () => null,
        }}
      />
      <QualityCheckErrorResultModal open={errorResultModalOpen} errorList={errorItemList} onCancel={onErrorResultModalCancel} />
    </div>
  );
};

QualityCheck.displayName = displayName;

export default QualityCheck;

import React, { forwardRef, useImperativeHandle, useRef, useReducer, useMemo, useEffect } from 'react';
import { Form, Select } from 'antd';
import Modal from '@mapzone/modal';
import { initialState, reducer } from './reducer';
import StatisticsChartsModal from '../charts';
import type { TMetadata } from '@mapzone/types';
import type { TFilterParams, TStatisticsModalRef, IStatisticsModal, IStatisticsChartsModalRef } from '@mapzone/types';

const iconTypeOptions = [
  { label: '表格', value: 'table' },
  { label: '饼图', value: 'pie' },
  { label: '柱形图', value: 'bar' },
];

const summaryTypeOptions = [
  { label: '求和', value: 'sum' },
  { label: '计数', value: 'count' },
  { label: '平均值', value: 'avg' },
];

const SummaryStatisticsModal = forwardRef<TStatisticsModalRef, IStatisticsModal>((props, ref) => {
  const { afterMount, excludeTablePk = [], getStatisticsDatas, groupFilter, summaryFilter } = props;
  const [state, dispatch] = useReducer(reducer, { ...initialState });
  const { visible, filterParams, formValueTexts, formValues, groupOptions, initialValues, groupFiledsOptions, summaryFieldsOptions } =
    state;
  const [form] = Form.useForm();
  const chartsRef = useRef<IStatisticsChartsModalRef>();

  /**
   * 语义翻译
   */
  const semanticContent = useMemo(() => {
    const text = `按${formValueTexts.groupText}字段进行分组，以${formValueTexts.summaryText}字段进行汇总，汇总方式为${formValueTexts.summaryTypeText}。默认显示图表类型为${formValueTexts.iconTypeText}`;
    return text;
  }, [formValueTexts]);

  // #region 下拉变更事件
  const onGroupFieldsChange = (values: string[], options: any | any[]) => {
    const selectedText = options.map((f: any) => f.children).join(',');
    const selectedValues = values.join(',');
    dispatch({
      type: 'update',
      formValueTexts: { ...formValueTexts, groupText: selectedText },
      formValues: { ...formValues, groupFields: selectedValues },
      groupOptions: values.map((v) => {
        const item = options.find((val: any) => val.value === v);
        return {
          title: item.children,
          value: item.value,
        };
      }),
    });
  };

  const onGroupFilterOption = (value: string, option?: { children: string }) => {
    const childrenContent = option?.children ?? '';
    return childrenContent.includes(value);
  };

  const onSummaryFieldsChange = (value: string, option: any) => {
    dispatch({
      type: 'update',
      formValueTexts: { ...formValueTexts, summaryText: option.children },
      formValues: { ...formValues, summaryFields: value },
    });
  };

  const onIconTypeChange = (value: 'table' | 'bar' | 'pie', option: any) => {
    dispatch({
      type: 'update',
      formValueTexts: {
        ...formValueTexts,
        iconTypeText: option.label,
      },
      formValues: { ...formValues, iconType: value },
    });
  };

  const onSummaryTypeChange = (value: 'sum' | 'count' | 'avg', option: any) => {
    dispatch({
      type: 'update',
      formValueTexts: {
        ...formValueTexts,
        summaryTypeText: option.label,
      },
      formValues: { ...formValues, summaryType: value },
    });
  };
  // #endregion

  /**
   * 关闭
   */
  const cancelHandle = () => {
    form.resetFields();
    dispatch({ type: 'cancel' });
  };

  /**
   * 统计
   */
  const okHandle = () => {
    if (!filterParams) {
      return;
    }
    form
      .validateFields()
      .then(() => {
        // 原备注：“每个表对应不同的方案！”
        const statisticsParam = {
          ...formValues,
          groupText: formValueTexts.groupText,
          summaryText: formValueTexts.summaryText,
        };
        let filter = '1 = 1';
        if (filterParams.queryFilter?.filter) {
          filter = filterParams.queryFilter.filter;
        }
        let geom = '';
        if (filterParams.queryFilter?.geometry) {
          geom = filterParams.queryFilter.geometry;
        }
        chartsRef.current?.setVisible({
          visible: true,
          params: {
            groupOptions,
            formValues,
            formValueTexts,
            queryParam: {
              queryWhere: filter,
              tableName: filterParams.tableName,
              geometry: geom,
            },
            statisticsParams: [statisticsParam] as any,
          },
        });
      })
      .catch((err) => {
        form.scrollToField(err.errorFields[0].name);
      });
  };

  const splitFieldDataList = (fieldDataList: TMetadata[], filter: TFilterParams, modalVisible?: boolean) => {
    const groupFieldData = [];
    const summaryFieldData = [];
    const defaultGroupFilter = (fieldData: TMetadata) => {
      return fieldData.dataType === 'STRING';
    };

    const defaultSummaryFilter = (fieldData: TMetadata) => {
      const { dataType } = fieldData;
      return dataType.startsWith('INT') || dataType === 'DOUBLE' || dataType === 'FLOAT';
    };
    for (let i = 0, len = fieldDataList.length; i < len; i += 1) {
      const fieldData = fieldDataList[i];
      if (!excludeTablePk.includes(fieldData.tablePk)) {
        // if (!fieldData.disabled && !excludeTablePk.includes(fieldData.tablePk)) {
        if (groupFilter) {
          if (groupFilter(fieldData)) {
            groupFieldData.push(fieldData);
          }
        } else if (defaultGroupFilter(fieldData)) {
          groupFieldData.push(fieldData);
        }
        if (summaryFilter) {
          if (summaryFilter(fieldData)) {
            summaryFieldData.push(fieldData);
          }
        } else if (defaultSummaryFilter(fieldData)) {
          summaryFieldData.push(fieldData);
        }
      }
    }
    dispatch({
      type: 'update',
      visible: modalVisible,
      groupFiledsOptions: groupFieldData,
      summaryFieldsOptions: summaryFieldData,
      filterParams: {
        ...filter,
        queryFilter: filter.queryFilter ?? {},
      },
    });
  };

  useEffect(() => {
    if (afterMount) afterMount();
  }, [afterMount]);

  useImperativeHandle(ref, () => ({
    setVisible: (params) => {
      const { fieldDataList } = params;
      splitFieldDataList(fieldDataList, params.filterParams, params.visible);
    },
  }));

  return (
    <>
      <Modal
        title="统计条件设置"
        className="simmary-statistics-modal"
        visible={visible}
        destroyOnClose
        mask
        onCancel={cancelHandle}
        onOk={okHandle}
      >
        <Form name="summaryStatisticsForm" form={form} initialValues={initialValues} labelCol={{ span: 6 }}>
          <Form.Item label="分组字段" name="groupFields" rules={[{ required: true, message: '请选择分组字段' }]}>
            <Select
              showArrow={true}
              mode="multiple"
              placeholder="请选择分组字段"
              filterOption={onGroupFilterOption}
              onChange={onGroupFieldsChange}
            >
              {groupFiledsOptions?.map((g) => (
                <Select.Option key={g.fieldId} value={g.fieldname}>
                  {g.fieldAliasName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="汇总字段" name="summaryFields" rules={[{ required: true, message: '请选择汇总字段' }]}>
            <Select placeholder="请选择汇总字段" onChange={onSummaryFieldsChange} showSearch filterOption={onGroupFilterOption}>
              {summaryFieldsOptions?.map((s) => (
                <Select.Option key={s.fieldId} value={s.fieldname}>
                  {s.fieldAliasName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="默认图表类型" name="iconType" rules={[{ required: true, message: '请选择默认图表类型' }]}>
            <Select placeholder="请选择默认图表类型" options={iconTypeOptions} onChange={onIconTypeChange} />
          </Form.Item>
          <Form.Item label="汇总方式" name="summaryType" rules={[{ required: true, message: '请选择汇总方式' }]}>
            <Select placeholder="请选择汇总方式" options={summaryTypeOptions} onChange={onSummaryTypeChange} />
          </Form.Item>
          <Form.Item label="语义翻译">
            <span className="ant-form-text">{semanticContent}</span>
          </Form.Item>
        </Form>
      </Modal>
      <StatisticsChartsModal ref={chartsRef} getStatisticsDatas={getStatisticsDatas} />
    </>
  );
});

export default SummaryStatisticsModal;

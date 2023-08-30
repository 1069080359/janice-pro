import React, { forwardRef, useImperativeHandle, useRef, useReducer, useMemo } from 'react';
import { Table, Spin, notification } from 'antd';
import { appGeodbApiEncryptRequest } from '@mapzone/request';
import { getAntdChartScaleTheme } from '@mapzone/hooks';
import { deepMix } from '@antv/util';
import { Column, Pie, G2 } from '@ant-design/plots';
import classNames from 'classnames';
import Modal from '@mapzone/modal';
import { BarBase, TableBase, PieBase } from '@mapzone/icons';
import { pieConfig, columnConfig } from './constant';
import { initialState, reducer } from './reducer';
import type {
  TStatisticChartsModalRef,
  IStatisticChartsModal,
  TGetStatisticsDatasReturnType,
  TGetStatisticsDatasParams,
} from '@mapzone/types';
import './styles.less';

const prefixCls = 'summary-stat-chart';
let key = 0;
const StatisticChartsModal = forwardRef<TStatisticChartsModalRef, IStatisticChartsModal>((props, ref) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState });
  const promiseResolve = useRef<any>();
  const { visible, formValueTexts, formValues, chartsData, loading } = state;
  const { iconType } = formValues;

  /**
   * 图表标题
   */
  const chartsTitle = useMemo(() => {
    const text = `按${formValueTexts.groupText}字段统计${formValueTexts.summaryText}`;
    return text;
  }, [formValueTexts]);

  /**
   * 获取汇总统计数据
   */
  const getStatisticsDatas = async (params: TGetStatisticsDatasParams) => {
    dispatch({ type: 'update', visible: true, loading: true });
    let data: TGetStatisticsDatasReturnType = [];
    if (props.getStatisticsDatas) {
      const res = await props.getStatisticsDatas(params);
      if (Array.isArray(res)) data = res;
    } else {
      const res = await appGeodbApiEncryptRequest
        .post(`/summaryStatistic/getStatisticsDatas.do`, {
          data: {
            queryParam: {
              ...params.queryParam,
              queryWhere: params.queryParam.queryWhere,
              tableName: params.queryParam.tableName,
            },
            statisticsParams: params.statisticsParams,
          },
        })
        .catch(() => undefined);
      if (!res || !res.success) {
        notification.error({
          message: '获取统计数据失败',
          description: res.message,
        });
        dispatch({
          type: 'update',
          loading: false,
          chartsData: {
            tableColumns: [],
            items: [],
          },
        });
        return;
      }
      if (Array.isArray(res.datas)) {
        data = res.datas;
      }
    }
    if (!data.length) {
      dispatch({
        type: 'update',
        loading: false,
        chartsData: {
          tableColumns: [],
          items: [],
        },
      });
      return;
    }
    const { groupOptions } = params;
    let codes: Record<string, any> = {};
    const items = data[0].items.map((v) => {
      if (v.CODES) {
        codes = { ...codes, ...v.CODES };
        const title = groupOptions
          .map((val) => {
            const code = v.CODES[val.value];
            const desc = v[`${val.value}_DESC`] || v[val.value];
            return code ? `${desc}-${code}` : v.title;
          })
          .filter(Boolean)
          .join();
        v.TITLE = `[${title}]`;
      }
      return v;
    });
    dispatch({
      type: 'update',
      loading: false,
      chartsData: {
        items,
        tableColumns: data[0].tableColumn.map((v) => ({
          ...v,
          render: (text, record) => {
            const title = record[`${v.dataIndex}_DESC`] || text;
            const code = codes[v.dataIndex];
            return code ? `${title}-${code}` : title;
          },
        })),
      },
    });
  };

  const changeChartType = (chartType: 'table' | 'bar' | 'pie') => {
    dispatch({ type: 'update', formValues: { ...formValues, iconType: chartType } });
  };

  /**
   * 关闭
   */
  const cancelHandle = () => {
    dispatch({ type: 'cancel' });
    props.onCancel?.();
  };

  useImperativeHandle(ref, () => ({
    setVisible: (data) => {
      const { params } = data;
      getStatisticsDatas(JSON.parse(JSON.stringify(params)));
      dispatch({
        type: 'update',
        visible: data.visible,
        ...params,
      });

      return new Promise((resolve) => {
        promiseResolve.current = resolve;
      });
    },
  }));

  const getChartContent = () => {
    const defaultTheme = G2.getTheme('default');
    const themeByScale = getAntdChartScaleTheme();
    const theme = deepMix({}, defaultTheme, themeByScale);
    switch (iconType) {
      case 'table':
        return (
          <Table
            pagination={false}
            columns={chartsData.tableColumns}
            dataSource={chartsData.items.map((v) => ({ ...v, key: ++key }))}
            size="small"
            scroll={{ y: `calc(${document.documentElement.clientHeight} - 400px)` }}
          />
        );
      case 'bar':
        return <Column {...columnConfig} data={chartsData.items} yField={formValues.summaryFields!} theme={theme} />;
      case 'pie':
        return <Pie {...pieConfig} data={chartsData.items} angleField={formValues.summaryFields!} theme={theme} />;
      default:
        return null;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      title="汇总统计图表"
      open
      onCancel={cancelHandle}
      mask
      maskClosable={false}
      expandable
      width={800}
      bodyStyle={{ minHeight: '460px' }}
      className={`${prefixCls}-modal`}
      footer={null}
    >
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}-title`}>{chartsTitle}</div>
        <div className={`${prefixCls}-icons`}>
          <span
            className={classNames('summary-stat-icon', {
              active: iconType === 'table',
            })}
            onClick={() => changeChartType('table')}
          >
            <TableBase />
          </span>
          <span
            className={classNames('summary-stat-icon', {
              active: iconType === 'pie',
            })}
            onClick={() => changeChartType('pie')}
          >
            <PieBase />
          </span>
          <span
            className={classNames('summary-stat-icon', {
              active: iconType === 'bar',
            })}
            onClick={() => changeChartType('bar')}
          >
            <BarBase />
          </span>
        </div>
      </div>
      <div className={classNames(`${prefixCls}-data`, `${prefixCls}-${iconType}`)}>
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '100px',
            }}
          >
            <Spin tip="数据加载中..." delay={1000} />
          </div>
        )}
        {!loading && getChartContent()}
      </div>
    </Modal>
  );
});

export default StatisticChartsModal;

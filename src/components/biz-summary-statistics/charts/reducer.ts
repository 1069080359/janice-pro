import type { TableColumnType } from 'antd';
import type { TGetStatisticsDatasParams } from '@mapzone/types';

export interface IState extends TGetStatisticsDatasParams {
  visible?: boolean;
  chartsData: {
    tableColumns: { title: string; dataIndex: string; render: TableColumnType<any>['render'] }[];
    items: Record<string, any>[];
  };
  loading: boolean;
}

interface IAction extends Partial<IState> {
  type: 'update' | 'cancel';
}

export const initialState: IState = {
  visible: false,
  formValues: {
    iconType: 'bar',
    summaryType: 'sum',
  },
  formValueTexts: {
    groupText: '',
    summaryText: '',
    iconTypeText: '柱形图',
    summaryTypeText: '求和',
    semanticContent: '按字段进行统计',
  },
  queryParam: {
    queryWhere: '',
    tableName: '',
    geometry: '',
  },
  statisticsParams: [],
  chartsData: {
    tableColumns: [],
    items: [],
  },
  groupOptions: [],
  loading: false,
};

export function reducer(state: IState, action: IAction): IState {
  const { type, ...restState } = action;
  switch (type) {
    case 'update':
      return {
        ...state,
        ...restState,
      };
    case 'cancel':
      return {
        ...state,
        visible: false,
      };
    default:
      throw new Error();
  }
}

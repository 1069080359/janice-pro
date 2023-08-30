import type { TMetadata } from '@mapzone/types';
import type { TFilterParams, IFormValueTexts, IFormValues, TGetStatisticsDatasParams } from '@mapzone/types';

export interface IState {
  visible?: boolean;
  filterParams?: TFilterParams;
  formValueTexts: IFormValueTexts;
  formValues: Partial<IFormValues>;
  groupOptions: TGetStatisticsDatasParams['groupOptions'];
  initialValues: Partial<IFormValues>;
  groupFiledsOptions?: TMetadata[];
  summaryFieldsOptions?: TMetadata[];
  enableDrag: boolean;
}

interface IAction extends Partial<IState> {
  type: 'update' | 'cancel';
}

export const initialState: IState = {
  visible: false,
  initialValues: {
    iconType: 'bar',
    summaryType: 'sum',
  },
  formValues: {
    iconType: 'bar',
    summaryType: 'sum',
  },
  formValueTexts: {
    groupText: '',
    summaryText: '',
    iconTypeText: '柱形图',
    summaryTypeText: '求和',
    semanticContent: '按字段进行分组，以字段进行汇总，汇总方式为求和。默认显示图表类型为柱形图',
  },
  groupOptions: [],
  enableDrag: true,
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
        ...initialState,
        visible: false,
      };
    default:
      throw new Error();
  }
}

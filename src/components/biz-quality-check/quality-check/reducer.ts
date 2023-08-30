import { defaultStatusList } from './utils';
import type { State, Action } from './types';

export const initialState: State = {
  statusList: defaultStatusList,
  districtTreeData: [],
  districtLoading: false,
  editableLayerList: [],
  dataSource: [],
  errorItemList: [],
  errorResultModalOpen: false,
  selectDistrictvalue: [],
  selectedRowKeys: [],
  execBtnDisabled: true,
};

export function reducer(state: State, action: Action) {
  const { type, ...restState } = action;
  switch (type) {
    case 'update':
      return {
        ...state,
        ...restState,
      };
    default:
      throw new Error();
  }
}

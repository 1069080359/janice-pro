import type { IState, IAction } from './types';

export const initialState: IState = {
  optionsList: [],
  selectedItemList: [],
  defaultFilterFields: [],
  groupData: {},
};

export function reducer(state: IState, action: IAction): IState {
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

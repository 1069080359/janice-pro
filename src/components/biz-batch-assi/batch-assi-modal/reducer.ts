import type { IState, IAction } from './types';

export const initialState: IState = {
  fieldMetadataList: [],
  selectFieldKeys: [],
  selectItemList: [],
  metadataList: [],
  confirmLoading: false,
  updateType: 'selected',
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

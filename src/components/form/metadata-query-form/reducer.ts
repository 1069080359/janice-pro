import type { IAction, IState } from './types';

export const initialState: IState = {
  metadataFieldList: [],
  metadataList: [],
  fieldConfigList: [],
};

export function reducer(state: IState, action: IAction): IState {
  const { type, ...restState } = action;
  switch (action.type) {
    case 'update':
      return {
        ...state,
        ...restState,
      };
    default:
      throw new Error();
  }
}

import type { Action, State } from './types';

export const initialState: State = {
  open: false,
  filedsTableData: [],
  filedsSelectData: [],
  loading: false,
  funType: 'num',
  updateType: 'selected',
};

export function reducer(state: State, action: Action): State {
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

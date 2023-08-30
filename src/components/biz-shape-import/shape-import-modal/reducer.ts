import type { TShapeUploadStatus } from '@mapzone/types';

export type TState = {
  orginFileList: File[];
  shapeUploadStatus: TShapeUploadStatus;
  loading: boolean;
};

type TAction = Partial<TState> & {
  type: 'update';
};

export const initialState: TState = {
  orginFileList: [],
  loading: false,
  shapeUploadStatus: {
    validateStatus: undefined,
    help: undefined,
  },
};

export const reducer = (state: TState, action: TAction): TState => {
  const { type, ...restState } = action;
  switch (type) {
    case 'update':
      return {
        ...state,
        ...restState,
      };
    default:
      return { ...state };
  }
};

import type { Key } from 'react';
import type { TMyLayer, TMyLayerTreeData } from '../../types';

export type TState = {
  serverDataModalOpen: boolean;
  layerConfigModalOpen: boolean;
  attrTableOpen: boolean;
  currentMyLayer?: TMyLayer;
  treeCheckedKeys: Key[];
  treeData: TMyLayerTreeData[];
  loading: boolean;
  loadingTip: string;
};

type TAction = Partial<TState> & {
  type: 'update';
};

export const initialState: TState = {
  serverDataModalOpen: false,
  layerConfigModalOpen: false,
  attrTableOpen: false,
  treeData: [],
  treeCheckedKeys: [],
  loading: false,
  loadingTip: '',
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

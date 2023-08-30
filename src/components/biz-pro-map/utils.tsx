import { bizEditToolList } from './edit-tool-list';
import type { ToolProps, MapSelectToolProps, MapEditToolProps, MapDrawToolProps } from '@mapzone/types';
export const selector = '.biz-map-container';

export const useCustomToolProps = (): ToolProps => {
  return {
    getProps: ({ type }) => {
      if (type === 'xzj') {
        return {
          selector,
          getDefaultSizeAndPosition: () => ({ position: { x: 576, y: 12 } }),
        } as Partial<MapSelectToolProps>;
      } else if (type === 'bj') {
        return {
          selector: '.biz-page-container',
          rndProviderProps: {
            getDefaultSizeAndPosition: () => ({ position: { x: 500, y: 16 } }),
          },
          showTitle: true,
          maxToolCount: 20,
          toolList: bizEditToolList,
        } as Partial<MapEditToolProps>;
      } else if (type === 'draw-tool') {
        return {
          selector,
        } as Partial<MapDrawToolProps>;
      }
      return undefined;
    },
    use: (params) => {
      return !(params.key === 'ybj' || params.key === 'wg' || params.key === 'tcglq' || params.key === 'sjz');
    },
  };
};

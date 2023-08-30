import type { IFsMap } from '@mapzone/map-kit';
import type { OpenAttributeTableFunc } from '../biz-pro-map';

export type BizLayerTreeProps = {
  fsMap: IFsMap;
  className?: string;
  /** 默认显示的图层 */
  defaultLayers?: string[];
  /** 打开属性表 */
  openAttributeTable?: OpenAttributeTableFunc;
  /** 图层分类Key */
  layerCategoryKey?: string;
};

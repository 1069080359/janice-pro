import type { Coordinate } from 'ol/coordinate';
import type { BizBaseMapProps } from '../base-map';
import type { BizLayerTreeProps } from '../biz-layer-tree';
import type { BizAttributeTableProps } from '../biz-attribute-table';

export type BizProMapProps = Pick<BizBaseMapProps, 'className' | 'onFsMapCreated'> & {
  /** 默认引用需要加载的图层名称 */
  defaultLayerNames?: string[];
  /** 政区code */
  zqCode?: string;
  /**
   * 是否开启政区定位
   * @default true
   */
  zqLocation?: boolean;
  /** 是否显示图层树 */
  showLayerTree?: boolean;
} & Pick<BizLayerTreeProps, 'layerCategoryKey'>;

/** 地图图层配置 */
export type MapLayersConfig = Pick<BizBaseMapProps, 'mapConfig' | 'layerConfigs'>;

/** 地图位置 */
export type MapLocationInfo = { zoom: number; center: Coordinate };

/** 地图底图配置 */
export type MapBaseLayerVisible = { layerId: string; visible: boolean }[];

export type AttributeParams = Pick<
  BizAttributeTableProps,
  | 'tableName'
  | 'title'
  | 'querySourceType'
  | 'filter'
  | 'geometry'
  | 'getCount'
  | 'getDataSource'
  | 'getMetadataList'
  | 'hideFilter'
  | 'hideShapeImport'
  | 'hideSummaryStatistics'
  | 'hideBatchAssign'
  | 'hideFieldsCalculation'
> & {
  layerId?: string;
};

export type OpenAttributeTableFunc = (params: AttributeParams) => void;

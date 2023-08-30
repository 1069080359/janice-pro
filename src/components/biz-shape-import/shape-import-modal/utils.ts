import { geoJsonFormat, topoJsonFormat } from '@mapzone/map-kit';
import type { TExportFormat } from '@mapzone/types';

/** 根据图层数据 获取图层属性表数据 */
export const json2Features = (jsonObj: any, format: TExportFormat) => {
  switch (format) {
    case 'topojson':
      return topoJsonFormat.readFeatures(jsonObj);
    case 'geojson':
      return geoJsonFormat.readFeatures(jsonObj);
    default:
      return [];
  }
};

import type { IFsMap } from '@mapzone/map-kit';
import type { TGetConResData } from '@mapzone/types';
import type { Key } from 'react';

export const mapping: Record<string, string> = {
  Point: 'images/dot.svg',
  LineString: 'images/line.svg',
  Polygon: 'images/cover.svg',
  // Point: 'images/point-layer-icon.png',
  // LineString: 'images/line-layer-icon.png',
  // Polygon: 'images/polygon-layer-icon.png',
  image: 'images/image-layer-icon.png',
  drones: 'images/drones-layer-icon.png',
  default: 'images/default-layer-icon.png',
};

/** 更新图层配置 */
export const updateConfigList = (configList: TGetConResData[], layerIds: string[], visible: boolean) => {
  return configList.map((t) => {
    if (t.original && t.original.length > 0) {
      const currentId = `${t.original[0].i_id}`;
      if (layerIds.includes(currentId)) {
        t.original[0] = {
          ...t.original[0],
          i_visible: visible ? 1 : 0,
        };
      }
    }
    if (t.children && t.children.length > 0) {
      t.children = updateConfigList(t.children, layerIds, visible);
      // t.checkable = t.original && t.original.length > 0;
    }
    return t;
  });
};

/** 获取高亮的图层id */
export const getCheckedKeys = (fsMap: IFsMap, dataList: TGetConResData[]) => {
  const keys: Key[] = [];
  dataList.forEach((v) => {
    const layerId = ((v.original || [])[0] || {}).i_id;
    if (layerId) {
      const layer = fsMap.getLayerById(layerId);
      const visible = layer && layer.getVisible();
      if (visible) {
        keys.push(v.id!);
      }
    }
    if (v.children && v.children.length) {
      const cKeys = getCheckedKeys(fsMap, v.children);
      keys.push(...cKeys);
    }
  });
  return keys;
};

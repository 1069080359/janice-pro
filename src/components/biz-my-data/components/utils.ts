/* eslint-disable no-console */
import { geoJsonFormat, topoJsonFormat } from '@mapzone/map-kit';
import { readZipJSONFile } from '@mapzone/shape-kit';
import { JsonParse, uuidV4 } from '@mapzone/utils';
import getMyDataDb from '../hooks/use-db';
import { downloadCloudLayerData } from './service';
import { zindexRange } from '../const';
import type { TExportFormat, TGeoJSON, TTopoJSON } from '../types';

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

/** 把JSON 转换为features */
export const formatJSON2Features = async (layerId: string) => {
  const db = getMyDataDb();
  const layerData = await db.localLayerDatas.get(layerId);
  if (!layerData) {
    return [];
  }

  return json2Features(layerData.JSON, layerData.format);
};

export const getPrefix = () => uuidV4().substring(0, 6);

export const getGeoJSONProperties = (geoJSON: TGeoJSON, idPrefix?: string) => {
  return (
    geoJSON.features
      // .slice(startIndex, startIndex + pSize)
      .map((f, i) => {
        if (idPrefix) {
          f.properties.PK_UID = `${idPrefix}${i}`;
        }
        return f.properties;
      })
  );
};

export const getTopoJSONProperties = (topoJSON: TTopoJSON, idPrefix?: string) => {
  const layerName = Object.keys(topoJSON.objects)[0];
  return (
    topoJSON.objects[layerName].geometries
      // .slice(startIndex, startIndex + pSize)
      .map((f, i) => {
        if (idPrefix) {
          f.properties.PK_UID = `${idPrefix}${i}`;
        }
        return f.properties;
      })
  );
};

/** 根据图层数据 获取图层属性表数据 */
export const getLayerProperties = (jsonObj: any, format: TExportFormat, idPrefix?: string) => {
  switch (format) {
    case 'topojson':
      return getTopoJSONProperties(jsonObj, idPrefix);
    case 'geojson':
      return getGeoJSONProperties(jsonObj, idPrefix);
    default:
      return [];
  }
};

/** 根据图层Id 获取图层属性表数据 */
// export const getLayerPropertiesByLayerId = async (layerId: string) => {
//   const db = getMyDataDb();
//   const layerData = await db.localLayerDatas.get(layerId);
//   if (!layerData) {
//     return [];
//   }
//   return getLayerProperties(layerData.JSON, layerData.format);
// };

/** 获取小班属性字段 */
export const getPropFieldsByLayerData = (jsonObj: any, format: TExportFormat) => {
  let attrFields: string[] = [];
  if (format === 'topojson') {
    const topoJSON = jsonObj as TTopoJSON;
    const layerName = Object.keys(topoJSON.objects)[0];
    const { geometries } = topoJSON.objects[layerName];
    if (geometries && geometries.length > 0) {
      attrFields = Object.keys(geometries[0].properties);
    }
  } else if (format === 'geojson') {
    const geoJSON = jsonObj as TGeoJSON;
    const { features } = geoJSON;
    if (features && features.length > 0) {
      attrFields = Object.keys(geoJSON.features[0].properties);
    }
  }
  return attrFields;
};

/** 初始化图层小班 属性的主键 */
export const initLayerPropertiesId = (idPrefix: string, jsonObj: any, format: TExportFormat) => {
  if (format === 'topojson') {
    const topoJSON = jsonObj as TTopoJSON;
    const layerName = Object.keys(topoJSON.objects)[0];
    topoJSON.objects[layerName].geometries.forEach((f, index) => {
      f.properties.PK_UID = idPrefix + index;
    });
    return topoJSON;
  }
  if (format === 'geojson') {
    const geoJSON = jsonObj as TGeoJSON;
    geoJSON.features.forEach((f, index) => {
      f.properties.PK_UID = idPrefix + index;
    });
    return geoJSON;
  }
  return jsonObj;
};

export const formatLayerId = (id: number | string) => `cloud_${id}`;

/** 加载图层JSON */
export const loadLayerJSON = async (cloudId: number, jsonFormat: TExportFormat = 'geojson') => {
  const db = getMyDataDb();
  const layerId = formatLayerId(cloudId);
  const localLayerData = await db.localLayerDatas.get(layerId);
  if (localLayerData) {
    return localLayerData.JSON;
  }
  const res = await downloadCloudLayerData({ cloudId, type: 2 });
  if (res.type !== 'application/octet-stream') {
    return undefined;
  }
  const jsonFile = await readZipJSONFile(res);
  if (!jsonFile) {
    return undefined;
  }
  const jsonData = JsonParse(jsonFile);
  if (jsonData) {
    await db.localLayerDatas
      .add({
        id: layerId,
        JSON: jsonData,
        format: jsonFormat,
      })
      .catch((e: any) => console.log(e));
  }
  return jsonData;
};

export const computeZIndex = (length: number, index: number) => {
  const [min, max] = zindexRange;
  let zIndex = min + length - 1 - index;
  if (max && zIndex > max) {
    zIndex = max;
  }
  return zIndex;
};

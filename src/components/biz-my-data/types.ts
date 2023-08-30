import type Dexie from 'dexie';
import type { CSSProperties, Key } from 'react';
import type { TreeDataNode } from 'antd';
import type { IFsMap, TBaseGeometryType } from '@mapzone/map-kit';
import type { OpenAttributeTableFunc } from '../biz-pro-map';

export type TMyDataProps = {
  fsMap: IFsMap;
  title?: string;
  treeNodeStyle?: CSSProperties;
  openAttributeTable?: OpenAttributeTableFunc;
};

export type TExportFormat = 'geojson' | 'topojson';

export type TGeoJSON = {
  features: {
    geometry: { type: string; coordinates: any[] };
    properties: Record<string, any>;
    type: string;
  }[];
  type: string;
};

type TObjectValueOfTopoJSON = {
  geometries: {
    arcs: any[];
    type: string;
    properties: Record<string, any>;
  }[];
  type: string;
};

export type TTopoJSON = {
  arcs: any[];
  objects: Record<string, TObjectValueOfTopoJSON>;
  type: string;
};

export type TMyDataEvent = {
  importData: void;
};

export type TLayerStyleConfig = {
  color: string;
  width: number;
  borderStyle: 'solid' | 'dotted' | 'dashed';
  fillColor?: string;
  label?: string;
  labelFontSize?: number;
  labelColor?: string;
};

export type TLocalLayerData = {
  id: string;
  JSON: any;
  format: TExportFormat;
};

export type TShapeUpload = {
  name: string;
  remark: string;
  geometryType: TBaseGeometryType;
  featureCount: number;
  shapeZip: Blob;
  jsonZip: Blob;
  tableFields: string[];
  style: Record<string, any>;
};

type TDataInfo = {
  num: number;
  tableFields: string[];
} & Record<string, any>;

export type TCloudLayer = {
  C_DATANAME: string;
  C_REMARK: string;
  C_TABLETYPE: TBaseGeometryType;
  D_CREATETIME: string;
  I_ID: number;
  C_DATAINFO: TDataInfo;
};

export type TMyLayer = {
  C_DATANAME: string;
  C_DATAINFO: TDataInfo;
  C_STYLE: TLayerStyleConfig;
  C_TABLETYPE: TBaseGeometryType;
  I_ID: number;
  I_USEROWNEDDATAID: number;
  I_ORDER: number;
};

export type TMyLayerData = {
  layerId: string;
  layerName: string;
  style: TLayerStyleConfig;
  geometryType: TBaseGeometryType;
  attrFields: string[];
  JSON: TGeoJSON; // | TTopoJSON
  data: TMyLayer;
};

export type TMyLayerTreeData = TreeDataNode & {
  data: TMyLayer;
};

export type TMyDataDatabaseProps = {
  appName?: string;
  userId?: string;
};

export type TMyDataDatabase = Dexie & {
  localLayerDatas: Dexie.Table<TLocalLayerData, string>;
};

export type TCheckParams = {
  checkedKeys: Key[];
  currentKey: string;
  checked: boolean;
  data?: TMyLayerTreeData[];
};

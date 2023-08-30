import { LAYER_GROUP_TYPE } from '@mapzone/layer-manager';
import type { TLayerConfig } from '@mapzone/types';
import type { TExportFormat } from './types';

const myData = LAYER_GROUP_TYPE.find((s) => s.label === '我的数据');

const zindexRange = myData?.zIndex ?? [5001, 6000];

const initLocalLayerConfig: TLayerConfig = {
  c_dataName: '',
  c_dataServiceParam: {},
  c_extent: [],
  c_group: '',
  c_imgTime: '',
  c_ogc: '',
  c_origin: [],
  c_path: '',
  c_serviceCode: '',
  c_sid: 0,
  c_source: '',
  c_style: '',
  c_type: 'NETWORK',
  c_url: '',
  c_zqCode: '',
  c_zqName: '',
  c_ztName: '',
  c_parameter: { mapId: '' },
  c_dataFilter: {},
  c_metadata: {},
  c_legend: [],
  capability: {
    c_geoType: '',
    c_serverUrl: '',
    i_add: 0,
    i_edit: 0,
    i_geoQuery: 1,
    i_hasTbEntity: '',
    i_isLoadIn3D: 0,
    i_select: 1,
    i_sorption: 1,
    idField: 'PK_UID',
  },
  d_firstDpi: 0,
  d_opacity: 1,
  i_delete: 0,
  i_createUserId: -1,
  i_isUserData: 1,
  i_maxLevel: 0,
  i_minLevel: 0,
  i_play: 0,
  i_swipe: 0,

  i_visible: false,
  i_id: 0,
  c_layerName: '',
  i_zIndex: 5000,
};

const defaultExportFormat: TExportFormat = 'geojson';

const defaultColors = [
  '#fe5722',
  '#e81e63',
  '#9b27af',
  '#03a8f3',
  '#00bbd3',
  '#4cae50',
  '#8ac24a',
  '#ccdb39',
  '#feea3b',
  '#fec007',
  '#9d9d9d',
  {
    color: 'rgba(255,255,255,0)',
    title: '透明',
  },
];

export { zindexRange, initLocalLayerConfig, defaultExportFormat, defaultColors };

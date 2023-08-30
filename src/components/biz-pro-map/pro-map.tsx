import { useEffect, useRef, useState } from 'react';
import { Spin, message } from 'antd';
import { useModel } from '@umijs/max';
import useTool from '@mapzone/map-tool';
import Area from '@mapzone/area';
import { getAppMapLayersConfig, getConfig } from '@mapzone/map-services';
import { setSessionStorageItem, getSessionStorageItem } from '@mapzone/utils';
import { useTriggerLayer } from '@mapzone/trigger-layer';
import { DistLocation } from '@mapzone/map-kit';
import useCustomToolList from './use-custom-tool-list';
import { BizBaseMap } from '../base-map';
import { BizLayerTree } from '../biz-layer-tree';
import { BizAttributeTable } from '../biz-attribute-table';
import { isNationZqCode } from '@/utils';
import { queryParents as queryParentsService, queryChild, queryByName } from './service';
import { useCustomToolProps } from './utils';
import type { FsLayerVisibleChangedParams, IDistLocation, IFsMap } from '@mapzone/map-kit';
import type { AreaProps, FsFC, TGetConResData, TOperListItem, ToolProps } from '@mapzone/types';
import type { TMyDataProps } from '../biz-my-data';
import type { BizProMapProps, MapBaseLayerVisible, MapLayersConfig, MapLocationInfo, AttributeParams } from './types';
import './index.less';

/** 地图配置缓存key */
const mapLayersConfigCachekey = 'biz-map-layers-config';
/** 地图位置缓存key */
const mapLocationCachekey = 'biz-map-location';
/** 地图配置缓存key */
const mapTreeConfigCachekey = 'biz-map-tree-config';
/** 底图图层显隐状态缓存key */
const mapBaseLayerCachekey = 'biz-map-base-layer';

const toolItemRender: ToolProps['toolItemRender'] = (item) => {
  return (
    <>
      {item.icon}
      <span className="tool-title">{item.title}</span>
    </>
  );
};

/** 业务地图 */
const BizProMap: FsFC<BizProMapProps> = (props) => {
  const {
    onFsMapCreated,
    defaultLayerNames,
    zqCode,
    zqLocation = true,
    children,
    showLayerTree = true,
    layerCategoryKey,
    ...restProps
  } = props;
  const [mapLayersConifg, setMapLayersConifg] = useState<MapLayersConfig>();
  const [panelvisible, setPanelvisible] = useState(false);
  const [defaultLayers, setDefaultLayers] = useState<string[]>();
  const [attrTableOpen, setAttrTableOpen] = useState<boolean>(false);
  const [bizFsMap, setBizFsMap] = useState<IFsMap>();
  /** 政区定位高亮 */
  const [distLocation, setDistLocation] = useState<IDistLocation>();
  const { Tool, Panel, wrapperProps, mapWrapperProps, event: mapToolEvent } = useTool();
  const { customToolList } = useCustomToolList();
  const { TriggerLayer } = useTriggerLayer();
  const layerVisibleListRef = useRef<MapBaseLayerVisible>([]);
  const [attributeParams, setAttributeParams] = useState<AttributeParams>({ tableName: '', title: '', layerId: '' });
  const [crumbs, setCrumbs] = useState<AreaProps['crumbs']>([]);
  const [areaList, setAreaList] = useState<AreaProps['areaList']>([]);
  const [searchList, setSearchList] = useState<AreaProps['searchList']>([]);
  const lockRef = useRef<boolean>();
  const timerRef = useRef<any>(null);
  const toolProps = useCustomToolProps();
  const { initialState = {} } = useModel('@@initialState');
  const { collapsed } = initialState;

  const crumbsClick: AreaProps['crumbsClick'] = (data) => {
    distLocation?.navClickFun((data.code || '').toString());
    lockRef.current = false;
  };

  const onSearchRow: AreaProps['onSearchRow'] = (record) => {
    distLocation?.strokeGeom((record.location.code || '').toString());
    lockRef.current = false;
  };

  // 搜索
  const onSearch = async (v: string) => {
    clearTimeout(timerRef.current);
    const reg = new RegExp('^[\u4e00-\u9fa5]{2,}$');
    const name = v.trim();
    if (!name || !reg.test(name)) {
      setSearchList([]);
    } else {
      timerRef.current = setTimeout(async () => {
        const data = await queryByName.abort().fetch({ name });
        if (Array.isArray(data)) {
          const arr = JSON.parse(JSON.stringify(data)) as any[];
          arr.forEach((item: { fullName: string }) => {
            item.fullName = item.fullName.replace(/全国/, '');
          });
          setSearchList(arr);
        }
      }, 400);
    }
  };

  // 获取政区列表
  const getAreaList = async (data: any) => {
    const res = await queryChild.abort().fetch({ code: data.code, withShape: 0 });
    if (res) setAreaList(res.child || []);
  };
  // 获取导航数据
  const queryParents = async (code: string) => {
    const res = await queryParentsService.abort().fetch({ code, withShape: 0 });
    if (res) setCrumbs(res || []);
  };
  const getQuery = async (v: any) => {
    if (Array.isArray(v.data)) {
      const [data] = v.data;
      queryParents(data.code);
      getAreaList(data);
      return;
    }
    // 点击导航后地图事件的回调
    const { child, item } = v.data;
    queryParents(item.code);
    if (Array.isArray(child)) {
      setAreaList(child);
    }
  };

  const onOpenAttrSheet: TMyDataProps['openAttributeTable'] = (params) => {
    setAttributeParams(params);
    setAttrTableOpen(true);
  };

  /** 更新地图位置 */
  const updateMapLocation = () => {
    if (!bizFsMap) {
      return;
    }
    const view = bizFsMap.olMap.getView();
    const zoom = view.getZoom();
    const center = view.getCenter();
    if (zoom && center) {
      const locationInfo: MapLocationInfo = { zoom, center };
      setSessionStorageItem(mapLocationCachekey, JSON.stringify(locationInfo));
    }
  };

  /** 还原地图位置 */
  const restoreMapLocation = (fsMap: IFsMap) => {
    const locationInfoStr = getSessionStorageItem(mapLocationCachekey);
    if (!locationInfoStr) {
      return;
    }
    try {
      const locationInfo = JSON.parse(locationInfoStr) as MapLocationInfo;
      if (locationInfo) {
        const view = fsMap.olMap.getView();
        view.setZoom(locationInfo.zoom);
        view.setCenter(locationInfo.center);
      }
      return;
    } catch (error) {}
  };

  /** 还原底图图层显隐配置 */
  const restoreLayerVisibleByCache = (fsMap: IFsMap) => {
    const layerVisibleList = layerVisibleListRef.current;
    if (layerVisibleList && Array.isArray(layerVisibleList)) {
      layerVisibleList.forEach(({ layerId, visible }) => {
        if (visible) {
          fsMap.showLayer(layerId);
        } else {
          fsMap.hideLayer(layerId);
        }
      });
    }
  };

  const onInnerFsMapCreated = (fsMap: IFsMap) => {
    if (onFsMapCreated) {
      onFsMapCreated(fsMap);
    }
    restoreMapLocation(fsMap);
    setTimeout(() => {
      restoreLayerVisibleByCache(fsMap);
    }, 1000);
    setBizFsMap(fsMap);
    setDistLocation(
      new DistLocation({
        fsMap,
        mapEventCallback: (params) => {
          // 加锁控制
          if (lockRef.current) return;
          lockRef.current = true;
          getQuery(params);
        },
      }),
    );
    fsMap.olMap.on('moveend', updateMapLocation);
  };

  const getConfigByCache = async (): Promise<TGetConResData[]> => {
    const configStr = getSessionStorageItem(mapTreeConfigCachekey);
    if (configStr) {
      try {
        const dtsjConfig = JSON.parse(configStr);
        if (dtsjConfig) {
          return dtsjConfig;
        }
      } catch (error) {}
    }
    const res = await getConfig.fetch();
    if (!res || !res.success) {
      message.error(res?.msg);
      return [];
    }
    const configDatas = res.datas;
    setSessionStorageItem(mapTreeConfigCachekey, JSON.stringify(configDatas));
    return configDatas;
  };

  /** 获取图层树形数据 */
  const getLayerInfo = async () => {
    const dtsjTree = await getConfigByCache();
    const dtsjDataList = Array.isArray(dtsjTree) ? dtsjTree : [];
    return dtsjDataList as TOperListItem[];
  };

  /** 地图和图层配置 */
  const initMapLayersConfig = async () => {
    const configStr = getSessionStorageItem(mapLayersConfigCachekey);
    if (configStr) {
      try {
        const config = JSON.parse(configStr) as MapLayersConfig;
        if (config) {
          setMapLayersConifg(config);
          return;
        }
      } catch (error) {}
    }
    const res = await getAppMapLayersConfig(true).catch(() => undefined);
    if (res && res.datas) {
      const newConfig = {
        layerConfigs: res.datas.layerConfig,
        mapConfig: res.datas.mapConfig,
      };
      setMapLayersConifg(newConfig);
      setSessionStorageItem(mapLayersConfigCachekey, JSON.stringify(newConfig));
    } else {
      message.error(`地图配置获取错误，${res?.msg}`);
    }
  };

  useEffect(() => {
    // 预先读取底图显隐的设置
    const layerVisibleStr = getSessionStorageItem(mapBaseLayerCachekey);
    if (layerVisibleStr) {
      try {
        const layerVisibleList = JSON.parse(layerVisibleStr) as MapBaseLayerVisible;
        layerVisibleListRef.current = layerVisibleList;
      } catch (error) {
        layerVisibleListRef.current = [];
      }
    } else {
      layerVisibleListRef.current = [];
    }

    initMapLayersConfig();
  }, []);

  useEffect(() => {
    if (zqLocation && distLocation && zqCode && !isNationZqCode(zqCode)) {
      distLocation.strokeGeom(zqCode);
    }
  }, [distLocation, zqCode, zqLocation]);

  useEffect(() => {
    if (mapLayersConifg && mapLayersConifg.layerConfigs && defaultLayerNames) {
      const layers = mapLayersConifg.layerConfigs.filter((item) => defaultLayerNames.includes(item.c_layerName));
      setDefaultLayers(layers.map((item) => `${item.i_id}`));
    }
  }, [mapLayersConifg, defaultLayerNames]);

  const baseLayerVisibleChanged = ({ type, targetLayer, visible }: FsLayerVisibleChangedParams) => {
    if (type !== 'triggerLayer:check') {
      return;
    }
    const layerVisibleList = layerVisibleListRef.current;
    const layerId = targetLayer.layerId;
    const index = layerVisibleList.findIndex((c) => c.layerId === layerId);
    if (index === -1) {
      layerVisibleList.push({ layerId, visible: !!visible });
    } else {
      layerVisibleList[index].visible = !!visible;
    }
    setSessionStorageItem(mapBaseLayerCachekey, JSON.stringify(layerVisibleList));
  };

  useEffect(() => {
    if (bizFsMap) {
      setTimeout(() => {
        bizFsMap.olMap.updateSize();
      }, 300);
    }
  }, [collapsed, bizFsMap]);

  useEffect(() => {
    if (bizFsMap) {
      bizFsMap.event.on('layerVisibleChanged', baseLayerVisibleChanged);
    }
    return () => {
      if (bizFsMap) {
        bizFsMap.event.off('layerVisibleChanged', baseLayerVisibleChanged);
      }
    };
  }, [bizFsMap]);

  useEffect(() => {
    if (mapToolEvent && bizFsMap) {
      mapToolEvent.on('onToolClick', (toolKey) => {
        switch (toolKey) {
          case 'sq':
          case 'sqglq':
            bizFsMap.event.emit('bookmarkVisible', true);
            break;
          case 'refresh':
            // 刷新地图
            Object.values(bizFsMap.fsLayers).forEach((layer) => {
              layer.refresh();
            });
            bizFsMap.olMap.render();
            break;
          default:
            break;
        }

        if (toolKey === 'sq' || toolKey === 'sqglq') {
          bizFsMap.event.emit('bookmarkVisible', true);
        }
      });
      mapToolEvent.on('onPanelItemRemoved', (panelItemKey) => {
        if (panelItemKey === 'sqglq') {
          bizFsMap.event.emit('bookmarkVisible', false);
        }
      });
    }

    return () => {};
  }, [mapToolEvent, bizFsMap]);

  if (!mapLayersConifg) {
    return <Spin tip="地图加载中" />;
  }

  return (
    <div className={`biz-map-container ${panelvisible ? 'floating-map' : 'not-floating-map'} `} {...wrapperProps}>
      <div {...mapWrapperProps}>
        {bizFsMap && showLayerTree && (
          <BizLayerTree
            fsMap={bizFsMap}
            layerCategoryKey={layerCategoryKey}
            defaultLayers={defaultLayers}
            openAttributeTable={onOpenAttrSheet}
          />
        )}
        <div className="map-area">
          {!!bizFsMap && (
            <Area
              crumbs={crumbs}
              areaList={areaList}
              searchList={searchList}
              onSearch={onSearch}
              crumbsClick={crumbsClick}
              strokeGeom={crumbsClick}
              onSearchRow={onSearchRow}
              getPopupContainer={(node) => node}
            />
          )}
        </div>
        <BizBaseMap {...restProps} {...mapLayersConifg} onFsMapCreated={onInnerFsMapCreated} />
        <Tool
          fsMap={bizFsMap}
          {...toolProps}
          toolList={customToolList}
          toolContainerStyle={{ top: '12px', right: '12px' }}
          allToolList={[]}
          toolItemRender={toolItemRender}
        />
      </div>
      <Panel
        onPanelVisibleChange={(e) => {
          setPanelvisible(Boolean(e.visible));
        }}
        titleClosable
        tabPanelClosable={false}
        flow
        fsMap={bizFsMap}
      />
      {bizFsMap && <TriggerLayer fsMap={bizFsMap} getLayerInfo={getLayerInfo} />}
      {bizFsMap && attrTableOpen && attributeParams.tableName && (
        <BizAttributeTable
          open={attrTableOpen}
          onOpenChange={setAttrTableOpen}
          fsMap={bizFsMap}
          {...attributeParams}
          // 我的数据隐藏 属性表左侧筛选功能、定位、shape导入、汇总统计、
          hideFilter={attributeParams.querySourceType === 'my-network'}
          hideShapeImport={attributeParams.querySourceType === 'my-network'}
          hideSummaryStatistics={attributeParams.querySourceType === 'my-network'}
        />
      )}
      {children}
    </div>
  );
};

export default BizProMap;

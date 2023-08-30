import React, { useReducer, useRef, useEffect, useMemo, useCallback } from 'react';
import { Space, Tooltip, Dropdown, Button, message, Spin, notification } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Stroke, Style, Fill, Text, Circle } from 'ol/style';
import DraggableTree from '@mapzone/draggable-tree';
import { JsonParse } from '@mapzone/utils';
import { WgDwMap, SzBase, ZhiDingBase, ZhiDiBase, SxbBase, GdBase } from '@mapzone/icons';
import { ModalTips } from '@/utils/modal-tips';
import ServerDataModal from '../server-data-modal';
import LayerConfigModal from '../layer-config-modal';
import { zindexRange, initLocalLayerConfig } from '../../const';
import { reducer, initialState } from './reducer';
import { formatLayerId, json2Features, loadLayerJSON, getLayerProperties, computeZIndex } from '../utils';
import { getMyLayerList, updateMyLayerOrder, deleteMyLayer } from '../service';
import event from '../../event';
import type { MouseEvent, Key } from 'react';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type { DataNode } from 'antd/lib/tree';
import type { FsFC } from '@mapzone/types';
import type { FsVectorLayer, TBaseGeometryType } from '@mapzone/map-kit';
import type { DraggableTreeProps } from '@mapzone/types';
import type { TLayerStyleConfig, TMyDataProps, TMyLayer, TMyLayerData, TMyLayerTreeData, TCheckParams } from '../../types';
import './index.less';

const prefixCls = 'my-data';
const jsonFormat = 'geojson';

const defaultTreeNodeStyle: React.CSSProperties = {
  height: '40px',
};

type TSortType = 'top' | 'bottom';

const CloudLayerList: FsFC<TMyDataProps> = (props) => {
  const { fsMap, treeNodeStyle = defaultTreeNodeStyle, title = '我的参考图层', openAttributeTable } = props;
  const titleTextStyle = useMemo<React.CSSProperties>(() => {
    return {
      lineHeight: treeNodeStyle.height,
    };
  }, [treeNodeStyle.height]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const viewZoom = useRef(0);
  const { serverDataModalOpen, layerConfigModalOpen, currentMyLayer, treeData, treeCheckedKeys, loading, loadingTip } = state;

  /** 图层样式 */
  const getLayerStyle = (styleConifg: TLayerStyleConfig, feature: Feature<Geometry>, geometryType: TBaseGeometryType): any => {
    const { color, width, fillColor, label, borderStyle, labelFontSize, labelColor } = styleConifg;
    let lineDash: number[] | undefined;
    if (borderStyle === 'dotted') {
      lineDash = [1, 5];
    } else if (borderStyle === 'dashed') {
      lineDash = [10, 10];
    }

    let layerStyle: Style;
    if (geometryType === 'Point') {
      layerStyle = new Style({
        image: new Circle({
          radius: 2,
          stroke: new Stroke({
            color,
            width,
            lineDash,
          }),
        }),
      });
    } else {
      layerStyle = new Style({
        stroke: new Stroke({
          color,
          width,
          lineDash,
        }),
      });
      if (fillColor) {
        layerStyle.setFill(
          new Fill({
            color: fillColor,
          }),
        );
      }
    }
    if (label) {
      layerStyle.setText(
        new Text({
          text: `${feature.get(label) || ''}`,
          textAlign: 'center',
          font: `${labelFontSize}px sans-serif`,
          fill: new Fill({
            color: labelColor,
          }),
          overflow: viewZoom.current >= 15,
        }),
      );
    }

    return layerStyle;
  };

  /** 初始化olLayer 并添加到fsMap 中 */
  const initAndAddOlLayer = async (layerItem: TMyLayerData) => {
    const { layerId, layerName, attrFields = [], geometryType, style, JSON } = layerItem;

    // 使用配置文件添加图层
    const config = {
      ...initLocalLayerConfig,
      i_id: layerId,
      c_layerName: layerName,
      c_dataName: layerName,
      i_zIndex: zindexRange[0],
      attrFields,
    };
    config.capability.c_geoType = geometryType;
    await fsMap.addLayerByConfig(config);
    const layer = fsMap.fsLayers[layerId] as FsVectorLayer;
    if (layer) {
      layer.set('keepLive', true);
      layer.setStyle((feature: any) => getLayerStyle(style, feature, geometryType));
      const features = json2Features(JSON, jsonFormat);
      features.forEach((fea) => {
        fea.setId(fea.get('PK_UID'));
        fea.set('layerId', layer.layerId, true);
      });
      layer.getSource()!.addFeatures(features);
    }
  };

  /** 加载图层到ol地图中 */
  const loadOlLayers = async (data: TMyLayerTreeData[], layerList: TMyLayerData[]) => {
    dispatch({
      type: 'update',
      loading: true,
      loadingTip: '解析图层数据中，请稍等',
    });
    const newTreeData: TMyLayerTreeData[] = [];
    for (let i = 0; i < layerList.length; i += 1) {
      const layerItem = layerList[i];
      const treeNode: TMyLayerTreeData = {
        key: layerItem.layerId,
        title: layerItem.layerName,
        data: layerItem.data,
      };

      if (!fsMap.fsLayers[layerItem.layerId]) {
        if (layerItem.JSON) {
          await initAndAddOlLayer(layerItem);
        } else {
          treeNode.disabled = true;
        }
      }
      newTreeData.push(treeNode);
    }
    const nameArr = newTreeData.filter((s) => s.disabled).map((s) => s.data.C_DATANAME);
    if (nameArr.length > 0) {
      notification.warning({
        message: `${title} 加载部分出错`,
        description: `“${nameArr.join('，')}” 加载图层数据失败，无法展示！`,
      });
    }
    const obj = newTreeData.reduce(
      (acc, cur) => {
        return { ...acc, [cur.key]: cur };
      },
      {} as Record<TMyLayerTreeData['key'], TMyLayerTreeData>,
    );
    dispatch({
      type: 'update',
      loading: false,
      loadingTip: '',
      treeData: data.map((v) => obj[v.key] || v),
    });
  };

  const loadCloudLayerList = async (data: TMyLayerTreeData[], currentLayerId: string) => {
    const list = data.filter((v) => v.key === currentLayerId);
    dispatch({
      type: 'update',
      loading: true,
      loadingTip: '加载图层数据中，请稍等',
    });
    const loadCloudLayerData = async (item: TMyLayerTreeData): Promise<TMyLayerData> => {
      const jsonContent = await loadLayerJSON(item.data.I_USEROWNEDDATAID);
      return {
        layerId: `${item.key}`,
        layerName: item.data.C_DATANAME,
        style: item.data.C_STYLE,
        geometryType: item.data.C_TABLETYPE,
        attrFields: item.data.C_DATAINFO.tableFields,
        JSON: jsonContent,
        data: item.data,
      };
    };

    const promiseList = list.map((c) => loadCloudLayerData(c));
    const myLayerDataList = await Promise.all(promiseList);
    await loadOlLayers(data, myLayerDataList);
  };

  /** 获取我的图层列表 */
  const getMyLayerAllList = async () => {
    const res = await getMyLayerList();
    if (!res?.success) {
      message.error(`获取我的图层出错，${res.msg}`);
      return undefined;
    }
    const layerList: TMyLayerTreeData[] = res.datas.map((item) => {
      // JSON Parse
      const { C_DATAINFO, C_STYLE, ...rest } = item;
      const dataInfo: TMyLayer['C_DATAINFO'] = JsonParse(C_DATAINFO) || {};
      dataInfo.tableFields = JsonParse(dataInfo.tableFields) || [];
      const styleConfig: TMyLayer['C_STYLE'] = JsonParse(C_STYLE) || { color: '#03a8f3', width: 1 };
      return {
        data: { ...item, C_DATAINFO: dataInfo, C_STYLE: styleConfig },
        key: formatLayerId(rest.I_USEROWNEDDATAID),
        title: rest.C_DATANAME,
      };
    });
    dispatch({
      type: 'update',
      treeData: layerList,
    });
    return layerList;
  };

  /** 更新我的数据左侧树 */
  const updateLayerOrder = async (newTreeData: TMyLayerTreeData[]) => {
    const nodes = newTreeData.map((s, index) => ({
      id: s.data.I_ID,
      order: index,
    }));
    const res = await updateMyLayerOrder({ nodes });
    if (!res?.success) {
      message.error(`更新我的数据排序出错，${res.msg}`);
      return;
    }
    getMyLayerAllList();
    dispatch({
      type: 'update',
      treeData: newTreeData,
    });
  };

  /** 删除图层 */
  const handleRemoveLayer = async (node: TMyLayerTreeData) => {
    const id = node.data.I_ID;
    const res = await deleteMyLayer({ id });
    if (!res?.success) {
      message.error(`移出数据出错，${res.msg}`);
      return;
    }
    getMyLayerAllList();
    dispatch({
      type: 'update',
      treeCheckedKeys: treeCheckedKeys.filter((v) => v !== node.key),
    });
    const layerId = formatLayerId(node.data.I_USEROWNEDDATAID);
    fsMap.removeLayerById(`${layerId}`);
  };

  const onRemoveLayerClick = (_e: MouseEvent<HTMLElement>, node: TMyLayerTreeData) => {
    ModalTips({
      title: `确定移出“${node.title}” 数据吗？`,
      onOk: () => handleRemoveLayer(node),
    });
  };

  /** 更新我的图层 zIndex */
  const updateMyLayerZIndex = async (dataList: DataNode[]) => {
    const newList: TMyLayerTreeData[] = [];
    const { length } = dataList;
    dataList.reduceRight((_, layer, index) => {
      newList.unshift(layer as any);
      const fsLayer = fsMap.fsLayers[layer.key];
      if (fsLayer) {
        fsLayer.setZIndex(computeZIndex(length, index));
      }
      return newList;
    }, newList);
    updateLayerOrder(newList);
  };

  /** 我的数据图层排序 */
  const onSortMyLayer = (nodeKey: Key, type: TSortType) => {
    const nodeIndex = treeData.findIndex((s) => s.key === nodeKey);
    if (nodeIndex === -1) {
      return;
    }
    const newTreeData = [...treeData];
    const deletedArr = newTreeData.splice(nodeIndex, 1);
    switch (type) {
      case 'top':
        newTreeData.unshift(deletedArr[0]);
        break;
      case 'bottom':
        newTreeData.push(deletedArr[0]);
        break;
      default:
        break;
    }
    updateMyLayerZIndex(newTreeData);
  };

  const onServerDataModalShow = useCallback(() => {
    dispatch({
      type: 'update',
      serverDataModalOpen: true,
    });
  }, []);

  const onServerDataModalHide = () => {
    dispatch({
      type: 'update',
      serverDataModalOpen: false,
    });
  };

  const triggerLayer = (layerId: string, checked: boolean) => {
    const layer = fsMap.fsLayers[layerId];
    if (!layer) {
      return;
    }
    layer.layerConfig.i_visible = checked;
    layer.setVisible(checked);
    const index = treeData.findIndex((v) => v.key === layerId);
    if (index === -1) {
      return;
    }
    layer.setZIndex(computeZIndex(treeData.length, index));
  };

  const onCheck = async (params: TCheckParams) => {
    const { checked, checkedKeys, currentKey, data = treeData } = params;
    dispatch({
      type: 'update',
      treeCheckedKeys: checkedKeys,
    });
    triggerLayer(currentKey, checked);
    if (checked) {
      await loadCloudLayerList(data, currentKey);
      triggerLayer(currentKey, checked);
    }
  };

  /** 添加图层 */
  const onAddLayer = async (addLayerIds: Key[]) => {
    const newAddLayerIds = addLayerIds.map((id) => formatLayerId(id));
    const newCheckedKeys = [...new Set([...treeCheckedKeys, ...newAddLayerIds])];
    onServerDataModalHide();
    const data = await getMyLayerAllList();
    if (newAddLayerIds.length === 1 && data) {
      onCheck({
        checked: true,
        checkedKeys: newCheckedKeys,
        currentKey: newAddLayerIds[0],
        data,
      });
    }
  };

  /** 定位到当前图层范围 */
  const handleLocationLayer = (e: MouseEvent<HTMLElement>, node: TMyLayerTreeData) => {
    e.stopPropagation();
    if (!fsMap) {
      return;
    }
    const olMap = fsMap.getOLMap();
    const layer = fsMap.fsLayers[node.key];
    if (layer && layer.isFsLayer) {
      const vectorLayer = layer as FsVectorLayer;
      const extent = vectorLayer.getSource()!.getExtent();
      if (extent) {
        olMap.getView().fit(extent);
      }
    }
  };

  const showAttrTable = async (e: MouseEvent<HTMLElement>, node: TMyLayerTreeData) => {
    e.stopPropagation();
    if (!openAttributeTable) {
      message.warn('请配置打开属性表事件');
      return;
    }
    const jsonData = await loadLayerJSON(node.data.I_USEROWNEDDATAID);
    if (!jsonData) {
      message.warn('这条数据不存在，请删除后重新上传');
      return;
    }
    const propsList = getLayerProperties(jsonData, 'geojson').map((v) => ({
      ...v,
      featureId: v.PK_UID,
    }));
    const layerId = `${node.key}`;
    let layer = fsMap.getLayerById(layerId);
    if (!layer || !layer.getVisible()) {
      const newCheckedKeys = [...new Set([...treeCheckedKeys, node.key])];
      await onCheck({
        checked: true,
        checkedKeys: newCheckedKeys,
        currentKey: layerId,
      });
      layer = fsMap.getLayerById(layerId);
    }
    openAttributeTable({
      layerId,
      tableName: 'cloud-layer',
      title: `${node.data.C_DATANAME}`,
      getDataSource: async () => propsList,
      getCount: async () => propsList.length,
      getMetadataList: async () => await layer.getAttrTableFields(node.data.C_DATAINFO.tableFields),
      querySourceType: 'my-network',

      // toolbarProps
      hideFilter: true,
      hideShapeImport: true,
      hideSummaryStatistics: true,
      hideBatchAssign: true,
      hideFieldsCalculation: true,
    });
  };

  const onLayerConfigModalHide = () => {
    dispatch({
      type: 'update',
      layerConfigModalOpen: false,
      currentMyLayer: undefined,
    });
  };

  const onLayerConfigChange = (styleConfig: TLayerStyleConfig) => {
    const layerId = formatLayerId(currentMyLayer!.I_USEROWNEDDATAID);

    const layerTreeIndex = treeData.findIndex((t) => t.key === layerId);
    if (layerTreeIndex > -1) {
      treeData[layerTreeIndex].data.C_STYLE = styleConfig;
      dispatch({
        type: 'update',
        treeData: [...treeData],
      });
    }

    const layer = fsMap?.fsLayers[layerId];

    if (layer && layer.isFsLayer) {
      const geometryType = layer.layerConfig.capability.c_geoType as TBaseGeometryType;
      (layer as FsVectorLayer).setStyle((feature: any) => getLayerStyle(styleConfig, feature, geometryType));
    }
    onLayerConfigModalHide();
  };

  const onLayerConfigModalShow = (e: MouseEvent<HTMLElement>, node: TMyLayerTreeData) => {
    e.stopPropagation();
    dispatch({
      type: 'update',
      layerConfigModalOpen: true,
      currentMyLayer: node.data,
    });
  };

  const titleRender = (node: any) => {
    const isLeaf = true;
    const nodeTitle = typeof node.title === 'function' ? node.title(node) : node.title;
    const items = [
      {
        key: 'top',
        label: (
          <Button key="top" type="text" size="small" onClick={() => onSortMyLayer(node.key, 'top')}>
            置顶
          </Button>
        ),
        icon: <ZhiDingBase />,
      },
      {
        key: 'bottom',
        label: (
          <Button key="bottom" type="text" size="small" onClick={() => onSortMyLayer(node.key, 'bottom')}>
            置底
          </Button>
        ),
        icon: <ZhiDiBase />,
      },
    ];

    const operation = [];
    if (!node.disabled && isLeaf) {
      operation.push(
        <Tooltip title="定位" key="positioning">
          <WgDwMap onClick={(e) => handleLocationLayer(e, node)} />
        </Tooltip>,
        <Tooltip title="属性表" key="property-sheet">
          <SxbBase onClick={(e) => showAttrTable(e, node)} />
        </Tooltip>,
        <Tooltip title="设置图层样式" key="set-style">
          <SzBase onClick={(e) => onLayerConfigModalShow(e, node)} />
        </Tooltip>,
      );
    }
    if (isLeaf) {
      operation.push(
        <Tooltip title="移出数据" key="remove-layer">
          <CloseOutlined onClick={(e) => onRemoveLayerClick(e, node)} />
        </Tooltip>,
      );
    }

    return (
      <>
        <Tooltip title={nodeTitle}>
          <span className={`${prefixCls}-tree-title-text`} style={titleTextStyle}>
            {nodeTitle}
          </span>
        </Tooltip>
        <Space className={`${prefixCls}-tree-title-operation`}>
          {operation.map((s) => s)}
          {!node.disabled && (
            <Dropdown menu={{ items }} trigger={['click']} arrow>
              <GdBase style={{ transform: 'rotate(90deg)' }} onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          )}
        </Space>
      </>
    );
  };

  const treeProps: Partial<DraggableTreeProps> = {
    checkable: true,
    titleRender,
    className: `${prefixCls}-tree`,
    onCheck: (checkedKeys, info) => {
      onCheck({
        checked: info.checked,
        checkedKeys: checkedKeys as Key[],
        currentKey: info.node.key.toString(),
      });
    },
  };

  useEffect(() => {
    getMyLayerAllList();
    const listener = () => {
      const zoom = fsMap.getOLMap().getView().getZoom();
      viewZoom.current = Math.floor(zoom || 0);
    };
    const olMap = fsMap.getOLMap();
    olMap.on('moveend', listener);
    listener();
    return () => {
      fsMap.getOLMap().un('moveend', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fsMap]);

  useEffect(() => {
    event.on('importData', onServerDataModalShow);
    return () => {
      event.off('importData', onServerDataModalShow);
    };
  }, [onServerDataModalShow]);

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-header`}>
        <span className="header-title">{title}</span>
        <Button type="primary" ghost size="small" disabled={!fsMap} onClick={onServerDataModalShow}>
          数据导入
        </Button>
      </div>
      <div className={`${prefixCls}-body`}>
        <Spin delay={1000} tip={loadingTip} spinning={loading}>
          <DraggableTree checkedKeys={treeCheckedKeys} onDroped={updateMyLayerZIndex} treeData={treeData} {...treeProps} />
        </Spin>
      </div>
      <ServerDataModal open={serverDataModalOpen} onOk={onAddLayer} onCancel={onServerDataModalHide} />
      <LayerConfigModal open={layerConfigModalOpen} myLayer={currentMyLayer} onOk={onLayerConfigChange} onCancel={onLayerConfigModalHide} />
    </div>
  );
};

export default CloudLayerList;

import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Spin, Tree, message, Tooltip } from 'antd';
import { MenuFoldOutlined } from '@ant-design/icons';
import { SxbBase } from '@mapzone/icons';
import { Icon } from '@mapzone/icon';
import { LayerLegend } from '@/components/icons';
import { getConfig } from '@mapzone/map-services';
import { getSessionStorageItem, isJSON, JsonParse, setSessionStorageItem } from '@mapzone/utils';
import { BizMyData } from '../biz-my-data';
import { ywshLayerGroupKey } from '@/constants';
import { getCheckedKeys, mapping, updateConfigList } from './utils';
import type { Key } from 'react';
import type { TreeProps } from 'antd/lib/tree';
import type { FsFC, TGetConResData } from '@mapzone/types';
import type { BizLayerTreeProps } from './types';
import './index.less';
import { useFsMapEventListener } from '@mapzone/hooks';

const fieldNames: TreeProps['fieldNames'] = {
  key: 'id',
  title: 'title',
  children: 'children',
};

const prefixCls = 'biz-layer-tree';
let legendKey = 0;
/** 地图配置缓存key */
const mapTreeConfigCachekey = 'biz-map-tree-config';

const BizLayerTree: FsFC<BizLayerTreeProps> = (props) => {
  const { fsMap, className, defaultLayers, openAttributeTable, layerCategoryKey } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TGetConResData[]>([]);
  const treeDataRef = useRef(treeData);
  const [initialExecution, setInitialExecution] = useState<boolean>(false);
  const [minus, setMinus] = useState<boolean>(false);
  const [layerLegendVisible, setLayerLegendVisible] = useState<Record<string, boolean>>({});
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);

  const onClickContentItem = async (treeNode: any) => {
    const { i_id, c_dataServiceParam } = (treeNode?.original || [])[0] || {};
    if (!c_dataServiceParam) {
      return;
    }
    const dataServiceParam = isJSON(c_dataServiceParam) ? JsonParse(c_dataServiceParam) : c_dataServiceParam;
    const tableName = dataServiceParam.tableName;
    if (!i_id || !tableName) {
      return;
    }
    if (openAttributeTable) {
      const layerId = `${i_id}`;
      openAttributeTable({
        querySourceType: 'common',
        layerId,
        tableName: tableName,
        title: treeNode?.title,
        filter: dataServiceParam.filter || '',
      });
    }
  };

  const updateLayerVisible = (layerIds: string[], visible: boolean) => {
    layerIds.forEach((layerId) => {
      if (visible) {
        fsMap.showLayer(layerId);
      } else {
        fsMap.hideLayer(layerId);
      }
    });
  };

  const onInternalLegendClick = (layerId?: string | number) => {
    if (layerId) {
      layerLegendVisible[layerId] = !layerLegendVisible[layerId];
    }
    setLayerLegendVisible({ ...layerLegendVisible });
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

  const getMapLayerData = async () => {
    setLoading(true);
    const configDatas = await getConfigByCache();
    setLoading(false);
    const ywsjData = configDatas.find((c) => c.category && c.category.includes(ywshLayerGroupKey));
    let dataList: TGetConResData[] = [];
    if (ywsjData) {
      dataList = ywsjData.children || [];
    }
    if (layerCategoryKey && dataList.length) {
      dataList = dataList.filter((c) => c.category && c.category.includes(layerCategoryKey));
    }
    treeDataRef.current = updateConfigList(dataList, [], true);
    setTreeData(treeDataRef.current);
    setInitialExecution(true);
  };

  const onLayerTreeCheck: Required<TreeProps<Record<string, any>>>['onCheck'] = (newKeys, info) => {
    const { checked, node } = info;
    if (!Array.isArray(node.original) || !node.original.length) {
      return;
    }
    const layerId = node.original[0].i_id;
    if (checked) {
      fsMap.showLayer(layerId);
    } else {
      fsMap.hideLayer(layerId);
    }
    if (Array.isArray(newKeys)) {
      setCheckedKeys(newKeys);
    } else {
      setCheckedKeys(newKeys.checked);
    }
  };

  const renderLegendItemIcon = (item: Record<string, any>) => {
    const style: React.CSSProperties = {};
    let cls = '';
    if (item.s_type === 'color') {
      style.background = item.color;
      cls = '-color';
    } else if (item.s_type === 'image') {
      style.background = `url(${item.src})`;
      cls = '-img';
    }
    return <div className={`legend-item-icon legend-item-icon${cls}`} style={style} />;
  };

  const renderLegend = (legendValue?: Record<string, any>[], layerId?: string | number) => {
    let legendNode: React.ReactNode = null;
    if (layerId && legendValue && legendValue.length) {
      legendNode = (
        <div className={classNames(`${prefixCls}-legend`, { show: layerLegendVisible[layerId] })}>
          {legendValue.map((item) => {
            return (
              <div className={`${prefixCls}-legend-item`} key={++legendKey}>
                {renderLegendItemIcon(item)}
                <div className={`${prefixCls}-legend-item-title`}>{item.title}</div>
              </div>
            );
          })}
        </div>
      );
    }

    return legendNode;
  };

  const getType = (src: string) => (src.split('.').reverse()[0] === 'svg' ? 'svg' : 'img');

  const renderIcon = (icon: React.ReactNode) => {
    return typeof icon === 'string' ? <Icon type={getType(icon)} src={icon} /> : icon;
  };

  const treeTitleRender: TreeProps['titleRender'] = (node: TGetConResData) => {
    const { title, children, original = [], iconUrl, iconColor } = node;
    if (children && children.length > 0 && original.length === 0) {
      return <>{title}</>;
    }

    const { capability, i_id, c_legend, c_dataServiceParam } = original[0];
    let legend: Record<string, any>[] | undefined;
    if (c_legend) {
      try {
        legend = JSON.parse(c_legend);
      } catch (error) {
        legend = undefined;
      }
    }
    let src = iconUrl;
    if (!src) {
      src = mapping[`${capability.c_geoType}`];
      src = !src ? (`${title}`.includes('影像') ? mapping.image : mapping.default) : src;
    }
    if (src && !src.includes('://')) {
      src = `${PUBLIC_PATH}${src}`;
    }
    /** 判断是否显示属性表按钮 */
    const hideAttrTable = !c_dataServiceParam;

    return (
      <>
        <div className="layer-node">
          {iconColor ? <div className="layer-color-box" style={{ backgroundColor: iconColor }} /> : renderIcon(iconUrl)}
          <span className="layer-title">
            <Tooltip title={title as string}>{title as string}</Tooltip>
          </span>
          {legend && (
            <Tooltip title="图例">
              <span className="layer-item-action layer-legend" onClick={() => onInternalLegendClick(i_id)}>
                <LayerLegend />
              </span>
            </Tooltip>
          )}
          {!hideAttrTable && (
            <Tooltip title="属性表">
              <span className="layer-item-action layer-attr-table" onClick={() => onClickContentItem(node)}>
                <SxbBase />
              </span>
            </Tooltip>
          )}
        </div>
        {renderLegend(legend, i_id)}
      </>
    );
  };

  const onInitializationRequest = () => {
    getMapLayerData();
  };

  useFsMapEventListener(fsMap.event, 'layerVisibleChanged', () => {
    const newKeys = getCheckedKeys(fsMap, treeDataRef.current);
    console.log(newKeys, 'layerVisibleChanged');

    setCheckedKeys(newKeys);
  });

  useEffect(() => {
    onInitializationRequest();
  }, []);

  useEffect(() => {
    if (defaultLayers && initialExecution) {
      updateLayerVisible(defaultLayers, true);
    }
  }, [defaultLayers, initialExecution]);

  return (
    <>
      <div
        className={classNames(`${prefixCls}-panel`, className, {
          hidden: minus,
          show: !minus,
        })}
      >
        <div className={`${prefixCls}-header`}>
          <div className="headline">
            <span className="header-title">图层</span>
          </div>
          <div className="icon" onClick={() => setMinus(!minus)}>
            <MenuFoldOutlined className="header-icon" />
          </div>
        </div>
        <div className={`${prefixCls}-content`}>
          <Spin spinning={loading}>
            <Tree
              blockNode
              treeData={treeData}
              checkedKeys={checkedKeys}
              checkable
              checkStrictly
              onCheck={onLayerTreeCheck}
              className={prefixCls}
              titleRender={treeTitleRender}
              fieldNames={fieldNames}
            />
          </Spin>
        </div>
        {fsMap && <BizMyData fsMap={fsMap} openAttributeTable={openAttributeTable} />}
      </div>
      <div className={classNames(`${prefixCls}-minus-icon`, { hidden: !minus })} onClick={() => setMinus(!minus)}>
        <span className="text">图层</span>
      </div>
    </>
  );
};

export default BizLayerTree;

import { useEffect, useReducer, useRef } from 'react';
import { Button, Popover, Select, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { geometryValid, wktFormat } from '@mapzone/map-kit';
import { DMap, XMap, MMap } from '@mapzone/icons';
import { getUserInfo } from '@mapzone/utils';
import { getWebAppConfig } from '@/utils';
import { thyzAdd, thyzEdit, thyzSearch } from './services';
import { initialState, reducer } from './reducer';
import Renderer from './renderer';
import {
  defaultGetFieldSymbol,
  defaultZQGroupName,
  filterFieldsToJson,
  filterFieldsToString,
  formatId,
  getFilter,
  getParentId,
  prefixCls,
} from './utils';
import type { FsFC, TMetadata } from '@mapzone/types';
import type { BizFilterProps, DrawType, IState, SelectedFieldItem, ThyzSearchRes, ZqParentInfo } from './types';
import './index.less';

/** 筛选组件 */
const BizFilter: FsFC<BizFilterProps> = (props) => {
  const {
    fsMap,
    metadataList,
    initialValues: propsInitialValues,
    getFieldSymbol = defaultGetFieldSymbol,
    ZQGroupName = defaultZQGroupName,
    onChange,
    tableName,
  } = props;
  const [state, dispatch] = useReducer(reducer, { ...initialState });
  const { selectedItemList, groupData, selectedFieldName, defaultFilterFields, optionsList, geometry } = state;
  const zqCodesRef = useRef<string[]>([]);
  const cacheZqInfoByFieldnameRef = useRef<Record<string, ZqParentInfo>>({});
  const userFilterFieldsRef = useRef<ThyzSearchRes>();

  const clearDraw = () => {
    fsMap.selections.clear();
    fsMap.currentTool?.cancel();
  };

  const drawGeometry = async (drawType: DrawType) => {
    fsMap.changeCursorStyle('fs_cursor_edit');
    const drawData = await fsMap.drawTool.draw(drawType);
    fsMap.changeCursorStyle('fs_cursor_move');
    if (!drawData || !drawData.feature) {
      return;
    }
    const feature = drawData.feature;
    const geometry = feature.getGeometry();
    if (!geometry) {
      message.warning('获取图形错误，请重新绘制！');
      clearDraw();
      return;
    }
    if (!geometryValid(geometry)) {
      message.warning('图形自相交，请重新绘制！');
      clearDraw();
      return;
    }
    const geometryWkt = wktFormat.writeFeature(feature);
    const filterStr = getFilter(selectedItemList);
    onChange({ filter: filterStr, selectedItemList, geometry: geometryWkt });
    dispatch({ type: 'update', filter: filterStr, geometry: geometryWkt });
  };

  /** 待添加字段变更 */
  const onNewFieldChange = (fieldName: string) => {
    dispatch({ type: 'update', selectedFieldName: fieldName });
  };

  /** 处理添加筛选字段 */
  const processAddSelectedFieldItem = (newSelectedItemList: SelectedFieldItem[], item: SelectedFieldItem) => {
    const { metadataItem } = item;
    const { relationGroup, relationIndex, fieldname } = metadataItem;
    if (relationGroup && typeof relationIndex === 'number') {
      if (groupData) {
        const initialZqCodes = relationGroup === ZQGroupName ? zqCodesRef.current : [];
        const group = groupData[relationGroup] || [];
        group.forEach((v: TMetadata) => {
          if (!v.relationGroup || v.relationGroup !== relationGroup) {
            return;
          }
          const parentField = group[v.relationIndex! - 1];
          const parentId = getParentId(newSelectedItemList, parentField?.fieldname);
          if (v.relationIndex && v.relationIndex < relationIndex) {
            const index = newSelectedItemList.findIndex((va) => va.key === v.fieldname);
            if (index < 0) {
              newSelectedItemList.push({
                metadataItem: v,
                value: v.fieldname,
                key: v.fieldname,
                label: v.fieldAliasName,
                relationGroup: v.relationGroup,
                parentLabel: parentField?.fieldAliasName,
                parentId,
                initialZqCodes,
              });
            }
          } else if (v.relationIndex === relationIndex && relationIndex) {
            item.parentId = parentId;
          }
        });

        item.initialZqCodes = initialZqCodes;
        if (relationIndex) {
          item.parentLabel = group[relationIndex - 1]?.fieldAliasName;
        }
      }
      const index = newSelectedItemList.findIndex((va) => va.key === fieldname);
      if (index < 0) {
        newSelectedItemList.push(item);
      }
    } else {
      newSelectedItemList.push(item);
    }
  };

  const addFilterFields = async (metadataItem: TMetadata) => {
    const extent = {
      name: metadataItem.fieldAliasName,
      field: metadataItem.fieldname,
    };
    const { original, realname, userid } = getUserInfo();
    const params = {
      C_NAME: realname,
      C_USERID: userid,
      C_CODE: original?.zqCode,
      C_TYPE: 'YZ',
      C_TABLENAME: tableName,
      C_EXTENT: filterFieldsToString(extent),
    };
    const { success, msg } = await thyzAdd(params);
    if (!success) {
      message.error(msg);
    }
  };
  const editFilterFields = async (metadataItem: TMetadata) => {
    // 当前添加的 过滤条件
    const extent = [
      {
        name: metadataItem.fieldAliasName,
        field: metadataItem.fieldname,
      },
    ];
    // 之前保存的过滤条件
    const beforeExtent = filterFieldsToJson(userFilterFieldsRef.current!.C_EXTENT);
    if (beforeExtent) {
      extent.push(beforeExtent);
    }
    // 将条件转成逗号分割的字符串
    const extentFields = extent.map((item) => item.field).join();
    const extentNames = extent.map((item) => item.name).join();
    const c_extent = filterFieldsToString({
      name: extentNames,
      field: extentFields,
    });
    // 拼接条件
    const params = {
      PK_UID: userFilterFieldsRef.current!.PK_UID,
      C_EXTENT: c_extent,
    };
    const { success, msg } = await thyzEdit(params);
    if (!success) {
      message.error(msg);
    }
    userFilterFieldsRef.current = {
      ...userFilterFieldsRef.current!,
      C_EXTENT: c_extent,
    };
  };

  // TODO: 掉接口，保存筛选配置
  const saveFilterFields = async (metadataItem: TMetadata) => {
    // 如果查询到则是编辑
    if (userFilterFieldsRef.current) {
      editFilterFields(metadataItem);
    } else {
      // 没有查询导 则是 新增
      addFilterFields(metadataItem);
    }
  };

  /** 添加筛选字段 */
  const onAddFilterField = async () => {
    const metadataItem = metadataList.find((f) => f.fieldname === selectedFieldName);
    if (!metadataItem) {
      dispatch({ type: 'update', selectedFieldName: '' });
      return;
    }
    saveFilterFields(metadataItem);
    const selectItem: SelectedFieldItem = {
      value: metadataItem.fieldname,
      key: metadataItem.fieldname,
      label: metadataItem.fieldAliasName,
      relationGroup: metadataItem.relationGroup,
      metadataItem,
      checkedMetadataValue: undefined,
    };
    const newSelectedItemList = [...selectedItemList];
    processAddSelectedFieldItem(newSelectedItemList, selectItem);
    newSelectedItemList.sort((a, b) => {
      const aFieldId = a.metadataItem.fieldId;
      const bFieldId = b.metadataItem.fieldId;
      return aFieldId - bFieldId;
    });
    dispatch({ type: 'update', selectedItemList: newSelectedItemList, selectedFieldName: '' });
  };

  /** 移除筛选字段 */
  const onRemoveFilterField = async (fieldItem: SelectedFieldItem) => {
    const deItem = fieldItem.metadataItem;
    const { relationGroup, relationIndex, fieldname, fieldAliasName } = deItem;

    if (userFilterFieldsRef.current) {
      const extent = filterFieldsToJson(userFilterFieldsRef.current.C_EXTENT);
      if (extent) {
        const names: string[] = extent.name.split(',');
        const fields: string[] = extent.field.split(',');
        const c_extent = filterFieldsToString({
          name: names.filter((i) => i !== fieldAliasName).join(),
          field: fields.filter((i) => i !== fieldname).join(),
        });
        // 拼接条件
        const params = {
          PK_UID: userFilterFieldsRef.current!.PK_UID,
          C_EXTENT: c_extent,
        };
        const { success, msg } = await thyzEdit(params);
        if (!success) {
          message.error(msg);
        }
        userFilterFieldsRef.current = {
          ...userFilterFieldsRef.current!,
          C_EXTENT: c_extent,
        };
      }
    }

    const newSelectedItemList = [...selectedItemList].reduce((acc: SelectedFieldItem[], cur) => {
      const currentItem = cur.metadataItem;
      if (relationGroup && currentItem.relationGroup === relationGroup) {
        if (currentItem.relationIndex! < relationIndex!) {
          acc.push(cur);
        }
      } else if (currentItem.fieldname !== fieldname) {
        acc.push(cur);
      }
      return acc;
    }, []);
    dispatch({ type: 'update', selectedItemList: newSelectedItemList });
  };

  const onChangeSelectItem = (newItem: SelectedFieldItem) => {
    const { metadataItem } = newItem;
    const { tablePk, relationGroup, relationIndex = 0 } = metadataItem;

    const newSelectedItemList = selectedItemList.map((current) => {
      if (current.key === newItem.key) {
        return newItem;
      }
      const currentMetadata = current.metadataItem;
      if (tablePk && relationGroup === currentMetadata.relationGroup) {
        if (relationIndex < currentMetadata.relationIndex!) {
          current.checkedMetadataValue = undefined;

          if (relationIndex === currentMetadata.relationIndex! - 1) {
            current.parentId = formatId(newItem.checkedMetadataValue);
          }
        } else if (relationIndex - 1 === currentMetadata.relationIndex) {
          newItem.parentId = formatId(current.checkedMetadataValue);
        }
      }
      return current;
    }, []);

    const index = newSelectedItemList.findIndex((c) => c.key === newItem.key);
    newSelectedItemList[index] = newItem;

    dispatch({ type: 'update', selectedItemList: newSelectedItemList });
  };

  const onInternalFilter = () => {
    const filterStr = getFilter(selectedItemList);
    onChange({ filter: filterStr, selectedItemList, geometry });
    dispatch({ type: 'update', filter: filterStr, geometry });
  };

  const getFilterFields = () => {
    const { appSettings } = getWebAppConfig();
    const filterFields = appSettings.filterFields || [];
    return filterFields;
  };

  const getUserFilterFields = async () => {
    let userFilterFields: string[] = [];
    const { original, userid } = getUserInfo();
    const params = {
      userId: userid,
      c_code: original?.zqCode,
      c_tableName: tableName,
    };
    userFilterFieldsRef.current = undefined;
    const { success, datas, msg } = await thyzSearch(params);
    if (!success) {
      message.error(msg);
      return userFilterFields;
    }
    if (!datas.length) {
      return userFilterFields;
    }
    const [filterFieldItem] = datas;
    const extent = filterFieldsToJson(filterFieldItem.C_EXTENT);
    if (extent) {
      userFilterFields = [...extent.field.split(',')];
    }
    userFilterFieldsRef.current = filterFieldItem;
    return userFilterFields;
  };

  /** 获取用户默认筛选配置 */
  const getDefaultFilterConfig = (metadataList: BizFilterProps['metadataList'], filterFields: string[]) => {
    const defaultSelectedItemList: SelectedFieldItem[] = [];
    metadataList
      .filter((m) => filterFields.includes(m.fieldname))
      .forEach((metadataItem) => {
        const selectItem: SelectedFieldItem = {
          value: metadataItem.fieldname,
          key: metadataItem.fieldname,
          label: metadataItem.fieldAliasName,
          relationGroup: metadataItem.relationGroup,
          metadataItem,
          checkedMetadataValue: undefined,
        };
        processAddSelectedFieldItem(defaultSelectedItemList, selectItem);
      });
    return defaultSelectedItemList;
  };

  /** 清除筛选项 */
  const onClearFilter = async () => {
    const filterFields = getFilterFields();
    const defaultSelectedItemList = getDefaultFilterConfig(metadataList, filterFields);
    const filterStr = getFilter(defaultSelectedItemList);
    // 重置清空值，但不清楚选择因子
    const clearSelectedItemList = selectedItemList.map((item) => {
      return {
        ...item,
        otherData: undefined,
        checkedMetadataValue: undefined,
      };
    });
    clearDraw();
    dispatch({ type: 'update', selectedItemList: clearSelectedItemList, filter: filterStr, geometry: '' });
    onChange({ filter: filterStr, selectedItemList: clearSelectedItemList, geometry: '' });
  };

  /** 获取下拉列表中的筛选数据 */
  const getSelectOptionsConfig = (metadataList: BizFilterProps['metadataList'], filterFields: string[]) => {
    const selectOptions: SelectedFieldItem[] = [];
    metadataList
      .filter((m) => !filterFields.includes(m.fieldname))
      .forEach((metadataItem) => {
        const selectItem: SelectedFieldItem = {
          value: metadataItem.fieldname,
          key: metadataItem.fieldname,
          label: metadataItem.fieldAliasName,
          relationGroup: metadataItem.relationGroup,
          metadataItem,
          checkedMetadataValue: undefined,
        };
        processAddSelectedFieldItem(selectOptions, selectItem);
      });
    return selectOptions;
  };

  useEffect(() => {
    if (metadataList && metadataList.length) {
      const groupMetaData = metadataList.reduce((acc: IState['groupData'], cur) => {
        const { relationGroup, relationIndex } = cur;
        if (relationGroup && typeof relationIndex === 'number') {
          if (acc) {
            if (!acc[relationGroup]) {
              acc[relationGroup] = [];
            }
            acc[relationGroup][relationIndex] = cur;
          }
        }
        return acc;
      }, {});
      dispatch({ type: 'update', groupData: groupMetaData });
    }
  }, [metadataList]);

  const init = async () => {
    // 当前用户筛选字段
    const userFilterFields = await getUserFilterFields();
    // 默认筛选字段
    const defaultFields = getFilterFields();
    const filterFields = [...defaultFields, ...userFilterFields];
    const defaultSelectedItemList = getDefaultFilterConfig(metadataList, filterFields);
    const optionsList = getSelectOptionsConfig(metadataList, filterFields);
    dispatch({ type: 'update', selectedItemList: defaultSelectedItemList, defaultFilterFields: defaultFields, optionsList });
  };

  useEffect(() => {
    init();
  }, [tableName, metadataList]);

  useEffect(() => {
    if (propsInitialValues) {
      const zqCodes = propsInitialValues?.ZQ || [];
      zqCodesRef.current = zqCodes;
    } else {
      zqCodesRef.current = [];
    }
  }, [propsInitialValues]);

  const addFieldPopoverContent = (
    <div className="add-field-popover-content">
      <Select
        placeholder="请选择"
        options={optionsList}
        style={{ width: '125px' }}
        // fieldNames={{
        //   label: 'fieldAliasName',
        //   value: 'fieldname',
        // }}
        onChange={onNewFieldChange}
      />
      <Button icon={<PlusOutlined />} onClick={onAddFilterField}>
        添加
      </Button>
    </div>
  );

  return (
    <div className={prefixCls}>
      <div className="header-actions">
        <Button icon={<DMap />} onClick={() => drawGeometry('Point')}>
          绘制点
        </Button>
        <Button icon={<XMap />} onClick={() => drawGeometry('LineString')}>
          绘制线
        </Button>
        <Button icon={<MMap />} onClick={() => drawGeometry('Polygon')}>
          绘制面
        </Button>
      </div>
      <div className="filter-body">
        {selectedItemList.map((item) => (
          <div className="select-item-wrapper" key={item.key}>
            <Renderer
              data={item}
              zqParentInfo={cacheZqInfoByFieldnameRef.current[item.key]}
              ZQGroupName={ZQGroupName}
              onChange={onChangeSelectItem}
              getFieldSymbol={getFieldSymbol}
            />
            {!defaultFilterFields.includes(item.key) && (
              <Tooltip title="删除因子">
                <span className="options delete" onClick={() => onRemoveFilterField(item)}>
                  <DeleteOutlined />
                </span>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
      <div className="actions">
        <Button onClick={onClearFilter}>重置</Button>
        <Button onClick={onInternalFilter}>查询</Button>
        <Popover content={addFieldPopoverContent} title="添加因子" trigger="click">
          <Button>添加因子</Button>
        </Popover>
      </div>
    </div>
  );
};

export default BizFilter;

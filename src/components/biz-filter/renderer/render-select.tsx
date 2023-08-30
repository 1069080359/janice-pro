import { useState, useEffect, useRef } from 'react';
import { message, TreeSelect } from 'antd';
import { getTableField, getRegisterDict } from '@mapzone/map-services';
import FieldLabel from './field-label';
import type { FsFC, GetRegisterDictParams } from '@mapzone/types';
import type { RenderSelectProps, CheckedMetadataValue, SelectTreeItem, RegisterDictItem } from '../types';

const cacheFlatList = new Map<string, Record<string, SelectTreeItem>>();

const RenderSelect: FsFC<RenderSelectProps> = (props) => {
  const { data, onChange, zqParentInfo, ZQGroupName } = props;
  const { checkedMetadataValue, parentId, parentLabel, initialZqCodes } = data;

  const { metadataItem } = data;
  const [treeData, setTreeData] = useState<SelectTreeItem[]>([]);
  const [value, setValue] = useState<CheckedMetadataValue[] | undefined>(data.checkedMetadataValue);
  const [disabled, setDisabled] = useState(false);
  const captionFieldNameRef = useRef<string>('c_zqname');
  const flatListRef = useRef<Record<string, SelectTreeItem>>(cacheFlatList.get(data.key) || {});
  const initCheckedValsRef = useRef<CheckedMetadataValue[]>([]);

  const setCaptionFieldNameRef = (fieldName: string) => {
    captionFieldNameRef.current = fieldName;
  };

  const getCaptionFieldNameRef = () => captionFieldNameRef.current;

  const getTablefield = async () => await getTableField('fs_data_table');

  const getFieldNames = async (tablePk: string) => {
    const tablefield = await getTablefield();
    const field = (tablefield || {})[tablePk];
    const codeFieldName = field ? (field.codeFieldName || '').toLowerCase() : '';
    const captionFieldName = field ? (field.captionFieldName || '').toLowerCase() : '';
    return { codeFieldName, captionFieldName };
  };

  const innerOnChange = (values: CheckedMetadataValue[]) => {
    const flat = flatListRef.current;
    const newValues = values.map((v) => {
      const [code, id] = `${v.value}`.split(',');
      return { ...v, label: flat[code].title, code, id: +id };
    });

    const halfCheckedValues = newValues.reduce((acc, cur) => {
      const [code] = `${cur.value}`.split(',');
      const c = code.slice(0, -2);
      const nodeItem = flat[c];
      if (c && nodeItem && !newValues.find((v) => v.code === c)) {
        const arr = `${nodeItem.value}`.split(',');
        acc.push({ value: nodeItem.value, label: nodeItem.title, halfChecked: true, code: arr[0], id: +arr[1] });
      }
      return acc;
    }, [] as CheckedMetadataValue[]);
    setValue(newValues.map((v) => ({ ...v, key: v.value })));
    onChange({ ...data, checkedMetadataValue: [...newValues, ...halfCheckedValues] });
  };

  const getTreeData = async () => {
    const { tablePk, fieldname, tableName, relationGroup } = metadataItem;
    if (relationGroup && parentLabel) {
      if (!parentId) {
        return [];
      }
    }
    if (!tablePk) {
      return [];
    }
    const newParam: GetRegisterDictParams = {
      tableName,
      fieldName: fieldname,
      parentId,
    };

    const res = await getRegisterDict.fetch(newParam);
    if (!res) {
      return [];
    }
    if (res.code !== '1000' && !res.success) {
      message.error(res.msg);
      return [];
    }
    const { codeFieldName, captionFieldName } = await getFieldNames(tablePk);
    setCaptionFieldNameRef(captionFieldName);

    let initCheckedValues: CheckedMetadataValue[] = [];
    flatListRef.current = {};

    const formatTreeData = (columnData: RegisterDictItem[]) => {
      return columnData
        .sort((a: Record<string, any>, b: Record<string, any>) => a[codeFieldName].localeCompare(b[codeFieldName]))
        .reduce((acc: SelectTreeItem[], cur) => {
          const curObj = cur as Record<string, any>;
          const curCode = curObj[codeFieldName];
          const curLabel = curObj[`${fieldname}_DESC`] || curObj[fieldname] || curObj[captionFieldName];
          const curId = cur.l_id;

          // 为了获取字典id（级联时获取父级id使用），使用逗号分隔， onChange时 处理分割保存
          const newValue = `${curCode},${curId}`;

          const curItem: SelectTreeItem = {
            ...cur,
            original: cur,
            metadata: metadataItem,
            key: newValue,
            value: newValue,
            title: curLabel,
            children: undefined,
          };
          if (cur.children) {
            curItem.children = formatTreeData(cur.children);
          }
          flatListRef.current[curCode] = curItem as SelectTreeItem;
          acc.push(curItem);
          if (initialZqCodes) {
            if (
              initialZqCodes.includes(curCode) ||
              (zqParentInfo && zqParentInfo.parentId === parentId && zqParentInfo.checkedMetadataValue.find((v) => v.code === curCode))
            ) {
              initCheckedValues.push({
                code: curCode,
                label: curLabel,
                id: curId,
                value: newValue,
              });
            }
            if (initCheckedValues.length > 1) {
              initCheckedValues = initCheckedValues.filter((v) => initialZqCodes.includes(v.code!));
            }
          }
          return acc;
        }, []);
    };

    const result = formatTreeData(res.datas as SelectTreeItem[]);
    initCheckedValsRef.current = initCheckedValues;
    cacheFlatList.set(data.key, flatListRef.current);
    return result;
  };

  const onFocus = async () => {
    if (treeData && treeData.length) {
      return;
    }

    const { tablePk, relationGroup } = metadataItem;
    if (tablePk && relationGroup && parentLabel && !parentId) {
      message.warning(`请选择${parentLabel}`);
      return;
    }
    const newTreeData = await getTreeData();
    setTreeData(newTreeData);
  };

  const filterTreeNode = (inputValue: string, treeNode?: Record<string, any>) => {
    if (!treeNode) {
      return false;
    }
    const filterFieldName = getCaptionFieldNameRef();
    const filerValue = treeNode[filterFieldName];
    return filerValue && filerValue.includes(inputValue);
  };

  useEffect(() => {
    if (initialZqCodes && initialZqCodes.length > 0 && data.relationGroup === ZQGroupName) {
      if (!data.checkedMetadataValue) {
        getTreeData().then((newTreeData) => {
          if (newTreeData.length > 0) {
            setTreeData(newTreeData);
            innerOnChange(initCheckedValsRef.current);
            setDisabled(initCheckedValsRef.current.length > 0);
          }
        });
      } else {
        const initZqCodesIncluded = data.checkedMetadataValue.some((c) => initialZqCodes.includes(c.code!));
        setDisabled(initZqCodesIncluded);
      }
    }
    return () => {};
  }, [initialZqCodes, data, parentId]);

  useEffect(() => {
    if (!data.checkedMetadataValue) {
      setValue(undefined);
      setTreeData([]);
    }
  }, [parentId, checkedMetadataValue]);

  // if (metadataItem.type === 'treeSelect') {
  return (
    <div className="select-item tree-select">
      <FieldLabel className="select-item-label" label={metadataItem.fieldAliasName} />
      <TreeSelect
        bordered
        labelInValue
        allowClear
        showCheckedStrategy={TreeSelect.SHOW_ALL}
        value={value}
        treeData={treeData}
        multiple
        treeCheckable
        showSearch={true}
        filterTreeNode={filterTreeNode}
        onChange={innerOnChange}
        onFocus={onFocus}
        disabled={disabled}
      />
    </div>
  );
};

export default RenderSelect;

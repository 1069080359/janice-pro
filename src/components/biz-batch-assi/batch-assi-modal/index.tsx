import { useEffect, useMemo, useReducer } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, notification, message, Form, Card, Table, Input, Checkbox, Radio, Popconfirm, Typography } from 'antd';
import { useTableProps } from '@mapzone/hooks';
import { debounce, setSessionStorageItem, setLocalStorageItem, getSessionStorageItem, getLocalStorageItem } from '@mapzone/utils';
import { MzInlineErrorFormItem } from '@mapzone/kit';
import { BizModal } from '@/components';
import { batchAssi } from '../services';
import { queryMetadataList, getSystemFields } from '@/services';
import Renderer from './renderer';
import { initialState, reducer } from './reducer';
import { getRules, formatId, getParentId, getUpdateFields, getUpdateDatas } from './utils';
import { computeWidth } from './compute';
import type { MouseEvent } from 'react';
import type { TableColumnType, RadioChangeEvent } from 'antd';
import type { FsFC, TMetadata } from '@mapzone/types';
import type { BizBatchAssiParams } from '../services';
import type { BizBatchAssiModalProps, SelectItem, IState, RendererExtra, UpdateType } from './types';
import './index.less';

const { Title } = Typography;

const cloumns: TableColumnType<TMetadata>[] = [
  {
    title: '字段',
    dataIndex: 'fieldAliasName',
    ellipsis: true,
  },
];

/** 批量赋值弹窗 */
export const BizBatchAssiModal: FsFC<BizBatchAssiModalProps> = (props) => {
  const {
    recordCount,
    filterMetadata,
    filter,
    selectedKeys,
    persistence,
    tableName,
    defaultUpdateType = 'selected',
    showUpdateAll = true,
    open,
    onCancel,
    onOk,
    className,
    ...restProps
  } = props;

  const [state, dispatch] = useReducer(reducer, { ...initialState, updateType: defaultUpdateType });
  const { groupData, fieldSearch, selectFieldKeys, fieldMetadataList, metadataList, selectItemList, updateType, confirmLoading } = state;
  const [form] = Form.useForm();
  const cacheKey = `-batch-assi-${tableName}`;
  const { tableProps, setTableWrapRef } = useTableProps({ deps: [fieldMetadataList], prefixCls: 'batch-assi' });

  const width = useMemo(() => {
    let d = { width: 0 };
    try {
      d = selectItemList.reduce(
        (acc, cur, index) => {
          const itemWidth = computeWidth(JSON.parse(cur.value).fieldAliasName, index === selectItemList.length - 1);
          if (itemWidth > acc.width) {
            acc.width = itemWidth;
          }
          return acc;
        },
        { width: 0 },
      );
    } catch (e) {}
    return !d.width || d.width < 0 ? undefined : d.width;
  }, [selectItemList]);

  /**
   * 查询左侧字段
   */
  const onDebounceSearch = debounce((search: string = '') => {
    dispatch({ type: 'update', fieldSearch: search.trim() });
  }, 300);

  /**
   * 点击右上角叉或取消按钮的回调
   * @returns
   */
  const handleCancel = (e: MouseEvent<HTMLElement>) => {
    if (confirmLoading) {
      return message.warn('还有正在进行的任务，请等待');
    }
    if (onCancel) {
      onCancel(e);
    }
  };

  /**
   * 确认提交赋值信息
   */
  const hadnleOk = async () => {
    const values = await form.validateFields();
    if (!values) {
      return;
    }
    try {
      const fields = getUpdateFields(selectItemList);
      if (fields.length <= 0) {
        return message.warn('请至少编辑一个字段值');
      }
      const params: BizBatchAssiParams = {
        tableName,
        fields: getUpdateFields(selectItemList),
      };
      if (updateType === 'all') {
        params.filterCondition = filter;
      } else if (selectedKeys.length > 0) {
        params.ids = selectedKeys;
      } else {
        return message.warn('列表选择记录为0，请至少勾选一条记录');
      }
      if (persistence) {
        const cacheContent = JSON.stringify({ selectItemList, updateType });
        if (persistence.persistenceType === 'localStorage') {
          setLocalStorageItem(cacheKey, cacheContent);
        } else {
          setSessionStorageItem(cacheKey, cacheContent);
        }
      }
      dispatch({ type: 'update', confirmLoading: true });
      const res = await batchAssi(params).catch(() => undefined);
      if (res && res.success) {
        message.success('更新成功');
        if (onOk) {
          const updateDatas = getUpdateDatas(selectItemList);
          onOk({
            selectedKeys: selectedKeys,
            updateDatas,
            updateType,
          });
        }
      } else {
        notification.error({ message: '批量赋值失败' });
      }
    } catch (e) {
    } finally {
      dispatch({ type: 'update', confirmLoading: false });
    }
  };

  /**
   * 左侧字段列表中，选择某行
   * @param selectItem 字段列表项
   */
  const onSelect = (selectItem: SelectItem) => {
    const item = JSON.parse(selectItem.value);
    const newSelectItemList = [...selectItemList];
    const { relationGroup, relationIndex } = item;
    if (relationGroup && typeof relationIndex === 'number') {
      if (groupData) {
        const group = groupData[relationGroup] || [];
        group.forEach((v: TMetadata) => {
          if (!v.relationGroup || v.relationGroup !== relationGroup) {
            return;
          }
          if (v.relationIndex && v.relationIndex < relationIndex) {
            const index = newSelectItemList.findIndex((va) => va.key === v.fieldname);
            if (index < 0) {
              const parentField = group[v.relationIndex - 1];
              const parentId = getParentId(newSelectItemList, parentField?.fieldname);
              newSelectItemList.push({
                value: JSON.stringify(v),
                tablePk: v.tablePk,
                tableName: v.tableName,
                dataType: v.dataType,
                type: v.type,
                key: v.fieldname,
                label: v.fieldAliasName,
                relationGroup: v.relationGroup,
                parentLabel: parentField?.fieldAliasName,
                parentId,
                disabled: false,
              });
            }
          } else if (v.relationIndex === relationIndex && relationIndex) {
            const parentField = group[v.relationIndex - 1];
            selectItem.parentId = getParentId(newSelectItemList, parentField?.fieldname);
          }
        });

        if (relationIndex) {
          selectItem.parentLabel = group[relationIndex - 1]?.fieldAliasName;
        }
      }
      const index = newSelectItemList.findIndex((va) => va.key === item.fieldname);
      if (index < 0) {
        newSelectItemList.push(selectItem);
      }
    } else {
      newSelectItemList.push(selectItem);
    }
    newSelectItemList.sort((a, b) => {
      const aFieldId = JSON.parse(a.value).fieldId;
      const bFieldId = JSON.parse(b.value).fieldId;
      return aFieldId - bFieldId;
    });
    const keys = newSelectItemList.map((c) => c.key);
    dispatch({ type: 'update', selectItemList: newSelectItemList, selectFieldKeys: keys });
  };

  /**
   * 左侧字段列表中，取消选择某行
   * @param deselect 字段列表项
   */
  const onDeselect = (deselect: SelectItem) => {
    const deItem = JSON.parse(deselect.value) as TMetadata;
    const { relationGroup, relationIndex, fieldname } = deItem;
    const newSelectItemList = selectItemList.reduce((acc: SelectItem[], cur) => {
      const item = JSON.parse(cur.value) as TMetadata;
      if (relationGroup && item.relationGroup === relationGroup) {
        if (item.relationIndex! < relationIndex!) {
          acc.push(cur);
        }
      } else if (item.fieldname !== fieldname) {
        acc.push(cur);
      }
      return acc;
    }, []);
    const keys = newSelectItemList.map((c) => c.key);
    dispatch({ type: 'update', selectItemList: newSelectItemList, selectFieldKeys: keys });
  };

  /**
   * 左侧字段列表中，选择/取消选择某行的回调
   * @param record 字段列表项
   * @param selected 选择/取消选择
   */
  const onRowSelectionSelect = (record: TMetadata, selected: boolean) => {
    const currentItem: SelectItem = {
      key: record.fieldname,
      label: record.fieldAliasName,
      relationGroup: record.relationGroup,
      value: JSON.stringify(record),
      otherData: undefined,
      tableName: record.tableName,
      tablePk: record.tablePk,
      dataType: record.dataType,
      type: record.type,
      disabled: false,
    };
    if (selected) {
      onSelect(currentItem);
    } else {
      const item = selectItemList.find((s) => s.key === record.fieldname);
      onDeselect(item || currentItem);
    }
  };

  /**
   * 左侧字段列表中，点击行时触发
   * @param record 字段列表项
   */
  const onRowClick = (record: TMetadata) => {
    const selected = !selectItemList.find((f) => f.key === record.fieldname);
    onRowSelectionSelect(record, selected);
  };

  /**
   * 编辑框值发生改变时触发
   * @param item 编辑框对应的列表项信息
   * @param newValue 当前输入的编辑框值
   * @param extra 编辑框为select时code、label等额外信息
   */
  const onValueChange = (item: SelectItem, newValue?: string | number, extra?: RendererExtra) => {
    const newItem = { ...item };
    if (item.tablePk) {
      // select类型
      newItem.otherData = newValue
        ? {
            value: newValue,
            code: extra?.original?.code,
            id: extra?.original?.id,
            label: extra?.label,
          }
        : undefined;
    } else {
      newItem.otherData = newValue
        ? {
            value: newValue,
          }
        : undefined;
    }
    const itemValue = JSON.parse(newItem.value);
    const { tablePk, relationGroup, relationIndex } = itemValue;
    const newSelectItemList = selectItemList.map((current) => {
      if (current.key === newItem.key) {
        return newItem;
      }
      const currentValue = JSON.parse(current.value) as TMetadata;
      if (tablePk && relationGroup && relationGroup === currentValue.relationGroup) {
        if (relationIndex < currentValue.relationIndex!) {
          current.otherData = undefined;
          if (relationIndex === currentValue.relationIndex! - 1) {
            current.parentId = formatId(newItem.otherData);
          }
        } else if (relationIndex - 1 === currentValue.relationIndex) {
          newItem.parentId = formatId(current.otherData);
        }
      }
      return current;
    }, []);

    const index = newSelectItemList.findIndex((c) => c.key === newItem.key);
    newSelectItemList[index] = newItem;

    const keys = newSelectItemList.map((c) => c.key);
    dispatch({ type: 'update', selectItemList: newSelectItemList, selectFieldKeys: keys });
  };

  /**
   * 切换批量赋值类型
   * @param e Event
   */
  const onChangeType = (e: RadioChangeEvent) => {
    dispatch({ type: 'update', updateType: e.target.value });
  };

  /**
   * 清空本字段
   * @param e Event
   * @param metadata 元数据
   */
  const clearFieldValue = (e: { target: { checked: boolean } }, metadata: SelectItem) => {
    const checked = e.target.checked;
    form.setFields([{ name: metadata.key, errors: [] }]);
    onValueChange({ ...metadata, disabled: checked }, undefined, {});
  };

  /**
   * 获取默认更新类型
   * @param catchType
   * @returns
   */
  const getDefaultUpdataType = (catchType: UpdateType) => {
    let selectType: UpdateType;
    if (catchType) {
      selectType = catchType === 'selected' && selectedKeys.length === 0 ? 'all' : catchType;
    } else {
      selectType = selectedKeys.length > 0 ? 'selected' : 'all';
    }
    return selectType;
  };

  useEffect(() => {
    let fieldList: TMetadata[] = metadataList;
    if (fieldSearch) {
      fieldList = metadataList.filter((m) => m.fieldAliasName.includes(fieldSearch));
    }
    dispatch({ type: 'update', fieldMetadataList: fieldList });
    return () => {};
  }, [metadataList, fieldSearch]);

  useEffect(() => {
    const getMetadataList = async () => {
      const dataList = await queryMetadataList(tableName);
      let newMetadataList = [];
      const systemFields = await getSystemFields();
      // 排除系统字段和不可编辑字段；
      newMetadataList = dataList.filter((metadata) => !systemFields.includes(metadata.fieldname) && !metadata.disabled);
      if (typeof filterMetadata === 'function') {
        newMetadataList = await filterMetadata({ metadataList: newMetadataList, tableName });
      }

      dispatch({ type: 'update', metadataList: newMetadataList });
    };
    getMetadataList();
  }, [tableName]);

  useEffect(() => {
    if (metadataList) {
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

  useEffect(() => {
    if (open && metadataList) {
      if (persistence) {
        // 恢复记忆功能
        let batchAssiStr: string;
        if (persistence.persistenceType === 'localStorage') {
          batchAssiStr = getLocalStorageItem(cacheKey);
        } else {
          batchAssiStr = getSessionStorageItem(cacheKey);
        }
        if (batchAssiStr && JSON.parse(batchAssiStr)) {
          const batchAssiStore = JSON.parse(batchAssiStr);
          const selected: SelectItem[] = batchAssiStore?.selectItemList ?? [];
          const batchAssiType = getDefaultUpdataType(batchAssiStore?.updateType);
          const cacheSelectItemList = selected.filter((s) => metadataList.some((m) => m.fieldname === s.key));
          const keys = cacheSelectItemList.map((s) => s.key);
          dispatch({
            type: 'update',
            selectItemList: cacheSelectItemList,
            selectFieldKeys: keys,
            updateType: batchAssiType,
            fieldSearch: '',
          });
        } else {
          const selectUpdateType = selectedKeys.length > 0 ? 'selected' : 'all';
          form.resetFields();
          dispatch({ type: 'update', selectItemList: [], selectFieldKeys: [], fieldSearch: '', updateType: selectUpdateType });
        }
      } else {
        form.resetFields();

        dispatch({ type: 'update', selectItemList: [], selectFieldKeys: [], fieldSearch: '' });
      }
    }
  }, [open, metadataList, persistence, selectedKeys]);

  const footerRender = (
    <>
      <Radio.Group value={updateType} onChange={onChangeType}>
        <Radio value="selected" disabled={selectedKeys.length === 0}>
          对选择记录操作（<span className="highlight-txt">{selectedKeys.length}</span>条记录）
        </Radio>
        {showUpdateAll && (
          <Radio value="all">
            对结果操作（<span className="highlight-txt">{recordCount}</span>条记录）
          </Radio>
        )}
      </Radio.Group>
      <div className="action-group">
        <Button className="cancel-button" onClick={handleCancel}>
          取消
        </Button>
        <Popconfirm
          icon={<ExclamationCircleFilled style={{ color: '#FF0000' }} />}
          title={<span style={{ color: 'rgba(51, 51, 51, 1)' }}>请仔细核对设置和选项，此结果不可撤销， 确定是否继续进行？</span>}
          onConfirm={hadnleOk}
          okText="是"
          cancelText="否"
          cancelButtonProps={{ style: { backgroundColor: '#e8effb', color: '#2e7cef', borderColor: '#e8effb' } }}
          overlayStyle={{ width: '326px' }}
        >
          <Button type="primary" loading={confirmLoading} disabled={!confirmLoading && selectItemList.length <= 0}>
            确定
          </Button>
        </Popconfirm>
      </div>
    </>
  );

  return (
    <BizModal
      mask
      maskClosable={false}
      className="batch-assi-modal"
      title="属性批量赋值"
      open={open}
      width={980}
      keyboard={false}
      onCancel={handleCancel}
      footer={footerRender}
      {...restProps}
    >
      <div className="batch-assi-content">
        <div className="field-table-wrapper">
          <Title level={5}>选择字段</Title>
          <Input className="field-seach" placeholder="搜索字段" allowClear onChange={(e) => onDebounceSearch(e.target.value)} />
          <Card size="small">
            <div ref={setTableWrapRef} className={`field-table-wrap`}>
              <Table
                size="small"
                {...tableProps}
                showHeader={false}
                rowKey="fieldname"
                columns={cloumns}
                dataSource={fieldMetadataList}
                pagination={false}
                rowSelection={{
                  selectedRowKeys: selectFieldKeys,
                  onSelect: onRowSelectionSelect,
                }}
                onRow={(record) => ({
                  onClick: () => onRowClick(record),
                })}
              />
            </div>
          </Card>
        </div>
        <div className="select-item-wrapper">
          <Title level={5}>设置字段值</Title>
          <Card size="small">
            <Form
              form={form}
              scrollToFirstError
              validateMessages={{
                required: "'${label}' 不能为空",
              }}
            >
              {selectItemList.map((metadata) => {
                return (
                  <div className="form-item-wrapper" key={metadata.key}>
                    <MzInlineErrorFormItem
                      name={metadata.key}
                      hasFeedback={false}
                      className="error-form-item"
                      label={
                        <label className="select-item-label" style={{ width }}>
                          {metadata.label}
                        </label>
                      }
                      rules={getRules(JSON.parse(metadata.value))}
                      messageVariables={{ label: metadata.label }}
                    >
                      <Renderer
                        data={metadata}
                        tablePk={metadata.tablePk}
                        dataType={metadata.dataType}
                        type={metadata.type}
                        tableName={metadata.tableName}
                        fieldname={metadata.key}
                        disabled={metadata.disabled}
                        onChange={(code, name) => onValueChange(metadata, code, name)}
                      />
                    </MzInlineErrorFormItem>
                    <Checkbox className="clear-value" checked={metadata.disabled} onChange={(e) => clearFieldValue(e, metadata)}>
                      清空本字段
                    </Checkbox>
                  </div>
                );
              })}
            </Form>
          </Card>
        </div>
      </div>
    </BizModal>
  );
};

export type { BizFilterMetadataParams, BizBatchAssiFinishParmas } from './types';
export type { BizBatchAssiModalProps, BizBatchAssiParams };

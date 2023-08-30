import { useEffect, useReducer, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button, Col, Form } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { SmartTooltip } from '@mapzone/kit';
import { uuidV4 } from '@mapzone/utils';
import { commonExport } from '@/services';
import { BizQueryForm } from '../query-form';
import { bizCmpMap } from './cmp-map';
import { initialState, reducer } from './reducer';
import { queryDictList, queryMetadataList, queryTableQueryConfig } from './services';
import { inputTypes } from './utils';
import type { TMetadata } from '@mapzone/types';
import type { NamePath } from 'antd/es/form/interface';
import type { CmpMapKEyType } from './cmp-map';
import type { BizMetadataQueryFormProps, BizMetadataQueryFormRef, BizQueryFormItemProps } from './types';
import './index.less';

const prefixCls = 'biz-metadata-query-form';

/** 元数据配置的筛选表单 */
export const BizMetadataQueryForm = forwardRef<BizMetadataQueryFormRef, BizMetadataQueryFormProps>((props, ref) => {
  const {
    tableName,
    queryMetadataList: propsQueryMetadataList,
    metadataList: propsMetadataList,
    onFinish,
    getFieldComponent,
    extratActions: propsExtraActions,
    hihhenExport,
    ...formProps
  } = props;
  const [form] = Form.useForm();
  const [state, dispatch] = useReducer(reducer, { ...initialState });
  const { metadataFieldList, fieldConfigList, metadataList, extratActions } = state;
  const mapCmp = useRef(bizCmpMap).current;
  const getFieldComponentRef = useRef(getFieldComponent);
  getFieldComponentRef.current = getFieldComponent;

  /**
   * 根据表名查询元数据
   */
  const getMetadataList = useCallback(async () => {
    let newMetadataList: TMetadata[] = [];
    if (propsMetadataList) {
      newMetadataList = propsMetadataList;
    } else if (tableName) {
      if (propsQueryMetadataList) {
        newMetadataList = await propsQueryMetadataList(tableName);
      } else {
        newMetadataList = await queryMetadataList(tableName);
      }
    }
    dispatch({ type: 'update', metadataList: newMetadataList });
  }, [tableName, propsQueryMetadataList, propsMetadataList]);

  const setLabelOverflowEllipsis = (label: string) => {
    return (
      <SmartTooltip title={label} mouseEnterDelay={0.3} promptsWhenTextOverflows>
        <span className="label-text-overflow-ellipsis">{label}</span>
      </SmartTooltip>
    );
  };

  const getCmpProps = (item: BizQueryFormItemProps) => {
    const common: Record<string, any> = {
      allowClear: true,
      placeholder: item.placeholder,
      style: { width: '100%' },
    };
    switch (item.config.TYPE) {
      case 'Cascader':
      case 'Select':
      case 'TreeSelect':
      case 'Checkbox':
      case 'Radio':
        common.fieldKey = `${item.name}-${uuidV4()}`;
        common.request = () => queryDictList({ dataName: tableName, format: '1', fieldName: item.name });
        if (item.config.MULTIPLE && item.config.MULTIPLE !== 'false') {
          common.multiple = true;
        }
        break;
      case 'DateTime':
        common.showTime = true;
        break;
    }
    return common;
  };

  const formatValue = (value: string, isNumber: boolean) => {
    return isNumber ? value : `'${value}'`;
  };

  /**
   * 转换表单的值，处理select labelInValue等对象值域的问题
   * @param values 表单值对象
   * @returns
   */
  const transformFormValuesToFilter = (values: Record<string, any>) => {
    const filterItems: string[] = [];

    Object.keys(values).forEach((key) => {
      const value = values[key];
      const fieldConfig = fieldConfigList.find((f) => f.KEY === key);
      if (value && fieldConfig) {
        const isNumber = fieldConfig.TYPE === 'InputNumber';
        let valueStr = '';
        switch (fieldConfig.SYMBOL) {
          case 'range':
            if (Array.isArray(value)) {
              filterItems.push(`${key} >= ${formatValue(value[0], isNumber)}`);
              filterItems.push(`${key} <= ${formatValue(value[1], isNumber)}`);
            }
            break;
          case 'include':
            filterItems.push(`${key} like '%${value}%'`);
            break;
          default:
            if (Array.isArray(value)) {
              valueStr = `'${value.join("','")}'`;
              filterItems.push(`${key} in (${valueStr})`);
            } else {
              valueStr = formatValue(value, isNumber);
              filterItems.push(`${key} ${fieldConfig.SYMBOL} ${valueStr}`);
            }
            break;
        }
      }
    });
    const filter = filterItems.join(' and ');
    return filter;
  };

  const internalOnFinish = (values: Record<string, any>) => {
    const filter = transformFormValuesToFilter(values);
    onFinish(filter, values);
  };

  const onExportClick = async () => {
    const values = form.getFieldsValue();
    const filter = transformFormValuesToFilter(values);
    await commonExport({ tableName, filter });
  };

  const getCmpAndProps = (item: BizQueryFormItemProps) => {
    if (getFieldComponentRef.current) {
      const FieldCmp = getFieldComponentRef.current({ metadata: item.metadata, config: item.config });
      if (FieldCmp) {
        return { Cmp: FieldCmp, cmpProps: {} };
      }
    }

    let type: CmpMapKEyType = item.config.TYPE;
    if (item.config.SYMBOL === 'range') {
      if (type.startsWith('Date')) {
        type = 'DateRangePicker';
      } else if (type === 'InputNumber') {
        type = 'InputNumberRange';
      }
    }
    const Cmp = mapCmp[type];
    const cmpProps: any = getCmpProps(item);
    return { Cmp, cmpProps };
  };

  useEffect(() => {
    let newExtraActions: Required<BizMetadataQueryFormProps>['extratActions'] = [];
    if (propsExtraActions) {
      newExtraActions = propsExtraActions;
    }
    if (!hihhenExport) {
      newExtraActions.unshift(
        <Button key="md-export" icon={<DownloadOutlined />} onClick={onExportClick}>
          导出
        </Button>,
      );
    }
    dispatch({ type: 'update', extratActions: newExtraActions });
  }, [props, hihhenExport]);

  useEffect(() => {
    queryTableQueryConfig(tableName).then((configList) => {
      dispatch({ type: 'update', fieldConfigList: configList });
    });
  }, [tableName]);

  useEffect(() => {
    getMetadataList();
  }, [tableName, propsMetadataList, propsQueryMetadataList]);

  useEffect(() => {
    if (metadataList.length && fieldConfigList.length) {
      const formItems: BizQueryFormItemProps[] = [];
      const uploadMap = ['upload', 'uploadFile', 'FsImgFile', 'FsFile'];
      fieldConfigList.forEach((config) => {
        const metadataItem = metadataList.find((m) => m.fieldname === config.KEY);
        if (metadataItem && !uploadMap.includes(metadataItem.type)) {
          const { fieldname, fieldAliasName } = metadataItem;
          const formItem: BizQueryFormItemProps = {
            config,
            name: fieldname,
            lable: fieldAliasName,
            metadata: metadataItem,
            placeholder: inputTypes.includes(config.TYPE) ? `请输入${fieldAliasName}` : `请选择${fieldAliasName}`,
          };
          formItems.push(formItem);
        }
      });
      dispatch({ type: 'update', metadataFieldList: formItems });
    } else {
      dispatch({ type: 'update', metadataFieldList: [] });
    }
    return () => {};
  }, [metadataList, fieldConfigList]);

  const handle = (): BizMetadataQueryFormRef => ({
    form,
    validateFields: async (nameList?: NamePath[]) => {
      const values = await form.validateFields(nameList).catch(() => undefined);
      if (!values) {
        return undefined;
      }
      const filter = transformFormValuesToFilter(values);
      return { filter, values };
    },
  });

  useImperativeHandle(ref, handle);

  if (!metadataFieldList.length) {
    return null;
  }

  return (
    <BizQueryForm form={form} className={prefixCls} onFinish={internalOnFinish} extratActions={extratActions} {...formProps}>
      {metadataFieldList.map((v) => {
        const { Cmp, cmpProps } = getCmpAndProps(v);
        if (!Cmp) {
          return null;
        }
        return (
          <Col key={v.name}>
            <Form.Item name={v.name} label={setLabelOverflowEllipsis(v.lable)} key={v.name}>
              <Cmp {...cmpProps} />
            </Form.Item>
          </Col>
        );
      })}
    </BizQueryForm>
  );
});

import { useEffect, useState } from 'react';
import { Descriptions, Form, Input, Typography } from 'antd';
import { BizModal } from '@/components';
import { transformInitialValues } from './utils';
import type { FsFC } from '@mapzone/types';
import type { BizDetailModalProps, FieldItem } from './types';
import type { ReactNode } from 'react';
import './index.less';
import { useForm } from 'antd/lib/form/Form';

const { Text } = Typography;

const prefixCls = 'details-modal';

const defaultFieldRender = (item: FieldItem) => {
  return (
    <Descriptions.Item span={item.span} key={item.fieldName} className={`${prefixCls}-descriptions`}>
      <Text ellipsis={{ tooltip: item.label }} className={`${prefixCls}-descriptions-label`}>
        {item.label}
      </Text>
      <span className={`${prefixCls}-descriptions-label-after`}>:</span>
      <span>{item.value}</span>
    </Descriptions.Item>
  );
};

const customFieldRender = (item: FieldItem) => {
  return (
    <Form.Item label={item.label} name={item.fieldName}>
      <Input defaultValue={item.value} />
    </Form.Item>
  );
};

/** 基于元数据的详情弹层 */
const BizDetailModal: FsFC<BizDetailModalProps> = (props) => {
  const { onCancel, onOk, detail, metadataList, column = 2, customComponentFields, okText, itemRender, ...restProps } = props;
  const [fieldItemList, setFieldItemList] = useState<FieldItem[]>([]);
  const [form] = useForm();

  useEffect(() => {
    if (detail) {
      const dataList = transformInitialValues(detail!, metadataList);
      setFieldItemList(dataList);
    }
  }, [detail, metadataList]);

  if (!detail) {
    return null;
  }

  /**内部确认按钮 */
  const onInternalOk = () => {
    const values = form.getFieldsValue();
    if (!values) {
      return;
    }
    if (onOk) {
      onOk({ ...values });
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  return (
    <BizModal width={900} onCancel={onCancel} onOk={onInternalOk} okText={okText} className={prefixCls} {...restProps}>
      <Descriptions column={column}>
        {fieldItemList.map((item) => {
          let fieldNode: ReactNode = null;
          if (!customComponentFields?.includes(item.fieldName)) {
            if (itemRender) {
              fieldNode = itemRender(item);
            }
            if (!fieldNode) {
              fieldNode = defaultFieldRender(item);
            }
            return fieldNode;
          }
          return fieldNode;
        })}
      </Descriptions>
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 9 }}>
        {fieldItemList.map((item) => {
          let fieldNode: ReactNode = null;
          if (customComponentFields?.includes(item.fieldName)) {
            fieldNode = customFieldRender(item);
            return fieldNode;
          }
          return fieldNode;
        })}
      </Form>
    </BizModal>
  );
};

export { BizDetailModal };

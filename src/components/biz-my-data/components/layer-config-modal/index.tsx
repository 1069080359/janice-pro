import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Select, Radio, message } from 'antd';
import { BizModal } from '@/components';
import { InputColorPicker } from '@mapzone/color-picker';
import { updateCloudLayerStyle } from '../service';
import { defaultColors } from '../../const';
import type { RndModalProps } from '@mapzone/types';
import type { TLayerStyleConfig, TMyLayer } from '../../types';

const borderStyleList = [
  {
    value: 'solid',
    label: '实线',
  },
  {
    value: 'dotted',
    label: '点线',
  },
  {
    value: 'dashed',
    label: '虚线',
  },
];

const initValues: Partial<TLayerStyleConfig> = {
  fillColor: 'rgba(255,255,255,0)',
  width: 1,
  borderStyle: 'solid',
};

type TImportModalProps = Omit<RndModalProps, 'onOk' | 'onCancel'> & {
  myLayer?: TMyLayer;
  onOk: (config: TLayerStyleConfig) => void;
  onCancel: () => void;
};

export default (props: TImportModalProps) => {
  const { onCancel, onOk, myLayer, ...restProps } = props;
  const [layerName, setLayerName] = useState('');
  const [attrFields, setAttrFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [labelField, setLabelField] = useState<boolean>(false);
  const [form] = Form.useForm();

  const saveLayerStyle = async (style: TLayerStyleConfig) => {
    setLoading(true);
    const res = await updateCloudLayerStyle({
      cloudId: myLayer!.I_USEROWNEDDATAID,
      style,
    });
    setLoading(false);
    if (!res?.success) {
      message.error(`更新云图层样式出错，${res.msg}`);
      return;
    }
    message.success('更新云图层样式成功');
    onOk(style);
  };

  const handleOk = async () => {
    const values = await form.validateFields().catch(() => {});
    if (!values) {
      return;
    }
    if (values.label && (!values.labelFontSize || !values.labelColor)) {
      message.warn('请选择标注字体大小或颜色');
      return;
    }
    await saveLayerStyle(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (myLayer) {
      const { C_DATANAME, C_DATAINFO, C_STYLE: styleConfig } = myLayer;
      form.setFieldsValue({
        labelFontSize: 12,
        labelColor: styleConfig.color,
        ...styleConfig,
      });
      setLayerName(C_DATANAME);
      setLabelField(!!styleConfig.label);
      setAttrFields(C_DATAINFO.tableFields || []);
    }
    return () => {};
  }, [form, myLayer]);

  return (
    <BizModal
      title={`${layerName}-图层样式设置`}
      rndProps={{ disableDragging: false }}
      maskClosable={false}
      width={600}
      destroyOnClose
      onCancel={handleCancel}
      {...restProps}
      confirmLoading={loading}
      onOk={handleOk}
    >
      <Form labelCol={{ span: 5 }} form={form} initialValues={initValues}>
        <Form.Item name="borderStyle" label="边界线类型" rules={[{ required: true, message: '请选择边界线类型' }]}>
          <Radio.Group options={borderStyleList} />
        </Form.Item>
        <Form.Item name="color" label="边界颜色" rules={[{ required: true, message: '请选择边界颜色！' }]}>
          <InputColorPicker presetColors={defaultColors} />
        </Form.Item>
        <Form.Item name="width" label="边界线宽度(px)">
          <InputNumber min={0} max={20} step={1} />
        </Form.Item>
        <Form.Item name="fillColor" label="填充颜色">
          <InputColorPicker presetColors={defaultColors} />
        </Form.Item>
        <Form.Item name="label" label="标注字段">
          <Select placeholder="请选择标注字段" allowClear onChange={(val) => setLabelField(!!val)}>
            {attrFields.map((f) => (
              <Select.Option key={f} value={f}>
                {f}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {labelField && (
          <>
            <Form.Item
              name="labelFontSize"
              label="标注字体大小"
              rules={[{ required: true, message: '请选择标注字体大小' }]}
              initialValue={12}
            >
              <InputNumber step={2} min={10} max={40} />
            </Form.Item>
            <Form.Item name="labelColor" label="标注字体颜色" rules={[{ required: true, message: '请选择标注字体颜色' }]}>
              <InputColorPicker presetColors={defaultColors} />
            </Form.Item>
          </>
        )}
      </Form>
    </BizModal>
  );
};

import { EyeTwoTone, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { FormItemProps } from 'antd';

export const trim = (value: string) => value.split(' ').join('');

export const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export const iconRender = (visible: boolean, loading?: boolean) => {
  if (loading) {
    return <LoadingOutlined />;
  }
  return visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />;
};

export const rules: Required<FormItemProps>['rules'] = [{ type: 'string', required: true }];

export const validateMessages = {
  required: '${label}不能为空',
  types: {
    string: '${label}长度不能低于8位',
  },
};

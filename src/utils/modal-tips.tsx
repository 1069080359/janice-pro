import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ModalFuncProps } from 'antd';

export const ModalTips = (props: ModalFuncProps) => {
  const { type = 'confirm' } = props;
  return Modal[type]({
    icon: <ExclamationCircleOutlined />,
    okText: '确定',
    cancelText: '取消',
    centered: true,
    ...props,
  });
};

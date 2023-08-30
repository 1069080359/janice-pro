import React from 'react';
import { Card, CardProps, Space, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import type { FsFC } from '@mapzone/types';
import './index.less';

const { Title, Text } = Typography;

type BizCardProps = Omit<CardProps, 'title'> & {
  /** 描述 */
  title: string;
  /** 累计数量 */
  total: number;
  /** 单位 默认 万亩 */
  unit: string;
  /** 比例 增加或减少, success 加，danger 减 */
  proportion: 'success' | 'danger';
  /** 比例 */
  proportionNum: number;
};

const proportionState = {
  success: '增加',
  danger: '减少',
};

const proportionIcon = {
  success: <ArrowUpOutlined />,
  danger: <ArrowDownOutlined />,
};

const prefixCls = 'biz-card';

const BizCard: FsFC<BizCardProps> = (props) => {
  const { className, title, total, proportion, proportionNum, unit, ...restProps } = props;
  return (
    <Card className={classnames(className, prefixCls)} {...restProps}>
      <Title level={5}>{title}</Title>
      <Space>
        <Text>累计</Text>
        <Text strong>{total}</Text>
        <Text strong>{unit}</Text>
      </Space>
      <Space>
        <Text>同比</Text>
        <Text strong type={proportion}>
          {proportionState[proportion]}
        </Text>
        <Text strong type={proportion}>
          {proportionNum}
        </Text>
        <Text strong type={proportion}>
          {proportionIcon[proportion]}
        </Text>
      </Space>
    </Card>
  );
};

export { BizCard };

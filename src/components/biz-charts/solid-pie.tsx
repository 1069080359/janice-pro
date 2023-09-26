import React from 'react';
import { Pie, PieConfig } from '@ant-design/plots';
import type { FC } from 'react';
import { chartDefaultConfig } from './const';

/**
 * 实心 饼图
 * innerRadius: 0.6,// 配置空心饼图
 *  */
const SolidPie: FC<PieConfig> = (props) => {
  /**
   * 图表配置
   */
  const config: PieConfig = {
    appendPadding: 10,
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      // content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    ...props,
    ...chartDefaultConfig,
  };

  return <Pie {...config} />;
};
export default SolidPie;

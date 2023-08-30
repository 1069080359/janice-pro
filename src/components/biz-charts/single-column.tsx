import React from 'react';
import { Column } from '@ant-design/plots';
import type { FsFC } from '@mapzone/types';
import type { ColumnConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';

/** 单条 柱状图 */
const SingleColumn: FsFC<ColumnConfig> = (props) => {
  const config: ColumnConfig = {
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        rotate: 0.2,
      },
    },
    meta: {
      [props.xField]: {
        alias: '类别',
      },
      [props.yField]: {
        alias: '数量',
      },
    },
    ...props,
    color: chartDefaultConfig.color[0],
  };
  return <Column {...config} />;
};

export default SingleColumn;

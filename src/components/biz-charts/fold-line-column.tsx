import { DualAxes, G2 } from '@ant-design/plots';
import type { DualAxesConfig } from '@ant-design/plots';
import type { FC } from 'react';
import { chartDefaultConfig } from './const';

/** 折线 + 柱状图 */
const FoldLineColumn: FC<DualAxesConfig> = (props) => {
  const { registerTheme } = G2;
  registerTheme('dual-axes-theme', {
    colors10: chartDefaultConfig.color,
    /** 20色板 */
    colors20: chartDefaultConfig.color,
  });
  const config: DualAxesConfig = {
    geometryOptions: [
      {
        geometry: 'column',
      },
      {
        geometry: 'line',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],

    meta: {
      [props.xField]: {
        alias: '类别',
      },
      [props.yField[0]]: {
        alias: '面积',
      },
      [props.yField[1]]: {
        alias: '蓄积',
      },
    },
    ...props,
    theme: 'dual-axes-theme',
  };
  return <DualAxes {...config} />;
};

export default FoldLineColumn;

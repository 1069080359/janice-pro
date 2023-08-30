import { Bar } from '@ant-design/plots';
import type { FsFC } from '@mapzone/types';
import type { BarConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';

/** 横向 分组 柱状图 */
const GroupBar: FsFC<BarConfig> = (props) => {
  const config: BarConfig = {
    marginRatio: 0,
    dodgePadding: 4,
    intervalPadding: 20,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'left', 'middle', 'right'
      offset: 4,
      layout: [
        // 柱形图数据标签位置自动调整
        {
          type: 'interval-adjust-position',
        }, // 数据标签防遮挡
        {
          type: 'interval-hide-overlap',
        }, // 数据标签文颜色自动调整
        {
          type: 'adjust-color',
        },
      ],
    },
    barStyle: {
      radius: [2, 2, 0, 0],
    },
    ...props,
    isGroup: true,
    ...chartDefaultConfig,
  };
  return <Bar {...config} />;
};

export default GroupBar;

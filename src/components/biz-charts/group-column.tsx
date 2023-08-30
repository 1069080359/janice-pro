import { Column } from '@ant-design/plots';
import type { FsFC } from '@mapzone/types';
import type { ColumnConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';

/** 分组 柱状图 */
const GroupColumn: FsFC<ColumnConfig> = (props) => {
  const config: ColumnConfig = {
    isGroup: true,
    ...chartDefaultConfig,
    ...props,
    /** 设置间距 */
    // marginRatio: 0.1,
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'middle', 'bottom'
      // 可配置附加的布局方法
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
  };
  return <Column {...config} />;
};

export default GroupColumn;

import { Column } from '@ant-design/plots';
import type { FC } from 'react';
import type { ColumnConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';

/** 分组 柱状图 */
const GroupColumn: FC<ColumnConfig> = (props) => {
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
    limitInPlot: false,
    slider: {
      start: 0,
      end: 0.005,
    },
    // scrollbar: {
    //   type: 'horizontal',
    //   height: 20,
    //   style: {
    //     /**
    //      * @title 滑道颜色
    //      */
    //     trackColor: '#b7eb8f',
    //     /**
    //      * @title 滑块颜色
    //      */
    //     thumbColor: '#cf1322',
    //     /**
    //      * @title 滑块高亮样式，对应主题的 hover.style.thumbColor
    //      */
    //     thumbHighlightColor: '#5cdbd3',
    //   },
    // },
    padding: [30, 60, 60, 60],
    xAxis: {
      tickCount: 3,
    },
  };
  return <Column {...config} />;
};

export default GroupColumn;

import { Line } from '@ant-design/plots';
import type { FsFC } from '@mapzone/types';
import type { LineConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';

/** 折线图 */
const FoldLine: FsFC<LineConfig> = (props) => {
  const config: LineConfig = {
    color: props?.seriesField ? chartDefaultConfig.color : chartDefaultConfig.color[0],
    padding: 'auto',
    xAxis: {
      tickCount: 5,
    },
    ...props,
  };
  return <Line {...config} />;
};

export default FoldLine;

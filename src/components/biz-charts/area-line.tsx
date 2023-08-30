import { Area } from '@ant-design/plots';
import type { AreaConfig } from '@ant-design/plots';
import type { FsFC } from '@mapzone/types';
import { chartDefaultConfig } from './const';
/** 面积图 */
const AreaLine: FsFC<AreaConfig> = (props) => {
  return <Area {...chartDefaultConfig} {...props} />;
};

export default AreaLine;

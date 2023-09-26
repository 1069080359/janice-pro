import { Area } from '@ant-design/plots';
import type { AreaConfig } from '@ant-design/plots';
import { chartDefaultConfig } from './const';
import type { FC } from 'react';
/** 面积图 */
const AreaLine: FC<AreaConfig> = (props) => {
  return <Area {...chartDefaultConfig} {...props} />;
};

export default AreaLine;

import React from 'react';
import { Typography } from 'antd';
import type { EllipsisConfig } from 'antd/lib/typography/Base';

type OverflowTextProps = {
  tooltip: EllipsisConfig['tooltip'];
};

/** 影藏溢出 文本组件 */
const OverflowText = (props: OverflowTextProps) => {
  const { tooltip, children } = props;
  return (
    <Typography.Text
      ellipsis={{
        tooltip: tooltip,
      }}
    >
      {children}
    </Typography.Text>
  );
};

export default OverflowText;

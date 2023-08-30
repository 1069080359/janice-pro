import React from 'react';
import { Typography } from 'antd';
import type { FsFC } from '@mapzone/types';

export type FieldLabelProps = {
  label: string;
  className?: string;
};

const { Text } = Typography;

const FieldLabel: FsFC<FieldLabelProps> = (props) => {
  const { label, className } = props;

  return (
    <div className={className}>
      <Text ellipsis={{ tooltip: label }}>{label}</Text>
    </div>
  );
};

export default FieldLabel;

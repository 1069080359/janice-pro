import React from 'react';
import RenderSelect from './render-select';
import RenderDate from './render-date';
import RenderGroup from './render-group';
import type { FsFC } from '@mapzone/types';
import type { RendererProps } from '../types';

const Renderer: FsFC<RendererProps> = (props) => {
  const { data } = props;
  const {
    metadataItem: { type },
  } = data;

  switch (type) {
    case 'select':
    case 'treeSelect':
      return <RenderSelect {...props} />;
    case 'datePicker':
    case 'dateTimePicker':
    case 'yearPicker':
    case 'monthPicker':
    case 'rangePicker':
      return <RenderDate {...props} />;
    default:
      return <RenderGroup {...props} />;
  }
};

export default Renderer;

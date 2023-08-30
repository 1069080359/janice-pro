import React from 'react';
import RenderDate from './render-date';
import RenderSelect from './render-select';
import RenderInput from './render-input';
import type { FsFC } from '@mapzone/types';
import type { RendererProps } from '../types';

const Renderer: FsFC<RendererProps> = (props) => {
  const { type } = props;

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
      return <RenderInput {...props} />;
  }
};

export default Renderer;

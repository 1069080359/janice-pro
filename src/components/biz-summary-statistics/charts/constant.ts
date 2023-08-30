import type { PieConfig, ColumnConfig } from '@ant-design/plots';

export const pieConfig: Omit<PieConfig, 'data' | 'angleField'> = {
  appendPadding: 10,
  radius: 0.9,
  colorField: 'TITLE',
  label: {
    type: 'spider',
    labelHeight: 28,
    content: '{name}\n{percentage}',
  },
  interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
  tooltip: {
    customContent: (title, data) => {
      return `<div  style="padding:16px">${title}: ${Array.isArray(data) ? data.map((v) => v.value).join() : data}<div>`;
    },
  },
  autoFit: true,
};

export const columnConfig: Omit<ColumnConfig, 'data' | 'yField'> = {
  xField: 'TITLE',
  label: {
    content: undefined,
  },
  xAxis: {
    label: {
      autoHide: true,
      autoRotate: false,
    },
  },
  autoFit: true,
  seriesField: '',
  tooltip: {
    customContent: (title, data) => {
      return `<div  style="padding:16px">${title}: ${Array.isArray(data) ? data.map((v) => v.value).join() : data}<div>`;
    },
  },
};

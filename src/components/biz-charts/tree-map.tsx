import { Treemap } from '@ant-design/plots';
import insertCss from 'insert-css';
import React from 'react';

const TreeMapChart = ({ childrenData }: any) => {
  insertCss(`
  .container{
    padding: 16px 0px;
    width: 160px;
    display: flex;
    flex-direction: column;
  }
  .title{
    font-weight: bold;
  }
  .tooltip-item{
    margin-top: 12px;
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

`);
  const data = {
    name: 'root',
    children: childrenData,
  };
  const config = {
    data,
    colorField: 'brand',
    // 为矩形树图增加缩放,拖拽交互
    interactions: [
      {
        type: 'view-zoom',
      },
      {
        type: 'drag-move',
      },
    ],
    tooltip: {
      follow: true,
      enterable: true,
      offset: 5,
      customContent: (value, items) => {
        if (!items || items.length <= 0) return;
        const { data: itemData } = items[0];
        const parent = itemData.path[1];
        return (
          `<div class='container'>` +
          `<div class='title'>${itemData.name}</div>` +
          `<div class='tooltip-item'><span>数量</span><span>${itemData.value}</span></div>` +
          `<div class='tooltip-item'><span>品牌</span><span>${itemData.brand}</span></div>` +
          `<div class='tooltip-item'><span>单价</span><span>${itemData.price}</span></div>`
        );
      },
    },
  };

  return <Treemap {...config} />;
};

export default TreeMapChart;

export const xuhao = {
  title: '序号',
  dataIndex: 'xh',
  key: 'xh',
  align: 'center',
  ellipsis: true,
  render: (text, record, index) => {
    return index + 1;
  },
};

export const sheetFilterHeader = [
  {
    title: '型号',
    key: 'model',
  },
  {
    title: '数量',
    key: 'number',
  },
  {
    title: '品牌',
    key: 'brand',
  },
  {
    title: '单价',
    key: 'price',
  },
  {
    title: '重复次数',
    key: 'frequency',
  },
];

export const sheetColumnWidths = ['10', '5', '10', '5', '5'];

export const statisticalCols = [
  {
    title: '型号',
    dataIndex: 'model',
    key: 'model',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '数量',
    dataIndex: 'number',
    key: 'number',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '单价',
    dataIndex: 'price',
    key: 'price',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '重复次数',
    dataIndex: 'frequency',
    key: 'frequency',
    align: 'center',
    ellipsis: true,
  },
];

export const shuomingInfo = [
  '1、上传表格数据是导入的表格数据，仅限查看导入的数据内容.',
  '2、汇总统计表格数据是通过【型号】去重后，将【数量】相加后的数据内容，可导出.',
  '3、表格内排序、搜索功能仅限查看，不支持导出',
  '4、表格内支持点击复制操作.',
  '5、汇总统计表格数据导出导出的数据是没有排序的统计数据.',
  '6、导出按钮支持数量、重复次数排序导出.',
];

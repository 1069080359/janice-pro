/**
 * 1、改变 表头
 * 2、可搜索 型号- 未开发
 */
export const transformColumns = (cols: Record<string, any>[], datas: Record<string, any>[]) => {
  const [tableHeader, ...tableDatas] = datas;
  const newCols = cols.map((item) => {
    const i = {
      ...item,
      ellipsis: true,
      title: tableHeader[item.key],
      sorter: (a, b) => a[item.key] - b[item.key],
      render: (num, row, index) => {
        return <span>{num} </span>;
      },
    };
    return {
      ...i,
    };
  });
  return { newCols, tableDatas };
};

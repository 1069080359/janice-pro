import { sheetFilterHeader } from './const';

/**
 * 1、改变 表头
 */
export const transformColumns = (cols: Record<string, any>[], datas: Record<string, any>[]) => {
  const [tableHeader, ...tableDatas] = datas;
  const newCols = cols.map((item) => {
    return {
      ...item,
      ellipsis: true,
      title: tableHeader[item.key],
      sorter: (a, b) => a[item.key] - b[item.key],
    };
  });

  return { newCols, tableDatas };
};

export const uploadHeaderRestrictions = (cols: any[]) => {
  let success = true;
  const fi = cols.map((v) => v.title);
  for (let i = 0; i < sheetFilterHeader.length - 1; i++) {
    if (fi.includes(sheetFilterHeader[i].title)) {
      success = true;
    } else {
      success = false;
      break;
    }
  }
  return success;
};

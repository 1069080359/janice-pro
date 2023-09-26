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

export const tableDataForChartData1 = (data: Record<string, any>[]) => {
  const result = [];
  data.forEach((item) => {
    const { brand, model, number, price, frequency } = item;
    const nameX = `品牌：${brand}，型号：${model}`;
    result.push(
      { nameX, type: '数量', value: number },
      { nameX, type: '单价', value: price },
      { nameX, type: '重复次数', value: frequency },
    );
  });
  return result;
};

export const tableDataForChartData2 = (data: Record<string, any>[]) => {
  const result = [];

  const brands = {};

  data.forEach((obj) => {
    if (!brands[obj.brand]) {
      brands[obj.brand] = [];
    }
    brands[obj.brand].push(obj);
  });

  for (const brand in brands) {
    const brandData = brands[brand];
    const brandObject = {
      name: brand,
      brand: brand,
      value: brandData.reduce((total, obj) => total + obj.number, 0),
      children: brandData.map((obj) => ({
        name: obj.model,
        value: obj.number,
        price: obj.price,
      })),
    };
    result.push(brandObject);
  }

  return result;
};

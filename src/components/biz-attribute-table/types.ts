/** 属性表数据 */
export type AttributeTableDataItem = Record<string, any>;

export type QueryAttributeListParams = {
  tableId: string;
  filter: string;
  pageIndex: number;
  pageSize: number;
  queryFields?: string;
  geometry?: string;
  /** 1：查询shape返回wkt格式数据 |2：查询shape数据返回geojson格式数据 |1、2以外或空：不查询shape数据 */
  selectType?: string;
  sortFields?: string;
};

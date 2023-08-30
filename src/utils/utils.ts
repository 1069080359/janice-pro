import { message } from 'antd';
// https://pengchen96.github.io/table-xlsx/docs/tutorial-api/export-file-api
import { exportFile } from 'table-xlsx';
import moment from 'moment';
import saveAs from 'file-saver';
import XLSX from 'xlsx';
import { getTableActions } from '@/constants';
import type { Moment } from 'moment';
import type { WebAppConfig } from '@/config/webapp-config/types';

let innerWebAppConfig: WebAppConfig;
/** 获取应用的配置，运行于浏览器中 */
export const getWebAppConfig = (): WebAppConfig => {
  return innerWebAppConfig;
};

export const setWebAppConfig = (config: WebAppConfig) => {
  innerWebAppConfig = config;
};

/** form 表单 获取 select 下拉 value 数据 */
export const objectToString = (v: { key?: string; label: string; value: string }) => {
  return typeof v === 'object' ? v.value : v;
};

/** form 表单 时间转换 value 数据 */
export const timeFormat = (value: Moment, format: string) => {
  return value ? (typeof value === 'object' ? moment(value).format(format) : value) : undefined;
};

// json格式转换为 formdata格式
export const formdataify = (params: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key]);
  });
  return formData;
};

/** 导出合并的table header数据 */
const exportMergeExcel = (headerData: Record<string, any>[], dataSource: Record<string, any>[], xlsxName: string) => {
  const newColumns = headerData.map((item) => {
    return {
      ...item,
      render: (text: string, record: Record<string, any>) => record[`${item.dataIndex}_DESC`] || text,
    };
  });
  exportFile({
    useRender: true,
    fileName: `${xlsxName}.xlsx`,
    columns: newColumns as any,
    dataSource: dataSource as any,
    // headerCellStyle: { fillFgColorRgb: 'ffffff' },
  });
};

/** 导出 Excel 表格 table 数据 */
export const exportExcel = (
  headerData: Record<string, any>[], // table header
  dataSource: Record<string, any>[], // table data
  xlsxName: string, // 导出 xlsx 名称
  filterHeader: string[] = [], // 过滤不显示 table header 字段 dataIndex
  mergeTableHeader: boolean = true,
) => {
  const optionKey = getTableActions().dataIndex;
  const filterFields = [optionKey, ...filterHeader];
  // 过滤表头不需要的字段
  const filteredHeaderData = headerData.filter((item) => {
    // 如果需要保留该字段，返回 true；否则返回 false
    return !filterFields.includes(item.dataIndex);
  });
  if (mergeTableHeader) {
    // table-xlsx 可导出 表头分组以及单行表头
    exportMergeExcel(filteredHeaderData, dataSource, xlsxName);
    return;
  }
  // xlsx 插件 只能导出 表头为单行表头
  // 将 filteredHeaderData 中的 dataIndex 提取为表头数组
  const headers = filteredHeaderData.map((item) => item.title);
  // 将 datas 中的数据转换为二维数组
  const dataRows = dataSource.map((data) =>
    filteredHeaderData.map((item) => {
      return data[`${item.dataIndex}_DESC`] || data[`${item.dataIndex}`];
    }),
  );
  // 创建一个新的工作簿
  const workbook = XLSX.utils.book_new();
  // 创建一个工作表
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet);
  // 导出Excel文件
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const excelData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(excelData, xlsxName);
};

/**
 * 下载模板路径
 */
export const templateDownloadPath = () => {
  return;
};

/**
 * 下载模板
 * @param urlPath  下载模板名称 例如：生产计划.xlsx
 */
export const templateDownload = (urlPath: string) => {
  if (!urlPath) {
    message.info('下载模板路径不能为空');
    return;
  }
  const { serviceSettings } = getWebAppConfig();
  const downloadPath = `${serviceSettings.excelUrl}/${urlPath}`;
  const aDom = document.createElement('a');
  aDom.href = downloadPath;
  document.body.appendChild(aDom);
  aDom.click();
  document.body.removeChild(aDom);
};

import { getFieldWidth, getWebAppConfig } from '@/utils';
import type {
  MzProTableProps,
  MzProTableColumnsType,
  MetadataTableColumnConfig,
  TMetadata,
  MzProTableColumnGroupType,
  MzProTableColumnType,
} from '@mapzone/types';

export const prefixCls = 'mz-metadata-table';

export const defaultTableProps: Partial<Omit<MzProTableProps<any>, 'columns'>> = {
  bordered: true,
  autoEllipsis: true,
  dragColumn: false,
  resizableColumn: false,
  size: 'small',
  pagination: {
    className: 'mz-pagination',
    showSizeChanger: true,
    showQuickJumper: true,
    position: ['bottomLeft'],
  },
};

export const defailtOptionsConfig: Required<MzProTableProps<any>>['options'] = { density: false, setting: { listsHeight: 440 } };

/** 转换元数据的列，最后一列宽度自适应 */
export const transformColumns = <T extends Record<string, any> = Record<string, any>>(
  metadataList: TMetadata[],
  columnConfigs: Record<string, MetadataTableColumnConfig<T>> = {},
  hideInTableFieldNames: string[] = [],
) => {
  const { appSettings } = getWebAppConfig();
  const { sortrFields = [] } = appSettings;
  const columns: MzProTableColumnsType<T> = [];
  metadataList.forEach((item) => {
    if (item.display !== 'none' && !hideInTableFieldNames.includes(item.fieldname)) {
      const width = getFieldWidth(item.fieldname);
      const config = columnConfigs[item.fieldname] || {};
      const col: MzProTableColumnType<T> & { itemMetaInfo: TMetadata } = {
        title: item.fieldAliasName || item.fieldname,
        dataIndex: item.fieldname,
        key: item.fieldname,
        width,
        showSorterTooltip: false,
        align: 'center',
        sorter: sortrFields.includes(item.fieldname),
        render: (text, record, _index, dom) => (config.valueType ? dom : record[`${item.fieldname}_DESC`] || text),
        itemMetaInfo: {
          ...item,
        },
        ...config,
      };

      let colTitle = item.fieldAliasName;
      // 表头分组，约定按照冒号进行分割；
      if (colTitle.indexOf(':') > -1) {
        const colGroups = colTitle.split(':').filter(Boolean);
        const groupLength = colGroups.length;
        if (groupLength === 0) {
          columns.push(col);
        } else {
          let parentCol: MzProTableColumnGroupType<T>;
          let children = columns;
          for (let i = 0; i < groupLength - 1; i++) {
            const groupTitle = colGroups[i];
            const index = children.findIndex((c) => c.title === groupTitle && !c.dataIndex);
            if (index === -1) {
              parentCol = { title: groupTitle, children: [] };
              children.push(parentCol);
            } else {
              parentCol = children[index] as MzProTableColumnGroupType<T>;
            }
            children = parentCol.children;
          }
          colTitle = colGroups[colGroups.length - 1];
          if (item.unit) {
            colTitle = `${colTitle}（${item.unit}）`;
          }
          col.title = colTitle;
          children.push(col);
        }
      } else {
        colTitle = col.title as string;
        if (item.unit) {
          colTitle = `${colTitle}（${item.unit}）`;
        }
        col.title = colTitle;
        columns.push(col);
      }
    }
  }, []);

  // 最后一列字段宽度自适应
  if (columns.length > 0) {
    columns[columns.length - 1].width = undefined;
  }
  return columns;
};

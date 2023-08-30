import type { ReactNode } from 'react';
import type { CommonAddParams, CommonDataKey, CommonDeleteByIdsParams, CommonFindByPagingParams } from '@mapzone/map-services';
import type { ActionType, ApiRes, MzMetadataTableProps, MzProTableColumnType, TMetadata } from '@mapzone/types';
import type { BizMetadataQueryFormProps } from '../form';

/** 选项列渲染 */
export type OptionColumnConfig<T> = Pick<
  MzProTableColumnType<T>,
  'align' | 'className' | 'tooltip' | 'title' | 'fixed' | 'hideInSetting' | 'width' | 'valueType' | 'show'
> & {
  render: (record: T, index: number) => ReactNode;
};

export type BizMzMetadataTableProps<T extends Record<string, any>> = Omit<
  MzMetadataTableProps<T>,
  'hideFilter' | 'optionColumnConfig' | 'toolBarRender'
> & {
  /** 是否隐藏详情 */
  hideDetails?: boolean;
  /** 是否隐藏多选删除 */
  hideMultipleDelete?: boolean;
  /** 是否隐藏 query form */
  hideQueryForm?: boolean;
  /** 是否隐藏 列操作栏 */
  hideRecordOptions?: boolean;
  /** 操作列设置 */
  optionColumnConfig?: OptionColumnConfig<T>;
  /** 自定义 添加、编辑 请求方式 */
  customInsertOrUpdateRecord?: (params: CommonAddParams, isAdd: boolean) => Promise<ApiRes<CommonDataKey>>;
  /** 自定义 删除 请求方式 */
  customDeleteByIds?: (params: CommonDeleteByIdsParams) => Promise<boolean>;
  /** 查询表单属性 */
  queryFormProps?: Partial<BizMetadataQueryFormProps>;
  toolBarRender?: ToolBarRender<T>;
  /** 资源汇总统计的额外展示列表，需要返回 filter 过滤条件进行查询 */
  renderExtraContent?: (filter?: string) => ReactNode;
} & Partial<Pick<CommonFindByPagingParams, 'filter'>>;

export type ToolBarRender<T> = (
  action: ActionType | undefined,
  rows: {
    selectedRowKeys?: (string | number)[] | undefined;
    selectedRows?: T[] | undefined;
  },
  metadataList: TMetadata[],
) => ReactNode[];

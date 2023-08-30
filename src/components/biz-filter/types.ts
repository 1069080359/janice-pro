import type { ReactNode } from 'react';
import type { AttrFilterConditionSymbol, TMetadata, AttrFilter, AttrFilterConditionItem } from '@mapzone/types';
import type { IFsMap } from '@mapzone/map-kit';

/** 字段渲染规则 */
export type FieldSymbolOption = { label: string; value: AttrFilterConditionSymbol };

/** 过滤结果参数 */
export type FilterResult = { filter?: string; geometry?: string; selectedItemList: SelectedFieldItem[] };

export type BizFilterProps = {
  fsMap: IFsMap;
  /** 元数据信息 */
  metadataList: TMetadata[];
  /** 表名，获取筛选字段配置 */
  tableName: string;
  onChange: (data: FilterResult) => void;
  children?: ((params: { hasFilter: boolean }) => ReactNode) | false;
  /** 查询条件初始值 */
  initialValues?: AttrFilter;
  /** 获取字段规则 */
  getFieldSymbol?: (field: TMetadata) => FieldSymbolOption[];
  /**
   * 政区分组名称
   * @default ZQ
   */
  ZQGroupName?: string;
};

export type DrawType = 'Point' | 'LineString' | 'Polygon' | 'Circle';

export type SelectedFieldItem = {
  value: string;
  key: string;
  metadataItem: TMetadata;
  label: string;
  relationGroup?: string;
  otherData?: AttrFilterConditionItem;
  checkedMetadataValue?: CheckedMetadataValue[];

  /** 父级字典id， 逗号分割 */
  parentId?: string;
  parentLabel?: string;
  initialZqCodes?: string[];
};

export interface IState {
  /** 添加因子，下拉筛选数据 */
  optionsList: SelectedFieldItem[];
  /** 已选择的字段列表 */
  selectedItemList: SelectedFieldItem[];
  /** 分组数据 */
  groupData: Record<string, TMetadata[]>;
  /** 选择的待添加字段 */
  selectedFieldName?: string;
  /** 默认筛选字段 */
  defaultFilterFields: string[];

  /** 筛选条件 */
  filter?: string;
  /** 图形信息，wkt格式 */
  geometry?: string;
}

export interface IAction extends Partial<IState> {
  type: 'update';
}

export type CheckedMetadataValue = {
  value: string;
  label: string;
  code?: string;
  id?: number;
  halfChecked?: boolean;

  key?: string;
};

export type RendererProps = {
  data: SelectedFieldItem;
  zqParentInfo?: ZqParentInfo;
  /** 政区分组名称   */
  ZQGroupName: string;
  onChange: (item: SelectedFieldItem) => void;
  getFieldSymbol: Required<BizFilterProps>['getFieldSymbol'];
};

export type ZqParentInfo = {
  parentId: string;
  parentCode: string;
  checkedMetadataValue: CheckedMetadataValue[];
  parentMetadata: TMetadata;
};

export type RenderSelectProps = RendererProps;
export type RenderDateProps = RendererProps;
export type RenderGroupProps = RendererProps;

export type TOption = CheckedMetadataValue & Record<string, any>;

export type SelectTreeItem = {
  c_zqname: string;
  i_isedit: number;
  l_jb: number;
  c_zqcode: string;
  l_bh: number;
  l_id: number;
  l_parid: number;
  i_isused: number;
  original: TreeItemOriginal;
  key: string;
  value: string;
  title: string;

  metadata?: TMetadata;
  children?: SelectTreeItem[];
};

export interface TreeItemOriginal {
  c_zqname: string;
  i_isedit: number;
  l_jb: number;
  c_zqcode: string;
  l_bh: number;
  l_id: number;
  l_parid: number;
  i_isused: number;
}

export interface RegisterDictItem {
  c_zqname: string;
  i_isedit: number;
  l_jb: number;
  c_zqcode: string;
  l_bh: number;
  l_id: number;
  l_parid: number;
  i_isused: number;
  children?: RegisterDictItem[];
}

export type ThyzAddParams = {
  C_NAME: string;
  C_USERID: number;
  C_CODE: string;
  C_TYPE: string;
  C_TABLENAME: string;
  C_EXTENT: string;
};

export type ThyzSearchParams = {
  userId: number;
  c_code: string;
  c_tableName: string;
};

export type ThyzSearchRes = {
  PK_UID: number;
  C_NAME: string;
  C_USERID: string;
  C_CODE: string;
  C_EXTENT: string;
  C_TYPE: string;
  C_TABLENAME: string;
};

export type ThyzEditParams = {
  PK_UID: number;
  C_EXTENT: string;
};

import type { ApiRes, DistrictRecord, ErrorInfoItem, QualityCheckProps, QualityCheckRuleRecord } from '@mapzone/types';

export type DataDermissionsRecord = {
  I_ID: number;
  C_TABLENAME: string;
  C_TAGCONTENT: Partial<{ SHENG: string; SHI: string; XIAN: string; XIANG: string; CUN: string }>;
  C_TAGTYPE: 'zqModel';
};
export type State<T extends QualityCheckRuleRecord = QualityCheckRuleRecord> = {
  dataSource: T[];
  btnLoading?: boolean;
  tableLoading?: boolean;
  errorItemList: ErrorInfoItem[];
  errorResultModalOpen: boolean;
  editableLayerList: LayerItem[];
  districtLoading: boolean;
  districtTreeData: DistrictRecord[];
  statusList: StatusRecord[];
  dataDermissions?: DataDermissionsRecord;
  selectDistrictvalue: DistrictRecord[];
  selectedRowKeys: string[];
  execBtnDisabled?: boolean;
  selectLyaer?: LayerItem;
};

export type Action<T extends QualityCheckRuleRecord = QualityCheckRuleRecord> = Partial<State<T>> & {
  type: 'update';
};

export type StatusRecord = {
  label: string;
  errorState: -1 | 0 | 1;
};

export type EditableLayerRecord = {
  label: string;
  value: string;
};

export type QualityCheckFormInitialValues = Partial<{
  layerId: string;
  district: string;
  status: StatusRecord['errorState'];
}>;
export type QualityCheckRule = {
  OBJECTID: number; // 主键
  C_DATACHECTITEMNAME: string;
  I_DATACHECTITEMID: string;
  I_VERSION: number;
  I_POBJECTID: unknown;
  I_SCHEMEID: number;
  I_CHECKITEMGROUPTYPE: number;
  I_CHECKSTATE: unknown;
  I_ISAPPLY: number;
  TABLEID: string;
  DOMAINTABLEID: unknown;
  S_CODETABLEFIELD: unknown;
  TJSQL: string;
  JGSQL: string;
  C_ATTRIBUTEFILTER: unknown;
  I_CHECKTYPE: number;
  I_BH: number;
  I_TYPE: number;
  C_REMARKS: string;
  C_RESULTDISPLAY_SETTING: string;
  priorityDisplayFields: string[];
  highLightFields: string[];
};
export type QueryQualityCheckRuleResultParams = {
  schemeId?: number; // 质检方案ID（每个图层对应一套质检方案）
  itemIds?: number[];
  itemWhereString?: string; // 质检项过滤条件
  srcTable: string;
  srcCriteria?: Record<string, unknown>; // 数据源过滤项（JSON结构）
  srcWhereString?: string; // 元数据过滤条件（字符串结构）
  replaceObjects?: Record<string, unknown>; // 表名替换对象
};
export type QueryQualityCheckRuleResult = QualityCheckRule & {
  I_ERRORCOUNT: number;
  I_ERRORSTATE: number;
  I_ERRORSTATE_DESC: string;
};

export type QueryQualityCheckRuleResultRes = ApiRes<QueryQualityCheckRuleResult[]>;

export type ExecuteQualityCheckRuleParams = QueryQualityCheckRuleResultParams;

type ErrorItemRecord = {
  name: string;
  message: string;
  detail: string;
};

export type ExecuteQualityCheckRuleRes = ApiRes<{
  count: number;
  passCount: number;
  failCount: number;
  errorItemList: ErrorItemRecord[];
}>;
export type DataDermissionsRes = ApiRes<
  (Omit<DataDermissionsRecord, 'C_TAGCONTENT'> & {
    C_TAGCONTENT: string;
  })[]
>;

export type FieldInfoRecord = {
  fieldName: string;
  code: string;
  name: string;
};
export type QueryQualityCheckRulesParams = {
  pageIndex: number;
  pageSize: number;
  name?: string;
  srcTable: string;
  schemeId: number;
  order?: {
    c_datachectitemname: number;
  };
};

export type QueryQualityCheckRulesPagination = {
  pageIndex: number;
  pageSize: number;
  total: number;
};

export type QueryQualityCheckRulesRes = ApiRes<{
  pagination: QueryQualityCheckRulesPagination;
  data: QualityCheckRule[];
}>;

export type LayerItem = {
  tableName: string;
  layerName: string;
  layerId: string;
};

export type BizQualityCheckProps = Omit<QualityCheckProps, 'fsMap'> & {
  layerList: LayerItem[];
};

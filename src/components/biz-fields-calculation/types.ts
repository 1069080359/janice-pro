import type { IFsMap } from '@mapzone/map-kit';
import type { TMetadata } from '@mapzone/types';

export type PersistenceStateType = {
  /**
   * 持久化的类型，支持 localStorage 和 sessionStorage
   *
   * @param localStorage 设置在关闭浏览器后也是存在的
   * @param sessionStorage 关闭浏览器后会丢失
   */
  persistenceType?: 'localStorage' | 'sessionStorage';
  /** 持久化的key，用于存储到 storage 中 */
  persistenceKey?: string;
};

export type BizFieldsCalculationPorps = {
  fsMap: IFsMap;
  layerId?: string;
  filter?: string;
  selectedRowKeys: (string | number)[];
  /** 数据表名 */
  tableName: string;
  /** 过滤条件 */
  recordCount: number;
  /** 缓存设置 */
  persistence?: PersistenceStateType;
  onOk?: () => void;
};

export type FunTypeRadioItem = {
  title: string;
  value: string;
};

export type State = {
  open: boolean;
  filedsTableData: TMetadata[];
  filedsSelectData: TMetadata[];
  /**
   * 函数类型
   */
  funType: string;
  /**
   * sql值
   */
  sqlValue?: string;
  /**
   * 目标字段
   */
  targetField?: string;

  loading: boolean;
  /**
   * 字段更新类型
   */
  updateType: 'selected' | 'all';
};

export type Action = Partial<State> & {
  type: 'update';
};

export type FieldCheckExpressionParams = {
  tableName: string;
  expression: string;
  updateField: string;
  filterCondition?: string;
  ids?: (string | number)[];
};

export type AttributeUpdateFieldParams = FieldCheckExpressionParams;

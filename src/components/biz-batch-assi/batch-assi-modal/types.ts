import type { Key } from 'react';
import type { BizMetadataItem } from '@/types';
import type { BizModalProps } from '@/components';

export type DataItem = Record<string, any>;

export type BizFilterMetadataParams = {
  metadataList: BizMetadataItem[];
  tableName: string;
};

export type UpdateType = 'selected' | 'all';

export type BizBatchAssiFinishParmas = {
  selectedKeys: Key[];
  /** key(字段名) -> value(值)和_DESC -> 描述信息 对象 */
  updateDatas: Record<string, string>;
  /** 批量赋值类型 */
  updateType: UpdateType;
};

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

export type BizBatchAssiModalProps = Omit<BizModalProps, 'onOk'> & {
  /** 数据表名 */
  tableName: string;
  /** 选择的Keys */
  selectedKeys: Key[];
  /** 是否显示所有选项 */
  showUpdateAll?: boolean;
  /** 总数 */
  recordCount: number;
  /** 过滤条件 */
  filter?: string;
  /** 默认更新类型 */
  defaultUpdateType?: UpdateType;
  /** 缓存设置 */
  persistence?: PersistenceStateType;
  /** 过滤元数据字段 */
  filterMetadata?: (params: BizFilterMetadataParams) => Promise<BizMetadataItem[]>;
  /** 批量赋值成功后 */
  onOk?: (params: BizBatchAssiFinishParmas) => void;
};

export type TCheckedMetadataValue = {
  value: string | number;
  label?: string;
  code?: string;
  id?: number;
  halfChecked?: boolean;
};

export type SelectItem = {
  key: string;
  value: string;
  label: string;
  relationGroup?: string;
  otherData?: TCheckedMetadataValue;
  tableName: string;
  tablePk: string;
  dataType: string;
  type: BizMetadataItem['type'];

  /** 父级字典id， 逗号分割 */
  parentId?: string;
  parentLabel?: string;
  disabled: boolean;
};

export type RendererExtra = {
  label?: string;
  original?: {
    code: string;
    id: number;
  };
};

export type RendererProps = {
  data: SelectItem;
  onChange: (code: string | number, extra?: RendererExtra) => void;
  tablePk: string;
  dataType: string;
  tableName: string;
  fieldname: string;
  type: BizMetadataItem['type'];
  disabled: boolean;
};

export type RenderSelectProps = RendererProps;
export type RenderDateProps = RendererProps;
export type RenderGroupProps = RendererProps;

export interface IState {
  groupData?: Record<string, BizMetadataItem[]>;
  /** 字段搜索关键字 */
  fieldSearch?: string;
  selectFieldKeys: Key[];
  fieldMetadataList: BizMetadataItem[];
  metadataList: BizMetadataItem[];
  selectItemList: SelectItem[];
  // 批量赋值类型
  updateType: UpdateType;
  confirmLoading: boolean;
}

export interface IAction extends Partial<IState> {
  type: 'update';
}

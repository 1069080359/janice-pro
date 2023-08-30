import { RndModalProps, TMetadata } from '@mapzone/types';
import { ReactNode } from 'react';

export type FieldItem = {
  /** 字段名 */
  fieldName: string;
  /** 字段值 */
  value: string;
  /** 列宽数量 */
  span: number;
  /**标签 */
  label: string;
  /** 元数据 */
  metadata: TMetadata;
};

export type BizDetailModalProps = Omit<RndModalProps, 'onCancel' & 'onOK'> & {
  onCancel?: () => void;
  onOK?: () => void;
  /** 详情对象 */
  detail?: Record<string, any>;
  /** 元数据列表 */
  metadataList: TMetadata[];
  /**
   * 每行几列
   * @default 2
   */
  column?: number;

  itemRender?: (FieldItem: FieldItem) => ReactNode;

  /**自定义渲染字段 */
  customComponentFields?: string[];
};

import type { MzFormItemPorps } from '@mapzone/form';
import type { TMetadata } from '@mapzone/types';
import type { BizQueryFormProps } from '../query-form';
import type { BizRequestOptionsType } from './cmp-map';
import type { FC } from 'react';
import type { FormInstance } from 'antd';
import type { NamePath } from 'antd/es/form/interface';

export type BizQueryFormItemProps = Omit<MzFormItemPorps, 'span' | 'type'> & {
  config: MetadataFieldConfig;
};

export type BizMetadataQueryFormRef = {
  form: FormInstance;
  /**
   * 触发表单验证，并转换处理form表单的值
   * @param nameList
   * @returns
   */
  validateFields: (nameList?: NamePath[]) => Promise<undefined | { filter?: string; values: Record<string, any> }>;
};

/** 获取自定义字段渲染的方法参数 */
export type GetQueryFieldComponentParams = {
  metadata: TMetadata;
  config: MetadataFieldConfig;
};

export type BizMetadataQueryFormProps = Omit<BizQueryFormProps, 'onFinish'> & {
  /**
   * 元数据表名
   */
  tableName: string;
  /**
   * 元数据
   */
  metadataList?: TMetadata[];
  /**
   * 获取元数据
   * @param dataName 元数据表名
   * @returns 元数据列表
   */
  queryMetadataList?: (dataName: string) => Promise<TMetadata[]>;

  onFinish: (filter: string, values: Record<string, any>) => void;

  /**
   * 是否隐藏导出按钮
   */
  hihhenExport?: boolean;

  /**
   * 获取自定义字段渲染的方法
   * 如果返回undefined|null等，非真，则使用默认渲染字段
   */
  getFieldComponent?: (params: GetQueryFieldComponentParams) => FC | undefined;
};

export type IAction = Partial<IState> & {
  type: 'update';
};

export type IState = {
  /** 元数据信息 */
  metadataList: TMetadata[];
  /** 查询配置 */
  fieldConfigList: MetadataFieldConfig[];
  /**
   * 元数据信息
   */
  metadataFieldList: BizQueryFormItemProps[];
  /** 扩展按钮 */
  extratActions?: BizQueryFormProps['extratActions'];
};

/** 筛选表单元数据配置 */
export type MetadataFieldConfig = {
  /** 元数据字段key, fieldname, 如：SHENG  */
  KEY: string;
  TYPE: 'Input' | 'InputNumber' | 'Select' | 'TreeSelect' | 'Cascader' | 'Checkbox' | 'Radio' | 'Date' | 'DateTime';
  /**
   * 条件符号
   * 字符串只支持 = 和 include（包含，对应 like）
   * @default =
   */
  SYMBOL?: '=' | 'range' | '>' | '>=' | '<' | '<=' | 'include';
  /**
   * 是否多选，字典项字段，
   * @default false
   */
  MULTIPLE?: boolean | string;
};

export type DictOption = BizRequestOptionsType & {
  searchValue?: string;
};

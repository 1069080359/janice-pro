import type { BaseOptionType } from 'antd/es/select';
import type { TMetadata } from '@mapzone/types';

/** 项目元数据结构 */
export type BizMetadataItem = TMetadata & {
  /** 分组 */
  group?: string;
  /** 单位 */
  unit?: string;
};

/** 字典选项 */
export type DictOptionItem = BaseOptionType & {
  /** 名称 */
  C_NAME: string;
  /** 字典项值 */
  C_CODE: string;
};

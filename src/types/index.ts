import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { WebAppConfig } from '@/config/webapp-config';
import type { UserInfo } from '@mapzone/utils';

export * from './common';
export * from './dict';

/** 初始全局数据 */
export type InitialState = {
  webAppConfig?: WebAppConfig;
  loading?: boolean;
  settings?: Partial<LayoutSettings>;
  /** 展开状态 */
  collapsed?: boolean;
  /** header 筛选：年度 */
  year?: string;
  /** header 筛选：单位 */
  company?: string;
  /** 用户信息 */
  userInfo?: UserInfo;
};

export type PaginationInfo = {
  pageIndex: number;
  pageSize: number;
};

export type PageApiParams<T> = PaginationInfo & T;

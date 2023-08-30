import type { defineConfig } from '@umijs/max';

/**
 * 路由配置
 * @doc https://umijs.org/docs/guides/routes
 */
type RouteItem = {
  /**
   * 路由路径
   * path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
   */
  path: string;
  /** 路由的标题 */
  title?: string;
  /** 是否严格匹配 */
  exact?: boolean;
  /** 配置 location 和 path 匹配后用于渲染的 React 组件路径。
   * 可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
   */
  component?: string;
  /** 路由跳转 */
  redirect?: string;
  /** 路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能 */
  wrappers?: string[];
  /** 配置子路由，通常在需要为多个路径增加 layout 组件时使用 */
  routes?: RouteItem[];
};

export type UmiConfig = ReturnType<typeof defineConfig> & {
  routes: RouteItem[];
};

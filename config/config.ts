// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import isCI from 'is-ci';
import proxy from './proxy';
import theme from './theme';
import { routes } from './routes';
import pkg from '../package.json';
import webAppConfig from './webapp-config';
import type { UmiConfig } from './types';

// 获取当前编译、构建相关的环境变量
const { webAppDeployPath } = webAppConfig.appSettings;
const { WEBAPP_ENV = 'prod' } = process.env;
const WEBAPP_VERSION: string = pkg.version;
const isLocal = WEBAPP_ENV === 'local';

// 路由地址类型
const historyType: 'browser' | 'hash' = 'hash';
// @ts-ignore
const isBrowserRouter = historyType === 'browser';

let outputPath = `dist-${WEBAPP_ENV}`;
if (webAppDeployPath.length > 1) {
  const pathNames = webAppDeployPath.split('/').filter(Boolean);
  pathNames.push(WEBAPP_ENV);
  outputPath = pathNames.join('-');
}
// 持续构建环境下，输出目录使用 dist
if (isCI) {
  outputPath = 'dist';
}

let base = '/';
let publicPath = '/';
if (isBrowserRouter) {
  // 如使用 正常路由地址模式，则路由前缀和静态资源目录需要设置为应用实际部署的路径；
  // 如需调整部署路径，则需要重新打包；
  base = webAppDeployPath;
  publicPath = webAppDeployPath;
} else {
  // 如使用 hash地址模式，则路由前缀使用 / 和静态资源目录使用 ./ 即可；
  // 如需调整部署路径，则无需重新打包，修改 webapp-config.js 中的配置即可；
  base = '/';
  publicPath = '';
}

// 本地开发时, 默认使用 /
if (isLocal && process.env.NODE_ENV !== 'production') {
  base = '/';
  publicPath = '/';
}

// 本地开发时
let devtool: UmiConfig['devtool'] = false;
if (['dev', 'local'].includes(WEBAPP_ENV)) {
  devtool = 'cheap-module-source-map';
} else if (WEBAPP_ENV === 'test') {
  devtool = 'eval';
}

export default defineConfig({
  /**
   * @name 设置路由 history 类型。
   * @description 区别 hash方式url中会包含#，history 不包含 #
   * @doc https://umijs.org/docs/api/config#history
   */
  history: { type: historyType },
  base,
  /**
   * @name 静态文件目录
   * @doc https://umijs.org/docs/api/config#publicPath。
   */
  publicPath,
  outputPath,
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  ignoreMomentLocale: true,
  /**
   * @name 兼容性设置
   * @description 设置 ie11 不一定完美兼容，需要检查自己使用的所有依赖
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name 路由的配置，不在路由中引入的文件不会编译
   * @description 只支持 path，component，routes，redirect，wrappers，title 的配置
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name 主题的配置
   * @description 虽然叫主题，但是其实只是 less 的变量设置
   * @doc antd的主题设置 https://ant.design/docs/react/customize-theme-cn
   * @doc umi 的theme 配置 https://umijs.org/docs/api/config#theme
   */
  theme: {
    // 如果不想要 ConfigProvider  动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 ConfigProvider  动态设置主色调
    'root-entry-name': 'variable',
    ...theme,
  },
  /**
   * 构建期间的常量定义
   */
  define: {
    WEBAPP_VERSION,
    WEBAPP_ENV,
    PUBLIC_PATH: publicPath,
  },
  /**
   * @name 设置 sourcemap 生成方式
   * @doc https://umijs.org/docs/api/config#devtool
   */
  devtool,
  /**
   * @name moment 的国际化配置
   * @description 如果对国际化没有要求，打开之后能减少js的包大小
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  title: webAppConfig.appSettings.webAppTitle,
  metas: webAppConfig.appSettings.webAppMetas,
  /**
   * @name 代理配置
   * @description 可以让你的本地服务器代理到你的服务器上，这样你就可以访问服务器的数据了
   * @see 要注意以下 代理只能在本地开发时使用，build 之后就无法使用了。
   * @doc 代理介绍 https://umijs.org/docs/guides/proxy
   * @doc 代理配置 https://umijs.org/docs/api/config#proxy
   */
  proxy,
  /**
   * @name 快速热更新配置
   * @description 一个不错的热更新组件，更新时可以保留 state
   */
  fastRefresh: true,
  //============== 以下都是max的插件配置 ===============
  /**
   * @name 数据流插件
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * 一个全局的初始数据流，可以用它在插件之间共享数据
   * @description 可以用来存放一些全局的数据，比如用户信息，或者一些全局的状态，全局初始状态在整个 Umi 项目的最开始创建。
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name layout 插件
   * @doc https://umijs.org/docs/max/layout-menu
   */
  layout: {
    locale: 'zh-CN',
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs 插件
   * @description 将项目中的 moment 替换为 dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name antd 插件
   * @description 内置了 babel import 插件
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {},
  /**
   * @name 权限插件
   * @description 基于 initialState 的权限插件，必须先打开 initialState
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name <head> 中额外的 script
   * @description 配置 <head> 中额外的 script
   */
  headScripts: [
    // 解决首次加载时白屏的问题
    { src: `${publicPath}scripts/loading.js`, async: true },
    `\n/* version:${WEBAPP_VERSION} */\n`,
  ],
  presets: ['umi-presets-pro'],
  chainWebpack(config) {
    // 更新日志 md 文件解析
    config.module.rule('asset').exclude.add(/\.md$/);
    config.module.rule('md').test(/\.md$/).use('raw').loader('raw-loader');
  },
  mfsu: false,
});

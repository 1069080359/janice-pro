import type { UmiConfig } from './types';

// const projectPathName = process.env.PROJECT_PATH_NAME || '/scxcb/';

/**
 * @name 代理配置
 * @description 可以让你的本地服务器代理到你的服务器上，这样你就可以访问服务器的数据了
 * @see 要注意以下 代理只能在本地开发时使用，build 之后就无法使用了。
 * @doc 代理介绍 https://umijs.org/docs/guides/proxy
 * @doc 代理配置 https://umijs.org/docs/api/config#proxy
 * @doc https://github.com/chimurai/http-proxy-middleware
 */
const proxy: UmiConfig['proxy'] = {
  // [projectPathName]: {
  //   target: 'http://10.10.10.242:7292',
  //   changeOrigin: true,
  // },
};

export default proxy;

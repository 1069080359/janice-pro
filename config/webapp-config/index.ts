import prodConfig from './config.prod';
import testConfig from './config.test';
import devConfig from './config.dev';
import type { WebAppConfig } from './types';

export type { WebAppConfig };

const { WEBAPP_ENV = 'prod' } = process.env;

console.log(`\n###### Config WEBAPP_ENV: ${WEBAPP_ENV} ######\n`);

/**
 * 读取生成项目配置，运行于编译构建阶段，非浏览器里；
 * 如果有指定环境配置，则使用指定环境的配置，如果没有则使用开发环境配置。
 */
let config: WebAppConfig;

switch (WEBAPP_ENV) {
  case 'prod':
    config = prodConfig;
    break;
  case 'test':
    config = testConfig;
    break;
  default:
    config = devConfig;
    break;
}

if (WEBAPP_ENV === 'local') {
  config.serviceSettings.sso.url = 'http://192.168.1.232:91/wdp/sso-web';
}

export default config;

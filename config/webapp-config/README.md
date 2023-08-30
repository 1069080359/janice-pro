# 前端配置

`webapp-config.ts` 是应用配置的默认实现，针对项目的具体需要，可增删配置项；
`types.ts` 中的 `WebAppConfig` 类型，是应用配置的类型声明，可在开发期间，提供良好的编码体验，同时也是一种约束，避免配置项配置错误（如类型，是否必填），增删配置项时应先修改 应用配置的类型声明；



## 简介

在前端应用中经常有一些值是变化的，如接口服务地址，关联应用的跳转地址等，我们给他抽离成变量使用；有一些场景下，我们可能需要在项目构建之后，实际部署情况修改配置项（不想重新打包），进而，我们把配置项进一步归纳整理，形成我们的前端配置规范；

> 把应用配置收敛到一处配置，一处获取。

前端应用配置是应用相关的接口服务配置、应用参数配置，主要运行，使用在浏览器端；
方便在部分场景下（打包构建、部署后），需要修改配置，即可生效（无需重新打包的情况）。



## 应用配置相关目录结构

应用配置的文件目录规范

```
config
├── webapp-config           // 应用配置
|   ├── index.tsx           // 应用配置出口
|   ├── types.ts            // 应用配置类型声明
|   ├── config.dev.ts       // 默认应用配置文件
|   ├── config.test.ts      // 默认应用配置文件
|   ├── config.prod.ts      // 默认应用配置文件
├── *
src
├── utils                   // 应用公共方法
|   ├── utils.ts            // getWebAppConfig 获取应用的配置方法，运行于浏览器中
├── *

```



## 如何使用

在页面组件中导入获取配置的方法，即可获取到全部配置项；

```tsx
// 导入
import { getWebAppConfig } from '@/utils';

// ...

// 获取配置项
const webAppConfig = getWebAppConfig();

```



## 新增配置项

### 修改应用配置类型声明

修改 `config/webapp-config/types.ts`

```ts
/** 应用配置类型声明  */
export type WebAppConfig = {
  // ...
  /** 应用参数配置 */
  appSettings: {
    // ...
    
    /** 默认表格等每页展示数量 */
    defaultPageSize: number;
  };
};
```

修改 `config/webapp-configconfig.xxx.ts`

```ts
/**
 * 应用配置文件
 * 如果增删，建议先修改类型声明文件，这样开发期间，使用时有更好的编码体验
 */
const webConfig: WebAppConfig = {
  // ...
  appSettings: {
    // ...
    defaultPageSize: 20;  
  },
};

export default webConfig;
```

开发页面时即可使用此配置项了；



## 不同环境如何配置

如测试、测试和生产环境，配置有所不同，我们需要分别在不同环境的配置中配置好；这样不同环境配置就能区分开来，我们针对不同环境打包构建时，生成的配置项就是我们配置的；

### 新增环境应用配置

在 `config/webapp-config` 下创建新的 环境配置文件，格式：`webapp-config.环境.ts`，如： `webapp-config.preProd.ts`

```
config
  webapp-config
    config.prod.ts
+   config.preProd.ts
```

`config.preProd.ts`

```ts
import type { EnvWebAppConfig } from './types';

const preProdWebConfig: WebAppConfig = {
  serviceSettings: {
    // ...
  },
  appSettings: {
    // ...
    webAppTitle: 'MapZone应用开发模板-预生产',
  },
};

export default preProdWebConfig;
```

这样我们就有个预生产环境的配置，打包构建时可以指定使用此配置。




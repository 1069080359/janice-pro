/** 应用配置类型声明  */
export type WebAppConfig = {
  /** 接口服务地址配置 */
  serviceSettings: {
    /** 基础后端服务 */
    apiBaseUrl: string;
    /** 模板下载服务 */
    excelUrl: string;
    /** 单点登录 */
    sso: {
      /** 服务地址 */
      url: string;
      /** 单点登录类型 */
      type: 'sso' | 'cas';
    };
    /** 运维 */
    ops: {
      /** 服务地址 */
      url: string;
    };
    /** 文件服务 */
    fileServer: {
      /** 服务地址 */
      url: string;
      /** 文件预览地址 */
      fileUrl: string;
    };
    /** 政区服务 */
    geoLocation: {
      /** 地址 */
      url: string;
      /** 政区服务id */
      serviceId: string;
      /** 政区级别 */
      zqLevel: number;
    };
  };
  /** 应用参数配置 */
  appSettings: {
    /** 应用部署访问路径 */
    webAppDeployPath: string;
    /** 应用id */
    webAppId: string;
    /** 应用名称 */
    webAppTitle: string;

    /** 应用的 meta 标签 */
    webAppMetas?: { name: string; content: string }[];
    /**
     * 首页地址，如无权限或404页面，首页的跳转地址；
     * 如未配置，则不显示返回首页按钮 */
    homeUrl?: string;
    /** 默认筛选字段 */
    filterFields: string[];
    /** 默认字段宽度（表格） */
    defaultFieldWidth: number;
    /** 字段宽度设置，如: { SHENG:100 } */
    fieldWidthConfig?: Record<string, number>;
    /** 排序字段设置 */
    sortrFields?: string[];
    /* shape 上传最大体积，单位MB */
    shapeAllowMaxSize: number;
    /** 字段值值计算配置 */
    fieldCalcConfig: Record<string, string[]>;
    /** 信息填报，一级 默认填报单位 */
    firstLevelUnit: string;
  };
};
